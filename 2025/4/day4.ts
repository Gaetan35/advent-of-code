import * as fs from "fs/promises";
import * as path from "path";

type Input = ("." | "@")[][];

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  return (await fs.readFile(filePath))
    .toString()
    .split("\n")
    .map((line) => line.split("") as ("." | "@")[]);
};

const isRollAccessible = ({
  grid,
  x,
  y,
}: {
  grid: Input;
  x: number;
  y: number;
}) => {
  const deltas = [
    { dx: -1, dy: -1 },
    { dx: -1, dy: 0 },
    { dx: -1, dy: 1 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 1, dy: 1 },
  ];

  let adjacentRolls = 0;
  for (const { dx, dy } of deltas) {
    if (grid?.[y + dy]?.[x + dx] === "@") {
      adjacentRolls += 1;
    }
    if (adjacentRolls >= 4) {
      break;
    }
  }

  return adjacentRolls < 4;
};

function part1(input: Input) {
  let accessibleRolls = 0;

  for (let y = 0; y < input.length; y += 1) {
    for (let x = 0; x < input[0].length; x += 1) {
      if (input[y][x] === "@" && isRollAccessible({ grid: input, x, y })) {
        accessibleRolls += 1;
      }
    }
  }
  return accessibleRolls;
}

const removeAccessibleRolls = (grid: Input) => {
  let removedCount = 0;

  const WIDTH = grid[0].length;
  const HEIGHT = grid.length;

  const newGrid = Array.from({ length: HEIGHT }, (_, i) =>
    Array.from({ length: WIDTH }, (_, j) => grid[i][j])
  );

  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      if (grid[y][x] === "@" && isRollAccessible({ grid, x, y })) {
        newGrid[y][x] = ".";
        removedCount += 1;
      }
    }
  }

  return { removedCount, newGrid };
};

function part2(input: Input) {
  let grid = input;
  let result = 0;

  let removedCountThisRound = 0;
  do {
    const { removedCount, newGrid } = removeAccessibleRolls(grid);
    removedCountThisRound = removedCount;
    grid = newGrid;
    result += removedCountThisRound;
  } while (removedCountThisRound > 0);

  return result;
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
