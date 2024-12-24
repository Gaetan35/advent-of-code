import * as fs from "fs/promises";
import * as path from "path";

type Input = {
  wireValues: Record<string, number>;
  gates: {
    input1: string;
    input2: string;
    gate: "AND" | "XOR" | "OR";
    output: string;
  }[];
  bitNumber: number;
};

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  const [initPart, gatesPart] = (await fs.readFile(filePath))
    .toString()
    .split("\n\n");

  let bitNumber = 0;
  const wireValues: Record<string, number> = {};
  initPart.split("\n").forEach((line) => {
    const [wire, value] = line.split(": ");
    wireValues[wire] = +value;
    const bit = +wire.substring(1);
    bitNumber = Math.max(bitNumber, bit);
  });

  const gates = gatesPart.split("\n").map((line) => {
    const [input, output] = line.split(" -> ");
    const [input1, gate, input2] = input.split(" ") as [
      string,
      "AND" | "XOR" | "OR",
      string
    ];
    return { input1, input2, gate, output };
  });

  return { wireValues, gates, bitNumber };
};

const gateOperations = {
  AND: (a: number, b: number) => a & b,
  XOR: (a: number, b: number) => a ^ b,
  OR: (a: number, b: number) => a | b,
};

const computeOutput = ({
  wireValues,
  gates,
}: Pick<Input, "gates" | "wireValues">) => {
  let hasChanged = true;
  while (hasChanged) {
    hasChanged = false;
    for (const { input1, input2, gate, output } of gates) {
      if (wireValues[output] !== undefined) {
        continue;
      }
      if (
        wireValues[input1] === undefined ||
        wireValues[input2] === undefined
      ) {
        continue;
      }
      hasChanged = true;
      wireValues[output] = gateOperations[gate](
        wireValues[input1],
        wireValues[input2]
      );
    }
  }

  return Object.entries(wireValues)
    .filter(([key, value]) => key.startsWith("z"))
    .sort(([key1], [key2]) => (key1 < key2 ? 1 : -1))
    .map(([key, value]) => value)
    .join("");
};

function part1({ wireValues, gates }: Input) {
  const result = computeOutput({ wireValues, gates });
  return parseInt(result, 2);
}

function computeSum({
  x,
  y,
  bitNumber,
  gates,
}: Pick<Input, "gates"> & { x: number; y: number; bitNumber: number }) {
  const binaryX = x.toString(2).padStart(bitNumber + 1, "0");
  const binaryY = y.toString(2).padStart(bitNumber + 1, "0");

  const wireValues = {};
  for (let i = 0; i <= bitNumber; i++) {
    wireValues[`x${(bitNumber - i).toString().padStart(2, "0")}`] = binaryX[i];
    wireValues[`y${(bitNumber - i).toString().padStart(2, "0")}`] = binaryY[i];
  }

  const binaryZ = computeOutput({ wireValues, gates });
  const z = parseInt(binaryZ, 2);
  return { binaryX, binaryY, binaryZ, x, y, z };
}

function checkDependencies(gates: Input["gates"], bitNumber: number) {
  const connections = {};
  for (const { input1, input2, output } of gates) {
    connections[output] = [input1, input2];
  }
  const final: Record<string, string[]> = {};
  for (let i = 0; i <= bitNumber + 1; i++) {
    const outputGate = `z${i.toString().padStart(2, "0")}`;
    final[outputGate] = [];
    const dependencies = [outputGate];
    const obtained = new Set<string>();
    while (dependencies.length) {
      const node = dependencies.pop();
      if (node.startsWith("x") || node.startsWith("y")) {
        if (!obtained.has(node)) {
          final[outputGate].push(node);
          obtained.add(node);
        }
        continue;
      }
      const [input1, input2] = connections[node];
      dependencies.push(input1, input2);
    }
  }
  const finalFormatted = Object.fromEntries(
    Object.entries(final).map(([key, value]) => [
      key,
      [...new Set(value.map((v) => v))].sort((a, b) => (a > b ? 1 : -1)),
    ])
  );
  console.log("Final", finalFormatted);
}

function part2({ gates: originalGates, bitNumber }: Input) {
  // Code doesn't help much here, just some utilities function to check where the incorrect gates are
  // Then with pen and paper, looking at text input I searched for the correct gates to swap

  const swaps = [
    ["gbf", "z09"],
    ["nbf", "z30"],
    ["hdt", "z05"],
    ["jgt", "mht"],
  ];

  const gates = originalGates.map((gate) => {
    for (const [from, to] of swaps) {
      if (gate.output === from) {
        return { ...gate, output: to };
      }
      if (gate.output === to) {
        return { ...gate, output: from };
      }
    }
    return { ...gate };
  });

  // All zBit (except the last one z45) should be XOR
  for (const gate of gates) {
    if (gate.output.startsWith("z") && gate.gate !== "XOR") {
      console.log(gate);
    }
  }

  // Search for invalid sum for all powers of 2
  for (let i = 0; i < bitNumber; i++) {
    const x = Math.floor(Math.random() * Math.pow(2, bitNumber));
    const y = Math.floor(Math.random() * Math.pow(2, bitNumber));
    const result = computeSum({
      x,
      y,
      bitNumber,
      gates,
    });
    if (result.x + result.y !== result.z) {
      console.log("i: ", i, result);
    }
  }

  // Check which input gates (x or y) are used for which output gates (z)
  checkDependencies(gates, bitNumber);

  return swaps.flat().sort().join(",");
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
