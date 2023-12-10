import * as fs from "fs/promises";

const parseTextInput = async (isTest, testNumber) => {
  const grid = (
    await fs.readFile(isTest ? `input_test${testNumber}.txt` : "input.txt")
  )
    .toString()
    .split("\n")
    .map((line) => line.split(""));

  return grid;
};

const prettyPrint = (grid) => {
  console.log(grid.map((line) => line.join("")).join("\n"));
};

const findStartPos = (grid) => {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      if (grid[y][x] === "S") {
        return { x, y };
      }
    }
  }
  throw new Error("Can't find starting pos");
};

const findNeighbors = (grid, { x, y }) => {
  const tile = grid[y][x];
  if (tile === ".") {
    throw new Error("Should not be on a dot tile");
  }
  if (tile === "|") {
    return [
      { x, y: y - 1 },
      { x, y: y + 1 },
    ];
  }
  if (tile === "-") {
    return [
      { x: x - 1, y },
      { x: x + 1, y },
    ];
  }
  if (tile === "L") {
    return [
      { x, y: y - 1 },
      { x: x + 1, y },
    ];
  }
  if (tile === "J") {
    return [
      { x, y: y - 1 },
      { x: x - 1, y },
    ];
  }
  if (tile === "7") {
    return [
      { x: x - 1, y },
      { x, y: y + 1 },
    ];
  }
  if (tile === "F") {
    return [
      { x: x + 1, y },
      { x, y: y + 1 },
    ];
  }

  // Last case: tile === "S"
  const startNeighbors = [];
  if (x > 0 && ["-", "L", "F"].includes(grid[y][x - 1])) {
    startNeighbors.push({ x: x - 1, y });
  }
  if (y > 0 && ["|", "7", "F"].includes(grid[y - 1][x])) {
    startNeighbors.push({ x, y: y - 1 });
  }
  if (y < grid.length - 1 && ["|", "L", "J"].includes(grid[y + 1][x])) {
    startNeighbors.push({ x, y: y + 1 });
  }
  if (x < grid[0].length - 1 && ["-", "J", "7"].includes(grid[y][x + 1])) {
    startNeighbors.push({ x: x + 1, y });
  }
  if (startNeighbors.length > 2) {
    throw new Error("Should not have more than 2 neighbors for start tile");
  }
  return startNeighbors;
};

const findLoopGrid = (grid) => {
  const NON_VISITED_TILE = ".";
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;
  const startPos = findStartPos(grid);
  const queue = [startPos];
  const loopGrid = Array.from({ length: HEIGHT }, () =>
    Array.from({ length: WIDTH }, () => NON_VISITED_TILE)
  );
  loopGrid[startPos.y][startPos.x] = "X";
  while (queue.length > 0) {
    const currentPos = queue.shift();

    const neighbors = findNeighbors(grid, currentPos);

    neighbors.forEach(({ x: neighborX, y: neighborY }) => {
      if (loopGrid[neighborY][neighborX] === NON_VISITED_TILE) {
        loopGrid[neighborY][neighborX] = "X";

        queue.push({ x: neighborX, y: neighborY });
      }
    });
  }

  // loopGrid.forEach((line) => {
  //   line.unshift(NON_VISITED_TILE);
  //   line.push(NON_VISITED_TILE);
  // });
  // loopGrid.unshift(Array.from({ length: WIDTH + 2 }, () => NON_VISITED_TILE));
  // loopGrid.push(Array.from({ length: WIDTH + 2 }, () => NON_VISITED_TILE));

  return loopGrid;
};

const findAdjacentTiles = (grid, node) => {
  const adjacentTiles = [];
  const deltas = [
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
  ];
  deltas.forEach(({ dx, dy }) => {
    if (grid?.[node.y + dy]?.[node.x + dx] === ".") {
      adjacentTiles.push({ x: node.x + dx, y: node.y + dy });
    }
  });
  return adjacentTiles;
};

const markOutsideTiles = (grid) => {
  const NON_VISITED_TILE = ".";
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;

  const outsideTilesGrid = Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x) =>
      grid[y][x] === "X" ? "X" : NON_VISITED_TILE
    )
  );

  const stack = [{ x: 0, y: 0 }];
  while (stack.length !== 0) {
    const node = stack.pop();
    const neighbors = findAdjacentTiles(grid, node);
    neighbors.forEach(({ x, y }) => {
      if (outsideTilesGrid[y][x] === NON_VISITED_TILE) {
        outsideTilesGrid[y][x] = "O";
        stack.push({ x, y });
      }
    });
  }
  return outsideTilesGrid;
};

const findInsideTiles = (grid) => {
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;

  const insideTilesPerLine = Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x) => (grid[y][x] === "X" ? "X" : "."))
  );

  for (let y = 0; y < HEIGHT; y++) {
    let isInside = false;
    for (let x = 0; x < WIDTH; x++) {
      const tile = grid[y][x];
      if (tile === "X") {
        isInside = !isInside;
      } else if (tile === "." && isInside) {
        insideTilesPerLine[y][x] = "I";
      }
    }
  }

  const insideTilesPerColumn = Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x) => (grid[y][x] === "X" ? "X" : "."))
  );

  for (let x = 0; x < WIDTH; x++) {
    let isInside = false;
    for (let y = 0; y < HEIGHT; y++) {
      const tile = grid[y][x];
      if (tile === "X") {
        isInside = !isInside;
      } else if (tile === "." && isInside) {
        insideTilesPerColumn[y][x] = "I";
      }
    }
  }

  const insideTilesGrid = Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x) =>
      insideTilesPerLine[y][x] === "I" && insideTilesPerColumn[y][x] === "I"
        ? "I"
        : grid[y][x]
    )
  );

  let insideTilesCount = 0;
  for (let x = 0; x < WIDTH; x++) {
    for (let y = 0; y < HEIGHT; y++) {
      if (insideTilesGrid[y][x] === "I") {
        insideTilesCount += 1;
      }
    }
  }
  return [insideTilesGrid, insideTilesCount];
};
const grid = await parseTextInput(true, 5);

const loopGrid = findLoopGrid(grid);

const [insideTilesGrid, insideTilesCount] = findInsideTiles(loopGrid);

console.log("\n\n");
prettyPrint(insideTilesGrid);
console.log("\n\n");
console.log("Result : ", insideTilesCount);

// const outsideTilesGrid = markOutsideTiles(loopGrid);

// prettyPrint(outsideTilesGrid);
