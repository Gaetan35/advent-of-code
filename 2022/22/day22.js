import * as fs from "fs/promises";

const makeGrid = (width, height) =>
  Array.from({ length: height }, (_, i) =>
    Array.from({ length: width }, (_, j) => " ")
  );

const displayGrid = (grid) => {
  console.log(grid.map((row) => row.join("")).join("\n"));
};

const parseInput = async (test = false) => {
  const fileContent = (
    await fs.readFile(test ? "input_test.txt" : "input.txt")
  ).toString();
  const lines = fileContent.split("\n");

  const gridLines = lines.slice(0, lines.length - 2);
  const gridWidth = Math.max(...gridLines.map((line) => line.length));
  const grid = makeGrid(gridWidth, gridLines.length);
  for (let i = 0; i < gridLines.length; i++) {
    for (let j = 0; j < gridWidth; j++) {
      if (j < gridLines[i].length) {
        grid[i][j] = gridLines[i].charAt(j);
      }
    }
  }

  const rows = {};
  for (let i = 0; i < gridLines.length; i++) {
    const existingIndexes = [];
    for (let j = 0; j < gridWidth; j++) {
      if (grid[i][j] !== " ") {
        existingIndexes.push(j);
      }
    }
    rows[i] = {
      left: Math.min(...existingIndexes),
      right: Math.max(...existingIndexes),
    };
  }

  const columns = {};
  for (let j = 0; j < gridWidth; j++) {
    const existingIndexes = [];
    for (let i = 0; i < gridLines.length; i++) {
      if (grid[i][j] !== " ") {
        existingIndexes.push(i);
      }
    }
    columns[j] = {
      up: Math.min(...existingIndexes),
      down: Math.max(...existingIndexes),
    };
  }

  const startIndex = grid[0].indexOf(".");

  const pathInstructionsRaw = lines[lines.length - 1];
  const pathInstructions = pathInstructionsRaw
    .split("R")
    .flatMap((instruction) => [instruction, "R"])
    .slice(0, -1)
    .flatMap((instruction) =>
      instruction
        .split("L")
        .flatMap((instruction) => [instruction, "L"])
        .slice(0, -1)
    )
    .map((instruction) =>
      isNaN(instruction) ? instruction : parseInt(instruction)
    );

  return { pathInstructions, grid, startIndex, columns, rows };
};

const getNewFacing = (previousFacing, rotateDirection) => {
  if (rotateDirection === "R") {
    return { right: "down", down: "left", left: "up", up: "right" }[
      previousFacing
    ];
  }

  if (rotateDirection === "L") {
    return { right: "up", up: "left", left: "down", down: "right" }[
      previousFacing
    ];
  }
};

const move = ({ x, y, facing }, grid, distance, columns, rows) => {
  const movements = {
    right: { dx: 1, dy: 0 },
    left: { dx: -1, dy: 0 },
    up: { dx: 0, dy: -1 },
    down: { dx: 0, dy: 1 },
  };
  let currentX = x;
  let currentY = y;
  for (let i = 0; i < distance; i++) {
    const { dx, dy } = movements[facing];
    let newX = currentX + dx;
    let newY = currentY + dy;
    if (grid?.[newY]?.[newX] === " " || grid?.[newY]?.[newX] === undefined) {
      if (facing === "right") {
        newX = rows[newY].left;
      }
      if (facing === "left") {
        newX = rows[newY].right;
      }
      if (facing === "up") {
        newY = columns[newX].down;
      }
      if (facing === "down") {
        newY = columns[newX].up;
      }
    }
    if (grid[newY][newX] === "#") {
      break;
    }
    currentX = newX;
    currentY = newY;
  }
  return { newX: currentX, newY: currentY };
};

const { pathInstructions, grid, startIndex, columns, rows } = await parseInput(
  false
);

const currentPosition = { y: 0, x: startIndex, facing: "right" };

for (const instruction of pathInstructions) {
  if (typeof instruction === "number") {
    const { newX, newY } = move(
      currentPosition,
      grid,
      instruction,
      columns,
      rows
    );
    currentPosition.x = newX;
    currentPosition.y = newY;
  } else if (typeof instruction === "string") {
    currentPosition.facing = getNewFacing(currentPosition.facing, instruction);
  }
}

grid[currentPosition.y][currentPosition.x] = "A";
displayGrid(grid);

const facingToNumber = {
  right: 0,
  down: 1,
  left: 2,
  up: 3,
};
const { x, y, facing } = currentPosition;
const result = (y + 1) * 1000 + (x + 1) * 4 + facingToNumber[facing];

console.log(result);
