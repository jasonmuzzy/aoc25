import { run } from 'aoc-copilot';

async function solve(
    inputs: string[], // Contents of the example or actual inputs
    part: number,     // Indicates whether the solver is being called for part 1 or 2 of the puzzle
    test: boolean,    // Indicates whether the solver is being run for an example or actual input
    additionalInfo?: { [key: string]: string } // Additional info for some puzzles with multiple examples
): Promise<number | bigint | string> {

    const graph = new Map(inputs.map(input => [input.substring(0, 3), new Set(input.substring(5).split(' '))]));

    if (part === 1) {
        return dp(graph, 'you', 'out');
    } else {
        let route1 = dp(graph, 'svr', 'dac');
        route1 *= dp(graph, 'dac', 'fft');
        route1 *= dp(graph, 'fft', 'out');

        let route2 = dp(graph, 'svr', 'fft');
        route2 *= dp(graph, 'fft', 'dac');
        route2 *= dp(graph, 'dac', 'out');

        return route1 + route2;
    }

    function dp(graph: Map<string, Set<string>>, start: string, end: string) {
        const memo: Map<string, number> = new Map();
        function dfs(current: string): number {
            if (current === end) return 1;
            const memoVal = memo.get(current);
            if (memoVal !== undefined) return memoVal;
            const total = [...graph.get(current) ?? []].reduce((t, c) => t + dfs(c), 0);
            memo.set(current, total);
            return total;
        }
        return dfs(start);
    }

}

run(__filename, solve);