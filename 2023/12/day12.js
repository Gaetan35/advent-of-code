import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => {
      const [springs, sizesString] = line.split(" ");
      const sizes = sizesString.split(",").map(Number);
      return { springs: [...springs], sizes };
    });

  return input;
};

const isValidPossibility = (possibility, expectedSizes) => {
  const actualSizes = [];
  let brokenCounted = 0;
  for (const char of possibility) {
    if (char === "#") {
      brokenCounted += 1;
    } else if (brokenCounted > 0) {
      actualSizes.push(brokenCounted);
      brokenCounted = 0;
    }
  }
  if (brokenCounted > 0) {
    actualSizes.push(brokenCounted);
  }

  return (
    actualSizes.length === expectedSizes.length &&
    actualSizes.every((value, index) => value === expectedSizes[index])
  );
};

const computePossibilities = (possibilities, startIndex, sizes) => {
  if (startIndex === possibilities[0].length) {
    return possibilities.filter((possibility) =>
      isValidPossibility(possibility, sizes)
    );
  }
  const newPossibilities = [];
  for (const possibility of possibilities) {
    if (possibility[startIndex] === "?") {
      const option1 = [...possibility];
      option1[startIndex] = ".";
      const option2 = [...possibility];
      option2[startIndex] = "#";
      newPossibilities.push(option1, option2);
    } else {
      newPossibilities.push(possibility);
    }
  }
  return computePossibilities(newPossibilities, startIndex + 1, sizes);
};

const input = await parseTextInput(false);

let result = 0;
for (const { springs, sizes } of input) {
  result += computePossibilities([springs], 0, sizes).length;
}
console.log(result);

// const test = "..#...#...###.";
// const testResult = isValidPossibility([...test], [1, 1, 3]);
// console.log(testResult);
