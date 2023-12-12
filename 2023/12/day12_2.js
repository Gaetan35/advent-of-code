import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => {
      const [springsString, sizesString] = line.split(" ");
      const repeatedSprings = springsString.concat("?").repeat(5);
      const sizes = sizesString
        .concat(",")
        .repeat(5)
        .split(",")
        .map(Number)
        .filter(Boolean);
      return {
        springs: [...repeatedSprings.substring(0, repeatedSprings.length - 1)],
        sizes,
      };
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

const brokenCountIsValid = (possibility, expectedSizes) => {
  const expectedBrokenCount = expectedSizes.reduce(
    (prev, size) => prev + size,
    0
  );
  let maximumBrokenCount = 0;
  let currentBrokenCount = 0;
  for (const char of possibility) {
    if (char !== ".") {
      maximumBrokenCount += 1;
    }
    if (char === "#") {
      currentBrokenCount += 1;
    }
  }

  return (
    maximumBrokenCount >= expectedBrokenCount &&
    currentBrokenCount <= expectedBrokenCount
  );
};

const isPossibleStart = (possibility, expectedSizes, startIndex) => {
  const maxGroupSize = Math.max(...expectedSizes);
  const actualSizes = [];
  let brokenCounted = 0;
  for (const char of possibility) {
    if (char === "?") {
      break;
    }
    if (char === "#") {
      brokenCounted += 1;
    } else {
      if (brokenCounted > 0) {
        actualSizes.push(brokenCounted);
        brokenCounted = 0;
      }
    }
  }
  if (brokenCounted > 0) {
    actualSizes.push(brokenCounted);
  }

  if (actualSizes.length < expectedSizes.length) {
    const remainingGroups = expectedSizes.slice(actualSizes.length);
    const minRemainingLength =
      remainingGroups.reduce((prev, groupSize) => prev + groupSize, 0) +
      remainingGroups.length -
      1;

    if (startIndex + minRemainingLength >= possibility.length) {
      return false;
    }
  }

  const isPossibleStart =
    actualSizes.length <= expectedSizes.length &&
    actualSizes.every((value, index) => {
      if (value > maxGroupSize) {
        return false;
      }
      if (index === actualSizes.length - 1 && brokenCounted > 0) {
        return value <= expectedSizes[index];
      }
      return value === expectedSizes[index];
    });

  return isPossibleStart;
};

const canBeValidPossibility = (possibility, expectedSizes, startIndex) => {
  if (!brokenCountIsValid(possibility, expectedSizes)) {
    return false;
  }

  if (!isPossibleStart(possibility, expectedSizes, startIndex)) {
    return false;
  }

  return true;
};

const computePossibilitiesIterative = (springs, sizes) => {
  let possibilities = [springs];
  for (let startIndex = 0; startIndex < springs.length; startIndex++) {
    console.log(possibilities.length);
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
    possibilities = newPossibilities.filter((possibility) =>
      canBeValidPossibility(possibility, sizes, startIndex)
    );
  }
  return possibilities.filter((possibility) =>
    isValidPossibility(possibility, sizes)
  );
};

const input = await parseTextInput(false);

// console.log(input[5].springs.join(""));

// let result = 0;
// let index = 1;
// for (const { springs, sizes } of input) {
//   console.time(`time for ${index}`);
//   const possibilities = computePossibilitiesIterative(springs, sizes);
//   console.log(`${index}: ${possibilities.length} possibilities`);
//   console.timeEnd(`time for ${index}`);
//   result += possibilities.length;
//   index += 1;
// }
// console.log(result);

const springs =
  "???##????????#??????##????????#??????##????????#??????##????????#??????##????????#??";
const sizes = [7, 4, 7, 4, 7, 4, 7, 4, 7, 4];

const possibilities = computePossibilitiesIterative([...springs], sizes);
console.log(possibilities.length);
