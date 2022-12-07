import * as fs from "fs/promises";

const realInput = (await fs.readFile("input.txt")).toString();
const testInput1 = "bvwbjplbgvbhsrlpgdmjqwftvncz";
const testInput2 = "nppdvjthqldpwncqszvftbrmjlhg";
const testInput3 = "nznrnfrfntjfmvfwmzdfjlvtqnbhcprsg";
const testInput4 = "zcfzfwzzqfrljwzlrfnpqdbhtmscgvjw";

const getResult1 = (input, sequenceLength) => {
  const lastLetters = [...input.substring(0, sequenceLength - 1)];
  for (let i = sequenceLength - 1; i < input.length; i++) {
    lastLetters.push(input[i]);
    if (lastLetters.length === new Set(lastLetters).size) {
      return i + 1;
    }
    lastLetters.shift();
  }
};

const result1 = getResult1(realInput, 14);
console.log("Result1 : ", result1);
