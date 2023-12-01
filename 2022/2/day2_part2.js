import * as fs from "fs/promises";

const fileContent = (await fs.readFile("input.txt")).toString();

const resultScore = {
  X: 0,
  Y: 3,
  Z: 6,
};

const moveScore = {
  X: {
    A: 3,
    B: 1,
    C: 2,
  },
  Y: {
    A: 1,
    B: 2,
    C: 3,
  },
  Z: {
    A: 2,
    B: 3,
    C: 1,
  },
};

const result = fileContent.split("\n").reduce((prevScore, round) => {
  const [opponentMove, result] = round.split(" ");
  return prevScore + resultScore[result] + moveScore[result][opponentMove];
}, 0);

console.log("result : ", result);
