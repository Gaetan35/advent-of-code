import * as fs from "fs/promises";
import * as path from "path";

type Input = { min: number; max: number }[];

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  return (await fs.readFile(filePath))
    .toString()
    .split(",")
    .map((range) => {
      const [min, max] = range.split("-").map(Number);
      return { min, max };
    });
};

function part1(input: Input) {
  let result = 0;
  for (const { min, max } of input) {
    for (let id = min; id <= max; id += 1) {
      const idString = id.toString();
      if (idString.length % 2 !== 0) {
        continue;
      }
      const firstHalf = idString.slice(0, idString.length / 2);
      const secondHalf = idString.slice(idString.length / 2);
      if (firstHalf === secondHalf) {
        result += id;
      }
    }
  }

  return result;
}

const isRepeatingPattern = (id: number) => {
  const idString = id.toString();
  for (let i = 1; i <= Math.floor(idString.length / 2); i += 1) {
    if (idString.length % i !== 0) {
      continue;
    }
    const pattern = idString.slice(0, i);
    if (idString === pattern.repeat(idString.length / i)) {
      return true;
    }
  }
  return false;
};

function part2(input: Input) {
  let result = 0;
  for (const { min, max } of input) {
    for (let id = min; id <= max; id += 1) {
      if (isRepeatingPattern(id)) {
        result += id;
      }
    }
  }
  return result;
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
