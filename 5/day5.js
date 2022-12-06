import * as fs from "fs/promises";

const parseInput = async (test = false) => {
  const fileContent = (
    await fs.readFile(test ? "test_input.txt" : "input.txt")
  ).toString();
  const lines = fileContent.split("\n");
  const stacks = {};
  const instructions = [];
  for (const line of lines) {
    if (line[1] === "1") {
      break;
    }
    for (let i = 1; i <= lines[0].length; i += 4) {
      const columnNb = (i - 1) / 4 + 1;
      if (line[i] !== " ") {
        stacks[columnNb] = [line[i], ...(stacks[columnNb] ?? [])];
      }
    }
  }

  for (const line of lines) {
    if (line[0] === "m") {
      const [amount, source, destination] = line
        .replace(/move /g, "")
        .replace(/ from /g, " ")
        .replace(/ to /g, " ")
        .split(" ")
        .map((str) => parseInt(str));
      instructions.push({ amount, source, destination });
    }
  }
  return [stacks, instructions];
};

const getResult_round1 = (stacks, instructions) => {
  for (const instruction of instructions) {
    for (let i = 0; i < instruction.amount; i++) {
      const removed = stacks[instruction.source].pop();
      stacks[instruction.destination].push(removed);
    }
  }
  return stacks;
};

const getResult_round2 = (stacks, instructions) => {
  for (const instruction of instructions) {
    const removed = stacks[instruction.source].splice(
      stacks[instruction.source].length - instruction.amount,
      instruction.amount
    );
    stacks[instruction.destination].push(...removed);
  }
  return stacks;
};

const [stacks, instructions] = await parseInput(false);
const result = getResult_round2(stacks, instructions);
let word = "";
for (const stack of Object.values(result)) {
  word += stack[stack.length - 1];
}
console.log("Result : ", result);
console.log(word);
