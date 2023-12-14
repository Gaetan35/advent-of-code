import * as fs from "fs/promises";

const prettyPrint = (grid) => {
  console.log(grid.map((line) => line.join("")).join("\n"));
};

const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => line.split(""));

  return input;
};

const moveRocksNorth = (grid) => {
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;

  const newGrid = Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x) =>
      grid[y][x] !== "O" ? grid[y][x] : "."
    )
  );

  const blockedYPerColumn = {};
  for (let x = 0; x < WIDTH; x++) {
    blockedYPerColumn[x] = -1;
  }

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const cell = grid[y][x];
      if (cell === "#") {
        blockedYPerColumn[x] = y;
      } else if (cell === "O") {
        newGrid[blockedYPerColumn[x] + 1][x] = "O";
        blockedYPerColumn[x] += 1;
      }
    }
  }
  return newGrid;
};

const computeLoad = (grid) => {
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;
  let load = 0;

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const cell = grid[y][x];
      if (cell === "O") {
        load += HEIGHT - y;
      }
    }
  }
  return load;
};

const input = await parseTextInput(false);

const newGrid = moveRocksNorth(input);
prettyPrint(newGrid);

const result = computeLoad(newGrid);
console.log(result);
