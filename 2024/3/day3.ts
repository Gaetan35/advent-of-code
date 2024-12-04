import * as fs from "fs/promises";

type Input = string;

const parseTextInput = async (isTest = false): Promise<Input> => {
  return (
    await fs.readFile(isTest ? "input_test2.txt" : "input.txt")
  ).toString();
};

function part1(input: Input) {
  const mulRegex = /mul\((\d+),(\d+)\)/g;
  let sum = 0;
  for (const match of input.matchAll(mulRegex)) {
    const a = Number(match[1]);
    const b = Number(match[2]);
    sum += a * b;
  }

  return sum;
}

function part2(input: Input) {
  const mulRegex = /mul\((\d+),(\d+)\)/g;
  const doRegex = /do\(\)/g;
  const dontRegex = /don't\(\)/g;

  const matches = [
    ...input.matchAll(mulRegex),
    ...input.matchAll(doRegex),
    ...input.matchAll(dontRegex),
  ].toSorted((a, b) => a.index - b.index);

  let sum = 0;
  let isSumEnabled = true;
  for (const match of matches) {
    if (match[0].startsWith("don't")) {
      isSumEnabled = false;
      continue;
    }

    if (match[0].startsWith("do")) {
      isSumEnabled = true;
      continue;
    }

    if (!isSumEnabled) {
      continue;
    }

    const a = Number(match[1]);
    const b = Number(match[2]);
    sum += a * b;
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
