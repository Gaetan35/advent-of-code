import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const grid = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => line.split(""));

  return grid;
};

const grid = await parseTextInput(false);
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

const findGearPositions = (grid, digits) => {
  const gearPositions = {};
  for (const { cellX, cellY } of digits) {
    for (const { dx, dy } of adjacentCells) {
      const neighborX = cellX + dx;
      const neighborY = cellY + dy;

      if (
        grid?.[neighborY]?.[neighborX] === "*" &&
        !gearPositions[`${neighborX}-${neighborY}`]
      ) {
        gearPositions[`${neighborX}-${neighborY}`] = true;
      }
    }
  }

  return Object.keys(gearPositions);
};

const digitRegex = /\d/;
const gearNeighbors = {};
for (let y = 0; y < height; y += 1) {
  let digits = [];
  for (let x = 0; x < width; x += 1) {
    const cell = grid[y][x];
    if (cell.match(digitRegex)) {
      digits.push({ cell, cellX: x, cellY: y });
    } else {
      if (digits.length) {
        const number = Number(digits.map(({ cell }) => cell).join(""));
        const adjacentGears = findGearPositions(grid, digits);
        adjacentGears.forEach((posString) => {
          if (!gearNeighbors[posString]) {
            gearNeighbors[posString] = [number];
          } else {
            gearNeighbors[posString].push(number);
          }
        });
      }
      digits = [];
    }
  }

  if (digits.length) {
    const number = Number(digits.map(({ cell }) => cell).join(""));
    const adjacentGears = findGearPositions(grid, digits);
    adjacentGears.forEach((posString) => {
      if (!gearNeighbors[posString]) {
        gearNeighbors[posString] = [number];
      } else {
        gearNeighbors[posString].push(number);
      }
    });
  }
}

let result = 0;
Object.values(gearNeighbors).forEach((adjacentNumbers) => {
  if (adjacentNumbers.length === 2) {
    result += adjacentNumbers[0] * adjacentNumbers[1];
  }
});

console.log(gearNeighbors);
console.log(result);
