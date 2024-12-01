import * as fs from "fs/promises";

type Input = any;

const parseTextInput = async (isTest = false): Promise<Input> => {
  return (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n");
};

function part1(input: Input) {
  return null;
}

function part2(input: Input) {
  return null;
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
