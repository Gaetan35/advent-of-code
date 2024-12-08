import * as fs from "fs/promises";
import * as path from "path";

const prettyPrint = (grid) => {
  console.log("\n");
  console.log(grid.map((line) => line.join("")).join("\n"));
  console.log("\n");
};

type Input = {
  grid: string[][];
  antennas: { [key: string]: { x: number; y: number }[] };
};

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  const grid = (await fs.readFile(filePath))
    .toString()
    .split("\n")
    .map((line) => line.split(""));

  const antennas = {};
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[0].length; x++) {
      const cell = grid[y][x];
      if (cell !== ".") {
        if (!antennas[cell]) {
          antennas[cell] = [];
        }
        antennas[cell].push({ x, y });
      }
    }
  }

  return { grid, antennas };
};

function part1({ grid, antennas }: Input) {
  const antiNodesPositions = {};
  for (const antennaPositions of Object.values(antennas)) {
    for (let i = 0; i < antennaPositions.length - 1; i++) {
      for (let j = i + 1; j < antennaPositions.length; j++) {
        const { x: xI, y: yI } = antennaPositions[i];
        const { x: xJ, y: yJ } = antennaPositions[j];

        const dx = xJ - xI;
        const dy = yJ - yI;

        const antinode1X = xJ + dx;
        const antinode1Y = yJ + dy;
        if (grid?.[antinode1Y]?.[antinode1X] !== undefined) {
          antiNodesPositions[`${antinode1X}|${antinode1Y}`] = true;
        }
        const antinode2X = xI - dx;
        const antinode2Y = yI - dy;
        if (grid?.[antinode2Y]?.[antinode2X] !== undefined) {
          antiNodesPositions[`${antinode2X}|${antinode2Y}`] = true;
        }
      }
    }
  }

  return Object.keys(antiNodesPositions).length;
}

function part2({ grid, antennas }: Input) {
  const antiNodesPositions = {};
  for (const antennaPositions of Object.values(antennas)) {
    for (let i = 0; i < antennaPositions.length - 1; i++) {
      for (let j = i + 1; j < antennaPositions.length; j++) {
        const { x: xI, y: yI } = antennaPositions[i];
        const { x: xJ, y: yJ } = antennaPositions[j];

        const dx = xJ - xI;
        const dy = yJ - yI;

        const antiNode1 = { x: xJ, y: yJ };
        while (grid?.[antiNode1.y]?.[antiNode1.x] !== undefined) {
          antiNodesPositions[`${antiNode1.x}|${antiNode1.y}`] = true;
          antiNode1.x += dx;
          antiNode1.y += dy;
        }

        const antiNode2 = { x: xI, y: yI };
        while (grid?.[antiNode2.y]?.[antiNode2.x] !== undefined) {
          antiNodesPositions[`${antiNode2.x}|${antiNode2.y}`] = true;
          antiNode2.x -= dx;
          antiNode2.y -= dy;
        }
      }
    }
  }

  return Object.keys(antiNodesPositions).length;
}

async function main() {
  const IS_TEST = process.argv[2] === "test";
  const input = await parseTextInput(IS_TEST);

  prettyPrint(input.grid);

  const part1Result = part1(input);
  console.log("Part1 result: ", part1Result);

  const part2Result = part2(input);
  console.log("Part2 result: ", part2Result);
}

main();
