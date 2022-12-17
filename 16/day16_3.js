import * as fs from "fs/promises";
const Graph = require("node-dijkstra");

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
    return {
      ...accumulator,
      [valveId]: {
        flowRate,
        adjacentValves: adjacentValves.sort(() => Math.random() - 0.5),
      },
    };
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
  const nextStates1 = [];
  const nextStates2 = [];
  const nextStates = [];
  const { adjacentValves: adjacentValves1, flowRate: flowRate1 } =
    valves[valveId1];
  const { adjacentValves: adjacentValves2, flowRate: flowRate2 } =
    valves[valveId2];

  if (minutesLeft1 > 0) {
    for (const { id, distance } of adjacentValves1) {
      const nextState = {
        valveId1: id,
        minutesLeft1: minutesLeft1 - distance,
        openedValves,
        addedScore: 0,
      };
      nextStates1.push(nextState);
    }

    if (!openedValves[valveId1] && flowRate1 !== 0) {
      const newOpenValves = {
        ...openedValves,
        [valveId1]: true,
      };
      const nextState = {
        valveId1,
        minutesLeft1: minutesLeft1 - 1,
        openedValves: newOpenValves,
        addedScore: flowRate1 * (minutesLeft1 - 1),
      };

      nextStates1.push(nextState);
    }
  }

  if (minutesLeft2 > 0) {
    for (const { id, distance } of adjacentValves2) {
      const nextState = {
        valveId2: id,
        minutesLeft2: minutesLeft2 - distance,
        openedValves,
        addedScore: 0,
      };
      nextStates2.push(nextState);
    }

    if (!openedValves[valveId2] && flowRate2 !== 0) {
      const newOpenValves = {
        ...openedValves,
        [valveId2]: true,
      };
      const nextState = {
        valveId2,
        minutesLeft2: minutesLeft2 - 1,
        openedValves: newOpenValves,
        addedScore: flowRate2 * (minutesLeft2 - 1),
      };

      nextStates2.push(nextState);
    }
  }

  for (const newState1 of nextStates1) {
    for (const newState2 of nextStates2) {
      if (
        valveId1 === valveId2 &&
        newState1.valveId1 === valveId1 &&
        newState2.valveId2 === valveId2
      ) {
        // Both can't open the same valve at the same time
        continue;
      }

      nextStates.push({
        valveId1: newState1.valveId1,
        valveId2: newState2.valveId2,
        minutesLeft1: newState1.minutesLeft1,
        minutesLeft2: newState2.minutesLeft2,
        openedValves: { ...newState1.openedValves, ...newState2.openedValves },
        score: score + newState1.addedScore + newState2.addedScore,
      });
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

console.time("Execution time");
const { valves: rawValves, nonNullValveIds } = await parseInput(false);
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
let MEMOIZED_STATES = {};
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

  if (iterations % 50000000 === 0) {
    console.log("Clearing cache");
    MEMOIZED_STATES = {};
  }

  const state = states.pop();

  if (
    (state.minutesLeft1 <= 0 && state.minutesLeft2 <= 0) ||
    areAllValvesOpened(state.openedValves, nonNullValveIds)
  ) {
    if (state.score > bestScore) {
      bestScore = state.score;
    }
    continue;
  }
  const memoizedKey = getMemoizedKey(state);
  if (MEMOIZED_STATES[memoizedKey]) {
    continue;
  }
  MEMOIZED_STATES[memoizedKey] = true;

  states.push(...computeNextStates(state, valves));
}
console.log("Best score : ", bestScore);
console.timeEnd("Execution time");

// Result is more than 2081
// and less that 3000
