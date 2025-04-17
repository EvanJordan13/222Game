import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Typography,
} from "@mui/material";
import CardCanvas from "./components/CardCanvas";
import GameUI from "./components/GameUI";
import GameHUD from "./components/GameHUD";

// Create dark theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#3f51b5" },
    secondary: { main: "#5c6bc0" },
    background: { default: "#1a202c", paper: "#2d3748" },
    error: { main: "#f44336" },
    success: { main: "#4caf50" },
  },
  typography: {
    fontFamily: [
      "Roboto",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
});

const App = () => {
  const [gameState, setGameState] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef(null);

  const backendUrl = "ws://127.0.0.1:8000";
  const roomId = "mcI5j0Kw"; // TODO: Get this dynamically
  const playerName = "Player" + Math.floor(Math.random() * 100); // TODO: Get this dynamically

  const [selectedCardId, setSelectedCardId] = useState(null);

  const sendAction = useCallback((actionData) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      console.log("Sending action:", actionData);
      ws.current.send(JSON.stringify(actionData));
    } else {
      console.error(
        "WebSocket not connected or not open. Cannot send action:",
        actionData
      );
    }
  }, []);

  useEffect(() => {
    if (!roomId || !playerName) return;

    const wsUrl = `${backendUrl}/ws/${roomId}`;
    console.log(`Connecting to WebSocket: ${wsUrl}`);
    ws.current = new WebSocket(wsUrl);
    let reconnectTimeout = null;

    const connect = () => {
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log("WebSocket Connected");
        setIsConnected(true);
        ws.current.send(playerName);
        clearTimeout(reconnectTimeout);
      };

      ws.current.onclose = () => {
        console.log("WebSocket Disconnected");
        setIsConnected(false);
        setGameState(null);
        clearTimeout(reconnectTimeout);
        reconnectTimeout = setTimeout(connect, 5000);
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };

      ws.current.onmessage = (event) => {
        try {
          const receivedState = JSON.parse(event.data);
          setGameState(receivedState);
        } catch (error) {
          console.error(
            "Failed to parse message from backend:",
            event.data,
            error
          );
        }
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      ws.current?.close();
    };
  }, [roomId, playerName, backendUrl]);

  const cardsToRender = [];
  let cardMapForSelection = {};

  if (gameState && gameState.room) {
    if (gameState.room.decks) {
      Object.entries(gameState.room.decks).forEach(([deckId, deck]) => {
        if (deck && deck.cards && Array.isArray(deck.position)) {
          deck.cards.forEach((backendCard, indexInDeck) => {
            let suit = "";
            let rank = "";
            const cardFrontString = backendCard.card_front || "";
            const uniqueCardId = `${deckId}-${indexInDeck}`;

            if (cardFrontString.length >= 1) {
              const suitChar = cardFrontString.charAt(0);
              const rankStr = cardFrontString.substring(1);

              switch (suitChar) {
                case "H":
                  suit = "hearts";
                  break;
                case "D":
                  suit = "diamonds";
                  break;
                case "S":
                  suit = "spades";
                  break;
                case "C":
                  suit = "clubs";
                  break;
                default:
                  suit = "unknown";
              }

              switch (rankStr) {
                case "A":
                  rank = "ace";
                  break;
                case "K":
                  rank = "king";
                  break;
                case "Q":
                  rank = "queen";
                  break;
                case "J":
                  rank = "jack";
                  break;
                default:
                  rank = rankStr;
                  break;
              }
            }

            const cardData = {
              faceUp: backendCard.face_up !== false,
              suit: suit,
              rank: rank,
              id: uniqueCardId,
              x: deck.position[0] + indexInDeck * 0.5,
              y: deck.position[1] + indexInDeck * 0.7,
            };
            cardsToRender.push(cardData);
            cardMapForSelection[uniqueCardId] = cardsToRender.length - 1;
          });
        }
      });
    }
  }

  // Handler for adding a new card
  const handleAddCard = (newCardOptions) => {
    //convert
    let backendCardFront = "";
    const suit = newCardOptions.suit || "hearts";
    const rank = newCardOptions.rank || "ace";

    let suitChar = "";
    switch (suit) {
      case "hearts":
        suitChar = "H";
        break;
      case "diamonds":
        suitChar = "D";
        break;
      case "spades":
        suitChar = "S";
        break;
      case "clubs":
        suitChar = "C";
        break;
      default:
        suitChar = "?";
    }

    let rankStr = "";
    switch (rank) {
      case "ace":
        rankStr = "A";
        break;
      case "king":
        rankStr = "K";
        break;
      case "queen":
        rankStr = "Q";
        break;
      case "jack":
        rankStr = "J";
        break;
      default:
        rankStr = rank.toUpperCase();
        break;
    }
    backendCardFront = suitChar + rankStr;

    // TODO: Determine the target deck ID dynamically. Using a placeholder here.
    const targetDeckId = "standard_52_0";

    if (!targetDeckId) {
      console.error("Cannot add card: Target deck ID is not specified.");
      return;
    }

    const action = {
      action: "add_card_to_deck",
      args: {
        deck_id: targetDeckId,
        card: {
          card_front: backendCardFront,
          card_back: "",
          face_up: newCardOptions.faceUp !== false,
        },
      },
    };
    sendAction(action);
  };

  // Handler for moving a card
  const handleCardMove = (cardIndex, newX, newY) => {
    const cardId = cardsToRender[cardIndex]?.id;
    if (!cardId) return;
    console.warn(
      `Card move initiated for ${cardId} to ${newX}, ${newY}. Backend action needed on drop.`
    );
    // TODO: Implement backend action sending on card drop, or visual-only drag.
  };

  // Handler for flipping a card
  const handleCardFlip = (cardIndex) => {
    const cardId = cardsToRender[cardIndex]?.id;
    if (!cardId || !gameState || !gameState.room || !gameState.room.decks)
      return;

    let targetDeckId = null;
    let targetIndexInDeck = -1;
    let currentFaceUp = false;

    Object.entries(gameState.room.decks).find(([deckId, deck]) => {
      if (deck && deck.cards) {
        const foundIndex = deck.cards.findIndex(
          (c, idx) => `${deckId}-${idx}` === cardId
        );
        if (foundIndex !== -1) {
          targetDeckId = deckId;
          targetIndexInDeck = foundIndex;
          currentFaceUp = deck.cards[foundIndex].face_up;
          return true;
        }
      }
      return false;
    });

    if (targetDeckId !== null && targetIndexInDeck !== -1) {
      setSelectedCardId(cardId);
      const action = {
        action: "flip_deck_card",
        args: {
          deck_id: targetDeckId,
          idx: targetIndexInDeck,
          face_up: !currentFaceUp,
        },
      };
      sendAction(action);
    } else {
      console.error(`Card with ID ${cardId} not found in backend state decks.`);
    }
  };

  // Handler for selecting a card
  const handleCardSelect = (cardIndex) => {
    const cardId = cardsToRender[cardIndex]?.id;
    setSelectedCardId(cardId);
  };

  // Handler for deselecting a card
  const handleDeselectCard = () => {
    setSelectedCardId(null);
  };

  // Handler for dealing cards
  const handleDealCards = (count) => {
    console.log(`Deal ${count} cards requested. Needs backend action.`);
    sendAction({
      action: "initialize_deck",
      args: { deck_type: "standard52" },
    });
  };

  // Handler for clearing the table
  const handleClearTable = () => {
    console.log("Clear table requested. Needs backend action.");
    setGameState(null);
    setSelectedCardId(null);
  };

  // Handler for saving the current setup as a preset
  const handleSavePreset = (preset) => {
    console.log("Saving preset:", preset.name);
    //TODO Implement this foreal
  };

  // Handler for loading a preset
  const handleLoadPreset = (preset) => {
    console.log("Loading preset:", preset.name);
    setSelectedCardId(null);

    // Some presets, needs tp be explanded and add custom ones too
    if (preset.name === "Poker") {
      console.warn("Poker preset load needs backend integration");
    } else if (preset.name === "Blackjack") {
      console.warn("Blackjack preset load needs backend integration");
    } else if (preset.name === "Solitaire") {
      console.warn("Solitaire preset load needs backend integration");
    }
  };

  const currentSelectedCardIndex =
    selectedCardId !== null ? cardMapForSelection[selectedCardId] : null;

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div
        style={{
          width: "100vw",
          height: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Canvas container */}
        <div
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {!isConnected ? (
            <Typography sx={{ p: 3, color: "white" }}>
              Connecting to server...
            </Typography>
          ) : !gameState ? (
            <Typography sx={{ p: 3, color: "white" }}>
              Waiting for game state...
            </Typography>
          ) : (
            <CardCanvas
              cards={cardsToRender}
              onCardMove={handleCardMove}
              onCardFlip={handleCardFlip}
              onCardSelect={handleCardSelect}
              onDeselectCard={handleDeselectCard}
              selectedCardIndex={currentSelectedCardIndex}
            />
          )}
        </div>

        {/* UI Components */}
        {gameState && (
          <GameHUD
            cards={cardsToRender}
            selectedCardIndex={currentSelectedCardIndex}
          />
        )}

        <GameUI
          onAddCard={handleAddCard}
          onDealCards={handleDealCards}
          onClearTable={handleClearTable}
          onSavePreset={handleSavePreset}
          onLoadPreset={handleLoadPreset}
          // sendAction={sendAction}
        />
      </div>
    </ThemeProvider>
  );
};

export default App;
