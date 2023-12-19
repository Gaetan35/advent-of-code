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
      // return {
      //   direction: numberToDirection[color.at(-1)],
      //   length: parseInt(color.substring(0, 5), 16),
      //   color,
      // };
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
  const pos = [300, 300];
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

  return [verticalLines, horizontalLines];
};

const splitVerticalLines = (verticalLines) => {
  // TODO: split is not correct, verticalLines are not correctly split
  const splitLines = [];

  const splits = [
    ...new Set(verticalLines.flatMap(({ yMin, yMax }) => [yMin, yMax])),
  ].sort((a, b) => a - b);

  for (const { yMin, yMax, x } of verticalLines) {
    const yCoordinates = [yMin];
    for (let i = 0; i < splits.length; i++) {
      const split = splits[i];
      if (split < yMin || split > yMax) {
        continue;
      }
      if (split === yMin && split === yMax) {
        continue;
      }

      if (split === yMin) {
        yCoordinates.push(yMin, yMin + 1);
        continue;
      }

      if (split === yMax) {
        yCoordinates.push(yMax - 1, yMax);
        continue;
      }

      // yMin < split < yMax
      yCoordinates.push(split - 1, split, split, split + 1);
    }
    yCoordinates.push(yMax);
    for (let i = 0; i < yCoordinates.length; i += 2) {
      splitLines.push({ x, yMin: yCoordinates[i], yMax: yCoordinates[i + 1] });
    }
  }
  return splitLines;
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

const computeArea = (linesPerCoordinates, horizontalLines) => {
  const horizontalLinesPerCoordinates = {};
  for (const { xMin, xMax } of horizontalLines) {
    horizontalLinesPerCoordinates[`${xMin}|${xMax}`] = true;
  }

  let area = 0;
  for (const [key, lines] of Object.entries(linesPerCoordinates)) {
    // console.log(key);
    let shouldAdd = true;
    for (let i = 0; i < lines.length - 1; i++) {
      const { yMin: yMin1, yMax: yMax1, x: x1 } = lines[i];
      const { yMin: yMin2, yMax: yMax2, x: x2 } = lines[i + 1];
      if (yMin1 !== yMax1 && shouldAdd) {
        area += (yMax1 - yMin1 + 1) * (x2 - x1 + 1);
        shouldAdd = !shouldAdd;
        continue;
      }

      if (yMin1 === yMax1) {
        const isOnHorizontalLine =
          !!horizontalLinesPerCoordinates[`${x1}|${x2}`];

        if (shouldAdd || isOnHorizontalLine) {
          area += x2 - x1 + 1;
          if (isOnHorizontalLine && lines.length > 2) {
            area -= 1;
          }
          if (!isOnHorizontalLine) {
            shouldAdd = !shouldAdd;
          }
        }
      }
    }
  }
  return area;
};

const input = await parseTextInput(false);
// console.log(input);

const [verticalLines, horizontalLines] = computeLines(input);
// console.log(verticalLines);

const splittedVerticalLines = splitVerticalLines(verticalLines);
// console.log(splittedVerticalLines);

const linesPerCoordinates = sortSplittedLines(splittedVerticalLines);

// console.log(horizontalLines);
console.dir(linesPerCoordinates, { depth: null });
const area = computeArea(linesPerCoordinates, horizontalLines);
console.log("Area: ", area);
