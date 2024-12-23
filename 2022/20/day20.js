import * as fs from "fs/promises";

const parseInput = async (test = false) => {
  const fileContent = (
    await fs.readFile(test ? "input_test.txt" : "input.txt")
  ).toString();
  const lines = fileContent.split("\n");
  return lines.map((str) => parseInt(str));
};

const moveItemInArray = (numbers, oldIndex, newIndex) => {
  const deleted = numbers.filter((_, index) => index !== oldIndex);
  return [
    ...deleted.slice(0, newIndex),
    numbers[oldIndex],
    ...deleted.slice(newIndex),
  ];
};

const buildListFromIndexes = (numbers, currentIndexes) => {
  const result = Array.from({ length: numbers.length }, () => "notfilled");
  for (const [initialIndex, currentIndex] of Object.entries(currentIndexes)) {
    result[currentIndex] = numbers[initialIndex];
  }
  return result;
};

const mixNumbers = (numbers, numberOfMixing) => {
  const listLength = numbers.length;

  // Key = original index, value = currentIndex
  const currentIndexes = numbers.reduce(
    (acc, _, index) => ({
      ...acc,
      [index]: index,
    }),
    {}
  );

  for (let mixingCount = 0; mixingCount < numberOfMixing; mixingCount++) {
    for (let indexToMove = 0; indexToMove < listLength; indexToMove++) {
      const oldIndex = currentIndexes[indexToMove];

      let newIndex =
        (oldIndex +
          (numbers[indexToMove] % (listLength - 1)) +
          3 * (listLength - 1)) %
        (listLength - 1);
      // for (
      //   let i = 0;
      //   i < Math.abs(numbers[indexToMove]) % (listLength - 1);
      //   i++
      // ) {
      //   newIndex += numbers[indexToMove] / Math.abs(numbers[indexToMove]);
      //   if (newIndex === listLength) {
      //     newIndex = 1;
      //   } else if (newIndex === -1) {
      //     newIndex = listLength - 2;
      //   }
      // }
      // if (numbers[indexToMove] > 0) {

      // }

      if (oldIndex < newIndex) {
        for (let i = 0; i < listLength; i++) {
          if (i === indexToMove) {
            currentIndexes[indexToMove] = newIndex;
          } else if (
            currentIndexes[i] > oldIndex &&
            currentIndexes[i] <= newIndex
          ) {
            currentIndexes[i] -= 1;
          }
        }
      }

      if (oldIndex > newIndex) {
        for (let i = 0; i < listLength; i++) {
          if (i === indexToMove) {
            currentIndexes[indexToMove] = newIndex;
          } else if (
            currentIndexes[i] < oldIndex &&
            currentIndexes[i] >= newIndex
          ) {
            currentIndexes[i] += 1;
          }
        }
      }
    }
    // console.log(
    //   `After ${mixingCount + 1} round of mixing:\n ${buildListFromIndexes(
    //     numbers,
    //     currentIndexes
    //   ).join(", ")}\n`
    // );
  }

  return buildListFromIndexes(numbers, currentIndexes);
};

const numbers = await parseInput(false);
// console.log(numbers.length);
// console.log([...new Set(numbers)].length);
const DECRYPTION_KEY = 811589153;
const NUMBER_OF_MIXING = 10;
const decryptedNumbers = numbers.map((number) => number * DECRYPTION_KEY);
console.log("Decrypted numbers : ", decryptedNumbers);
const result = mixNumbers(decryptedNumbers, NUMBER_OF_MIXING);

const zeroIndex = result.indexOf(0);
console.log("zeroIndex : ", zeroIndex);
// console.log(result[zeroIndex]);
// console.log(result[zeroIndex + 1000]);
// console.log(result[zeroIndex + 2000]);
const value1000 = result[(zeroIndex + 1000) % result.length];
const value2000 = result[(zeroIndex + 2000) % result.length];
const value3000 = result[(zeroIndex + 3000) % result.length];

console.log("Values found : ", value1000, value2000, value3000);
console.log("Sum : ", value1000 + value2000 + value3000);

// First part : good answer is 4267
