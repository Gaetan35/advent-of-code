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

const simplifyGraph = (rawValves) => {
  return Object.fromEntries(
    Object.entries(rawValves)
      .filter(([valveId, valve]) => valveId === "AA" || valve.flowRate !== 0)
      .map(([valveId, valve]) => {
        const { flowRate, adjacentValves } = valve;
        if (flowRate === 0 && valveId !== "AA") return [valveId, valve];
        const newAdjacentValves = adjacentValves.map((adjacentId) => {
          let previousId = valveId;
          let id = adjacentId;
          let distance = 1;
          while (
            id !== "AA" &&
            rawValves[id].flowRate === 0 &&
            rawValves[id].adjacentValves.length === 2
          ) {
            distance += 1;
            const storeId = id;
            id = rawValves[id].adjacentValves.filter(
              (adjId) => adjId !== previousId
            )[0];
            previousId = storeId;
          }
          return { id, distance };
        });
        return [valveId, { flowRate, adjacentValves: newAdjacentValves }];
      })
  );
};

const areAllValvesOpened = (openedValves, nonNullValveIds) =>
  nonNullValveIds.reduce(
    (accumulator, currentValveId) =>
      accumulator && openedValves[currentValveId],
    true
  );

const computeNextStates = (
  { valveId1, valveId2, minutesLeft1, minutesLeft2, openedValves, score },
  valves
) => {
  const nextStates = [];
  const { adjacentValves: adjacentValves1, flowRate: flowRate1 } =
    valves[valveId1];
  const { adjacentValves: adjacentValves2, flowRate: flowRate2 } =
    valves[valveId2];

  if (minutesLeft1 > 0) {
    for (const { id, distance } of adjacentValves1) {
      const nextState = {
        valveId1: id,
        valveId2,
        minutesLeft1: minutesLeft1 - distance,
        minutesLeft2,
        openedValves,
        score,
      };
      nextStates.push(nextState);
    }

    if (!openedValves[valveId1] && flowRate1 !== 0) {
      const newOpenValves = {
        ...openedValves,
        [valveId1]: true,
      };
      const nextState = {
        valveId1,
        valveId2,
        minutesLeft1: minutesLeft1 - 1,
        minutesLeft2,
        openedValves: newOpenValves,
        score: score + flowRate1 * (minutesLeft1 - 1),
      };

      nextStates.push(nextState);
    }
  }

  if (minutesLeft2 > 0) {
    for (const { id, distance } of adjacentValves2) {
      const nextState = {
        valveId1,
        valveId2: id,
        minutesLeft1,
        minutesLeft2: minutesLeft2 - distance,
        openedValves,
        score,
      };
      nextStates.push(nextState);
    }

    if (!openedValves[valveId2] && flowRate2 !== 0) {
      const newOpenValves = {
        ...openedValves,
        [valveId2]: true,
      };
      const nextState = {
        valveId1,
        valveId2,
        minutesLeft1,
        minutesLeft2: minutesLeft2 - 1,
        openedValves: newOpenValves,
        score: score + flowRate2 * (minutesLeft2 - 1),
      };

      nextStates.push(nextState);
    }
  }

  return nextStates;
};

const getMemoizedKey = ({
  valveId1,
  valveId2,
  openedValves,
  minutesLeft1,
  minutesLeft2,
}) => {
  return `${valveId1}|${valveId2}|${Object.keys(openedValves).sort((id1, id2) =>
    id1 < id2 ? 1 : -1
  )}|${minutesLeft1}|${minutesLeft2}`;
};

const { valves: rawValves, nonNullValveIds } = await parseInput(true);
const valves = simplifyGraph(rawValves);
const MINUTES_AVAILABLE = 26;
const START_STATE = {
  valveId1: "AA",
  valveId2: "AA",
  minutesLeft1: MINUTES_AVAILABLE,
  minutesLeft2: MINUTES_AVAILABLE,
  openedValves: {},
  score: 0,
};
const MEMOIZED_STATES = {};
const states = [START_STATE];
let bestScore = 0;
let iterations = 0;
while (states.length > 0) {
  iterations += 1;
  if (iterations % 1000000 === 0) {
    console.log(
      `${iterations}: ${states.length} in list, best score is ${bestScore}`
    );
  }
  const state = states.pop();

  if (
    (state.minutesLeft1 <= 0 && state.minutesLeft2 <= 0) ||
    areAllValvesOpened(state.openedValves, nonNullValveIds)
  ) {
    if (state.score > bestScore) {
      bestScore = state.score;
      console.log("New best score : ", bestScore);
    }
    continue;
  }
  const memoizedKey = getMemoizedKey(state);
  if (MEMOIZED_STATES[memoizedKey]) {
    continue;
  }
  if (iterations < 44000000) {
    MEMOIZED_STATES[memoizedKey] = true;
  }
  states.push(...computeNextStates(state, valves));
}
console.log("Best score : ", bestScore);
