import * as fs from "fs/promises";

const parseInput = async (test = false) => {
  const fileContent = (
    await fs.readFile(test ? "input_test.txt" : "input.txt")
  ).toString();
  const lines = fileContent.split("\n");
  const nonNullValveIds = [];
  const valves = lines.reduce((accumulator, line) => {
    const valveId = line.substring(6, 8);
    const flowRate = parseInt(line.split(";")[0].split("=")[1]);
    const adjacentValves = line
      .split("valve")[1]
      .substring(1)
      .trim()
      .split(", ");
    if (flowRate !== 0) {
      nonNullValveIds.push(valveId);
    }
    return { ...accumulator, [valveId]: { flowRate, adjacentValves } };
  }, {});
  return { valves, nonNullValveIds };
};

const memoizedValves = {};
// const memoizedValves = JSON.parse(
//   (await fs.readFile("memoizedValves2.json")).toString()
// );
const { valves, nonNullValveIds } = await parseInput(false);

console.log("File read, starting to compute");

const getMaxPressureReleased = (
  valves,
  valveId,
  openedValves,
  minutesRemaining
) => {
  if (minutesRemaining === 0) {
    return 0;
  }
  const areAllValvesOpened = nonNullValveIds.reduce(
    (accumulator, currentValveId) =>
      accumulator && openedValves[currentValveId],
    true
  );
  if (areAllValvesOpened) {
    return 0;
  }
  const openedValveIds = Object.keys(openedValves);
  const { adjacentValves, flowRate } = valves[valveId];
  const possibilities = adjacentValves.map((adjacentValveId) => {
    const memoizedValue =
      memoizedValves[
        `${adjacentValveId}|${openedValveIds}|${minutesRemaining - 1}`
      ];
    if (memoizedValue !== undefined) {
      return memoizedValue;
    }
    const possibilityScore = getMaxPressureReleased(
      valves,
      adjacentValveId,
      openedValves,
      minutesRemaining - 1
    );
    memoizedValves[
      `${adjacentValveId}|${openedValveIds}|${minutesRemaining - 1}`
    ] = possibilityScore;
    return possibilityScore;
  });

  if (!openedValves[valveId] && flowRate !== 0) {
    const newOpenValves = {
      ...openedValves,
      [valveId]: true,
    };
    const newOpenValveIds = Object.keys(newOpenValves);
    if (
      memoizedValves[
        `${valveId}|${newOpenValveIds}|${minutesRemaining - 1}`
      ] === undefined
    ) {
      memoizedValves[`${valveId}|${newOpenValveIds}|${minutesRemaining - 1}`] =
        getMaxPressureReleased(
          valves,
          valveId,
          newOpenValves,
          minutesRemaining - 1
        );
    }

    const openCurrentValveScore =
      minutesRemaining * flowRate +
      memoizedValves[`${valveId}|${newOpenValveIds}|${minutesRemaining - 1}`];
    possibilities.push(openCurrentValveScore);
  }
  return Math.max(...possibilities);
};

const MINUTES_AVAILABLE = 29;
const START_VALVE_ID = "QP";
const result = getMaxPressureReleased(
  valves,
  START_VALVE_ID,
  {},
  MINUTES_AVAILABLE - 1
);
console.log("Result : ", START_VALVE_ID, result);

// await fs.writeFile("memoizedValves3.json", JSON.stringify(memoizedValves));
// console.log(JSON.stringify(memoizedValves));

// Result :  YX 1561
// Result :  TQ 1639
// Result :  VO 1701
// Result :  GX 1605
// Result :  QP 1494
