import * as fs from "fs/promises";

const parseInput = async (test = false) => {
  const fileContent = (
    await fs.readFile(test ? "input_test.txt" : "input.txt")
  ).toString();
  const lines = fileContent.split("\n");
  return lines.map((line) => line.split(""));
};

const getCharCode = (letter) => {
  if (letter === "S") {
    return "a".charCodeAt();
  }
  if (letter === "E") {
    return "z".charCodeAt();
  }
  return letter.charCodeAt();
};

const getNeighbors = (grid, pos, visitedPos) => {
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;
  const { x, y, distance } = pos;

  const neighbors = [];
  if (
    x > 0 &&
    !visitedPos[`${x - 1}|${y}`] &&
    getCharCode(grid[y][x - 1]) - getCharCode(grid[y][x]) >= -1
  ) {
    neighbors.push({ x: x - 1, y: y, distance: distance + 1 });
  }

  if (
    x < WIDTH - 1 &&
    !visitedPos[`${x + 1}|${y}`] &&
    getCharCode(grid[y][x + 1]) - getCharCode(grid[y][x]) >= -1
  ) {
    neighbors.push({ x: x + 1, y: y, distance: distance + 1 });
  }

  if (
    y > 0 &&
    !visitedPos[`${x}|${y - 1}`] &&
    getCharCode(grid[y - 1][x]) - getCharCode(grid[y][x]) >= -1
  ) {
    neighbors.push({ x: x, y: y - 1, distance: distance + 1 });
  }

  if (
    y < HEIGHT - 1 &&
    !visitedPos[`${x}|${y + 1}`] &&
    getCharCode(grid[y + 1][x]) - getCharCode(grid[y][x]) >= -1
  ) {
    neighbors.push({ x: x, y: y + 1, distance: distance + 1 });
  }

  return neighbors;
};

const grid = await parseInput(false);

// const START_POS = { x: 0, y: 0, distance: 0 };
// const END_POS = { x: 5, y: 2, distance: 0 };
// const START_POS = { x: 0, y: 20, distance: 0 };
const END_POS = { x: 119, y: 20, distance: 0 };
const visitedPos = {};

console.log("startElevation : ", grid[2][4]);
// console.log(getNeighbors(grid, { x: 4, y: 2, distance: 0 }, visitedPos));

const queue = [END_POS];
while (queue.length > 0) {
  const { x, y, distance } = queue.shift();
  if (visitedPos[`${x}|${y}`]) {
    continue;
  }
  visitedPos[`${x}|${y}`] = true;
  queue.push(...getNeighbors(grid, { x, y, distance }, visitedPos));
  if (grid[y][x] === "S" || grid[y][x] === "a") {
    console.log("Found it : ", x, y, distance);
    break;
  }
}

console.log("Graph search ended");
