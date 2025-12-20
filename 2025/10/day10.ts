import * as fs from "fs/promises";
import * as path from "path";
import solver from "javascript-lp-solver";

type IndicatorLight = "." | "#";
type Input = {
  wantedIndicatorLights: IndicatorLight[];
  buttons: number[][];
  joltage: number[];
}[];

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  return (await fs.readFile(filePath))
    .toString()
    .split("\n")
    .map((line) => {
      const [wantedIndicatorLightsRaw, buttonsAndJoltageRaw] = line
        .substring(1)
        .split("] ");
      const [buttonsRaw, joltageRaw] = buttonsAndJoltageRaw
        .slice(0, -1)
        .split(" {");

      return {
        wantedIndicatorLights: wantedIndicatorLightsRaw.split("") as (
          | "."
          | "#"
        )[],
        buttons: buttonsRaw
          .slice(1, -1)
          .split(") (")
          .map((button) => button.split(",").map(Number)),
        joltage: joltageRaw.split(",").map(Number),
      };
    });
};

type Part1Node = { lights: IndicatorLight[]; count: number };
function findMinButtonPressesForLights({
  wantedIndicatorLights,
  buttons,
}: Input[0]): number {
  let nodes: Part1Node[] = [
    {
      lights: Array.from(
        { length: wantedIndicatorLights.length },
        () => "." as const
      ),
      count: 0,
    },
  ];

  let wantedNode = nodes.find(
    (node) => node.lights.join("") === wantedIndicatorLights.join("")
  );
  while (!wantedNode) {
    const newNodes: Part1Node[] = [];

    for (const { lights, count } of nodes) {
      for (const button of buttons) {
        const newLights = [...lights];
        for (const index of button) {
          newLights[index] = newLights[index] === "." ? "#" : ".";
        }
        newNodes.push({
          count: count + 1,
          lights: newLights,
        });
      }
    }

    const uniqueLights = {};
    nodes = newNodes.filter((node) => {
      const joinedLights = node.lights.join("");
      const shouldKeep = !uniqueLights[joinedLights];
      if (shouldKeep) {
        uniqueLights[joinedLights] = true;
      }
      return shouldKeep;
    });

    wantedNode = nodes.find(
      (node) => node.lights.join("") === wantedIndicatorLights.join("")
    );
  }

  return wantedNode.count;
}

function part1(machines: Input) {
  let buttonPressesCount = 0;
  for (const machine of machines) {
    buttonPressesCount += findMinButtonPressesForLights(machine);
  }
  return buttonPressesCount;
}

const findMinButtonPressesForJoltage = ({
  buttons,
  joltage,
}: Input[0]): number => {
  const constraints = Object.fromEntries(
    joltage.map((value, index) => [`equation${index}`, { equal: value }])
  );
  const variables = Object.fromEntries(
    buttons.map((button, index) => {
      const contributions = Object.fromEntries(
        button.map((buttonIndex) => [`equation${buttonIndex}`, 1])
      );
      return [`x${index}`, { buttonPresses: 1, ...contributions }];
    })
  );

  const model = {
    optimize: "buttonPresses",
    opType: "min",
    constraints,
    variables,
    ints: Object.fromEntries(
      Array.from({ length: buttons.length }, (_, index) => [`x${index}`, 1])
    ),
  };
  const solutions = solver.Solve(model);
  if (!solutions.feasible) {
    throw Error("Could not find result for equation");
  }
  return solutions.result;
};

function part2(machines: Input) {
  let buttonPressesCount = 0;
  for (const machine of machines) {
    buttonPressesCount += findMinButtonPressesForJoltage(machine);
  }

  return buttonPressesCount;
}

async function main() {
  const IS_TEST = process.argv[2] === "test";
  const input = await parseTextInput(IS_TEST);

  const part1Result = part1(input);
  console.log("Part1 result: ", part1Result);

  const part2Result = part2(input);
  console.log("Part2 result: ", part2Result);
}

main();
