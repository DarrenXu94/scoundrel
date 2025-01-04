export interface Card {
  suit: string; // e.g., 'hearts', 'diamonds'
  value: string; // e.g., 'A', '2', ..., 'K'
}

export const Difficulty = {
  Easy: "Easy",
  Medium: "Medium",
  Hard: "Hard",
};

export const MAX_HEALTH = 20;

export type DifficultyType = (typeof Difficulty)[keyof typeof Difficulty];

export class Deck {
  cards: Card[] = [];

  constructor() {
    const suits = ["hearts", "diamonds", "clubs", "spades"];
    const values = [
      "A",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
    ];

    for (const suit of suits) {
      for (const value of values) {
        this.cards.push({ suit, value });
      }
    }
  }

  shuffle() {
    this.cards.sort(() => Math.random() - 0.5);
  }

  draw(): Card | undefined {
    return this.cards.pop();
  }
}

type Dungeon = Card[];

interface Player {
  health: number; // Current health
  inventory: Card | null; // Collected weapons or other usable cards
  slainCards: Card[]; // Cards defeated in the dungeon
}

export interface GameState {
  deck: Deck; // The shuffled deck
  dungeon: Dungeon; // The current cards on the map
  player: Player; // Player's stats and inventory
  hasFled: boolean; // Whether the player has fled the dungeon. Cannot flee 2 times in a row
}

type CardAction = (card: Card, player: Player) => void;

const getCardValue = (card: Card) => {
  if (card.value === "A") {
    return 14;
  } else if (card.value === "J") {
    return 11;
  } else if (card.value === "Q") {
    return 12;
  } else if (card.value === "K") {
    return 13;
  } else {
    return parseInt(card.value);
  }
};

export const useCard: CardAction = (card, player) => {
  if (card.suit === "hearts") {
    const cardValue = getCardValue(card);

    if (player.health + cardValue <= MAX_HEALTH) {
      player.health += cardValue;
    } else {
      player.health = MAX_HEALTH;
    }
  } else if (card.suit === "diamonds") {
    player.inventory = card;
    player.slainCards = [];
  } else {
    const monsterValue = getCardValue(card);

    if (player.slainCards.length > 0) {
      // if last slain card is higher than monster, player can defeat monster
      const lastSlainCard = player.slainCards[player.slainCards.length - 1];
      const lastSlainCardValue = getCardValue(lastSlainCard);

      if (lastSlainCardValue >= monsterValue) {
        player.slainCards.push(card);
      } else {
        player.health -= monsterValue;
      }

      return;
    }

    if (player.inventory) {
      const weaponValue = getCardValue(player.inventory);

      if (weaponValue >= monsterValue) {
        player.slainCards.push(card);
      } else {
        player.health -= monsterValue - weaponValue;
        player.slainCards.push(card);
      }
    } else {
      player.health -= monsterValue;
    }
  }
};

export const flee = (gameState: GameState) => {
  if (gameState.hasFled) {
    console.log("Cannot flee 2 times in a row");
    return;
  }

  gameState.hasFled = true;
  // Add the current dungeon cards to the deck
  gameState.deck.cards.push(...gameState.dungeon);
  // Shuffle the deck
  gameState.deck.shuffle();
  // Clear the dungeon
  gameState.dungeon = [];

  fillDungeon(gameState);
};

const fillDungeon = (gameState: GameState) => {
  for (let i = gameState.dungeon.length; i < 4; i++) {
    const card = gameState.deck.draw();
    if (card) {
      gameState.dungeon.push(card);
    } else {
      console.log("Deck is empty");
      break;
    }
  }
};
