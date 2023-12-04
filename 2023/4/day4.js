import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const cards = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((card) => {
      const numbers = card.split(": ")[1];
      const [winningNumbersString, chosenNumbersString] = numbers.split(" | ");
      const winningNumbers = Object.fromEntries(
        [...winningNumbersString.matchAll(/\d+/g)].map((match) => [
          Number(match[0]),
          true,
        ])
      );
      const chosenNumbers = [...chosenNumbersString.matchAll(/\d+/g)].map(
        (match) => Number(match[0])
      );
      return { winningNumbers, chosenNumbers };
    });

  return cards;
};

const cards = await parseTextInput(false);

// const part1Result = cards.reduce(
//   (previous, { winningNumbers, chosenNumbers }) => {
//     let count = 0;
//     for (const chosenNumber of chosenNumbers) {
//       if (winningNumbers[chosenNumber]) {
//         count += 1;
//       }
//     }
//     return count === 0 ? previous : previous + Math.pow(2, count - 1);
//   },
//   0
// );

let cardIndex = 1;
const matchingNumbersPerCard = {};
const cardsCount = {};
for (const { winningNumbers, chosenNumbers } of cards) {
  let count = 0;
  for (const chosenNumber of chosenNumbers) {
    if (winningNumbers[chosenNumber]) {
      count += 1;
    }
  }
  matchingNumbersPerCard[cardIndex] = count;
  cardsCount[cardIndex] = 1;
  cardIndex += 1;
}

for (let cardId = 1; cardId <= cards.length; cardId += 1) {
  const winningNumbersFound = matchingNumbersPerCard[cardId];
  if (winningNumbersFound === 0) {
    continue;
  }
  for (let i = cardId + 1; i <= cardId + winningNumbersFound; i += 1) {
    cardsCount[i] += cardsCount[cardId];
  }
}
const part2Result = Object.values(cardsCount).reduce(
  (previous, count) => previous + count
);
console.log(part2Result);
