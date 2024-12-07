import * as fs from "fs/promises";
import * as path from "path";

type Input = { total: number; terms: number[] }[];

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  return (await fs.readFile(filePath))
    .toString()
    .split("\n")
    .map((line) => {
      const [test, numbers] = line.split(": ");
      return {
        total: Number(test),
        terms: numbers.split(" ").map(Number),
      };
    });
};

const getPartialComputation = (terms: number[], operators: string[]) => {
  let result = terms[0];
  const operations = {
    "+": (a: number, b: number) => a + b,
    "*": (a: number, b: number) => a * b,
    "||": (a: number, b: number) => Number(`${a}${b}`),
  };

  for (let i = 0; i < operators.length; i++) {
    result = operations[operators[i]](result, terms[i + 1]);
  }
  return result;
};

const totalCanBeObtainedFromTerms = (
  total: number,
  terms: number[],
  possibleOperators: string[]
) => {
  const possibilities = [...possibleOperators.map((op) => [op])];

  while (possibilities.length) {
    const operators = possibilities.pop();
    const partialComputation = getPartialComputation(terms, operators);

    if (partialComputation === total && operators.length === terms.length - 1) {
      return true;
    }

    if (operators.length < terms.length - 1 && partialComputation <= total) {
      for (const op of possibleOperators) {
        possibilities.push([...operators, op]);
      }
    }
  }

  return false;
};

function part1(input: Input) {
  let sum = 0;
  for (const { total, terms } of input) {
    if (totalCanBeObtainedFromTerms(total, terms, ["+", "*"])) {
      sum += total;
    }
  }
  return sum;
}

function part2(input: Input) {
  let sum = 0;
  for (const { total, terms } of input) {
    if (totalCanBeObtainedFromTerms(total, terms, ["+", "*", "||"])) {
      sum += total;
    }
  }
  return sum;
}

async function main() {
  const IS_TEST = process.argv[2] === "test";
  const input = await parseTextInput(IS_TEST);

  const part1Result = part1(input);
  console.log("Part1 result: ", part1Result);

  const part2Result = part2(input);
  console.log("Part2 result: ", part2Result);
}

main();
