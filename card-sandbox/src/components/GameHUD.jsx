import React from "react";
import { Box, Chip, Divider, Paper, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";

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

  // Get suit symbol and color
  const getSuitDisplay = (suit) => {
    let symbol = "";
    let color = "";

    switch (suit) {
      case "hearts":
        symbol = "♥";
        color = "#e53e3e";
        break;
      case "diamonds":
        symbol = "♦";
        color = "#e53e3e";
        break;
      case "clubs":
        symbol = "♣";
        color = "#1a202c";
        break;
      case "spades":
        symbol = "♠";
        color = "#1a202c";
        break;
      default:
        symbol = "";
        color = "#1a202c";
    }

    return { symbol, color };
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: "absolute",
        left: 20,
        bottom: 20,
        backgroundColor: alpha("#1f2937", 0.9),
        color: "white",
        p: 2,
        borderRadius: 2,
        minWidth: 300,
        zIndex: 1200,
      }}
    >
      <Box sx={{ display: "flex", gap: 3 }}>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Cards
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {totalCards}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Face Up
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {faceUpCards}
          </Typography>
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary">
            Face Down
          </Typography>
          <Typography variant="body1" fontWeight="medium">
            {totalCards - faceUpCards}
          </Typography>
        </Box>
      </Box>

      {selectedCard && (
        <>
          <Divider sx={{ my: 1.5, borderColor: alpha("#fff", 0.2) }} />
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mr: 1 }}
              >
                Selected:
              </Typography>
              <Typography
                variant="body2"
                sx={{ display: "flex", alignItems: "center" }}
              >
                {formatCardInfo(selectedCard)}
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    color: getSuitDisplay(selectedCard.suit).color,
                    fontSize: "1.2rem",
                    lineHeight: 1,
                  }}
                >
                  {getSuitDisplay(selectedCard.suit).symbol}
                </Box>
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Position: X: {Math.round(selectedCard.x)}, Y:{" "}
                {Math.round(selectedCard.y)}
              </Typography>
              <Chip
                label={selectedCard.faceUp ? "Face Up" : "Face Down"}
                size="small"
                variant="outlined"
                sx={{
                  height: 20,
                  "& .MuiChip-label": {
                    px: 1,
                    fontSize: "0.65rem",
                    color: selectedCard.faceUp ? "#4caf50" : "#ff9800",
                  },
                  borderColor: selectedCard.faceUp ? "#4caf50" : "#ff9800",
                }}
              />
            </Box>
          </Box>
        </>
      )}

      <Divider sx={{ my: 1.5, borderColor: alpha("#fff", 0.2) }} />
      <Typography variant="caption" color="text.secondary">
        Double-click to flip cards • Drag to move
      </Typography>
    </Paper>
  );
};

export default GameHUD;
