import * as fs from "fs/promises";
import * as path from "path";

type Input = string[][];

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  return (await fs.readFile(filePath))
    .toString()
    .split("\n")
    .map((line) => line.split(""));
};

const countOccurrencesFromPositionAndDeltaPart1 = (
  grid: string[][],
  x: number,
  y: number,
  dx: number,
  dy: number
) => {
  const letters = ["X", "M", "A", "S"];
  let index = 0;
  while (index < letters.length && grid?.[y]?.[x] === letters[index]) {
    index++;
    x += dx;
    y += dy;
  }
  if (index === letters.length) {
    return 1;
  }
  return 0;
};

function part1(input: Input) {
  const WIDTH = input[0].length;
  const HEIGHT = input.length;

  const deltas = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [1, 1],
    [-1, -1],
    [1, -1],
    [-1, 1],
  ];

  let occurrences = 0;
  for (let i = 0; i < HEIGHT; i++) {
    for (let j = 0; j < WIDTH; j++) {
      for (const [dx, dy] of deltas) {
        occurrences += countOccurrencesFromPositionAndDeltaPart1(
          input,
          j,
          i,
          dx,
          dy
        );
      }
    }
  }
  return occurrences;
}

const countOccurrencesFromPositionAndDeltaPart2 = (
  grid: string[][],
  x: number,
  y: number
) => {
  if (grid[y][x] !== "A") {
    return 0;
  }

  const positionsToCheck = [
    { dx: 1, dy: 1 },
    { dx: -1, dy: -1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: 1 },
  ];

  let MAScount = 0;
  for (const { dx, dy } of positionsToCheck) {
    if (grid?.[y + dy]?.[x + dx] === "M" && grid?.[y - dy]?.[x - dx] === "S") {
      MAScount++;
    }
  }
  return MAScount === 2 ? 1 : 0;
};

function part2(input: Input) {
  const WIDTH = input[0].length;
  const HEIGHT = input.length;

  let occurrences = 0;
  for (let i = 0; i < HEIGHT; i++) {
    for (let j = 0; j < WIDTH; j++) {
      occurrences += countOccurrencesFromPositionAndDeltaPart2(input, j, i);
    }
  }
  return occurrences;
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
