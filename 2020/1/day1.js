import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const numbers = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map(Number);

  return numbers;
};

const numbers = await parseTextInput(false);

const sortedNumbers = numbers.toSorted((a, b) => a - b);

let i = 0;
let j = sortedNumbers.length - 1;
while (sortedNumbers[i] + sortedNumbers[j] !== 2020) {
  if (sortedNumbers[i] + sortedNumbers[j] < 2020) {
    i += 1;
  } else {
    j -= 1;
  }
}
console.log(sortedNumbers);
console.log({ i, j, sortedNumbers: [sortedNumbers[i], sortedNumbers[j]] });
console.log(sortedNumbers[i] * sortedNumbers[j]);
