import * as fs from "fs/promises";
import * as path from "path";

type Input = {
  grid: number[][];
  trailHeads: { x: number; y: number; trailHead: string }[];
};

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  const grid = (await fs.readFile(filePath))
    .toString()
    .split("\n")
    .map((line) => line.split("").map(Number));

  const trailHeads = [];
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === 0) {
        trailHeads.push({ x, y, trailHead: `${x}|${y}` });
      }
    }
  }

  return { grid, trailHeads };
};

const computeNeighbors = (
  x: number,
  y: number,
  trailHead: string,
  grid: number[][]
) => {
  const currentHeight = grid[y][x];
  const deltas = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];
  const neighbors = [];
  for (const [dx, dy] of deltas) {
    if (grid?.[y + dy]?.[x + dx] === currentHeight + 1) {
      neighbors.push({ x: x + dx, y: y + dy, trailHead });
    }
  }
  return neighbors;
};

function part1({ grid, trailHeads }: Input) {
  const nodes = [...trailHeads];
  let score = 0;
  const trailHeadsScores = {};
  while (nodes.length > 0) {
    const { x, y, trailHead } = nodes.pop();

    if (grid[y][x] === 9) {
      if (trailHeadsScores[trailHead]?.includes(`${x}|${y}`)) {
        // Already reached this end before
        continue;
      }

      if (!trailHeadsScores[trailHead]) {
        trailHeadsScores[trailHead] = [];
      }
      trailHeadsScores[trailHead].push(`${x}|${y}`);
      score++;
      continue;
    }

    const neighbors = computeNeighbors(x, y, trailHead, grid);
    nodes.push(...neighbors);
  }
  return score;
}

function part2({ grid, trailHeads }: Input) {
  const nodes = [...trailHeads];
  let score = 0;
  while (nodes.length > 0) {
    const { x, y, trailHead } = nodes.pop();

    if (grid[y][x] === 9) {
      score++;
      continue;
    }

    const neighbors = computeNeighbors(x, y, trailHead, grid);
    nodes.push(...neighbors);
  }
  return score;
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
