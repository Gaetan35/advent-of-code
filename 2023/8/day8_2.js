import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n");

  const directions = input[0];
  const graph = {};
  const startingNodes = [];
  input.slice(2).forEach((line) => {
    const [node, neighbors] = line.substring(0, line.length - 1).split(" = (");
    const [left, right] = neighbors.split(", ");
    graph[node] = { L: left, R: right };
    if (node.at(-1) === "A") {
      startingNodes.push(node);
    }
  });

  return [directions, graph, startingNodes];
};

const findStepsToZNode = (startingNode, directions) => {
  let currentNode = startingNode;
  let directionIndex = 0;
  let steps = 0;
  let count = 0;
  while (currentNode.at(-1) !== "Z") {
    const direction = directions[directionIndex % directions.length];
    currentNode = graph[currentNode][direction];
    directionIndex += 1;
    steps += 1;
  }
  return steps;
};

const [directions, graph, startingNodes] = await parseTextInput(false);

const steps = [];
for (const startingNode of startingNodes) {
  steps.push(findStepsToZNode(startingNode, directions));
}
console.log(steps);
// Looking into prime factorization of each results, all numbers have exactly 2 prime factors, X * 263
// So multiply each number / 263, and multiply the result by 263 to get the least common multiple
const result = steps.reduce((previous, step) => previous * (step / 263), 1);
console.log(result * 263);
