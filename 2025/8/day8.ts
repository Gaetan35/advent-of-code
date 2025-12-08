import * as fs from "fs/promises";
import * as path from "path";

type Pos = { x: number; y: number; z: number };
type Input = Pos[];

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  return (await fs.readFile(filePath))
    .toString()
    .split("\n")
    .map((line) => {
      const [x, y, z] = line.split(",").map(Number);
      return { x, y, z };
    });
};

const computeDistance = (
  { x: xA, y: yA, z: zA }: Pos,
  { x: xB, y: yB, z: zB }: Pos
) => Math.sqrt((xB - xA) ** 2 + (yB - yA) ** 2 + (zB - zA) ** 2);

const printBox = ({ x, y, z }: Pos) => `${x},${y},${z}`;

function part1(boxes: Input, IS_TEST: boolean) {
  const connections = [];

  for (let i = 0; i <= boxes.length - 2; i += 1) {
    for (let j = i + 1; j <= boxes.length - 1; j += 1) {
      const distance = computeDistance(boxes[i], boxes[j]);
      connections.push({ distance, indexes: `${i}-${j}` });
    }
  }
  const sortedConnections = connections.toSorted(
    (a, b) => b.distance - a.distance
  );

  let circuitIndex = 1;
  const circuitOfBox: Record<string, number> = {};
  const boxesInCircuit: Record<string, Set<number>> = {};
  let connectionsCount = 0;

  const CONNECTIONS_TO_BUILD = IS_TEST ? 10 : 1000;

  while (sortedConnections.length > 0) {
    if (connectionsCount === CONNECTIONS_TO_BUILD) {
      break;
    }
    connectionsCount += 1;

    const { indexes } = sortedConnections.pop();
    const [boxIndex1, boxIndex2] = indexes.split("-").map(Number);

    if (
      circuitOfBox[boxIndex1] !== undefined &&
      circuitOfBox[boxIndex2] === circuitOfBox[boxIndex1]
    ) {
      continue;
    }

    const assignedCircuit =
      circuitOfBox[boxIndex1] || circuitOfBox[boxIndex2] || circuitIndex++;

    if (!boxesInCircuit[assignedCircuit]) {
      boxesInCircuit[assignedCircuit] = new Set();
    }

    if (circuitOfBox[boxIndex1] && circuitOfBox[boxIndex2]) {
      boxesInCircuit[circuitOfBox[boxIndex2]].forEach((boxIndex) => {
        boxesInCircuit[circuitOfBox[boxIndex1]].add(boxIndex);
      });
      boxesInCircuit[circuitOfBox[boxIndex2]] = undefined;
    } else {
      boxesInCircuit[assignedCircuit].add(boxIndex1);
      boxesInCircuit[assignedCircuit].add(boxIndex2);
    }

    boxesInCircuit[assignedCircuit].forEach((boxIndex) => {
      circuitOfBox[boxIndex] = assignedCircuit;
    });
  }

  const circuitCounts = Array.from({ length: circuitIndex - 1 }, () => 0);
  Object.values(circuitOfBox).forEach((index) => {
    circuitCounts[index - 1] += 1;
  });
  const sortedCircuitCounts = circuitCounts.toSorted((a, b) => b - a);
  const [count1, count2, count3] = sortedCircuitCounts;

  return count1 * count2 * count3;
}

function part2(boxes: Input) {
  const connections = [];

  for (let i = 0; i <= boxes.length - 2; i += 1) {
    for (let j = i + 1; j <= boxes.length - 1; j += 1) {
      const distance = computeDistance(boxes[i], boxes[j]);
      connections.push({ distance, indexes: `${i}-${j}` });
    }
  }
  const sortedConnections = connections.toSorted(
    (a, b) => b.distance - a.distance
  );

  let circuitIndex = 1;
  const circuitOfBox: Record<string, number> = {};
  const boxesInCircuit: Record<string, Set<number>> = {};

  while (sortedConnections.length > 0) {
    const { indexes } = sortedConnections.pop();
    const [boxIndex1, boxIndex2] = indexes.split("-").map(Number);

    if (
      circuitOfBox[boxIndex1] !== undefined &&
      circuitOfBox[boxIndex2] === circuitOfBox[boxIndex1]
    ) {
      continue;
    }

    const assignedCircuit =
      circuitOfBox[boxIndex1] || circuitOfBox[boxIndex2] || circuitIndex++;

    if (!boxesInCircuit[assignedCircuit]) {
      boxesInCircuit[assignedCircuit] = new Set();
    }

    if (circuitOfBox[boxIndex1] && circuitOfBox[boxIndex2]) {
      boxesInCircuit[circuitOfBox[boxIndex2]].forEach((boxIndex) => {
        boxesInCircuit[circuitOfBox[boxIndex1]].add(boxIndex);
      });
      delete boxesInCircuit[circuitOfBox[boxIndex2]];
    } else {
      boxesInCircuit[assignedCircuit].add(boxIndex1);
      boxesInCircuit[assignedCircuit].add(boxIndex2);
    }

    boxesInCircuit[assignedCircuit].forEach((boxIndex) => {
      circuitOfBox[boxIndex] = assignedCircuit;
    });

    const unassignedBoxesCount =
      boxes.length - Object.keys(circuitOfBox).length;
    const circuitCount = Object.keys(boxesInCircuit).length;

    if (unassignedBoxesCount === 0 && circuitCount === 1) {
      return boxes[boxIndex1].x * boxes[boxIndex2].x;
    }
  }

  return null;
}

async function main() {
  const IS_TEST = process.argv[2] === "test";
  const input = await parseTextInput(IS_TEST);

  const part1Result = part1(input, IS_TEST);
  console.log("Part1 result: ", part1Result);

  const part2Result = part2(input);
  console.log("Part2 result: ", part2Result);
}

main();
