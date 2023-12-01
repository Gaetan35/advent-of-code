import * as fs from "fs/promises";

const parseInput = async (test = false) => {
  const fileContent = (
    await fs.readFile(test ? "input_test.txt" : "input.txt")
  ).toString();
  const lines = fileContent.split("\n");
  return lines.map((line) => {
    const [x, y, z] = line.split(",").map((str) => parseInt(str));
    return { x, y, z };
  });
};

const addExposedFace = (exposedFaces, x, y, z) => {
  if (exposedFaces[`${x}|${y}|${z}`] !== -1) {
    exposedFaces[`${x}|${y}|${z}`] = (exposedFaces[`${x}|${y}|${z}`] ?? 0) + 1;
  }
};

const getExposedFaces = (input) => {
  const exposedFaces = {};

  for (const { x, y, z } of input) {
    exposedFaces[`${x}|${y}|${z}`] = -1;

    addExposedFace(exposedFaces, x - 1, y, z);
    addExposedFace(exposedFaces, x + 1, y, z);

    addExposedFace(exposedFaces, x, y - 1, z);
    addExposedFace(exposedFaces, x, y + 1, z);

    addExposedFace(exposedFaces, x, y, z - 1);
    addExposedFace(exposedFaces, x, y, z + 1);
  }

  return exposedFaces;
};

const neighborsOffset = [
  { dx: -1, dy: 0, dz: 0 },
  { dx: 1, dy: 0, dz: 0 },
  { dx: 0, dy: -1, dz: 0 },
  { dx: 0, dy: 1, dz: 0 },
  { dx: 0, dy: 0, dz: -1 },
  { dx: 0, dy: 0, dz: 1 },
];

const isTrappedAir = (exposedFaces, key, input) => {
  const [startX, startY, startZ] = key.split("|").map((str) => parseInt(str));
  const visited = {};
  const start = { x: startX, y: startY, z: startZ, distance: 0 };
  const nodes = [start];
  while (nodes.length > 0) {
    const { x, y, z, distance } = nodes.pop();
    if (visited[`${x}|${y}|${z}`]) {
      continue;
    }
    if (distance >= input.length) {
      return false;
    }
    visited[`${x}|${y}|${z}`] = true;
    for (const { dx, dy, dz } of neighborsOffset) {
      const neighborKey = `${x + dx}|${y + dy}|${z + dz}`;
      if (exposedFaces[neighborKey] !== -1) {
        nodes.push({ x: x + dx, y: y + dy, z: z + dz, distance: distance + 1 });
      }
    }
  }
  console.log(key, "is trapped air");
  return true;
};

const input = await parseInput(false);

const exposedFaces = getExposedFaces(input);
// const part1Result = Object.values(exposedFaces)
//   .filter((value) => value !== -1)
//   .reduce((acc, value) => acc + value, 0);
// console.log("Part1 result : ", part1Result);
const part2Result = Object.entries(exposedFaces)
  .filter(
    ([key, value]) => value !== -1 && !isTrappedAir(exposedFaces, key, input)
  )
  .reduce((acc, [key, value]) => acc + value, 0);
console.log("Part 2 result : ", part2Result);
// console.log(isTrappedAir(exposedFaces, "2|2|5"));

// 3994 is too high
