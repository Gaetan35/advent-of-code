import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => line.split(" ").map(Number));

  return input;
};

const computeDifferencesForLine = (line) => {
  const differences = [line];
  let done = false;
  while (!done) {
    const lineConsidered = differences[differences.length - 1];
    const newLine = [];
    done = true;
    for (let i = 0; i < lineConsidered.length - 1; i++) {
      const difference = lineConsidered[i + 1] - lineConsidered[i];
      newLine.push(difference);
      if (difference !== 0) {
        done = false;
      }
    }
    differences.push(newLine);
  }
  return differences;
};

const predictFromDifferences = (differences) => {
  differences[differences.length - 1].push(0);
  for (let i = differences.length - 2; i >= 0; i -= 1) {
    const lastOfPreviousLine =
      differences[i + 1][differences[i + 1].length - 1];
    const lastOfCurrentLine = differences[i][differences[i].length - 1];
    differences[i].push(lastOfCurrentLine + lastOfPreviousLine);
  }
  return differences[0][differences[0].length - 1];
};

const input = await parseTextInput(false);

const predictions = input
  .map((line) => computeDifferencesForLine(line))
  .map((difference) => predictFromDifferences(difference));

console.log(predictions);

const result = predictions.reduce((previous, current) => previous + current);
console.log(result);
