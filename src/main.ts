import { GameState, Card, Deck, useCard, flee, MAX_HEALTH } from "./game";

import { handlePopover } from "./popover";

export const Difficulty = {
  Easy: "Easy",
  Medium: "Medium",
  Hard: "Hard",
};

export type DifficultyType = (typeof Difficulty)[keyof typeof Difficulty];

let lastDungeon = [] as Card[];

handlePopover();

function renderDungeon(gameState: GameState) {
  const dungeonContainer = document.getElementById("dungeon")!;
  dungeonContainer.innerHTML = "";

  gameState.dungeon.forEach((card, index) => {
    const cardElement = createCardElement(card);

    const isFromDungeon = lastDungeon.some(
      (lastCard) => lastCard.value === card.value && lastCard.suit === card.suit
    );

    if (!isFromDungeon) {
      cardElement.classList.add("drawn");
    }

    cardElement.addEventListener("click", () => onCardClick(index, gameState));
    dungeonContainer.appendChild(cardElement);
  });

  lastDungeon = [...gameState.dungeon];
}

function drawGameState(gameState: GameState) {
  // Update health
  document.getElementById("health")!.textContent =
    gameState.player.health.toString() + "/ " + MAX_HEALTH + " HP" + " ❤️";

  document.getElementById("deck-count")!.textContent =
    gameState.deck.cards.length.toString();

  document.getElementById("is-fleeing")!.textContent = gameState.hasFled
    ? "You have just fled, you cannot flee again"
    : "Too hard? Just flee";

  const fleeBtn = document.getElementById("flee-dungeon")! as HTMLButtonElement;
  fleeBtn.disabled = gameState.hasFled;

  renderDungeon(gameState);
  // Render dungeon cards
  // const dungeonContainer = document.getElementById("dungeon")!;
  // dungeonContainer.innerHTML = "";
  // gameState.dungeon.forEach((card, index) => {
  //   const cardElement = createCardElement(card);
  //   cardElement.addEventListener("click", () => onCardClick(index, gameState));
  //   dungeonContainer.appendChild(cardElement);
  // });

  // Render inventory
  const inventoryContainer = document.getElementById("inventory")!;
  inventoryContainer.innerHTML = "";

  if (gameState.player.inventory) {
    const cardElement = createCardElement(gameState.player.inventory);
    inventoryContainer.appendChild(cardElement);
  }

  // Render slain cards
  const slainCardsContainer = document.getElementById("slain-cards")!;
  slainCardsContainer.innerHTML = "";
  gameState.player.slainCards.forEach((card) => {
    const cardElement = createCardElement(card);
    slainCardsContainer.appendChild(cardElement);
  });
}

function createCardElement(card: Card): HTMLElement {
  const cardElement = document.createElement("div");
  cardElement.className = "card " + card.suit;
  let cardSymbol;
  if (card.suit === "hearts") {
    cardSymbol = "♥";
  } else if (card.suit === "diamonds") {
    cardSymbol = "♦";
  } else if (card.suit === "clubs") {
    cardSymbol = "♣";
  } else {
    cardSymbol = "♠";
  }

  cardElement.innerHTML = `
    <strong>${card.value} of ${card.suit}</strong><br>
    ${cardSymbol}
  `;

  return cardElement;
}

function fleeClicked(gameState: GameState) {
  flee(gameState);
  drawGameState(gameState);
}

function drawDungeon(gameState: GameState, init = false) {
  // if (gameState.deck.length < 4) return alert('Not enough cards left in the deck!');
  // gameState.dungeon = gameState.deck.splice(-4); // Draw 4 cards

  document.getElementById("flee-dungeon")!.addEventListener(
    "click",
    () => {
      fleeClicked(gameState);
    },
    { once: true }
  );

  // draw 4 cards from the deck or until the deck is empty
  for (let i = gameState.dungeon.length; i < 4; i++) {
    const card = gameState.deck.draw();
    if (card) {
      gameState.dungeon.push(card);
    } else {
      console.log("Deck is empty");

      break;
    }
  }

  if (init) {
    drawGameState(gameState);
  }
}

function onCardClick(index: number, gameState: GameState) {
  useCard(gameState.dungeon[index], gameState.player);
  gameState.dungeon.splice(index, 1); // Remove the card from the dungeon

  // if health less than 0 game over

  if (gameState.player.health <= 0) {
    alert("Game Over");
    drawDungeonBtn.disabled = false;
    difficulty.style.display = "block";
    // drawDungeon({
    //   deck: createDeck(),
    //   dungeon: [],
    //   player: { health: 20, inventory: null, slainCards: [] },
    //   hasFled: false,
    // });

    return;
  }

  // if the dungeon has 1 card remaining automatically draw 4 cards if possible
  if (gameState.dungeon.length === 1) {
    gameState.hasFled = false;

    drawDungeon(gameState);
  }

  // check if last card

  if (gameState.deck.cards.length === 0 && gameState.dungeon.length === 0) {
    alert("You win!");
    drawDungeonBtn.disabled = false;
    difficulty.style.display = "block";
  }

  drawGameState(gameState);
}

const createDeck = (difficulty: DifficultyType) => {
  const deck = new Deck();
  deck.shuffle();

  // if difficulty easy return, if medium remove aces and kings from hearts and diamonds, if hard remove aces kings queens and jacks from hearts and diamonds

  if (difficulty === "Easy") {
    return deck;
  }

  if (difficulty === "Medium") {
    deck.cards = deck.cards.filter(
      (card) =>
        !(
          (card.suit === "hearts" || card.suit === "diamonds") &&
          (card.value === "A" || card.value === "K")
        )
    );
  }

  if (difficulty === "Hard") {
    deck.cards = deck.cards.filter(
      (card) =>
        !(
          (card.suit === "hearts" || card.suit === "diamonds") &&
          (card.value === "A" ||
            card.value === "K" ||
            card.value === "Q" ||
            card.value === "J")
        )
    );
  }

  return deck;
};

// const initialGameState: GameState = {
//   deck: createDeck(),
//   dungeon: [],
//   player: { health: 20, inventory: null, slainCards: [] },
//   hasFled: false,
// };

const drawDungeonBtn = document.getElementById(
  "draw-dungeon"
)! as HTMLButtonElement;

const difficulty = document.getElementById("difficulty") as HTMLSelectElement;
// Initial draw
drawDungeonBtn.addEventListener("click", () => {
  const difficultyValue = difficulty.value;

  difficulty.style.display = "none";

  const deckCounter = document.getElementById("deck-counter") as HTMLDivElement;
  deckCounter.style.display = "block";

  drawDungeon(
    {
      deck: createDeck(difficultyValue),
      dungeon: [],
      player: { health: MAX_HEALTH, inventory: null, slainCards: [] },
      hasFled: false,
    },
    true
  );
  drawDungeonBtn.disabled = true;
});
