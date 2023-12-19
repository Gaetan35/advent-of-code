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

const { parts, workflows } = await parseTextInput(false);
// console.dir(workflows, { depth: null });

const acceptedParts = [];
const rejectedParts = [];
for (const part of parts) {
  let position = "in";
  while (position !== "A" && position !== "R") {
    const rules = workflows[position];
    for (const { condition, destination } of rules) {
      const realCondition = condition
        .replace("x", part.x)
        .replace("m", part.m)
        .replace("a", part.a)
        .replace("s", part.s);
      if (eval(realCondition)) {
        position = destination;
        break;
      }
    }
  }
  if (position === "A") {
    acceptedParts.push(part);
  } else if (position === "R") {
    rejectedParts.push(part);
  }
}

const result = acceptedParts.reduce(
  (prev, { x, m, a, s }) => prev + x + m + a + s,
  0
);
// console.log(acceptedParts);
console.log("Result : ", result);
