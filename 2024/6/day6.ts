import * as fs from "fs/promises";
import * as path from "path";

type Input = { startingPos: { x: number; y: number }; grid: string[][] };

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  const grid = (await fs.readFile(filePath))
    .toString()
    .split("\n")
    .map((line) => line.split(""));

  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === "^") {
        return { startingPos: { x, y }, grid };
      }
    }
  }
};

const turn = {
  ["UP"]: "RIGHT",
  ["RIGHT"]: "DOWN",
  ["DOWN"]: "LEFT",
  ["LEFT"]: "UP",
};
const deltas = {
  ["UP"]: { dx: 0, dy: -1 },
  ["RIGHT"]: { dx: 1, dy: 0 },
  ["DOWN"]: { dx: 0, dy: 1 },
  ["LEFT"]: { dx: -1, dy: 0 },
};

function part1({ startingPos, grid }: Input) {
  let direction = "UP";
  let { x: guardX, y: guardY } = startingPos;
  const visitedPos = {};

  while (
    guardX >= 0 &&
    guardX < grid[0].length &&
    guardY >= 0 &&
    guardY < grid.length
  ) {
    visitedPos[`${guardX}|${guardY}`] = true;

    const nextX = guardX + deltas[direction].dx;
    const nextY = guardY + deltas[direction].dy;
    if (grid?.[nextY]?.[nextX] === "#") {
      direction = turn[direction];
      continue;
    }

    guardX = nextX;
    guardY = nextY;
  }

  return Object.keys(visitedPos).length;
}

const getsStuckInLoop = ({ startingPos, grid }: Input) => {
  let direction = "UP";
  let { x: guardX, y: guardY } = startingPos;
  const visitedPos = {};
  let iteration = 0;
  while (
    guardX >= 0 &&
    guardX < grid[0].length &&
    guardY >= 0 &&
    guardY < grid.length
  ) {
    iteration++;
    const key = `${guardX}|${guardY}`;

    if (
      visitedPos[key]?.length > 2 &&
      iteration - visitedPos[key].at(-1) ===
        visitedPos[key].at(-1) - visitedPos[key].at(-2) // &&
      // iteration - visitedPos[key].at(-1) ===
      //   visitedPos[key].at(-2) - visitedPos[key].at(-3)
    ) {
      return true;
    }

    if (!visitedPos[key]) {
      visitedPos[key] = [];
    }
    visitedPos[key].push(iteration);

    const nextX = guardX + deltas[direction].dx;
    const nextY = guardY + deltas[direction].dy;
    if (grid?.[nextY]?.[nextX] === "#") {
      direction = turn[direction];
      continue;
    }

    guardX = nextX;
    guardY = nextY;
  }

  return false;
};

const getVisitedPos = ({ startingPos, grid }: Input) => {
  let direction = "UP";
  let { x: guardX, y: guardY } = startingPos;
  const visitedPos = {};

  while (
    guardX >= 0 &&
    guardX < grid[0].length &&
    guardY >= 0 &&
    guardY < grid.length
  ) {
    if (guardX !== startingPos.x || guardY !== startingPos.y) {
      visitedPos[`${guardX}|${guardY}`] = true;
    }

    const nextX = guardX + deltas[direction].dx;
    const nextY = guardY + deltas[direction].dy;
    if (grid?.[nextY]?.[nextX] === "#") {
      direction = turn[direction];
      continue;
    }

    guardX = nextX;
    guardY = nextY;
  }

  return Object.keys(visitedPos).map((key) => key.split("|").map(Number));
};

function part2({ startingPos, grid }: Input) {
  const positions = getVisitedPos({ startingPos, grid });
  // console.log({ positions, startingPos });
  let loopPositions = 0;
  for (const [x, y] of positions) {
    const copiedGrid = grid.map((row) => [...row]);
    copiedGrid[y][x] = "#";

    if (getsStuckInLoop({ startingPos, grid: copiedGrid })) {
      // console.log("Stuck in loop at: ", x, y);
      loopPositions++;
    }
  }
  return loopPositions;
}

async function main() {
  const IS_TEST = process.argv[2] === "test";
  const input = await parseTextInput(IS_TEST);

  const part1Result = part1(input);
  console.log("Part1 result: ", part1Result);

  const part2Result = part2(input);
  console.log("Part2 result: ", part2Result);
}

main();
