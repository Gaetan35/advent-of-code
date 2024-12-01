import * as fs from "fs/promises";

type Input = { list1: number[]; list2: number[] };

const parseTextInput = async (isTest = false): Promise<Input> => {
  const list1 = [];
  const list2 = [];

  const lines = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n");

  lines.forEach((line) => {
    const [number1, number2] = line.split("   ");
    list1.push(Number(number1));
    list2.push(Number(number2));
  });

  return { list1, list2 };
};

function part1({ list1, list2 }: Input) {
  const sortedList1 = list1.sort((a, b) => a - b);
  const sortedList2 = list2.sort((a, b) => a - b);

  let sumDifferences = 0;
  for (let i = 0; i < sortedList1.length; i++) {
    sumDifferences += Math.abs(sortedList1[i] - sortedList2[i]);
  }
  return sumDifferences;
}

function part2({ list1, list2 }: Input) {
  const counts = {};
  list2.forEach((number) => {
    counts[number] = (counts[number] ?? 0) + 1;
  });

  const result = list1.reduce((acc, number) => {
    return acc + (counts[number] ?? 0) * number;
  }, 0);

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
