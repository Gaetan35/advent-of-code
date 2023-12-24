import * as fs from "fs/promises";

const prettyPrint = (grid) => {
  console.log(grid.map((line) => line.join("|")).join("\n"));
};

const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => line.split("").map(Number));

  return input;
};

const deltasForLastDirection = {
  RIGHT: {
    true: [
      ["TOP", 0, -1],
      ["BOTTOM", 0, 1],
    ],
    false: [
      ["TOP", 0, -1],
      ["BOTTOM", 0, 1],
      ["RIGHT", 1, 0],
    ],
  },
  LEFT: {
    true: [
      ["TOP", 0, -1],
      ["BOTTOM", 0, 1],
    ],
    false: [
      ["LEFT", -1, 0],
      ["TOP", 0, -1],
      ["BOTTOM", 0, 1],
    ],
  },
  TOP: {
    true: [
      ["LEFT", -1, 0],
      ["RIGHT", 1, 0],
    ],
    false: [
      ["LEFT", -1, 0],
      ["TOP", 0, -1],
      ["RIGHT", 1, 0],
    ],
  },
  BOTTOM: {
    true: [
      ["LEFT", -1, 0],
      ["RIGHT", 1, 0],
    ],
    false: [
      ["LEFT", -1, 0],
      ["BOTTOM", 0, 1],
      ["RIGHT", 1, 0],
    ],
  },
};

const computeGraph = (grid) => {
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;
  const nodes = [
    {
      pos: [0, 0],
      lastDirections: ["START"],
    },
  ];
  const graph = {};

  let i = 0;
  while (nodes.length > 0) {
    i += 1;
    if (i % 1000000 === 0) {
      console.log(`${i}: ${nodes.length} nodes`);
    }
    const {
      pos: [x, y],
      lastDirections,
    } = nodes.pop();

    nodes.push(...computeNeighbors(grid, [x, y], lastDirections));
  }
  console.log(i);

  return graph;
};

const input = await parseTextInput(true);
prettyPrint(input);
