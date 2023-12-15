import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => {
      const [springsString, sizesString] = line.split(" ");
      const sizes = sizesString.split(",").map(Number);
      return {
        springsString,
        sizes,
      };
    });

  return input;
};

const splitInGroups = (springs) => {
  const result = [];
  let currentChar = springs[0];
  let currentCount = 0;
  for (const char of springs) {
    if (char === currentChar) {
      currentCount += 1;
    } else {
      result.push([currentChar, currentCount]);
      currentCount = 1;
      currentChar = char;
    }
  }
  result.push([currentChar, currentCount]);
  return result;
};

const isValidPossibility = (groups, expectedGroups) => {
  const groupsWithoutSpaces = groups.filter(([char]) => char === "#");
  return (
    groupsWithoutSpaces.length === expectedGroups.length &&
    groupsWithoutSpaces.every(
      ([_, count], index) => count === expectedGroups[index]
    )
  );
};

const getCacheKey = (groups, sizes) =>
  groups.map((group) => group.join("")).join("") + "-" + sizes.join(",");

const computeNumberOfPossibilites = (springs, expectedSizes) => {
  const stack = [{ groups: splitInGroups(springs), sizes: [...expectedSizes] }];
  let result = 0;
  const cache = {};

  while (stack.length > 0) {
    const { groups, sizes } = stack.pop();

    const cacheKey = getCacheKey(groups, sizes);
    if (cache[cacheKey]) {
      result += cache[cacheKey];
      continue;
    }

    const hasUnknown = groups.filter(([char]) => char === "?").length > 0;
    if (!hasUnknown) {
      const toAdd = isValidPossibility(springs, sizes) ? 1 : 0;
      result += toAdd;
      cache[cacheKey] = toAdd;
    }

    // stop if solution is false
    // if sizes has length 1, we can compute number of possibilities
    // if first of sizes corresponds to first group, move on to next
    // compute children and add them to the stack
  }

  // const length = groups.reduce((prev, [_, count]) => prev + count, 0);
  // const minLength = expectedSizes.reduce((prev, size) => prev + size, 0);
  // if (length < minLength) {
  //   return 0;
  // }
};

const input = await parseTextInput(true);

const testInput1 = { springsString: "???.###", sizes: [1, 1, 3] };
const testInput2 = { springsString: "????.######..#####.", sizes: [1, 6, 5] };
const groups = splitInGroups(testInput2.springsString);
console.log(getCacheKey(groups, [1, 5, 6]));
