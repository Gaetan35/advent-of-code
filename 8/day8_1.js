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

const makeIsVisibleGrid = () =>
  Array.from({ length: HEIGHT }, (_, i) =>
    Array.from(
      { length: WIDTH },
      (_, j) => i === 0 || j === 0 || i === HEIGHT - 1 || j === WIDTH - 1
    )
  );

const makeHighestTreeGrid = (grid) =>
  Array.from({ length: HEIGHT }, (_, i) =>
    Array.from({ length: WIDTH }, (_, j) =>
      i === 0 || j === 0 || i === HEIGHT - 1 || j === WIDTH - 1 ? grid[i][j] : 0
    )
  );

const highestTreeFromLeft = makeHighestTreeGrid(grid);
const highestTreeFromRight = makeHighestTreeGrid(grid);
const highestTreeFromTop = makeHighestTreeGrid(grid);
const highestTreeFromBottom = makeHighestTreeGrid(grid);
const isVisibleGrid = makeIsVisibleGrid();

for (let i = 1; i < HEIGHT - 1; i++) {
  for (let j = 1; j < WIDTH - 1; j++) {
    // from left to right
    if (highestTreeFromLeft[i][j - 1] < grid[i][j]) {
      isVisibleGrid[i][j] = true;
    }
    highestTreeFromLeft[i][j] = Math.max(
      highestTreeFromLeft[i][j - 1],
      grid[i][j]
    );

    // from top to bottom
    if (highestTreeFromTop[i - 1][j] < grid[i][j]) {
      isVisibleGrid[i][j] = true;
    }
    highestTreeFromTop[i][j] = Math.max(
      highestTreeFromTop[i - 1][j],
      grid[i][j]
    );
  }
}

for (let i = HEIGHT - 2; i > 0; i--) {
  for (let j = WIDTH - 2; j > 0; j--) {
    // from right to left
    if (highestTreeFromRight[i][j + 1] < grid[i][j]) {
      isVisibleGrid[i][j] = true;
    }
    highestTreeFromRight[i][j] = Math.max(
      highestTreeFromRight[i][j + 1],
      grid[i][j]
    );

    // from bottom to top
    if (highestTreeFromBottom[i + 1][j] < grid[i][j]) {
      isVisibleGrid[i][j] = true;
    }
    highestTreeFromBottom[i][j] = Math.max(
      highestTreeFromBottom[i + 1][j],
      grid[i][j]
    );
  }
}

let visibleTrees = 2 * (WIDTH + HEIGHT) - 4;
for (let i = 1; i < HEIGHT - 1; i++) {
  for (let j = 1; j < WIDTH - 1; j++) {
    if (isVisibleGrid[i][j]) {
      visibleTrees += 1;
    }
  }
}

// console.log(isVisibleGrid);
console.log(visibleTrees);
