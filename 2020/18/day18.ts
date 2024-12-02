import * as fs from "fs/promises";

type Input = ("(" | ")" | "+" | "*" | number)[][];

const parseTextInput = async (isTest = false): Promise<Input> => {
  return (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) =>
      line
        .replaceAll(" ", "")
        .split("")
        .map((c) => (/[\d]/.test(c) ? parseInt(c) : c))
    ) as any;
};

const operations = {
  "+": (a: number, b: number) => a + b,
  "*": (a: number, b: number) => a * b,
};

const evaluateLine = (line: ("(" | ")" | "+" | "*" | number)[]) => {
  // console.log("Line : ", line);
  if (line.length === 1) {
    return line[0];
  }
  const stack = [];

  const pushToStack = (item) => {
    let last = stack;
    while (Array.isArray(last.at(-1))) {
      last = last.at(-1);
    }
    last.push(item);
  };

  const getLastItem = () => {
    let last = stack;
    while (Array.isArray(last.at(-1))) {
      last = last.at(-1);
    }
    return last.at(-1);
  };

  const popLastItem = () => {
    let last = stack;
    while (Array.isArray(last.at(-1))) {
      last = last.at(-1);
    }
    return last.pop();
  };

  const replaceLastItem = (item) => {
    let last = stack;
    while (Array.isArray(last.at(-1)) && Array.isArray(last.at(-1).at(-1))) {
      last = last.at(-1);
    }
    // console.log("in replace : ", { last, item });
    last[last.length - 1] = evaluateLine(last[last.length - 1]);
  };

  for (const token of line) {
    console.log("stack: ", stack);
    // if (Array.isArray(token)) {
    //   pushToStack(evaluateLine(token));
    //   continue;
    // }

    if (token === "(") {
      pushToStack([]);
      continue;
    }
    if (token === ")") {
      const lastItem = getLastItem();
      // console.log(lastItem);
      // if (Array.isArray(lastItem)) {
      //   const result = evaluateLine(lastItem);
      //   console.log({ lastItem, result });
      // }
      replaceLastItem(getLastItem());
      // console.log("replace last, after replace : ", stack);
      continue;
    }

    const lastItem = getLastItem();
    if (typeof token === "number" && ["+", "*"].includes(lastItem)) {
      const operator = popLastItem();
      const operand = popLastItem();
      pushToStack(operations[operator](operand, token));
      continue;
    }

    pushToStack(token);
  }

  console.log("Reached end of function");
  return stack.length > 1 ? evaluateLine(stack) : stack[0];
};

function part1(input: Input) {
  let sum = 0;
  for (const line of input) {
    const lineResult = evaluateLine(line);
    console.log("Result: ", lineResult);
    sum += lineResult;
  }
  return sum;
}

function part2(input: Input) {
  return null;
}

async function main() {
  const IS_TEST = process.argv[2] === "test";
  const input = await parseTextInput(IS_TEST);

  console.log("Input: ", input);

  const part1Result = part1(input);
  console.log("Part1 result: ", part1Result);

  const part2Result = part2(input);
  console.log("Part2 result: ", part2Result);
}

main();
