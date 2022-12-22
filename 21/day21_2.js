import * as fs from "fs/promises";

const parseInput = async (test = false) => {
  const fileContent = (
    await fs.readFile(test ? "input_test.txt" : "input.txt")
  ).toString();
  const lines = fileContent.split("\n");
  return lines.reduce((acc, line) => {
    const [monkeyId, result] = line.split(": ");
    if (monkeyId === "humn") {
      return { ...acc, [monkeyId]: { isUnknown: true } };
    }
    if (result.match(/\d+/g)) {
      return {
        ...acc,
        [monkeyId]: { isNumber: true, result: parseInt(result) },
      };
    }

    let operation = result;
    if (monkeyId === "root") {
      operation = result.substring(0, 4) + " === " + result.substring(7);
    }
    return {
      ...acc,
      [monkeyId]: {
        isNumber: false,
        result: operation,
        dependsOnMonkeys: [result.substring(0, 4), result.substring(7)],
      },
    };
  }, {});
};

const MONKEY_NUMBERS = {};
const computeMonkeyNumber = (monkeyId, monkeys) => {
  const { isNumber, isUnknown, result, dependsOnMonkeys } = monkeys[monkeyId];
  if (isUnknown) {
    MONKEY_NUMBERS[monkeyId] = "unknown";
    return "unknown";
  }
  if (isNumber) {
    MONKEY_NUMBERS[monkeyId] = result;
    return result;
  }
  const term1 = computeMonkeyNumber(dependsOnMonkeys[0], monkeys);
  const term2 = computeMonkeyNumber(dependsOnMonkeys[1], monkeys);
  const number = result
    .replace(dependsOnMonkeys[0], term1)
    .replace(dependsOnMonkeys[1], term2);
  if (isNaN(term1) || isNaN(term2)) {
    MONKEY_NUMBERS[monkeyId] = "(" + number + ")";
    return "(" + number + ")";
  }
  MONKEY_NUMBERS[monkeyId] = eval(number);
  return eval(number);
};

const invertOperation = (result, definedTerm, operation, definedTermIndex) => {
  if (operation === "=") return eval(definedTerm);
  if (operation === "/") {
    if (definedTermIndex === 1) {
      // result = definedTerm / x
      // x * result = definedTerm
      // x = definedTerm / result
      return eval(`${definedTerm} / ${result}`);
    } else if (definedTermIndex === 2) {
      // result = x / definedTerm
      // definedTerm * result = x
      return eval(`${result} * ${definedTerm}`);
    }
  }
  if (operation === "*") {
    // result = definedTerm * x
    // x = result / definedTerm
    return eval(`${result} / ${definedTerm}`);
  }
  if (operation === "+") {
    // result = definedTerm + x
    // x = result - definedTerm
    return eval(`${result} - ${definedTerm}`);
  }
  if (operation === "-") {
    if (definedTermIndex === 1) {
      // result = definedTerm - x
      // x = definedTerm - result
      return eval(`${definedTerm} - ${result}`);
    }
    if (definedTermIndex === 2) {
      // result = x - definedTerm
      // x = result + definedTerm
      return eval(`${result} + ${definedTerm}`);
    }
  }
};

const monkeys = await parseInput(false);
computeMonkeyNumber("root", monkeys);
const finalResult = { root: 0 };
let currentMonkeyId = "root";
let iterations = 0;
while (currentMonkeyId !== "humn") {
  iterations += 1;
  const currentMonkey = monkeys[currentMonkeyId];

  const result = finalResult[currentMonkeyId];
  const term1 = MONKEY_NUMBERS[currentMonkey.dependsOnMonkeys[0]];
  const term2 = MONKEY_NUMBERS[currentMonkey.dependsOnMonkeys[1]];
  const operation =
    currentMonkeyId === "root" ? "=" : currentMonkey.result.charAt(5);

  if (isNaN(term1)) {
    finalResult[currentMonkey.dependsOnMonkeys[0]] = invertOperation(
      result,
      term2,
      operation,
      2
    );

    currentMonkeyId = currentMonkey.dependsOnMonkeys[0];
  } else if (isNaN(term2)) {
    finalResult[currentMonkey.dependsOnMonkeys[1]] = invertOperation(
      result,
      term1,
      operation,
      1
    );

    currentMonkeyId = currentMonkey.dependsOnMonkeys[1];
  }
}

console.log(finalResult["humn"]);
