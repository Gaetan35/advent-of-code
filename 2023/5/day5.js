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
  return [seeds, sourceDestinationMaps];
};

const [seeds, sourceDestinationMaps] = await parseTextInput(true);
// console.dir(sourceDestinationMaps, { depth: null });

const applyMapToSeed = (seed, map) => {
  for (const { source, destination, range } of map) {
    if (seed < source || seed >= source + range) {
      continue;
    }
    const delta = seed - source;
    return destination + delta;
  }
  return seed;
};

// console.log(seeds);
let result = [...seeds];
for (const map of sourceDestinationMaps) {
  result = result.map((seed) => applyMapToSeed(seed, map));
  // console.log(result);
}
console.log(result);
console.log(Math.min(...result));
