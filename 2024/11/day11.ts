import * as fs from "fs/promises";
import * as path from "path";

type Input = number[];

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  return (await fs.readFile(filePath)).toString().split(" ").map(Number);
};

function findStonesNumber(input: Input, maxBlinks: number) {
  let stones = input.map((stone) => ({ number: stone, count: 1 }));

  for (let blink = 1; blink <= maxBlinks; blink++) {
    const stoneNumbers: Record<string, number> = {};

    for (const { number, count } of stones) {
      if (number === 0) {
        stoneNumbers[1] = (stoneNumbers[1] || 0) + count;
        continue;
      }

      const stoneString = number.toString();
      if (stoneString.length % 2 === 0) {
        const leftNumber = Number(
          stoneString.substring(0, stoneString.length / 2)
        );
        stoneNumbers[leftNumber] = (stoneNumbers[leftNumber] || 0) + count;

        const rightNumber = Number(
          stoneString.substring(stoneString.length / 2)
        );
        stoneNumbers[rightNumber] = (stoneNumbers[rightNumber] || 0) + count;
        continue;
      }

      stoneNumbers[number * 2024] = (stoneNumbers[number * 2024] || 0) + count;
    }

    stones = Object.entries(stoneNumbers).map(([number, count]) => ({
      number: Number(number),
      count,
    }));
  }
  return stones.reduce((acc, { count }) => acc + count, 0);
}

async function main() {
  const IS_TEST = process.argv[2] === "test";
  const input = await parseTextInput(IS_TEST);

  const part1Result = findStonesNumber(input, 25);
  console.log("Part1 result: ", part1Result);

  const part2Result = findStonesNumber(input, 75);
  console.log("Part2 result: ", part2Result);
}

main();
