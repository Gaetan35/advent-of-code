import * as fs from "fs/promises";

const parseInput = async (test = false) => {
  const fileContent = (
    await fs.readFile(test ? "input_test.txt" : "input.txt")
  ).toString();
  const lines = fileContent.split("\n");
  const monkeys = {};
  const monkeyNumber = (lines.length + 1) / 7;
  for (let i = 0; i < monkeyNumber; i++) {
    const items = lines[i * 7 + 1]
      .split(":")[1]
      .split(",")
      .map((str) => parseInt(str));

    const operation = (worryLevel) =>
      eval(lines[i * 7 + 2].split("=")[1].replace(/old/g, worryLevel));

    const divisibleBy = parseInt(lines[i * 7 + 3].split("by")[1].trim());
    const trueMonkey = lines[i * 7 + 4].split("monkey")[1].trim();
    const falseMonkey = lines[i * 7 + 5].split("monkey")[1].trim();
    const getNewMonkey = (worryLevel) => {
      return worryLevel % divisibleBy === 0 ? trueMonkey : falseMonkey;
    };
    monkeys[i] = {
      items,
      operation,
      getNewMonkey,
      divisibleBy,
    };
  }
  return monkeys;
};

const monkeys = await parseInput(false);

const ROUNDS_NUMBER = 10000;
const MONKEYS_NUMBER = Object.keys(monkeys).length;
const MODULO = Object.values(monkeys).reduce(
  (previousValue, monkey) => previousValue * monkey.divisibleBy,
  1
);

const inspectedItemsPerMonkey = {};
for (let round = 1; round <= ROUNDS_NUMBER; round++) {
  for (let monkeyNumber = 0; monkeyNumber < MONKEYS_NUMBER; monkeyNumber++) {
    const monkey = monkeys[monkeyNumber];
    for (let item of monkey.items) {
      inspectedItemsPerMonkey[monkeyNumber] =
        (inspectedItemsPerMonkey[monkeyNumber] ?? 0) + 1;
      const newWorryLevel = monkey.operation(item) % MODULO;
      const newMonkey = monkey.getNewMonkey(newWorryLevel);
      monkeys[newMonkey].items.push(newWorryLevel);
    }
    monkey.items = [];
  }
}

// console.log(monkeys);
// console.log(inspectedItemsPerMonkey);

const [max, secondMax] = Object.values(inspectedItemsPerMonkey)
  .sort((a, b) => b - a)
  .slice(0, 2);
const result = max * secondMax;
console.log(result);
