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

const rebuildString = (groups) =>
  groups.reduce((previous, [char, count]) => previous + char.repeat(count), "");

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
  const mergedGroups = mergeGroups(newGroups);

  const rebuiltString = rebuildString(mergedGroups);
  let newString = "";
  for (let i = 0; i < rebuiltString.length; i++) {
    const char = rebuiltString[i];
    if (i < replaceZoneStart && char === "?") {
      newString += ".";
    } else if (i === replaceZoneStart + size) {
      newString += ".";
    } else {
      newString += char;
    }
  }
  return splitInGroups(newString);
};

const computeChildren = (groups, sizes, startIndex) => {
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
        children.push({
          groups: replaceByBrokenChars(groups, replaceZoneStart, sizes[0]),
          sizes: sizes.slice(1),
          startIndex: replaceZoneStart + sizes[0],
        });
      }
    }

    index += count;
  }
  return children;
};

const getCacheKey = (groups, sizes, startIndex) =>
  groups
    .map((group) => (group[0] === "." ? [".", 1] : group).join(""))
    .join("")
    .concat("|")
    .concat(sizes.join(","))
    .concat(`|${startIndex}`);

const isInvalid = (groups, sizes, startIndex) => {
  const fullBrokenGroup = replaceUnknownByChar(groups, "#");
  let isInvalid = false;
  let groupStartIndex = 0;
  let i = 0;
  for (const [char, count] of fullBrokenGroup) {
    if (groupStartIndex + count >= startIndex) {
      return false;
    }

    if (char === "#") {
      if (count !== sizes[i]) {
        return true;
      }
      i += 1;
    }
    groupStartIndex += count;
  }
  return isInvalid;
};

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
      result += cache[cacheKey];
      continue;
    }

    if (isInvalid(groups, expectedSizes, startIndex)) {
      cache[cacheKey] = 0;
      continue;
    }

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
      continue;
    }

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
      result += childrenSum;
      cache[cacheKey] = childrenSum;
    } else {
      stack.push(...children);
    }
  }
  return result;
};

const input = await parseTextInput(false);

let inputIndex = 0;
let result = 0;
for (const { springsString, sizes } of input) {
  inputIndex += 1;

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
