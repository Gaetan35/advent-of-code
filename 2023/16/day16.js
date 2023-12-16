import * as fs from "fs/promises";

const prettyPrint = (grid) => {
  console.log(grid.map((line) => line.join("")).join("\n"));
};

const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => line.split(""));

  return input;
};

const deltasPerDirection = {
  RIGHT: [1, 0],
  LEFT: [-1, 0],
  TOP: [0, -1],
  BOTTOM: [0, 1],
};

const mirrorDirectionChange = {
  "/": {
    RIGHT: "TOP",
    TOP: "RIGHT",
    LEFT: "BOTTOM",
    BOTTOM: "LEFT",
  },
  "\\": {
    RIGHT: "BOTTOM",
    TOP: "LEFT",
    LEFT: "TOP",
    BOTTOM: "RIGHT",
  },
};

const moveBeam = (WIDTH, HEIGHT, pos, direction, ttl) => {
  if (ttl <= 0) {
    console.log("discarding some 2");

    return [];
  }
  const [x, y] = pos;
  const [dx, dy] = deltasPerDirection[direction];
  if (x + dx < 0 || x + dx >= WIDTH || y + dy < 0 || y + dy >= HEIGHT) {
    return [];
  }
  return [{ pos: [x + dx, y + dy], direction, ttl: ttl - 1 }];
};

const getNewBeams = (grid, { pos, direction, ttl }) => {
  if (ttl <= 0) {
    console.log("discarding some");
    return [];
  }

  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;
  const [x, y] = pos;
  const cell = grid[y][x];
  if (
    cell === "." ||
    (cell === "|" && ["TOP", "BOTTOM"].includes(direction)) ||
    (cell === "-" && ["LEFT", "RIGHT"].includes(direction))
  ) {
    return moveBeam(WIDTH, HEIGHT, pos, direction, ttl);
  }

  if (cell === "/" || cell === "\\") {
    const newDirection = mirrorDirectionChange[cell][direction];
    return moveBeam(WIDTH, HEIGHT, pos, newDirection, ttl);
  }

  if (cell === "|" && ["LEFT", "RIGHT"].includes(direction)) {
    return [
      ...moveBeam(WIDTH, HEIGHT, pos, "TOP", ttl),
      ...moveBeam(WIDTH, HEIGHT, pos, "BOTTOM", ttl),
    ];
  }

  if (cell === "-" && ["TOP", "BOTTOM"].includes(direction)) {
    return [
      ...moveBeam(WIDTH, HEIGHT, pos, "LEFT", ttl),
      ...moveBeam(WIDTH, HEIGHT, pos, "RIGHT", ttl),
    ];
  }

  throw new Error("condition not covered");
};

const computeEnergizedGrid = (grid) => {
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;
  const MAX_TTL = 100;

  const energizedGrid = Array.from({ length: HEIGHT }, () =>
    Array.from({ length: WIDTH }, () => ".")
  );

  let energizedCount = 0;
  const beams = [{ pos: [0, 0], direction: "RIGHT", ttl: MAX_TTL }];
  let index = 0;
  while (beams.length > 0) {
    index += 1;
    if (index % 100 === 0) {
      console.log(`${index}: ${beams.length} beams`);
    }
    if (index > 20000000) {
      console.log("REACHED MAX NUMBER OF STEPS, STOPPING");
      break;
    }
    const beam = beams.pop();
    const [x, y] = beam.pos;
    if (energizedGrid[y][x] === "#") {
      beam.ttl -= 1;
    } else {
      beam.ttl = MAX_TTL;
      energizedGrid[y][x] = "#";
      energizedCount += 1;
      console.log(index, ": Increasing count : ", energizedCount);
    }

    beams.push(...getNewBeams(grid, beam));
  }
  return [energizedGrid, energizedCount];
};

const input = await parseTextInput(false);

const [energizedGrid, energizedCount] = computeEnergizedGrid(input);

prettyPrint(energizedGrid);
console.log(energizedCount);

// 469 is too low
