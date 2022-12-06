import * as fs from "fs/promises";

const fileContent = (await fs.readFile("input.txt")).toString();
const lines = fileContent.split("\n");

// const result1 = lines.reduce((overlapCount, line) => {
//   const [elf1, elf2] = line.split(",");
//   const [low1, high1] = elf1
//     .split("-")
//     .map((numberString) => parseInt(numberString));
//   const [low2, high2] = elf2
//     .split("-")
//     .map((numberString) => parseInt(numberString));
//   const isContained = (low1 - low2) * (high1 - high2) <= 0;
//   if (isContained) {
//     return overlapCount + 1;
//   }
//   return overlapCount;
// }, 0);

// console.log("Result 1 : ", result1);

const result2 = lines.reduce((overlapCount, line) => {
  const [elf1, elf2] = line.split(",");
  const [low1, high1] = elf1
    .split("-")
    .map((numberString) => parseInt(numberString));
  const [low2, high2] = elf2
    .split("-")
    .map((numberString) => parseInt(numberString));

  const hasOverlap = (high1 - low2) * (high2 - low1) >= 0;
  if (hasOverlap) {
    return overlapCount + 1;
  }
  return overlapCount;
}, 0);

console.log("Result 2 : ", result2);
