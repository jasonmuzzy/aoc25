import { run } from 'aoc-copilot';

async function solve(
    inputs: string[], // Contents of the example or actual inputs
    part: number,     // Indicates whether the solver is being called for part 1 or 2 of the puzzle
    test: boolean,    // Indicates whether the solver is being run for an example or actual input
    additionalInfo?: { [key: string]: string } // Additional info for some puzzles with multiple examples
): Promise<number | bigint | string> {

    interface Point { x: number, y: number };
    const points = inputs.map(line => {
        const [x, y] = line.split(',').map(Number);
        return { x, y } as Point;
    });

    // Each point is followed by another point on the same row or column, forming walls
    interface Wall { end1: Point, end2: Point, type: 'h' | 'v', prev?: Wall, next?: Wall };
    const walls = points
        .map(({ x: x1, y: y1 }, i, a) => {
            const { x: x2, y: y2 } = a[(i + 1) % a.length]; // Last point wraps around to first
            if (y1 === 1742 && y2 === y1) {
                if (1 == 1) { }
            }
            return {
                end1: { x: Math.min(x1, x2), y: Math.min(y1, y2) }, // Sort based on the non-matching
                end2: { x: Math.max(x1, x2), y: Math.max(y1, y2) }, // coordinate: x or y
                type: x1 === x2 ? 'v' : 'h'
            } as Wall;
        });

    // Allocate each wall to the Y-indices it appears on
    let minX = Infinity, maxX = -Infinity;
    const ys: Wall[][] = [];
    walls.forEach((wall, i, a) => {
        minX = Math.min(minX, wall.end1.x, wall.end2.x);
        maxX = Math.max(minX, wall.end1.x, wall.end2.x);
        if (wall.type === 'h') {
            (ys[wall.end1.y] ??= []).push(wall);
        } else {
            for (let y = wall.end1.y + 1; y < wall.end2.y; y++) {
                (ys[y] ??= []).push(wall);
            }
        }
        wall.prev = a.at(i - 1);
        wall.next = a[(i + 1) % a.length];
    });

    const outsides: [number, number][][] = [];
    ys.forEach((walls, y) => {
        walls.sort((a, b) => a.end1.x - b.end1.x); // Sort left to right
        let x = minX;
        let outside = true;
        for (let wall of walls) {
            const plateau = wall.type === 'h' && (
                (wall.prev?.end1.y === wall.end1.y && wall.next?.end1.y === wall.end1.y) || // Negative plateau
                (wall.prev?.end2.y === wall.end1.y && wall.next?.end2.y === wall.end1.y)    // Positive plateau
            );
            if (outside) {
                (outsides[y] ??= []).push([x, wall.end1.x - 1]);
            }
            x = wall.end2.x + 1;
            outside = plateau ? outside : !outside; // Plateaus don't change the inside/outside status
        }
        if (outside) {
            (outsides[y] ??= []).push([x, maxX]);
        }
    });

    let maxArea = 0;
    for (let [i, { x: x1, y: y1 }] of points.entries()) {
        for (let j = i + 1; j < points.length; j++) {
            const { x: x2, y: y2 } = points[j];
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            const minY = Math.min(y1, y2);
            const maxY = Math.max(y1, y2);
            if (part === 2 && (
                outsides[y1].some(([l, r]) => l <= maxX && r >= minX) ||
                outsides[y2].some(([l, r]) => l <= maxX && r >= minX) ||
                outsides.some((ranges, y) => y > minY && y < maxY &&
                    ranges.some(([l, r]) => (l <= minX && r >= minX) || (l <= maxX && r >= maxX))
                )
            )) {
                continue;
            }
            const area = (maxX - minX + 1) * (maxY - minY + 1);
            maxArea = Math.max(maxArea, area);
        }
    }

    return maxArea;

}

run(__filename, solve);