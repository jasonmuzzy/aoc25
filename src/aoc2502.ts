import { NotImplemented, run } from 'aoc-copilot';

async function solve(
    inputs: string[], // Contents of the example or actual inputs
    part: number,     // Indicates whether the solver is being called for part 1 or 2 of the puzzle
    test: boolean,    // Indicates whether the solver is being run for an example or actual input
    additionalInfo?: { [key: string]: string } // Additional info for some puzzles with multiple examples
): Promise<number | bigint | string> {
    let answer: number | bigint | string = 0;

    for (let range of inputs[0].split(',')) {

        const [min, max] = range.split('-').map(n => parseInt(n));
        for (let num = min; num <= max; num++) {

            const numc = num.toString();
            if (
                part === 1 &&
                numc.length % 2 == 0 &&
                numc.substring(0, numc.length / 2) === numc.substring(numc.length / 2)
            ) {
                answer += num;
            } else if (part === 2) {
                for (let len = 1; len <= numc.length / 2; len++) { // Break into increasing length pieces
                    const piece = numc.substring(0, len);
                    if (
                        numc.length % piece.length === 0 && // Num length must be a multiple of piece length
                        piece.repeat(numc.length / piece.length) === numc // Piece pattern repeated x times matches number
                    ) {
                        answer += num;
                        break;
                    }
                }
            }
        }

    }

    return answer;
}

run(__filename, solve);