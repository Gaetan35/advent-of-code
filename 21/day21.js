import * as fs from "fs/promises";

const parseInput = async (test = false) => {
  const fileContent = (
    await fs.readFile(test ? "input_test.txt" : "input.txt")
  ).toString();
  const lines = fileContent.split("\n");
  return lines.reduce((acc, line) => {
    const [monkeyId, result] = line.split(": ");
    if (result.match(/\d+/g)) {
      return {
        ...acc,
        [monkeyId]: { isNumber: true, result: parseInt(result) },
      };
    }
    return {
      ...acc,
      [monkeyId]: {
        isNumber: false,
        result,
        dependsOnMonkeys: [result.substring(0, 4), result.substring(7)],
      },
    };
  }, {});
};

const computeMonkeyNumber = (monkeyId, monkeys) => {
  const { isNumber, result, dependsOnMonkeys } = monkeys[monkeyId];
  if (isNumber) {
    return result;
  }
  const term1 = computeMonkeyNumber(dependsOnMonkeys[0], monkeys);
  const term2 = computeMonkeyNumber(dependsOnMonkeys[1], monkeys);
  const number = eval(
    result
      .replace(dependsOnMonkeys[0], term1)
      .replace(dependsOnMonkeys[1], term2)
  );
  return number;
};

const monkeys = await parseInput(false);
const result = computeMonkeyNumber("root", monkeys);
console.log(result);
