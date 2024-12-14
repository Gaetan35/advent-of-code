import * as fs from "fs/promises";
import * as path from "path";

type Input = { x: number; y: number; vx: number; vy: number }[];

const prettyPrint = (grid: unknown[][]) => {
  console.log(grid.map((line) => line.join("")).join("\n"));
  console.log("\n");
};

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  const robots = (await fs.readFile(filePath)).toString().split("\n");
  const regex = /p=(-?\d+),(-?\d+) v=(-?\d+),(-?\d+)/;
  return robots.map((robot) => {
    const [_, x, y, vx, vy] = robot.match(regex).map(Number);
    return { x, y, vx, vy };
  });
};

async function part1(IS_TEST: boolean) {
  const robots = await parseTextInput(IS_TEST);
  const WIDTH = IS_TEST ? 11 : 101;
  const HEIGHT = IS_TEST ? 7 : 103;

  for (let second = 0; second < 100; second++) {
    for (const robot of robots) {
      robot.x = (robot.x + robot.vx) % WIDTH;
      if (robot.x < 0) {
        robot.x += WIDTH;
      }
      robot.y = (robot.y + robot.vy) % HEIGHT;
      if (robot.y < 0) {
        robot.y += HEIGHT;
      }
    }
  }

  const quadrants = {
    TOP_RIGHT: 0,
    TOP_LEFT: 0,
    BOTTOM_RIGHT: 0,
    BOTTOM_LEFT: 0,
  };
  const middleX = Math.floor(WIDTH / 2);
  const middleY = Math.floor(HEIGHT / 2);
  for (const { x, y } of robots) {
    if (x > middleX && y > middleY) {
      quadrants.BOTTOM_RIGHT++;
    }
    if (x < middleX && y < middleY) {
      quadrants.TOP_LEFT++;
    }
    if (x < middleX && y > middleY) {
      quadrants.BOTTOM_LEFT++;
    }
    if (x > middleX && y < middleY) {
      quadrants.TOP_RIGHT++;
    }
  }

  return (
    quadrants.BOTTOM_LEFT *
    quadrants.BOTTOM_RIGHT *
    quadrants.TOP_LEFT *
    quadrants.TOP_RIGHT
  );
}

const showGrid = (robots: Input, WIDTH: number, HEIGHT: number) => {
  const grid: ("." | number)[][] = Array.from({ length: HEIGHT }, () =>
    Array.from({ length: WIDTH }, () => ".")
  );

  for (const { x, y } of robots) {
    if (grid[y][x] === ".") {
      grid[y][x] = 1;
    } else {
      grid[y][x] += 1;
    }
  }

  prettyPrint(grid);
};

async function part2(IS_TEST: boolean) {
  const robots = await parseTextInput(IS_TEST);
  const WIDTH = IS_TEST ? 11 : 101;
  const HEIGHT = IS_TEST ? 7 : 103;

  for (let second = 0; second < 10000; second++) {
    const robotsByCoordinates = {};

    for (const robot of robots) {
      robot.x = (robot.x + robot.vx) % WIDTH;
      if (robot.x < 0) {
        robot.x += WIDTH;
      }
      robot.y = (robot.y + robot.vy) % HEIGHT;
      if (robot.y < 0) {
        robot.y += HEIGHT;
      }

      robotsByCoordinates[`${robot.x}|${robot.y}`] = true;
    }

    let shouldShowGrid = false;

    for (const { x, y } of robots) {
      if (
        robotsByCoordinates[`${x - 1}|${y + 1}`] &&
        robotsByCoordinates[`${x + 1}|${y + 1}`] &&
        robotsByCoordinates[`${x - 2}|${y + 2}`] &&
        robotsByCoordinates[`${x + 2}|${y + 2}`] &&
        robotsByCoordinates[`${x - 3}|${y + 3}`] &&
        robotsByCoordinates[`${x + 3}|${y + 3}`]
      ) {
        shouldShowGrid = true;
        break;
      }
    }

    if (shouldShowGrid) {
      showGrid(robots, WIDTH, HEIGHT);

      console.log("Found pattern at: ", second + 1);
      return second + 1;
    }
  }

  return null;
}

async function main() {
  const IS_TEST = process.argv[2] === "test";

  const part1Result = await part1(IS_TEST);
  console.log("Part1 result: ", part1Result);

  const part2Result = await part2(IS_TEST);
  console.log("Part2 result: ", part2Result);
}

main();
