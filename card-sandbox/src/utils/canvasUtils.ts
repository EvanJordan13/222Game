// Card dimensions and constants
const CARD_WIDTH = 120;
const CARD_HEIGHT = 168;
const CARD_RADIUS = 8;

// Table surface constants
const TABLE_GRID_SIZE = 40;

// Card and dimension types
interface Dimensions {
  width: number;
  height: number;
}

interface Card {
  suit: string;
  rank: string;
}

interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

// Draw the table background
export const drawTable = (
  ctx: CanvasRenderingContext2D,
  dimensions: Dimensions,
): void => {
  const { width, height } = dimensions;
  ctx.fillStyle = "#076324";
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = "#0a7c2e";
  ctx.save();
  //ctx.translate(-camera.x % TABLE_GRID_SIZE, -camera.y % TABLE_GRID_SIZE);
  for (let x = 20; x < width; x += 40) {
    for (let y = 20; y < height; y += 40) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  ctx.strokeStyle = "#8B4513";
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, width - 12, height - 12);
};

// Draw a single card
export const drawCard = (
  ctx: CanvasRenderingContext2D,
  card: Card | null,
  x: number,
  y: number,
  faceUp: boolean = true,
  selected: boolean = false
): void => {
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  roundedRect(ctx, x + 3, y + 3, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  ctx.fill();

  ctx.fillStyle = faceUp ? "#FFF" : "#1E40AF";
  ctx.beginPath();
  roundedRect(ctx, x, y, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
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
    ctx.fillText(getShortRank(rank), x + 8, y + 28);

    ctx.font = "20px Arial";
    ctx.fillText(getSuitSymbol(suit), x + 8, y + 50);

    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(getSuitSymbol(suit), x + CARD_WIDTH / 2, y + CARD_HEIGHT / 2 + 10);

    ctx.font = "24px Arial";
    ctx.textAlign = "right";
    ctx.fillText(getShortRank(rank), x + CARD_WIDTH - 8, y + CARD_HEIGHT - 16);
    ctx.font = "20px Arial";
    ctx.fillText(getSuitSymbol(suit), x + CARD_WIDTH - 8, y + CARD_HEIGHT - 38);
  } else {
    drawCardBackPattern(ctx, x, y);
  }
};

// Draw card back pattern
const drawCardBackPattern = (ctx: CanvasRenderingContext2D, x: number, y: number): void => {
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
  radius: number
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
  faceUp: boolean = false
): void => {
  for (let i = 0; i < count; i++) {
    drawCard(ctx, null, x + i * 0.5, y + i * 0.7, faceUp);
  }
};

