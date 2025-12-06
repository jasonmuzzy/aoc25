import { run } from 'aoc-copilot';

async function solve(
    [...inputs]: string[], // Contents of the example or actual inputs
    part: number,     // Indicates whether the solver is being called for part 1 or 2 of the puzzle
    test: boolean,    // Indicates whether the solver is being run for an example or actual input
    additionalInfo?: { [key: string]: string } // Additional info for some puzzles with multiple examples
): Promise<number | bigint | string> {
    let answer: number | bigint | string = 0;

    const operators = inputs.pop()?.trim().split(/\s+/g);
    if (part === 1) {
        const numbers = inputs.map(row => row.trim().split(/\s+/g).map(Number));
        answer = operators?.reduce((total, operator, column) => {
            return total + numbers.reduce((result, row) => {
                if (operator === '*') {
                    result *= row[column];
                } else {
                    result += row[column];
                }
                return result;
            }, operator === '*' ? 1 : 0);
        }, 0) ?? 0;
    } else {
        const digits = inputs.map(row => row.split(''));
        let operator = operators?.pop();
        let subtotal = operator === '*' ? 1 : 0;
        for (let x = digits[0].length - 1; x >= 0; x--) {
            let num = '';
            for (let y = 0; y < digits.length; y++) {
                num += digits[y][x];
            }
            if (num.trim() != '') {
                if (operator === '*') {
                    subtotal *= parseInt(num);
                } else {
                    subtotal += parseInt(num);
                }
            } else {
                answer += subtotal;
                operator = operators?.pop();
                subtotal = operator === '*' ? 1 : 0;
            }
        }
        answer += subtotal;
    }

    return answer;
}

run(__filename, solve);