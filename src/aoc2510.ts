import { run } from 'aoc-copilot';

async function solve(
    inputs: string[], // Contents of the example or actual inputs
    part: number,     // Indicates whether the solver is being called for part 1 or 2 of the puzzle
    test: boolean,    // Indicates whether the solver is being run for an example or actual input
    additionalInfo?: { [key: string]: string } // Additional info for some puzzles with multiple examples
): Promise<number | bigint | string> {
    
    const regex = /(\[)(?<lights>.*)(]) (?<buttons>\(.*\)) ({)(?<joltage>.*)(})/;
    const machines = inputs.map(input => {
        const match = regex.exec(input);
        return {
            lights: match?.groups?.lights?.split('') ?? [],
            buttons: match?.groups?.buttons?.split(' ').map(group => group.match(/\d+/g)?.map(Number) ?? []) ?? [],
            joltage: [...match?.groups?.joltage?.match(/\d+/g)?.map(Number) ?? []]
        };
    });
    
    let answer = machines.reduce((totalPresses, machine, mi, ma) => {

        if (part === 2 && !test) {
            console.log(`Machine ${mi + 1}/${ma.length} ${new Date().toLocaleString()}`);
        }

        // Let's treat the button groups like a map where we can navigate from one button to any other
        // button, and we'll do a BFS to see the fewest presses it takes to achieve the desired state.
        const visiteds: Map<string, number> = new Map();
        const unvisiteds = machine.buttons.map((button) => ({
            button,
            lights: part === 1 ? Array(machine.lights.length).fill('.') : [],
            joltage: part === 2 ? Array(machine.joltage.length).fill(0) : [],
            presses: 0
        }));

        let lights: string[] = [];
        let lightStr = '';
        let joltage: number[] = [];
        let joltStr = '';
        while (unvisiteds.length > 0) {

            const prev = unvisiteds.shift()!;
            let presses = prev.presses + 1;

            // Apply the button press
            if (part === 1) {
                lights = prev.lights.map((l, i) => prev.button.includes(i) ? l === '.' ? '#' : '.' : l);
                if (lights.every((light, i) => light === machine.lights[i])) {
                    return totalPresses + presses;
                }
                lightStr = lights.join('');
            } else {
                joltage = prev.joltage.map((j, i) => j + (prev.button.includes(i) ? 1 : 0));
                if (joltage.every((jolt, i) => jolt === machine.joltage[i])) {
                    return totalPresses + presses;
                } else if (joltage.some((jolt, i) => jolt > machine.joltage[i])) {
                    continue;
                }
                joltStr = joltage.join(',');
            }

            if ((part === 1 && !visiteds.has(lightStr)) || (part === 2 && (visiteds.get(joltStr) ?? Infinity) > presses)) {
                visiteds.set(part === 1 ? lightStr : joltStr, presses);
                for (let button of machine.buttons.filter(button => part === 2 || button !== prev.button)) {
                    unvisiteds.push({ button, lights, joltage, presses });
                }
            }
        }

        return totalPresses;

    }, 0);    

    return answer;
}

run(__filename, solve);