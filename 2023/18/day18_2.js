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
      // return {
      //   direction: direction,
      //   length: Number(length),
      //   color,
      // };
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
  let i = 0;
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
        isChange:
          input.at(i - 1).direction === input[(i + 1) % input.length].direction,
      });
    }
    pos[0] += dx * length;
    pos[1] += dy * length;
    i += 1;
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
  const splitLines = [];

  const splits = [
    ...new Set(verticalLines.flatMap(({ yMin, yMax }) => [yMin, yMax])),
  ].sort((a, b) => a - b);

  for (const { yMin, yMax, x } of verticalLines) {
    const yCoordinates = [yMin];
    for (let i = 0; i < splits.length; i++) {
      const split = splits[i];
      const currentMin = yCoordinates.at(-1);
      if (split < currentMin || split > yMax) {
        continue;
      }
      if (split === currentMin && split === yMax) {
        continue;
      }

      if (split === currentMin) {
        yCoordinates.push(currentMin, currentMin + 1);
        continue;
      }

      if (split === yMax) {
        yCoordinates.push(yMax - 1, yMax);
        continue;
      }

      // currentMin < split < yMax
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
  for (const { xMin, xMax, y, isChange } of horizontalLines) {
    horizontalLinesPerCoordinates[`${xMin}|${xMax}|${y}`] = isChange;
  }

  let area = 0;
  for (const [key, lines] of Object.entries(linesPerCoordinates)) {
    let state = "outside";
    let nextState = null;
    for (let i = 0; i < lines.length - 1; i++) {
      const { yMin: yMin1, yMax: yMax1, x: x1 } = lines[i];
      const { x: x2 } = lines[i + 1];

      const isOnHorizontalLine =
        yMin1 === yMax1 &&
        horizontalLinesPerCoordinates[`${x1}|${x2}|${yMin1}`] !== undefined;

      if (!isOnHorizontalLine) {
        state =
          nextState !== null
            ? nextState
            : state === "outside"
            ? "inside"
            : "outside";
        nextState = null;
      } else {
        const isChange = horizontalLinesPerCoordinates[`${x1}|${x2}|${yMin1}`];
        nextState = isChange
          ? state === "inside"
            ? "outside"
            : "inside"
          : state;
        state = "inside";
      }

      if (yMin1 !== yMax1 && state === "inside") {
        area += (yMax1 - yMin1 + 1) * (x2 - x1 + 1);
      }

      if (yMin1 === yMax1) {
        if (state === "inside") {
          area += x2 - x1 + 1;
          if (isOnHorizontalLine) {
            const isChange =
              horizontalLinesPerCoordinates[`${x1}|${x2}|${yMin1}`];
            if (!isChange && nextState === "inside") {
              area -= 2;
            }
            if (isChange) {
              area -= 1;
            }
          }
        }
      }
    }
  }
  return area;
};

const input = await parseTextInput(false);

const [verticalLines, horizontalLines] = computeLines(input);

const splittedVerticalLines = splitVerticalLines(verticalLines);

const linesPerCoordinates = sortSplittedLines(splittedVerticalLines);

const area = computeArea(linesPerCoordinates, horizontalLines);
console.log("Area: ", area);
