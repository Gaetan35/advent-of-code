import * as fs from "fs/promises";

const parseTextInput = async (isTest) => {
  const lines = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n");
  const games = lines.map((line) => {
    const [gameHalf, resultHalf] = line.split(":");
    const gameId = parseInt(gameHalf.replaceAll(/\D/g, ""), 10);

    const game = { gameId, draws: [] };
    resultHalf.split(";").forEach((drawString) => {
      const matches = drawString.match(/\d+ [a-zA-Z]+/g);
      const draw = {};
      matches.forEach((match) => {
        const [digit, color] = match.split(" ");
        draw[color] = Number(digit);
      });
      game.draws.push(draw);
    });
    return game;
  });
  return games;
};

const MAX_RED = 12;
const MAX_GREEN = 13;
const MAX_BLUE = 14;

const games = await parseTextInput(false);

const part1result = games
  .filter((game) => {
    return !game.draws.some(({ red, green, blue }) => {
      return red > MAX_RED || green > MAX_GREEN || blue > MAX_BLUE;
    });
  })
  .reduce((previous, { gameId }) => previous + gameId, 0);

// console.log(part1result);

const part2Result = games.reduce((previous, { gameId, draws }) => {
  let maxRed = 0;
  let maxGreen = 0;
  let maxBlue = 0;
  draws.forEach(({ red, green, blue }) => {
    if (red > maxRed) {
      maxRed = red;
    }
    if (green > maxGreen) {
      maxGreen = green;
    }
    if (blue > maxBlue) {
      maxBlue = blue;
    }
  });
  console.log(`Game ${gameId}: ${maxRed * maxBlue * maxGreen}`);
  return previous + maxRed * maxBlue * maxGreen;
}, 0);

console.log(part2Result);
