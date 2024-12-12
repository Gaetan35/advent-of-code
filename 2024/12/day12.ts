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

const findRegion1 = (
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

      const region = findRegion1(grid, visitedNodes, x, y);
      regions.push(region);
    }
  }
  return regions.reduce(
    (acc, region) => acc + region.area * region.perimeter,
    0
  );
}

const findRegion2 = (
  grid: Input,
  visitedNodes: Record<string, boolean>,
  startX: number,
  startY: number
) => {
  const nodes = [{ x: startX, y: startY }];
  const deltas = [
    { dx: 1, dy: 0, type: "vertical" },
    { dx: -1, dy: 0, type: "vertical" },
    { dx: 0, dy: 1, type: "horizontal" },
    { dx: 0, dy: -1, type: "horizontal" },
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

  const horizontalPerimeters = perimeters
    .filter((p) => p.type === "horizontal")
    .toSorted((a, b) => {
      if (a.y === b.y) {
        return a.x - b.x;
      }
      return a.y - b.y;
    });

  const verticalPerimeters = perimeters
    .filter((p) => p.type === "vertical")
    .toSorted((a, b) => {
      if (a.x === b.x) {
        return a.y - b.y;
      }
      return a.x - b.x;
    });

  let horizontalSides = 1;
  let lastX = horizontalPerimeters[0].x;
  let lastY = horizontalPerimeters[0].y;
  for (let i = 1; i < horizontalPerimeters.length; i++) {
    const { x, y } = horizontalPerimeters[i];
    if (y !== lastY || x !== lastX + 1) {
      horizontalSides++;
    }
    lastX = x;
    lastY = y;
  }

  let verticalSides = 1;
  lastX = verticalPerimeters[0].x;
  lastY = verticalPerimeters[0].y;
  for (let i = 1; i < verticalPerimeters.length; i++) {
    const { x, y } = verticalPerimeters[i];
    if (x !== lastX || y !== lastY + 1) {
      verticalSides++;
    }
    lastX = x;
    lastY = y;
  }

  const sides = verticalSides + horizontalSides;
  // console.log("Letter: ", letter);
  // console.log("Sides: ", sides);

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

      const region = findRegion2(grid, visitedNodes, x, y);
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

// 834546 is too low
