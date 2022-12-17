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
//   (await fs.readFile("memoizedValves.json")).toString()
// );
const { valves: RAW_VALVES, nonNullValveIds } = await parseInput(false);
// console.log(VALVES);

const VALVES = Object.fromEntries(
  Object.entries(RAW_VALVES)
    .filter(([valveId, valve]) => valveId === "AA" || valve.flowRate !== 0)
    .map(([valveId, valve]) => {
      // console.log({ valveId });
      const { flowRate, adjacentValves } = valve;
      if (flowRate === 0 && valveId !== "AA") return [valveId, valve];
      const newAdjacentValves = adjacentValves.map((adjacentId) => {
        let previousId = valveId;
        let id = adjacentId;
        let distance = 1;
        while (
          id !== "AA" &&
          RAW_VALVES[id].flowRate === 0 &&
          RAW_VALVES[id].adjacentValves.length === 2
        ) {
          distance += 1;
          // console.log({ adjacentId, id, list: RAW_VALVES[id].adjacentValves });
          const storeId = id;
          id = RAW_VALVES[id].adjacentValves.filter(
            (adjId) => adjId !== previousId
          )[0];
          previousId = storeId;
        }
        return { id, distance };
      });
      return [valveId, { flowRate, adjacentValves: newAdjacentValves }];
    })
);

// const nodes = Object.keys(VALVES).map((valveId) => ({
//   id: valveId,
//   group: VALVES[valveId].flowRate === 0 ? 2 : 1,
// }));
// const links = [];
// for (const [valveId, valve] of Object.entries(VALVES)) {
//   for (const { id, distance } of valve.adjacentValves) {
//     links.push({ source: valveId, target: id, value: distance });
//   }
// }
// await fs.writeFile("graph.json", JSON.stringify({ links, nodes }));

// const simplifiedValves = VALVES.filter(valve => valve.)

// console.log("File read, start computing...");

const getMemoizedKey = (
  id1,
  id2,
  openedValveIds,
  minutesRemaining1,
  minutesRemaining2
) => {
  return `${id1 < id2 ? id1 : id2}|${
    id1 < id2 ? id2 : id1
  }|${openedValveIds.sort((id1, id2) =>
    id1 < id2 ? 1 : -1
  )}|${minutesRemaining1}|${minutesRemaining2}`;
};

const getMaxPressureReleased = (
  valveId1,
  valveId2,
  openedValves,
  minutesRemaining1,
  minutesRemaining2
) => {
  // console.log({ valveId1, valveId2, minutesRemaining1, minutesRemaining2 });
  if (minutesRemaining1 <= 0 && minutesRemaining2 <= 0) {
    return 0;
  }

  const areAllValvesOpened = nonNullValveIds.reduce(
    (accumulator, currentValveId) =>
      accumulator && openedValves[currentValveId],
    true
  );
  if (areAllValvesOpened) {
    // console.log(
    //   `All valves are open, stopping with ${minutesRemaining1}|${minutesRemaining2} minutes remaining`
    // );
    return 0;
  }
  const { adjacentValves: adjacentValves1, flowRate: flowRate1 } =
    VALVES[valveId1];
  const { adjacentValves: adjacentValves2, flowRate: flowRate2 } =
    VALVES[valveId2];
  const possibilities = [];

  if (minutesRemaining1 > 0) {
    for (const { id, distance } of adjacentValves1) {
      const memoizedKey = getMemoizedKey(
        id,
        valveId2,
        Object.keys(openedValves),
        minutesRemaining1 - distance,
        minutesRemaining2
      );
      if (memoizedValves[memoizedKey] === undefined) {
        memoizedValves[memoizedKey] = getMaxPressureReleased(
          id,
          valveId2,
          openedValves,
          minutesRemaining1 - distance,
          minutesRemaining2
        );
      }
      possibilities.push(memoizedValves[memoizedKey]);
    }

    if (!openedValves[valveId1] && flowRate1 !== 0) {
      const newOpenValves = {
        ...openedValves,
        [valveId1]: true,
      };
      const newOpenValveIds = Object.keys(newOpenValves);
      const memoizedKey = getMemoizedKey(
        valveId1,
        valveId2,
        newOpenValveIds,
        minutesRemaining1 - 1,
        minutesRemaining2
      );
      if (memoizedValves[memoizedKey] === undefined) {
        memoizedValves[memoizedKey] = getMaxPressureReleased(
          valveId1,
          valveId2,
          newOpenValves,
          minutesRemaining1 - 1,
          minutesRemaining2
        );
      }

      possibilities.push(
        (minutesRemaining1 - 1) * flowRate1 + memoizedValves[memoizedKey]
      );
    }
  }

  if (minutesRemaining2 > 0) {
    for (const { id, distance } of adjacentValves2) {
      const memoizedKey = getMemoizedKey(
        valveId1,
        id,
        Object.keys(openedValves),
        minutesRemaining1,
        minutesRemaining2 - distance
      );
      if (memoizedValves[memoizedKey] === undefined) {
        memoizedValves[memoizedKey] = getMaxPressureReleased(
          valveId1,
          id,
          openedValves,
          minutesRemaining1,
          minutesRemaining2 - distance
        );
      }
      possibilities.push(memoizedValves[memoizedKey]);
    }

    if (!openedValves[valveId2] && flowRate2 !== 0) {
      const newOpenValves = {
        ...openedValves,
        [valveId2]: true,
      };
      const newOpenValveIds = Object.keys(newOpenValves);
      const memoizedKey = getMemoizedKey(
        valveId1,
        valveId2,
        newOpenValveIds,
        minutesRemaining1,
        minutesRemaining2 - 1
      );
      if (memoizedValves[memoizedKey] === undefined) {
        memoizedValves[memoizedKey] = getMaxPressureReleased(
          valveId1,
          valveId2,
          newOpenValves,
          minutesRemaining1,
          minutesRemaining2 - 1
        );
      }

      possibilities.push(
        (minutesRemaining2 - 1) * flowRate2 + memoizedValves[memoizedKey]
      );
    }
  }

  return Math.max(...possibilities);
};

const MINUTES_AVAILABLE = 15;
const START_VALVE_ID = "AA";
const result = getMaxPressureReleased(
  START_VALVE_ID,
  START_VALVE_ID,
  {},
  MINUTES_AVAILABLE,
  MINUTES_AVAILABLE
);
console.log("Result : ", START_VALVE_ID, result);

// await fs.writeFile("memoizedValves.json", JSON.stringify(memoizedValves));
// console.log(JSON.stringify(memoizedValves));
