import * as fs from "fs/promises";
import * as path from "path";

type Input = {
  dxa: number;
  dxb: number;
  dya: number;
  dyb: number;
  xPrize: number;
  yPrize: number;
}[];

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  const slots = (await fs.readFile(filePath)).toString().split("\n\n");

  const buttonRegex = /Button [A-Z]: X\+(\d+), Y\+(\d+)/;
  const prizeRegex = /Prize: X=(\d+), Y=(\d+)/;

  return slots.map((slot) => {
    const [lineA, lineB, linePrize] = slot.split("\n");
    // console.log({ lineA, lineB, linePrize });

    const matchA = buttonRegex.exec(lineA);
    const matchB = buttonRegex.exec(lineB);
    const matchPrize = prizeRegex.exec(linePrize);

    if (!matchA) {
      console.log("No match in lineA");
    }

    if (!matchB) {
      console.log("No match in lineB");
    }

    if (!matchPrize) {
      console.log("No match in linePrize");
    }

    return {
      dxa: +matchA[1],
      dya: +matchA[2],
      dxb: +matchB[1],
      dyb: +matchB[2],
      xPrize: +matchPrize[1],
      yPrize: +matchPrize[2],
    };
  });
};

function part1(input: Input) {
  let totalCost = 0;
  for (const { dxa, dxb, dya, dyb, xPrize, yPrize } of input) {
    const possibilities = [];
    for (let countA = 0; countA <= 100; countA++) {
      for (let countB = 0; countB <= 100; countB++) {
        if (
          dxa * countA + dxb * countB === xPrize &&
          dya * countA + dyb * countB === yPrize
        ) {
          possibilities.push({
            countA,
            countB,
            tokenCost: 3 * countA + countB,
          });
        }
      }
    }
    if (possibilities.length === 0) {
      continue;
    }
    possibilities.sort((a, b) => a.tokenCost - b.tokenCost);
    totalCost += possibilities[0].tokenCost;
  }
  return totalCost;
}

function part2(input: Input) {
  return null;
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

// 53455 is too high
// 34855 is too low
