import * as fs from "fs/promises";
import * as path from "path";

type Point = { x: number; y: number };
type Input = Point[];

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? "input_test.txt" : "input.txt"
  );

  return (await fs.readFile(filePath))
    .toString()
    .split("\n")
    .map((line) => {
      const [x, y] = line.split(",").map(Number);
      return { x, y };
    });
};

const computeRectangleArea = (a: Point, b: Point) =>
  (Math.abs(a.x - b.x) + 1) * (Math.abs(a.y - b.y) + 1);

function part1(input: Input) {
  let maxArea = 0;
  for (let i = 0; i < input.length - 1; i += 1) {
    for (let j = i + 1; j < input.length; j += 1) {
      const rectangleArea = computeRectangleArea(input[i], input[j]);
      if (rectangleArea > maxArea) {
        maxArea = rectangleArea;
      }
    }
  }
  return maxArea;
}

type HorizontalSegment = {
  type: "horizontal";
  y: number;
  xMin: number;
  xMax: number;
};
type VerticalSegment = {
  type: "vertical";
  x: number;
  yMin: number;
  yMax: number;
};

const computeSegments = (input: Input) => {
  const horizontalSegments: HorizontalSegment[] = [];
  const verticalSegments: VerticalSegment[] = [];

  for (let i = 0; i < input.length; i += 1) {
    const point1 = input[i];
    const point2 = input[(i + 1) % input.length];

    if (point1.x === point2.x) {
      verticalSegments.push({
        type: "vertical",
        x: point1.x,
        yMin: Math.min(point1.y, point2.y),
        yMax: Math.max(point1.y, point2.y),
      });
    } else if (point1.y === point2.y) {
      horizontalSegments.push({
        type: "horizontal",
        y: point1.y,
        xMin: Math.min(point1.x, point2.x),
        xMax: Math.max(point1.x, point2.x),
      });
    } else {
      throw Error("Error building segment");
    }
  }

  return { horizontalSegments, verticalSegments };
};

const isValidVerticalSegment = ({
  segment: { x, yMin, yMax, type },
  oppositeSegment,
  horizontalSegments,
  verticalSegments,
}: {
  segment: VerticalSegment;
  oppositeSegment: VerticalSegment;
  horizontalSegments: HorizontalSegment[];
  verticalSegments: VerticalSegment[];
}) => {
  if (yMin === yMax) {
    // not fully correct, not handling rectangles that are a single line, but they should not be the biggest ones we're looking for
    return true;
  }
  const sameSegment = verticalSegments.find(
    (segment) =>
      segment.yMax === yMax && segment.yMin === yMin && segment.x === x
  );

  if (sameSegment) {
    return true;
  }

  for (const horizontalSegment of horizontalSegments) {
    if (
      horizontalSegment.y > yMin &&
      horizontalSegment.y < yMax &&
      x >= horizontalSegment.xMin &&
      x <= horizontalSegment.xMax
    ) {
      if (x !== horizontalSegment.xMin && x !== horizontalSegment.xMax) {
        return false;
      }

      const xDeltaWithOppositeSegment = oppositeSegment.x - x;

      if (x === horizontalSegment.xMax && xDeltaWithOppositeSegment < 0) {
        return false;
      }

      if (x === horizontalSegment.xMin && xDeltaWithOppositeSegment > 0) {
        return false;
      }
    }
  }

  return true;
};

const isValidHorizontalSegment = ({
  segment: { y, xMin, xMax },
  oppositeSegment: { y: yOpposite },
  horizontalSegments,
  verticalSegments,
}: {
  segment: HorizontalSegment;
  oppositeSegment: HorizontalSegment;
  horizontalSegments: HorizontalSegment[];
  verticalSegments: VerticalSegment[];
}) => {
  if (xMin === xMax) {
    // not fully correct, not handling rectangles that are a single line, but they should not be the biggest ones we're looking for
    return true;
  }

  const sameSegment = horizontalSegments.find(
    (segment) =>
      segment.xMax === xMax && segment.xMin === xMin && segment.y === y
  );

  if (sameSegment) {
    return true;
  }

  for (const verticalSegment of verticalSegments) {
    if (
      verticalSegment.x > xMin &&
      verticalSegment.x < xMax &&
      y >= verticalSegment.yMin &&
      y <= verticalSegment.yMax
    ) {
      if (y !== verticalSegment.yMin && y !== verticalSegment.yMax) {
        return false;
      }
      const yDeltaWithOppositeSegment = yOpposite - y;

      if (y === verticalSegment.yMax && yDeltaWithOppositeSegment < 0) {
        return false;
      }

      if (y === verticalSegment.yMin && yDeltaWithOppositeSegment > 0) {
        return false;
      }
    }
  }

  return true;
};

const isEligibleRectangle = ({
  pointA,
  pointB,
  horizontalSegments,
  verticalSegments,
}: {
  pointA: Point;
  pointB: Point;
  horizontalSegments: HorizontalSegment[];
  verticalSegments: VerticalSegment[];
}) => {
  const rectangleSegments = [
    {
      type: "horizontal",
      y: pointA.y,
      xMin: Math.min(pointA.x, pointB.x),
      xMax: Math.max(pointA.x, pointB.x),
    },
    {
      type: "horizontal",
      y: pointB.y,
      xMin: Math.min(pointA.x, pointB.x),
      xMax: Math.max(pointA.x, pointB.x),
    },
    {
      type: "vertical",
      x: pointA.x,
      yMin: Math.min(pointA.y, pointB.y),
      yMax: Math.max(pointA.y, pointB.y),
    },
    {
      type: "vertical",
      x: pointB.x,
      yMin: Math.min(pointA.y, pointB.y),
      yMax: Math.max(pointA.y, pointB.y),
    },
  ] as const;

  return (
    isValidHorizontalSegment({
      segment: rectangleSegments[0],
      oppositeSegment: rectangleSegments[1],
      horizontalSegments,
      verticalSegments,
    }) &&
    isValidHorizontalSegment({
      segment: rectangleSegments[1],
      oppositeSegment: rectangleSegments[0],
      horizontalSegments,
      verticalSegments,
    }) &&
    isValidVerticalSegment({
      segment: rectangleSegments[2],
      oppositeSegment: rectangleSegments[3],
      horizontalSegments,
      verticalSegments,
    }) &&
    isValidVerticalSegment({
      segment: rectangleSegments[3],
      oppositeSegment: rectangleSegments[2],
      horizontalSegments,
      verticalSegments,
    })
  );
};

function part2(input: Input) {
  const { horizontalSegments, verticalSegments } = computeSegments(input);

  let maxArea = 0;
  for (let i = 0; i < input.length - 1; i += 1) {
    for (let j = i + 1; j < input.length; j += 1) {
      const rectangleArea = computeRectangleArea(input[i], input[j]);
      if (
        rectangleArea > maxArea &&
        isEligibleRectangle({
          pointA: input[i],
          pointB: input[j],
          verticalSegments,
          horizontalSegments,
        })
      ) {
        maxArea = rectangleArea;
      }
    }
  }
  return maxArea;
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
