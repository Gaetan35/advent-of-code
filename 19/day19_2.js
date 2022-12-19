import * as fs from "fs/promises";

const parseInput = async (test = false) => {
  const fileContent = (
    await fs.readFile(test ? "input_test.txt" : "input.txt")
  ).toString();
  const lines = fileContent.split("\n");
  return lines.map((line) => {
    const [
      blueprintId,
      oreRobotOreCost,
      clayRobotOreCost,
      obsidianRobotOreCost,
      obsidianRobotClayCost,
      geodeRobotOreCost,
      geodeRobotObsidianCost,
    ] = line.match(/\d+/g).map((str) => parseInt(str));
    return {
      blueprintId,
      oreRobotOreCost,
      clayRobotOreCost,
      obsidianRobotOreCost,
      obsidianRobotClayCost,
      geodeRobotOreCost,
      geodeRobotObsidianCost,
    };
  });
};

const computeNextStates = (
  {
    oreRobotOreCost,
    clayRobotOreCost,
    obsidianRobotOreCost,
    obsidianRobotClayCost,
    geodeRobotOreCost,
    geodeRobotObsidianCost,
  },
  { minutesLeft, stocks, robots }
) => {
  const doNothingState = {
    minutesLeft: minutesLeft - 1,
    robots,
    stocks: {
      ore: stocks.ore + robots.ore,
      clay: stocks.clay + robots.clay,
      obsidian: stocks.obsidian + robots.obsidian,
      geode: stocks.geode + robots.geode,
    },
  };
  const nextStates = [doNothingState];

  if (stocks.ore >= oreRobotOreCost) {
    nextStates.push({
      minutesLeft: minutesLeft - 1,
      robots: { ...robots, ore: robots.ore + 1 },
      stocks: {
        ore: stocks.ore + robots.ore - oreRobotOreCost,
        clay: stocks.clay + robots.clay,
        obsidian: stocks.obsidian + robots.obsidian,
        geode: stocks.geode + robots.geode,
      },
    });
  }

  if (stocks.ore >= clayRobotOreCost) {
    nextStates.push({
      minutesLeft: minutesLeft - 1,
      robots: { ...robots, clay: robots.clay + 1 },
      stocks: {
        ore: stocks.ore + robots.ore - clayRobotOreCost,
        clay: stocks.clay + robots.clay,
        obsidian: stocks.obsidian + robots.obsidian,
        geode: stocks.geode + robots.geode,
      },
    });
  }

  if (
    stocks.ore >= obsidianRobotOreCost &&
    stocks.clay >= obsidianRobotClayCost
  ) {
    nextStates.push({
      minutesLeft: minutesLeft - 1,
      robots: { ...robots, obsidian: robots.obsidian + 1 },
      stocks: {
        ore: stocks.ore + robots.ore - obsidianRobotOreCost,
        clay: stocks.clay + robots.clay - obsidianRobotClayCost,
        obsidian: stocks.obsidian + robots.obsidian,
        geode: stocks.geode + robots.geode,
      },
    });
  }

  if (
    stocks.ore >= geodeRobotOreCost &&
    stocks.obsidian >= geodeRobotObsidianCost
  ) {
    nextStates.push({
      minutesLeft: minutesLeft - 1,
      robots: { ...robots, geode: robots.geode + 1 },
      stocks: {
        ore: stocks.ore + robots.ore - geodeRobotOreCost,
        clay: stocks.clay + robots.clay,
        obsidian: stocks.obsidian + robots.obsidian - geodeRobotObsidianCost,
        geode: stocks.geode + robots.geode,
      },
    });
  }

  return nextStates;
};

const canReachInfLimit = ({ minutesLeft, stocks, robots }, infLimit) => {
  const maxAddedScore =
    minutesLeft * robots.geode + (minutesLeft * (minutesLeft - 1)) / 2;
  return stocks.geode + maxAddedScore >= infLimit;
};

const getCacheKey = ({ minutesLeft, stocks, robots }) =>
  `${minutesLeft}|${stocks.ore}|${stocks.clay}|${stocks.obsidian}|${stocks.geode}|${robots.ore}|${robots.clay}|${robots.obsidian}|${robots.geode}`;

const computeBlueprintScore = (blueprint, infLimit) => {
  console.log("Computing score of blueprint ", blueprint.blueprintId);
  const MINUTES_AVAILABLE = 32;
  const stocks = {
    ore: 0,
    clay: 0,
    obsidian: 0,
    geode: 0,
  };
  const robots = { ore: 1, clay: 0, obsidian: 0, geode: 0 };
  const START_STATE = { minutesLeft: MINUTES_AVAILABLE, stocks, robots };
  let states = [START_STATE];
  let CACHE = {};
  let bestGeodeNumber = 0;
  let iterations = 0;
  while (states.length > 0) {
    iterations += 1;
    if (iterations % 1000000 === 0) {
      console.log(
        `${iterations / 1000000} -> blueprint: ${
          blueprint.blueprintId
        } - bestScore: ${bestGeodeNumber} - infLimit: ${infLimit}`
      );
    }

    if (iterations % 5000000 === 0) {
      console.log("before filter ", states.length);
      states = states.filter((state) => !CACHE[getCacheKey(state)]);
      console.log("after filter : ", states.length);
    }

    if (iterations % 30000000 === 0) {
      console.log("Clearing cache");
      CACHE = {};
    }

    if (iterations > 1000000 && bestGeodeNumber > infLimit) {
      console.log("Stopping here");
      return { hasFinished: false, bestScoreYet: bestGeodeNumber };
    }

    const state = states.pop();

    if (state.minutesLeft === 0) {
      if (state.stocks.geode > bestGeodeNumber) {
        bestGeodeNumber = state.stocks.geode;
      }
      continue;
    }

    if (infLimit && !canReachInfLimit(state, infLimit)) {
      continue;
    }

    const cacheKey = getCacheKey(state);
    if (CACHE[cacheKey]) {
      continue;
    }
    CACHE[cacheKey] = true;

    states.push(...computeNextStates(blueprint, state));
  }

  console.log(
    "Score of blueprint ",
    blueprint.blueprintId,
    " is ",
    bestGeodeNumber
  );

  return {
    hasFinished: true,
    qualityLevel: bestGeodeNumber,
  };
};

const blueprints = (await parseInput(false)).slice(0, 3);
// const blueprintScores = blueprints.map(computeBlueprintScore);
// console.log(blueprintScores);

// const infLimits = Array.from({ length: blueprints.length }, () => 0);
// const qualityLevels = {};
// let haveAllFinished = false;
// while (!haveAllFinished) {
//   haveAllFinished = true;
//   for (let i = 0; i < blueprints.length; i++) {
//     if (qualityLevels[i] !== undefined) {
//       continue;
//     }
//     const { hasFinished, bestScoreYet, qualityLevel } = computeBlueprintScore(
//       blueprints[i],
//       infLimits[i]
//     );
//     if (!hasFinished) {
//       haveAllFinished = false;
//       infLimits[i] = bestScoreYet;
//     } else {
//       qualityLevels[i] = qualityLevel;
//     }
//   }
//   console.log("-----------");
//   console.log(" ");
//   console.log(`${Object.values(qualityLevels).length} have finished`);
//   console.log(" ");
//   console.log("-----------");
// }

// const result = Object.values(qualityLevels).reduce(
//   (acc, qualityLevel) => acc * qualityLevel,
//   1
// );

// console.log("Quality levels : ", qualityLevels);
// console.log("Inf limits : ", infLimits);
// console.log("Result : ", result);

const result = computeBlueprintScore(blueprints[0], 15);
console.log(result);
// Blueprint 1 -> best yet is 9, less than 17
// Blueprint 2 -> max = 27
// Blueprint 3 -> max is 28
