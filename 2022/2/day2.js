import * as fs from "fs/promises";

const fileContent = (await fs.readFile("input.txt")).toString();

const moveScore = {
  X: 1,
  Y: 2,
  Z: 3,
};

const roundScore = {
  X: {
    A: 3,
    B: 0,
    C: 6,
  },
  Y: {
    A: 6,
    B: 3,
    C: 0,
  },
  Z: {
    A: 0,
    B: 6,
    C: 3,
  },
};

const result = fileContent.split("\n").reduce((prevScore, round) => {
  const [opponentMove, myMove] = round.split(" ");
  return prevScore + moveScore[myMove] + roundScore[myMove][opponentMove];
}, 0);

console.log("result : ", result);
