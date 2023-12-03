import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const grid = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => line.split(""));

  return grid;
};

const grid = await parseTextInput(true);
const height = grid.length;
const width = grid[0].length;

const adjacentCells = [
  { dx: -1, dy: -1 },
  { dx: -1, dy: 0 },
  { dx: -1, dy: 1 },
  { dx: 0, dy: -1 },
  { dx: 0, dy: 1 },
  { dx: 1, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: 1, dy: 1 },
];

const findHasSymbolAdjacent = (grid, x, y) => {
  const symbolRegex = /[^0-9.]/;
  for (const { dx, dy } of adjacentCells) {
    const neighborX = x + dx;
    const neighborY = y + dy;
    if (
      neighborX < 0 ||
      neighborY < 0 ||
      neighborX >= width ||
      neighborY >= height
    ) {
      continue;
    }

    if (
      grid[neighborY][neighborX].match(symbolRegex) ||
      (dx !== 0 && dy !== 0 && grid[neighborY][neighborX] !== ".")
    ) {
      return true;
    }
  }
};

const digitRegex = /[0-9]/;
const partNumbers = [];
let result = 0;
for (let y = 0; y < height; y++) {
  let digits = [];
  for (let x = 0; x < width; x++) {
    const cell = grid[y][x];
    if (cell.match(digitRegex)) {
      digits.push({ cell, x, y });
    } else {
      if (digits.length) {
        partNumbers.push(Number(digits.join("")));
        result += Number(digits.map(({ cell }) => cell).join(""));
      }
      digits = [];
    }
  }
}

console.log(partNumbers);
console.log(result);

// 518219 is too low
