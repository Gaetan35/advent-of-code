import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => line.split(""));

  return input;
};

const prettyPrint = (grid) => {
  console.log(grid.map((line) => line.join("")).join("\n"));
};

const findRowsAndColsToExpand = (grid) => {
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;
  const linesToExpand = [];
  for (let y = 0; y < HEIGHT; y++) {
    if (!grid[y].includes("#")) {
      linesToExpand.push(y);
    }
  }

  const columnsToExpand = [];
  for (let x = 0; x < WIDTH; x++) {
    let hasGalaxy = false;
    for (let y = 0; y < HEIGHT; y++) {
      if (grid[y][x] === "#") {
        hasGalaxy = true;
        break;
      }
    }
    if (!hasGalaxy) {
      columnsToExpand.push(x);
    }
  }

  return [linesToExpand, columnsToExpand];
};

const findGalaxyPositions = (grid) => {
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;
  const galaxyPositions = [];

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (grid[y][x] === "#") {
        galaxyPositions.push({ x, y });
      }
    }
  }
  return galaxyPositions;
};

const computeDistanceBetweenGalaxies = (
  { x: x1, y: y1 },
  { x: x2, y: y2 },
  linesToExpand,
  columnsToExpand
) => {
  const EXPANSION_FACTOR = 1000000;
  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  let expandedLinesCrossed = 0;
  for (const lineY of linesToExpand) {
    if (minY < lineY && lineY < maxY) {
      expandedLinesCrossed += 1;
    }
  }

  let expandedColumnsCrossed = 0;
  for (const colX of columnsToExpand) {
    if (minX < colX && colX < maxX) {
      expandedColumnsCrossed += 1;
    }
  }

  return (
    maxX -
    minX +
    (maxY - minY) +
    (expandedColumnsCrossed + expandedLinesCrossed) * (EXPANSION_FACTOR - 1)
  );
};

const grid = await parseTextInput(false);

const [linesToExpand, columnsToExpand] = findRowsAndColsToExpand(grid);
const galaxyPositions = findGalaxyPositions(grid);

let result = 0;
for (let i = 0; i < galaxyPositions.length - 1; i++) {
  for (let j = i + 1; j < galaxyPositions.length; j++) {
    result += computeDistanceBetweenGalaxies(
      galaxyPositions[i],
      galaxyPositions[j],
      linesToExpand,
      columnsToExpand
    );
  }
}
console.log(result);
