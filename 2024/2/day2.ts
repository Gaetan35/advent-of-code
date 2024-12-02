import * as fs from "fs/promises";

type Input = number[][];

const parseTextInput = async (isTest = false): Promise<Input> => {
  return (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => line.split(" ").map(Number));
};

const isReportSafe = (report: number[]) => {
  for (let i = 0; i < report.length - 1; i++) {
    const delta = Math.abs(report[i + 1] - report[i]);
    const isSameVariation =
      i > 0
        ? (report[i + 1] - report[i]) * (report[i] - report[i - 1]) >= 0
        : true;

    if (delta > 3 || delta < 1 || !isSameVariation) {
      return false;
    }
  }
  return true;
};

function part1(input: Input) {
  let safeReports = 0;
  for (const report of input) {
    if (isReportSafe(report)) {
      safeReports++;
    }
  }
  return safeReports;
}

function part2(input: Input) {
  let safeReports = 0;
  for (const report of input) {
    const isValidReport = isReportSafe(report);
    if (isValidReport) {
      safeReports++;
      continue;
    }
    for (let i = 0; i < report.length; i++) {
      const reportWithoutI = [...report.slice(0, i), ...report.slice(i + 1)];
      const isValidReport = isReportSafe(reportWithoutI);
      if (isValidReport) {
        safeReports++;
        break;
      }
    }
  }
  return safeReports;
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
