import * as fs from "fs/promises";
import { writeFileSync } from "fs";

const tests = [
  [5, " premières lignes donne ", 1],
  [6, " premières lignes donne ", 1],
  [7, " premières lignes donne ", 2],
  [8, " premières lignes donne ", 2],
  [9, " premières lignes donne ", 2],
  [10, " premières lignes donne ", 4],
  [11, " premières lignes donne ", 3],
  [12, " premières lignes donne ", 4],
  [13, " premières lignes donne ", 5],
  [14, " premières lignes donne ", 5],
  [15, " premières lignes donne ", 5],
  [16, " premières lignes donne ", 5],
  [17, " premières lignes donne ", 6],
  [18, " premières lignes donne ", 6],
  [19, " premières lignes donne ", 7],
  [20, " premières lignes donne ", 8],
  [21, " premières lignes donne ", 10],
  [22, " premières lignes donne ", 12],
  [23, " premières lignes donne ", 12],
  [24, " premières lignes donne ", 12],
  [25, " premières lignes donne ", 14],
  [26, " premières lignes donne ", 15],
  [27, " premières lignes donne ", 18],
  [28, " premières lignes donne ", 18],
  [29, " premières lignes donne ", 18],
  [30, " premières lignes donne ", 32],
  [31, " premières lignes donne ", 34],
  [32, " premières lignes donne ", 39],
  [33, " premières lignes donne ", 50],
  [34, " premières lignes donne ", 52],
  [35, " premières lignes donne ", 57],
  [36, " premières lignes donne ", 60],
  [37, " premières lignes donne ", 60],
  [38, " premières lignes donne ", 67],
  [39, " premières lignes donne ", 74],
  [40, " premières lignes donne ", 75],
  [41, " premières lignes donne ", 75],
  [42, " premières lignes donne ", 76],
  [43, " premières lignes donne ", 78],
  [44, " premières lignes donne ", 79],
  [45, " premières lignes donne ", 80],
  [46, " premières lignes donne ", 87],
  [47, " premières lignes donne ", 90],
  [48, " premières lignes donne ", 91],
  [49, " premières lignes donne ", 96],
  [50, " premières lignes donne ", 97],
  [51, " premières lignes donne ", 98],
  [52, " premières lignes donne ", 100],
  [53, " premières lignes donne ", 101],
  [54, " premières lignes donne ", 102],
  [55, " premières lignes donne ", 103],
  [56, " premières lignes donne ", 103],
  [57, " premières lignes donne ", 103],
  [58, " premières lignes donne ", 106],
  [59, " premières lignes donne ", 106],
  [60, " premières lignes donne ", 109],
  [61, " premières lignes donne ", 110],
  [62, " premières lignes donne ", 122],
  [63, " premières lignes donne ", 125],
  [64, " premières lignes donne ", 126],
  [65, " premières lignes donne ", 94],
  [66, " premières lignes donne ", 95],
  [67, " premières lignes donne ", 167],
  [68, " premières lignes donne ", 170],
  [69, " premières lignes donne ", 170],
  [70, " premières lignes donne ", 172],
  [71, " premières lignes donne ", 175],
  [72, " premières lignes donne ", 174],
  [73, " premières lignes donne ", 178],
  [74, " premières lignes donne ", 175],
  [75, " premières lignes donne ", 175],
  [76, " premières lignes donne ", 177],
  [77, " premières lignes donne ", 203],
  [78, " premières lignes donne ", 232],
  [79, " premières lignes donne ", 233],
  [80, " premières lignes donne ", 236],
  [81, " premières lignes donne ", 239],
  [82, " premières lignes donne ", 248],
  [83, " premières lignes donne ", 248],
  [84, " premières lignes donne ", 255],
  [85, " premières lignes donne ", 255],
  [86, " premières lignes donne ", 255],
  [87, " premières lignes donne ", 258],
  [88, " premières lignes donne ", 267],
  [89, " premières lignes donne ", 287],
  [90, " premières lignes donne ", 290],
  [91, " premières lignes donne ", 299],
  [92, " premières lignes donne ", 300],
  [93, " premières lignes donne ", 302],
  [94, " premières lignes donne ", 312],
  [95, " premières lignes donne ", 316],
  [96, " premières lignes donne ", 321],
  [97, " premières lignes donne ", 328],
  [98, " premières lignes donne ", 328],
  [99, " premières lignes donne ", 341],
  [100, " premières lignes donne ", 345],
  [101, " premières lignes donne ", 331],
  [111, " premières lignes donne ", 397],
  [121, " premières lignes donne ", 517],
  [131, " premières lignes donne ", 545],
  [141, " premières lignes donne ", 613],
  [151, " premières lignes donne ", 636],
  [161, " premières lignes donne ", 800],
  [171, " premières lignes donne ", 1062],
  [181, " premières lignes donne ", 1175],
  [191, " premières lignes donne ", 1412],
  [201, " premières lignes donne ", 1572],
  [211, " premières lignes donne ", 1621],
  [221, " premières lignes donne ", 2003],
  [231, " premières lignes donne ", 2167],
  [241, " premières lignes donne ", 2194],
  [251, " premières lignes donne ", 2569],
  [261, " premières lignes donne ", 2789],
  [271, " premières lignes donne ", 2916],
  [281, " premières lignes donne ", 3247],
  [291, " premières lignes donne ", 3533],
];

const tests2 = [
  ["lignes de ", 0, "à 100", 331],
  ["lignes de ", 1, "à 100", 321],
  ["lignes de ", 2, "à 100", 319],
  ["lignes de ", 3, "à 100", 316],
  ["lignes de ", 4, "à 100", 327],
  ["lignes de ", 5, "à 100", 297],
  ["lignes de ", 6, "à 100", 300],
  ["lignes de ", 7, "à 100", 290],
  ["lignes de ", 8, "à 100", 287],
  ["lignes de ", 9, "à 100", 287],
  ["lignes de ", 10, "à 100", 277],
  ["lignes de ", 11, "à 100", 268],
  ["lignes de ", 12, "à 100", 267],
  ["lignes de ", 13, "à 100", 259],
  ["lignes de ", 14, "à 100", 259],
  ["lignes de ", 15, "à 100", 253],
  ["lignes de ", 16, "à 100", 248],
  ["lignes de ", 17, "à 100", 241],
  ["lignes de ", 18, "à 100", 240],
  ["lignes de ", 19, "à 100", 191],
  ["lignes de ", 20, "à 100", 189],
  ["lignes de ", 21, "à 100", 180],
  ["lignes de ", 22, "à 100", 163],
  ["lignes de ", 23, "à 100", 163],
  ["lignes de ", 24, "à 100", 155],
  ["lignes de ", 25, "à 100", 152],
  ["lignes de ", 26, "à 100", 151],
  ["lignes de ", 27, "à 100", 145],
  ["lignes de ", 28, "à 100", 144],
  ["lignes de ", 29, "à 100", 151],
  ["lignes de ", 30, "à 100", 119],
  ["lignes de ", 31, "à 100", 117],
  ["lignes de ", 32, "à 100", 115],
  ["lignes de ", 33, "à 100", 110],
  ["lignes de ", 34, "à 100", 88],
  ["lignes de ", 35, "à 100", 87],
  ["lignes de ", 36, "à 100", 85],
  ["lignes de ", 37, "à 100", 86],
  ["lignes de ", 38, "à 100", 81],
  ["lignes de ", 39, "à 100", 78],
  ["lignes de ", 40, "à 100", 78],
  ["lignes de ", 41, "à 100", 72],
  ["lignes de ", 42, "à 100", 67],
  ["lignes de ", 43, "à 100", 66],
  ["lignes de ", 44, "à 100", 66],
  ["lignes de ", 45, "à 100", 61],
  ["lignes de ", 46, "à 100", 59],
  ["lignes de ", 47, "à 100", 59],
  ["lignes de ", 48, "à 100", 57],
  ["lignes de ", 49, "à 100", 55],
  ["lignes de ", 50, "à 100", 55],
  ["lignes de ", 51, "à 100", 57],
  ["lignes de ", 52, "à 100", 38],
  ["lignes de ", 53, "à 100", 37],
  ["lignes de ", 54, "à 100", 37],
  ["lignes de ", 55, "à 100", 34],
  ["lignes de ", 56, "à 100", 36],
  ["lignes de ", 57, "à 100", 36],
  ["lignes de ", 58, "à 100", 34],
  ["lignes de ", 59, "à 100", 31],
  ["lignes de ", 60, "à 100", 28],
  ["lignes de ", 61, "à 100", 28],
  ["lignes de ", 62, "à 100", 26],
  ["lignes de ", 63, "à 100", 25],
  ["lignes de ", 64, "à 100", 24],
  ["lignes de ", 65, "à 100", 22],
  ["lignes de ", 66, "à 100", 20],
  ["lignes de ", 67, "à 100", 19],
  ["lignes de ", 68, "à 100", 17],
  ["lignes de ", 69, "à 100", 17],
  ["lignes de ", 70, "à 100", 17],
  ["lignes de ", 71, "à 100", 16],
  ["lignes de ", 72, "à 100", 13],
  ["lignes de ", 73, "à 100", 13],
  ["lignes de ", 74, "à 100", 12],
  ["lignes de ", 75, "à 100", 12],
  ["lignes de ", 76, "à 100", 11],
  ["lignes de ", 77, "à 100", 11],
  ["lignes de ", 78, "à 100", 10],
  ["lignes de ", 79, "à 100", 9],
  ["lignes de ", 80, "à 100", 9],
  ["lignes de ", 81, "à 100", 11],
  ["lignes de ", 82, "à 100", 10],
  ["lignes de ", 83, "à 100", 10],
  ["lignes de ", 84, "à 100", 11],
  ["lignes de ", 85, "à 100", 11],
  ["lignes de ", 86, "à 100", 6],
  ["lignes de ", 87, "à 100", 5],
  ["lignes de ", 88, "à 100", 5],
  ["lignes de ", 89, "à 100", 5],
  ["lignes de ", 90, "à 100", 5],
  ["lignes de ", 91, "à 100", 5],
  ["lignes de ", 92, "à 100", 5],
  ["lignes de ", 93, "à 100", 5],
  ["lignes de ", 94, "à 100", 3],
  ["lignes de ", 95, "à 100", 1],
  ["lignes de ", 96, "à 100", 0],
  ["lignes de ", 97, "à 100", 0],
  ["lignes de ", 98, "à 100", 0],
  ["lignes de ", 99, "à 100", 0],
];

const parseTextInput = async (isTest = false) => {
  const filename = isTest ? "puzzle.txt" : "input.txt";
  // const filename = "input_test.txt";
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
        id: isTest && false ? letters[index] : index,
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
        if (horizontalPlanes[z + 1] === undefined) {
          horizontalPlanes[z + 1] = [];
        }
        horizontalPlanes[z + 1].push({
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
        let maxZEnd = 0;
        // if (fallingBrick.id === 98) {
        //   console.log("maxZend at start: ", maxZEnd);
        // }
        for (const brick of horizontalPlanes[z]) {
          if (
            brick.zEnd >= maxZEnd &&
            areBricksIntersecting(fallingBrick, brick)
          ) {
            if (brick.zEnd > maxZEnd) {
              // if (fallingBrick.id === 98) {
              //   console.log("moving maxZend to", brick.zEnd);
              // }
              maxZEnd = brick.zEnd;
              intersectingBrickIds = [];
            }
            // if (brick.zEnd === maxZEnd) {
            intersectingBrickIds.push(brick.id);
            // }
            // if (fallingBrick.id === 98) {
            //   console.log(
            //     "98 intersects with",
            //     brick.id,
            //     "maxZend is: ",
            //     maxZEnd,
            //     "intersectingBrickIds:",
            //     intersectingBrickIds
            //   );
            // }
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
  // console.dir(a, { depth: null });
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

  // console.log(bricksBelow);
  // console.log("!!!!!!!!!");
  // console.log(bricksAbove);

  let part2Result = 0;
  for (const { id } of input) {
    let bricksToRemove = [id];
    const isBrickFalling = { [id]: true };
    const isCounted = {};
    const beforeAdding = part2Result;
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
    // console.log(`${id}: added ${part2Result - beforeAdding}`);
  }
  return part2Result;
};

const input = await parseTextInput(true);

const part1Result = findPart1Result(input);
const part2Result = findPart2Result(input);

console.log("Part 1 result: ", part1Result);
console.log("Part 2 result: ", part2Result);

// const obtained = findPart2Result(
//   input
//     .slice(74, 101)
//     .filter(({ id }) =>
//       [
//         80, 85, 92, 100, 81, 95, 94, 93, 88, 78, 75, 89, 74, 77, 98, 91, 83, 86,
//       ].includes(id)
//     )
// );
// const expected = 12;
// console.log("Obtained : ", obtained);
// console.log(input[74]);
// console.log(input[77]);
// console.log(input[98]);
// 74 -> 8,0,46~8,0,47
// 77 -> 7,2,57~9,2,57
// 98 -> 8,0,230~8,2,230

for (const [_, inputStart, _2, expected] of tests2) {
  const obtained = findPart2Result(input.slice(inputStart, 100 + 1));
  if (obtained !== expected) {
    console.log("Error : ", [inputStart, 100, expected, obtained]);
  }
}

// 74336 is too low
// 74340 is too low (i think?)
// 81524 is false
