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

const moveRocksWest = (grid) => {
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;

  const newGrid = Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x) =>
      grid[y][x] !== "O" ? grid[y][x] : "."
    )
  );

  const blockedXPerRow = {};
  for (let x = 0; x < WIDTH; x++) {
    blockedXPerRow[x] = -1;
  }

  for (let x = 0; x < WIDTH; x++) {
    for (let y = 0; y < HEIGHT; y++) {
      const cell = grid[y][x];
      if (cell === "#") {
        blockedXPerRow[y] = x;
      } else if (cell === "O") {
        newGrid[y][blockedXPerRow[y] + 1] = "O";
        blockedXPerRow[y] += 1;
      }
    }
  }
  return newGrid;
};

const moveRocksSouth = (grid) => {
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;

  const newGrid = Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x) =>
      grid[y][x] !== "O" ? grid[y][x] : "."
    )
  );

  const blockedYPerColumn = {};
  for (let x = 0; x < WIDTH; x++) {
    blockedYPerColumn[x] = HEIGHT;
  }

  for (let y = HEIGHT - 1; y >= 0; y -= 1) {
    for (let x = 0; x < WIDTH; x++) {
      const cell = grid[y][x];
      if (cell === "#") {
        blockedYPerColumn[x] = y;
      } else if (cell === "O") {
        newGrid[blockedYPerColumn[x] - 1][x] = "O";
        blockedYPerColumn[x] -= 1;
      }
    }
  }
  return newGrid;
};

const moveRocksEast = (grid) => {
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;

  const newGrid = Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x) =>
      grid[y][x] !== "O" ? grid[y][x] : "."
    )
  );

  const blockedXPerRow = {};
  for (let x = 0; x < WIDTH; x++) {
    blockedXPerRow[x] = WIDTH;
  }

  for (let x = WIDTH - 1; x >= 0; x -= 1) {
    for (let y = 0; y < HEIGHT; y++) {
      const cell = grid[y][x];
      if (cell === "#") {
        blockedXPerRow[y] = x;
      } else if (cell === "O") {
        newGrid[y][blockedXPerRow[y] - 1] = "O";
        blockedXPerRow[y] -= 1;
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

const findLoadAfterNCycles = (n) => {
  const patternTestInput = [69, 69, 65, 64, 65, 63, 68];
  const testPatternStart = 3;
  const patternRealInput = [
    104988, 104983, 104987, 105008, 105060, 105112, 105154, 105197, 105255,
    105312, 105351, 105354, 105358, 105362, 105322, 105299, 105283, 105265,
    105225, 105191, 105162, 105133, 105097, 105078, 105037, 105000,
  ];
  const realPatternStart = 139;

  if (n < realPatternStart) {
    return "too soon";
  }
  return patternRealInput[(n - realPatternStart) % patternRealInput.length];
};

const applyCycles = (input) => {
  let grid = input;
  for (let cycleIndex = 1; cycleIndex < 1000; cycleIndex++) {
    grid = moveRocksNorth(grid);
    grid = moveRocksWest(grid);
    grid = moveRocksSouth(grid);
    grid = moveRocksEast(grid);
    const load = computeLoad(grid);
    console.log(`${cycleIndex}: load = ${load}`);
  }
};

const input = await parseTextInput(false);
const result = findLoadAfterNCycles(1000000000);
console.log(result);
// applyCycles(input);
