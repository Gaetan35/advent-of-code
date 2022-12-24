import * as fs from "fs/promises";

const parseInput = async (test = false) => {
  const fileContent = (
    await fs.readFile(test ? "input_test.txt" : "input.txt")
  ).toString();
  const lines = fileContent.split("\n");
  return lines.reduce((globalAcc, line, y) => {
    const lineValues = line.split("").reduce((acc, value, x) => {
      if (value !== "#") {
        return acc;
      }
      return { ...acc, [`${x}|${y}`]: true };
    }, {});
    return { ...globalAcc, ...lineValues };
  }, {});
};

const isMovePossible = (x, y, move, elvesPositions) => {
  for (const { dx, dy } of move.requiredEmptyPos) {
    if (elvesPositions[`${x + dx}|${y + dy}`]) {
      return false;
    }
  }
  return true;
};

const getWantedPosition = (
  elfPos,
  noMove,
  moveCheckOrder,
  moveCheckOrderIndex,
  elvesPositions
) => {
  const [x, y] = elfPos.split("|").map((str) => parseInt(str));
  if (isMovePossible(x, y, noMove, elvesPositions)) {
    return { wantedX: x, wantedY: y };
  }

  for (
    let i = moveCheckOrderIndex;
    i < moveCheckOrderIndex + moveCheckOrder.length;
    i++
  ) {
    const move = moveCheckOrder[i % moveCheckOrder.length];
    if (isMovePossible(x, y, move, elvesPositions)) {
      return { wantedX: x + move.move.dx, wantedY: y + move.move.dy };
    }
  }

  return { wantedX: x, wantedY: y };
};

const noMove = {
  requiredEmptyPos: [
    { dx: -1, dy: -1 },
    { dx: -1, dy: 0 },
    { dx: -1, dy: 1 },
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 1, dy: 1 },
  ],
  move: { dx: 0, dy: 0 },
};

const westMove = {
  requiredEmptyPos: [
    { dx: -1, dy: -1 },
    { dx: -1, dy: 0 },
    { dx: -1, dy: 1 },
  ],
  move: { dx: -1, dy: 0 },
};

const eastMove = {
  requiredEmptyPos: [
    { dx: 1, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 1, dy: 1 },
  ],
  move: { dx: 1, dy: 0 },
};

const northMove = {
  requiredEmptyPos: [
    { dx: -1, dy: -1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: -1 },
  ],
  move: { dx: 0, dy: -1 },
};

const southMove = {
  requiredEmptyPos: [
    { dx: -1, dy: 1 },
    { dx: 0, dy: 1 },
    { dx: 1, dy: 1 },
  ],
  move: { dx: 0, dy: 1 },
};

const moveCheckOrder = [northMove, southMove, westMove, eastMove];

let elvesPositions = await parseInput(false);
let moveCheckOrderIndex = 0;
let roundNumber = 0;
let noElfMoved = true;
while (roundNumber === 0 || !noElfMoved) {
  roundNumber += 1;
  noElfMoved = true;
  const wantedPositions = {};
  for (const elfPos of Object.keys(elvesPositions)) {
    const { wantedX, wantedY } = getWantedPosition(
      elfPos,
      noMove,
      moveCheckOrder,
      moveCheckOrderIndex,
      elvesPositions
    );
    wantedPositions[`${wantedX}|${wantedY}`] =
      (wantedPositions[`${wantedX}|${wantedY}`] ?? 0) + 1;
  }

  const newElvesPositions = {};
  for (const elfPos of Object.keys(elvesPositions)) {
    const { wantedX, wantedY } = getWantedPosition(
      elfPos,
      noMove,
      moveCheckOrder,
      moveCheckOrderIndex,
      elvesPositions
    );
    const wantedPosKey = `${wantedX}|${wantedY}`;
    const [elfX, elfY] = elfPos.split("|").map((str) => parseInt(str));
    if (
      wantedPositions[wantedPosKey] === undefined ||
      wantedPositions[wantedPosKey] === 1
    ) {
      newElvesPositions[wantedPosKey] = true;
      if (wantedPosKey !== elfPos) {
        noElfMoved = false;
      }
    } else {
      newElvesPositions[`${elfX}|${elfY}`] = true;
    }
  }
  elvesPositions = newElvesPositions;
  moveCheckOrderIndex += 1;
  console.log(`Round ${roundNumber}, noElfMove: ${noElfMoved}`);
}

const occupiedXList = [];
const occupiedYList = [];
Object.keys(elvesPositions).forEach((elfPos) => {
  const [elfX, elfY] = elfPos.split("|").map((str) => parseInt(str));
  occupiedXList.push(elfX);
  occupiedYList.push(elfY);
});

const minX = Math.min(...occupiedXList);
const maxX = Math.max(...occupiedXList);
const minY = Math.min(...occupiedYList);
const maxY = Math.max(...occupiedYList);

console.log({ minX, maxX, minY, maxY });

const result =
  (maxX - minX + 1) * (maxY - minY + 1) - Object.keys(elvesPositions).length;

console.log("Result : ", result);
