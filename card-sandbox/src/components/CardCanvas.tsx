import React, { useRef, useEffect, useState } from "react";
import { drawCard, drawTable } from "../utils/canvasUtils";

// Define Card type
interface Card {
    x: number;
    y: number;
    suit: string;
    rank: string;
    faceUp?: boolean;
}

// Props type for CardCanvas
interface CardCanvasProps {
    cards: Card[];
}

// Camera state type
interface CameraState {
    x: number;
    y: number;
    zoom: number;
    vx: number;
    vy: number;
}

const CardCanvas: React.FC<CardCanvasProps> = ({ cards }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const [dragging, setDragging] = useState(false);
    const dragStart = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
        window.addEventListener("wheel", handleWheel);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        return () => {
            window.removeEventListener("wheel", handleWheel);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

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
        if (!ctx) return;

        // Clear the canvas
        ctx.clearRect(0, 0, dimensions.width, dimensions.height);

        // Draw table background
        drawTable(ctx, dimensions);

        // Apply camera transformations
        ctx.save();

        // Draw all cards
        cards.forEach((card) => {
            drawCard(ctx, card, card.x, card.y, card.faceUp !== false);
        });

        ctx.restore();
    }, [cards, dimensions]);

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
    };

    const handleMouseDown = (e: MouseEvent) => {
        setDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
        //setCamera((prev) => ({ ...prev, vx: 0, vy: 0 })); // Reset inertia
    };

    const handleMouseMove = (e: MouseEvent) => {
        console.log("mouse moved");
        if (!dragging) return;
        //const dx = e.clientX - dragStart.current.x;
        //const dy = e.clientY - dragStart.current.y;
        //setCamera((prev) => ({
        //    ...prev,
        //    x: prev.x - dx,
        //    y: prev.y - dy,
        //    vx: dx,
        //    vy: dy,
        //}));
        //dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => setDragging(false);

    // Inertia effect
    useEffect(() => {
        //if (!dragging && (camera.vx !== 0 || camera.vy !== 0)) {
            //const friction = 0.95;
            //const animation = requestAnimationFrame(() => {
            //    setCamera((prev) => ({
            //        ...prev,
            //        x: prev.x - prev.vx,
            //        y: prev.y - prev.vy,
            //        vx: prev.vx * friction,
            //        vy: prev.vy * friction,
            //    }));
            //});

            //if (Math.abs(camera.vx) < 0.1 && Math.abs(camera.vy) < 0.1) {
            //    setCamera((prev) => ({ ...prev, vx: 0, vy: 0 }));
            //}

            //return () => cancelAnimationFrame(animation);
        //}
    }, [dragging]);

    return <canvas ref={canvasRef} className="w-full h-full block" />;
};

export default CardCanvas;
