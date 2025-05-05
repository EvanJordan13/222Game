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
import GameHUD from "./components/GameHUD";
import { CARD_WIDTH, CARD_HEIGHT } from "./utils/canvasUtils";

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
  id: string;
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

type DragMode =
  | "none"
  | "panning"
  | "potential_deck_drag"
  | "deck_drag"
  | "card_drag";

interface DraggedItemInfo {
  id: string;
  type: "card" | "deck";
  currentPos: Position;
  offsetX: number;
  offsetY: number;

  backendDeckId?: string;
  backendIndex?: number;

  originalDeckPos?: Position;
  cardIdsInDeck?: string[];
}

interface PotentialDeckDragInfo {
  mode: "potential_deck_drag";
  cardId: string;
  backendDeckId: string;
  backendIndex: number;
  startWorldPos: Position;
  startScreenPos: Position;
  timerId: NodeJS.Timeout;
}
interface PanInfo {
  mode: "panning";
  startScreenPos: Position;
}
type DragState = PotentialDeckDragInfo | PanInfo | { mode: "none" };

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

const DECK_DRAG_DELAY = 300;
const DECK_DRAG_MOVE_THRESHOLD = 5;

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [visualCards, setVisualCards] = useState<CardData[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);

  const dragStateRef = useRef<DragState>({ mode: "none" });
  const [draggedItemInfo, setDraggedItemInfo] =
    useState<DraggedItemInfo | null>(null);

  const connectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const deckDragTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef<boolean>(false);
  const latestGameState = useRef<GameState | null>(null);

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
    latestGameState.current = gameState;
  }, [gameState]);

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
        if (newWs !== ws.current) return;
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
        if (newWs !== ws.current || closedIntentionally) return;
        setIsConnected(false);
        setGameState(null);
        setVisualCards([]);
        setDraggedItemInfo(null);
        dragStateRef.current = { mode: "none" };
        if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
        if (reconnectTimeout) clearTimeout(reconnectTimeout);
        if (!event.wasClean && isMounted.current) {
          reconnectTimeout = setTimeout(connect, 5000);
        }
      };

      newWs.onerror = (event: Event) => {
        if (newWs !== ws.current) return;
        console.error("WS Error:", event);
        if (connectTimeoutRef.current) clearTimeout(connectTimeoutRef.current);
        connectTimeoutRef.current = null;
      };

      newWs.onmessage = (event: MessageEvent) => {
        if (newWs !== ws.current) return;
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
      if (deckDragTimerRef.current) clearTimeout(deckDragTimerRef.current);
      deckDragTimerRef.current = null;

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

  useEffect(() => {
    const newVisualCards: CardData[] = [];
    if (gameState?.room?.decks) {
      Object.entries(gameState.room.decks).forEach(([deckId, deck]) => {
        if (deck?.cards && Array.isArray(deck.position)) {
          deck.cards.forEach((backendCard: any, indexInDeck: number) => {
            if (!backendCard || typeof backendCard !== "object") return;
            let suit = "unknown",
              rank = "?";
            const cardFrontString: string = backendCard.card_front || "";

            const uniqueCardId = `${deckId}-${
              cardFrontString || `card${indexInDeck}`
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

            const cardData: CardData = {
              faceUp: backendCard.face_up === true,
              suit,
              rank,
              id: uniqueCardId,
              x: deck.position[0] + indexInDeck * 2,
              y: deck.position[1] + indexInDeck * 2,
              backendDeckId: deckId,
              backendIndex: indexInDeck,
              backendCardRef: backendCard,
            };
            newVisualCards.push(cardData);
          });
        }
      });
    }

    const newCardsStr = JSON.stringify(newVisualCards);
    if (newCardsStr !== JSON.stringify(visualCards)) {
      setVisualCards(newVisualCards);
    }
  }, [gameState]);

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
      if (!cardData || !latestGameState.current?.room?.decks) return;

      setSelectedCardId(cardData.id);
      setSelectedDeckId(null);
      setDraggedItemInfo(null);
      dragStateRef.current = { mode: "none" };

      if (deckDragTimerRef.current) clearTimeout(deckDragTimerRef.current);

      const timerId = setTimeout(() => {
        const currentState = latestGameState.current;
        if (!currentState?.room?.decks) return;

        if (
          dragStateRef.current.mode === "potential_deck_drag" &&
          (dragStateRef.current as PotentialDeckDragInfo).cardId === cardData.id
        ) {
          const deck = currentState.room.decks[cardData.backendDeckId];
          if (deck && deck.cards.length > 1) {
            const deckPosX = deck.position[0];
            const deckPosY = deck.position[1];
            setSelectedDeckId(cardData.backendDeckId);
            setSelectedCardId(null);
            dragStateRef.current = { mode: "none" };

            const cardIdsInDeck = Object.values(
              currentState.room.decks[cardData.backendDeckId].cards
            ).map(
              (c: any, idx: number) =>
                `${cardData.backendDeckId}-${
                  c.card_front || `card${idx}`
                }-${idx}`
            );

            setDraggedItemInfo({
              id: cardData.backendDeckId,
              type: "deck",
              currentPos: { x: deckPosX, y: deckPosY },
              offsetX: worldPos.x - deckPosX,
              offsetY: worldPos.y - deckPosY,
              originalDeckPos: { x: deckPosX, y: deckPosY },
              backendDeckId: cardData.backendDeckId,
              cardIdsInDeck: cardIdsInDeck,
            });
          } else {
            dragStateRef.current = { mode: "none" };
            setDraggedItemInfo({
              id: cardData.id,
              type: "card",
              currentPos: { x: cardData.x, y: cardData.y },
              offsetX: worldPos.x - cardData.x,
              offsetY: worldPos.y - cardData.y,
              backendDeckId: cardData.backendDeckId,
              backendIndex: cardData.backendIndex,
            });
          }
        }
        deckDragTimerRef.current = null;
      }, DECK_DRAG_DELAY);

      deckDragTimerRef.current = timerId;

      dragStateRef.current = {
        mode: "potential_deck_drag",
        cardId: cardData.id,
        backendDeckId: cardData.backendDeckId,
        backendIndex: cardData.backendIndex,
        startWorldPos: worldPos,
        startScreenPos: screenPos,
        timerId: timerId,
      };
    },
    [visualCards]
  );

  const handleBackgroundMouseDown = useCallback((screenPos: Position) => {
    setSelectedCardId(null);
    setSelectedDeckId(null);
    setDraggedItemInfo(null);
    if (deckDragTimerRef.current) {
      clearTimeout(deckDragTimerRef.current);
      deckDragTimerRef.current = null;
    }
    dragStateRef.current = { mode: "panning", startScreenPos: screenPos };
  }, []);

  const handleCardMove = useCallback(
    (worldX: number, worldY: number, screenX: number, screenY: number) => {
      const currentDragState = dragStateRef.current;

      if (currentDragState.mode === "potential_deck_drag") {
        const dx = screenX - currentDragState.startScreenPos.x;
        const dy = screenY - currentDragState.startScreenPos.y;
        if (Math.sqrt(dx * dx + dy * dy) > DECK_DRAG_MOVE_THRESHOLD) {
          clearTimeout(currentDragState.timerId);
          deckDragTimerRef.current = null;
          dragStateRef.current = { mode: "none" };
          const cardData = visualCards.find(
            (c) => c.id === currentDragState.cardId
          );
          if (cardData) {
            setDraggedItemInfo({
              id: currentDragState.cardId,
              type: "card",
              currentPos: {
                x: worldX - (currentDragState.startWorldPos.x - cardData.x),
                y: worldY - (currentDragState.startWorldPos.y - cardData.y),
              },
              offsetX: currentDragState.startWorldPos.x - cardData.x,
              offsetY: currentDragState.startWorldPos.y - cardData.y,
              backendDeckId: currentDragState.backendDeckId,
              backendIndex: currentDragState.backendIndex,
            });
          }
        }
        return;
      }

      if (draggedItemInfo) {
        let newX = worldX - draggedItemInfo.offsetX;
        let newY = worldY - draggedItemInfo.offsetY;
        setDraggedItemInfo((prev) =>
          prev ? { ...prev, currentPos: { x: newX, y: newY } } : null
        );
      }
    },
    [draggedItemInfo, visualCards]
  );

  const checkOverlap = (
    pos: Position,
    draggedCardId: string
  ): CardData | null => {
    for (let i = visualCards.length - 1; i >= 0; i--) {
      const card = visualCards[i];

      if (draggedItemInfo?.type === "card" && card.id === draggedItemInfo.id)
        continue;

      if (
        draggedItemInfo?.type === "deck" &&
        card.backendDeckId === draggedItemInfo.id
      )
        continue;

      const cardRight = card.x + CARD_WIDTH;
      const cardBottom = card.y + CARD_HEIGHT;

      const dropCenterX =
        pos.x + (draggedItemInfo?.type === "card" ? CARD_WIDTH / 2 : 0);
      const dropCenterY =
        pos.y + (draggedItemInfo?.type === "card" ? CARD_HEIGHT / 2 : 0);

      if (
        dropCenterX >= card.x &&
        dropCenterX <= cardRight &&
        dropCenterY >= card.y &&
        dropCenterY <= cardBottom
      ) {
        return card;
      }
    }
    return null;
  };

  const handleCardMouseUp = useCallback(() => {
    const currentDragState = dragStateRef.current;
    const currentDraggedItem = draggedItemInfo;

    if (deckDragTimerRef.current) {
      clearTimeout(deckDragTimerRef.current);
      deckDragTimerRef.current = null;
    }

    if (currentDraggedItem && currentDraggedItem.currentPos) {
      if (currentDraggedItem.type === "card") {
        const targetCard = checkOverlap(
          currentDraggedItem.currentPos,
          currentDraggedItem.id
        );
        if (
          targetCard &&
          currentDraggedItem.backendDeckId &&
          currentDraggedItem.backendIndex !== undefined
        ) {
          sendAction({
            action: "combine_cards_into_deck",
            args: {
              dragged_deck_id: currentDraggedItem.backendDeckId,
              dragged_card_index: currentDraggedItem.backendIndex,
              target_deck_id: targetCard.backendDeckId,
              target_card_index: targetCard.backendIndex,
            },
          });
        } else if (
          currentDraggedItem.backendDeckId &&
          currentDraggedItem.backendIndex !== undefined
        ) {
          sendAction({
            action: "move_card",
            args: {
              deck_id: currentDraggedItem.backendDeckId,
              card_index: currentDraggedItem.backendIndex,
              new_position: [
                currentDraggedItem.currentPos.x,
                currentDraggedItem.currentPos.y,
              ],
            },
          });
        }
      } else if (currentDraggedItem.type === "deck") {
        sendAction({
          action: "move_deck",
          args: {
            deck_id: currentDraggedItem.id,
            pos: [
              currentDraggedItem.currentPos.x,
              currentDraggedItem.currentPos.y,
            ],
          },
        });
      }
    } else if (currentDragState.mode === "potential_deck_drag") {
      const cardIndex = visualCards.findIndex(
        (c) => c.id === currentDragState.cardId
      );
      if (cardIndex !== -1) {
        setSelectedCardId(currentDragState.cardId);
        setSelectedDeckId(null);
      }
    }

    dragStateRef.current = { mode: "none" };
    setDraggedItemInfo(null);
    setSelectedDeckId(null);
  }, [sendAction, draggedItemInfo, visualCards]);

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
      setSelectedDeckId(null);
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
      setSelectedDeckId(null);
    },
    [visualCards]
  );

  const handleDeselectCard = useCallback(() => {
    setSelectedCardId(null);
    setSelectedDeckId(null);
  }, []);

  const getFirstDeckId = useCallback((): string | null => {
    const currentGameState = latestGameState.current;
    const availableDeckIds = currentGameState?.room?.decks
      ? Object.keys(currentGameState.room.decks)
      : [];
    return availableDeckIds.length > 0 ? availableDeckIds[0] : null;
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
    if (!targetDeckId) return;
    sendAction({ action: "shuffle", args: { deck_id: targetDeckId } });
  }, [sendAction, getFirstDeckId]);

  const handleRemoveTopCard = useCallback(
    (count = 1) => {
      const targetDeckId = getFirstDeckId();
      if (!targetDeckId) return;
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
    setSelectedDeckId(null);
    setDraggedItemInfo(null);
    dragStateRef.current = { mode: "none" };
  }, [sendAction]);

  const handleSavePreset = useCallback((preset: Preset) => {}, []);

  const handleLoadPreset = useCallback(
    (preset: Preset) => {
      setSelectedCardId(null);
      setSelectedDeckId(null);
      setDraggedItemInfo(null);
      dragStateRef.current = { mode: "none" };
    },
    [sendAction]
  );

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
              dragState={dragStateRef.current}
              draggedItemInfo={draggedItemInfo}
              onCardMouseDown={handleCardMouseDown}
              onBackgroundMouseDown={handleBackgroundMouseDown}
              onCardMouseMove={handleCardMove}
              onCardMouseUp={handleCardMouseUp}
              onCardFlip={handleCardFlip}
              onCardSelect={handleCardSelect}
              onDeselectCard={handleDeselectCard}
              selectedCardIndex={currentSelectedCardIndex}
              selectedDeckId={selectedDeckId}
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
