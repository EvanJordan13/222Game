import React from "react";

const GameHUD = ({ cards, selectedCardIndex }) => {
  const totalCards = cards.length;
  const faceUpCards = cards.filter((card) => card.faceUp).length;
  const selectedCard =
    selectedCardIndex !== null ? cards[selectedCardIndex] : null;

  // Convert suit and rank to readable format
  const formatCardInfo = (card) => {
    if (!card) return "";

    const suitName =
      {
        hearts: "Hearts",
        diamonds: "Diamonds",
        clubs: "Clubs",
        spades: "Spades",
      }[card.suit] || card.suit;

    const rankName =
      {
        ace: "Ace",
        jack: "Jack",
        queen: "Queen",
        king: "King",
      }[card.rank] || card.rank;

    return `${rankName} of ${suitName}`;
  };

  // Get suit symbol
  const getSuitSymbol = (suit) => {
    switch (suit) {
      case "hearts":
        return "♥";
      case "diamonds":
        return "♦";
      case "clubs":
        return "♣";
      case "spades":
        return "♠";
      default:
        return "";
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        left: "20px",
        bottom: "20px",
        backgroundColor: "rgba(31, 41, 55, 0.9)",
        color: "white",
        padding: "12px",
        borderRadius: "6px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        zIndex: 10,
      }}
    >
      <div style={{ display: "flex", gap: "24px" }}>
        <div>
          <span style={{ color: "#9ca3af", fontSize: "14px" }}>Cards:</span>
          <span style={{ marginLeft: "8px", fontWeight: 500 }}>
            {totalCards}
          </span>
        </div>
        <div>
          <span style={{ color: "#9ca3af", fontSize: "14px" }}>Face Up:</span>
          <span style={{ marginLeft: "8px", fontWeight: 500 }}>
            {faceUpCards}
          </span>
        </div>
        <div>
          <span style={{ color: "#9ca3af", fontSize: "14px" }}>Face Down:</span>
          <span style={{ marginLeft: "8px", fontWeight: 500 }}>
            {totalCards - faceUpCards}
          </span>
        </div>
      </div>

      {selectedCard && (
        <div
          style={{
            marginTop: "8px",
            paddingTop: "8px",
            borderTop: "1px solid #374151",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ color: "#9ca3af", fontSize: "14px" }}>
              Selected:
            </span>
            <span style={{ marginLeft: "8px", fontWeight: 500 }}>
              {formatCardInfo(selectedCard)}
              <span
                style={{
                  marginLeft: "8px",
                  color:
                    selectedCard.suit === "hearts" ||
                    selectedCard.suit === "diamonds"
                      ? "#ef4444"
                      : "#ffffff",
                }}
              >
                {getSuitSymbol(selectedCard.suit)}
              </span>
            </span>
          </div>
          <div style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
            <span>
              Position: X: {Math.round(selectedCard.x)}, Y:{" "}
              {Math.round(selectedCard.y)}
            </span>
            <span style={{ marginLeft: "16px" }}>
              Face {selectedCard.faceUp ? "Up" : "Down"}
            </span>
          </div>
        </div>
      )}

      <div style={{ marginTop: "8px", fontSize: "12px", color: "#9ca3af" }}>
        <span>Double-click to flip cards • Drag to move</span>
      </div>
    </div>
  );
};

export default GameHUD;
