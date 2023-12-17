import { writeFileSync } from "fs";
import * as fs from "fs/promises";

const prettyPrint = (grid) => {
  console.log(grid.map((line) => line.join("|")).join("\n"));
};

const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => line.split("").map(Number));

  return input;
};

const deltasForLastDirection = {
  RIGHT: [
    ["RIGHT", 1, 0],
    ["BOTTOM", 0, 1],
    ["TOP", 0, -1],
  ],
  LEFT: [
    ["BOTTOM", 0, 1],
    ["LEFT", -1, 0],
    ["TOP", 0, -1],
  ],
  TOP: [
    ["RIGHT", 1, 0],
    ["LEFT", -1, 0],
    ["TOP", 0, -1],
  ],
  BOTTOM: [
    ["RIGHT", 1, 0],
    ["BOTTOM", 0, 1],
    ["LEFT", -1, 0],
  ],
  START: [
    ["RIGHT", 1, 0],
    ["BOTTOM", 0, 1],
  ],
};
const computeNeighbors = (grid, [x, y], lastDirections, heatLoss) => {
  let deltas = deltasForLastDirection[lastDirections.at(-1)];
  if (
    lastDirections.length === 3 &&
    lastDirections[0] === lastDirections[1] &&
    lastDirections[1] === lastDirections[2]
  ) {
    deltas = deltas.filter(([direction]) => direction !== lastDirections[0]);
  }
  const neighbors = [];
  for (const [direction, dx, dy] of deltas) {
    const newX = x + dx;
    const newY = y + dy;
    if (grid[newY]?.[newX] !== undefined) {
      neighbors.push({
        pos: [newX, newY],
        lastDirections: [...lastDirections, direction].slice(-3),
        heatLoss: heatLoss + grid[newY][newX],
      });
    }
  }
  return neighbors;
};

const getCacheKey = (x, y, lastDirections) => {
  const areSameThreeLastDirections =
    lastDirections.length === 3 &&
    lastDirections[0] === lastDirections[1] &&
    lastDirections[1] === lastDirections[2];
  return `${x}|${y}|${lastDirections.at(-1)}|${areSameThreeLastDirections}`;
};

const findMinHeatLoss = (grid, minHeatLossRemainingGrid) => {
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;

  const cache = {};

  // 965 is best path found yet
  let minHeatLoss = 966;
  console.log("Starting with minHeatLoss: ", minHeatLoss);
  const nodes = [
    {
      pos: [0, 0],
      lastDirections: ["START"],
      heatLoss: 0,
    },
  ];
  let i = 0;
  while (nodes.length > 0) {
    i += 1;
    if (i % 10000000 === 0) {
      console.log(`${i}: ${nodes.length} nodes`);
    }
    const {
      pos: [x, y],
      lastDirections,
      heatLoss,
    } = nodes.pop();

    const cacheKey = getCacheKey(x, y, lastDirections);

    if (cache[cacheKey] !== undefined && cache[cacheKey] < heatLoss) {
      continue;
    }
    cache[cacheKey] = heatLoss;

    if (x === WIDTH - 1 && y === HEIGHT - 1) {
      if (minHeatLoss === null || heatLoss < minHeatLoss) {
        // console.log("\nFound new min value: ", heatLoss, "\n");
        minHeatLoss = heatLoss;
      }
      continue;
    }

    if (heatLoss + minHeatLossRemainingGrid[y][x] > minHeatLoss) {
      continue;
    }

    nodes.push(...computeNeighbors(grid, [x, y], lastDirections, heatLoss));
  }

  return minHeatLoss;
};

const computeMinHeatLossRemainingGrid = (grid) => {
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;

  const minHeatLossRemainingGrid = Array.from({ length: HEIGHT }, () =>
    Array.from({ length: WIDTH }, () => (HEIGHT + WIDTH) * 1000)
  );

  const deltas = [
    [-1, 0],
    [0, -1],
    [1, 0],
    [0, 1],
  ];

  const nodes = [{ pos: [WIDTH - 1, HEIGHT - 1], heatLoss: 0 }];
  let i = 0;
  while (nodes.length > 0) {
    i += 1;
    if (i % 100000000 === 0) {
      console.log(`${i}: ${nodes.length} nodes`);
    }
    const {
      pos: [x, y],
      heatLoss,
    } = nodes.pop();

    if (heatLoss > minHeatLossRemainingGrid[y][x]) {
      continue;
    }

    minHeatLossRemainingGrid[y][x] = heatLoss;

    for (const [dx, dy] of deltas) {
      const newX = x + dx;
      const newY = y + dy;
      if (grid[newY]?.[newX] !== undefined) {
        nodes.push({
          pos: [newX, newY],
          heatLoss: heatLoss + grid[y][x],
        });
      }
    }
  }
  return minHeatLossRemainingGrid;
};

const input = await parseTextInput(false);
console.log("Computing grid ...");
const minHeatLossRemainingGrid = computeMinHeatLossRemainingGrid(input);

writeFileSync("grid.json", JSON.stringify(minHeatLossRemainingGrid));

// prettyPrint(minHeatLossRemainingGrid);

// console.time();
// const minHeatLoss = findMinHeatLoss(input, minHeatLossRemainingGrid);
// console.timeEnd();
// console.log("Min heat loss: ", minHeatLoss);

// 968 is too high
// 965 is too high
