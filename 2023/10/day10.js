import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const grid = (await fs.readFile(isTest ? "input_test1.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => line.split(""));

  return grid;
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
  return startNeighbors;
};

const findFurthestTile = (grid) => {
  const NON_VISITED_TILE = ".";
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;

  const startPos = findStartPos(grid);
  const queue = [startPos];
  const distancesFromStart = Array.from({ length: HEIGHT }, () =>
    Array.from({ length: WIDTH }, () => NON_VISITED_TILE)
  );
  distancesFromStart[startPos.y][startPos.x] = 0;
  let maxDistanceFromStart = 0;
  while (queue.length > 0) {
    const currentPos = queue.shift();

    const neighbors = findNeighbors(grid, currentPos);

    neighbors.forEach(({ x: neighborX, y: neighborY }) => {
      if (distancesFromStart[neighborY][neighborX] === NON_VISITED_TILE) {
        const distanceFromStart =
          distancesFromStart[currentPos.y][currentPos.x] + 1;
        distancesFromStart[neighborY][neighborX] = distanceFromStart;

        if (distanceFromStart > maxDistanceFromStart) {
          maxDistanceFromStart = distanceFromStart;
        }

        queue.push({ x: neighborX, y: neighborY });
      }
    });
  }
  console.log("\n");
  console.log(distancesFromStart.map((line) => line.join("")).join("\n"));
  console.log("\n");

  return maxDistanceFromStart;
};

const grid = await parseTextInput(false);

const result = findFurthestTile(grid);
console.log("Result: ", result);
