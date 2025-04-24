/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  drawCard,
  drawTable,
  CARD_WIDTH,
  CARD_HEIGHT,
} from "../utils/canvasUtils";

interface Card {
  id: string;
  x: number;
  y: number;
  faceUp?: boolean;
  suit: string;
  rank: string;
  backendDeckId?: string;
  backendIndex?: number;
}

interface CardCanvasProps {
  cards: Card[];
  onCardMouseDown?: (
    index: number,
    worldPos: Position,
    screenPos: Position
  ) => void;
  onCardMouseMove?: (worldX: number, worldY: number) => void;
  onCardMouseUp?: () => void;
  onCardFlip?: (index: number) => void;
  onCardSelect?: (index: number) => void;
  onDeselectCard?: () => void;
  selectedCardIndex: number | null;
}

interface Dimensions {
  width: number;
  height: number;
}

interface Camera {
  x: number;
  y: number;
  zoom: number;
  vx: number;
  vy: number;
}

interface Position {
  x: number;
  y: number;
}

const CardCanvas: React.FC<CardCanvasProps> = ({
  cards,
  onCardMouseDown,
  onCardMouseMove,
  onCardMouseUp,
  onCardFlip,
  onCardSelect,
  onDeselectCard,
  selectedCardIndex,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [camera, setCamera] = useState<Camera>({
    x: 0,
    y: 0,
    zoom: 1,
    vx: 0,
    vy: 0,
  });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [isDraggingCard, setIsDraggingCard] = useState<boolean>(false);
  const panStart = useRef<Position>({ x: 0, y: 0 });
  const [lastClickTime, setLastClickTime] = useState<number>(0);

  useEffect(() => {
    const handleResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    if (
      !camera ||
      typeof camera.x !== "number" ||
      typeof camera.y !== "number"
    ) {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      ctx.fillStyle = "#333";
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);
      return;
    }

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    try {
      drawTable(ctx, dimensions, camera);
    } catch (error) {
      console.error("Error drawing table:", error);
    }

    ctx.save();
    ctx.translate(dimensions.width / 2, dimensions.height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    cards.forEach((card, index) => {
      const isSelected = index === selectedCardIndex;
      drawCard(ctx, card, card.x, card.y, card.faceUp !== false, isSelected);
    });

    ctx.restore();
  }, [cards, dimensions, camera, selectedCardIndex]);

  useEffect(() => {
    let animationFrameId: number;
    if (!isPanning && (camera.vx !== 0 || camera.vy !== 0)) {
      const friction = 0.9;
      const minVelocity = 0.1;
      const updateInertia = () => {
        const nextVx = camera.vx * friction;
        const nextVy = camera.vy * friction;
        if (Math.abs(nextVx) < minVelocity && Math.abs(nextVy) < minVelocity) {
          setCamera((prev) => ({ ...prev, vx: 0, vy: 0 }));
        } else {
          setCamera((prev) => ({
            ...prev,
            x: prev.x - nextVx / prev.zoom,
            y: prev.y - nextVy / prev.zoom,
            vx: nextVx,
            vy: nextVy,
          }));
          animationFrameId = requestAnimationFrame(updateInertia);
        }
      };
      animationFrameId = requestAnimationFrame(updateInertia);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [camera.vx, camera.vy, isPanning, camera.zoom]);

  const screenToWorld = useCallback(
    (screenX: number, screenY: number): Position => {
      const rect = canvasRef.current?.getBoundingClientRect() ?? {
        left: 0,
        top: 0,
      };
      const canvasX = screenX - rect.left;
      const canvasY = screenY - rect.top;
      if (!camera) return { x: 0, y: 0 };
      return {
        x: (canvasX - dimensions.width / 2) / camera.zoom + camera.x,
        y: (canvasY - dimensions.height / 2) / camera.zoom + camera.y,
      };
    },
    [dimensions, camera]
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
      for (let i = cards.length - 1; i >= 0; i--) {
        if (isPointInCard(worldX, worldY, cards[i].x, cards[i].y)) return i;
      }
      return null;
    },
    [cards, isPointInCard]
  );

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const screenPos = { x: e.clientX, y: e.clientY };
    const worldPos = screenToWorld(screenPos.x, screenPos.y);
    const cardIndex = findCardAtPosition(worldPos.x, worldPos.y);

    if (cardIndex !== null) {
      setIsDraggingCard(true);
      setIsPanning(false);
      if (onCardMouseDown) onCardMouseDown(cardIndex, worldPos, screenPos);
    } else {
      setIsPanning(true);
      setIsDraggingCard(false);
      panStart.current = screenPos;
      setCamera((prev) => ({ ...prev, vx: 0, vy: 0 }));
      if (selectedCardIndex !== null && onDeselectCard) onDeselectCard();
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const screenPos = { x: e.clientX, y: e.clientY };
      const worldPos = screenToWorld(screenPos.x, screenPos.y);
      if (isDraggingCard) {
        if (onCardMouseMove) onCardMouseMove(worldPos.x, worldPos.y);
      } else if (isPanning) {
        const dx = screenPos.x - panStart.current.x;
        const dy = screenPos.y - panStart.current.y;
        setCamera((prev) => ({
          ...prev,
          x: prev.x - dx / prev.zoom,
          y: prev.y - dy / prev.zoom,
          vx: dx,
          vy: dy,
        }));
        panStart.current = screenPos;
      }
    },
    [isDraggingCard, isPanning, camera?.zoom, screenToWorld, onCardMouseMove]
  );

  const handleMouseUp = useCallback(() => {
    if (isDraggingCard) {
      if (onCardMouseUp) onCardMouseUp();
    }
    setIsDraggingCard(false);
    setIsPanning(false);
  }, [isDraggingCard, onCardMouseUp]);

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const screenPos = { x: e.clientX, y: e.clientY };
    const worldPos = screenToWorld(screenPos.x, screenPos.y);
    const cardIndex = findCardAtPosition(worldPos.x, worldPos.y);
    if (cardIndex !== null && onCardFlip) onCardFlip(cardIndex);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const now = Date.now();
    if (!isDraggingCard && !isPanning && now - lastClickTime > 300) {
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

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const zoomIntensity = 0.1;
    const rect = canvasRef.current?.getBoundingClientRect() ?? {
      left: 0,
      top: 0,
      width: dimensions.width,
      height: dimensions.height,
    };
    const mouseCanvasX = e.clientX - rect.left;
    const mouseCanvasY = e.clientY - rect.top;
    if (!camera) return;
    const worldXBeforeZoom =
      (mouseCanvasX - dimensions.width / 2) / camera.zoom + camera.x;
    const worldYBeforeZoom =
      (mouseCanvasY - dimensions.height / 2) / camera.zoom + camera.y;
    const scale = e.deltaY < 0 ? 1 + zoomIntensity : 1 - zoomIntensity;
    const newZoom = Math.max(0.2, Math.min(3, camera.zoom * scale));
    const newCameraX =
      worldXBeforeZoom - (mouseCanvasX - dimensions.width / 2) / newZoom;
    const newCameraY =
      worldYBeforeZoom - (mouseCanvasY - dimensions.height / 2) / newZoom;
    setCamera((prev) => ({
      ...prev,
      zoom: newZoom,
      x: newCameraX,
      y: newCameraY,
      vx: 0,
      vy: 0,
    }));
  };

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) return;
    canvasElement.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      canvasElement.removeEventListener("wheel", handleWheel);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleWheel, handleMouseMove, handleMouseUp]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      style={{
        display: "block",
        backgroundColor: "#1a202c",
        cursor: isPanning ? "grabbing" : isDraggingCard ? "grabbing" : "grab",
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onClick={handleCanvasClick}
    />
  );
};

export default CardCanvas;
