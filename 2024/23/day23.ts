import * as fs from "fs/promises";
import * as path from "path";

type Input = { connections: Record<string, string[]>; computers: string[] };

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  const connections: Record<string, string[]> = {};
  (await fs.readFile(filePath))
    .toString()
    .split("\n")
    .forEach((line) => {
      const [from, to] = line.split("-");
      if (!connections[from]) {
        connections[from] = [];
      }
      if (!connections[to]) {
        connections[to] = [];
      }
      connections[from].push(to);
      connections[to].push(from);
    });
  return { connections, computers: Object.keys(connections) };
};

function part1({ connections, computers }: Input) {
  const groups = new Set<string>();
  for (const computer of computers) {
    for (const secondComputer of connections[computer]) {
      for (const thirdComputer of connections[computer]) {
        if (thirdComputer === computer || thirdComputer === secondComputer) {
          continue;
        }
        if (
          connections[secondComputer].includes(thirdComputer) &&
          [computer, secondComputer, thirdComputer].some((c) =>
            c.startsWith("t")
          )
        ) {
          const key = [computer, secondComputer, thirdComputer]
            .sort()
            .join("-");
          groups.add(key);
        }
      }
    }
  }
  return groups.size;
}

function part2({ connections, computers }: Input) {
  const groups = new Set<string>();
  for (const computer of computers) {
    const group = [computer];
    for (const neighbor of connections[computer]) {
      if (group.every((c) => connections[c].includes(neighbor))) {
        group.push(neighbor);
      }
    }
    groups.add(group.sort().join(","));
  }

  return [...groups].sort((a, b) => b.length - a.length)[0];
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
