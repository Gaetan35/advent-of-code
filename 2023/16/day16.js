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
  const [x, y] = pos;
  const [dx, dy] = deltasPerDirection[direction];
  if (x + dx < 0 || x + dx >= WIDTH || y + dy < 0 || y + dy >= HEIGHT) {
    return [];
  }
  return [{ pos: [x + dx, y + dy], direction, ttl: ttl - 1 }];
};

const getNewBeams = (grid, { pos, direction, ttl }) => {
  if (ttl <= 0) {
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

const computeEnergizedGrid = (grid, entranceBeam, MAX_TTL) => {
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;

  const energizedGrid = Array.from({ length: HEIGHT }, () =>
    Array.from({ length: WIDTH }, () => ".")
  );

  let energizedCount = 0;
  const beams = [entranceBeam];
  let index = 0;
  while (beams.length > 0) {
    index += 1;
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
    }

    beams.push(...getNewBeams(grid, beam));
  }
  return [energizedGrid, energizedCount];
};

const computeMaxEnergizedCount = (grid) => {
  const HEIGHT = grid.length;
  const WIDTH = grid[0].length;
  const MAX_TTL = 100;

  const topEntranceBeams = Array.from({ length: WIDTH }, (_, x) => ({
    pos: [x, 0],
    direction: "BOTTOM",
    ttl: MAX_TTL,
  }));
  const bottomEntranceBeams = Array.from({ length: WIDTH }, (_, x) => ({
    pos: [x, HEIGHT - 1],
    direction: "TOP",
    ttl: MAX_TTL,
  }));
  const leftEntranceBeams = Array.from({ length: HEIGHT }, (_, y) => ({
    pos: [0, y],
    direction: "RIGHT",
    ttl: MAX_TTL,
  }));
  const rightEntranceBeams = Array.from({ length: HEIGHT }, (_, y) => ({
    pos: [WIDTH - 1, y],
    direction: "LEFT",
    ttl: MAX_TTL,
  }));

  const entranceBeams = [
    ...topEntranceBeams,
    ...bottomEntranceBeams,
    ...leftEntranceBeams,
    ...rightEntranceBeams,
  ];

  let maxEnergizedCount = 0;
  for (const entranceBeam of entranceBeams) {
    const [_, energizedCount] = computeEnergizedGrid(
      grid,
      entranceBeam,
      MAX_TTL
    );
    if (energizedCount > maxEnergizedCount) {
      maxEnergizedCount = energizedCount;
    }
  }
  return maxEnergizedCount;
};

const input = await parseTextInput(false);

const [_, part1Result] = computeEnergizedGrid(
  input,
  { pos: [0, 0], direction: "RIGHT", ttl: 100 },
  100
);

console.log(part1Result);

const part2Result = computeMaxEnergizedCount(input);
console.log(part2Result);
