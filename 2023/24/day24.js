import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => {
      const [x, y, z, vx, vy, vz] = line.match(/-?\d+/g).map(Number);
      return { x, y, z, vx, vy, vz };
    });

  return input;
};

const computeIntersection = (line1, line2) => {
  // y1 = a1 * x1 + b1
  const a1 = line1.vy / line1.vx;
  const a2 = line2.vy / line2.vx;

  if (a1 === a2) {
    if (line1.x === line2.x) {
      throw new Error("parallel and superposed");
    }
    return "parallel";
  }

  const b1 = line1.y - a1 * line1.x;
  const b2 = line2.y - a2 * line2.x;

  const intersectionX = (b2 - b1) / (a1 - a2);
  const intersectionY = a1 * intersectionX + b1;

  return { x: intersectionX, y: intersectionY };
};

const computeIntersectionsCountInZone = (input, zoneStart, zoneEnd) => {
  let intersectionsCount = 0;
  for (let i = 0; i < input.length - 1; i++) {
    for (let j = i + 1; j < input.length; j++) {
      const line1 = input[i];
      const line2 = input[j];
      const intersection = computeIntersection(line1, line2);

      if (intersection === "parallel") {
        continue;
      }

      const isInPast1 = (intersection.x - line1.x) * line1.vx <= 0;
      const isInPast2 = (intersection.x - line2.x) * line2.vx <= 0;

      if (isInPast1 || isInPast2) {
        continue;
      }

      const { x, y } = intersection;
      if (zoneStart <= x && x <= zoneEnd && zoneStart <= y && y <= zoneEnd) {
        intersectionsCount += 1;
      }
    }
  }
  return intersectionsCount;
};

const input = await parseTextInput(false);

const intersectionsCount = computeIntersectionsCountInZone(
  input,
  200000000000000,
  400000000000000
);
console.log("Intersections count : ", intersectionsCount);
