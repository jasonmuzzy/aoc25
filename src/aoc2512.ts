import { run } from 'aoc-copilot';

const EMPTY = '.';
const FILLED = '#';

type Coordinate = [number, number];

interface Piece {
    area: number;
    id: number;
    shape: string[];
    placements: Coordinate[][];
}

interface Present {
    id: number,
    shape: string[]
}

async function solve(
    inputs: string[], // Contents of the example or actual inputs
    part: number,     // Indicates whether the solver is being called for part 1 or 2 of the puzzle
    test: boolean,    // Indicates whether the solver is being run for an example or actual input
    additionalInfo?: { [key: string]: string } // Additional info for some puzzles with multiple examples
): Promise<number | bigint | string> {
    let answer: number | bigint | string = 0;

    const presents: Present[] = [];
    const regions: string[] = [];

    for (const v of inputs.join('\n').split('\n\n')) {
        if (/\d+:\n/.test(v)) {
            const id = parseInt(v.match(/\d+/g)?.[0] ?? '0');
            const present = v.split('\n').slice(1);
            presents.push({ id, shape: present });
        } else {
            regions.push(...v.split('\n'));
        }
    };

    for (const [i, region] of regions.entries()) {
        console.log(`${i} of ${regions.length}`);
        const [x, y, ...presentCounts] = region.match(/\d+/g)?.map(Number) ?? [0, 0];
        const underTheTree = Array.from({ length: y }, () => '.'.repeat(x).split(''));
        const thePresents: Present[] = [];
        presentCounts.forEach((count, id) => {
            for (let n = 0; n < count; n++) {
                thePresents.push({ id: (n + 1) * 10 + id, shape: presents[id].shape });
            }
        });
        const fits = tryToFit(thePresents, underTheTree);
        if (fits) {
            answer++;
            console.log('Fits');
        } else {
            console.log('Doesn\'t fit');
        }
    }

    return answer;
}

function tryToFit(thePresents: Present[], underTheTree: string[][]) {

    const pieces = thePresents.map(({ id, shape }) => shapeToPiece(shape, id, underTheTree)).sort((a, b) => a.placements.length - b.placements.length);

    const presentArea = pieces.reduce((pv, cv) => pv + cv.area, 0);
    const treeArea = underTheTree.length * underTheTree[0].length;

    // Shortcut: if the total area of the presents exceeds the total area under the tree then it
    // doesn't matter how we arrange them, they'll never all fit.
    if (presentArea > treeArea) {
        console.log('Short cut!');
        return false;
    }

    function placeNext(pieceIndex: number): boolean {
        return pieces[pieceIndex].placements.some(placement => {
            if (placement.every(([x, y]) => underTheTree[y][x] === EMPTY)) {
                if (pieceIndex === pieces.length - 1) {
                    return true;
                } else {
                    placement.forEach(([x, y]) => underTheTree[y][x] = pieces[pieceIndex].id.toString());
                    const placed = placeNext(pieceIndex + 1);
                    placement.forEach(([x, y]) => underTheTree[y][x] = EMPTY);
                    return placed;
                }
            }
        });
    }

    for (let placementId = 0; placementId < pieces[0].placements.length; placementId++) {

        // Place the placement (flip/rotation of a piece)
        pieces[0].placements[placementId].forEach(([x, y]) => {
            underTheTree[y][x] = pieces[0].id.toString();
        });

        // Try to place all remaining pieces
        const allPlaced = placeNext(1);

        // Remove the placement
        pieces[0].placements[placementId].forEach(([x, y]) => {
            underTheTree[y][x] = EMPTY;
        });

        // If all pieces were placed
        if (allPlaced) {
            return true;
        }

    }
    return false;

}

function rotate(shape: string[]) {
    const rotated: string[] = [];
    for (let x = 0; x < shape[0].length; x++) {
        let row = '';
        for (let y = shape.length - 1; y >= 0; y--) {
            row += shape[y][x];
        }
        rotated.push(row);
    }
    return rotated;
}

function shapeToCoordinates(shape: string[]) {
    const coordinates: Coordinate[] = [];
    for (const [y, row] of shape.entries()) {
        for (const [x, space] of row.split('').entries()) {
            if (space === FILLED) {
                coordinates.push([x, y]);
            }
        }
    }
    return coordinates;
}

function shapeToPiece(shape: string[], id: number, board: string[][]) {
    const placements: Coordinate[][] = [];
    const piece: Piece = { area: shape.join('').split('').filter(space => space === FILLED).length, id, shape, placements };
    const variations: Set<string> = new Set();
    const addPlacements = (shape: string[]) => {
        const variation = shape.join('\n');
        if (!variations.has(variation)) {
            variations.add(variation);
            placements.push(...shapeToPlacements(shape, board));
        }
    };
    let current = [...shape];
    for (let flip = 0; flip < 2; flip++) {
        for (let rot = 0; rot < 4; rot++) {
            addPlacements(current);
            current = rotate(current);
        }
        current = current.toReversed();
    }
    return piece;
}

function shapeToPlacements(shape: string[], board: string[][]) {
    const placements: Coordinate[][] = [];
    const coordinates = shapeToCoordinates(shape);
    const pieceWidth = Math.max(...coordinates.map(([x, _]) => x)) + 1;
    const pieceHeight = Math.max(...coordinates.map(([_, y]) => y)) + 1;
    const boardWidth = Math.max(...board.map(row => row.length));
    for (let y = 0; y <= board.length - pieceHeight; y++) {
        for (let x = 0; x <= boardWidth - pieceWidth; x++) {
            const placement = coordinates.map(([x1, y1]) => [x + x1, y + y1] as [number, number]);
            if (placement.every(([x1, y1]) => x1 < board[y1].length && board[y1][x1] === EMPTY)) {
                placements.push(placement);
            }
        }
    }
    return placements;
}

run(__filename, solve);