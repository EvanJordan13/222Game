import React, { useState } from "react";
import CardCanvas from "./components/CardCanvas";
import GameUI from "./components/GameUI";
import GameHUD from "./components/GameHUD";

const App = () => {
  const [cards, setCards] = useState([
    { id: "card1", suit: "hearts", rank: "ace", x: 100, y: 100, faceUp: true },
    {
      id: "card2",
      suit: "spades",
      rank: "king",
      x: 250,
      y: 150,
      faceUp: false,
    },
    {
      id: "card3",
      suit: "diamonds",
      rank: "queen",
      x: 400,
      y: 100,
      faceUp: true,
    },
    { id: "card4", suit: "clubs", rank: "jack", x: 200, y: 300, faceUp: true },
  ]);
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);

  // Handler for adding a new card
  const handleAddCard = (newCard) => {
    setCards([...cards, newCard]);
  };

  // Handler for moving a card
  const handleCardMove = (cardIndex, newX, newY) => {
    setSelectedCardIndex(cardIndex);
    const updatedCards = [...cards];
    updatedCards[cardIndex] = {
      ...updatedCards[cardIndex],
      x: newX,
      y: newY,
    };
    setCards(updatedCards);
  };

  // Handler for flipping a card
  const handleCardFlip = (cardIndex) => {
    setSelectedCardIndex(cardIndex);
    const updatedCards = [...cards];
    updatedCards[cardIndex] = {
      ...updatedCards[cardIndex],
      faceUp: !updatedCards[cardIndex].faceUp,
    };
    setCards(updatedCards);
  };

  // Handler for selecting a card
  const handleCardSelect = (cardIndex) => {
    setSelectedCardIndex(cardIndex);
  };

  // Handler for deselecting a card
  const handleDeselectCard = () => {
    setSelectedCardIndex(null);
  };

  // Handler for dealing cards
  const handleDealCards = (count) => {
    const suits = ["hearts", "diamonds", "clubs", "spades"];
    const ranks = [
      "ace",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "jack",
      "queen",
      "king",
    ];

    const newCards = [];
    for (let i = 0; i < count; i++) {
      const suit = suits[Math.floor(Math.random() * suits.length)];
      const rank = ranks[Math.floor(Math.random() * ranks.length)];

      newCards.push({
        id: `dealt-card-${Date.now()}-${i}`,
        suit,
        rank,
        x: 300 + i * 30,
        y: 200 + i * 15,
        faceUp: true,
      });
    }

    setCards([...cards, ...newCards]);
  };

  // Handler for clearing the table
  const handleClearTable = () => {
    setCards([]);
    setSelectedCardIndex(null);
  };

  // Handler for saving the current setup as a preset
  const handleSavePreset = (preset) => {
    console.log("Saving preset:", preset.name, "with", cards.length, "cards");
    //TODO Implement this foreal
  };

  // Handler for loading a preset
  const handleLoadPreset = (preset) => {
    console.log("Loading preset:", preset.name);
    setSelectedCardIndex(null);

    // Some presets, needs tp be explanded and add custom ones too
    if (preset.name === "Poker") {
      const pokerCards = [
        {
          id: "poker1",
          suit: "hearts",
          rank: "ace",
          x: 200,
          y: 300,
          faceUp: true,
        },
        {
          id: "poker2",
          suit: "hearts",
          rank: "king",
          x: 300,
          y: 300,
          faceUp: true,
        },
        {
          id: "poker3",
          suit: "hearts",
          rank: "queen",
          x: 400,
          y: 300,
          faceUp: true,
        },
        {
          id: "poker4",
          suit: "hearts",
          rank: "jack",
          x: 500,
          y: 300,
          faceUp: true,
        },
        {
          id: "poker5",
          suit: "hearts",
          rank: "10",
          x: 600,
          y: 300,
          faceUp: true,
        },
      ];
      setCards(pokerCards);
    } else if (preset.name === "Blackjack") {
      const blackjackCards = [
        {
          id: "dealer1",
          suit: "spades",
          rank: "ace",
          x: 300,
          y: 100,
          faceUp: true,
        },
        {
          id: "dealer2",
          suit: "clubs",
          rank: "10",
          x: 350,
          y: 100,
          faceUp: false,
        },
        {
          id: "player1",
          suit: "diamonds",
          rank: "8",
          x: 300,
          y: 300,
          faceUp: true,
        },
        {
          id: "player2",
          suit: "hearts",
          rank: "7",
          x: 350,
          y: 300,
          faceUp: true,
        },
      ];
      setCards(blackjackCards);
    } else if (preset.name === "Solitaire") {
      const solitaireCards = [];
      const suits = ["hearts", "diamonds", "clubs", "spades"];
      const ranks = ["ace", "2", "3", "4", "5", "6", "7"];

      for (let col = 0; col < 7; col++) {
        for (let row = 0; row <= col; row++) {
          const suit = suits[Math.floor(Math.random() * suits.length)];
          const rank = ranks[Math.floor(Math.random() * ranks.length)];
          solitaireCards.push({
            id: `solitaire-${col}-${row}`,
            suit,
            rank,
            x: 100 + col * 120,
            y: 100 + row * 30,
            faceUp: row === col, // Only the top card is face up
          });
        }
      }

      setCards(solitaireCards);
    }
  };

  return (
    <div
      className="bg-gray-900"
      style={{
        width: "100vw",
        height: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* The canvas container */}
      <div
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <CardCanvas
          cards={cards}
          onCardMove={handleCardMove}
          onCardFlip={handleCardFlip}
          onCardSelect={handleCardSelect}
          onDeselectCard={handleDeselectCard}
        />
      </div>

      {/* UI Elements */}
      <GameUI
        onAddCard={handleAddCard}
        onDealCards={handleDealCards}
        onClearTable={handleClearTable}
        onSavePreset={handleSavePreset}
        onLoadPreset={handleLoadPreset}
      />

      <GameHUD cards={cards} selectedCardIndex={selectedCardIndex} />
    </div>
  );
};

export default App;
