import { run } from 'aoc-copilot';

async function solve(
    inputs: string[], // Contents of the example or actual inputs
    part: number,     // Indicates whether the solver is being called for part 1 or 2 of the puzzle
    test: boolean,    // Indicates whether the solver is being run for an example or actual input
    additionalInfo?: { [key: string]: string } // Additional info for some puzzles with multiple examples
): Promise<number | bigint | string> {

    // Principle: examine the input

    // There's a trick to this one.  By looking at the input (see 09viz.png in the project root) we
    // can see that these points define a circle, but with a chunk cut out of the middle, kind of like
    // a left-facing Pac-Man with a rectangular mouth.  That means one of the points in the back of
    // the mouth has to one of the two opposite corners that define the largest rectangle because
    // picking any other two opposite points will result in a rectangle that either extends outside of
    // the circle or crosses the mouth.

    let minX = Infinity, maxX = -Infinity;
    const hs: { y: number, minX: number, maxX: number, width: number }[] = [];
    const vs: { x: number, minY: number, maxY: number, height: number }[] = [];

    inputs.forEach(input => {

        const [x, y] = input.split(',').map(Number);

        minX = Math.min(minX, x);
        maxX = Math.max(maxX, x);

        const h = hs.find(({ y: hy }) => hy === y);
        if (h === undefined) {
            hs.push({ y, minX: x, maxX: x, width: 1 });
        } else {
            h.minX = Math.min(h.minX, x);
            h.maxX = Math.max(h.maxX, x);
            h.width = h.maxX - h.minX + 1;
        }

        const v = vs.find(({ x: hx }) => hx === x);
        if (v === undefined) {
            vs.push({ x, minY: y, maxY: y, height: 1 });
        } else {
            v.minY = Math.min(v.minY, y);
            v.maxY = Math.max(v.maxY, y);
            v.height = v.maxY - v.minY + 1;
        }

    });

    // Mouth roof and floor are the two walls wider than 1/2 the overall shape width
    const [roof, floor] = hs
        .filter(({ width }) => width > ((maxX - minX) / 2))
        .sort((a, b) => a.y - b.y);

    // Back of mouth
    const [back] = vs
        .filter(({ minY, maxY }) => minY === roof.y);

    // Direction the mouth is facing
    const facing = back.x > ((maxX - minX) / 2) ? 'left' : 'right';

    // Horizontal walls above/below the back of the mouth
    const [above, below] = hs
        .filter(h => h.minX < back.x && h.maxX > back.x)
        .sort((a, b) => a.y - b.y);

    // Vertical walls across from the horizontal walls
    const [acrossAbove, acrossBelow] = vs
        .filter(v => (v.minY < above.y && v.maxY > above.y) || (v.minY < below.y && v.maxY > below.y))
        .sort((a, b) => a.minY - b.minY);

    // Horizontal lines extending from vertical lines
    const [maxAcrossAbove] = hs.filter(h => (facing === 'left' ? h.maxX : h.minX) === acrossAbove.x);
    const [maxAcrossBelow] = hs.filter(h => (facing === 'left' ? h.maxX : h.minX) === acrossBelow.x);

    // Opposite points
    const oppositeRoof = { x: facing === 'left' ? maxAcrossAbove.minX : maxAcrossAbove.maxX, y: acrossAbove.maxY };
    const oppositeFloor = { x: facing === 'left' ? maxAcrossBelow.minX : maxAcrossBelow.maxX, y: acrossBelow.minY };

    // Areas
    const areaRoof = (Math.abs(oppositeRoof.x - back.x) + 1) * (Math.abs(oppositeRoof.y - roof.y) + 1);
    const areaFloor = (Math.abs(oppositeFloor.x - back.x) + 1) * (Math.abs(oppositeFloor.y - floor.y) + 1);

    const maxArea = Math.max(areaRoof, areaFloor);

    console.log(`Roof : (${oppositeRoof.x},${oppositeRoof.y}) (${back.x},${roof.y})`);
    console.log(`Floor: (${oppositeFloor.x},${oppositeFloor.y}) (${back.x},${floor.y})`);

    return maxArea;

}

run(__filename, solve, { onlyPart: 2, skipTests: true });