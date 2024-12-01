import * as fs from "fs/promises";

const prettyPrint = (grid) => {
  console.log(grid.map((line) => line.join("")).join("\n"));
};

const parseTextInput = async (isTest = false) => {
  const grid = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => line.split(""));

  return grid;
};

const findTreesForSlope = (grid, dx, dy) => {
  const pos = { x: 0, y: 0 };
  let trees = 0;
  while (pos.y < grid.length) {
    if (grid[pos.y][pos.x % grid[0].length] === "#") {
      trees += 1;
    }
    pos.x += dx;
    pos.y += dy;
  }
  return trees;
};

const grid = await parseTextInput(false);

const slopes = [
  [1, 1],
  [3, 1],
  [5, 1],
  [7, 1],
  [1, 2],
];

let sum = 1;
for (const slope of slopes) {
  sum *= findTreesForSlope(grid, slope[0], slope[1]);
}
console.log(sum);
