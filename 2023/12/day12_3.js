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

const replaceByBrokenChars = (groups, replaceZoneStart, size) => {
  const newGroups = [];
  let groupIndexStart = 0;
  const replaceZoneEnd = replaceZoneStart + size - 1;
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
  // Place dots before the replaceZoneStart
  const mergedGroups = mergeGroups(newGroups);
  let index = 0;
  for (const group of mergedGroups) {
    if (index < replaceZoneStart && group[0] === "?") {
      group[0] = ".";
    }
    index += group[1];
  }
  return mergedGroups;
};

const rebuildString = (groups) =>
  groups.reduce((previous, [char, count]) => previous + char.repeat(count), "");

const computeChildren = (groups, sizes, startIndex) => {
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
  const rebuiltString = rebuildString(groups);
  for (const [char, count] of fullBrokenGroup) {
    if (char === "." || (char === "#" && count < sizes[0])) {
      index += count;
      continue;
    }

    for (
      let replaceZoneStart = index;
      replaceZoneStart <= index + count - sizes[0];
      replaceZoneStart++
    ) {
      if (
        replaceZoneStart >= startIndex &&
        rebuiltString[replaceZoneStart - 1] !== "#" &&
        rebuiltString[replaceZoneStart + sizes[0]] !== "#"
      ) {
        // console.log("Replacing at : ", replaceZoneStart, sizes[0]);
        children.push({
          groups: replaceByBrokenChars(groups, replaceZoneStart, sizes[0]),
          sizes: sizes.slice(1),
          startIndex: replaceZoneStart + sizes[0],
        });
      }
    }

    index += count;
  }
  // const result = children.map((newGroups) => ({
  //   groups: newGroups,
  //   sizes: sizes.slice(1),
  // }));
  return children;
};

const getCacheKey = (groups, sizes, startIndex) =>
  // TODO: size of space groups should not matter?
  groups
    .map((group) => (group[0] === "." ? [".", 1] : group).join(""))
    // .map((group) => group.join(""))
    .join("")
    .concat("|")
    .concat(sizes.join(","))
    .concat(`|${startIndex}`);

const computeNumberOfPossibilities = (springsString, expectedSizes) => {
  const stack = [
    {
      groups: splitInGroups(springsString),
      sizes: [...expectedSizes],
      startIndex: 0,
    },
  ];
  let result = 0;
  const cache = {};

  while (stack.length > 0) {
    const { groups, sizes, startIndex } = stack.pop();

    const cacheKey = getCacheKey(groups, sizes, startIndex);
    if (cache[cacheKey] !== undefined) {
      // console.log("Value in cache already");
      result += cache[cacheKey];
      continue;
    }

    // const hasUnknown = groups.filter(([char]) => char === "?").length > 0;
    // if (!hasUnknown) {
    //   const toAdd = isValidPossibility(groups, expectedSizes) ? 1 : 0;
    //   result += toAdd;
    //   cache[cacheKey] = toAdd;
    //   if (toAdd === 1) {
    //     console.log({ groups: rebuildString(groups), sizes });
    //   }
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

    const children = computeChildren(groups, sizes, startIndex);

    if (children.length === 0 && sizes.length === 0) {
      const toAdd = isValidPossibility(
        replaceUnknownByChar(groups, "."),
        expectedSizes
      )
        ? 1
        : 0;
      result += toAdd;
      cache[cacheKey] = toAdd;
      // if (toAdd === 1) {
      //   console.log({ groups: rebuildString(groups), sizes });
      // }
      continue;
    }

    // stack.push(...children);
    const areAllChildrenInCache = children.every((child) => {
      return (
        cache[getCacheKey(child.groups, child.sizes, child.startIndex)] !==
        undefined
      );
    });
    if (areAllChildrenInCache) {
      const childrenSum = children.reduce((previous, child) => {
        return (
          previous +
          cache[getCacheKey(child.groups, child.sizes, child.startIndex)]
        );
      }, 0);
      // if (childrenSum > 1) {
      //   console.log("Using cache with sum : ", childrenSum);
      // }

      result += childrenSum;
      cache[cacheKey] = childrenSum;
    } else {
      stack.push(...children);
    }

    // stop if solution is false
    // if sizes has length 1, we can compute number of possibilities
    // if first of sizes corresponds to first group, move on to next
    // compute children and add them to the stack
  }
  // console.log(cache);
  return result;
};

const input = await parseTextInput(true);

let inputIndex = 0;
let result = 0;
for (const { springsString, sizes } of input) {
  inputIndex += 1;

  // const repeatedSprings = springsString;
  // const repeatedSizes = sizes;

  const repeatedSpringsRaw = springsString.concat("?").repeat(5);
  const repeatedSprings = repeatedSpringsRaw.substring(
    0,
    repeatedSpringsRaw.length - 1
  );
  const repeatedSizes = sizes.concat(sizes, sizes, sizes, sizes);

  const possibilitiesCount = computeNumberOfPossibilities(
    repeatedSprings,
    repeatedSizes
  );
  console.log(`Input ${inputIndex}: ${possibilitiesCount} possibilities found`);
  result += possibilitiesCount;
}

console.log("Result : ", result);

// const testInput2 = {
//   springsString: "####.#...#...",
//   sizes: [4, 1, 1],
//   startIndex: 4,
// };

// const groups = splitInGroups(testInput2.springsString);
// console.log(groups);

// const test = computeChildren(groups, testInput2.sizes, testInput2.startIndex);
// console.dir(
//   test.map(({ groups, ...others }) => ({
//     groups: rebuildString(groups),
//     ...others,
//   })),
//   { depth: null }
// );

// const result = computeNumberOfPossibilities(
//   testInput2.springsString,
//   testInput2.sizes
// );
// console.log("Result : ", result);

// Input 1: 2592 possibilities found
// Input 2: 1024 possibilities found
// Input 3: 68 possibilities found
// Input 4: 768 possibilities found
// Input 5: 843069 possibilities found
// Input 6: 7811529 possibilities found
// Input 7: 248832 possibilities found
// Input 8: 14176 possibilities found
// Input 9: 5184 possibilities found
// Input 10: 38810 possibilities found
// Input 11: 6035364 possibilities found
// Input 12: 16384 possibilities found
// Input 13: 1 possibilities found
// Input 14: 25001551 possibilities found
// Input 15: 724490 possibilities found
// Input 16: 608477 possibilities found
// Input 17: 305648 possibilities found
// Input 18: 243 possibilities found
// Input 19: 528 possibilities found
// Input 20: 226001 possibilities found
// Input 21: 2500 possibilities found
