import * as fs from "fs/promises";

const parseInput = async (test = false) => {
  const fileContent = (
    await fs.readFile(test ? "input_test2.txt" : "input.txt")
  ).toString();
  const lines = fileContent.split("\n");
  return lines.map((line) => {
    const [direction, stepNumber] = line.split(" ");
    return {
      direction,
      stepNumber: parseInt(stepNumber),
    };
  });
};

const headMovePerDirection = {
  R: { x: 1, y: 0 },
  L: { x: -1, y: 0 },
  U: { x: 0, y: 1 },
  D: { x: 0, y: -1 },
};

const moveTail = (headOffsetX, headOffsetY) => {
  // Don't move if head is adjacent
  if (Math.abs(headOffsetX) <= 1 && Math.abs(headOffsetY) <= 1) {
    return { x: 0, y: 0 };
  }
  // Left or right
  if (headOffsetX === 0) {
    return { x: 0, y: headOffsetY / Math.abs(headOffsetY) };
  }
  // Up or down
  if (headOffsetY === 0) {
    return { x: headOffsetX / Math.abs(headOffsetX), y: 0 };
  }
  return {
    x: headOffsetX / Math.abs(headOffsetX),
    y: headOffsetY / Math.abs(headOffsetY),
  };
};

const input = await parseInput(false);

const KNOTS_NUMBER = 10;
const knots = Array.from({ length: KNOTS_NUMBER }, () => ({ x: 0, y: 0 }));

const visitedPositions = { "0|0": true };
let visitedPositionNumber = 1;

for (const { direction, stepNumber } of input) {
  for (let step = 0; step < stepNumber; step++) {
    const { x: headMoveX, y: headMoveY } = headMovePerDirection[direction];
    knots[0].x += headMoveX;
    knots[0].y += headMoveY;

    for (let knotNumber = 1; knotNumber < KNOTS_NUMBER; knotNumber++) {
      const { x: tailMoveX, y: tailMoveY } = moveTail(
        knots[knotNumber - 1].x - knots[knotNumber].x,
        knots[knotNumber - 1].y - knots[knotNumber].y
      );
      knots[knotNumber].x += tailMoveX;
      knots[knotNumber].y += tailMoveY;
    }

    const tail = knots[KNOTS_NUMBER - 1];
    if (!visitedPositions[`${tail.x}|${tail.y}`]) {
      visitedPositions[`${tail.x}|${tail.y}`] = true;
      visitedPositionNumber += 1;
    }
  }
}
console.log(visitedPositionNumber);
