import React, { useRef, useEffect, useState } from "react";
import { drawCard, drawTable } from "../utils/canvasUtils";
import { vecAdd, vecSub } from "../utils/math";
import Camera from "../utils/camera";

interface Card {
    x: number;
    y: number;
    suit: string;
    rank: string;
    faceUp?: boolean;
}

interface CardCanvasProps {
    cards: Card[];
}

const CardCanvas: React.FC<CardCanvasProps> = ({ cards }) => {
    const dragStartRef = useRef<{ x: number; y: number } | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const [dimensions, setDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    const [camera, setCamera] = useState(new Camera(0.0, 0.0, 0.0, 0.0, 1.0));

    const dimRef = useRef(dimensions);
    useEffect(() => {
        dimRef.current = dimensions;
    }, [dimensions]);
    const camRef = useRef(camera);
    useEffect(() => {
        camRef.current = camera;
    }, [camera]);

    // Inertia effect
    useEffect(() => {
        console.log(camera);
        if (!dragStartRef.current && (camera.vx !== 0 || camera.vy !== 0)) {
            const animation = requestAnimationFrame(() => {
                setCamera((prev) => prev.updateInertia());
            });
            return () => cancelAnimationFrame(animation);
        }
    }, [camera]);

    // paint
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = dimensions.width;
        canvas.height = dimensions.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.clearRect(0, 0, dimensions.width, dimensions.height);
        ctx.save();

        ctx.setTransform(camera.worldToScreen(dimensions));
        drawTable(ctx, dimensions);

        cards.forEach((card) => {
            drawCard(ctx, card, card.x, card.y, card.faceUp !== false);
        });

        ctx.restore();
    }, [cards, dimensions, camera]);

    const handleResize = () => {
        setDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    };

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
        const speed = 20 / camera.zoom;
        switch (e.key) {
            case "ArrowUp":
                setCamera((prev) =>
                    prev.updatePosition({ x: prev.x, y: prev.y + speed }),
                );
                break;
            case "ArrowDown":
                setCamera((prev) =>
                    prev.updatePosition({ x: prev.x, y: prev.y - speed }),
                );
                break;
            case "ArrowLeft":
                setCamera((prev) =>
                    prev.updatePosition({ x: prev.x - speed, y: prev.y }),
                );
                break;
            case "ArrowRight":
                setCamera((prev) =>
                    prev.updatePosition({ x: prev.x + speed, y: prev.y }),
                );
                break;
            case "i":
                setCamera((prev) => prev.zoomBy(1.111112));
                break;
            case "o":
                setCamera((prev) => prev.zoomBy(0.9));
                break;
            default:
                break;
        }
    };

    const handleMouseDown = (e: MouseEvent) => {
        const dimensions = dimRef.current;
        const camera = camRef.current;
        dragStartRef.current = camera.screenToWorld(dimensions).transformPoint(e);
        setCamera((prev) => prev.resetInertia()); // Reset inertia
    };

    const handleMouseUp = () => {
        dragStartRef.current = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!dragStartRef.current) return;
        const dragPos = dragStartRef.current;

        const dimensions = dimRef.current;
        const camera = camRef.current;
        const currentPos = camera.screenToWorld(dimensions).transformPoint(e);

        console.log(vecSub(currentPos, dragPos));

        setCamera((prev) => prev.translate(vecSub(dragPos, currentPos)));
    };

    // attach handlers
    useEffect(() => {
        window.addEventListener("resize", handleResize);
        window.addEventListener("wheel", handleWheel);
        window.addEventListener("mouseup", handleMouseUp);
        window.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("resize", handleResize);
            window.removeEventListener("wheel", handleWheel);
            window.removeEventListener("mouseup", handleMouseUp);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    return <canvas ref={canvasRef} className="w-full h-full block" />;
};

export default CardCanvas;
