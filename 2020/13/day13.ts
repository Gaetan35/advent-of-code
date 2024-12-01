import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const [line1, line2] = (
    await fs.readFile(isTest ? "input_test.txt" : "input.txt")
  )
    .toString()
    .split("\n");

  return {
    earliestTime: parseInt(line1),
    buses: line2.split(",").map((id) => (id !== "x" ? +id : id)),
  };
};

function part1(input: { earliestTime: number; buses: (number | "x")[] }) {
  const buses = input.buses
    .filter((id) => id !== "x")
    .map((id) => ({ id, timeToWait: id - (input.earliestTime % id) }));

  const earliestBus = buses.toSorted((a, b) => a.timeToWait - b.timeToWait)[0];
  return earliestBus.id * earliestBus.timeToWait;
}

function part2(input: { earliestTime: number; buses: (number | "x")[] }) {
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
