import * as fs from "fs/promises";
import * as path from "path";

type Input = (
  | { type: "file"; id: number; length: number }
  | { type: "space"; length: number }
)[];

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  const line = (await fs.readFile(filePath)).toString().split("").map(Number);

  let type = "file";
  let id = 0;
  const results = [];
  for (const block of line) {
    if (type === "file") {
      results.push({ type, id, length: block });
      id += 1;
    } else {
      results.push({ type, length: block });
    }
    type = type === "file" ? "space" : "file";
  }
  return results;
};

const swap = (
  hardDrive: Input,
  firstSpaceIndex: number,
  lastFileIndex: number
) => {
  const { length: spaceLength } = hardDrive[firstSpaceIndex];
  const { length: fileLength, id } = hardDrive[lastFileIndex] as {
    type: "file";
    id: number;
    length: number;
  };

  const newHardDrive = [];
  for (let i = 0; i < hardDrive.length; i++) {
    if (i === firstSpaceIndex) {
      if (spaceLength === fileLength) {
        newHardDrive.push({ type: "file", id, length: fileLength });
      }
      if (spaceLength > fileLength) {
        newHardDrive.push({ type: "file", id, length: fileLength });
        newHardDrive.push({ type: "space", length: spaceLength - fileLength });
      }
      if (fileLength > spaceLength) {
        newHardDrive.push({ type: "file", id, length: spaceLength });
      }
      continue;
    }
    if (i === lastFileIndex) {
      if (spaceLength === fileLength) {
        newHardDrive.push({ type: "space", length: fileLength });
      }
      if (spaceLength > fileLength) {
        newHardDrive.push({ type: "space", length: fileLength });
      }
      if (fileLength > spaceLength) {
        newHardDrive.push({
          type: "file",
          id,
          length: fileLength - spaceLength,
        });
        newHardDrive.push({ type: "space", length: spaceLength });
      }
      continue;
    }
    newHardDrive.push(hardDrive[i]);
  }
  return newHardDrive;
};

function part1(input: Input) {
  let firstSpaceIndex = 1;
  let lastFileIndex =
    input.at(-1).type === "file" ? input.length - 1 : input.length - 2;

  let hardDrive = [...input];

  while (firstSpaceIndex < lastFileIndex) {
    hardDrive = swap(hardDrive, firstSpaceIndex, lastFileIndex);

    while (hardDrive[firstSpaceIndex].type !== "space") {
      firstSpaceIndex += 1;
    }
    while (hardDrive[lastFileIndex].type !== "file") {
      lastFileIndex -= 1;
    }
  }

  let checksum = 0;
  let index = 0;
  for (const block of hardDrive) {
    if (block.type === "file") {
      for (let i = 0; i < block.length; i++) {
        checksum += index * block.id;
        index += 1;
      }
    }
  }

  return checksum;
}

function part2(input: Input) {
  return null;
}

async function main() {
  const IS_TEST = process.argv[2] === "test";
  const input = await parseTextInput(IS_TEST);

  const part1Result = part1(input);
  console.log("Part1 result: ", part1Result);

  const part2Result = part2(input);
  console.log("Part2 result: ", part2Result);
}

main();
