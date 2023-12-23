import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const grid = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => line.split("").map((char) => (char === "#" ? "#" : ".")));

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

const computeNeighborsPos = (grid, { pos: [x, y], lastDirection }) => {
  const neighbors = [];
  for (const [dx, dy, direction] of DELTAS) {
    if (direction === forbiddenDirection[lastDirection]) {
      continue;
    }
    const newX = x + dx;
    const newY = y + dy;

    if (grid[newY]?.[newX] === ".") {
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
  let i = 0;
  while (tiles.length > 0) {
    i += 1;

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

    const key = [currentPosJoined, lastNode, tile.distance].join("-");
    if (visitedNodes[key]) {
      continue;
    }
    visitedNodes[key] = true;

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
  let i = 0;
  while (nodes.length > 0) {
    i += 1;
    const node = nodes.pop();
    if (node.pos === endPosJoined && node.distance > maxPathLength) {
      console.log("Reached the end in: ", node.distance);
      maxPathLength = node.distance;
    }

    const neighbors = graph[node.pos].filter(
      (neighbor) => !node.visitedNodes.has(neighbor.node)
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
const graph = computeGraph(grid, startPos, endPos);
console.log("Number of nodes: ", Object.keys(graph).length);
const maxPathLength = computeMaxPath(graph, startPos, endPos);
console.log("Result: ", maxPathLength);
