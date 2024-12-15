import * as fs from 'fs/promises';
import * as path from 'path';

type Input = {
  startPos: { x: number; y: number };
  grid: string[][];
  moves: ('>' | '<' | '^' | 'v')[];
};

const parseTextInput = async (isTest = false): Promise<Input> => {
  const filePath = path.join(
    __dirname,
    isTest ? 'input_test.txt' : 'input.txt',
  );

  const [gridPart, movesPart] = (await fs.readFile(filePath))
    .toString()
    .split('\n\n');

  const grid = gridPart.split('\n').map((line) => line.split(''));
  const moves = movesPart.replaceAll('\n', '').split('') as (
    | '>'
    | '<'
    | '^'
    | 'v'
  )[];
  const startPos = { x: null, y: null };
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === '@') {
        startPos.x = x;
        startPos.y = y;
        break;
      }
    }
  }
  return { grid, moves, startPos };
};

const prettyPrint = (grid: unknown[][]) => {
  console.log(grid.map((line) => line.join('')).join('\n'));
  console.log('\n');
};

function part1({ startPos, grid: startGrid, moves }: Input) {
  const deltas = {
    '<': { dx: -1, dy: 0 },
    '>': { dx: 1, dy: 0 },
    '^': { dx: 0, dy: -1 },
    v: { dx: 0, dy: 1 },
  };
  const robot = { ...startPos };
  const grid = startGrid.map((row) => [...row]);

  for (const move of moves) {
    const { dx, dy } = deltas[move];
    const newX = robot.x + dx;
    const newY = robot.y + dy;
    if (grid[newY][newX] === '.') {
      grid[newY][newX] = '@';
      grid[robot.y][robot.x] = '.';
      robot.x = newX;
      robot.y = newY;
      continue;
    }

    if (grid[newY][newX] === '#') {
      continue;
    }

    const cellsToPush = [{ ...robot }];
    let x = robot.x + dx;
    let y = robot.y + dy;
    while (grid[y][x] === 'O') {
      cellsToPush.push({ x, y });
      x += dx;
      y += dy;
    }
    if (grid[y][x] === '#') {
      continue;
    }
    cellsToPush.push({ x, y });
    for (let i = cellsToPush.length - 1; i >= 1; i--) {
      const cellToReplace = cellsToPush[i];
      const cellToPush = cellsToPush[i - 1];
      grid[cellToReplace.y][cellToReplace.x] = grid[cellToPush.y][cellToPush.x];
    }
    grid[robot.y][robot.x] = '.';
    robot.x = newX;
    robot.y = newY;
  }

  let result = 0;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === 'O') {
        result += 100 * y + x;
      }
    }
  }

  return result;
}

const scaleGrid = (grid: string[][]) => {
  const changes = {
    '#': ['#', '#'],
    O: ['[', ']'],
    '.': ['.', '.'],
    '@': ['@', '.'],
  };
  return grid.map((line) => line.flatMap((cell) => changes[cell]));
};

function part2({ startPos, grid: startGrid, moves }: Input) {
  const grid = scaleGrid(startGrid);
  const deltas = {
    '<': { dx: -1, dy: 0 },
    '>': { dx: 1, dy: 0 },
    '^': { dx: 0, dy: -1 },
    v: { dx: 0, dy: 1 },
  };
  const robot = { x: startPos.x * 2, y: startPos.y };

  let iteration = 0;
  for (const move of moves) {
    iteration++;

    const { dx, dy } = deltas[move];
    const newX = robot.x + dx;
    const newY = robot.y + dy;
    if (grid[newY][newX] === '.') {
      grid[newY][newX] = '@';
      grid[robot.y][robot.x] = '.';
      robot.x = newX;
      robot.y = newY;
      continue;
    }

    if (grid[newY][newX] === '#') {
      continue;
    }

    if (move === '<' || move === '>') {
      const cellsToPush = [{ ...robot }];
      let x = robot.x + dx;
      let y = robot.y + dy;
      while (grid[y][x] === '[' || grid[y][x] === ']') {
        cellsToPush.push({ x, y });
        x += dx;
        y += dy;
      }
      if (grid[y][x] === '#') {
        continue;
      }
      cellsToPush.push({ x, y });
      for (let i = cellsToPush.length - 1; i >= 1; i--) {
        const cellToReplace = cellsToPush[i];
        const cellToPush = cellsToPush[i - 1];
        grid[cellToReplace.y][cellToReplace.x] =
          grid[cellToPush.y][cellToPush.x];
      }
      grid[robot.y][robot.x] = '.';
      robot.x = newX;
      robot.y = newY;
      continue;
    }

    if (move === '^' || move === 'v') {
      const positions = [[{ ...robot }]];
      let done = false;
      let wasStoppedByWall = false;
      while (!done) {
        const lastLinePositions = positions.at(-1);
        const nextLinePositions = [];
        for (const { x, y } of lastLinePositions) {
          const nextCell = grid[y + dy][x + dx];
          if (
            (nextCell === '[' || nextCell === ']') &&
            !nextLinePositions.find(
              (nextPos) => nextPos.x === x + dx && nextPos.y === y + dy,
            )
          ) {
            nextLinePositions.push(
              { x: x + dx, y: y + dy },
              { x: x + dx + (nextCell === '[' ? 1 : -1), y: y + dy },
            );
          }
          if (nextCell === '#') {
            wasStoppedByWall = true;
            done = true;
            break;
          }
        }

        if (nextLinePositions.length) {
          positions.push(nextLinePositions);
        } else {
          done = true;
        }
      }

      if (wasStoppedByWall) {
        continue;
      }

      for (let i = positions.length - 1; i >= 0; i--) {
        const linePositions = positions[i];
        for (const { x, y } of linePositions) {
          grid[y + dy][x + dx] = grid[y][x];
          grid[y][x] = '.';
        }
      }
      robot.x += dx;
      robot.y += dy;
    }
  }

  prettyPrint(grid);

  let result = 0;
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === '[') {
        result += 100 * y + x;
      }
    }
  }

  return result;
}

async function main() {
  const IS_TEST = process.argv[2] === 'test';
  const input = await parseTextInput(IS_TEST);

  const part1Result = part1(input);
  console.log('Part1 result: ', part1Result);

  const part2Result = part2(input);
  console.log('Part2 result: ', part2Result);
}

main();
