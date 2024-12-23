import * as fs from "fs/promises";
import * as path from "path";

type Input = {
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
  grid: ("S" | "E" | "." | "#")[][];
};

type Node = {
  x: number;
  y: number;
  direction: string;
  score: number;
  turnsInPlace: number;
  path?: string[];
};

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  const grid = (await fs.readFile(filePath))
    .toString()
    .split("\n")
    .map((line) => line.split("")) as Input["grid"];

  let startPos = { x: null, y: null };
  let endPos = { x: null, y: null };
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === "E") {
        endPos.x = x;
        endPos.y = y;
      }

      if (grid[y][x] === "S") {
        startPos.x = x;
        startPos.y = y;
      }
    }
  }

  return { startPos, endPos, grid };
};

const DELTAS = {
  EAST: { dx: 1, dy: 0 },
  WEST: { dx: -1, dy: 0 },
  NORTH: { dx: 0, dy: -1 },
  SOUTH: { dx: 0, dy: 1 },
};

const LEFT_TURN = {
  EAST: "NORTH",
  WEST: "SOUTH",
  NORTH: "WEST",
  SOUTH: "EAST",
};
const RIGHT_TURN = {
  EAST: "SOUTH",
  WEST: "NORTH",
  NORTH: "EAST",
  SOUTH: "WEST",
};

const computeNeighbors = (grid: Input["grid"], node: Node) => {
  const { dx, dy } = DELTAS[node.direction];
  const neighbors: Node[] = [];
  if (grid[node.y + dy][node.x + dx] !== "#") {
    neighbors.push({
      x: node.x + dx,
      y: node.y + dy,
      direction: node.direction,
      score: node.score + 1,
      turnsInPlace: 0,
      ...(node.path && {
        path: [...node.path, `${node.x + dx}|${node.y + dy}`],
      }),
    });
  }

  if (node.turnsInPlace === 0) {
    for (const newDirection of [
      LEFT_TURN[node.direction],
      RIGHT_TURN[node.direction],
    ]) {
      const { dx: newDx, dy: newDy } = DELTAS[newDirection];
      if (grid[node.y + newDy][node.x + newDx] !== "#") {
        neighbors.push({
          x: node.x,
          y: node.y,
          direction: newDirection,
          score: node.score + 1000,
          turnsInPlace: node.turnsInPlace + 1,
          path: node.path,
        });
      }
    }
  }

  return neighbors;
};
function part1({ startPos, endPos, grid }: Input) {
  const visited = {};
  const nodes = [
    {
      x: startPos.x,
      y: startPos.y,
      direction: "EAST",
      score: 0,
      turnsInPlace: 0,
    },
  ];

  let iteration = 0;
  let minScore = Infinity;
  while (nodes.length) {
    iteration++;
    const node = nodes.pop();

    const key = `${node.x}|${node.y}|${node.direction}`;
    if (visited[key] <= node.score) {
      continue;
    }
    if (node.score > minScore) {
      continue;
    }
    visited[key] = node.score;

    if (node.x === endPos.x && node.y === endPos.y) {
      console.log("Found endPos: ", {
        direction: node.direction,
        score: node.score,
      });
      minScore = Math.min(minScore, node.score);
      continue;
    }

    const neighbors = computeNeighbors(grid, node);
    nodes.push(...neighbors);
  }
  return minScore;
}

function part2({ startPos, endPos, grid }: Input, bestScore = Infinity) {
  const visited = {};
  const nodes: Required<Node>[] = [
    {
      x: startPos.x,
      y: startPos.y,
      direction: "EAST",
      score: 0,
      turnsInPlace: 0,
      path: [`${startPos.x}|${startPos.y}`],
    },
  ];

  let iteration = 0;
  let minScore = bestScore;
  const nodesFromBestPath = new Set<string>();
  while (nodes.length) {
    iteration++;
    const node = nodes.pop();

    const key = `${node.x}|${node.y}|${node.direction}`;
    if (visited[key] < node.score) {
      continue;
    }
    if (node.score > minScore) {
      continue;
    }
    visited[key] = node.score;

    if (node.x === endPos.x && node.y === endPos.y) {
      console.log("Found endPos: ", {
        direction: node.direction,
        score: node.score,
      });
      node.path.forEach((pos) => {
        nodesFromBestPath.add(pos);
      });
      continue;
    }

    const neighbors = computeNeighbors(grid, node) as Required<Node>[];
    nodes.push(...neighbors);
  }
  return nodesFromBestPath.size;
}

async function main() {
  const IS_TEST = process.argv[2] === "test";
  const input = await parseTextInput(IS_TEST);

  const part1Result = part1(input);
  console.log("Part1 result: ", part1Result);

  const part2Result = part2(input, part1Result);
  console.log("Part2 result: ", part2Result);
}

main();
