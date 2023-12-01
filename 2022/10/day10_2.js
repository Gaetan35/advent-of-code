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

const getXValuesDuringCycle = (input) => {
  let x = 1;
  let cycle = 1;
  const xValuesDuringCycle = {};
  for (const { instruction, argument } of input) {
    xValuesDuringCycle[cycle] = x;

    if (instruction === "noop") {
      cycle += 1;
      continue;
    }

    // Instruction is 'addx'
    x += argument;
    cycle += 2;
  }
  xValuesDuringCycle[cycle] = x;
  return xValuesDuringCycle;
};

const getXValueDuringCycle = (cycle, xValuesDuringCycle) =>
  xValuesDuringCycle[cycle] ?? xValuesDuringCycle[cycle - 1];

const input = await parseInput(false);
const xValuesDuringCycle = getXValuesDuringCycle(input);

const SCREEN_HEIGHT = 6;
const SCREEN_WIDTH = 40;
let cycle = 1;
const screen = Array.from({ length: SCREEN_HEIGHT }, () => []);
for (let row = 0; row < SCREEN_HEIGHT; row++) {
  for (let pixelPos = 0; pixelPos < SCREEN_WIDTH; pixelPos++) {
    const x = getXValueDuringCycle(cycle, xValuesDuringCycle);
    if (Math.abs(x - pixelPos) <= 1) {
      screen[row].push("#");
    } else {
      screen[row].push(".");
    }
    cycle += 1;
  }
}
const resultString = screen.map((row) => row.join("")).join("\n");
console.log(resultString);
