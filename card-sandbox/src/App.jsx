import React from "react";
import CardCanvas from "./components/CardCanvas";

const App = () => {
  // Sample card data to visualize - this would be replaced with actual game state later
  const sampleCards = [
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
    { id: "deck", suit: "hearts", rank: "2", x: 550, y: 200, faceUp: false },
  ];

  return (
    <div className="h-screen w-full bg-gray-900">
      <CardCanvas cards={sampleCards} />
    </div>
  );
};

export default App;
