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

function part1(input: Input) {
  const MAX_BLINKS = 25;
  let stones = [...input];
  for (let blink = 1; blink <= MAX_BLINKS; blink++) {
    const newStones = [];
    for (const stone of stones) {
      if (stone === 0) {
        newStones.push(1);
        continue;
      }

      const stoneString = stone.toString();
      if (stoneString.length % 2 === 0) {
        newStones.push(
          Number(stoneString.substring(0, stoneString.length / 2))
        );
        newStones.push(Number(stoneString.substring(stoneString.length / 2)));
        continue;
      }

      newStones.push(stone * 2024);
    }
    stones = newStones;
  }
  return stones.length;
}

function part2(input: Input) {
  const MAX_BLINKS = 5;
  let stones = input.map((stone) => ({ number: stone, count: 1 }));
  console.log("Input length: ", stones.length);
  console.log("Blink 0: ", stones);
  for (let blink = 1; blink <= MAX_BLINKS; blink++) {
    const newStones = [];
    for (const { number, count } of stones) {
      if (number === 0) {
        newStones.push({ number: 1, count });
        continue;
      }

      const stoneString = number.toString();
      if (stoneString.length % 2 === 0) {
        newStones.push({
          number: Number(stoneString.substring(0, stoneString.length / 2)),
          count,
        });
        newStones.push({
          number: Number(stoneString.substring(stoneString.length / 2)),
          count,
        });
        continue;
      }

      newStones.push({ number: number * 2024, count });
    }

    stones = newStones;
    console.log(`Length after blink ${blink}: ${stones.length}`, stones);
  }
  return stones.length;
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
