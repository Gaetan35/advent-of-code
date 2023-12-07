import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const file = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n");

  const duration = Number(file[0].replaceAll(/\D/g, ""));
  const distance = Number(file[1].replaceAll(/\D/g, ""));

  return { duration, distance };
};

const { duration, distance } = await parseTextInput(false);

const delta = duration * duration - 4 * distance;
const x1 = (-duration - Math.sqrt(delta)) / -2;
const x2 = (-duration + Math.sqrt(delta)) / -2;

const min = Math.ceil(Math.min(x1, x2));
const max = Math.floor(Math.max(x1, x2));

const result = max - min + 1;
console.log(result);
