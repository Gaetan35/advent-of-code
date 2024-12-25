import * as fs from "fs/promises";
import * as path from "path";

type Input = { keys: number[][]; locks: number[][] };

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  const schematics = (await fs.readFile(filePath)).toString().split("\n\n");

  const locks = [];
  const keys = [];
  const SCHEMATICS_SIZE = 5;
  schematics.forEach((schematic) => {
    const grid = schematic.split("\n").map((row) => row.split(""));
    if (grid[0].every((c) => c === ".")) {
      const key = [];
      for (let x = 0; x < SCHEMATICS_SIZE; x++) {
        let y = 5;
        let columnHeight = 0;
        while (grid[y][x] === "#" && y >= 1) {
          columnHeight++;
          y--;
        }
        key.push(columnHeight);
      }
      keys.push(key);
    } else if (grid[0].every((c) => c === "#")) {
      const lock = [];
      for (let x = 0; x < SCHEMATICS_SIZE; x++) {
        let y = 1;
        let columnHeight = 0;
        while (grid[y][x] === "#" && y <= 5) {
          columnHeight++;
          y++;
        }
        lock.push(columnHeight);
      }
      locks.push(lock);
    } else {
      throw new Error("Invalid schematic");
    }
  });

  return { keys, locks };
};

const areMatching = (key: number[], lock: number[]) => {
  return key.every(
    (keyColumnHeight, index) => keyColumnHeight + lock[index] <= 5
  );
};

function part1({ keys, locks }: Input) {
  console.log({ keys: keys.length, locks: locks.length });
  let matchingCount = 0;
  for (const key of keys) {
    for (const lock of locks) {
      if (areMatching(key, lock)) {
        matchingCount++;
      }
    }
  }
  return matchingCount;
}

async function main() {
  const IS_TEST = process.argv[2] === "test";
  const input = await parseTextInput(IS_TEST);

  const part1Result = part1(input);
  console.log("Part1 result: ", part1Result);
}

main();
