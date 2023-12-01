import * as fs from "fs/promises";

const parseInput = async (test = false) => {
  const fileContent = (
    await fs.readFile(test ? "input_test.txt" : "input.txt")
  ).toString();
  const lines = fileContent.split("\n");
  return lines.map((line) => {
    const [sensorPart, beaconPart] = line.split(":");
    const [sensorX, sensorY] = sensorPart
      .split(", ")
      .map((splitted) => parseInt(splitted.split("=")[1]));
    const [beaconX, beaconY] = beaconPart
      .split(", ")
      .map((splitted) => parseInt(splitted.split("=")[1]));
    return {
      sensorX,
      sensorY,
      beaconX,
      beaconY,
      distance: Math.abs(sensorX - beaconX) + Math.abs(sensorY - beaconY),
    };
  });
};

const lines = await parseInput(false);
// console.log(lines);
// const TARGET_Y = 10;
const TARGET_Y = 2000000;
const occupiedIntervals = [];
for (const { distance, sensorX, sensorY } of lines) {
  const verticalDistance = Math.abs(sensorY - TARGET_Y);
  if (verticalDistance > distance) {
    // console.log("Nothing on row for sensor ", { distance, sensorX, sensorY });
    continue;
  }
  const minX = sensorX - (distance - verticalDistance);
  const maxX = sensorX + (distance - verticalDistance);
  // console.log("Sensor ", { distance, sensorX, sensorY }, "has interval ", {
  //   minX,
  //   maxX,
  // });
  occupiedIntervals.push({ minX, maxX });
}

occupiedIntervals.sort(
  (intervalA, intervalB) => intervalA.minX - intervalB.minX
);

const mergedIntervals = occupiedIntervals.reduce(
  (previousIntervals, interval) => {
    if (!previousIntervals.length) return [interval];
    const previousInterval = previousIntervals[previousIntervals.length - 1];
    const hasOverlap =
      (interval.maxX - previousInterval.minX) *
        (previousInterval.maxX - interval.minX) >=
      0;
    if (!hasOverlap) {
      return [...previousIntervals, interval];
    }
    previousIntervals.pop();
    return [
      ...previousIntervals,
      {
        minX: Math.min(interval.minX, previousInterval.minX),
        maxX: Math.max(interval.maxX, previousInterval.maxX),
      },
    ];
  },
  []
);
console.log(occupiedIntervals);
console.log(mergedIntervals);

let occupiedPositions = mergedIntervals.reduce(
  (previousSum, interval) => previousSum + interval.maxX - interval.minX + 1,
  0
);
const beaconsConsidered = {};
for (const { sensorY, beaconX, beaconY } of lines) {
  if (sensorY === TARGET_Y) {
    occupiedPositions -= 1;
  }
  if (beaconY === TARGET_Y && !beaconsConsidered[`${beaconX}|${beaconY}`]) {
    occupiedPositions -= 1;
    beaconsConsidered[`${beaconX}|${beaconY}`] = true;
  }
}
console.log(occupiedPositions);
