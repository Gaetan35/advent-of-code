import * as fs from "fs/promises";
import * as path from "path";

type Input = {
  inputString: string;
  pairConversions: { [pair: string]: string };
};

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  const [inputString, pairConversions] = (await fs.readFile(filePath))
    .toString()
    .split("\n\n");

  return {
    inputString,
    pairConversions: Object.fromEntries(
      pairConversions.split("\n").map((line) => {
        const [pair, insertion] = line.split(" -> ");
        return [pair, insertion];
      })
    ),
  };
};

const computeCounts = ({
  steps,
  input: { inputString, pairConversions },
}: {
  steps: number;
  input: Input;
}) => {
  let countByPair: Record<string, number> = {};
  for (let i = 0; i <= inputString.length - 2; i++) {
    const pair = inputString[i] + inputString[i + 1];
    countByPair[pair] = (countByPair[pair] || 0) + 1;
  }

  for (let step = 0; step < steps; step++) {
    const newCountByPair: Record<string, number> = {};
    for (const [pair, count] of Object.entries(countByPair)) {
      const insertion = pairConversions[pair];
      if (insertion) {
        const newPair1 = pair[0] + insertion;
        const newPair2 = insertion + pair[1];
        newCountByPair[newPair1] = (newCountByPair[newPair1] || 0) + count;
        newCountByPair[newPair2] = (newCountByPair[newPair2] || 0) + count;
      } else {
        throw new Error(`No insertion found for pair: ${pair}`);
      }
    }
    countByPair = newCountByPair;

    // const totalLength =
    //   Object.values(countByPair).reduce((sum, count) => sum + count, 0) + 1;
    // console.log(`After step ${step + 1}, total length is ${totalLength}`);
  }

  const countByElement: Record<string, number> = {};

  for (const [pair, count] of Object.entries(countByPair)) {
    const first = pair[0];
    countByElement[first] = (countByElement[first] || 0) + count;
  }
  const lastElement = inputString.at(-1);
  countByElement[lastElement] += 1;

  const sortedFrequencies = Object.values(countByElement).sort((a, b) => a - b);

  return sortedFrequencies.at(-1) - sortedFrequencies[0];
};

function part1(input: Input) {
  return computeCounts({ steps: 10, input });
}

function part2(input: Input) {
  return computeCounts({ steps: 40, input });
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
