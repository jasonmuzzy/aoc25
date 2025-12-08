import { run } from 'aoc-copilot';

async function solve(
    inputs: string[], // Contents of the example or actual inputs
    part: number,     // Indicates whether the solver is being called for part 1 or 2 of the puzzle
    test: boolean,    // Indicates whether the solver is being run for an example or actual input
    additionalInfo?: { [key: string]: string } // Additional info for some puzzles with multiple examples
): Promise<number | bigint | string> {
    let answer = 0;

    interface Box {
        x: number,
        y: number,
        z: number,
        neighbors: Set<Box>,
        circuit: Set<Box> | undefined
    }

    const boxes = inputs.map(coords => {
        const [x, y, z] = coords.split(',').map(Number);
        return { x, y, z, neighbors: new Set() } as Box;
    });

    function distance(a: Box, b: Box): number {
        return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2 + (b.z - a.z) ** 2);
    }

    const distances: { a: Box, b: Box, d: number }[] = [];
    for (const [i, a] of boxes.entries()) {
        for (let j = i + 1; j < boxes.length; j++) {
            const b = boxes[j];
            distances.push({ a, b, d: distance(a, b) });
        }
    }

    distances.sort((a, b) => a.d - b.d);

    if (part === 1) {
        const keep = test ? 10 : 1000;
        distances.splice(keep);
    }

    for (const { a, b } of distances) {
        a.neighbors.add(b);
        b.neighbors.add(a);

        if (part === 2) {
            const circuit: Set<Box> = new Set();
            const unvisiteds = [b, a];
            while (unvisiteds.length > 0) {
                const box = unvisiteds.pop()!;
                if (!circuit.has(box)) {
                    circuit.add(box);
                    for (const neighbor of box.neighbors) {
                        unvisiteds.push(neighbor);
                    }
                }
            }
            if (circuit.size === boxes.length) {
                answer = a.x * b.x;
                break;
            }
        }
    }

    if (part === 1) {
        function addNeighbors(box: Box) {
            for (const neighbor of box.neighbors) {
                if (!box.circuit?.has(neighbor)) {
                    box.circuit!.add(neighbor);
                    neighbor.circuit = box.circuit;
                    addNeighbors(neighbor);
                }
            }
        }

        const circuits: Set<Box>[] = [];
        for (const { a, b } of distances) {
            if (!a.circuit && !b.circuit) {
                const circuit: Set<Box> = new Set([a, b]);
                circuits.push(circuit);
                a.circuit = circuit;
                b.circuit = circuit;
                addNeighbors(a);
                addNeighbors(b);
            }
        }

        const largestCircuits = [...circuits].toSorted((a, b) => b.size - a.size).slice(0, 3);
        answer = largestCircuits.reduce((product, circuit) => product * circuit.size, 1);
    }

    return answer;
}

run(__filename, solve);