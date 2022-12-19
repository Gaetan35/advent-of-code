import * as fs from "fs/promises";

const parseInput = async (test = false) => {
  const fileContent = (
    await fs.readFile(test ? "input_test.txt" : "input.txt")
  ).toString();
  const lines = fileContent.split("\n");
  const nonNullValveIds = [];
  const flowRates = [];
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
      flowRates.push({ flowRate, valveId });
    }
    return {
      ...accumulator,
      [valveId]: {
        flowRate,
        adjacentValves: adjacentValves, //sort(() => Math.random() - 0.5),
      },
    };
  }, {});
  return {
    valves,
    nonNullValveIds,
    flowRates: flowRates.sort((a, b) => b.flowRate - a.flowRate),
  };
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

const computeNextStates2 = (
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

const canReachMaxScore = (
  infLimit,
  { minutesLeft1, minutesLeft2, openedValves, score },
  flowRates
) => {
  const closedFlowRates = flowRates.filter(
    ({ valveId }) => !openedValves[valveId]
  );
  const maxMinutesLeft = Math.max(minutesLeft1, minutesLeft2);
  const maxAddedScore = closedFlowRates.reduce(
    (acc, flowRate, index) =>
      acc +
      flowRate.flowRate *
        Math.max(maxMinutesLeft - 1 - (index - (index % 2)), 0),
    0
  );
  return score + maxAddedScore >= infLimit;
};

console.time("Execution time");
const {
  valves: rawValves,
  nonNullValveIds,
  flowRates,
} = await parseInput(false);
const valves = simplifyGraph(rawValves);
const MINUTES_AVAILABLE = 20;
const INF_LIMIT = 1443;
const START_STATE = {
  valveId1: "AA",
  valveId2: "AA",
  minutesLeft1: MINUTES_AVAILABLE,
  minutesLeft2: MINUTES_AVAILABLE,
  openedValves: {},
  score: 0,
};
let MEMOIZED_STATES = {};
let states = [START_STATE];
let bestScore = 0;
let iterations = 0;
while (states.length > 0) {
  iterations += 1;
  if (iterations % 1000000 === 0) {
    console.log(
      `${iterations / 1000000}: ${
        states.length
      } in list, best score is ${bestScore}`
    );
  }

  if (iterations % 5000000 === 0) {
    console.log("before filter ", states.length);
    states = states.filter((state) => !MEMOIZED_STATES[getMemoizedKey(state)]);
    console.log("after filter : ", states.length);
  }

  if (iterations % 50000000 === 0) {
    console.log("Clearing cache");
    MEMOIZED_STATES = {};
  }

  const state = states.pop();

  if (
    (state.minutesLeft1 <= 1 && state.minutesLeft2 <= 1) ||
    areAllValvesOpened(state.openedValves, nonNullValveIds)
  ) {
    if (state.score > bestScore) {
      bestScore = state.score;
    }
    continue;
  }

  if (!canReachMaxScore(INF_LIMIT, state, flowRates)) {
    continue;
  }

  const memoizedKey = getMemoizedKey(state);
  if (MEMOIZED_STATES[memoizedKey]) {
    continue;
  }
  MEMOIZED_STATES[memoizedKey] = true;

  states.push(...computeNextStates2(state, valves));
}
console.log("Best score : ", bestScore);
console.timeEnd("Execution time");

// Result is more than 2081
// Best score found yet is 2411 but it's false -> probably higher than 2411
// and less that 3000

// For 15 minutes result is 785
// For 20 minutes result is 1449
// For 26 minutes
//  - False result with InfLimit = 2400 is obtained in 5m21s / 544 L iterations
