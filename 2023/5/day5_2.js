import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const file = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n\n");

  const seeds = [...file[0].matchAll(/\d+/g)].map(([match]) => Number(match));
  const sourceDestinationMaps = [];
  for (const map of file.slice(1)) {
    const lines = map.split("\n").slice(1);
    sourceDestinationMaps.push(
      lines.map((line) => {
        const [destination, source, range] = [...line.matchAll(/\d+/g)].map(
          ([match]) => Number(match)
        );
        return { source, destination, range };
      })
    );
  }
  const seedRanges = [];
  for (let i = 0; i < seeds.length; i += 2) {
    seedRanges.push({ start: seeds[i], end: seeds[i] + seeds[i + 1] - 1 });
  }
  return [seedRanges, sourceDestinationMaps];
};

const applyLineToSeed = (seed, { source, destination }) => {
  const delta = seed - source;
  return destination + delta;
};

const applyMapToSeedRange = ({ start: seedStart, end: seedEnd }, map) => {
  for (const {
    source: sourceStart,
    destination: destinationStart,
    range,
  } of map) {
    const sourceEnd = sourceStart + range - 1;
    const destinationEnd = destinationStart + range - 1;
    if (seedEnd < sourceStart || seedStart > sourceEnd) {
      // seed range is not included in source range
      continue;
    }
    if (sourceStart <= seedStart && seedEnd <= sourceEnd) {
      // seed range is fully included in source range
      const line = { source: sourceStart, destination: destinationStart };
      return [
        {
          start: applyLineToSeed(seedStart, line),
          end: applyLineToSeed(seedEnd, line),
        },
      ];
    }
    if (seedStart < sourceStart && seedEnd <= sourceEnd) {
      // const newSeedRanges = [
      //   { start: seedStart, end: sourceStart - 1 },
      //   { start: sourceStart, end: seedEnd },
      // ];
      const line = { source: sourceStart, destination: destinationStart };
      return [
        {
          start: applyLineToSeed(sourceStart, line),
          end: applyLineToSeed(seedEnd, line),
        },
        ...applyMapToSeedRange({ start: seedStart, end: sourceStart - 1 }, map),
      ];
    }
    if (sourceStart <= seedStart && sourceEnd < seedEnd) {
      // const newSeedRanges = [
      //   { start: seedStart, end: sourceEnd },
      //   { start: sourceEnd + 1, end: seedEnd },
      // ];
      const line = { source: sourceStart, destination: destinationStart };
      return [
        {
          start: applyLineToSeed(seedStart, line),
          end: applyLineToSeed(sourceEnd, line),
        },
        ...applyMapToSeedRange({ start: sourceEnd + 1, end: seedEnd }, map),
      ];
    }
    if (seedStart < sourceStart && sourceEnd < seedEnd) {
      // const newSeedRanges = [
      //   { start: seedStart, end: sourceStart - 1 },
      //   { start: sourceStart, end: sourceEnd },
      //   { start: sourceEnd + 1, end: seedEnd },
      // ];
      const line = { source: sourceStart, destination: destinationStart };
      return [
        {
          start: applyLineToSeed(sourceStart, line),
          end: applyLineToSeed(sourceEnd, line),
        },
        ...applyMapToSeedRange({ start: seedStart, end: sourceStart - 1 }, map),
        ...applyMapToSeedRange({ start: sourceEnd + 1, end: seedEnd }, map),
      ];
    }
  }

  return [{ start: seedStart, end: seedEnd }];
};

const [seedRanges, sourceDestinationMaps] = await parseTextInput(false);
console.dir(sourceDestinationMaps, { depth: null });

let result = [...seedRanges];
console.dir(result, { depth: null });
for (const mapping of sourceDestinationMaps) {
  result = result.flatMap((seedRange) =>
    applyMapToSeedRange(seedRange, mapping)
  );
  console.dir(result, { depth: null });
}
const minResult = Math.min(...result.map(({ start }) => start));
console.log(minResult);
