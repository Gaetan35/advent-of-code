import * as fs from "fs/promises";

const prettyPrint = (grid) => {
  console.log(grid.map((line) => line.join("")).join("\n"));
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

  for (let i = 0; i < stepsToReach; i++) {
    const positionsPerSquare = {};
    const newPositions = [];
    const occupiedPositions = new Set();
    // let countBeforeStep = positions.length;
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
    });

    for (const squareKey of Object.keys(positionsPerSquare)) {
      if (!reachedLoop[squareKey] && positionsPerSquare[squareKey] === 42) {
        reachedLoop[squareKey] = i;
      }
    }
    // console.log(`Step ${i}: `, reachedLoop);

    console.log(
      `Step ${i}:`,
      positionsPerSquare["0|0"],
      positions
        .filter(([x, y]) => x === WIDTH && y >= 0 && y < HEIGHT - 1)
        .map(([x, y]) => y)
        .join("-")
    );
  }
  return positions.length;
};

const [input, startPos] = await parseTextInput(true);

prettyPrint(input);
// console.log(startPos);

const reachableCellsCount = computeReachableCells(input, 20, startPos);
console.log("Result : ", reachableCellsCount);

// positions in first square alternate between 39 and 42 forever
// Real case: positions alternate between 7623 and 7558

/*
Going right:
Square 1 has something at step 8
Square 2 has something at step 21
Square 3 has something at step 32 -> starting from here the number repeats for every step
Square 4 has something at step 43
Square 5 has something at step 54

Going left
Square 1 has something at step 6
Square 2 has something at step 21
Square 3 has something at step 32 -> starting from here the number repeats for every step
Square 4 has something at step 43
Square 5 has something at step 54

Going up
Square 1 has something at step 8
Square 2 has something at step 21 -> starting from here the number repeats for every step
Square 3 has something at step 32 
Square 4 has something at step 43
Square 5 has something at step 54

Going down
Square 1 has something at step 7
Square 2 has something at step 21 -> starting from here the number repeats for every step
Square 3 has something at step 32 
Square 4 has something at step 43
Square 5 has something at step 54

Going up-left
Square 1 has something at step 11 -> starting from here the number repeats for every step
Square 2 has something at step 33 
Square 3 has something at step 55 
Square 4 has something at step 77
Square 5 has something at step 99

Going down-right
Square 1 has something at step 15 -> starting from here the number repeats for every step
Square 2 has something at step 37 
Square 3 has something at step 59 
Square 4 has something at step 81
Square 5 has something at step 99
*/
