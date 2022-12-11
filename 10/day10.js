import * as fs from "fs/promises";

const parseInput = async (test = false) => {
  const fileContent = (
    await fs.readFile(test ? "input_test.txt" : "input.txt")
  ).toString();
  const lines = fileContent.split("\n");
  return lines.map((line) => {
    const [instruction, argument] = line.split(" ");
    return {
      instruction,
      argument: argument ? parseInt(argument) : undefined,
    };
  });
};

const input = await parseInput(true);
let x = 1;
let cycle = 1;
const xValuesPerCycle = {};
for (const { instruction, argument } of input) {
  console.log(cycle, " - ", x);
  if (cycle % 40 === 20) {
    xValuesPerCycle[cycle] = x;
  }

  if (instruction === "noop") {
    cycle += 1;
    continue;
  }

  // Instruction is 'addx'
  if (cycle % 40 === 19) {
    xValuesPerCycle[cycle + 1] = x;
  }
  x += argument;
  cycle += 2;
}
console.log(cycle, " - ", x);

const result = Object.entries(xValuesPerCycle).reduce(
  (previousSum, [index, value]) => previousSum + index * value,
  0
);
console.log(xValuesPerCycle);
console.log(result);
