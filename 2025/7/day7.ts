import * as fs from "fs/promises";
import * as path from "path";

type Pos = { x: number; y: number };
type Input = {
  startPos: Pos;
  grid: ("S" | "^" | ".")[][];
};

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  const grid = (await fs.readFile(filePath))
    .toString()
    .split("\n")
    .map((line) => line.split("") as Input["grid"][0]);

  const startPosX = grid[0].indexOf("S");

  return { grid, startPos: { x: startPosX, y: 0 } };
};

function part1({ startPos, grid }: Input) {
  let beams = [{ ...startPos }];
  let splitCount = 0;
  while (beams.length > 0) {
    const newBeams = new Set<string>();
    for (const { x, y } of beams) {
      if (grid?.[y + 1]?.[x] === ".") {
        newBeams.add(`${x}-${y + 1}`);
      }
      if (grid?.[y + 1]?.[x] === "^") {
        splitCount += 1;
        newBeams.add(`${x - 1}-${y + 1}`);
        newBeams.add(`${x + 1}-${y + 1}`);
      }
    }
    beams = [...newBeams].map((posString) => {
      const [x, y] = posString.split("-").map(Number);
      return { x, y };
    });
  }
  return splitCount;
}

function part2({ startPos, grid }: Input) {
  let beams = new Map([[`${startPos.x}-${startPos.y}`, 1]]);
  let exitCount = 0;
  while (beams.size > 0) {
    const newBeams = new Map<string, number>();
    beams.forEach((weight, posString) => {
      const [x, y] = posString.split("-").map(Number);
      if (grid?.[y + 1]?.[x] === ".") {
        const posString = `${x}-${y + 1}`;

        newBeams.set(posString, (newBeams.get(posString) || 0) + weight);
      }
      if (grid?.[y + 1]?.[x] === "^") {
        const posStrings = [`${x - 1}-${y + 1}`, `${x + 1}-${y + 1}`];
        posStrings.forEach((posString) =>
          newBeams.set(posString, (newBeams.get(posString) || 0) + weight)
        );
      }
      if (grid?.[y + 1]?.[x] === undefined) {
        exitCount += weight;
      }
    });
    beams = newBeams;
  }
  return exitCount;
}

async function main() {
  const IS_TEST = process.argv[2] === "test";
  const input = await parseTextInput(IS_TEST);

  const part1Result = part1(input);
  console.log("Part1 result: ", part1Result);

  const part2Result = part2(input);
  console.log("Part2 result: ", part2Result);
}

main();
