import { run } from 'aoc-copilot';

async function solve(
    inputs: string[], // Contents of the example or actual inputs
    part: number,     // Indicates whether the solver is being called for part 1 or 2 of the puzzle
    test: boolean,    // Indicates whether the solver is being run for an example or actual input
    additionalInfo?: { [key: string]: string } // Additional info for some puzzles with multiple examples
): Promise<number | bigint | string> {
    let answer: number | bigint | string = 0;

    let dial = 50;
    for (const rotation of inputs) {
        const clicks = parseInt(rotation.substring(1));
        for (let click = 1; click <= clicks; click++) {
            if (rotation.startsWith('R')) {
                dial++;
            } else {
                dial--;
            }

            if (dial === 100) {
                dial = 0;
            } else if (dial === -1) {
                dial = 99;
            }
            
            if (part === 2 && dial === 0) {
                answer++;
            }
        }
        if (part === 1 && dial === 0) {
            answer++;
        }
    }

    return answer;
}

run(__filename, solve);