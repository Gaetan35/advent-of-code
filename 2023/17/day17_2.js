import * as fs from "fs/promises";
import { writeFileSync } from "fs";

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
  RIGHT: {
    true: [
      ["TOP", 0, -1],
      ["BOTTOM", 0, 1],
    ],
    false: [
      ["TOP", 0, -1],
      ["BOTTOM", 0, 1],
      ["RIGHT", 1, 0],
    ],
  },
  LEFT: {
    true: [
      ["TOP", 0, -1],
      ["BOTTOM", 0, 1],
    ],
    false: [
      ["LEFT", -1, 0],
      ["TOP", 0, -1],
      ["BOTTOM", 0, 1],
    ],
  },
  TOP: {
    true: [
      ["LEFT", -1, 0],
      ["RIGHT", 1, 0],
    ],
    false: [
      ["LEFT", -1, 0],
      ["TOP", 0, -1],
      ["RIGHT", 1, 0],
    ],
  },
  BOTTOM: {
    true: [
      ["LEFT", -1, 0],
      ["RIGHT", 1, 0],
    ],
    false: [
      ["LEFT", -1, 0],
      ["BOTTOM", 0, 1],
      ["RIGHT", 1, 0],
    ],
  },
  START: {
    false: [
      ["BOTTOM", 0, 1],
      ["RIGHT", 1, 0],
    ],
  },
};
const computeNeighbors = (grid, [x, y], lastDirections, heatLoss) => {
  const areSameThreeLastDirections =
    lastDirections.length === 3 &&
    (lastDirections[0] === lastDirections[1] ||
      lastDirections[0] === "START") &&
    lastDirections[1] === lastDirections[2];

  const neighbors = [];
  for (const [direction, dx, dy] of deltasForLastDirection[
    lastDirections.at(-1)
  ][areSameThreeLastDirections]) {
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
    (lastDirections[0] === lastDirections[1] ||
      lastDirections[0] === "START") &&
    lastDirections[1] === lastDirections[2];

  const areSameTwoLastDirections =
    lastDirections.length >= 2 &&
    (lastDirections[0] === lastDirections[1] || lastDirections[0] === "START");

  return `${x}|${y}|${lastDirections.at(
    -1
  )}|3${areSameThreeLastDirections}|2${areSameTwoLastDirections}`;
};

const findMinHeatLoss = (grid, minHeatLossRemainingGrid) => {
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;
  const cache = {};
  let minHeatLoss = 965;
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
    if (i % 1000000 === 0) {
      console.log(`${i}: ${nodes.length} nodes`);
    }
    const {
      pos: [x, y],
      lastDirections,
      heatLoss,
    } = nodes.pop();

    if (x === WIDTH - 1 && y === HEIGHT - 1) {
      if (heatLoss < minHeatLoss) {
        // console.log("\nFound new min value: ", heatLoss, "\n");
        minHeatLoss = heatLoss;
      }
      continue;
    }

    const cacheKey = getCacheKey(x, y, lastDirections);

    // const cacheKeyFalse = getCacheKey(x, y, lastDirections.at(-1), false);

    if (cache[cacheKey] !== undefined && cache[cacheKey] < heatLoss) {
      continue;
    }
    cache[cacheKey] = heatLoss;

    if (heatLoss + minHeatLossRemainingGrid[y][x] > minHeatLoss) {
      continue;
    }

    nodes.push(
      ...computeNeighbors(grid, [x, y], lastDirections, heatLoss).filter(
        (neighbor) => {
          const cacheKey = getCacheKey(
            neighbor.pos[0],
            neighbor.pos[1],
            neighbor.lastDirections
          );
          return cache[cacheKey] === undefined || heatLoss < cache[cacheKey];
        }
      )
    );
  }
  console.log(i);

  return minHeatLoss;
};

const computeMinHeatLossRemainingGrid = (grid) => {
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;

  const minHeatLossRemainingGrid = Array.from({ length: HEIGHT }, () =>
    Array.from({ length: WIDTH }, () => (HEIGHT + WIDTH) * 1000)
  );

  // TODO: going back should not be allowed maybe
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
    if (i % 10000000 === 0) {
      console.log(`${i}: ${nodes.length} nodes`);
    }
    const {
      pos: [x, y],
      heatLoss,
    } = nodes.pop();

    if (heatLoss >= minHeatLossRemainingGrid[y][x]) {
      continue;
    }

    minHeatLossRemainingGrid[y][x] = heatLoss;

    for (const [dx, dy] of deltas) {
      const newX = x + dx;
      const newY = y + dy;
      const newHeatLoss = heatLoss + grid[y][x];
      if (
        grid[newY]?.[newX] !== undefined &&
        newHeatLoss < minHeatLossRemainingGrid[newY][newX]
      ) {
        nodes.push({
          pos: [newX, newY],
          heatLoss: heatLoss + grid[y][x],
        });
      }
    }
  }
  console.log(nodes);
  return minHeatLossRemainingGrid;
};

const input = await parseTextInput(false);

// console.log("Computing grid ...");
// const minHeatLossRemainingGrid = computeMinHeatLossRemainingGrid(input);

// prettyPrint(minHeatLossRemainingGrid);
// writeFileSync("grid.json", JSON.stringify(minHeatLossRemainingGrid));

const minHeatLossRemainingGrid = JSON.parse(
  (await fs.readFile("gridReal.json")).toString()
);

console.time();
const minHeatLoss = findMinHeatLoss(input, minHeatLossRemainingGrid);
console.timeEnd();

console.log("Min heat loss: ", minHeatLoss);
