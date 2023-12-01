import * as fs from "fs/promises";

const parseInput = async (test = false) => {
  const fileContent = (
    await fs.readFile(test ? "input_test.txt" : "input.txt")
  ).toString();
  const lines = fileContent.split("\n");
  return lines;
};

const snafuToDecimal = (snafuNumber) => {
  const digitValues = {
    2: 2,
    1: 1,
    0: 0,
    "-": -1,
    "=": -2,
  };
  let decimal = 0;
  for (let i = 0; i < snafuNumber.length; i++) {
    const digit = digitValues[snafuNumber[snafuNumber.length - 1 - i]];
    decimal += digit * Math.pow(5, i);
  }
  return decimal;
};

const sumArrays = (number1, number2) => {
  const maxLength = Math.max(number1.length, number2.length);
  number1.reverse();
  number2.reverse();
  const result = Array.from(
    {
      length: maxLength + 1,
    },
    () => 0
  );
  for (let i = 0; i < maxLength; i++) {
    if (number1[i] === undefined) {
      result[i] = result[i] + number2[i] ?? 0;
    } else if (number2[i] === undefined) {
      result[i] = result[i] + number1[i] ?? 0;
    } else {
      result[i] = result[i] + number1[i] + number2[i];
      if (result[i] > 2) {
        result[i + 1] += 1;
        result[i] -= 5;
      }
    }
  }
  return result.reverse();
};

const decimalToSnafu = (decimalNumber) => {
  const digitConversion = {
    0: [0, 0],
    1: [0, 1],
    2: [0, 2],
    3: [1, -2],
    4: [1, -1],
  };
  if (decimalNumber < 5) {
    return digitConversion[decimalNumber % 5];
  }
  for (let power = 2; power < 25; power++) {
    if (decimalNumber < Math.pow(5, power)) {
      return sumArrays(
        [
          ...digitConversion[
            Math.floor(decimalNumber / Math.pow(5, power - 1))
          ],
          ...Array.from({ length: power - 1 }, () => 0),
        ],
        decimalToSnafu(decimalNumber % Math.pow(5, power - 1))
      );
    }
  }

  // if (decimalNumber < 25) {
  //   return sumArrays(
  //     [...digitConversion[Math.floor(decimalNumber / 5)], 0],
  //     decimalToSnafu(decimalNumber % 5)
  //   );
  // }

  // if (decimalNumber < 125) {
  //   return sumArrays(
  //     [
  //       ...digitConversion[Math.floor(decimalNumber / 25)],
  //       ...Array.from({ length: 2 }, () => 0),
  //     ],
  //     decimalToSnafu(decimalNumber % 25)
  //   );
  // }

  // if (decimalNumber < 625) {
  //   return sumArrays(
  //     [
  //       ...digitConversion[Math.floor(decimalNumber / 125)],
  //       ...Array.from({ length: 3 }, () => 0),
  //     ],
  //     decimalToSnafu(decimalNumber % 125)
  //   );
  // }

  // if (decimalNumber < 3125) {
  //   return sumArrays(
  //     [
  //       ...digitConversion[Math.floor(decimalNumber / 625)],
  //       ...Array.from({ length: 4 }, () => 0),
  //     ],
  //     decimalToSnafu(decimalNumber % 625)
  //   );
  // }
};

const checkResult = (numberArray) => {
  const digits = { "-2": "=", "-1": "-", 0: 0, 1: 1, 2: 2 };
  return snafuToDecimal(numberArray.map((value) => digits[value]).join(""));
};

// console.log(0, decimalToSnafu(0));
// console.log(1, decimalToSnafu(1));
// console.log(2, decimalToSnafu(2));
// console.log(3, decimalToSnafu(3));
// console.log(4, decimalToSnafu(4));
// console.log(5, decimalToSnafu(5));
// console.log(6, decimalToSnafu(6));
// console.log(7, decimalToSnafu(7));
// console.log(8, decimalToSnafu(8));
// console.log(9, decimalToSnafu(9));
// console.log(10, decimalToSnafu(10));
// console.log(11, decimalToSnafu(11));
// console.log(12, decimalToSnafu(12));
// console.log(13, decimalToSnafu(13));
// console.log(14, decimalToSnafu(14));
// console.log(15, decimalToSnafu(15));
// console.log(20, decimalToSnafu(20));
// console.log(25, decimalToSnafu(25), checkResult(decimalToSnafu(25)));
// console.log(50, decimalToSnafu(50), checkResult(decimalToSnafu(50)));
// console.log(75, decimalToSnafu(75), checkResult(decimalToSnafu(75)));
// console.log(100, decimalToSnafu(100), checkResult(decimalToSnafu(100)));
// console.log(250, decimalToSnafu(250), checkResult(decimalToSnafu(250)));
// console.log(624, decimalToSnafu(624), checkResult(decimalToSnafu(624)));
// console.log(2022, decimalToSnafu(2022), checkResult(decimalToSnafu(2022)));
// console.log(
//   314159265,
//   decimalToSnafu(314159265),
//   checkResult(decimalToSnafu(314159265))
// );

// console.log(2022, decimalToSnafu(2022), checkResult(decimalToSnafu(2022)));

const snafuNumbers = await parseInput(false);
const decimalSum = snafuNumbers
  .map(snafuToDecimal)
  .reduce((acc, value) => acc + value, 0);
const snafuSum = decimalToSnafu(decimalSum);
const confirmedResult = checkResult(snafuSum);
console.log(
  "Decimal sum : ",
  decimalSum,
  "confirmed result : ",
  confirmedResult
);
const digits = { "-2": "=", "-1": "-", 0: 0, 1: 1, 2: 2 };
console.log("Snafu sum : ", snafuSum.map((value) => digits[value]).join(""));
