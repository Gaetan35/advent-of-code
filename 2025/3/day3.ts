import * as fs from "fs/promises";
import * as path from "path";

type Input = number[][];

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  return (await fs.readFile(filePath))
    .toString()
    .split("\n")
    .map((line) => line.split("").map(Number));
};

const findMaxJoltageForBank = (bank: number[], numberOfDigits: number) => {
  const batteries: { index: number; value: number }[] = [];
  for (let digit = 0; digit < numberOfDigits; digit += 1) {
    const startIndex = batteries.length === 0 ? 0 : batteries.at(-1)?.index + 1;
    const battery = { index: startIndex, value: bank[startIndex] };

    for (
      let i = startIndex;
      i <= bank.length + digit - numberOfDigits;
      i += 1
    ) {
      if (battery.value === 9) {
        break;
      }
      if (bank[i] > battery.value) {
        battery.index = i;
        battery.value = bank[i];
      }
    }

    batteries.push(battery);
  }
  return Number(batteries.map(({ value }) => value).join(""));
};

function part1(input: Input) {
  let result = 0;
  for (const bank of input) {
    result += findMaxJoltageForBank(bank, 2);
  }
  return result;
}

function part2(input: Input) {
  let result = 0;
  for (const bank of input) {
    result += findMaxJoltageForBank(bank, 12);
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
