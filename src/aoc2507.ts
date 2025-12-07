import { run } from 'aoc-copilot';

async function solve(
    inputs: string[], // Contents of the example or actual inputs
    part: number,     // Indicates whether the solver is being called for part 1 or 2 of the puzzle
    test: boolean,    // Indicates whether the solver is being run for an example or actual input
    additionalInfo?: { [key: string]: string } // Additional info for some puzzles with multiple examples
): Promise<number | bigint | string> {
    let answer: number = 0;

    if (part === 1) {
        const manifold = inputs.map(row => row.split(''));
        let prev = manifold[0];
        for (let row of manifold.slice(1)) {
            for (let [x, spot] of row.entries()) {
                if (spot === '.') {
                    if (prev[x] === 'S' || prev[x] === '|') { // Entry point or beam
                        row[x] = '|';
                    }
                } else if (spot === '^') {
                    if (prev[x] === '|') {
                        row[x - 1] = '|';
                        row[x + 1] = '|';
                        answer++;
                    }
                }
            }
            prev = row;
        }
    } else {
        const manifold: (string | number)[][] = inputs.map(row => row.split(''));
        let prev = manifold[0];
        for (let row of manifold.slice(1)) {
            for (let [x, spot] of row.entries()) {
                if (prev[x] === 'S' && spot === '.') { // Empty spot below entry point
                    row[x] = 1; // There's only 1 possible timeline after the entry point
                } else if (typeof prev[x] === 'number' && spot === '.') { // Beam continues through empty space
                    row[x] = prev[x];
                } else if (typeof prev[x] === 'number' && typeof spot === 'number') { // Add the beam from above to the beam split from the left
                    (row[x] as number) += prev[x];
                } else if (spot === '^' && typeof prev[x] === 'number') { // Splitter hit by beam
                    if (row[x - 1] === '.') { // No other beam to the left
                        row[x - 1] = prev[x];
                    } else if (typeof row[x - 1] === 'number') { // Another beam is already to the left -- add to it
                        (row[x - 1] as number) += prev[x];
                    }
                    row[x + 1] = prev[x]; // Beam always splits to the right since we check left-to-right
                }
            }
            prev = row;
        }
        answer = prev.filter(spot => typeof spot === 'number').reduce((timelines, spot) => timelines + spot, 0);
    }
    return answer;
}

run(__filename, solve);