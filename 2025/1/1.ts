import * as fs from "fs/promises";
import * as path from "path";

type Input = { direction: "L" | "R"; value: number }[];

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  return (await fs.readFile(filePath))
    .toString()
    .split("\n")
    .map((line) => ({
      direction: line[0] as "L" | "R",
      value: Number(line.slice(1)),
    }));
};

function part1(input: Input) {
  let dialPos = 50;
  let timesAtPos0 = 0;
  for (const { direction, value } of input) {
    const sign = direction === "L" ? -1 : 1;
    dialPos = (dialPos + sign * value + 100) % 100;
    if (dialPos === 0) {
      timesAtPos0 += 1;
    }
  }
  return timesAtPos0;
}

function part2(input: Input) {
  let dialPos = 50;
  let timesAtPos0 = 0;
  for (const { direction, value } of input) {
    const sign = direction === "L" ? -1 : 1;
    const newDialPos = dialPos + sign * value;
    const newHundreds = Math.floor(newDialPos / 100);
    const oldHundreds = Math.floor(dialPos / 100);
    timesAtPos0 += Math.abs(oldHundreds - newHundreds);

    if (newDialPos % 100 === 0 && direction === "L") {
      timesAtPos0 += 1;
    }
    if (dialPos % 100 === 0 && direction === "L") {
      timesAtPos0 -= 1;
    }
    dialPos = newDialPos;
  }
  return timesAtPos0;
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
