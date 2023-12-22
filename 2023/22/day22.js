import * as fs from "fs/promises";
import { writeFileSync } from "fs";

const parseTextInput = async (isTest = false) => {
  const filename = isTest ? "puzzle.txt" : "input.txt";
  const input = (await fs.readFile(filename))
    .toString()
    .split("\n")
    .map((line, index) => {
      const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
      const [start, end] = line.split("~");
      const [xStart, yStart, zStart] = start.split(",").map(Number);
      const [xEnd, yEnd, zEnd] = end.split(",").map(Number);
      const axis = xStart !== xEnd ? "x" : yStart !== yEnd ? "y" : "z";
      return {
        id: isTest ? letters[index] : index,
        xStart,
        yStart,
        zStart,
        xEnd,
        yEnd,
        zEnd,
        axis,
      };
    });

  return input;
};

const areBricksIntersecting = (brick1, brick2) => {
  const {
    xStart: xStart1,
    xEnd: xEnd1,
    yStart: yStart1,
    yEnd: yEnd1,
    axis: axis1,
  } = brick1;
  const {
    xStart: xStart2,
    xEnd: xEnd2,
    yStart: yStart2,
    yEnd: yEnd2,
    axis: axis2,
  } = brick2;

  if (axis1 === "z" && axis2 === "z") {
    return xStart1 === xStart2 && yStart1 === yStart2;
  }
  if (axis1 === "z" && axis2 === "y") {
    return xStart1 === xStart2 && yStart2 <= yStart1 && yStart1 <= yEnd2;
  }
  if (axis1 === "z" && axis2 === "x") {
    return yStart1 === yStart2 && xStart2 <= xStart1 && xStart1 <= xEnd2;
  }
  if (axis1 === "y" && axis2 === "z") {
    return xStart1 === xStart2 && yStart1 <= yStart2 && yStart2 <= yEnd1;
  }
  if (axis1 === "y" && axis2 === "y") {
    return xStart1 === xStart2 && !(yStart1 > yEnd2 || yEnd1 < yStart2);
  }
  if (axis1 === "y" && axis2 === "x") {
    return (
      yStart1 <= yStart2 &&
      yStart2 <= yEnd1 &&
      xStart2 <= xStart1 &&
      xStart1 <= xEnd2
    );
  }
  if (axis1 === "x" && axis2 === "z") {
    return yStart1 === yStart2 && xStart1 <= xStart2 && xStart2 <= xEnd1;
  }
  if (axis1 === "x" && axis2 === "y") {
    return (
      yStart2 <= yStart1 &&
      yStart1 <= yEnd2 &&
      xStart1 <= xStart2 &&
      xStart2 <= xEnd1
    );
  }
  if (axis1 === "x" && axis2 === "x") {
    return yStart1 === yStart2 && !(xStart1 > xEnd2 || xEnd1 < xStart2);
  }
};

const findSafeBricks = (snapshots) => {
  const horizontalPlanes = { 0: "ground" };
  const bricksAbove = {};
  const bricksBelow = {};
  for (const fallingBrick of snapshots) {
    for (let z = fallingBrick.zStart; z >= 0; z -= 1) {
      if (horizontalPlanes[z] === "ground") {
        if (
          horizontalPlanes[z + 1 + fallingBrick.zEnd - fallingBrick.zStart] ===
          undefined
        ) {
          horizontalPlanes[z + 1 + fallingBrick.zEnd - fallingBrick.zStart] =
            [];
        }
        horizontalPlanes[z + 1 + fallingBrick.zEnd - fallingBrick.zStart].push({
          ...fallingBrick,
          zStart: z + 1,
          zEnd: z + 1 + (fallingBrick.zEnd - fallingBrick.zStart),
        });

        if (!bricksAbove["ground"]) {
          bricksAbove["ground"] = [];
        }
        bricksAbove["ground"].push(fallingBrick.id);

        if (!bricksBelow[fallingBrick.id]) {
          bricksBelow[fallingBrick.id] = [];
        }
        bricksBelow[fallingBrick.id].push("ground");
      }

      if (horizontalPlanes[z]?.length > 0) {
        let intersectingBrickIds = [];
        for (const brick of horizontalPlanes[z]) {
          if (areBricksIntersecting(fallingBrick, brick)) {
            intersectingBrickIds.push(brick.id);
          }
        }
        if (intersectingBrickIds.length > 0) {
          if (
            horizontalPlanes[
              z + 1 + fallingBrick.zEnd - fallingBrick.zStart
            ] === undefined
          ) {
            horizontalPlanes[z + 1 + fallingBrick.zEnd - fallingBrick.zStart] =
              [];
          }
          horizontalPlanes[
            z + 1 + fallingBrick.zEnd - fallingBrick.zStart
          ].push({
            ...fallingBrick,
            zStart: z + 1,
            zEnd: z + 1 + (fallingBrick.zEnd - fallingBrick.zStart),
          });

          intersectingBrickIds.forEach((intersectingBrickId) => {
            if (!bricksAbove[intersectingBrickId]) {
              bricksAbove[intersectingBrickId] = [];
            }
            bricksAbove[intersectingBrickId].push(fallingBrick.id);
          });

          if (!bricksBelow[fallingBrick.id]) {
            bricksBelow[fallingBrick.id] = [];
          }
          bricksBelow[fallingBrick.id].push(...intersectingBrickIds);
          break;
        }
      }
    }
  }

  const a = Object.fromEntries(
    Object.entries(horizontalPlanes).map(([key, value]) => {
      return [key, value === "ground" ? value : value.map(({ id }) => id)];
    })
  );
  return [bricksAbove, bricksBelow];
};

const findPart1Result = (input) => {
  input.sort(({ zStart: zStart1 }, { zStart: zStart2 }) => zStart1 - zStart2);
  const [bricksAbove, bricksBelow] = findSafeBricks(input);

  let part1Result = 0;
  for (const { id } of input) {
    if (bricksAbove[id] === undefined) {
      part1Result += 1;
      // console.log(`${id} can be removed`);
      continue;
    }
    const supportedBricks = bricksAbove[id];
    if (
      supportedBricks.every(
        (supportedId) => bricksBelow[supportedId]?.length >= 2
      )
    ) {
      // console.log(`${id} can be removed`);

      part1Result += 1;
      continue;
    }
  }
  return part1Result;
};

const findPart2Result = (input) => {
  input.sort(({ zStart: zStart1 }, { zStart: zStart2 }) => zStart1 - zStart2);

  const [bricksAbove, bricksBelow] = findSafeBricks(input);

  let part2Result = 0;
  for (const { id } of input) {
    let bricksToRemove = [id];
    const isBrickFalling = { [id]: true };
    const isCounted = {};
    while (bricksToRemove.length > 0) {
      const brickId = bricksToRemove.shift();

      if (bricksAbove[brickId] === undefined) {
        continue;
      }

      const newBricksToRemove = bricksAbove[brickId].filter(
        (supportedId) =>
          bricksBelow[supportedId].every((supportingId) => {
            return isBrickFalling[supportingId];
          }) && !isCounted[supportedId]
      );

      bricksToRemove.push(...newBricksToRemove);
      newBricksToRemove.forEach((brickToRemove) => {
        isBrickFalling[brickToRemove] = true;
        isCounted[brickToRemove] = true;
      });
      part2Result += newBricksToRemove.length;
    }
  }
  return part2Result;
};

const input = await parseTextInput(false);

const part1Result = findPart1Result(input);
const part2Result = findPart2Result(input);

console.log("Part 1 result: ", part1Result);
console.log("Part 2 result: ", part2Result);
