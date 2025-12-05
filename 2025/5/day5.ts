import * as fs from "fs/promises";
import * as path from "path";

type Input = { ranges: { min: number; max: number }[]; ids: number[] };

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  const [rangesPart, idsPart] = (await fs.readFile(filePath))
    .toString()
    .split("\n\n");

  const ranges = rangesPart.split("\n").map((line) => {
    const [min, max] = line.split("-").map(Number);
    return { min, max };
  });

  const ids = idsPart.split("\n").map(Number);

  return { ranges, ids };
};

function part1({ ranges, ids }: Input) {
  let result = 0;
  for (const id of ids) {
    for (const { min, max } of ranges) {
      if (id >= min && id <= max) {
        result += 1;
        break;
      }
    }
  }
  return result;
}

function part2({ ranges }: Input) {
  const sortedRanges = ranges.toSorted(
    (rangeA, rangeB) => rangeA.min - rangeB.min
  );

  const mergedRanges: Input["ranges"] = [];

  for (const newRange of sortedRanges) {
    const lastRange = mergedRanges.at(-1);
    if (!lastRange) {
      mergedRanges.push(newRange);
      continue;
    }

    if (newRange.min > lastRange.max || newRange.max < lastRange.min) {
      // The two ranges are completely separated
      mergedRanges.push(newRange);
      continue;
    }

    if (newRange.min >= lastRange.min && newRange.max <= lastRange.max) {
      // newRange is included inside lastRange
      continue;
    }

    if (newRange.min >= lastRange.min && newRange.min <= lastRange.max) {
      // overlap, newRange goes further to the right
      lastRange.max = newRange.max;
    }
  }

  return mergedRanges.reduce(
    (acc, range) => acc + range.max - range.min + 1,
    0
  );
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
