import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split(",");

  return input;
};

const computeHashValue = (sequence) => {
  let currentValue = 0;
  for (const char of sequence) {
    currentValue += char.charCodeAt(0);
    currentValue *= 17;
    currentValue = currentValue % 256;
  }
  return currentValue;
};

const input = await parseTextInput(false);

// let part1Result = 0;
// for (const step of input) {
//   const hash = computeHashValue(step);
//   part1Result += hash;
// }
// console.log(part1Result);

const computeLensLabel = (step) => step.split("-")[0].split("=")[0];

const boxes = {};
for (const step of input) {
  const lensLabel = computeLensLabel(step);
  const boxNumber = computeHashValue(lensLabel);
  const operation = step[lensLabel.length];

  if (operation === "=") {
    if (!boxes[boxNumber]) {
      boxes[boxNumber] = [step];
    } else {
      const sameLabelBoxIndex = boxes[boxNumber].findIndex(
        (stepInBox) => computeLensLabel(stepInBox) === lensLabel
      );
      if (sameLabelBoxIndex === -1) {
        boxes[boxNumber].push(step);
      } else {
        boxes[boxNumber][sameLabelBoxIndex] = step;
      }
    }
  } else if (operation === "-") {
    if (boxes[boxNumber]) {
      boxes[boxNumber] = boxes[boxNumber].filter(
        (stepInBox) => computeLensLabel(stepInBox) !== lensLabel
      );
    }
  }
}

let focusingPower = 0;
for (const [boxNumber, steps] of Object.entries(boxes)) {
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const toAdd =
      (Number(boxNumber) + 1) * (i + 1) * Number(step[step.length - 1]);
    focusingPower += toAdd;
  }
}
console.log(focusingPower);
