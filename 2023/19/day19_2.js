import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const [workflowsRaw, partsRaw] = (
    await fs.readFile(isTest ? "input_test.txt" : "input.txt")
  )
    .toString()
    .split("\n\n");

  const parts = partsRaw.split("\n").map((line) => {
    const [x, m, a, s] = line.match(/\d+/g).map(Number);
    return { x, m, a, s };
  });
  const workflows = {};
  workflowsRaw.split("\n").forEach((line) => {
    const [name, rest] = line.split("{");
    const rules = rest.substring(0, rest.length - 1).split(",");
    workflows[name] = rules.map((rule) => {
      const splitString = rule.split(":");
      if (splitString.length === 1) {
        return { condition: "true", destination: splitString[0] };
      }
      return { condition: splitString[0], destination: splitString[1] };
    });
  });
  return { parts, workflows };
};

const { workflows } = await parseTextInput(false);

const acceptedParts = [];
const parts = [
  {
    position: "in",
    x: [1, 4000],
    m: [1, 4000],
    a: [1, 4000],
    s: [1, 4000],
  },
];

while (parts.length > 0) {
  const part = parts.pop();
  if (part.position === "A") {
    acceptedParts.push(part);
    continue;
  }
  if (part.position === "R") {
    continue;
  }
  const rules = workflows[part.position];
  for (const { condition, destination } of rules) {
    if (condition === "true") {
      parts.push({ ...part, position: destination });
      break;
    }
    const variable = condition[0];
    const [partMin, partMax] = part[variable];
    const operator = condition[1];
    const number = Number(condition.substring(2));

    if (operator === "<") {
      if (partMax < number) {
        parts.push({ ...part, position: destination });
        break;
      }
      if (partMin >= number) {
        continue;
      }
      // partMin < number <= partMax
      const split1 = [partMin, number - 1];
      const split2 = [number, partMax];
      parts.push(
        { ...part, [variable]: split1, position: destination },
        { ...part, [variable]: split2 }
      );
      break;
    }

    if (operator === ">") {
      if (partMin > number) {
        parts.push({ ...part, position: destination });
        break;
      }
      if (partMax <= number) {
        continue;
      }
      // partMin <= number < partMax
      const split1 = [partMin, number];
      const split2 = [number + 1, partMax];
      parts.push(
        { ...part, [variable]: split1 },
        { ...part, [variable]: split2, position: destination }
      );
      break;
    }
  }
}

const result = acceptedParts.reduce((previous, part) => {
  const partPossibilites =
    (part.x[1] - part.x[0] + 1) *
    (part.m[1] - part.m[0] + 1) *
    (part.a[1] - part.a[0] + 1) *
    (part.s[1] - part.s[0] + 1);
  return previous + partPossibilites;
}, 0);

console.log(result);
