import * as fs from "fs/promises";

const prettyPrint = (grid) => {
  console.log(grid.map((line) => line.join("")).join("\n"));
};

const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n\n");

  const patterns = input.map((pattern) =>
    pattern.split("\n").map((line) => line.split(""))
  );

  return patterns;
};

const areMatchingHorizontalLines = (pattern, y1, y2) => {
  const WIDTH = pattern[0].length;
  for (let x = 0; x < WIDTH; x++) {
    if (pattern[y1][x] !== pattern[y2][x]) {
      return false;
    }
  }
  return true;
};

const areMatchingVerticalLines = (pattern, x1, x2) => {
  const HEIGHT = pattern.length;
  for (let y = 0; y < HEIGHT; y++) {
    if (pattern[y][x1] !== pattern[y][x2]) {
      return false;
    }
  }
  return true;
};

const findReflectionInPattern = (pattern) => {
  const HEIGHT = pattern.length;
  const WIDTH = pattern[0].length;

  const foundReflections = [];
  // horizontal check
  for (let y = 0; y < HEIGHT - 1; y++) {
    const areMatchingLines = areMatchingHorizontalLines(pattern, y, y + 1);
    if (areMatchingLines) {
      let isVerifiedReflection = true;

      for (let i = 1; i <= y; i++) {
        if (y - i < 0 || y + i + 1 >= HEIGHT) {
          continue;
        }
        const isMatching = areMatchingHorizontalLines(
          pattern,
          y - i,
          y + 1 + i
        );
        if (!isMatching) {
          isVerifiedReflection = false;
          break;
        }
      }

      if (isVerifiedReflection) {
        foundReflections.push({ direction: "horizontal", lowerCoordinate: y });
      }
    }
  }

  // vertical check
  for (let x = 0; x < WIDTH - 1; x++) {
    const areMatchingLines = areMatchingVerticalLines(pattern, x, x + 1);
    if (areMatchingLines) {
      let isVerifiedReflection = true;

      for (let i = 1; i <= x; i++) {
        if (x - i < 0 || x + i + 1 >= WIDTH) {
          continue;
        }
        const isMatching = areMatchingVerticalLines(pattern, x - i, x + i + 1);
        if (!isMatching) {
          isVerifiedReflection = false;
          break;
        }
      }

      if (isVerifiedReflection) {
        foundReflections.push({ direction: "vertical", lowerCoordinate: x });
      }
    }
  }

  return foundReflections;
};

const findReflectionWithSmudge = (pattern, originalReflection) => {
  const HEIGHT = pattern.length;
  const WIDTH = pattern[0].length;

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const originalCell = pattern[y][x];
      const changedCell = originalCell === "." ? "#" : ".";
      pattern[y][x] = changedCell;
      const reflections = findReflectionInPattern(pattern);
      pattern[y][x] = originalCell;
      if (reflections.length !== 0) {
        const reflection = reflections.find((foundReflection) => {
          return (
            foundReflection.direction !== originalReflection.direction ||
            foundReflection.lowerCoordinate !==
              originalReflection.lowerCoordinate
          );
        });
        if (reflection) {
          return reflection;
        }
      }
    }
  }
  console.log("No reflection with smudge found");
};

const patterns = await parseTextInput(false);

let result = 0;
let patternIndex = 1;
for (const pattern of patterns) {
  console.log(`\n\nPattern ${patternIndex} / ${patterns.length}`);
  const originalReflection = findReflectionInPattern(pattern)[0];
  console.log("Original reflection : ", originalReflection);
  const reflection = findReflectionWithSmudge(pattern, originalReflection);

  if (reflection.direction === "vertical") {
    result += reflection.lowerCoordinate + 1;
  } else if (reflection.direction === "horizontal") {
    result += (reflection.lowerCoordinate + 1) * 100;
  }

  patternIndex += 1;
}
console.log("Result : ", result);
