import { run } from 'aoc-copilot';

async function solve(
    inputs: string[], // Contents of the example or actual inputs
    part: number,     // Indicates whether the solver is being called for part 1 or 2 of the puzzle
    test: boolean,    // Indicates whether the solver is being run for an example or actual input
    additionalInfo?: { [key: string]: string } // Additional info for some puzzles with multiple examples
): Promise<number | bigint | string> {
    let answer: number | bigint | string = 0;

    // Parse the input, splitting on the blank line into two sections: 1) ranges, and 2) ingredients
    const [ranges, ingredients] = inputs.join('\n').split('\n\n').map(row => row.split('\n').map(range => range.includes('-') ? range.split('-').map(Number) : parseInt(range))) as [[number, number][], number[]];

    // Part 1: Count the ingredients that occur in one of the fresh ingredient ranges
    if (part === 1) {
        answer = ingredients.reduce((totalFresh, ingredient) => totalFresh += (ranges.some(([low, high]) => low <= ingredient && high >= ingredient) ? 1 : 0), 0);

    // Part 2: Count the total possible ingredients from all ranges
    // Note: Attempting to add all ingredient numbers to a set to get a distinct count causes OOM
    } else {
        answer = ranges
            .toSorted(([a], [b]) => a - b) // Sort first so we can easily merge ranges
            .map(r => [...r, r[1] - r[0] + 1]) // Add a 3rd element which is the ingredient counter
            .reduce((agg, [newLow, newHigh]) => {
                let [prevLow, prevHigh, count] = agg;
                if (newLow <= prevHigh) { // The new range extends the previous one
                    agg = [prevLow, Math.max(prevHigh, newHigh), count + Math.max(0, newHigh - prevHigh)];
                } else { // The new range is discrete from the previous one
                    agg = [newLow, newHigh, count + newHigh - newLow + 1];
                }
                return agg;
            }
            )[2];
    }

    return answer;
}

run(__filename, solve);