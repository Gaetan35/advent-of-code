import * as fs from "fs/promises";

const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line, index) => {
      const letters = ["A", "B", "C", "D", "E", "F", "G", "H"];
      const [start, end] = line.split("~");
      const [xStart, yStart, zStart] = start.split(",").map(Number);
      const [xEnd, yEnd, zEnd] = end.split(",").map(Number);
      const axis = xStart !== xEnd ? "x" : yStart !== yEnd ? "y" : "z";
      return {
        id: index,
        // id: letters[index],
        xStart,
        yStart,
        zStart,
        xEnd,
        yEnd,
        zEnd,
        axis,
      };
    })
    .sort(({ zStart: zStart1 }, { zStart: zStart2 }) => zStart1 - zStart2);

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
  const bricksSupportedBy = {};
  const bricksSupporting = {};
  for (const fallingBrick of snapshots) {
    for (let z = fallingBrick.zStart; z >= 0; z -= 1) {
      if (horizontalPlanes[z] === "ground") {
        if (horizontalPlanes[z + 1] === undefined) {
          horizontalPlanes[z + 1] = [];
        }
        horizontalPlanes[z + 1].push({
          ...fallingBrick,
          zStart: z + 1,
          zEnd: z + 1 + (fallingBrick.zEnd - fallingBrick.zStart),
        });

        if (!bricksSupportedBy["ground"]) {
          bricksSupportedBy["ground"] = [];
        }
        bricksSupportedBy["ground"].push(fallingBrick.id);

        if (!bricksSupporting[fallingBrick.id]) {
          bricksSupporting[fallingBrick.id] = [];
        }
        bricksSupporting[fallingBrick.id].push("ground");
      }

      if (horizontalPlanes[z]?.length > 0) {
        let intersectingBrickIds = [];
        let maxZEnd = 0;
        for (const brick of horizontalPlanes[z]) {
          if (areBricksIntersecting(brick, fallingBrick)) {
            if (brick.zEnd > maxZEnd) {
              maxZEnd = brick.zEnd;
              intersectingBrickIds = [];
            }
            intersectingBrickIds.push(brick.id);
          }
        }
        if (intersectingBrickIds.length > 0) {
          if (horizontalPlanes[maxZEnd + 1] === undefined) {
            horizontalPlanes[maxZEnd + 1] = [];
          }
          horizontalPlanes[maxZEnd + 1].push({
            ...fallingBrick,
            zStart: maxZEnd + 1,
            zEnd: maxZEnd + 1 + (fallingBrick.zEnd - fallingBrick.zStart),
          });

          intersectingBrickIds.forEach((intersectingBrickId) => {
            if (!bricksSupportedBy[intersectingBrickId]) {
              bricksSupportedBy[intersectingBrickId] = [];
            }
            bricksSupportedBy[intersectingBrickId].push(fallingBrick.id);
          });

          if (!bricksSupporting[fallingBrick.id]) {
            bricksSupporting[fallingBrick.id] = [];
          }
          bricksSupporting[fallingBrick.id].push(...intersectingBrickIds);
          break;
        }
      }
    }
  }
  return [bricksSupportedBy, bricksSupporting];
};

const input = await parseTextInput(true);
// console.log(input);

const [bricksSupportedBy, bricksSupporting] = findSafeBricks(input);
console.log("Bricks supported by: ");
console.dir(bricksSupportedBy, { depth: null });
console.log("Bricks supporting: ");
console.dir(bricksSupporting, { depth: null });

let part1Result = 0;
for (const { id } of input) {
  if (bricksSupportedBy[id] === undefined) {
    part1Result += 1;
    // console.log(`${id} can be removed`);
    continue;
  }
  const supportedBricks = bricksSupportedBy[id];
  if (
    supportedBricks.every(
      (supportedId) => bricksSupporting[supportedId]?.length >= 2
    )
  ) {
    // console.log(`${id} can be removed`);

    part1Result += 1;
    continue;
  }
}
console.log("Part 1 result: ", part1Result);

let part2Result = 0;
for (const { id } of input) {
  let bricksRemoved = 0;
  const fallingBricks = { [id]: true };
  const bricksToRemove = [id];
  while (bricksToRemove.length > 0) {
    const brickId = bricksToRemove.shift();
    if (bricksSupportedBy[brickId] === undefined) {
      continue;
    }

    const supportedBricks = bricksSupportedBy[brickId];
    const newBricksToRemove = supportedBricks.filter(
      (supportedId) =>
        bricksSupporting[supportedId]?.length === 1 ||
        bricksSupporting[supportedId].every(
          (supportingId) => fallingBricks[supportingId]
        )
    );
    bricksToRemove.push(...newBricksToRemove);
    newBricksToRemove.forEach((newId) => {
      fallingBricks[newId] = true;
    });
    bricksRemoved += newBricksToRemove.length;
  }
  if (bricksRemoved > 0) {
    console.log(`${id}: makes ${bricksRemoved} other bricks fall`);
  }
  part2Result += bricksRemoved;
}
console.log("Part 2 result: ", part2Result);

// 74336 is too low
