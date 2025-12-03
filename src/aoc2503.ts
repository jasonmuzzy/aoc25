import { NotImplemented, run } from 'aoc-copilot';

async function solve(
    inputs: string[], // Contents of the example or actual inputs
    part: number,     // Indicates whether the solver is being called for part 1 or 2 of the puzzle
    test: boolean,    // Indicates whether the solver is being run for an example or actual input
    additionalInfo?: { [key: string]: string } // Additional info for some puzzles with multiple examples
): Promise<number | bigint | string> {
    let answer: number | bigint | string = 0;

    for (let bank of inputs) {
        const batteries = bank.split('').map(Number);
        let jolts = '';
        // Find the largest number in a sliding window that guarantees we wind up with a number of the desired length
        for (let start = 0, end = bank.length - (part === 1 ? 1 : 11); jolts.length < (part === 1 ? 2 : 12); ) {
            const max = Math.max(...batteries.slice(start, end));
            const maxIndex = batteries.slice(start, end).indexOf(max);
            jolts += bank.substring(start + maxIndex, start + maxIndex + 1);

            start += maxIndex + 1;
            if (end < bank.length) {
                end++
            }
        }
        answer += parseInt(jolts);
    }

    return answer;
}

run(__filename, solve);