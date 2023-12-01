import * as fs from "fs/promises";

const parseInput = async (test = false) => {
  const fileContent = (
    await fs.readFile(test ? "input_test.txt" : "input.txt")
  ).toString();
  const lines = fileContent.split("\n");
  return lines;
};

const areValueInRightOrder = (leftValue, rightValue) => {
  if (Array.isArray(leftValue) && Array.isArray(rightValue)) {
    for (let i = 0; i < leftValue.length; i++) {
      if (rightValue[i] === undefined) {
        return false;
      }
      const comparison = areValueInRightOrder(leftValue[i], rightValue[i]);
      if (comparison !== "equal") {
        return comparison;
      }
    }
    return leftValue.length === rightValue.length ? "equal" : true;
  }

  if (Array.isArray(leftValue)) {
    return areValueInRightOrder(leftValue, [rightValue]);
  }

  if (Array.isArray(rightValue)) {
    return areValueInRightOrder([leftValue], rightValue);
  }

  if (leftValue === rightValue) return "equal";

  return leftValue < rightValue;
};

const lines = await parseInput(false);

// Part 1

const PAIRS_NUMBER = (lines.length + 1) / 3;
const pairs = [];
for (let i = 0; i < PAIRS_NUMBER; i++) {
  const pair = {
    left: JSON.parse(lines[i * 3]),
    right: JSON.parse(lines[i * 3 + 1]),
    index: i + 1,
  };
  pairs.push(pair);
}

let sum = 0;
for (const pair of pairs) {
  if (areValueInRightOrder(pair.left, pair.right) === true) {
    sum += pair.index;
  }
}
console.log("Part 1 result : ", sum);

// Part 2
const packets = lines
  .filter((line) => line !== "")
  .map((line) => JSON.parse(line));

const sortedPackets = [...packets, [[2]], [[6]]].sort((packetA, packetB) => {
  const order = areValueInRightOrder(packetA, packetB);
  if (order === "equal") return 0;
  return order ? -1 : 1;
});

const stringifiedDividerPackets = ["[[2]]", "[[6]]"];
let decoderKey = 1;
for (let i = 0; i < sortedPackets.length; i++) {
  if (stringifiedDividerPackets.includes(JSON.stringify(sortedPackets[i]))) {
    decoderKey *= i + 1;
  }
}
console.log("Part 2 result : ", decoderKey);
