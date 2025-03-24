const CARD_WIDTH = 120;
const CARD_HEIGHT = 168;
const CARD_RADIUS = 8;

const TABLE_GRID_SIZE = 40;
const TABLE_MAX_GRIDPOINTS = 3000;

interface Dimensions {
    width: number;
    height: number;
}

interface Card {
    suit: string;
    rank: string;
}

// Draw the table background
export const drawTable = (
    ctx: CanvasRenderingContext2D,
    dimensions: Dimensions,
): void => {
    const { width, height } = dimensions;

    ctx.save();
    ctx.resetTransform();
    ctx.fillStyle = "#076324";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    const worldToScreen = ctx.getTransform();
    const screenToWorld = worldToScreen.inverse();
    const topLeft = screenToWorld.transformPoint(new DOMPoint(0, 0));
    const bottomRight = screenToWorld.transformPoint(new DOMPoint(width, height));

    // predict how many grid points will be rendered because we do not want to render too many
    let points_pred = (bottomRight.x - topLeft.x) / TABLE_GRID_SIZE * (topLeft.y - bottomRight.y) / TABLE_GRID_SIZE;
    let dots = 0;
    if (points_pred <= TABLE_MAX_GRIDPOINTS) {
        ctx.fillStyle = "#0a7c2e";
        for (let x = Math.ceil(topLeft.x / TABLE_GRID_SIZE); x * TABLE_GRID_SIZE < bottomRight.x; ++x) {
            for (let y = Math.floor(topLeft.y / TABLE_GRID_SIZE); y * TABLE_GRID_SIZE >= bottomRight.y; --y) {
                ctx.beginPath();
                ctx.arc(x * TABLE_GRID_SIZE, y * TABLE_GRID_SIZE, 1, 0, Math.PI * 2);
                ctx.fill();
                ++dots;
            }
        }
    }

    //console.log("dots rendered: ", dots);
    console.log("pred rendered: ", points_pred);

    ctx.save();
    ctx.resetTransform();
    ctx.strokeStyle = "#8B4513";
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, width - 12, height - 12);
    ctx.restore();
};

// Draw a single card
export const drawCard = (
    ctx: CanvasRenderingContext2D,
    card: Card | null,
    x: number,
    y: number,
    faceUp: boolean = true,
    selected: boolean = false,
): void => {

    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1.0, -1.0)
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.beginPath();
    roundedRect(ctx, 3, 3, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
    ctx.fill();

    ctx.fillStyle = faceUp ? "#FFF" : "#1E40AF";
    ctx.beginPath();
    roundedRect(ctx, 0, 0, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
    ctx.fill();

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.stroke();

    if (faceUp && card) {
        const { suit, rank } = card;
        const color = ["hearts", "diamonds"].includes(suit) ? "#E53E3E" : "#1A202C";

        ctx.fillStyle = color;
        ctx.font = "24px Arial";
        ctx.textAlign = "left";
        ctx.fillText(getShortRank(rank), 8, 28);

        ctx.font = "20px Arial";
        ctx.fillText(getSuitSymbol(suit), 8, 50);

        ctx.font = "48px Arial";
        ctx.textAlign = "center";
        ctx.fillText(
            getSuitSymbol(suit),
            CARD_WIDTH / 2,
            CARD_HEIGHT / 2 + 10,
        );

        ctx.font = "24px Arial";
        ctx.textAlign = "right";
        ctx.fillText(getShortRank(rank), CARD_WIDTH - 8, CARD_HEIGHT - 16);
        ctx.font = "20px Arial";
        ctx.fillText(getSuitSymbol(suit), CARD_WIDTH - 8, CARD_HEIGHT - 38);
    } else {
        drawCardBackPattern(ctx, 0, 0);
    }


    ctx.restore();
};

// Draw card back pattern
const drawCardBackPattern = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
): void => {
    ctx.fillStyle = "#0F52BA";

    const patternSize = 12;
    for (let i = 0; i < CARD_WIDTH - 16; i += patternSize) {
        for (let j = 0; j < CARD_HEIGHT - 16; j += patternSize) {
            if ((i + j) % (patternSize * 2) === 0) {
                ctx.fillRect(x + 8 + i, y + 8 + j, patternSize, patternSize);
            }
        }
    }

    ctx.strokeStyle = "#FFF";
    ctx.lineWidth = 2;
    roundedRect(ctx, x + 8, y + 8, CARD_WIDTH - 16, CARD_HEIGHT - 16, 5);
    ctx.stroke();
};

// Helper function to draw rounded rectangles
export const roundedRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
): void => {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
};

// Helper function to get suit symbols
export const getSuitSymbol = (suit: string): string => {
    const symbols: Record<string, string> = {
        hearts: "♥",
        diamonds: "♦",
        clubs: "♣",
        spades: "♠",
    };
    return symbols[suit] || suit;
};

// Helper function to get short ranks
export const getShortRank = (rank: string): string => {
    const ranks: Record<string, string> = {
        ace: "A",
        king: "K",
        queen: "Q",
        jack: "J",
        "10": "10",
    };
    return ranks[rank] || rank;
};

// Draw a deck of cards
export const drawDeck = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    count: number,
    faceUp: boolean = false,
): void => {
    for (let i = 0; i < count; i++) {
        drawCard(ctx, null, x + i * 0.5, y + i * 0.7, faceUp);
    }
};
