import { run } from 'aoc-copilot';

async function solve(
    inputs: string[], // Contents of the example or actual inputs
    part: number,     // Indicates whether the solver is being called for part 1 or 2 of the puzzle
    test: boolean,    // Indicates whether the solver is being run for an example or actual input
    additionalInfo?: { [key: string]: string } // Additional info for some puzzles with multiple examples
): Promise<number | bigint | string> {

    // Principle: manually inspect the input
    //
    // For part 1 the differences between the example and actual inputs didn't matter, but for part 2
    // it was critical because optimal solutions are completely different between the two.
    //
    // The example input is small, and shaped like a duck head or something:
    //  ..............
    //  .......#XXX#..
    //  .......X...X..
    //  ..#XXXX#...X..
    //  ..X........X..
    //  ..#XXXXXX#.X..
    //  .........X.X..
    //  .........#X#..
    //  ..............
    //
    // By contrast, the actual input makes a huge, circular shape with an area over 9.8 billion!  Of
    // course that makes it impossible to store all those coordinates in memory, and also presents
    // challenges for rendering it which discourages the type of inspection that is necessary to
    // discover the short-cut for solving it.  It's also a jagged circle with points dodging in and
    // out of where a smooth circle would run.  But, most importantly, it has a narrow chunk cut out
    // of the middle like a Pac-Man with a rectangular mouth!
    //
    //         . -- ~~~ -- .
    //     .-~               ~-.
    //    /                     \
    //   /                       \
    //  |______________________   |
    //                        |   |
    //  |‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾   |
    //   \                       /
    //    \                     /
    //     `-.               .-'
    //         ~- . ___ . -~
    //
    // Needless to say, the approach for solving the example is completely infeasible for the actual
    // input, and so that was just a waste of time.

    const points = inputs.map(row => row.split(',').map(Number));

    const vWalls: Map<number, number[]> = new Map();
    const hWalls: Map<number, number[]> = new Map();
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    if (part === 2) {
        for (const [x, y] of points) {

            minX = Math.min(x, minX);
            maxX = Math.max(x, maxX);
            minY = Math.min(y, minY);
            maxY = Math.max(y, maxY);

            const [y1] = vWalls.get(x) ?? [];
            if (y1) {
                vWalls.set(x, [Math.min(y, y1), Math.max(y, y1)]);
            } else {
                vWalls.set(x, [y]);
            }

            const [x1] = hWalls.get(y) ?? [];
            if (x1) {
                hWalls.set(y, [Math.min(x, x1), Math.max(x, x1)]);
            } else {
                hWalls.set(y, [x]);
            }

        }
    }

    function outside(x: number, y: number) {

        // Points that are part of a wall are not outside.
        // There will be a maximum of 1 horizontal wall per row due to neighboring point rules.
        const hWall = hWalls.get(y);
        if (!hWall) {
            const vWall = vWalls.get(x);
            if (!!vWall && vWall[0] <= y && vWall[1] >= y) {
                return false;
            }
        } else if (hWall[0] <= x && hWall[1] >= x) {
            return false;
        }

        // You can tell if a point (that is not part of a wall) is inside of or outside of the shape
        // by counting the number of vertical walls to the left of the point.  If the count is even
        // then it's outside of the shape, but if the count is odd then it's inside.
        let count = 0;

        // First count veritical walls to the left of this point
        count += [...vWalls.entries()].filter(([vx, [vy1, vy2]]) => vx < x && vy1 < y && vy2 > y).length;

        // If there is horizontal wall to the left then check if it acts like a vertical wall
        if (hWall != undefined && hWall[1] < x) {

            // Get the `x` end points of the horizontal wall
            const [x1, x2] = hWall;

            // Get the corresponding `y` values of the neighbors to the end points
            const y1 = vWalls.get(x1)!.filter(vy => vy !== y)[0];
            const y2 = vWalls.get(x2)!.filter(vy => vy !== y)[0];

            // If the wall continues its same vertical direction after exiting the horizontal wall
            // then it counts like a vertical wall, for example the "L---7" horizontal wall below
            // counts as vertical because it connects the vertical wall that comes into the "L" from
            // above and extends from the "7" downwards.
            //
            //  |
            //  L---7
            //      |
            //
            if ((y1 < y && y2 > y) || (y1 > y && y2 < y)) {
                count++;
            }

        }

        return count % 2 === 0;

    }

    let maxArea = 0;
    let corner1: [number, number];
    let corner2: [number, number];
    for (const [i, [x1, y1]] of points.entries()) {
        for (let j = i + 1; j < points.length; j++) {

            const [x2, y2] = points[j];
            const area = (Math.abs(x2 - x1) + 1) * (Math.abs(y2 - y1) + 1);

            let every = false;
            if (part === 2) {

                // Check every (x,y) coordinate between the corners to see if they're inside the shape (red or green tiles)
                every = true;
                for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++) {
                    for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) {
                        if (x === 8 && y === 3) {
                            if (1 == 1) { }
                        }
                        if (outside(x, y)) {
                            every = false;
                            break;
                        }
                    }
                    if (!every) {
                        break;
                    }
                }

            }

            if (area > maxArea && (part === 1 || every)) {
                maxArea = area;
                corner1 = [x1, y1];
                corner2 = [x2, y2];
            }
        }
    }

    return maxArea;

}

run(__filename, solve);