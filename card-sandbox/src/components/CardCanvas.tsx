import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  drawCard,
  drawTable,
  CARD_WIDTH,
  CARD_HEIGHT,
} from "../utils/canvasUtils";
import Camera from "../utils/camera";

interface Position {
  x: number;
  y: number;
}

interface Card {
  id: string;
  x: number;
  y: number;
  faceUp?: boolean;
  suit: string;
  rank: string;
  backendDeckId?: string;
  backendIndex?: number;
  isDraggingDeck?: boolean;
}

interface Dimensions {
  width: number;
  height: number;
}

interface BackendDeck {
  id: string;
  cards: any[];
  position: [number, number];
}
interface BackendRoom {
  decks: { [key: string]: BackendDeck };
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

interface CardCanvasProps {
  cards: Card[];
  dragState: DragState;
  draggedItemInfo: DraggedItemInfo | null;
  onCardMouseDown?: (
    index: number,
    worldPos: Position,
    screenPos: Position
  ) => void;
  onBackgroundMouseDown?: (screenPos: Position) => void;
  onCardMouseMove?: (
    worldX: number,
    worldY: number,
    screenX: number,
    screenY: number
  ) => void;
  onCardMouseUp?: () => void;
  onCardFlip?: (index: number) => void;
  onCardSelect?: (index: number) => void;
  onDeselectCard?: () => void;
  selectedCardIndex: number | null;
  selectedDeckId: string | null;
}

const CardCanvas: React.FC<CardCanvasProps> = ({
  cards,
  dragState,
  draggedItemInfo,
  onCardMouseDown,
  onBackgroundMouseDown,
  onCardMouseMove,
  onCardMouseUp,
  onCardFlip,
  onCardSelect,
  onDeselectCard,
  selectedCardIndex,
  selectedDeckId,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const cameraRef = useRef<Camera>(Camera.new());
  const animationFrameRef = useRef<number | null>(null);
  const [renderTrigger, setRenderTrigger] = useState<number>(0);
  const [lastClickTime, setLastClickTime] = useState<number>(0);
  const isComponentMounted = useRef<boolean>(true);

  useEffect(() => {
    isComponentMounted.current = true;
    return () => {
      isComponentMounted.current = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const triggerRender = useCallback(() => {
    if (isComponentMounted.current) {
      setRenderTrigger(Date.now());
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (isComponentMounted.current) {
        setDimensions({ width: window.innerWidth, height: window.innerHeight });
        triggerRender();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [triggerRender]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const cam = cameraRef.current;

    if (cam.hasInertia() && dragState.mode !== "panning") {
      cameraRef.current = cam.updateInertia();

      animationFrameRef.current = requestAnimationFrame(triggerRender);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    try {
      drawTable(ctx, dimensions, cam);
    } catch (error) {
      console.error("Error drawing table:", error);
    }

    ctx.save();
    const worldToScreenMat = cam.worldToScreen(dimensions);
    ctx.setTransform(
      worldToScreenMat.a,
      worldToScreenMat.b,
      worldToScreenMat.c,
      worldToScreenMat.d,
      worldToScreenMat.e,
      worldToScreenMat.f
    );

    cards.forEach((card, index) => {
      if (
        draggedItemInfo &&
        ((draggedItemInfo.type === "card" && card.id === draggedItemInfo.id) ||
          (draggedItemInfo.type === "deck" &&
            card.backendDeckId === draggedItemInfo.id))
      ) {
        return;
      }
      const isSelected = index === selectedCardIndex;
      const isDeckSelected = card.backendDeckId === selectedDeckId;
      drawCard(
        ctx,
        card,
        card.x,
        card.y,
        card.faceUp !== false,
        isSelected,
        isDeckSelected
      );
    });

    if (draggedItemInfo) {
      if (draggedItemInfo.type === "card") {
        const card = cards.find((c) => c.id === draggedItemInfo.id);
        if (card) {
          drawCard(
            ctx,
            card,
            draggedItemInfo.currentPos.x,
            draggedItemInfo.currentPos.y,
            card.faceUp !== false,
            true,
            false
          );
        }
      } else if (draggedItemInfo.type === "deck") {
        const deckCards = cards.filter(
          (c) => c.backendDeckId === draggedItemInfo.id
        );

        deckCards
          .sort((a, b) => a.backendIndex! - b.backendIndex!)
          .forEach((card, index) => {
            const isSelected = false;
            const isDeckSelectedAndDragging = true;
            drawCard(
              ctx,
              card,
              draggedItemInfo.currentPos.x + index * 2,
              draggedItemInfo.currentPos.y + index * 2,
              card.faceUp !== false,
              isSelected,
              isDeckSelectedAndDragging
            );
          });
      }
    }

    ctx.restore();
  }, [
    cards,
    dimensions,
    selectedCardIndex,
    selectedDeckId,
    renderTrigger,
    draggedItemInfo,
    dragState.mode,
  ]);

  const screenToWorld = useCallback(
    (screenX: number, screenY: number): Position => {
      const rect = canvasRef.current?.getBoundingClientRect() ?? {
        left: 0,
        top: 0,
      };
      const canvasX = screenX - rect.left;
      const canvasY = screenY - rect.top;
      const mat = cameraRef.current.screenToWorld(dimensions);
      const pt = new DOMPoint(canvasX, canvasY);
      const transformed = pt.matrixTransform(mat);
      return { x: transformed.x, y: transformed.y };
    },
    [dimensions]
  );

  const isPointInCard = useCallback(
    (worldX: number, worldY: number, cardX: number, cardY: number): boolean => {
      return (
        worldX >= cardX &&
        worldX <= cardX + CARD_WIDTH &&
        worldY >= cardY &&
        worldY <= cardY + CARD_HEIGHT
      );
    },
    []
  );

  const findCardAtPosition = useCallback(
    (worldX: number, worldY: number): number | null => {
      if (draggedItemInfo?.type === "card") {
        const { x, y } = draggedItemInfo.currentPos;
        if (isPointInCard(worldX, worldY, x, y)) {
          const cardIndex = cards.findIndex((c) => c.id === draggedItemInfo.id);
          return cardIndex !== -1 ? cardIndex : null;
        }
      } else if (draggedItemInfo?.type === "deck") {
        const deckCards = cards.filter(
          (c) => c.backendDeckId === draggedItemInfo.id
        );
        const { x: deckX, y: deckY } = draggedItemInfo.currentPos;

        for (let i = deckCards.length - 1; i >= 0; i--) {
          const cardX = deckX + i * 2;
          const cardY = deckY + i * 2;
          if (isPointInCard(worldX, worldY, cardX, cardY)) {
            const originalIndex = cards.findIndex(
              (c) => c.id === deckCards[i].id
            );
            return originalIndex !== -1 ? originalIndex : null;
          }
        }
      }

      for (let i = cards.length - 1; i >= 0; i--) {
        const card = cards[i];

        if (
          draggedItemInfo &&
          ((draggedItemInfo.type === "card" &&
            card.id === draggedItemInfo.id) ||
            (draggedItemInfo.type === "deck" &&
              card.backendDeckId === draggedItemInfo.id))
        ) {
          continue;
        }
        if (isPointInCard(worldX, worldY, card.x, card.y)) return i;
      }
      return null;
    },
    [cards, isPointInCard, draggedItemInfo]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const screenPos = { x: e.clientX, y: e.clientY };
    const worldPos = screenToWorld(screenPos.x, screenPos.y);
    const cardIndex = findCardAtPosition(worldPos.x, worldPos.y);

    cameraRef.current = cameraRef.current.resetInertia();

    if (cardIndex !== null) {
      if (onCardMouseDown) onCardMouseDown(cardIndex, worldPos, screenPos);
    } else {
      if (onBackgroundMouseDown) onBackgroundMouseDown(screenPos);
    }
    triggerRender();
  };

  const handleMouseMoveInternal = useCallback(
    (e: MouseEvent) => {
      if (dragState.mode === "none" && !draggedItemInfo) return;

      const screenPos = { x: e.clientX, y: e.clientY };
      const worldPos = screenToWorld(screenPos.x, screenPos.y);
      let cameraUpdated = false;

      if (dragState.mode === "panning") {
        const panInfo = dragState as PanInfo;
        const lastScreenPos = panInfo.startScreenPos;
        const dx = screenPos.x - lastScreenPos.x;
        const dy = screenPos.y - lastScreenPos.y;
        const zoom = cameraRef.current.zoom;
        if (dx !== 0 || dy !== 0) {
          cameraRef.current = cameraRef.current.translate({
            x: -dx / zoom,
            y: -dy / zoom,
          });
          panInfo.startScreenPos = screenPos;
          cameraUpdated = true;
        }
      }

      if (onCardMouseMove) {
        onCardMouseMove(worldPos.x, worldPos.y, screenPos.x, screenPos.y);
      }

      if (cameraUpdated && isComponentMounted.current) {
        triggerRender();
      }
    },
    [dragState, draggedItemInfo, screenToWorld, onCardMouseMove, triggerRender]
  );

  const handleMouseUpInternal = useCallback(() => {
    const hadInertiaBeforeReset = cameraRef.current.hasInertia();
    if (dragState.mode !== "none" || draggedItemInfo) {
      if (onCardMouseUp) onCardMouseUp();
    }

    if (dragState.mode === "panning" && hadInertiaBeforeReset) {
      triggerRender();
    }
  }, [dragState, draggedItemInfo, onCardMouseUp, triggerRender]);

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const screenPos = { x: e.clientX, y: e.clientY };
    const worldPos = screenToWorld(screenPos.x, screenPos.y);
    const cardIndex = findCardAtPosition(worldPos.x, worldPos.y);
    if (cardIndex !== null && onCardFlip) onCardFlip(cardIndex);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const now = Date.now();

    if (
      dragState.mode === "none" &&
      !draggedItemInfo &&
      now - lastClickTime > 300
    ) {
      const screenPos = { x: e.clientX, y: e.clientY };
      const worldPos = screenToWorld(screenPos.x, screenPos.y);
      const cardIndex = findCardAtPosition(worldPos.x, worldPos.y);
      if (cardIndex !== null) {
        if (onCardSelect) onCardSelect(cardIndex);
      } else {
        if (onDeselectCard) onDeselectCard();
      }
    }
    setLastClickTime(now);
  };

  const handleWheelInternal = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const zoomIntensity = 0.1;
      const mouseWorldPos = screenToWorld(e.clientX, e.clientY);
      const scale = e.deltaY < 0 ? 1 + zoomIntensity : 1 / (1 + zoomIntensity);
      cameraRef.current = cameraRef.current.zoomBy(scale, mouseWorldPos);

      if (isComponentMounted.current) {
        triggerRender();
      }
    },
    [screenToWorld, triggerRender]
  );

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;

    const wheelListener = (e: WheelEvent) => handleWheelInternal(e);
    canvasElement.addEventListener("wheel", wheelListener, { passive: false });
    window.addEventListener("mousemove", handleMouseMoveInternal);
    window.addEventListener("mouseup", handleMouseUpInternal);

    return () => {
      canvasElement.removeEventListener("wheel", wheelListener);
      window.removeEventListener("mousemove", handleMouseMoveInternal);
      window.removeEventListener("mouseup", handleMouseUpInternal);
    };
  }, [handleWheelInternal, handleMouseMoveInternal, handleMouseUpInternal]);

  const getCursorStyle = () => {
    if (
      dragState.mode === "panning" ||
      draggedItemInfo?.type === "deck" ||
      draggedItemInfo?.type === "card"
    ) {
      return "grabbing";
    }
    if (dragState.mode === "potential_deck_drag") {
      return "pointer";
    }
    return "grab";
  };

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      style={{
        display: "block",
        backgroundColor: "#1a202c",
        cursor: getCursorStyle(),
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={handleCanvasClick}
    />
  );
};

export default CardCanvas;
