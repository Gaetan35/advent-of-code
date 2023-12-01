import * as fs from "fs/promises";

const parseInput = async (test = false) => {
  const fileContent = (
    await fs.readFile(test ? "input_test.txt" : "input.txt")
  ).toString();
  const lines = fileContent.split("\n");
  return lines[0];
};

const displayResult = (result) => {
  console.log(
    result
      .reverse()
      .map((row) => row.join(""))
      .join("\n")
  );
};

const makeGrid = (width, height) =>
  Array.from({ length: height }, (_, i) =>
    Array.from({ length: width }, (_, j) => ".")
  );

const addRock = (highestRockY, rock) => {
  const startPosY = highestRockY + 4;
  const startPosX = 2;
  return rock.map(({ x, y }) => ({ x: x + startPosX, y: y + startPosY }));
};

const movementOffset = {
  ">": 1,
  "<": -1,
};

const moveRockHorizontal = (grid, rock, movement, width) => {
  const newRock = [];

  for (const { x, y } of rock) {
    const newX = x + movementOffset[movement];
    if (newX < 0 || newX > width - 1 || grid[y][newX] !== ".") {
      return { canMove: false };
    }
    newRock.push({ x: newX, y });
  }
  return { canMove: true, newRock };
};

const moveRockDown = (grid, rock) => {
  const newRock = [];

  for (const { x, y } of rock) {
    if (y - 1 < 0 || grid[y - 1][x] !== ".") {
      return { canMove: false };
    }
    newRock.push({ x, y: y - 1 });
  }
  return { canMove: true, newRock };
};

const rocks = [
  // Horizontal rock
  [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 3, y: 0 },
  ],
  // + rock
  [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 1, y: 2 },
  ],
  // L rock
  [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 2, y: 2 },
  ],
  // Vertical Rock
  [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 0, y: 3 },
  ],
  // Square Rock
  [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
  ],
];

const horizontalMovements = await parseInput(false);
const WIDTH = 7;
const START_HEIGHT = 100000;
const MAX_FALLEN_ROCKS = 10000;
const grid = makeGrid(WIDTH, START_HEIGHT);
let highestRockY = -1; // Floor
let jetIndex = 0;
let fallenRockNb = 1;
const cycles = {};
console.log("HorizontalMovement length : ", horizontalMovements.length);
while (fallenRockNb <= MAX_FALLEN_ROCKS) {
  let fallingRock = addRock(
    highestRockY,
    rocks[(fallenRockNb - 1) % rocks.length]
  );
  let hasRockMovedDown = true;
  while (hasRockMovedDown) {
    const { canMove: canMoveHorizontal, newRock: newRockHorizontal } =
      moveRockHorizontal(
        grid,
        fallingRock,
        horizontalMovements[jetIndex % horizontalMovements.length],
        WIDTH
      );
    if (canMoveHorizontal) {
      fallingRock = newRockHorizontal;
    }
    jetIndex += 1;

    const { canMove: canMoveDown, newRock: newRockDown } = moveRockDown(
      grid,
      fallingRock
    );
    if (canMoveDown) {
      fallingRock = newRockDown;
    }
    hasRockMovedDown = canMoveDown;
  }

  for (const { x, y } of fallingRock) {
    grid[y][x] = "#";
    if (highestRockY < y) {
      highestRockY = y;
    }
  }
  fallenRockNb += 1;
  cycles[jetIndex % horizontalMovements.length] = [
    ...(cycles[jetIndex % horizontalMovements.length] ?? []),
    { highestRockY, fallenRockNb },
  ];
}

// displayResult(grid);
console.log("Highest Rock Y : ", highestRockY + 1);
const deltas = {};

for (const occurences of Object.values(cycles)) {
  if (occurences.length < 2) {
    continue;
  }
  for (let i = 0; i < occurences.length - 1; i++) {
    const highestRockDelta =
      occurences[i + 1].highestRockY - occurences[i].highestRockY;
    const fallenRockNbDelta =
      occurences[i + 1].fallenRockNb - occurences[i].fallenRockNb;
    if (!deltas[`${highestRockDelta}|${fallenRockNbDelta}`]) {
      deltas[`${highestRockDelta}|${fallenRockNbDelta}`] = 1;
    } else {
      deltas[`${highestRockDelta}|${fallenRockNbDelta}`] += 1;
    }
  }
}
const sortedDeltas = Object.entries(deltas).sort(
  ([delta1, count1], [delta2, count2]) => count2 - count1
);
console.log(sortedDeltas.slice(0, 5));
const [highestRockDelta, fallenRockNbDelta] = sortedDeltas[0][0]
  .split("|")
  .map((str) => parseInt(str));

const OBJECTIVE_FALLEN_ROCKS = 1000000000000;
const divided = Math.floor(OBJECTIVE_FALLEN_ROCKS / fallenRockNbDelta);
const remaining = OBJECTIVE_FALLEN_ROCKS % fallenRockNbDelta;
console.log({ divided, remaining });
// { divided: 584795321, remaining: 1090 }

// 1706 is highestRockY when MAX_FALLEN_ROCK_NB = remaining (here 1090)
const result = 1706 + divided * highestRockDelta;
console.log(result);
