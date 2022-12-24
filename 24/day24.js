import * as fs from "fs/promises";

const parseInput = async (test = false) => {
  const fileContent = (
    await fs.readFile(test ? "input_test.txt" : "input.txt")
  ).toString();
  const lines = fileContent.split("\n");
  return lines.map((line) => line.split(""));
};

const getVortexes = (grid) => {
  const vortexes = {};
  for (let x = 0; x < grid[0].length; x++) {
    for (let y = 0; y < grid.length; y++) {
      if (!["#", "."].includes(grid[y][x])) {
        vortexes[`${x}|${y}`] = [grid[y][x]];
      }
    }
  }
  return vortexes;
};

const computeNextVortexes = (vortexes, width, height) => {
  const directionOffsets = {
    ">": { dx: 1, dy: 0 },
    "<": { dx: -1, dy: 0 },
    "^": { dx: 0, dy: -1 },
    v: { dx: 0, dy: 1 },
  };
  const newVortexes = {};
  for (const [pos, directions] of Object.entries(vortexes)) {
    const [x, y] = pos.split("|").map((str) => parseInt(str));
    for (const direction of directions) {
      const { dx, dy } = directionOffsets[direction];
      let newX = x + dx;
      let newY = y + dy;
      if (newX === 0) {
        newX = width - 2;
      }
      if (newX === width - 1) {
        newX = 1;
      }
      if (newY === 0) {
        newY = height - 2;
      }
      if (newY === height - 1) {
        newY = 1;
      }
      if (!newVortexes[`${newX}|${newY}`]) {
        newVortexes[`${newX}|${newY}`] = [];
      }
      newVortexes[`${newX}|${newY}`].push(direction);
    }
  }
  return newVortexes;
};

const computeVortexesForMinute = (width, height, minuteWanted) => {
  if (VORTEXES_BY_MINUTE[minuteWanted] !== undefined)
    return VORTEXES_BY_MINUTE[minuteWanted];

  // console.log("Computing for minute : ", minuteWanted);
  let lastVortexesComputed = VORTEXES_BY_MINUTE[VORTEXES_BY_MINUTE.length - 1];
  for (
    let minute = VORTEXES_BY_MINUTE.length - 1;
    minute <= minuteWanted;
    minute++
  ) {
    lastVortexesComputed = computeNextVortexes(
      lastVortexesComputed,
      width,
      height
    );
    VORTEXES_BY_MINUTE.push(lastVortexesComputed);
  }
  return VORTEXES_BY_MINUTE[minuteWanted];
};

const possibleMoves = [
  { dx: 0, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 1, dy: 0 },
  { dx: 0, dy: -1 },
  { dx: 0, dy: 1 },
];

const computeDistance = (
  grid,
  startMinute,
  startX,
  startY,
  endPosX,
  endPosY
) => {
  const width = grid[0].length;
  const height = grid.length;
  const nodes = [{ x: startX, y: startY, minute: startMinute }];
  const CACHE = {};

  let minDistance;
  let iterations = 0;
  while (nodes.length > 0) {
    iterations += 1;
    const { x, y, minute: nodeMinute } = nodes.shift();

    // if (iterations % 10000 === 0) {
    //   console.log(
    //     `${iterations / 10000} - ${
    //       nodes.length
    //     } - minDistance: ${minDistance} - nodeMinute: ${nodeMinute}`
    //   );
    // }

    if (x === endPosX && y === endPosY) {
      if (minDistance === undefined || nodeMinute < minDistance) {
        minDistance = nodeMinute;
        // console.log("New min distance : ", minDistance);
      }
    }

    if (
      minDistance &&
      nodeMinute + Math.abs(endPosX - x) + Math.abs(endPosY - y) > minDistance
    ) {
      continue;
    }

    if (CACHE[`${x}|${y}|${nodeMinute}`]) {
      continue;
    }
    CACHE[`${x}|${y}|${nodeMinute}`] = true;

    const vortexes = computeVortexesForMinute(width, height, nodeMinute + 1);

    for (const { dx, dy } of possibleMoves) {
      const newX = x + dx;
      const newY = y + dy;
      if (
        newX >= 0 &&
        newY >= 0 &&
        newX <= width - 1 &&
        newY <= height - 1 &&
        grid[newY][newX] !== "#" &&
        vortexes[`${newX}|${newY}`] === undefined
      ) {
        nodes.push({ x: newX, y: newY, minute: nodeMinute + 1 });
      }
    }
  }
  return minDistance - startMinute;
};

const grid = await parseInput(false);
const startingVortexes = getVortexes(grid);
const VORTEXES_BY_MINUTE = [startingVortexes];

const startPos = { x: grid[0].indexOf("."), y: 0 };
const endPos = { x: grid[grid.length - 1].indexOf("."), y: grid.length - 1 };

const startToGoalTime = computeDistance(
  grid,
  0,
  startPos.x,
  startPos.y,
  endPos.x,
  endPos.y
);
console.log("Start to goal : ", startToGoalTime);
const goalToStartTime = computeDistance(
  grid,
  startToGoalTime,
  endPos.x,
  endPos.y,
  startPos.x,
  startPos.y
);
console.log("Goal to start : ", goalToStartTime);
const startToGoalTime2 = computeDistance(
  grid,
  startToGoalTime + goalToStartTime,
  startPos.x,
  startPos.y,
  endPos.x,
  endPos.y
);
console.log("Start to goal 2 : ", startToGoalTime2);
console.log("Result : ", startToGoalTime + goalToStartTime + startToGoalTime2);
