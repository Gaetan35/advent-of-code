import * as fs from "fs/promises";
import * as path from "path";

type Input = { patterns: string[]; designs: string[] };

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  const [patternsPart, designPart] = (await fs.readFile(filePath))
    .toString()
    .split("\n\n");

  return {
    patterns: patternsPart.split(", "),
    designs: designPart.split("\n"),
  };
};

function part1({ patterns, designs }: Input) {
  let possibleDesigns = 0;

  for (const design of designs) {
    const nodes = [""];
    while (nodes.length) {
      const node = nodes.pop();
      if (node === design) {
        possibleDesigns++;
        break;
      }

      for (const pattern of patterns) {
        if (design.endsWith(pattern + node)) {
          nodes.push(pattern + node);
        }
      }
    }
  }
  return possibleDesigns;
}

function part2({ patterns, designs }: Input) {
  let possibleDesigns = 0;

  for (const design of designs) {
    const nodes = [{ totalString: "", previous: [] }];
    const cache = {};
    while (nodes.length) {
      const { totalString, previous } = nodes.pop();
      if (totalString === design) {
        possibleDesigns++;
        for (const prev of previous) {
          cache[prev] = cache[prev] ? cache[prev] + 1 : 1;
        }
        continue;
      }
      if (cache[totalString]) {
        for (const prev of previous) {
          cache[prev] = cache[prev]
            ? cache[prev] + cache[totalString]
            : cache[totalString];
        }
        possibleDesigns += cache[totalString];
        continue;
      }

      for (const pattern of patterns) {
        const newNode = pattern + totalString;
        if (design.endsWith(newNode)) {
          nodes.push({
            totalString: newNode,
            previous: [...previous, totalString],
          });
        }
      }
    }
  }
  return possibleDesigns;
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
