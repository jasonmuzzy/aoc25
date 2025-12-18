import { run } from 'aoc-copilot';
import * as yalps from 'yalps';

async function solve(
    inputs: string[], // Contents of the example or actual inputs
    part: number,     // Indicates whether the solver is being called for part 1 or 2 of the puzzle
    test: boolean,    // Indicates whether the solver is being run for an example or actual input
    additionalInfo?: { [key: string]: string } // Additional info for some puzzles with multiple examples
): Promise<number | bigint | string> {

    interface Machine {
        lights: number[],
        buttons: number[][],
        joltage: number[]
    }

    const regex = /(\[)(?<lights>.*)(]) (?<buttons>\(.*\)) ({)(?<joltage>.*)(})/;
    const machines: Machine[] = inputs.map(input => {
        const match = regex.exec(input);
        return {
            lights: match?.groups?.lights?.split('').map(l => l === '#' ? 1 : 0) ?? [],
            buttons: match?.groups?.buttons?.split(' ').map(group => group.match(/\d+/g)?.map(Number) ?? []) ?? [],
            joltage: [...match?.groups?.joltage?.match(/\d+/g)?.map(Number) ?? []],
        };
    });

    let totalPresses = 0;
    for (const machine of machines) {
        /*
        A: rows = lights or joltages, cols = buttons)
        0 = button not connected, 1 = button connected
        [0, 0, 0, 0, 1, 1],
        [0, 1, 0, 0, 0, 1],
        [0, 0, 1, 1, 1, 0],
        [1, 1, 0, 1, 0, 0],
        */

        let minTotal = 0;
        if (part === 1) {
            const A = machine.lights.map((_, light) =>
                machine.buttons.map(button => button.includes(light) ? 1 : 0)
            );
            ({ minTotal } = solveMinTogglesYalps(A, machine.lights));
        } else {
            const A = machine.joltage.map((_, joltage) =>
                machine.buttons.map(button => button.includes(joltage) ? 1 : 0)
            );
            ({ minTotal } = solveMinPressesYalps(A, machine.joltage));
        }
        totalPresses += minTotal;

    }

    return totalPresses;

}

/**
 * Minimize total button presses subject to A x = b, x >= 0, x integer.
 *
 * @param A Incidence matrix: rows = joltages, cols = buttons (A[i][j] ∈ {0,1})
 * @param b Target joltages
 */
function solveMinPressesYalps(
    A: number[][],
    b: number[]
): { minTotal: number; presses: Record<string, number> } {
    const m = A.length;             // # joltages
    const n = A[0]?.length ?? 0;    // # buttons
    if (m === 0 || n === 0) throw new Error("A must be non-empty");
    if (b.length !== m) throw new Error("b must have one entry per circuit");

    const vars: Record<string, Record<string, number>> = {};
    const ints: string[] = [];
    const constraints: Record<string, ReturnType<typeof yalps.equalTo> | { min?: number; max?: number }> = {};

    // Names
    const rows = Array.from({ length: m }, (_, i) => `c${i}`);
    const cols = Array.from({ length: n }, (_, j) => `x${j}`);

    // Ax = b constraints (one equality per circuit)
    for (let i = 0; i < m; i++) {
        constraints[rows[i]] = yalps.equalTo(b[i]);
    }

    // Variables and objective coefficient = 1 (on the synthetic "total" row)
    for (let j = 0; j < n; j++) {
        const vname = cols[j];
        vars[vname] = {};
        ints.push(vname); // integer variable

        for (let i = 0; i < m; i++) {
            const rname = rows[i];
            const a_ij = A[i][j];
            if (a_ij !== 0) vars[vname][rname] = a_ij;
        }
        vars[vname]["total"] = 1; // contributes 1 to objective
    }

    const model: yalps.Model<string, string> = {
        direction: "minimize",
        objective: "total",
        constraints,
        variables: vars,
        integers: ints,
    };

    const sol = yalps.solve(model);

    if (sol.status !== "optimal") {
        throw new Error(`No optimal solution found (status=${sol.status})`);
    }

    const presses: Record<string, number> = {};
    for (const [name, value] of sol.variables) {
        presses[name] = Math.round(value);
    }
    return { minTotal: Math.round(sol.result), presses };

}

/**
 * Minimize button presses for toggle (XOR) lights using YALPS MILP:
 *   minimize sum_j x_j
 *   subject to sum_j A[i][j]*x_j - 2*k_i = b[i]  (for each light i)
 *   x_j ∈ {0,1}; 0 ≤ k_i ≤ floor(d_i/2)
 *
 * @param A m x n matrix with 0/1 entries (rows = lights, cols = buttons)
 * @param b length-m 0/1 desired pattern (off=0, on=1).
 *          If you have an initial pattern s0, pass b = s0 XOR target.
 * @returns { minTotal, presses } where presses is length-n with 0/1 entries.
 */
export function solveMinTogglesYalps(
    A: number[][],
    b: number[]
): { minTotal: number; presses: number[] } {
    const m = A.length;
    const n = A[0]?.length ?? 0;
    if (m === 0 || n === 0) throw new Error("A must be non-empty");
    if (b.length !== m) throw new Error("b must match number of lights");

    // Validate 0/1 entries and rectangular matrix
    for (let i = 0; i < m; i++) {
        if (A[i].length !== n) throw new Error("A must be rectangular (same #cols in every row)");
        const bi = b[i];
        if (bi !== 0 && bi !== 1) throw new Error("b must contain only 0/1");
        for (let j = 0; j < n; j++) {
            const aij = A[i][j];
            if (aij !== 0 && aij !== 1) throw new Error("A must contain only 0/1");
        }
    }

    // Internal row/var identifiers (not exposed)
    const rowNames = Array.from({ length: m }, (_, i) => `r${i}`);
    const varNames = Array.from({ length: n }, (_, j) => `x${j}`);

    const variables: Record<string, Record<string, number>> = {};
    const constraints: Record<string, yalps.Constraint> = {};
    const integers: string[] = [];

    // 1) Button variables x_j ∈ {0,1}; add bound via an inRange row per variable.
    for (let j = 0; j < n; j++) {
        const v = varNames[j];
        variables[v] = {};
        integers.push(v); // integer variable

        // Bound 0 ≤ x_j ≤ 1
        const boundRow = `bound_${v}`;
        constraints[boundRow] = yalps.inRange(0, 1);
        variables[v][boundRow] = 1;

        // Parity contribution to each light row
        for (let i = 0; i < m; i++) {
            if (A[i][j] !== 0) {
                const r = rowNames[i];
                variables[v][r] = (variables[v][r] ?? 0) + A[i][j];
            }
        }

        // Objective coefficient (sum of presses)
        variables[v]["total"] = 1;
    }

    // 2) Parity auxiliaries k_i with bounds 0 ≤ k_i ≤ floor(d_i/2); coefficient -2 on row i
    for (let i = 0; i < m; i++) {
        const di = A[i].reduce((s, a) => s + (a ? 1 : 0), 0);
        const kname = `k${i}`;
        variables[kname] = {};
        integers.push(kname);

        // Bound for k_i
        const kBoundRow = `bound_${kname}`;
        constraints[kBoundRow] = yalps.inRange(0, Math.floor(di / 2));
        variables[kname][kBoundRow] = 1;

        // Coefficient -2 on the parity row
        variables[kname][rowNames[i]] = -2;
    }

    // 3) Equality constraints per light: sum_j A[i][j] x_j - 2 k_i = b[i]
    for (let i = 0; i < m; i++) {
        constraints[rowNames[i]] = yalps.equalTo(b[i]);
    }

    const model: yalps.Model = {
        direction: "minimize",
        objective: "total",
        constraints,
        variables,
        integers,
    };

    const sol = yalps.solve(model);
    if (sol.status !== "optimal") {
        throw new Error(`No optimal solution found (status=${sol.status})`);
    }

    // Build presses array aligned to columns of A
    const solutionMap = new Map(sol.variables);
    const presses: number[] = new Array(n).fill(0);
    for (let j = 0; j < n; j++) {
        const v = varNames[j];
        const val = solutionMap.get(v) ?? 0;
        presses[j] = Math.round(val);
    }

    return { minTotal: Math.round(sol.result), presses };

}

run(__filename, solve);