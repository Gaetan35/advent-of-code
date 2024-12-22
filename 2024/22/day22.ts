import * as fs from "fs/promises";
import * as path from "path";

type Input = number[];

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  return (await fs.readFile(filePath)).toString().split("\n").map(Number);
};

const mix = (a: number, b: number) => (a ^ b) >>> 0;
const prune = (a: number) => a % 16777216;

const computeNextSecret = (secret: number): number => {
  const step1 = prune(mix(secret, secret * 64));
  const step2 = prune(mix(step1, Math.floor(step1 / 32)));
  return prune(mix(step2, step2 * 2048));
};

function part1(input: Input) {
  let result = 0;
  for (const initialSecret of input) {
    let secret = initialSecret;
    for (let i = 0; i < 2000; i++) {
      secret = computeNextSecret(secret);
    }
    result += secret;
  }

  return result;
}

function part2(input: Input) {
  const priceForSequence: Record<string, number> = {};
  for (const initialSecret of input) {
    let secret = initialSecret;
    let price = initialSecret % 10;
    const lastDeltas = [];
    const sequencesSeen = new Set<string>();
    for (let i = 0; i < 2000; i++) {
      secret = computeNextSecret(secret);
      const newPrice = secret % 10;
      const delta = newPrice - price;

      lastDeltas.push(delta);
      if (lastDeltas.length <= 4) {
        price = newPrice;
        continue;
      }
      lastDeltas.shift();

      const key = lastDeltas.join(",");
      if (!sequencesSeen.has(key)) {
        if (priceForSequence[key] === undefined) {
          priceForSequence[key] = 0;
        }
        priceForSequence[key] += newPrice;
        sequencesSeen.add(key);
      }

      price = newPrice;
    }
  }

  return Object.values(priceForSequence).reduce(
    (acc, val) => Math.max(acc, val),
    0
  );
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
