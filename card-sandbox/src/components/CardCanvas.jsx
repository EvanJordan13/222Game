import React, { useRef, useEffect, useState, useCallback } from "react";
import {
  drawCard,
  drawTable,
  CARD_WIDTH,
  CARD_HEIGHT,
} from "../utils/canvasUtils";

const CardCanvas = ({
  cards,
  onCardMove,
  onCardFlip,
  onCardSelect,
  onDeselectCard,
}) => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1, vx: 0, vy: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [selectedCardIndex, setSelectedCardIndex] = useState(null);
  const [lastClickTime, setLastClickTime] = useState(0);
  const [cardOffset, setCardOffset] = useState({ x: 0, y: 0 });
  const [isDraggingCard, setIsDraggingCard] = useState(false);

  // Update canvas dimensions when the window resizes
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // convert screen coordinates to world coordinates
  const screenToWorld = useCallback(
    (screenX, screenY) => {
      return {
        x: (screenX - dimensions.width / 2) / camera.zoom + camera.x,
        y: (screenY - dimensions.height / 2) / camera.zoom + camera.y,
      };
    },
    [dimensions, camera]
  );

  // Check if a point is inside a card
  const isPointInCard = useCallback((x, y, cardX, cardY) => {
    return (
      x >= cardX &&
      x <= cardX + CARD_WIDTH &&
      y >= cardY &&
      y <= cardY + CARD_HEIGHT
    );
  }, []);

  // Find the top card at a given position
  const findCardAtPosition = useCallback(
    (x, y) => {
      //go in reverse to check top cards first fi stacked
      for (let i = cards.length - 1; i >= 0; i--) {
        if (isPointInCard(x, y, cards[i].x, cards[i].y)) {
          return i;
        }
      }
      return null;
    },
    [cards, isPointInCard]
  );

  // Draw the canvas content
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const ctx = canvas.getContext("2d");

    // Clear the canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw table background
    drawTable(ctx, dimensions, camera);

    // Apply camera transformations
    ctx.save();
    ctx.translate(dimensions.width / 2, dimensions.height / 2);
    ctx.scale(camera.zoom, camera.zoom);
    ctx.translate(-camera.x, -camera.y);

    // Draw all cards
    cards.forEach((card, index) => {
      const isSelected = index === selectedCardIndex;
      drawCard(ctx, card, card.x, card.y, card.faceUp !== false, isSelected);
    });

    ctx.restore();
  }, [cards, dimensions, camera, selectedCardIndex]);

  const handleCanvasClick = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY);

    const cardIndex = findCardAtPosition(worldPos.x, worldPos.y);

    // Check for double click to flip card
    const now = Date.now();
    if (cardIndex !== null && now - lastClickTime < 300) {
      // Double clicked!
      if (onCardFlip) {
        onCardFlip(cardIndex);
      }
    }

    setLastClickTime(now);
  };

  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    const worldPos = screenToWorld(screenX, screenY);

    // Check if we clicked on a card
    const cardIndex = findCardAtPosition(worldPos.x, worldPos.y);

    if (cardIndex !== null) {
      // Clicked on a card
      setSelectedCardIndex(cardIndex);
      setIsDraggingCard(true);

      // set that there was a selection
      if (onCardSelect) {
        onCardSelect(cardIndex);
      }

      // Store the offset from the card  origin
      setCardOffset({
        x: worldPos.x - cards[cardIndex].x,
        y: worldPos.y - cards[cardIndex].y,
      });
    } else {
      // Clicked on the background so wepan the camera
      setDragging(true);
      dragStart.current = { x: e.clientX, y: e.clientY };
      setCamera((prev) => ({ ...prev, vx: 0, vy: 0 })); // Reset inertia

      // Deselect any selected card
      if (selectedCardIndex !== null) {
        setSelectedCardIndex(null);
        if (onDeselectCard) {
          onDeselectCard();
        }
      }
    }
  };

  const handleMouseMove = (e) => {
    if (!dragging && !isDraggingCard) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (isDraggingCard && selectedCardIndex !== null) {
      // Move the selected card
      const worldPos = screenToWorld(screenX, screenY);

      if (onCardMove) {
        onCardMove(
          selectedCardIndex,
          worldPos.x - cardOffset.x,
          worldPos.y - cardOffset.y
        );
      }
    } else if (dragging) {
      // Pan the camera
      const dx = e.clientX - dragStart.current.x;
      const dy = e.clientY - dragStart.current.y;
      setCamera((prev) => ({
        ...prev,
        x: prev.x - dx / camera.zoom,
        y: prev.y - dy / camera.zoom,
        vx: dx / camera.zoom,
        vy: dy / camera.zoom,
      }));
      dragStart.current = { x: e.clientX, y: e.clientY };
    }
  };

  const handleMouseUp = () => {
    setDragging(false);
    setIsDraggingCard(false);
  };

  const handleWheel = (e) => {
    const zoomIntensity = 0.1;
    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left) / camera.zoom + camera.x;
    const mouseY = (e.clientY - rect.top) / camera.zoom + camera.y;

    const newZoom =
      camera.zoom * (e.deltaY > 0 ? 1 - zoomIntensity : 1 + zoomIntensity);
    const clampedZoom = Math.max(0.5, Math.min(2, newZoom));

    setCamera((prev) => ({
      ...prev,
      zoom: clampedZoom,
      x: mouseX - (mouseX - prev.x) * (clampedZoom / prev.zoom),
      y: mouseY - (mouseY - prev.y) * (clampedZoom / prev.zoom),
    }));

    e.preventDefault();
  };

  const handleKeyDown = (e) => {
    const speed = 20 / camera.zoom;
    switch (e.key) {
      case "ArrowUp":
        setCamera((prev) => ({ ...prev, y: prev.y - speed }));
        break;
      case "ArrowDown":
        setCamera((prev) => ({ ...prev, y: prev.y + speed }));
        break;
      case "ArrowLeft":
        setCamera((prev) => ({ ...prev, x: prev.x - speed }));
        break;
      case "ArrowRight":
        setCamera((prev) => ({ ...prev, x: prev.x + speed }));
        break;
      default:
        break;
    }
  };

  // Inertia effect
  useEffect(() => {
    if (!dragging && (camera.vx !== 0 || camera.vy !== 0)) {
      const friction = 0.95;
      const animation = requestAnimationFrame(() => {
        setCamera((prev) => ({
          ...prev,
          x: prev.x - prev.vx,
          y: prev.y - prev.vy,
          vx: prev.vx * friction,
          vy: prev.vy * friction,
        }));
      });

      if (Math.abs(camera.vx) < 0.1 && Math.abs(camera.vy) < 0.1) {
        setCamera((prev) => ({ ...prev, vx: 0, vy: 0 }));
      }

      return () => cancelAnimationFrame(animation);
    }
  }, [camera, dragging]);

  useEffect(() => {
    window.addEventListener("wheel", handleWheel);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [
    camera,
    dragging,
    isDraggingCard,
    selectedCardIndex,
    cards,
    screenToWorld,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      style={{
        display: "block",
        backgroundColor: "#1a202c",
      }}
      onClick={handleCanvasClick}
      onMouseDown={handleMouseDown}
    />
  );
};

export default CardCanvas;
