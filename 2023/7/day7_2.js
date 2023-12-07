import * as fs from "fs/promises";

const CARD_TYPES = {
  FIVE_OF_A_KIND: 7,
  FOUR_OF_A_KIND: 6,
  FULL_HOUSE: 5,
  THREE_OF_A_KIND: 4,
  TWO_PAIR: 3,
  ONE_PAIR: 2,
  HIGH_CARD: 1,
};

const cardOrder = [
  "J",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "T",
  "Q",
  "K",
  "A",
];

const getCardRank = (card) => cardOrder.indexOf(card);

const findHandType = (hand) => {
  const countPerCard = {};
  [...hand].forEach((char) => {
    countPerCard[char] = (countPerCard[char] ?? 0) + 1;
  });
  const jokerCount = countPerCard["J"] ?? 0;
  const cardCounts = Object.entries(countPerCard)
    .filter(([card, count]) => card !== "J")
    .map(([card, count]) => count)
    .sort((a, b) => b - a);

  if (cardCounts[0] === 5 || (cardCounts[0] ?? 0) + jokerCount === 5) {
    return CARD_TYPES.FIVE_OF_A_KIND;
  }
  if (cardCounts[0] === 4 || cardCounts[0] + jokerCount === 4) {
    return CARD_TYPES.FOUR_OF_A_KIND;
  }
  if (cardCounts[0] + cardCounts[1] + jokerCount === 5) {
    return CARD_TYPES.FULL_HOUSE;
  }
  if (cardCounts[0] === 3 || cardCounts[0] + jokerCount === 3) {
    return CARD_TYPES.THREE_OF_A_KIND;
  }
  if (cardCounts[0] + cardCounts[1] + jokerCount === 4) {
    return CARD_TYPES.TWO_PAIR;
  }
  if (cardCounts[0] === 2 || cardCounts[0] + jokerCount === 2) {
    return CARD_TYPES.ONE_PAIR;
  }
  return CARD_TYPES.HIGH_CARD;
};

const parseTextInput = async (isTest = false) => {
  const input = (await fs.readFile(isTest ? "input_test.txt" : "input.txt"))
    .toString()
    .split("\n")
    .map((line) => {
      const [hand, bid] = line.split(" ");
      return { hand, bid: Number(bid), type: findHandType(hand) };
    });

  return input;
};

const hands = await parseTextInput(false);
hands.sort((hand1, hand2) => {
  if (hand2.type > hand1.type) {
    return -1;
  }
  if (hand1.type > hand2.type) {
    return 1;
  }
  for (let index = 0; index < 5; index++) {
    const rank1 = getCardRank(hand1.hand[index]);
    const rank2 = getCardRank(hand2.hand[index]);
    if (rank2 > rank1) {
      return -1;
    }
    if (rank1 > rank2) {
      return 1;
    }
  }
  return 0;
});

const result = hands.reduce((previous, hand, index) => {
  return previous + (index + 1) * hand.bid;
}, 0);

console.log(result);
