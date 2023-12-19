import * as fs from "fs/promises";

const prettyPrint = (grid) => {
  console.log(grid.map((line) => line.join("")).join("\n"));
};

const rotateDirection = {
  R: "D",
  D: "L",
  L: "U",
  U: "R",
};

const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => {
      const [direction, length, color] = line.split(" ");
      return {
        direction: rotateDirection[direction],
        length: Number(length),
        color: color.substring(1, color.length - 1),
      };
    });

  return input;
};

const DELTAS_PER_DIRECTION = {
  R: [1, 0],
  L: [-1, 0],
  U: [0, -1],
  D: [0, 1],
};
const DELTAS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];
const computeTrenchGrid = (input) => {
  const lengthSum = input.reduce(
    (previous, { length }) => previous + length,
    0
  );

  const SIZE = 2 * lengthSum + 1;
  const pos = [lengthSum, lengthSum];

  const trenchGrid = Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => ".")
  );

  let minX = pos[0];
  let maxX = pos[0];
  let minY = pos[1];
  let maxY = pos[1];

  trenchGrid[pos[1]][pos[0]] = "#";
  for (const { direction, length } of input) {
    const [dx, dy] = DELTAS_PER_DIRECTION[direction];
    for (let i = 0; i < length; i++) {
      pos[0] += dx;
      pos[1] += dy;
      trenchGrid[pos[1]][pos[0]] = "#";

      if (pos[0] > maxX) {
        maxX = pos[0];
      }
      if (pos[0] < minX) {
        minX = pos[0];
      }
      if (pos[1] > maxY) {
        maxY = pos[1];
      }
      if (pos[1] < minY) {
        minY = pos[1];
      }
    }
  }

  const [dx1, dy1] = DELTAS_PER_DIRECTION[input[0].direction];
  const [dx2, dy2] = DELTAS_PER_DIRECTION[input[1].direction];
  const firstInsidePos = [lengthSum + dx1 + dx2, lengthSum + dy1 + dy2];
  trenchGrid[firstInsidePos[1]][firstInsidePos[0]] = "I";

  const finalGrid = trenchGrid
    .slice(minY, maxY + 1)
    .map((line) => line.slice(minX, maxX + 1));
  const insidePos = [firstInsidePos[0] - minX, firstInsidePos[1] - minY];

  return [finalGrid, insidePos];
};

const fillTrenchGrid = (grid, insidePos) => {
  const nodes = [insidePos];
  let insideCount = 1;
  while (nodes.length > 0) {
    const [x, y] = nodes.pop();

    if (grid[y][x] === ".") {
      grid[y][x] = "I";
      insideCount += 1;
    }

    for (const [dx, dy] of DELTAS) {
      if (grid[y + dy][x + dx] === ".") {
        nodes.push([x + dx, y + dy]);
      }
    }
  }
  return [grid, insideCount];
};

const input = await parseTextInput(true);
console.log(input);

const [trenchGrid, insidePos] = computeTrenchGrid(input);
prettyPrint(trenchGrid);

const [filledGrid, insideCount] = fillTrenchGrid(trenchGrid, insidePos);
// prettyPrint(filledGrid);

const lengthSum = input.reduce((previous, { length }) => previous + length, 0);

console.log("Result: ", lengthSum + insideCount);
