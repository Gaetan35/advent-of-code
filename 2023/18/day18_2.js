import * as fs from "fs/promises";

const numberToDirection = {
  0: "R",
  1: "D",
  2: "L",
  3: "U",
};
const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => {
      const [direction, length, colorRaw] = line.split(" ");
      const color = colorRaw.substring(2, colorRaw.length - 1);
      return {
        direction: numberToDirection[color.at(-1)],
        length: parseInt(color.substring(0, 5), 16),
        color,
      };
      return {
        direction,
        length: Number(length),
        color,
      };
    });

  return input;
};

const DELTAS_PER_DIRECTION = {
  R: [1, 0],
  L: [-1, 0],
  U: [0, -1],
  D: [0, 1],
};

const computeLines = (input) => {
  const pos = [0, 0];
  const verticalLines = [];
  const horizontalLines = [];

  for (const { direction, length } of input) {
    const [dx, dy] = DELTAS_PER_DIRECTION[direction];
    if (direction === "U" || direction === "D") {
      const y1 = pos[1];
      const y2 = pos[1] + dy * length;
      verticalLines.push({
        x: pos[0],
        yMin: Math.min(y1, y2),
        yMax: Math.max(y1, y2),
      });
    } else {
      const x1 = pos[0];
      const x2 = pos[0] + dx * length;
      horizontalLines.push({
        y: pos[1],
        xMin: Math.min(x1, x2),
        xMax: Math.max(x1, x2),
      });
    }
    pos[0] += dx * length;
    pos[1] += dy * length;
  }

  verticalLines.sort((line1, line2) => {
    if (line1.x !== line2.x) {
      return line1.x - line2.x;
    }
    return line1.yMin - line2.yMin;
  });

  horizontalLines.sort((line1, line2) => {
    if (line1.y !== line2.y) {
      return line1.y - line2.y;
    }
    return line1.xMin - line2.xMin;
  });

  // TODO: ignore the extremities of vertical lines, and add the sum of horizontal lines
  return [verticalLines, horizontalLines];
};

const splitVerticalLines = (verticalLines) => {
  let splittedLines = [...verticalLines];
  let hasSplit = true;
  let step = 0;
  while (hasSplit) {
    step += 1;
    if (step % 1000 === 0) {
      console.log("Length : ", splittedLines.length);
      console.log(splittedLines.slice(0, 20));
    }
    hasSplit = false;
    for (let i = 0; i < splittedLines.length; i++) {
      const { yMin, yMax, x } = splittedLines[i];
      const newSplittedLines = [];
      const currentLineSplits = [];
      // console.log(`i = ${i}, `, { yMin, yMax, x });
      for (const { yMin: yMin2, yMax: yMax2, x: x2 } of splittedLines) {
        if (yMin === yMin2 && yMax === yMax2 && x === x2) {
          continue;
        }
        if (yMax < yMin2 || yMin > yMax2) {
          // No intersection
          newSplittedLines.push({ yMin: yMin2, yMax: yMax2, x: x2 });
          continue;
        }
        if (yMin === yMin2 && yMax === yMax2) {
          newSplittedLines.push({ yMin: yMin2, yMax: yMax2, x: x2 });
          continue;
        }
        hasSplit = true;

        if (yMin === yMin2 && yMax < yMax2) {
          if (yMin > yMax || yMax + 1 > yMax2) {
            console.log("cas 10");
          }
          newSplittedLines.push(
            { yMin, yMax, x: x2 },
            { yMin: yMax + 1, yMax: yMax2, x: x2 }
          );
          continue;
        }
        if (yMin === yMin2 && yMax > yMax2) {
          if (yMin > yMax2 || yMax2 + 1 > yMax) {
            console.log("cas 9");
          }
          currentLineSplits.push(yMax2, yMax2 + 1);
          newSplittedLines.push(
            { yMin, yMax: yMax2, x: x2 },
            { yMin: yMax2 + 1, yMax: yMax, x }
          );
          continue;
        }

        if (yMax === yMax2 && yMin > yMin2) {
          if (yMin2 > yMin - 1 || yMin > yMax) {
            console.log("cas 7");
          }
          newSplittedLines.push(
            { yMin: yMin2, yMax: yMin - 1, x: x2 },
            { yMin: yMin, yMax: yMax, x: x2 }
          );
          continue;
        }
        if (yMax === yMax2 && yMin < yMin2) {
          if (yMin2 > yMax2) {
            console.log("cas 6");
          }
          currentLineSplits.push(yMin2 - 1, yMin2);
          newSplittedLines.push({ yMin: yMin2, yMax: yMax2, x: x2 });
          continue;
        }

        if (yMin < yMin2 && yMax < yMax2) {
          // overlaps beginning
          if (yMin2 > yMax || yMax + 1 > yMax2) {
            console.log("cas 4");
          }
          currentLineSplits.push(yMin2 - 1, yMin2);
          newSplittedLines.push(
            { yMin: yMin2, yMax, x: x2 },
            { yMin: yMax + 1, yMax: yMax2, x: x2 }
          );
          continue;
        }
        if (yMin > yMin2 && yMax < yMax2) {
          // included inside
          if (yMin2 > yMin - 1 || yMin > yMax || yMax + 1 > yMax2) {
            console.log("cas 3");
          }
          newSplittedLines.push(
            { yMin: yMin2, yMax: yMin - 1, x: x2 },
            { yMin, yMax, x: x2 },
            { yMin: yMax + 1, yMax: yMax2, x: x2 }
          );
          continue;
        }
        if (yMin > yMin2 && yMax > yMax2) {
          // overlaps end
          if (yMin2 > yMin - 1 || yMin > yMax2) {
            console.log("cas 2");
          }
          currentLineSplits.push(yMax2, yMax2 + 1);
          newSplittedLines.push(
            { yMin: yMin2, yMax: yMin - 1, x: x2 },
            { yMin, yMax: yMax2, x: x2 }
          );
          continue;
        }
        if (yMin < yMin2 && yMax > yMax2) {
          // overlaps both ends
          if (yMin > yMin2 - 1 || yMin2 > yMax2) {
            console.log("cas 1");
          }
          currentLineSplits.push(yMax2, yMax2 + 1);
          newSplittedLines.push(
            { yMin, yMax: yMin2 - 1, x: x },
            { yMin: yMin2, yMax: yMax2, x: x2 }
          );
          continue;
        }

        if (yMax === yMin2) {
          currentLineSplits.push(yMax - 1, yMax);
          newSplittedLines.push({ yMin: yMax, yMax: yMax, x: x2 });
          if (yMax + 1 <= yMax2) {
            newSplittedLines.push({ yMin: yMax + 1, yMax: yMax2, x: x2 });
          }
          continue;
        }

        if (yMax2 === yMin) {
          currentLineSplits.push(yMax2, yMax2 + 1);
          newSplittedLines.push({ yMin: yMax2, yMax: yMax2, x: x2 });
          if (yMin2 <= yMax2 - 1) {
            newSplittedLines.push({ yMin: yMin2, yMax: yMax2 - 1, x: x2 });
          }
          continue;
        }

        console.log("Is in none of the cases");
      }

      currentLineSplits.push(yMin, yMax);

      const sortedLineSplits = currentLineSplits.sort((a, b) => a - b);
      for (
        let splitIndex = 0;
        splitIndex < sortedLineSplits.length;
        splitIndex += 2
      ) {
        newSplittedLines.push({
          yMin: sortedLineSplits[splitIndex],
          yMax: sortedLineSplits[splitIndex + 1],
          x,
        });
      }
      // console.log(`i = ${i}`, newSplittedLines);
      const foundLines = new Set();
      splittedLines = newSplittedLines.filter(({ x, yMin, yMax }) => {
        const key = `${yMin}|${yMax}|${x}`;
        if (foundLines.has(key)) {
          return false;
        }
        foundLines.add(key);
        return true;
      });
      if (hasSplit) {
        break;
      }
    }
  }
  return splittedLines;
};

const sortSplittedLines = (splittedVerticalLines) => {
  const linesPerCoordinates = {};
  for (const { yMin, yMax, x } of splittedVerticalLines) {
    const key = `${yMin}|${yMax}`;
    if (!linesPerCoordinates[key]) {
      linesPerCoordinates[key] = [{ yMin, yMax, x }];
    } else {
      linesPerCoordinates[key].push({ yMin, yMax, x });
    }
  }
  return linesPerCoordinates;
};

const input = await parseTextInput(true);
console.log(input);

const [verticalLines, horizontalLines] = computeLines(input);
console.log(verticalLines);

const splittedVerticalLines = splitVerticalLines(verticalLines);
console.log(splittedVerticalLines);

const linesPerCoordinates = sortSplittedLines(splittedVerticalLines);
console.dir(linesPerCoordinates, { depth: null });
