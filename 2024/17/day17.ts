import * as fs from "fs/promises";
import * as path from "path";

type Input = {
  register: { A: number; B: number; C: number };
  instructions: number[];
};

type InstructionInput = {
  operand: number;
  register: Input["register"];
  pointer: number;
};

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  const [registerPart, programPart] = (await fs.readFile(filePath))
    .toString()
    .split("\n\n");

  const [registerA, registerB, registerC] = registerPart
    .split("\n")
    .map((line) => +line.split(": ")[1]);

  const instructions = programPart.split("Program: ")[1].split(",").map(Number);
  return {
    register: { A: registerA, B: registerB, C: registerC },
    instructions,
  };
};

const comboOperand = (operand: number, register: Input["register"]) => {
  if (operand === 4) {
    return register.A;
  }
  if (operand === 5) {
    return register.B;
  }
  if (operand === 6) {
    return register.C;
  }
  if (operand === 7) {
    throw new Error("Invalid operand");
  }

  return operand;
};

const adv = ({ operand, register, pointer }: InstructionInput) => {
  register.A = Math.floor(
    register.A / Math.pow(2, comboOperand(operand, register))
  );
  return { pointer: pointer + 2 };
};

const bxl = ({ operand, register, pointer }: InstructionInput) => {
  register.B = (register.B ^ operand) >>> 0;
  return { pointer: pointer + 2 };
};

const bst = ({ operand, register, pointer }: InstructionInput) => {
  register.B = comboOperand(operand, register) % 8;
  return { pointer: pointer + 2 };
};

const jnz = ({ operand, register, pointer }: InstructionInput) => {
  if (register.A !== 0) {
    return { pointer: operand };
  }
  return { pointer: pointer + 2 };
};

const bxc = ({ register, pointer }: InstructionInput) => {
  register.B = (register.B ^ register.C) >>> 0;
  return { pointer: pointer + 2 };
};

const out = ({ operand, register, pointer }: InstructionInput) => {
  return { pointer: pointer + 2, output: comboOperand(operand, register) % 8 };
};

const bdv = ({ operand, register, pointer }: InstructionInput) => {
  register.B = Math.floor(
    register.A / Math.pow(2, comboOperand(operand, register))
  );
  return { pointer: pointer + 2 };
};

const cdv = ({ operand, register, pointer }: InstructionInput) => {
  register.C = Math.floor(
    register.A / Math.pow(2, comboOperand(operand, register))
  );
  return { pointer: pointer + 2 };
};

const executeInstruction = (
  input: InstructionInput & { opCode: number }
): { pointer: number; output?: string } => {
  const operations = {
    0: adv,
    1: bxl,
    2: bst,
    3: jnz,
    4: bxc,
    5: out,
    6: bdv,
    7: cdv,
  };

  return operations[input.opCode](input);
};

function part1({ register, instructions }: Input) {
  let pointer = 0;
  let output = "";
  while (pointer < instructions.length) {
    const opCode = instructions[pointer];
    const operand = instructions[pointer + 1];

    const result = executeInstruction({ opCode, operand, register, pointer });
    if (result.output !== undefined) {
      output += result.output + ",";
    }
    pointer = result.pointer;
  }

  return output.slice(0, -1);
}

function part2({ register, instructions }: Input) {
  let A = 1;
  const expectedOutput = instructions.join(",");
  let output = part1({ register: { ...register, A }, instructions });
  while (output !== expectedOutput) {
    const expectedOutputList = expectedOutput.split(",");
    const outputList = output.split(",");
    if (outputList.length < expectedOutputList.length) {
      A *= 8;
    } else {
      for (let i = 1; i <= expectedOutputList.length; i++) {
        if (expectedOutputList.at(-i) !== outputList.at(-i)) {
          A += Math.pow(8, expectedOutputList.length - i);
          break;
        }
      }
    }

    output = part1({ register: { ...register, A }, instructions });
  }
  return A;
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
