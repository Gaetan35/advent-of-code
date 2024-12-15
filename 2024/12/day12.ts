import * as fs from "fs/promises";
import * as path from "path";

type Input = string[][];

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  return (await fs.readFile(filePath))
    .toString()
    .split("\n")
    .map((line) => line.split(""));
};

const findRegionPart1 = (
  grid: Input,
  visitedNodes: Record<string, boolean>,
  startX: number,
  startY: number
) => {
  const nodes = [{ x: startX, y: startY }];
  const deltas = [
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
  ];
  const letter = grid[startY][startX];
  let area = 0;
  let perimeter = 0;
  while (nodes.length) {
    const { x, y } = nodes.pop();
    if (visitedNodes[`${x}|${y}`]) {
      continue;
    }
    visitedNodes[`${x}|${y}`] = true;
    area++;

    for (const delta of deltas) {
      const newX = x + delta.dx;
      const newY = y + delta.dy;

      if (grid?.[newY]?.[newX] === letter) {
        nodes.push({ x: newX, y: newY });
      }

      if (grid?.[newY]?.[newX] !== letter) {
        perimeter += 1;
      }
    }
  }

  return { area, perimeter, letter };
};

function part1(grid: Input) {
  const visitedNodes = {};
  const regions = [];
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      if (visitedNodes[`${x}|${y}`]) {
        continue;
      }

      const region = findRegionPart1(grid, visitedNodes, x, y);
      regions.push(region);
    }
  }
  return regions.reduce(
    (acc, region) => acc + region.area * region.perimeter,
    0
  );
}

const findRegionPart2 = (
  grid: Input,
  visitedNodes: Record<string, boolean>,
  startX: number,
  startY: number
) => {
  const nodes = [{ x: startX, y: startY }];
  const deltas = [
    { dx: 1, dy: 0, type: "right" },
    { dx: -1, dy: 0, type: "left" },
    { dx: 0, dy: 1, type: "down" },
    { dx: 0, dy: -1, type: "up" },
  ];
  const letter = grid[startY][startX];
  let area = 0;
  const perimeters = [];
  let perimeter = 0;
  while (nodes.length) {
    const { x, y } = nodes.pop();
    if (visitedNodes[`${x}|${y}`]) {
      continue;
    }
    visitedNodes[`${x}|${y}`] = true;
    area++;

    for (const delta of deltas) {
      const newX = x + delta.dx;
      const newY = y + delta.dy;

      if (grid?.[newY]?.[newX] === letter) {
        nodes.push({ x: newX, y: newY });
      }

      if (grid?.[newY]?.[newX] !== letter) {
        perimeters.push({
          x: x + 0.5 * delta.dx,
          y: y + 0.5 * delta.dy,
          type: delta.type,
        });
        perimeter += 1;
      }
    }
  }

  const rightPerimeters = perimeters
    .filter((p) => p.type === "right")
    .toSorted((a, b) => {
      if (a.x === b.x) {
        return a.y - b.y;
      }
      return a.x - b.x;
    });

  let rightSides = 1;
  let lastX = rightPerimeters[0].x;
  let lastY = rightPerimeters[0].y;
  for (let i = 1; i < rightPerimeters.length; i++) {
    const { x, y } = rightPerimeters[i];
    if (x !== lastX || y !== lastY + 1) {
      rightSides++;
    }
    lastX = x;
    lastY = y;
  }

  const leftPerimeters = perimeters
    .filter((p) => p.type === "left")
    .toSorted((a, b) => {
      if (a.x === b.x) {
        return a.y - b.y;
      }
      return a.x - b.x;
    });

  let leftSides = 1;
  lastX = leftPerimeters[0].x;
  lastY = leftPerimeters[0].y;
  for (let i = 1; i < leftPerimeters.length; i++) {
    const { x, y } = leftPerimeters[i];
    if (x !== lastX || y !== lastY + 1) {
      leftSides++;
    }
    lastX = x;
    lastY = y;
  }

  const downPerimeters = perimeters
    .filter((p) => p.type === "down")
    .toSorted((a, b) => {
      if (a.y === b.y) {
        return a.x - b.x;
      }
      return a.y - b.y;
    });
  let downSides = 1;
  lastX = downPerimeters[0].x;
  lastY = downPerimeters[0].y;
  for (let i = 1; i < downPerimeters.length; i++) {
    const { x, y } = downPerimeters[i];
    if (y !== lastY || x !== lastX + 1) {
      downSides++;
    }
    lastX = x;
    lastY = y;
  }

  const upPerimeters = perimeters
    .filter((p) => p.type === "up")
    .toSorted((a, b) => {
      if (a.y === b.y) {
        return a.x - b.x;
      }
      return a.y - b.y;
    });
  let upSides = 1;
  lastX = upPerimeters[0].x;
  lastY = upPerimeters[0].y;
  for (let i = 1; i < upPerimeters.length; i++) {
    const { x, y } = upPerimeters[i];
    if (y !== lastY || x !== lastX + 1) {
      upSides++;
    }
    lastX = x;
    lastY = y;
  }

  const sides = upSides + downSides + leftSides + rightSides;

  return { area, sides, letter };
};

function part2(grid: Input) {
  const visitedNodes = {};
  const regions = [];
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      if (visitedNodes[`${x}|${y}`]) {
        continue;
      }

      const region = findRegionPart2(grid, visitedNodes, x, y);
      regions.push(region);
    }
  }
  console.log("Regions: ", regions);
  return regions.reduce((acc, region) => acc + region.area * region.sides, 0);
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
