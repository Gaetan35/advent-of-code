import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split(",");

  return input;
};

const computeHashValue = (sequence) => {
  let currentValue = 0;
  for (const char of sequence) {
    currentValue += char.charCodeAt(0);
    currentValue *= 17;
    currentValue = currentValue % 256;
  }
  return currentValue;
};

const input = await parseTextInput(false);

let hashSum = 0;
for (const step of input) {
  const hash = computeHashValue(step);
  hashSum += hash;
  // console.log(`${step}: hash = ${hash}`);
}
console.log(hashSum);
