import * as fs from "fs/promises";

const parseInput = async (test = false) => {
  const fileContent = (
    await fs.readFile(test ? "input_test.txt" : "input.txt")
  ).toString();
  const lines = fileContent.split("\n");
  return lines.map((line) => line.split("").map((str) => parseInt(str)));
};

const grid = await parseInput(false);
const WIDTH = grid[0].length;
const HEIGHT = grid.length;

const makeVisibleTreeGrid = (grid) =>
  Array.from({ length: HEIGHT }, (_, i) =>
    Array.from({ length: WIDTH }, (_, j) => 0)
  );

const visibleTreeToTheLeft = makeVisibleTreeGrid(grid);
const visibleTreeToTheRight = makeVisibleTreeGrid(grid);
const visibleTreeToTheTop = makeVisibleTreeGrid(grid);
const visibleTreeToTheBottom = makeVisibleTreeGrid(grid);

// for (let i = 0; i < HEIGHT; i++) {
//   for (let j = 1; j < WIDTH; j++) {
//     // from left to right
//     visibleTreeToTheLeft[i][j] =
//       grid[i][j - 1] < grid[i][j] ? 1 + visibleTreeToTheLeft[i][j - 1] : 1;
//   }
// }

// for (let i = 1; i < HEIGHT; i++) {
//   for (let j = 0; j < WIDTH; j++) {
//     // from top to bottom
//     visibleTreeToTheTop[i][j] =
//       grid[i - 1][j] < grid[i][j] ? 1 + visibleTreeToTheTop[i - 1][j] : 1;
//   }
// }

// for (let i = HEIGHT - 1; i > -1; i--) {
//   for (let j = WIDTH - 2; j > -1; j--) {
//     // from right to left
//     visibleTreeToTheRight[i][j] =
//       grid[i][j + 1] < grid[i][j] ? 1 + visibleTreeToTheRight[i][j + 1] : 1;
//   }
// }

// for (let i = HEIGHT - 2; i > -1; i--) {
//   for (let j = WIDTH - 1; j > -1; j--) {
//     // from bottom to top
//     visibleTreeToTheBottom[i][j] =
//       grid[i + 1][j] < grid[i][j] ? 1 + visibleTreeToTheBottom[i + 1][j] : 1;
//   }
// }

// let maxScore = 0;
// let maxI = 0;
// let maxJ = 0;
// const totalGrid = makeVisibleTreeGrid(grid);
// for (let i = 0; i < HEIGHT; i++) {
//   for (let j = 0; j < WIDTH; j++) {
//     const score =
//       visibleTreeToTheBottom[i][j] *
//       visibleTreeToTheTop[i][j] *
//       visibleTreeToTheLeft[i][j] *
//       visibleTreeToTheRight[i][j];
//     totalGrid[i][j] = score;

//     if (score > maxScore) {
//       maxScore = score;
//       maxI = i;
//       maxJ = j;
//     }
//   }
// }

// console.log(maxI, maxJ);

// console.log(visibleTreeToTheRight);
// console.log(maxScore);

let maxScore = 0;
for (let i = 1; i < HEIGHT - 1; i++) {
  for (let j = 1; j < WIDTH - 1; j++) {
    const currentTree = grid[i][j];

    // Looking left
    let visibleToLeft = 0;
    let index = j - 1;
    while (index >= 0 && currentTree > grid[i][index]) {
      visibleToLeft += 1;
      index -= 1;
    }
    if (index >= 0 && currentTree <= grid[i][index]) {
      visibleToLeft += 1;
    }
    visibleTreeToTheLeft[i][j] = visibleToLeft;

    // Looking right
    let visibleToRight = 0;
    index = j + 1;
    while (index <= WIDTH - 1 && currentTree > grid[i][index]) {
      visibleToRight += 1;
      index += 1;
    }
    if (index <= WIDTH - 1 && currentTree <= grid[i][index]) {
      visibleToRight += 1;
    }
    visibleTreeToTheRight[i][j] = visibleToRight;

    // Looking down
    let visibleToBottom = 0;
    index = i + 1;
    while (index <= HEIGHT - 1 && currentTree > grid[index][j]) {
      visibleToBottom += 1;
      index += 1;
    }
    if (index <= HEIGHT - 1 && currentTree <= grid[index][j]) {
      visibleToBottom += 1;
    }
    visibleTreeToTheBottom[i][j] = visibleToBottom;

    // Looking up
    let visibleToTop = 0;
    index = i - 1;
    while (index >= 0 && currentTree > grid[index][j]) {
      visibleToTop += 1;
      index -= 1;
    }
    if (index >= 0 && currentTree <= grid[index][j]) {
      visibleToTop += 1;
    }
    visibleTreeToTheTop[i][j] = visibleToTop;

    const score =
      visibleToBottom * visibleToLeft * visibleToRight * visibleToTop;

    if (score > maxScore) {
      maxScore = score;
    }
  }
}
console.log(maxScore);
