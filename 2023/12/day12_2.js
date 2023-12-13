import * as fs from "fs/promises";

const replaceAt = (string, index, replacement) => {
  return (
    string.substring(0, index) +
    replacement +
    string.substring(index + replacement.length)
  );
};

const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => {
      const [springsString, sizesString] = line.split(" ");
      const repeatedSprings = springsString;
      const sizes = sizesString.split(",").map(Number);
      return {
        springs: repeatedSprings,
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
    // console.log(
    //   `${startIndex} / ${springs.length - 1}: ${possibilities.length}`
    // );
    const newPossibilities = [];
    for (const possibility of possibilities) {
      if (possibility[startIndex] === "?") {
        const option1 = replaceAt(possibility, startIndex, ".");
        const option2 = replaceAt(possibility, startIndex, "#");
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

// const input = await parseTextInput(false);

// let result = 0;
// let index = 1;
// for (const { springs, sizes } of input) {
//   console.time(`time for ${index}`);

//   const simpleCount = computePossibilitiesIterative(springs, sizes).length;
//   const duplicatedSpring = springs.concat("?", springs);
//   const duplicatedSizes = sizes.concat(sizes);
//   const doubledCount = computePossibilitiesIterative(
//     duplicatedSpring,
//     duplicatedSizes
//   ).length;

//   const ratio = doubledCount / simpleCount;
//   if (Math.round(ratio) !== ratio) {
//     throw new Error("ratio is not an int");
//   }
//   const fullCount = doubledCount * Math.pow(ratio, 3);

//   // const repeatedSpringsRaw = springs.concat("?").repeat(5);
//   // const repeatedSprings = repeatedSpringsRaw.substring(
//   //   0,
//   //   repeatedSpringsRaw.length - 1
//   // );
//   // const repeatedSizes = sizes.concat(sizes, sizes, sizes, sizes);

//   // const possibilities = computePossibilitiesIterative(
//   //   repeatedSprings,
//   //   repeatedSizes
//   // );
//   console.log("\n\n");
//   // console.log(`${index}: ${possibilities.length} possibilities`);
//   console.log(`${index}: ${fullCount} possibilities`);
//   console.timeEnd(`time for ${index}`);
//   console.log("\n\n");

//   // result += possibilities.length;
//   result += fullCount;
//   index += 1;
// }
// console.log(result);

// ???##????????#?? 7,4
const springs = "???##????????#??";
const sizes = [7, 4];

const possibilities = computePossibilitiesIterative(springs, sizes);

console.log(possibilities.length);

// test:
// input5: 11 - 183 - 3045 - 50667 - 843069

// results as I duplicate:
// input3: 1 - 2 - 6 - 20 - 68
// input5: 11 - 183 - 3045 - 50667 - 843069

// Found real answers for real input:

// 1: 2592 possibilities
// 2: 1024 possibilities
// 3: 68 possibilities
// 4: 768 possibilities
// 5: 843069 possibilities
