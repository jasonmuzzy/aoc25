import { run } from 'aoc-copilot';

// The one where we're counting fresh ingredients that appear in a range
// And in part 2 we have to give the total count of all possible fresh ingredients

async function solve(
    inputs: string[], // Contents of the example or actual inputs
    part: number,     // Indicates whether the solver is being called for part 1 or 2 of the puzzle
    test: boolean,    // Indicates whether the solver is being run for an example or actual input
    additionalInfo?: { [key: string]: string } // Additional info for some puzzles with multiple examples
): Promise<number | bigint | string> {
    let answer: number | bigint | string = 0;

    // Parse the input:
    // First there's a list of ranges like 1-10
    // Then there's a blank row
    // Followed by a list of single ingredient numbers
    const [ranges, ingredients] = inputs.join('\n').split('\n\n').map(row => row.split('\n').map(range => range.includes('-') ? range.split('-').map(Number) : parseInt(range))) as [[number, number][], number[]];
    if (part === 1) {
        answer = ingredients.reduce((totalFresh, ingredient) => totalFresh += (ranges.some(([low, high]) => low <= ingredient && high >= ingredient) ? 1 : 0), 0);
    } else {
        // We can't just make a set of unique ingredient numbers because that causes an OOM error.
        // Instead we have to merge all of the fresh ingredient ranges and then count the number of ingredients in the resulting ranges.
        const mergedRanges = ranges.reduce((mergedRanges, [newLow, newHigh]) => {
            const overlaps = [...mergedRanges.entries()].filter(([i, [low, high]]) => low <= newHigh && high >= newLow);
            if (overlaps.length === 0) { // New, non-overlapping range
                mergedRanges.push([newLow, newHigh]);
            } else if (overlaps.length === 1) { // Extend an existing range
                const [i, [low, high]] = overlaps[0];
                mergedRanges[i] = [Math.min(low, newLow), Math.max(high, newHigh)];
            } else { // Combine two existing ranges, potentially extending one or both of them
                const [firstLow, firstHigh] = mergedRanges[overlaps[0][0]];
                const [secondLow, secondHigh] = mergedRanges[overlaps[1][0]];
                mergedRanges[overlaps[0][0]] = [Math.min(newLow, firstLow, secondLow), Math.max(newHigh, firstHigh, secondHigh)];
                mergedRanges.splice(overlaps[1][0], 1);
            }
            return mergedRanges;
        }, [] as [number, number][]);
        answer = mergedRanges.reduce((count, [low, high]) => count += high - low + 1, 0); // Count the ingredients in the merged ranges
    }

    return answer;
}

run(__filename, solve);