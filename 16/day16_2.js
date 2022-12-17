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
const MINUTES_AVAILABLE = 26;
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

// const getMemoizedKey = (id1, id2, openedValveIds, minutesRemaining) => {
//   return `${id1 < id2 ? id1 : id2}|${
//     id1 < id2 ? id2 : id1
//   }|${openedValveIds.sort((id1, id2) =>
//     id1 < id2 ? 1 : -1
//   )}|${minutesRemaining}`;
// };

// const getMaxPressureReleased = (
//   valveId1,
//   valveId2,
//   openedValves,
//   minutesRemaining
// ) => {
//   if (minutesRemaining === 0) {
//     return 0;
//   }
//   const areAllValvesOpened = nonNullValveIds.reduce(
//     (accumulator, currentValveId) =>
//       accumulator && openedValves[currentValveId],
//     true
//   );
//   if (areAllValvesOpened) {
//     console.log(
//       `All valves are open, stopping with ${minutesRemaining} minutes remaining`
//     );
//     return 0;
//   }
//   const isMainCall = minutesRemaining > MINUTES_AVAILABLE - 15;
//   const { adjacentValves: adjacentValves1, flowRate: flowRate1 } =
//     VALVES[valveId1];
//   const { adjacentValves: adjacentValves2, flowRate: flowRate2 } =
//     VALVES[valveId2];
//   const possibilities = [];
//   const consideredPossibilities = {};

//   for (const adjacentValveId1 of adjacentValves1) {
//     for (const adjacentValveId2 of adjacentValves2) {
//       if (consideredPossibilities[`${adjacentValveId1}|${adjacentValveId2}`]) {
//         continue;
//       }
//       if (
//         openedValves["GI"] &&
//         (adjacentValveId1 === "GI" || adjacentValveId2 === "GI")
//       ) {
//         continue;
//       }
//       consideredPossibilities[`${adjacentValveId1}|${adjacentValveId2}`] = true;
//       const memoizedKey = getMemoizedKey(
//         adjacentValveId1,
//         adjacentValveId2,
//         Object.keys(openedValves),
//         minutesRemaining - 1
//       );
//       if (memoizedValves[memoizedKey] === undefined) {
//         memoizedValves[memoizedKey] = getMaxPressureReleased(
//           adjacentValveId1,
//           adjacentValveId2,
//           openedValves,
//           minutesRemaining - 1
//         );
//       }
//       if (isMainCall) {
//         console.log(
//           minutesRemaining,
//           "Done with ",
//           adjacentValveId1,
//           adjacentValveId2
//         );
//       }
//       possibilities.push(memoizedValves[memoizedKey]);
//     }

//     if (!openedValves[valveId2] && flowRate2 !== 0) {
//       const newOpenValves = {
//         ...openedValves,
//         [valveId2]: true,
//       };
//       const memoizedKey = getMemoizedKey(
//         adjacentValveId1,
//         valveId2,
//         Object.keys(newOpenValves),
//         minutesRemaining - 1
//       );
//       if (memoizedValves[memoizedKey] === undefined) {
//         memoizedValves[memoizedKey] = getMaxPressureReleased(
//           adjacentValveId1,
//           valveId2,
//           newOpenValves,
//           minutesRemaining - 1
//         );
//       }
//       if (isMainCall) {
//         console.log(minutesRemaining, "Done with ", adjacentValveId1, valveId2);
//       }
//       possibilities.push(
//         minutesRemaining * flowRate2 + memoizedValves[memoizedKey]
//       );
//     }
//   }

//   if (!openedValves[valveId1] && flowRate1 !== 0) {
//     for (const adjacentValveId2 of adjacentValves2) {
//       const newOpenValves = {
//         ...openedValves,
//         [valveId1]: true,
//       };
//       const newOpenValveIds = Object.keys(newOpenValves);
//       const memoizedKey = getMemoizedKey(
//         valveId1,
//         adjacentValveId2,
//         newOpenValveIds,
//         minutesRemaining - 1
//       );
//       if (memoizedValves[memoizedKey] === undefined) {
//         memoizedValves[memoizedKey] = getMaxPressureReleased(
//           valveId1,
//           adjacentValveId2,
//           newOpenValves,
//           minutesRemaining - 1
//         );
//       }
//       if (isMainCall) {
//         console.log(minutesRemaining, "Done with ", valveId1, adjacentValveId2);
//       }

//       possibilities.push(
//         minutesRemaining * flowRate1 + memoizedValves[memoizedKey]
//       );
//     }
//   }

//   if (
//     !openedValves[valveId1] &&
//     flowRate1 !== 0 &&
//     !openedValves[valveId2] &&
//     flowRate2 !== 0 &&
//     valveId1 !== valveId2
//   ) {
//     const newOpenValves = {
//       ...openedValves,
//       [valveId1]: true,
//       [valveId2]: true,
//     };
//     const memoizedKey = getMemoizedKey(
//       valveId1,
//       valveId2,
//       Object.keys(newOpenValves),
//       minutesRemaining - 1
//     );
//     if (memoizedValves[memoizedKey] === undefined) {
//       memoizedValves[memoizedKey] = getMaxPressureReleased(
//         valveId1,
//         valveId2,
//         newOpenValves,
//         minutesRemaining - 1
//       );
//     }
//     if (isMainCall) {
//       console.log(minutesRemaining, "Done with ", valveId1, valveId2);
//     }

//     possibilities.push(
//       minutesRemaining * (flowRate1 + flowRate2) + memoizedValves[memoizedKey]
//     );
//   }

//   return Math.max(...possibilities);
// };

// const START_VALVE_ID = "AA";
// const result = getMaxPressureReleased(
//   START_VALVE_ID,
//   START_VALVE_ID,
//   {},
//   MINUTES_AVAILABLE - 1
// );
// console.log("Result : ", START_VALVE_ID, result);

// await fs.writeFile("memoizedValves.json", JSON.stringify(memoizedValves));
// console.log(JSON.stringify(memoizedValves));
