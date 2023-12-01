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

  return { pathInstructions, grid, startIndex };
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

const getWrappedPos = (x, y, facing) => {
  const faceSize = 50;
  // console.log("inputs : ", x, y, facing);
  const faceX = Math.floor(x / faceSize);
  const faceY = Math.floor(y / faceSize);
  const faceIndex = {
    "1-0": 1,
    "2-0": 2,
    "1-1": 3,
    "0-2": 4,
    "1-2": 5,
    "0-3": 6,
  }[`${faceX}-${faceY}`];
  const newPosition = {
    1: {
      left: (oldX, oldY) => ({
        // 4 facing right
        wrappedX: 0,
        wrappedY: 3 * faceSize - 1 - (oldY % faceSize),
        wrappedFacing: "right",
      }),
      up: (oldX, oldY) => ({
        // 6 facing right
        wrappedX: 0,
        wrappedY: 3 * faceSize + (oldX % faceSize),
        wrappedFacing: "right",
      }),
    },
    2: {
      down: (oldX, oldY) => ({
        // 3 facing left
        wrappedX: 2 * faceSize - 1,
        wrappedY: faceSize + (oldX % faceSize),
        wrappedFacing: "left",
      }),
      right: (oldX, oldY) => ({
        // 5 facing left
        wrappedX: 2 * faceSize - 1,
        wrappedY: 3 * faceSize - 1 - (oldY % faceSize),
        wrappedFacing: "left",
      }),
      up: (oldX, oldY) => ({
        // 6 facing up
        wrappedX: oldX % faceSize,
        wrappedY: 4 * faceSize - 1,
        wrappedFacing: "up",
      }),
    },
    3: {
      left: (oldX, oldY) => ({
        // 4 facing down
        wrappedX: oldY % faceSize,
        wrappedY: 2 * faceSize,
        wrappedFacing: "down",
      }),
      right: (oldX, oldY) => ({
        // 2 facing up
        wrappedX: 2 * faceSize + (oldY % faceSize),
        wrappedY: faceSize - 1,
        wrappedFacing: "up",
      }),
    },
    4: {
      left: (oldX, oldY) => ({
        // 1 facing right
        wrappedX: faceSize,
        wrappedY: faceSize - 1 - (oldY % faceSize),
        wrappedFacing: "right",
      }),
      up: (oldX, oldY) => ({
        // 3 facing right
        wrappedX: faceSize,
        wrappedY: faceSize + (oldX % faceSize),
        wrappedFacing: "right",
      }),
    },
    5: {
      right: (oldX, oldY) => ({
        // 2 facing left
        wrappedX: 3 * faceSize - 1,
        wrappedY: faceSize - 1 - (oldY % faceSize),
        wrappedFacing: "left",
      }),
      down: (oldX, oldY) => ({
        // 6 facing left
        wrappedX: faceSize - 1,
        wrappedY: 3 * faceSize + (oldX % faceSize),
        wrappedFacing: "left",
      }),
    },
    6: {
      left: (oldX, oldY) => ({
        // 1 facing down
        wrappedX: faceSize + (oldY % faceSize),
        wrappedY: 0,
        wrappedFacing: "down",
      }),
      right: (oldX, oldY) => ({
        // 5 facing up
        wrappedX: faceSize + (oldY % faceSize),
        wrappedY: 3 * faceSize - 1,
        wrappedFacing: "up",
      }),
      down: (oldX, oldY) => ({
        // 2 facing down
        wrappedX: 2 * faceSize + (oldX % faceSize),
        wrappedY: 0,
        wrappedFacing: "down",
      }),
    },
  };
  // console.log(faceIndex, facing);
  return newPosition[faceIndex][facing](x, y);
};

const move = ({ x, y, facing }, grid, distance) => {
  const movements = {
    right: { dx: 1, dy: 0 },
    left: { dx: -1, dy: 0 },
    up: { dx: 0, dy: -1 },
    down: { dx: 0, dy: 1 },
  };
  const facingArrow = { right: ">", left: "<", up: "^", down: "v" };
  let currentX = x;
  let currentY = y;
  let currentFacing = facing;
  for (let i = 0; i < distance; i++) {
    const { dx, dy } = movements[currentFacing];
    let newX = currentX + dx;
    let newY = currentY + dy;
    let newFacing = currentFacing;
    if (grid?.[newY]?.[newX] === " " || grid?.[newY]?.[newX] === undefined) {
      const { wrappedFacing, wrappedX, wrappedY } = getWrappedPos(
        currentX,
        currentY,
        facing
      );
      newX = wrappedX;
      newY = wrappedY;
      newFacing = wrappedFacing;
    }
    if (grid[newY][newX] === "#") {
      break;
    }
    currentX = newX;
    currentY = newY;
    currentFacing = newFacing;
  }
  return { newX: currentX, newY: currentY, newFacing: currentFacing };
};

const { pathInstructions, grid, startIndex } = await parseInput(false);

// const faceIndexes = Array.from({ length: grid.length }, (_, i) =>
//   Array.from({ length: grid[0].length }, (_, j) => {
//     const faceX = Math.floor(j / 50);
//     const faceY = Math.floor(i / 50);
//     const faceIdByIndex = {
//       "1-0": 1,
//       "2-0": 2,
//       "1-1": 3,
//       "0-2": 4,
//       "1-2": 5,
//       "0-3": 6,
//     };
//     const faceIndex = faceIdByIndex[`${faceX}-${faceY}`];
//     if (grid[i][j] === " ") return " ";
//     if (grid?.[i + 1]?.[j] === " " || grid?.[i + 1]?.[j] === undefined) {
//       const { wrappedX, wrappedY } = getWrappedPos(j, i, "down");
//       console.log(wrappedX, wrappedY);
//       return faceIdByIndex[
//         `${Math.floor(wrappedX / 50)}-${Math.floor(wrappedY / 50)}`
//       ];
//     }
//     if (grid?.[i - 1]?.[j] === " " || grid?.[i - 1]?.[j] === undefined) {
//       const { wrappedX, wrappedY } = getWrappedPos(j, i, "up");
//       console.log(wrappedX, wrappedY);

//       return faceIdByIndex[
//         `${Math.floor(wrappedX / 50)}-${Math.floor(wrappedY / 50)}`
//       ];
//     }
//     if (grid?.[i]?.[j + 1] === " " || grid?.[i]?.[j + 1] === undefined) {
//       const { wrappedX, wrappedY } = getWrappedPos(j, i, "right");
//       console.log(wrappedX, wrappedY);

//       return faceIdByIndex[
//         `${Math.floor(wrappedX / 50)}-${Math.floor(wrappedY / 50)}`
//       ];
//     }
//     if (grid?.[i]?.[j - 1] === " " || grid?.[i]?.[j - 1] === undefined) {
//       const { wrappedX, wrappedY } = getWrappedPos(j, i, "left");
//       console.log(wrappedX, wrappedY);

//       return faceIdByIndex[
//         `${Math.floor(wrappedX / 50)}-${Math.floor(wrappedY / 50)}`
//       ];
//     }
//     return faceIndex;
//   })
// );
// displayGrid(faceIndexes);

const currentPosition = { y: 0, x: startIndex, facing: "right" };
for (const instruction of pathInstructions) {
  if (typeof instruction === "number") {
    const { newX, newY, newFacing } = move(currentPosition, grid, instruction);
    currentPosition.x = newX;
    currentPosition.y = newY;
    currentPosition.facing = newFacing;
  } else if (typeof instruction === "string") {
    currentPosition.facing = getNewFacing(currentPosition.facing, instruction);
  }
}

const facingToNumber = {
  right: 0,
  down: 1,
  left: 2,
  up: 3,
};
const { x, y, facing } = currentPosition;
const result = (y + 1) * 1000 + (x + 1) * 4 + facingToNumber[facing];

console.log(currentPosition);
console.log("Result : ", result);

// first try : 8279 is too low
// Second try: 148052 is too high
