import * as fs from "fs/promises";
import * as path from "path";

type Input = string[][];
type Coordinates = { x: number; y: number };

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  return (await fs.readFile(filePath))
    .toString()
    .split("\n")
    .map((line) => line.split(""));
};

const digitsKeypad = {
  7: { x: 0, y: 0 },
  8: { x: 1, y: 0 },
  9: { x: 2, y: 0 },
  4: { x: 0, y: 1 },
  5: { x: 1, y: 1 },
  6: { x: 2, y: 1 },
  1: { x: 0, y: 2 },
  2: { x: 1, y: 2 },
  3: { x: 2, y: 2 },
  0: { x: 1, y: 3 },
  A: { x: 2, y: 3 },
};

const arrowsKeypad = {
  "^": { x: 1, y: 0 },
  A: { x: 2, y: 0 },
  "<": { x: 0, y: 1 },
  v: { x: 1, y: 1 },
  ">": { x: 2, y: 1 },
};

const getMoves = (
  sequence: string,
  outputKeyboard: Record<string, Coordinates>,
  forbiddenPos: Coordinates
) => {
  const currentPos = { ...outputKeyboard["A"] };
  let solution = "";
  for (const digit of sequence) {
    const wantedPos = outputKeyboard[digit];
    const dx = wantedPos.x - currentPos.x;
    const dy = wantedPos.y - currentPos.y;
    if (dx === 0 && dy === 0) {
      solution += "A";
      continue;
    }

    const xMoves = dx > 0 ? ">".repeat(dx) : "<".repeat(-dx);
    const yMoves = dy > 0 ? "v".repeat(dy) : "^".repeat(-dy);

    if (wantedPos.x === forbiddenPos.x && currentPos.y === forbiddenPos.y) {
      solution += yMoves + xMoves + "A";
    } else if (
      wantedPos.y === forbiddenPos.y &&
      currentPos.x === forbiddenPos.x
    ) {
      solution += xMoves + yMoves + "A";
    } else if (dx === 0) {
      solution += yMoves + "A";
    } else if (dy === 0) {
      solution += xMoves + "A";
    } else if (dx < 0 && dy < 0) {
      solution += xMoves + yMoves + "A";
    } else if (dx < 0 && dy > 0) {
      solution += xMoves + yMoves + "A";
    } else if (dx > 0 && dy < 0) {
      solution += yMoves + xMoves + "A";
    } else {
      solution += yMoves + xMoves + "A";
    }

    currentPos.x = wantedPos.x;
    currentPos.y = wantedPos.y;
  }

  return solution;
};

function solve(input: Input, intermediateRobots: number) {
  const forbiddenPosDigitPos = { x: 0, y: 3 };
  const forbiddenPosArrow = { x: 0, y: 0 };
  let result = 0;
  for (const sequence of input) {
    const solution = getMoves(
      sequence.join(""),
      digitsKeypad,
      forbiddenPosDigitPos
    );
    let parts = solution
      .split(/(?<=A)/)
      .reduce<Record<string, number>>((acc, part) => {
        acc[part] = (acc[part] || 0) + 1;
        return acc;
      }, {});

    for (let i = 0; i < intermediateRobots; i++) {
      const newParts: Record<string, number> = {};
      for (const part of Object.keys(parts)) {
        getMoves(part, arrowsKeypad, forbiddenPosArrow)
          .split(/(?<=A)/)
          .forEach((p) => {
            if (!newParts[p]) {
              newParts[p] = 0;
            }
            newParts[p] += parts[part];
          });
      }
      parts = newParts;
    }
    const finalLength = Object.entries(parts).reduce((acc, [part, count]) => {
      return acc + part.length * count;
    }, 0);

    const numericPart = +sequence.join("").slice(0, -1);
    result += numericPart * finalLength;
  }

  return result;
}

async function main() {
  const IS_TEST = process.argv[2] === "test";
  const input = await parseTextInput(IS_TEST);

  const part1Result = solve(input, 2);
  console.log("Part1 result: ", part1Result);

  const part2Result = solve(input, 25);
  console.log("Part2 result: ", part2Result);
}

main();
