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

const applyCycles = (input) => {
  for (let cycleIndex = 1; cycleIndex < 2; cycleIndex++) {
    const northGrid = moveRocksNorth(input);
    const westGrid = moveRocksWest(northGrid);
    const southGrid = moveRocksSouth(westGrid);
    const eastGrid = moveRocksEast(southGrid);

    prettyPrint(eastGrid);
  }
};

const input = await parseTextInput(true);

applyCycles(input);
