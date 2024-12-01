import * as fs from "fs/promises";

const prettyPrint = (grid) => {
  console.log("\n");
  console.log(grid.map((line) => line.join("")).join("\n"));
  console.log("\n");
};

const parseTextInput = async (isTest = false) => {
  return (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => line.split(""));
};

const part1 = async (inputGrid: string[][]) => {
  const adjacentSeats = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
  ];

  let hasChanged = true;
  let iterations = 0;

  let grid = inputGrid.map((row) => [...row]);

  while (hasChanged) {
    const newGrid = grid.map((row) => [...row]);
    hasChanged = false;
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[0].length; x++) {
        const seat = grid[y][x];
        if (seat === ".") continue;

        let occupiedSeats = 0;
        for (const [dx, dy] of adjacentSeats) {
          let cx = x + dx;
          let cy = y + dy;
          if (cy >= 0 && cy < grid.length && cx >= 0 && cx < grid[0].length) {
            if (grid[cy][cx] === "#") {
              occupiedSeats++;
            }
          }
        }

        if (seat === "L" && occupiedSeats === 0) {
          newGrid[y][x] = "#";
          hasChanged = true;
        } else if (seat === "#" && occupiedSeats >= 4) {
          newGrid[y][x] = "L";
          hasChanged = true;
        }
      }
    }
    grid = newGrid;
    iterations++;
  }

  const occupiedSeats = grid.flat().filter((seat) => seat === "#").length;
  return occupiedSeats;
};

const part2 = async (inputGrid: string[][]) => {};

async function main() {
  const IS_TEST = false;

  const grid = await parseTextInput(IS_TEST);

  const part1Result = await part1(grid);

  console.log("Part 1: ", part1Result);
}

main();
