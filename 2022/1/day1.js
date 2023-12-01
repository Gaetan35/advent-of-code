import * as fs from "fs/promises";

const fileContent = (await fs.readFile("input.txt")).toString();

const calories = [];
let currentSum = 0;
fileContent.split("\n").forEach((line) => {
  if (line === "") {
    calories.push(currentSum);
    currentSum = 0;
  } else {
    currentSum += parseFloat(line);
  }
});
calories.sort((a, b) => b - a);
console.log(calories.slice(0, 3));
console.log("sum : ", calories[0] + calories[1] + calories[2]);
// console.log("max : ", max);
// console.log("current sum : ", currentSum);
