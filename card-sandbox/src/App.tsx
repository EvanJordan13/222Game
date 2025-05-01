import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Typography,
} from "@mui/material";
import CardCanvas from "./components/CardCanvas";
import GameUI from "./components/GameUI";
import GameHUD from "./components/GameHUD.jsx";

interface Position {
  x: number;
  y: number;
}
interface CardData {
  id: string;
  x: number;
  y: number;
  faceUp?: boolean;
  suit: string;
  rank: string;
  backendDeckId: string;
  backendIndex: number;
  backendCardRef: any;
}
interface BackendDeck {
  cards: any[];
  position: [number, number];
}
interface BackendRoom {
  decks: { [key: string]: BackendDeck };
  players: string[];
  hands: { [key: string]: any };
}
interface GameState {
  room: BackendRoom;
}
interface DragInfo {
  backendDeckId: string;
  backendIndex: number;
  cardId: string;
  offsetX: number;
  offsetY: number;
}
export interface Preset {
  id: number | string;
  name: string;
  description: string;
}

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
      '"Segoe UI"',
      "Arial",
      "sans-serif",
    ].join(","),
  },
});

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [visualCards, setVisualCards] = useState<CardData[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const ws = useRef<WebSocket | null>(null);
  const dragInfo = useRef<DragInfo | null>(null);
  const finalDragPosition = useRef<Position | null>(null);
  const lastSyncedVisualCardsStr = useRef<string>("[]");
  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef<boolean>(false);

  const backendUrl = "ws://127.0.0.1:8000";
  const roomId = "mcI5j0Kw";
  const [playerName] = useState<string>(
    () => "Player" + Math.floor(Math.random() * 100)
  );

  const sendAction = useCallback((actionData: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(actionData));
    } else {
      console.error(
        `WS not open (State: ${ws.current?.readyState})`,
        actionData
      );
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;

    if (!roomId || !playerName) return;

    const wsUrl = `${backendUrl}/ws/${roomId}`;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    let currentWsInstance: WebSocket | null = null;
    let closedIntentionally = false;

    const connect = () => {
      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
      connectTimeoutRef.current = null;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      reconnectTimeout = null;

      if (ws.current && ws.current !== currentWsInstance) {
        ws.current.close(1000, "Stale connection replaced");
      }

      const newWs = new WebSocket(wsUrl);
      currentWsInstance = newWs;
      ws.current = newWs;
      closedIntentionally = false;

      newWs.onopen = () => {
        if (newWs !== ws.current) {
          return;
        }
        setIsConnected(true);
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        reconnectTimeout = null;

        if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = setTimeout(() => {
          if (newWs === ws.current && newWs.readyState === WebSocket.OPEN) {
            newWs.send(playerName);
          }
          connectTimeoutRef.current = null;
        }, 150);
      };

      newWs.onclose = (event: CloseEvent) => {
        if (newWs !== ws.current || closedIntentionally) {
          return;
        }
        setIsConnected(false);
        setGameState(null);
        setVisualCards([]);
        lastSyncedVisualCardsStr.current = "[]";
        if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
        if (reconnectTimeout) clearTimeout(reconnectTimeout);

        if (!event.wasClean && isMounted.current) {
          reconnectTimeout = setTimeout(connect, 5000);
        }
      };

      newWs.onerror = (event: Event) => {
        if (newWs !== ws.current) {
          return;
        }
        console.error("WS Error:", event);
        if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      };

      newWs.onmessage = (event: MessageEvent) => {
        if (newWs !== ws.current) {
          return;
        }
        try {
          setGameState(JSON.parse(event.data as string));
        } catch (error) {
          console.error("Failed to parse message:", event.data, error);
        }
      };
    };

    connect();

    return () => {
      isMounted.current = false;

      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
      connectTimeoutRef.current = null;

      if (currentWsInstance) {
        closedIntentionally = true;
        currentWsInstance.onopen = null;
        currentWsInstance.onclose = null;
        currentWsInstance.onerror = null;
        currentWsInstance.onmessage = null;
        if (currentWsInstance.readyState < WebSocket.CLOSING) {
          currentWsInstance.close(1000, "Component unmounting");
        }
      }
    };
  }, [roomId, backendUrl, playerName]);

  const getFirstDeckId = useCallback((): string | null => {
    const availableDeckIds = gameState?.room?.decks
      ? Object.keys(gameState.room.decks)
      : [];
    return availableDeckIds.length > 0 ? availableDeckIds[0] : null;
  }, [gameState]);

  const cardsToRender = useMemo<CardData[]>(() => {
    const rendered: CardData[] = [];
    if (gameState?.room?.decks) {
      Object.entries(gameState.room.decks).forEach(([deckId, deck]) => {
        if (deck?.cards && Array.isArray(deck.position)) {
          deck.cards.forEach((backendCard: any, indexInDeck: number) => {
            if (!backendCard || typeof backendCard !== "object") return;
            let suit = "unknown",
              rank = "?";
            const cardFrontString: string = backendCard.card_front || "";
            const uniqueCardId = `${deckId}-${
              cardFrontString || "unknown"
            }-${indexInDeck}`;
            if (cardFrontString.length >= 1) {
              const suitChar = cardFrontString.charAt(0);
              const rankStr = cardFrontString.substring(1);
              suit =
                { H: "hearts", D: "diamonds", S: "spades", C: "clubs" }[
                  suitChar
                ] || "unknown";
              rank =
                { A: "ace", K: "king", Q: "queen", J: "jack" }[rankStr] ||
                rankStr;
            }
            const offsetX = indexInDeck * 2;
            const offsetY = indexInDeck * 2;
            const cardData: CardData = {
              faceUp: backendCard.face_up === true,
              suit,
              rank,
              id: uniqueCardId,
              x: deck.position[0] + offsetX,
              y: deck.position[1] + offsetY,
              backendDeckId: deckId,
              backendIndex: indexInDeck,
              backendCardRef: backendCard,
            };
            rendered.push(cardData);
          });
        }
      });
    }
    return rendered;
  }, [gameState]);

  useEffect(() => {
    if (!dragInfo.current) {
      const cardsToRenderStr = JSON.stringify(cardsToRender);
      if (cardsToRenderStr !== lastSyncedVisualCardsStr.current) {
        setVisualCards(cardsToRender);
        lastSyncedVisualCardsStr.current = cardsToRenderStr;
      }
    }
  }, [cardsToRender]);

  const cardMapForSelection = useMemo<{ [key: string]: number }>(() => {
    const map: { [key: string]: number } = {};
    visualCards.forEach((card, index) => {
      map[card.id] = index;
    });
    return map;
  }, [visualCards]);

  const handleCardMouseDown = useCallback(
    (cardIndex: number, worldPos: Position, screenPos: Position) => {
      const cardData = visualCards[cardIndex];
      if (!cardData) return;
      setSelectedCardId(cardData.id);
      dragInfo.current = {
        backendDeckId: cardData.backendDeckId,
        backendIndex: cardData.backendIndex,
        cardId: cardData.id,
        offsetX: worldPos.x - cardData.x,
        offsetY: worldPos.y - cardData.y,
      };
      finalDragPosition.current = null;
    },
    [visualCards]
  );

  const handleCardMove = useCallback((worldX: number, worldY: number) => {
    if (!dragInfo.current) return;
    const { cardId, offsetX, offsetY } = dragInfo.current;
    const targetX = worldX - offsetX;
    const targetY = worldY - offsetY;
    setVisualCards((prevCards) => {
      const cardVisualIndex = prevCards.findIndex((c) => c.id === cardId);
      if (cardVisualIndex === -1) return prevCards;
      const updatedCards = [...prevCards];
      updatedCards[cardVisualIndex] = {
        ...updatedCards[cardVisualIndex],
        x: targetX,
        y: targetY,
      };
      return updatedCards;
    });
    finalDragPosition.current = { x: targetX, y: targetY };
  }, []);

  const handleCardMouseUp = useCallback(() => {
    if (dragInfo.current && finalDragPosition.current) {
      const { backendDeckId, backendIndex } = dragInfo.current;
      const { x: finalX, y: finalY } = finalDragPosition.current;
      sendAction({
        action: "move_card",
        args: {
          deck_id: backendDeckId,
          card_index: backendIndex,
          new_position: [finalX, finalY],
        },
      });
      dragInfo.current = null;
      finalDragPosition.current = null;
    } else if (dragInfo.current) {
      dragInfo.current = null;
      finalDragPosition.current = null;
    }
  }, [sendAction]);

  const handleCardFlip = useCallback(
    (cardIndex: number) => {
      const cardData = visualCards[cardIndex];
      if (
        !cardData?.backendDeckId ||
        cardData.backendIndex === undefined ||
        !cardData.backendCardRef
      )
        return;
      const { backendDeckId, backendIndex, backendCardRef, id } = cardData;
      const currentFaceUp = backendCardRef.face_up === true;
      setSelectedCardId(id);
      sendAction({
        action: "flip_deck_card",
        args: {
          deck_id: backendDeckId,
          idx: backendIndex,
          face_up: !currentFaceUp,
        },
      });
    },
    [visualCards, sendAction]
  );

  const handleCardSelect = useCallback(
    (cardIndex: number) => {
      const cardId = visualCards[cardIndex]?.id;
      setSelectedCardId(cardId || null);
    },
    [visualCards]
  );

  const handleDeselectCard = useCallback(() => {
    setSelectedCardId(null);
  }, []);

  const handleInitializeDeck = useCallback(() => {
    const initialPos: [number, number] = [
      Math.random() * 200 + 50,
      Math.random() * 100 + 50,
    ];
    sendAction({
      action: "initialize_deck",
      args: { deck_type: "standard52", pos: initialPos },
    });
  }, [sendAction]);

  const handleShuffleDeck = useCallback(() => {
    const targetDeckId = getFirstDeckId();
    if (!targetDeckId) {
      console.error("Cannot shuffle: No deck available.");
      return;
    }
    sendAction({ action: "shuffle", args: { deck_id: targetDeckId } });
  }, [sendAction, getFirstDeckId]);

  const handleRemoveTopCard = useCallback(
    (count = 1) => {
      const targetDeckId = getFirstDeckId();
      if (!targetDeckId) {
        console.error("Cannot remove top card: No deck available.");
        return;
      }
      sendAction({
        action: "remove_top",
        args: { deck_id: targetDeckId, n: count },
      });
    },
    [sendAction, getFirstDeckId]
  );

  const handleClearTable = useCallback(() => {
    setGameState(null);
    setVisualCards([]);
    setSelectedCardId(null);
  }, []);

  const handleSavePreset = useCallback((preset: Preset) => {}, []);

  const handleLoadPreset = useCallback((preset: Preset) => {
    setSelectedCardId(null);
  }, []);

  const handleAddCard = useCallback(
    (options: { suit: string; rank: string; faceUp: boolean }) => {
      let backendCardFront = "";
      const { suit, rank, faceUp } = options;
      let suitChar =
        { hearts: "H", diamonds: "D", spades: "S", clubs: "C" }[suit] || "?";
      let rankStr =
        { ace: "A", king: "K", queen: "Q", jack: "J" }[rank] ||
        rank.toUpperCase();
      backendCardFront = suitChar + rankStr;
      const targetDeckId = getFirstDeckId();
      if (!targetDeckId) {
        console.error("Cannot add card: No deck available.");
        return;
      }
      sendAction({
        action: "add_top",
        args: {
          deck_id: targetDeckId,
          card: {
            card_front: backendCardFront,
            card_back: "",
            face_up: faceUp,
          },
        },
      });
    },
    [sendAction, getFirstDeckId]
  );

  const currentSelectedCardIndex = useMemo(() => {
    return selectedCardId !== null &&
      cardMapForSelection.hasOwnProperty(selectedCardId)
      ? cardMapForSelection[selectedCardId]
      : null;
  }, [selectedCardId, cardMapForSelection]);

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
        <div
          style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        >
          {!isConnected ? (
            <Typography sx={{ p: 3, color: "white" }}>Connecting...</Typography>
          ) : !gameState ? (
            <Typography sx={{ p: 3, color: "white" }}>
              Waiting for state... Click 'Initialize Deck'.
            </Typography>
          ) : (
            <CardCanvas
              cards={visualCards}
              onCardMouseDown={handleCardMouseDown}
              onCardMouseMove={handleCardMove}
              onCardMouseUp={handleCardMouseUp}
              onCardFlip={handleCardFlip}
              onCardSelect={handleCardSelect}
              onDeselectCard={handleDeselectCard}
              selectedCardIndex={currentSelectedCardIndex}
            />
          )}
        </div>
        {gameState && (
          <GameHUD
            cards={visualCards}
            selectedCardIndex={currentSelectedCardIndex}
          />
        )}
        <GameUI
          onAddCard={handleAddCard}
          onInitializeDeck={handleInitializeDeck}
          onShuffleDeck={handleShuffleDeck}
          onRemoveTopCard={handleRemoveTopCard}
          onClearTable={handleClearTable}
          onSavePreset={handleSavePreset}
          onLoadPreset={handleLoadPreset}
        />
      </div>
    </ThemeProvider>
  );
};

export default App;
