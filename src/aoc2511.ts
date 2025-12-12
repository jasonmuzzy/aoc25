import { run } from 'aoc-copilot';

async function solve(
    inputs: string[], // Contents of the example or actual inputs
    part: number,     // Indicates whether the solver is being called for part 1 or 2 of the puzzle
    test: boolean,    // Indicates whether the solver is being run for an example or actual input
    additionalInfo?: { [key: string]: string } // Additional info for some puzzles with multiple examples
): Promise<number | bigint | string> {

    const devices = new Map(inputs.map(input => [input.substring(0, 3), input.substring(5).split(' ')]));
    const paths: Set<string> = new Set();
    const stops: { [key: string]: boolean } = {};
    const start = part === 1 ? 'you' : 'svr';
    for (let [device, neighbors] of devices.entries()) {
        stops[device] = false;
        for (let neighbor of neighbors) {
            stops[neighbor] = false;
        }
    }

    down(start, devices, stops, start, paths, part);

    function down(device: string, devices: Map<string, string[]>, stops: { [key: string]: boolean }, path: string, paths: Set<string>, part: number) {
        if (device === 'out') {
            if (part === 1 || (stops['dac'] && stops['fft'])) {
                paths.add(`${path} ${device}`);
            }
        } else {
            if (!stops[device]) {
                stops[device] = true;
                for (let neighbor of devices.get(device) ?? []) {
                    down(neighbor, devices, stops, `${path} ${device}`, paths, part);
                }
                stops[device] = false;
            }
        }
    }

    return paths.size;
}

run(__filename, solve, { forceSubmit: true });