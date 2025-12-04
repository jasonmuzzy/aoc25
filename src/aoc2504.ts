import { run } from 'aoc-copilot';
import { adjacents } from 'aoc-copilot/dist/utils';

async function solve(
    inputs: string[], // Contents of the example or actual inputs
    part: number,     // Indicates whether the solver is being called for part 1 or 2 of the puzzle
    test: boolean,    // Indicates whether the solver is being run for an example or actual input
    additionalInfo?: { [key: string]: string } // Additional info for some puzzles with multiple examples
): Promise<number | bigint | string> {
    let answer: number | bigint | string = 0;

    let grid = inputs.map(row => row.split(''));
    let removed = true;
    while (removed) {
        removed = false;
        const newGrid = grid.map(row => [...row]);
        for (let [y, row] of grid.entries()) {
            for (let [x, space] of row.entries()) {
                if (space === '@') { // It's a roll of wrapping paper
                    let rolls = 0;
                    for (let [x1, y1] of adjacents(x, y, row.length, grid.length, true)) {
                        if (grid[y1][x1] === '@') {
                            rolls++; // Count adjacent rolls
                        }
                    }
                    if (rolls < 4) { // If fewer than 4 than it's accessible
                        answer++;
                        if (part === 2) {
                            removed = true;
                            newGrid[y][x] = '.';
                        }
                    }
                }
            }
        }
        grid = newGrid;
    }

    return answer;
}

run(__filename, solve);