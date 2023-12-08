import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n");

  const directions = input[0];
  const graph = {};
  input.slice(2).forEach((line) => {
    const [node, neighbors] = line.substring(0, line.length - 1).split(" = (");
    const [left, right] = neighbors.split(", ");
    graph[node] = { L: left, R: right };
  });

  return [directions, graph];
};

const [directions, graph] = await parseTextInput(false);

let currentNode = "AAA";
let directionIndex = 0;
let steps = 0;
while (currentNode !== "ZZZ") {
  const direction = directions[directionIndex % directions.length];
  currentNode = graph[currentNode][direction];
  directionIndex += 1;
  steps += 1;
}
console.log(steps);
