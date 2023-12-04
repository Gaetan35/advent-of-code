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

const result = cards.reduce((previous, { winningNumbers, chosenNumbers }) => {
  let count = 0;
  for (const chosenNumber of chosenNumbers) {
    if (winningNumbers[chosenNumber]) {
      count += 1;
    }
  }
  return count === 0 ? previous : previous + Math.pow(2, count - 1);
}, 0);

console.log(result);
