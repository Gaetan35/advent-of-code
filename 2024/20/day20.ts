import * as fs from "fs/promises";
import * as path from "path";

type Input = {
  grid: string[][];
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
};

type Node = {
  x: number;
  y: number;
  picoseconds: number;
  cheatPos?: string | null;
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
    .map((line) => line.split(""));

  let startPos = null;
  let endPos = null;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === "S") {
        startPos = { x, y };
      } else if (grid[y][x] === "E") {
        endPos = { x, y };
      }
    }
  }

  return { startPos, endPos, grid };
};

const deltas = [
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
];

const computeNeighbors = (
  grid: Input["grid"],
  node: Node,
  visited: Set<string>,
  canUseCheat = false
) => {
  const neighbors = [];
  for (const { dx, dy } of deltas) {
    const newX = node.x + dx;
    const newY = node.y + dy;

    let key = `${newX}|${newY}`;
    if (canUseCheat) {
      key += `|${node.cheatPos}`;
    }

    if ([".", "E"].includes(grid[newY]?.[newX]) && !visited.has(key)) {
      neighbors.push({
        ...node,
        x: newX,
        y: newY,
        picoseconds: node.picoseconds + 1,
        ...(node.path !== undefined
          ? { path: [...node.path, `${node.x}|${node.y}`] }
          : {}),
      });
    }
  }

  if (canUseCheat && !node.cheatPos) {
    for (const { dx, dy } of deltas) {
      const newX = node.x + dx * 2;
      const newY = node.y + dy * 2;

      if (
        [".", "E"].includes(grid[newY]?.[newX]) &&
        !visited.has(`${newX}|${newY}|${node.cheatPos}`)
      ) {
        neighbors.push({
          ...node,
          x: newX,
          y: newY,
          picoseconds: node.picoseconds + 2,
          cheatPos: `${node.x}|${node.y}_to_${newX}|${newY}`,
        });
      }
    }
  }

  return neighbors;
};

const getNormalPathTime = ({ grid, startPos, endPos }: Input) => {
  const nodes = [{ ...startPos, picoseconds: 0, path: [] }];
  const visited = new Set<string>();
  let minPicoseconds = Infinity;
  while (nodes.length > 0) {
    const node = nodes.pop();

    const key = `${node.x}|${node.y}`;
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);

    if (node.picoseconds > minPicoseconds) {
      continue;
    }

    if (node.x === endPos.x && node.y === endPos.y) {
      const timeToEndWithoutCheats: Record<string, number> = {};
      for (let i = 1; i <= node.path.length; i++) {
        timeToEndWithoutCheats[node.path[node.path.length - i]] = i;
      }
      return { normalPathTime: node.picoseconds, timeToEndWithoutCheats };
    }

    nodes.push(...computeNeighbors(grid, node, visited));
  }

  throw Error("No path found");
};

function part1({ grid, startPos, endPos }: Input) {
  const { normalPathTime, timeToEndWithoutCheats } = getNormalPathTime({
    grid,
    startPos,
    endPos,
  });

  const nodes = [{ ...startPos, picoseconds: 0, cheatPos: null }];
  const visited = new Set<string>();
  const cheatsCount: Record<string, number> = {};
  while (nodes.length > 0) {
    const node = nodes.pop();

    const key = `${node.x}|${node.y}|${node.cheatPos}`;
    if (visited.has(key)) {
      continue;
    }
    visited.add(key);

    if (node.picoseconds >= normalPathTime) {
      continue;
    }

    if (
      node.cheatPos !== null &&
      timeToEndWithoutCheats[`${node.x}|${node.y}`] !== undefined
    ) {
      const timeSaved =
        normalPathTime -
        (node.picoseconds + timeToEndWithoutCheats[`${node.x}|${node.y}`]);

      if (timeSaved <= 0) {
        continue;
      }

      if (!cheatsCount[timeSaved]) {
        cheatsCount[timeSaved] = 0;
      }
      cheatsCount[timeSaved] += 1;
      continue;
    }

    if (node.x === endPos.x && node.y === endPos.y) {
      const timeSaved = normalPathTime - node.picoseconds;
      if (!cheatsCount[timeSaved]) {
        cheatsCount[timeSaved] = 0;
      }
      cheatsCount[timeSaved] += 1;
      continue;
    }

    nodes.push(...computeNeighbors(grid, node, visited, true));
  }

  console.log(cheatsCount);

  const MIN_TIME_SAVED = 100;

  return Object.entries(cheatsCount)
    .filter(([timeSaved, _]) => +timeSaved >= MIN_TIME_SAVED)
    .reduce((acc, [_, count]) => acc + count, 0);
}

function part2(input: Input) {
  return null;
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
