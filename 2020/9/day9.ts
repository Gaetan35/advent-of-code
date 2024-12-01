import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  return (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map(Number);
};

const findInvalidNumber = (input: number[], preambleSize: number) => {
  const preamble = input.slice(0, preambleSize);
  const rest = input.slice(preambleSize);

  for (let i = 0; i < rest.length; i++) {
    const current = rest[i];
    const valid = preamble.some((a) =>
      preamble.some((b) => a + b === current && a !== b)
    );

    if (!valid) {
      return current;
    }

    preamble.shift();
    preamble.push(current);
  }

  throw new Error("No invalid number found");
};

const findContiguousSet = (input: number[], invalidNumber: number) => {
  let start = 0;
  let end = 0;
  let sum = input[start];

  while (sum !== invalidNumber) {
    if (sum < invalidNumber) {
      end++;
      sum += input[end];
    } else {
      sum -= input[start];
      start++;
      if (start === end) {
        end++;
        sum += input[end];
      }
    }
  }

  return { start, end };
};

const main = async () => {
  const IS_TEST = false;
  const input = await parseTextInput(IS_TEST);
  const invalidNumber = findInvalidNumber(input, IS_TEST ? 5 : 25);

  console.log("Part 1:", invalidNumber);

  const { start, end } = findContiguousSet(input, invalidNumber);

  const sortedContiguousSet = input.slice(start, end + 1).sort((a, b) => a - b);

  console.log("Part 2:", sortedContiguousSet[0] + sortedContiguousSet.at(-1));
};

main();
