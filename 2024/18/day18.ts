import * as fs from "fs/promises";
import * as path from "path";

type Input = { x: number; y: number }[];

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  return (await fs.readFile(filePath))
    .toString()
    .split("\n")
    .map((line) => {
      const [x, y] = line.split(",").map(Number);
      return { x, y };
    });
};

const deltas = [
  { dx: 0, dy: 1 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: -1 },
  { dx: -1, dy: 0 },
];

const computeNeighbors = (
  grid: string[][],
  { x, y, distance }: { x: number; y: number; distance: number }
) => {
  const neighbors = [];
  for (const { dx, dy } of deltas) {
    if (grid[y + dy]?.[x + dx] === ".") {
      neighbors.push({ x: x + dx, y: y + dy, distance: distance + 1 });
    }
  }
  return neighbors;
};

const prettyPrint = (grid: unknown[][]) => {
  console.log(grid.map((line) => line.join("")).join("\n"));
  console.log("\n");
};

function part1(bytes: Input, gridSize: number) {
  const grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => ".")
  );

  for (const { x, y } of bytes) {
    grid[y][x] = "#";
  }

  const nodes = [{ x: 0, y: 0, distance: 0 }];
  const visited: Record<string, boolean> = {};
  let minDistance = Infinity;
  while (nodes.length) {
    const node = nodes.shift();
    if (visited[`${node.x}|${node.y}`]) {
      continue;
    }
    visited[`${node.x}|${node.y}`] = true;

    if (node.distance >= minDistance) {
      continue;
    }

    if (node.x === gridSize - 1 && node.y === gridSize - 1) {
      minDistance = Math.min(minDistance, node.distance);
      continue;
    }

    nodes.push(...computeNeighbors(grid, node));
  }
  return minDistance;
}

function part2(input: Input) {
  return null;
}

async function main() {
  const IS_TEST = process.argv[2] === "test";
  const input = await parseTextInput(IS_TEST);

  const byteNumber = IS_TEST ? 12 : 1024;
  const part1Result = part1(input.slice(0, byteNumber), IS_TEST ? 7 : 71);
  console.log("Part1 result: ", part1Result);

  const part2Result = part2(input);
  console.log("Part2 result: ", part2Result);
}

main();
