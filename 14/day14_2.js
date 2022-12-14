import * as fs from "fs/promises";

const parseInput = async (test = false) => {
  const fileContent = (
    await fs.readFile(test ? "input_test.txt" : "input.txt")
  ).toString();
  let minX = 10000;
  let minY = 10000;
  let maxX = 0;
  let maxY = 0;
  const lines = fileContent.split("\n").map((line) =>
    line.split("->").map((point) => {
      const [x, y] = point
        .trim()
        .split(",")
        .map((str) => parseInt(str));

      if (x < minX) {
        minX = x;
      }
      if (y < minY) {
        minY = y;
      }
      if (x > maxX) {
        maxX = x;
      }
      if (y > maxY) {
        maxY = y;
      }
      return { x, y };
    })
  );
  return { lines, minX, minY, maxX, maxY };
};

const fillGrid = (grid, start, end, xOffset) => {
  const { x: startX, y: startY } = start;
  const { x: endX, y: endY } = end;

  const minX = Math.min(startX, endX);
  const minY = Math.min(startY, endY);
  const maxX = Math.max(startX, endX);
  const maxY = Math.max(startY, endY);

  if (startX === endX) {
    for (let j = minY; j <= maxY; j++) {
      grid[j][startX - xOffset] = "#";
    }
  }
  if (startY === endY) {
    for (let i = minX; i <= maxX; i++) {
      grid[startY][i - xOffset] = "#";
    }
  }
};

const makeGrid = (height, width, lines, xOffset) => {
  const grid = Array.from({ length: height }, (_, i) =>
    Array.from({ length: width }, (_, j) => ".")
  );
  for (const line of lines) {
    let start = line[0];
    for (let i = 1; i < line.length; i++) {
      const end = line[i];
      fillGrid(grid, start, end, xOffset);
      start = end;
    }
  }
  grid[0][500 - xOffset] = "+";
  return grid;
};

const moveSand = (grid, sandX, sandY, xOffset) => {
  if (grid[sandY + 1][sandX - xOffset] === ".") {
    return { x: sandX, y: sandY + 1 };
  }
  if (grid[sandY + 1][sandX - 1 - xOffset] === ".") {
    return { x: sandX - 1, y: sandY + 1 };
  }
  if (grid[sandY + 1][sandX + 1 - xOffset] === ".") {
    return { x: sandX + 1, y: sandY + 1 };
  }
  return { x: sandX, y: sandY };
};

const START_SAND_POS = { x: 500, y: 0 };

const { lines, minX, minY, maxX, maxY } = await parseInput(false);
const X_PADDING = 1000;
const Y_PADDING = 5;
const X_OFFSET = minX - X_PADDING;
const grid = makeGrid(
  maxY + 1 + Y_PADDING,
  maxX + 1 - minX + 2 * X_PADDING,
  lines,
  X_OFFSET
);
grid[maxY + 2] = grid[maxY + 2].map(() => "#");

let sandCount = 1;
let sandX = START_SAND_POS.x;
let sandY = START_SAND_POS.y;
while (true) {
  const { x, y } = moveSand(grid, sandX, sandY, X_OFFSET);
  if (x === sandX && y === sandY) {
    grid[sandY][sandX - X_OFFSET] = "o";
    sandX = START_SAND_POS.x;
    sandY = START_SAND_POS.y;
    if (grid[START_SAND_POS.y][START_SAND_POS.x - X_OFFSET] === "o") {
      break;
    }
    sandCount += 1;
  } else {
    sandX = x;
    sandY = y;
  }
}

const formattedGrid = grid.map((row) => row.join("")).join("\n");
// console.log(formattedGrid);
console.log(sandCount);
