import * as fs from "fs/promises";

const fileContent = (await fs.readFile("input.txt")).toString();

const computeLetterPriority = (letter) => {
  const charCode = letter.charCodeAt();
  return charCode <= 90 ? 27 + charCode - 65 : charCode - 96;
};

// const result1 = fileContent.split("\n").reduce((prioritySum, line) => {
//   const firstHalf = line.substring(0, line.length / 2);
//   const secondHalf = line.substring(line.length / 2);
//   const occurences = {};
//   for (let letter of firstHalf) {
//     occurences[letter] = true;
//   }
//   let linePrioritySum = 0;
//   for (let letter of secondHalf) {
//     if (occurences[letter]) {
//       linePrioritySum += computeLetterPriority(letter);
//       occurences[letter] = false;
//     }
//   }
//   return prioritySum + linePrioritySum;
// }, 0);

// console.log("Part1 result : ", result1);

let occurences = {};
const result2 = fileContent
  .split("\n")
  .reduce((prioritySum, line, currentIndex) => {
    const lineOccurences = {};
    for (let letter of line) {
      if (!lineOccurences[letter]) {
        occurences[letter] = (occurences[letter] ?? 0) + 1;
      }
      lineOccurences[letter] = true;
    }
    if (currentIndex % 3 === 2) {
      const commonItem = Object.keys(occurences).filter(
        (letter) => occurences[letter] === 3
      )[0];
      occurences = {};
      return prioritySum + computeLetterPriority(commonItem);
    }
    return prioritySum;
  }, 0);

console.log("Part 2 result : ", result2);
