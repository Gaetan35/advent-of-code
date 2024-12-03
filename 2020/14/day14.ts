import * as fs from "fs/promises";

type Input = (
  | {
      type: "mask";
      value: string;
    }
  | {
      type: "mem";
      address: number;
      value: number;
    }
)[];

const parseTextInput = async (isTest = false): Promise<Input> => {
  const memLineRegex = /^mem\[(\d+)\] = (\d+)$/;

  return (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => {
      if (line.substring(0, 4) === "mask") {
        return {
          type: "mask",
          value: line.substring(7),
        } as const;
      }

      const match = line.match(memLineRegex);

      if (match) {
        const address = Number(match[1]);
        const value = Number(match[2]);
        return { type: "mem", address, value } as const;
      }

      throw new Error("Invalid input");
    });
};

const numberToBinary = (num: number) => {
  return num.toString(2).padStart(36, "0");
};

const binaryToNumber = (binary: string) => {
  return parseInt(binary, 2);
};

function part1(instructions: Input) {
  let mask = "";
  const memory: Record<string, number> = {};
  for (const instruction of instructions) {
    if (instruction.type === "mask") {
      mask = instruction.value;
    } else {
      const binaryValue = numberToBinary(instruction.value);
      let result = "";
      for (let i = 0; i < mask.length; i++) {
        result += mask[i] === "X" ? binaryValue[i] : mask[i];
      }
      memory[instruction.address] = binaryToNumber(result);
    }
  }

  return Object.values(memory).reduce((acc, curr) => acc + curr, 0);
}

function part2(instructions: Input) {
  let mask = "";
  const memory: Record<string, number> = {};

  for (const instruction of instructions) {
    if (instruction.type === "mask") {
      mask = instruction.value;
    } else {
      const binaryValue = numberToBinary(instruction.address);
      let addresses = [""];
      for (let i = 0; i < mask.length; i++) {
        const newAddresses: string[] = [];
        for (let j = 0; j < addresses.length; j++) {
          if (mask[i] === "0") {
            newAddresses.push(addresses[j] + binaryValue[i]);
          } else if (mask[i] === "1") {
            newAddresses.push(addresses[j] + "1");
          } else {
            newAddresses.push(addresses[j] + "0");
            newAddresses.push(addresses[j] + "1");
          }
        }
        addresses = [...newAddresses];
      }

      addresses
        .map((address) => binaryToNumber(address))
        .forEach((address) => {
          memory[address] = instruction.value;
        });
    }
  }
  return Object.values(memory).reduce((acc, curr) => acc + curr, 0);
}

async function main() {
  const IS_TEST = process.argv[2] === "test";
  const input = await parseTextInput(IS_TEST);

  const part1Result = part1(input);
  console.log("Part1 result: ", part1Result);

  // const part2Result = part2(input);
  // console.log("Part2 result: ", part2Result);
}

main();
