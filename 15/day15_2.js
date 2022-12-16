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

const getOccupiedPositions = (targetY, minCoordinate, maxCoordinate) => {
  const occupiedIntervals = [];
  for (const { distance, sensorX, sensorY } of lines) {
    const verticalDistance = Math.abs(sensorY - targetY);
    if (verticalDistance > distance) {
      continue;
    }
    const minX = Math.max(
      sensorX - (distance - verticalDistance),
      minCoordinate
    );

    const maxX = Math.min(
      sensorX + (distance - verticalDistance),
      maxCoordinate
    );

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
      if (hasOverlap) {
        previousIntervals.pop();
        return [
          ...previousIntervals,
          {
            minX: Math.min(interval.minX, previousInterval.minX),
            maxX: Math.max(interval.maxX, previousInterval.maxX),
          },
        ];
      }
      if (previousInterval.maxX === interval.minX - 1) {
        previousIntervals.pop();
        return [
          ...previousIntervals,
          {
            minX: previousInterval.minX,
            maxX: interval.maxX,
          },
        ];
      }
      return [...previousIntervals, interval];
    },
    []
  );

  let occupiedPositions = mergedIntervals.reduce(
    (previousSum, interval) => previousSum + interval.maxX - interval.minX + 1,
    0
  );
  const beaconsConsidered = {};
  for (const { sensorY, beaconX, beaconY } of lines) {
    if (sensorY === targetY) {
      occupiedPositions -= 1;
    }
    if (beaconY === targetY && !beaconsConsidered[`${beaconX}|${beaconY}`]) {
      occupiedPositions -= 1;
      beaconsConsidered[`${beaconX}|${beaconY}`] = true;
    }
  }
  // return occupiedPositions
  return mergedIntervals;
};

const lines = await parseInput(false);
const MIN_COORDINATE = 0;
// const MAX_COORDINATE = 20;
const MAX_COORDINATE = 4000000;

for (let targetY = MIN_COORDINATE; targetY <= MAX_COORDINATE; targetY++) {
  const occupiedPositions = getOccupiedPositions(
    targetY,
    MIN_COORDINATE,
    MAX_COORDINATE
  );
  if (occupiedPositions.length === 2) {
    const x = occupiedPositions[0].maxX + 1;
    console.log(`x: ${x}, y: ${targetY}`);
    console.log("Score : ", x * 4000000 + targetY);
  }
}
