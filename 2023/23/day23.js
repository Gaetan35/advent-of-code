import * as fs from "fs/promises";

const prettyPrint = (grid) => {
  console.log(grid.map((line) => line.join("")).join("\n"));
};

const parseTextInput = async (isTest = false) => {
  const grid = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => line.split(""));

  const startPos = [grid[0].indexOf("."), 0];
  const endPos = [grid.at(-1).indexOf("."), grid[0].length - 1];
  return [grid, startPos, endPos];
};

const DELTAS = [
  [-1, 0, "LEFT"],
  [1, 0, "RIGHT"],
  [0, -1, "UP"],
  [0, 1, "DOWN"],
];
const forbiddenDirection = {
  LEFT: "RIGHT",
  RIGHT: "LEFT",
  UP: "DOWN",
  DOWN: "UP",
};
const allowedSlopePerDirection = {
  LEFT: ["<"],
  RIGHT: [">"],
  UP: ["^"],
  DOWN: ["v"],
};

const computeNeighborsPos = (grid, { pos: [x, y], lastDirection }) => {
  const neighbors = [];
  for (const [dx, dy, direction] of DELTAS) {
    if (direction === forbiddenDirection[lastDirection]) {
      continue;
    }
    const newX = x + dx;
    const newY = y + dy;

    if (
      [".", ...allowedSlopePerDirection[direction]].includes(grid[newY]?.[newX])
    ) {
      neighbors.push({ pos: [newX, newY], lastDirection: direction });
    }
  }

  return neighbors;
};

const computeGraph = (grid, startPos, endPos) => {
  const startPosJoined = startPos.join("|");
  const endPosJoined = endPos.join("|");
  const graph = { [startPosJoined]: [], [endPosJoined]: [] };
  const tiles = [
    {
      pos: [...startPos],
      lastNode: startPosJoined,
      distance: 0,
      lastDirection: "DOWN",
    },
  ];
  const visitedNodes = {};
  while (tiles.length > 0) {
    const tile = tiles.pop();
    const lastNode = tile.lastNode;

    let neighborsPos = computeNeighborsPos(grid, tile);

    while (neighborsPos.length === 1) {
      const { pos, lastDirection } = neighborsPos[0];
      tile.pos[0] = pos[0];
      tile.pos[1] = pos[1];
      tile.distance += 1;
      tile.lastDirection = lastDirection;
      neighborsPos = computeNeighborsPos(grid, tile);
    }
    const currentPosJoined = tile.pos.join("|");

    // if (neighborsPos.length === 0) {
    //   if (currentPosJoined === endPosJoined) {
    //     graph[lastNode].push({
    //       node: currentPosJoined,
    //       distance: tile.distance,
    //     });
    //   }
    //   continue;
    // }

    // if (visitedNodes[currentPosJoined + tile.lastDirection]) {
    //   continue;
    // }
    // visitedNodes[currentPosJoined + tile.lastDirection] = true;

    graph[currentPosJoined] = graph[currentPosJoined] ?? [];
    if (
      !graph[lastNode].find(
        ({ node, distance }) =>
          node === currentPosJoined && distance === tile.distance
      )
    ) {
      graph[lastNode].push({ node: currentPosJoined, distance: tile.distance });
    }

    tiles.push(
      ...neighborsPos.map(({ pos, lastDirection }) => ({
        pos,
        lastNode: currentPosJoined,
        distance: 1,
        lastDirection,
      }))
    );
  }
  return graph;
};

const computeMaxPath = (graph, startPos, endPos) => {
  const nodes = [
    { pos: startPos.join("|"), distance: 0, visitedNodes: new Set() },
  ];
  const endPosJoined = endPos.join("|");
  let maxPathLength = 0;
  // console.log("Start nodes: ", nodes);
  while (nodes.length > 0) {
    const node = nodes.pop();
    // console.log(node);
    if (node.pos === endPosJoined) {
      if (node.distance > maxPathLength) {
        maxPathLength = node.distance;
      }
      console.log("Reached the end in: ", node.distance);
    }

    const neighbors = graph[node.pos].filter(
      (neighbor) => !node.visitedNodes.has(neighbor)
    );
    nodes.push(
      ...neighbors.map((neighbor) => {
        const newVisitedNodes = new Set(node.visitedNodes);
        newVisitedNodes.add(node.pos);
        return {
          pos: neighbor.node,
          distance: node.distance + neighbor.distance,
          visitedNodes: newVisitedNodes,
        };
      })
    );
  }
  return maxPathLength;
};

const [grid, startPos, endPos] = await parseTextInput(false);
prettyPrint(grid);
console.log("\n");
const graph = computeGraph(grid, startPos, endPos);

console.log(graph);
const maxPathLength = computeMaxPath(graph, startPos, endPos);
console.log("Result: ", maxPathLength);
