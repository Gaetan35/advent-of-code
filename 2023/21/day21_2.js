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

  const reachedLoop = {};
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
    let countBeforeStep = positions.length;
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

    for (const squareKey of Object.keys(positionsPerSquare)) {
      if (!reachedLoop[squareKey] && positionsPerSquare[squareKey] === 7623) {
        reachedLoop[squareKey] = i;
      }
    }

    // console.log(`Step ${i}: `, { left, up, right, down });
    // console.log(`Step ${i}: `, positions.length - countBeforeStep);
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
  // console.log(reachedInsideSquare);
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
  // const loopReachedGrid = Array.from({ length: 11 }, (_, y) =>
  //   Array.from({ length: 11 }, (_, x) =>
  //     (reachedLoop[`${x - OFFSET}|${y - OFFSET}`] || "   ")
  //       .toString()
  //       .padStart(3, "0")
  //   )
  // );
  // prettyPrint(loopReachedGrid);
  // console.log("\n");

  // const notInLoopsGrid = Array.from(
  //   { length: loopReachedGrid.length },
  //   (_, y) =>
  //     Array.from({ length: loopReachedGrid[0].length }, (_, x) =>
  //       firstReachedGrid[y][x] !== "   " && loopReachedGrid[y][x] === "   "
  //         ? firstReachedGrid[y][x]
  //         : "   "
  //     )
  // );
  // prettyPrint(notInLoopsGrid);
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
  const i = stepsToReach - 1;
  const size = Math.floor((i - 129) / 131);
  console.log({ size });
  const loopCycle = [7623, 7558];
  let oddLoops = 1;
  let evenLoops = 0;
  for (let sizeIndex = 1; sizeIndex <= size; sizeIndex++) {
    if (sizeIndex % 2 === 1) {
      evenLoops += sizeIndex * 4;
    } else {
      oddLoops += sizeIndex * 4;
    }
  }
  console.log({ oddLoops, evenLoops });
  const loopsSum =
    oddLoops * loopCycle[(i + 1) % 2] + evenLoops * loopCycle[i % 2];
  console.log({ loopsSum });

  const lineSize = Math.floor((i - 65) / 131) + 1;
  const n = Math.floor(i / 131);
  const diagonalSize = (n * (n + 1)) / 2;
  console.log({ lineSize, diagonalSize });
  return positions.length;
};

const computePositionsCount = (stepsToReach) => {
  const i = stepsToReach - 1;
  const size = Math.floor((i - 129) / 131);
  console.log({ size });
  const loopCycle = [7623, 7558];
  let oddLoops = 1;
  let evenLoops = 0;
  for (let sizeIndex = 1; sizeIndex <= size; sizeIndex++) {
    if (sizeIndex % 2 === 1) {
      evenLoops += sizeIndex * 4;
    } else {
      oddLoops += sizeIndex * 4;
    }
  }
  console.log({ oddLoops, evenLoops });
  const loopsSum =
    oddLoops * loopCycle[(i + 1) % 2] + evenLoops * loopCycle[i % 2];
  console.log({ loopsSum });

  const lineSize = Math.floor((i - 65) / 131) + 1;
  const n = Math.floor(i / 131);
  const diagonalSize = (n * (n + 1)) / 2;
  console.log({ lineSize, diagonalSize });
};

const [input, startPos] = await parseTextInput(false);

// prettyPrint(input);
// console.log(startPos);

// const reachableCellsCount = computeReachableCells(input, 430, startPos);
// console.log("Result : ", reachableCellsCount);

// positions in first square alternate between 39 and 42 forever
// Real case: positions alternate between 7623 and 7558
