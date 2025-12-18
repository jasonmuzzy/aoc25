import { run } from 'aoc-copilot';

async function solve(inputs: string[], part: number) {

    // Get the door password by following L/R turn instructions for a safe dial and counting the number
    // of times we land on (or pass in part 2) zero
    const mod = (n: number, d: number) => ((n % d) + d) % d; // Modulo for turning left past 0
    let zeroCount = 0;
    let dial = 50;
    for (const rotation of inputs) {
        const direction = rotation.substring(0, 1);
        const clicks = parseInt(rotation.substring(1));
        if (part === 1) { // Count times we land on zero
            dial = mod(dial + (direction === 'R' ? clicks : -clicks), 100);
            zeroCount += dial === 0 ? 1 : 0;
        } else { // Count times we land on or pass zero
            const oldDial = dial;
            const fullRotations = Math.floor(clicks / 100); // Full rotations pass zero
            const newDial = mod(dial + (direction === 'R' ? clicks : -clicks), 100);
            const partialRot =
                newDial === 0 || (
                    (direction === 'R' && newDial < dial) ||
                    (direction === 'L' && newDial > dial && oldDial !== 0) // Turning left from zero doesn't pass zero again
                ) ? 1 : 0;
            dial = newDial;
            zeroCount += fullRotations + partialRot;
        }
    }

    return zeroCount;
}

run(__filename, solve);