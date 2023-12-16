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

const replaceUnknownByChar = (groups, newChar) =>
  groups.reduce((previous, [char, count]) => {
    if (previous.length === 0) {
      return [[char === "?" ? newChar : char, count]];
    }
    const [previousChar, previousCount] = previous.at(-1);
    if (
      (char === "?" && previousChar === newChar) ||
      (previousChar === "?" && char === newChar) ||
      (previousChar === newChar && char === newChar)
    ) {
      previous[previous.length - 1] = [newChar, previousCount + count];
      return previous;
    } else {
      return [...previous, [char === "?" ? newChar : char, count]];
    }
  }, []);

const mergeGroups = (groups) =>
  groups.reduce((previous, [char, count]) => {
    if (previous.length === 0) {
      return [[char, count]];
    }
    const [previousChar, previousCount] = previous.at(-1);
    if (previousChar === char) {
      previous[previous.length - 1] = [char, previousCount + count];
      return previous;
    } else {
      return [...previous, [char, count]];
    }
  }, []);

const replaceByBrokenChars = (groups, startIndex, size) => {
  const newGroups = [];
  let groupIndexStart = 0;
  const replaceZoneStart = startIndex;
  const replaceZoneEnd = startIndex + size - 1;
  for (let i = 0; i < groups.length; i++) {
    const [char, count] = groups[i];
    const groupIndexEnd = groupIndexStart + count - 1;
    if (groupIndexEnd < replaceZoneStart) {
      // Group is fully before replace zone
      newGroups.push([char, count]);
      groupIndexStart += count;
      continue;
    }
    if (groupIndexStart > replaceZoneEnd) {
      // group is fully after replace zone
      newGroups.push([char, count]);
      groupIndexStart += count;
      continue;
    }
    if (groupIndexStart < replaceZoneStart && groupIndexEnd > replaceZoneEnd) {
      // group covers the whole replace zone

      newGroups.push(
        [char, replaceZoneStart - groupIndexStart],
        ["#", size],
        [char, groupIndexEnd - replaceZoneEnd]
      );
      groupIndexStart += count;
      continue;
    }
    if (
      groupIndexStart < replaceZoneStart &&
      groupIndexEnd >= replaceZoneStart
    ) {
      // group overlaps with starts of replace zone
      const firstGroupSize = replaceZoneStart - groupIndexStart;
      newGroups.push([char, firstGroupSize], ["#", count - firstGroupSize]);
      groupIndexStart += count;
      continue;
    }
    if (
      groupIndexStart >= replaceZoneStart &&
      groupIndexEnd <= replaceZoneEnd
    ) {
      // group is fully inside replace zone
      newGroups.push(["#", count]);
      groupIndexStart += count;
      continue;
    }
    if (groupIndexStart >= replaceZoneStart && groupIndexEnd > replaceZoneEnd) {
      // group overlaps with end of replace zone
      const firstGroupSize = replaceZoneEnd - groupIndexStart + 1;
      newGroups.push(["#", firstGroupSize], [char, count - firstGroupSize]);
      groupIndexStart += count;
      continue;
    }

    throw new Error("replace did not fit any of the cases");
  }
  // Place dots before the startIndex
  const mergedGroups = mergeGroups(newGroups);
  let index = 0;
  for (const group of mergedGroups) {
    if (index < startIndex && group[0] === "?") {
      group[0] = ".";
    }
    index += group[1];
  }
  return mergedGroups;
};

const rebuildString = (groups) =>
  groups.reduce((previous, [char, count]) => previous + char.repeat(count), "");

const computeChildren = (groups, sizes) => {
  // let firstKnownBrokenGroupSize;
  // for (const [char, count] of groups) {
  //   if (char === "?") {
  //     break;
  //   }
  //   if (char === "#") {
  //     firstKnownBrokenGroupSize = count;
  //     break;
  //   }
  // }
  // if (firstKnownBrokenGroupSize && firstKnownBrokenGroupSize === sizes[0]) {
  //   return [{ groups, sizes: sizes.slice(1) }];
  // }

  const fullBrokenGroup = replaceUnknownByChar(groups, "#");
  const children = [];
  let index = 0;
  for (const [char, count] of fullBrokenGroup) {
    if (
      char === "." ||
      (char === "#" && count < sizes[0]) ||
      rebuildString(groups).substring(index, index + count) ===
        "#".repeat(count)
    ) {
      index += count;
      continue;
    }

    for (
      let startIndex = index;
      startIndex <= index + count - sizes[0];
      startIndex++
    ) {
      children.push(replaceByBrokenChars(groups, startIndex, sizes[0]));
    }

    index += count;
  }
  const result = children.map((newGroups) => ({
    groups: newGroups,
    sizes: sizes.slice(1),
  }));
  return result;
};

const getCacheKey = (groups, sizes) =>
  // TODO: size of space groups should not matter?
  groups.map((group) => group.join("")).join("");

const computeNumberOfPossibilities = (springsString, expectedSizes) => {
  const stack = [
    { groups: splitInGroups(springsString), sizes: [...expectedSizes] },
  ];
  let result = 0;
  const cache = {};

  while (stack.length > 0) {
    const { groups, sizes } = stack.pop();

    const cacheKey = getCacheKey(groups, sizes);
    // if (cache[cacheKey] !== undefined) {
    //   // console.log("Value in cache already");
    //   continue;
    // }

    // const hasUnknown = groups.filter(([char]) => char === "?").length > 0;
    // if (!hasUnknown) {
    //   const toAdd = isValidPossibility(groups, expectedSizes) ? 1 : 0;
    //   result += toAdd;
    //   cache[cacheKey] = toAdd;
    //   // if (toAdd === 1) {
    //   //   console.log({ groups: rebuildString(groups), sizes });
    //   // }
    //   continue;
    // }

    // if (sizes.length === 0) {
    //   const toAdd = isValidPossibility(
    //     replaceUnknownByChar(groups, "."),
    //     expectedSizes
    //   )
    //     ? 1
    //     : 0;
    //   result += toAdd;
    //   cache[cacheKey] = toAdd;
    //   // if (toAdd === 1) {
    //   //   console.log({ groups: rebuildString(groups), sizes });
    //   // }
    //   continue;
    // }

    const children = computeChildren(groups, sizes);

    if (children.length === 0) {
      const toAdd = isValidPossibility(
        replaceUnknownByChar(groups, "."),
        expectedSizes
      )
        ? 1
        : 0;
      result += toAdd;
      cache[cacheKey] = toAdd;
      if (toAdd === 1) {
        console.log({ groups: rebuildString(groups), sizes });
      }
      continue;
    }

    stack.push(...children);

    // stop if solution is false
    // if sizes has length 1, we can compute number of possibilities
    // if first of sizes corresponds to first group, move on to next
    // compute children and add them to the stack
  }
  return result;
};

const input = await parseTextInput(true);

// let inputIndex = 0;
// let result = 0;
// for (const { springsString, sizes } of input) {
//   inputIndex += 1;
//   const possibilitiesCount = computeNumberOfPossibilities(springsString, sizes);
//   console.log(`Input ${inputIndex}: ${possibilitiesCount} possibilities found`);
//   result += possibilitiesCount;
// }

// console.log("Result : ", result);

const testInput2 = {
  springsString: "?#?#?#?#?#?#?#?",
  sizes: [1, 3, 1, 6],
};
const groups = splitInGroups(testInput2.springsString);
console.log(groups);

const test = computeChildren(groups, testInput2.sizes);
console.dir(
  test.map(({ groups, sizes }) => ({ groups: rebuildString(groups), sizes })),
  { depth: null }
);

// const result = computeNumberOfPossibilities(
//   testInput2.springsString,
//   testInput2.sizes
// );
// console.log("Result : ", result);
