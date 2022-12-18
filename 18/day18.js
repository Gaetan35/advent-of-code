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

const input = await parseInput(true);

const addExposedFace = (exposedFaces, x, y, z) => {
  if (exposedFaces[`${x}|${y}|${z}`] !== -1) {
    exposedFaces[`${x}|${y}|${z}`] = (exposedFaces[`${x}|${y}|${z}`] ?? 0) + 1;
  }
};

const getPart1Result = (input) => {
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

  return Object.values(exposedFaces)
    .filter((value) => value !== -1)
    .reduce((acc, value) => acc + value, 0);
};

console.log("Exposed faces : ", getPart1Result(input));
