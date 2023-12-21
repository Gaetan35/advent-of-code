import * as fs from "fs/promises";

const prettyPrint = (grid) => {
  console.log(grid.map((line) => line.join("")).join("\n"));
};

const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => line.split(""));

  for (let y = 0; y < input.length; y++) {
    for (let x = 0; x < input.length; x++) {
      if (input[y][x] === "S") {
        input[y][x] = ".";
        return [input, [x, y]];
      }
    }
  }
};

const DELTAS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];
const computeNeighbors = (grid, x, y) => {
  const neighbors = [];
  for (const [dx, dy] of DELTAS) {
    if (grid[y + dy]?.[x + dx] === ".") {
      neighbors.push([x + dx, y + dy]);
    }
  }
  return neighbors;
};

const computeReachableCells = (grid, stepsToReach, startPos) => {
  let positions = [startPos];

  for (let i = 0; i < stepsToReach; i++) {
    const newPositions = [];
    const occupiedPositions = new Set();
    for (const [x, y] of positions) {
      const neighbors = computeNeighbors(grid, x, y).filter(
        ([neighborX, neighborY]) => {
          const isOccupiedPosition = occupiedPositions.has(
            `${neighborX}|${neighborY}`
          );
          if (isOccupiedPosition) {
            return false;
          }
          occupiedPositions.add(`${neighborX}|${neighborY}`);
          return true;
        }
      );
      newPositions.push(...neighbors);
    }
    positions = newPositions;
  }
  return positions.length;
};

const [input, startPos] = await parseTextInput(false);

prettyPrint(input);
// console.log(startPos);

const reachableCellsCount = computeReachableCells(input, 64, startPos);
console.log("Result : ", reachableCellsCount);
