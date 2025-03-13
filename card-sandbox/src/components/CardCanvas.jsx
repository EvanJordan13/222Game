import React, { useRef, useEffect, useState } from "react";
import { drawCard, drawTable } from "../utils/canvasUtils";

const CardCanvas = ({ cards }) => {
  const canvasRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

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
    drawTable(ctx, dimensions.width, dimensions.height);

    // Draw all cards
    cards.forEach((card) => {
      drawCard(ctx, card, card.x, card.y, card.faceUp !== false);
    });
  }, [cards, dimensions]);

  const handleCanvasClick = (e) => {
    // Get click coordinates relative to the canvas
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // This function will be used later to handle card interactions
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      onClick={handleCanvasClick}
    />
  );
};

export default CardCanvas;
