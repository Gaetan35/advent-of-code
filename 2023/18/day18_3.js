import * as fs from "fs/promises";

const numberToDirection = {
  0: "R",
  1: "D",
  2: "L",
  3: "U",
};
const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => {
      const [direction, length, colorRaw] = line.split(" ");
      const color = colorRaw.substring(2, colorRaw.length - 1);
      // return {
      //   direction: numberToDirection[color.at(-1)],
      //   length: parseInt(color.substring(0, 5), 16),
      //   color,
      // };
      return {
        direction,
        length: Number(length),
        color,
      };
    });

  return input;
};

const DELTAS_PER_DIRECTION = {
  R: [1, 0],
  L: [-1, 0],
  U: [0, -1],
  D: [0, 1],
};

const computePoints = (input) => {
  const pos = [5, 5];
  const points = [];

  for (const { direction, length } of input) {
    const [dx, dy] = DELTAS_PER_DIRECTION[direction];

    pos[0] += dx * length;
    pos[1] += dy * length;

    points.push({ x: pos[0], y: pos[1] });
  }

  return points;
};

const computeArea = (points) => {
  let area = 0;
  for (let i = 0; i + 1 < points.length; i++) {
    const j = (i + 1) % points.length;

    area += points[i].x * points[j].y;
    area -= points[i].y * points[j].x;
  }
  area /= 2;
  return Math.abs(area);
};

function shoelaceFormula(xCoords, yCoords) {
  const n = xCoords.length;
  if (n !== yCoords.length) {
    throw new Error("Number of x and y coordinates must be the same");
  }

  // Duplicate the first point at the end of the list

  // Calculate the two columns
  const sumA = xCoords.reduce(
    (sum, _, i) => sum + xCoords[i] * yCoords[(i + 1) % n],
    0
  );
  const sumB = yCoords.reduce(
    (sum, _, i) => sum + yCoords[i] * xCoords[(i + 1) % n],
    0
  );

  // Calculate the absolute value of the difference and divide by 2
  const area = Math.abs(sumA - sumB) / 2.0;

  return area;
}

const input = await parseTextInput(true);
console.log(input);

const points = computePoints(input);
console.log(points);

const area = shoelaceFormula(
  points.map(({ x }) => x),
  points.map(({ y }) => y)
);
console.log("Area : ", area);
