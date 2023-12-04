import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const grid = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => line.split(""));

  return grid;
};

const grid = await parseTextInput(false);
const height = grid.length;
const width = grid[0].length;

const adjacentCells = [
  { dx: -1, dy: -1 },
  { dx: -1, dy: 0 },
  { dx: -1, dy: 1 },
  { dx: 0, dy: -1 },
  { dx: 0, dy: 1 },
  { dx: 1, dy: -1 },
  { dx: 1, dy: 0 },
  { dx: 1, dy: 1 },
];

const findHasSymbolAdjacent = (grid, x, y) => {
  const symbolRegex = /[^0-9.]/;
  for (const { dx, dy } of adjacentCells) {
    const neighborX = x + dx;
    const neighborY = y + dy;

    if (grid?.[neighborY]?.[neighborX]?.match(symbolRegex)) {
      return true;
    }
  }
};

const digitRegex = /\d/;
const partNumbers = [];
let result = 0;
for (let y = 0; y < height; y += 1) {
  let digits = [];
  for (let x = 0; x < width; x += 1) {
    const cell = grid[y][x];
    if (cell.match(digitRegex)) {
      digits.push({ cell, cellX: x, cellY: y });
    } else {
      if (digits.length) {
        const hasSymbolAdjacent = digits.some(({ cellX, cellY }) =>
          findHasSymbolAdjacent(grid, cellX, cellY)
        );
        if (hasSymbolAdjacent) {
          partNumbers.push(Number(digits.map(({ cell }) => cell).join("")));
          result += Number(digits.map(({ cell }) => cell).join(""));
        }
      }
      digits = [];
    }
  }

  if (digits.length) {
    const hasSymbolAdjacent = digits.some(({ cellX, cellY }) =>
      findHasSymbolAdjacent(grid, cellX, cellY)
    );
    if (hasSymbolAdjacent) {
      partNumbers.push(Number(digits.map(({ cell }) => cell).join("")));
      result += Number(digits.map(({ cell }) => cell).join(""));
    }
  }
}

console.log(partNumbers);
console.log(result);

// const isTest = false;
// const file = (
//   await fs.readFile(isTest ? "input_test.txt" : "input.txt")
// ).toString();
// const allDigitRegex = /\d+/g;
// const numbers = [...file.matchAll(allDigitRegex)].map((match) =>
//   Number(match[0])
// );
// console.log(numbers);

// console.log(
//   "equality : ",
//   JSON.stringify(partNumbers) === JSON.stringify(numbers)
// );
// for (let i = 0; i < numbers.length; i += 1) {
//   if (numbers[i] !== partNumbers[i]) {
//     console.log(
//       `Index ${i}, should find ${numbers[i]} but found ${partNumbers[i]} instead`
//     );
//     break;
//   }
// }
// console.log(numbers.slice(140, 150));

//
//
//
// 518219 is too low
// 996543 is too high
