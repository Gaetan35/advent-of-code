import * as fs from "fs/promises";
import * as path from "path";

type Input = Record<string, string[]>;

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test2.txt" : "input.txt"
  );

  const graph = {};
  (await fs.readFile(filePath))
    .toString()
    .split("\n")
    .forEach((line) => {
      const [input, outputsRaw] = line.split(": ");
      const outputs = outputsRaw.split(" ");
      graph[input] = outputs;
    });

  return graph;
};

function part1(graph: Input) {
  const nodes = ["you"];
  let result = 0;
  while (nodes.length > 0) {
    const node = nodes.pop();

    if (node === "out") {
      result += 1;
      continue;
    }

    nodes.push(...graph[node]);
  }
  return result;
}

type Node = {
  value: string;
  hasVisitedFft: boolean;
  hasVisitedDac: boolean;
  weight: number;
};

function part2(graph: Input) {
  let nodes: Node[] = [
    {
      value: "svr",
      hasVisitedDac: false,
      hasVisitedFft: false,
      weight: 1,
    },
  ];
  let result = 0;

  while (nodes.length > 0) {
    const node = nodes.shift();

    if (node.value === "out") {
      if (node.hasVisitedDac && node.hasVisitedFft) {
        result += node.weight;
      }
      continue;
    }

    nodes.push(
      ...graph[node.value].map((output) => {
        return {
          value: output,
          hasVisitedDac: node.hasVisitedDac || output === "dac",
          hasVisitedFft: node.hasVisitedFft || output === "fft",
          weight: node.weight,
        };
      })
    );

    const uniqueNodes = {};
    nodes.forEach((node2) => {
      const key = `${node2.value}-dac${node2.hasVisitedDac}-fft${node2.hasVisitedFft}`;
      if (!uniqueNodes[key]) {
        uniqueNodes[key] = node2;
      } else {
        uniqueNodes[key].weight += node2.weight;
      }
    });

    nodes = Object.values(uniqueNodes);
  }
  return result;
}

async function main() {
  const IS_TEST = process.argv[2] === "test";
  const input = await parseTextInput(IS_TEST);

  // const part1Result = part1(input);
  // console.log("Part1 result: ", part1Result);

  const part2Result = part2(input);
  console.log("Part2 result: ", part2Result);
}

main();
