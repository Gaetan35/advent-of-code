import * as fs from "fs/promises";
import { writeFileSync } from "fs";

const prettyPrint = (grid) => {
  console.log(grid.map((line) => line.join("|")).join("\n"));
};

const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => line.split(""));

  for (let y = 0; y < input.length; y++) {
    for (let x = 0; x < input.length; x++) {
      if (input[y][x] === "S") {
        input[y][x] = ".";
        return [input, [x, y]];
      }
    }
  }
};

const DELTAS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

const positiveModulo = (n, m) => ((n % m) + m) % m;

const computeNeighbors = (grid, x, y) => {
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;

  const neighbors = [];
  for (const [dx, dy] of DELTAS) {
    if (
      grid[positiveModulo(y + dy, HEIGHT)][positiveModulo(x + dx, WIDTH)] ===
      "."
    ) {
      neighbors.push([x + dx, y + dy]);
    }
  }
  return neighbors;
};

const computeReachableCells = (grid, stepsToReach, startPos) => {
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;
  let positions = [startPos];

  const reachedInsideSquare = {};

  const topCycle = [];
  const bottomCycle = [];
  const rightCycle = [];
  const leftCycle = [];
  const topLeftCycle = [];
  const topRightCycle = [];
  const bottomLeftCycle = [];
  const bottomRightCycle = [];

  for (let i = 0; i < stepsToReach; i++) {
    const positionsPerSquare = {};
    const newPositions = [];
    const occupiedPositions = new Set();
    for (const [x, y] of positions) {
      const neighbors = computeNeighbors(grid, x, y).filter(
        ([neighborX, neighborY]) => {
          const isOccupiedPosition = occupiedPositions.has(
            `${neighborX}|${neighborY}`
          );
          if (isOccupiedPosition) {
            return false;
          }
          occupiedPositions.add(`${neighborX}|${neighborY}`);
          return true;
        }
      );
      newPositions.push(...neighbors);
    }
    positions = newPositions;
    positions.forEach(([x, y]) => {
      const squareX = Math.floor(x / WIDTH);
      const squareY = Math.floor(y / HEIGHT);
      const key = `${squareX}|${squareY}`;
      if (!positionsPerSquare[key]) {
        positionsPerSquare[key] = 1;
      } else {
        positionsPerSquare[key] += 1;
      }
      if (reachedInsideSquare[key] === undefined) {
        reachedInsideSquare[key] = i;
      }
    });

    if (
      positionsPerSquare["0|-1"] !== undefined &&
      ![7623, 7558].includes(positionsPerSquare["0|-1"])
    ) {
      topCycle.push(positionsPerSquare["0|-1"]);
    }
    if (
      positionsPerSquare["-1|0"] !== undefined &&
      ![7623, 7558].includes(positionsPerSquare["-1|0"])
    ) {
      leftCycle.push(positionsPerSquare["-1|0"]);
    }
    if (
      positionsPerSquare["1|0"] !== undefined &&
      ![7623, 7558].includes(positionsPerSquare["1|0"])
    ) {
      rightCycle.push(positionsPerSquare["1|0"]);
    }
    if (
      positionsPerSquare["0|1"] !== undefined &&
      ![7623, 7558].includes(positionsPerSquare["0|1"])
    ) {
      bottomCycle.push(positionsPerSquare["0|1"]);
    }

    if (
      positionsPerSquare["-1|-1"] !== undefined &&
      ![7623, 7558].includes(positionsPerSquare["-1|-1"])
    ) {
      topLeftCycle.push(positionsPerSquare["-1|-1"]);
    }
    if (
      positionsPerSquare["1|-1"] !== undefined &&
      ![7623, 7558].includes(positionsPerSquare["1|-1"])
    ) {
      topRightCycle.push(positionsPerSquare["1|-1"]);
    }
    if (
      positionsPerSquare["-1|1"] !== undefined &&
      ![7623, 7558].includes(positionsPerSquare["-1|1"])
    ) {
      bottomLeftCycle.push(positionsPerSquare["-1|1"]);
    }
    if (
      positionsPerSquare["1|1"] !== undefined &&
      ![7623, 7558].includes(positionsPerSquare["1|1"])
    ) {
      bottomRightCycle.push(positionsPerSquare["1|1"]);
    }

    console.log(
      `Step ${i}:`
      // positionsPerSquare["0|-1"]
      // positionsPerSquare["2|-1"],
      // positionsPerSquare["1|-2"],
      // positionsPerSquare["3|-1"],
      // positionsPerSquare["2|-2"],
      // positionsPerSquare["1|-3"]
    );
  }

  const OFFSET = 5;
  const firstReachedGrid = Array.from({ length: 11 }, (_, y) =>
    Array.from({ length: 11 }, (_, x) =>
      (reachedInsideSquare[`${x - OFFSET}|${y - OFFSET}`] || "   ")
        .toString()
        .padStart(3, "0")
    )
  );
  prettyPrint(firstReachedGrid);
  console.log("\n");

  // writeFileSync(
  //   "topCycle.json",
  //   JSON.stringify({
  //     topCycle,
  //     rightCycle,
  //     bottomCycle,
  //     leftCycle,
  //     topLeftCycle,
  //     topRightCycle,
  //     bottomLeftCycle,
  //     bottomRightCycle,
  //   })
  // );

  return positions.length;
};

const computePositionsCount = async (stepsToReach) => {
  const {
    leftCycle,
    rightCycle,
    bottomCycle,
    topCycle,
    topLeftCycle,
    topRightCycle,
    bottomLeftCycle,
    bottomRightCycle,
  } = JSON.parse((await fs.readFile("computedCycles.json")).toString());

  console.log({
    leftCycle: leftCycle.length,
    rightCycle: rightCycle.length,
    bottomCycle: bottomCycle.length,
    topCycle: topCycle.length,
    topLeftCycle: topLeftCycle.length,
    topRightCycle: topRightCycle.length,
    bottomLeftCycle: bottomLeftCycle.length,
    bottomRightCycle: bottomRightCycle.length,
  });
  const loopCycle = [7558, 7623];

  const i = stepsToReach - 1;

  const lineSize = Math.floor((i - 65) / 131) + 1;
  const n = Math.floor(i / 131);
  const diagonalSize = (n * (n + 1)) / 2;
  console.log({ lineSize, diagonalSize });

  let positionsCount = 0;
  let index = 65;
  while (index < i) {
    const difference = i - index;
    for (const cycle of [topCycle, leftCycle, rightCycle, bottomCycle]) {
      if (difference < cycle.length) {
        positionsCount += cycle[difference];
      } else {
        positionsCount += loopCycle[(difference - cycle.length) % 2];
      }
    }
    index += 131;
  }

  index = 131;
  let factor = 1;
  while (index < i) {
    const difference = i - index;
    for (const cycle of [
      topLeftCycle,
      topRightCycle,
      bottomLeftCycle,
      bottomRightCycle,
    ]) {
      if (difference < cycle.length) {
        positionsCount += factor * cycle[difference];
      } else {
        positionsCount += factor * loopCycle[(difference - cycle.length) % 2];
      }
    }
    index += 131;
    factor += 1;
  }
  return positionsCount + loopCycle[i % 2];
};

const [input, startPos] = await parseTextInput(false);

const reachableCellsCount = computeReachableCells(input, 315, startPos);
console.log("Result : ", reachableCellsCount);

const result = await computePositionsCount(26501365);
console.log("Efficient result : ", result);

// Explanations: we can find some cycles that simplify things
// By "square" I mean one occurrence of the map (square 0|0 is the original map, square 1|0 is the map on the right of the original one...)
// In my real text input:
//  - after a certain point, positions in the same square alternate between 7623 and 7558
//  - all squares in the same line (center to top, center to right, center to left, center to bottom) follow exactly the same cycle of evolution
//  - all square on the same quadrant (top-right, top-left, bottom-right, bottom-left) follow exactly the same cycle of evolution
