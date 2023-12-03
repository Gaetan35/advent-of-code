import * as fs from "fs/promises";

const test = false;
const fileContent = (
  await fs.readFile(test ? "input_test.txt" : "input.txt")
).toString();

const toChange = [
  [/one/g, 1],
  [/two/g, 2],
  [/three/g, 3],
  [/four/g, 4],
  [/five/g, 5],
  [/six/g, 6],
  [/seven/g, 7],
  [/eight/g, 8],
  [/nine/g, 9],
  [/\d/g, null],
];

const getMatches = (line) => {
  return toChange
    .flatMap(([regex, digit]) => {
      const matches = [...line.matchAll(regex)];
      for (const match of matches) {
        if (match) {
          match.digit = digit;
        }
      }
      return matches;
    })
    .filter((change) => !!change)
    .sort((a, b) => {
      return a.index - b.index;
    });
};

const computeDigits = (line) => {
  let matches = getMatches(line);
  console.log(matches);
  return matches.reduce((previous, match) => {
    const digit = match.digit ?? parseInt(match[0], 10);
    return `${previous}${digit}`;
  }, "");
};

const result = fileContent.split("\n").reduce((previous, line) => {
  const digits = computeDigits(line);
  const calibration = parseInt(`${digits[0]}${digits[digits.length - 1]}`, 10);
  return previous + calibration;
}, 0);

console.log(result);
