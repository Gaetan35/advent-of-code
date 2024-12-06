import * as fs from "fs/promises";
import * as path from "path";

type Input = {
  orderingRules: { lower: number; higher: number }[];
  updates: number[][];
};

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  const [orderingRules, updates] = (await fs.readFile(filePath))
    .toString()
    .split("\n\n");

  return {
    orderingRules: orderingRules.split("\n").map((rule) => {
      const [lower, higher] = rule.split("|").map(Number);
      return { lower, higher };
    }),
    updates: updates.split("\n").map((update) => update.split(",").map(Number)),
  };
};

function part1({ orderingRules, updates }: Input) {
  let sum = 0;
  for (const update of updates) {
    const indexes = Object.fromEntries(
      update.map((value, index) => [value, index])
    );
    let isUpdateValid = true;
    for (const { lower, higher } of orderingRules) {
      if (
        indexes[lower] !== undefined &&
        indexes[higher] !== undefined &&
        indexes[lower] > indexes[higher]
      ) {
        isUpdateValid = false;
        break;
      }
    }

    if (isUpdateValid) {
      sum += update[Math.floor(update.length / 2)];
    }
  }
  return sum;
}

function part2({ orderingRules, updates }: Input) {
  let sum = 0;
  for (const update of updates) {
    const indexes = Object.fromEntries(
      update.map((value, index) => [value, index])
    );
    let isUpdateValid = true;
    const numbersAfter = {};
    for (const { lower, higher } of orderingRules) {
      if (indexes[lower] !== undefined && indexes[higher] !== undefined) {
        if (!numbersAfter[lower]) {
          numbersAfter[lower] = [];
        }
        numbersAfter[lower].push(higher);
        if (indexes[lower] > indexes[higher]) {
          isUpdateValid = false;
        }
      }
    }

    if (isUpdateValid) {
      continue;
    }

    const reorderedUpdate = update.toSorted(
      (a, b) => (numbersAfter[b]?.length ?? 0) - (numbersAfter[a]?.length ?? 0)
    );

    sum += reorderedUpdate[Math.floor(reorderedUpdate.length / 2)];
  }
  return sum;
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
