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
const { valves: VALVES, nonNullValveIds } = await parseInput(false);

const getMemoizedKey = (id1, id2, openedValveIds, minutesRemaining) => {
  return `${id1 < id2 ? id1 : id2}|${id1 < id2 ? id2 : id1}|${openedValveIds}|${
    minutesRemaining - 1
  }`;
};

const getMaxPressureReleased = (
  valveId1,
  valveId2,
  openedValves,
  minutesRemaining
) => {
  if (minutesRemaining === 0) {
    return { maxScore: 0, path: [] };
  }
  const areAllValvesOpened = nonNullValveIds.reduce(
    (accumulator, currentValveId) =>
      accumulator && openedValves[currentValveId],
    true
  );
  if (areAllValvesOpened) {
    return { maxScore: 0, path: [] };
  }
  const openedValveIds = Object.keys(openedValves);
  const { adjacentValves: adjacentValves1, flowRate: flowRate1 } =
    VALVES[valveId1];
  const { adjacentValves: adjacentValves2, flowRate: flowRate2 } =
    VALVES[valveId2];
  const possibilities = [];

  for (const adjacentValveId1 of adjacentValves1) {
    for (const adjacentValveId2 of adjacentValves2) {
      // 1 and 2 are moving
      // console.log(
      //   "1 and 2 are moving : ",
      //   minutesRemaining,
      //   adjacentValveId1,
      //   adjacentValveId2
      // );
      const memoizedKey = getMemoizedKey(
        adjacentValveId1,
        adjacentValveId2,
        openedValveIds,
        minutesRemaining - 1
      );
      if (memoizedValves[memoizedKey] === undefined) {
        memoizedValves[memoizedKey] = getMaxPressureReleased(
          adjacentValveId1,
          adjacentValveId2,
          openedValves,
          minutesRemaining - 1
        );
      }

      possibilities.push({
        score: memoizedValves[memoizedKey].maxScore,
        id1: adjacentValveId1,
        id2: adjacentValveId2,
        path: memoizedValves[memoizedKey].path,
      });
    }

    if (!openedValves[valveId2] && flowRate2 !== 0) {
      // 1 is moving, 2 is opening
      // console.log(
      //   "1 is moving, 2 is opening : ",
      //   minutesRemaining,
      //   adjacentValveId1,
      //   valveId2
      // );
      const newOpenValves = {
        ...openedValves,
        [valveId2]: true,
      };
      const newOpenValveIds = Object.keys(newOpenValves);
      const memoizedKey = getMemoizedKey(
        adjacentValveId1,
        valveId2,
        newOpenValveIds,
        minutesRemaining - 1
      );
      if (memoizedValves[memoizedKey] === undefined) {
        memoizedValves[memoizedKey] = getMaxPressureReleased(
          adjacentValveId1,
          valveId2,
          newOpenValves,
          minutesRemaining - 1
        );
      }
      const openValve2Score =
        minutesRemaining * flowRate2 + memoizedValves[memoizedKey].maxScore;

      possibilities.push({
        score: openValve2Score,
        id1: adjacentValveId1,
        id2: valveId2,
        path: memoizedValves[memoizedKey].path,
      });
    }
  }

  if (!openedValves[valveId1] && flowRate1 !== 0) {
    for (const adjacentValveId2 of adjacentValves2) {
      //  1 is opening, 2 is moving
      // console.log(
      //   "1 is opening, 2 is moving : ",
      //   minutesRemaining,
      //   valveId1,
      //   adjacentValveId2
      // );
      const newOpenValves = {
        ...openedValves,
        [valveId1]: true,
      };
      const newOpenValveIds = Object.keys(newOpenValves);
      const memoizedKey = getMemoizedKey(
        valveId1,
        adjacentValveId2,
        newOpenValveIds,
        minutesRemaining - 1
      );
      if (memoizedValves[memoizedKey] === undefined) {
        memoizedValves[memoizedKey] = getMaxPressureReleased(
          valveId1,
          adjacentValveId2,
          newOpenValves,
          minutesRemaining - 1
        );
      }
      const openValve1Score =
        minutesRemaining * flowRate1 + memoizedValves[memoizedKey].maxScore;

      possibilities.push({
        score: openValve1Score,
        id1: valveId1,
        id2: adjacentValveId2,
        path: memoizedValves[memoizedKey].path,
      });
    }
  }

  if (
    !openedValves[valveId1] &&
    flowRate1 !== 0 &&
    !openedValves[valveId2] &&
    flowRate2 !== 0 &&
    valveId1 !== valveId2
  ) {
    // 1 and 2 are opening
    // console.log("1 and 2 are opening : ", minutesRemaining, valveId1, valveId2);

    const newOpenValves = {
      ...openedValves,
      [valveId1]: true,
      [valveId2]: true,
    };
    const newOpenValveIds = Object.keys(newOpenValves);
    const memoizedKey = getMemoizedKey(
      valveId1,
      valveId2,
      newOpenValveIds,
      minutesRemaining - 1
    );
    if (memoizedValves[memoizedKey] === undefined) {
      memoizedValves[memoizedKey] = getMaxPressureReleased(
        valveId1,
        valveId2,
        newOpenValves,
        minutesRemaining - 1
      );
    }
    const openBothValvesScore =
      minutesRemaining * (flowRate1 + flowRate2) +
      memoizedValves[memoizedKey].maxScore;
    possibilities.push({
      score: openBothValvesScore,
      id1: valveId1,
      id2: valveId2,
      path: memoizedValves[memoizedKey].path,
    });
  }

  let maxScore = -1;
  let maxPossibility;
  for (const possibility of possibilities) {
    if (possibility.score > maxScore) {
      maxScore = possibility.score;
      maxPossibility = possibility;
    }
  }
  // console.log(
  //   `${valveId1}|${valveId2}`,
  //   minutesRemaining,
  //   " Max possibility : ",
  //   maxPossibility
  // );
  return {
    maxScore,
    path: [
      { id1: maxPossibility.id1, id2: maxPossibility.id2 },
      ...maxPossibility.path,
    ],
  };
};

const MINUTES_AVAILABLE = 12;
const START_VALVE_ID = "AA";
const result = getMaxPressureReleased(
  START_VALVE_ID,
  START_VALVE_ID,
  {},
  MINUTES_AVAILABLE - 1
);
console.log("Result : ", START_VALVE_ID, result.maxScore);
console.log([{ id1: START_VALVE_ID, id2: START_VALVE_ID }, ...result.path]);

// await fs.writeFile("memoizedValves3.json", JSON.stringify(memoizedValves));
// console.log(JSON.stringify(memoizedValves));
