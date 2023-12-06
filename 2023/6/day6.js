import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const file = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n");

  const duration = [...file[0].matchAll(/\d+/g)].map(([match]) =>
    Number(match)
  );
  const distances = [...file[1].matchAll(/\d+/g)].map(([match]) =>
    Number(match)
  );

  return duration.map((duration, index) => ({
    duration,
    distance: distances[index],
  }));
};

const computeScore = (timeHeld, duration) => timeHeld * (duration - timeHeld);

const races = await parseTextInput(false);

const waysToBeat = [];
for (const { duration, distance } of races) {
  let waysToBeatCount = 0;
  for (let timeHeld = 0; timeHeld <= duration; timeHeld += 1) {
    if (computeScore(timeHeld, duration) > distance) {
      waysToBeatCount += 1;
    }
  }
  waysToBeat.push(waysToBeatCount);
}

console.log(waysToBeat);

const result = waysToBeat.reduce((previous, count) => previous * count);

console.log(result);
