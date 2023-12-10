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
  loopGrid[startPos.y][startPos.x] = "S";
  while (queue.length > 0) {
    const currentPos = queue.shift();

    const neighbors = findNeighbors(grid, currentPos);

    neighbors.forEach(({ x: neighborX, y: neighborY }) => {
      if (loopGrid[neighborY][neighborX] === NON_VISITED_TILE) {
        loopGrid[neighborY][neighborX] = grid[neighborY][neighborX];

        queue.push({ x: neighborX, y: neighborY });
      }
    });
  }

  loopGrid.forEach((line) => {
    line.unshift(NON_VISITED_TILE);
    line.push(NON_VISITED_TILE);
  });
  loopGrid.unshift(Array.from({ length: WIDTH + 2 }, () => NON_VISITED_TILE));
  loopGrid.push(Array.from({ length: WIDTH + 2 }, () => NON_VISITED_TILE));

  return loopGrid;
};

const computedEnlargeGrid = (grid) => {
  const NEW_HEIGHT = 2 * grid.length;
  const NEW_WIDTH = 2 * grid[0].length;
  const newGrid = Array.from({ length: NEW_HEIGHT }, (_, y) =>
    Array.from({ length: NEW_WIDTH }, (_, x) => {
      if (x % 2 === 0 && y % 2 === 0) {
        return grid[y / 2][x / 2];
      }
      if (x === 0 || y === 0 || y === NEW_HEIGHT - 1 || x === NEW_WIDTH - 1) {
        return ".";
      }
      if (x % 2 === 1 && y % 2 === 1) {
        return ".";
      }
      if (x % 2 === 1) {
        const leftTile = grid[y / 2][Math.floor(x / 2)];
        const rightTile = grid[y / 2][Math.floor(x / 2) + 1];
        if (
          ["S", "F", "L", "-"].includes(leftTile) &&
          ["S", "7", "J", "-"].includes(rightTile)
        ) {
          return "-";
        }
      }
      if (y % 2 === 1) {
        const topTile = grid[Math.floor(y / 2)][x / 2];
        const bottomTile = grid[Math.floor(y / 2) + 1][x / 2];
        if (
          ["S", "F", "7", "|"].includes(topTile) &&
          ["S", "L", "J", "|"].includes(bottomTile)
        ) {
          return "|";
        }
      }
      return ".";
    })
  );
  return newGrid;
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
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;

  const outsideTilesGrid = Array.from({ length: HEIGHT }, (_, y) =>
    Array.from({ length: WIDTH }, (_, x) => grid[y][x])
  );

  const stack = [{ x: 0, y: 0 }];
  while (stack.length !== 0) {
    const node = stack.pop();
    const neighbors = findAdjacentTiles(grid, node);
    neighbors.forEach(({ x, y }) => {
      if (outsideTilesGrid[y][x] === ".") {
        outsideTilesGrid[y][x] = "O";
        stack.push({ x, y });
      }
    });
  }
  return outsideTilesGrid;
};

const reduceGridAndCount = (grid) => {
  const NEW_HEIGHT = grid.length / 2;
  const NEW_WIDTH = grid[0].length / 2;

  let count = 0;
  const reducedGrid = Array.from({ length: NEW_HEIGHT }, (_, y) =>
    Array.from({ length: NEW_WIDTH }, (_, x) => {
      const tile = grid[y * 2][x * 2];
      if (tile === ".") {
        count += 1;
        return "I";
      }
      return tile;
    })
  );

  return [count, reducedGrid];
};

const grid = await parseTextInput(false, 4);

const loopGrid = findLoopGrid(grid);

const enlargedGrid = computedEnlargeGrid(loopGrid);

const markedOutsideGrid = markOutsideTiles(enlargedGrid);

const [count, reducedGrid] = reduceGridAndCount(markedOutsideGrid);

console.log("\n\n");
prettyPrint(reducedGrid);
console.log("\n\n");
console.log("Inside tiles: ", count);
