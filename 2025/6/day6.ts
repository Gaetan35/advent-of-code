import * as fs from "fs/promises";
import * as path from "path";

type Input = string[];

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  return (await fs.readFile(filePath)).toString().split("\n");
};

function part1(lines: Input) {
  const splitLines = lines.map((line) => line.split(" ").filter(Boolean));
  const numberLines = splitLines.slice(0, -1);
  const operatorLine = splitLines.at(-1) as ("+" | "*")[];

  let result = 0;
  for (let i = 0; i < numberLines[0].length; i += 1) {
    const numbers = numberLines.map((line) => Number(line[i]));
    result += numbers.reduce((acc, value) =>
      operatorLine[i] === "+" ? acc + value : acc * value
    );
  }

  return result;
}

function part2(lines: Input) {
  let lastProblemIndex = 0;
  const problems: { terms: string[]; operator: "+" | "*" }[] = [];
  const termLines = lines.slice(0, -1);
  for (let x = 0; x < lines[0].length; x += 1) {
    if (lines.every((line) => line[x] === " ")) {
      problems.push({
        terms: termLines.map((line) => line.substring(lastProblemIndex, x)),
        operator: lines.at(-1)[lastProblemIndex] as "+" | "*",
      });
      lastProblemIndex = x + 1;
    }
  }

  problems.push({
    terms: termLines.map((line) => line.substring(lastProblemIndex)),
    operator: lines.at(-1)[lastProblemIndex] as "+" | "*",
  });

  let result = 0;
  for (const { terms, operator } of problems) {
    const numbers = [];
    for (let j = terms[0].length - 1; j >= 0; j -= 1) {
      let number = "";
      for (const paddedNumber of terms) {
        number += paddedNumber[j] === " " ? "" : paddedNumber[j];
      }
      numbers.push(Number(number));
    }

    result += numbers.reduce((acc, value) =>
      operator === "+" ? acc + value : acc * value
    );
  }
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
