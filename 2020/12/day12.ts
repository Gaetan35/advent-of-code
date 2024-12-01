import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  return (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => ({ action: line[0], value: parseInt(line.slice(1)) }));
};

const part1 = (input: { action: string; value: number }[]) => {
  let currentDirection = "E";
  let x = 0;
  let y = 0;
  const deltas = {
    N: [0, 1],
    E: [1, 0],
    S: [0, -1],
    W: [-1, 0],
  };
  const turns = {
    R: {
      N: "E",
      E: "S",
      S: "W",
      W: "N",
    },
    L: {
      N: "W",
      W: "S",
      S: "E",
      E: "N",
    },
  };

  for (const { action, value } of input) {
    if (action === "F") {
      const [dx, dy] = deltas[currentDirection];
      x += dx * value;
      y += dy * value;
    } else if (action === "R" || action === "L") {
      const turnsCount = value / 90;
      for (let i = 0; i < turnsCount; i++) {
        currentDirection = turns[action][currentDirection];
      }
    } else {
      const [dx, dy] = deltas[action];
      x += dx * value;
      y += dy * value;
    }
  }

  return Math.abs(x) + Math.abs(y);
};

const part2 = (input: { action: string; value: number }[]) => {
  let x = 0;
  let y = 0;
  let wx = 10;
  let wy = 1;
  const deltas = {
    N: [0, 1],
    E: [1, 0],
    S: [0, -1],
    W: [-1, 0],
  };

  for (const { action, value } of input) {
    if (action === "F") {
      x += wx * value;
      y += wy * value;
    } else if (action === "R" || action === "L") {
      const turnsCount = action === "R" ? value / 90 : 4 - value / 90;
      for (let i = 0; i < turnsCount; i++) {
        const tmp = wx;
        wx = wy;
        wy = -tmp;
      }
    } else {
      const [dx, dy] = deltas[action];
      wx += dx * value;
      wy += dy * value;
    }
  }

  return Math.abs(x) + Math.abs(y);
};

async function main() {
  const IS_TEST = process.argv[2] === "test";
  const input = await parseTextInput(IS_TEST);

  const part1Result = part1(input);
  console.log("Part1 result: ", part1Result);

  const part2Result = part2(input);
  console.log("Part2 result: ", part2Result);
}

main();
