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
        return { direction: "horizontal", coordinates: [y, y + 1] };
      }
    }
  }

  // vertical check
  for (let x = 0; x < WIDTH - 1; x++) {
    const areMatchingLines = areMatchingVerticalLines(pattern, x, x + 1);
    if (areMatchingLines) {
      // console.log(`Found vertical candidate between ${x} and ${x + 1}`);
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
        return { direction: "vertical", coordinates: [x, x + 1] };
      }
    }
  }

  console.log("No reflection found");
  // throw new Error("no reflection found");
};

const patterns = await parseTextInput(false);

let result = 0;
for (const pattern of patterns) {
  const reflection = findReflectionInPattern(pattern);
  if (reflection.direction === "vertical") {
    result += reflection.coordinates[0] + 1;
  } else if (reflection.direction === "horizontal") {
    result += (reflection.coordinates[0] + 1) * 100;
  }
}
console.log("Result : ", result);
