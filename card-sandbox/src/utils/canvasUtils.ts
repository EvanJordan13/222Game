import Camera from "./camera";
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

export const CARD_WIDTH: number = 120;
export const CARD_HEIGHT: number = 168;
export const CARD_RADIUS: number = 8;
const TABLE_GRID_SIZE: number = 40;

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

export const drawTable = (
  ctx: CanvasRenderingContext2D,
  dimensions: Dimensions,
  camera: Camera
): void => {
  if (!ctx || !dimensions || !camera) {
    console.error("drawTable called with invalid arguments", {
      ctx,
      dimensions,
      camera,
    });
    return;
  }

  const { width, height } = dimensions;
  const { x: camX, y: camY } = camera.position;
  const camZoom = camera.zoom;

  ctx.fillStyle = "#076324";
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  const worldToScreenMat = camera.worldToScreen(dimensions);
  ctx.setTransform(
    worldToScreenMat.a,
    worldToScreenMat.b,
    worldToScreenMat.c,
    worldToScreenMat.d,
    worldToScreenMat.e,
    worldToScreenMat.f
  );

  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  const viewPortWidthWorld = width / camZoom;
  const viewPortHeightWorld = height / camZoom;
  const startX =
    Math.floor((camX - viewPortWidthWorld / 2) / TABLE_GRID_SIZE) *
    TABLE_GRID_SIZE;
  const startY =
    Math.floor((camY - viewPortHeightWorld / 2) / TABLE_GRID_SIZE) *
    TABLE_GRID_SIZE;
  const endX =
    Math.ceil((camX + viewPortWidthWorld / 2) / TABLE_GRID_SIZE) *
    TABLE_GRID_SIZE;
  const endY =
    Math.ceil((camY + viewPortHeightWorld / 2) / TABLE_GRID_SIZE) *
    TABLE_GRID_SIZE;

  for (let gx = startX; gx < endX; gx += TABLE_GRID_SIZE) {
    for (let gy = startY; gy < endY; gy += TABLE_GRID_SIZE) {
      ctx.beginPath();
      ctx.arc(
        gx + TABLE_GRID_SIZE / 2,
        gy + TABLE_GRID_SIZE / 2,
        1 / camZoom,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  ctx.restore();

  ctx.strokeStyle = "#8B4513";
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, width - 12, height - 12);
};

const drawCardBackPattern = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number
): void => {
  ctx.save();
  const inset = 8;
  const patternAreaX = x + inset;
  const patternAreaY = y + inset;
  const patternAreaWidth = CARD_WIDTH - 2 * inset;
  const patternAreaHeight = CARD_HEIGHT - 2 * inset;

  roundedRect(
    ctx,
    patternAreaX,
    patternAreaY,
    patternAreaWidth,
    patternAreaHeight,
    CARD_RADIUS - inset > 0 ? CARD_RADIUS - inset : 0
  );
  ctx.clip();

  ctx.fillStyle = "#0F52BA";
  const patternSize = 12;
  for (let i = 0; i < patternAreaWidth + patternSize; i += patternSize) {
    for (let j = 0; j < patternAreaHeight + patternSize; j += patternSize) {
      if (((i / patternSize) ^ (j / patternSize)) & 1) {
        ctx.fillRect(
          patternAreaX + i - patternSize / 2,
          patternAreaY + j - patternSize / 2,
          patternSize,
          patternSize
        );
      }
    }
  }

  ctx.restore();

  ctx.strokeStyle = "#FFF";
  ctx.lineWidth = 2;
  roundedRect(
    ctx,
    patternAreaX,
    patternAreaY,
    patternAreaWidth,
    patternAreaHeight,
    CARD_RADIUS - inset > 0 ? CARD_RADIUS - inset : 0
  );
  ctx.stroke();
};

export const getSuitSymbol = (suit: string): string => {
  switch (suit?.toLowerCase()) {
    case "hearts":
      return "♥";
    case "diamonds":
      return "♦";
    case "clubs":
      return "♣";
    case "spades":
      return "♠";
    default:
      return "?";
  }
};

export const getShortRank = (rank: string): string => {
  switch (rank?.toLowerCase()) {
    case "ace":
      return "A";
    case "king":
      return "K";
    case "queen":
      return "Q";
    case "jack":
      return "J";
    case "10":
      return "10";
    default:
      return rank?.toUpperCase() || "?";
  }
};

export const drawCard = (
  ctx: CanvasRenderingContext2D,
  card: Card | null,
  x: number,
  y: number,
  faceUp: boolean = true,
  selected: boolean = false,
  deckSelected: boolean = false
): void => {
  ctx.save();
  ctx.shadowColor = deckSelected
    ? "rgba(0, 150, 255, 0.7)"
    : "rgba(0, 0, 0, 0.3)";
  ctx.shadowBlur = selected ? 15 : deckSelected ? 12 : 5;
  ctx.shadowOffsetX = selected || deckSelected ? 4 : 3;
  ctx.shadowOffsetY = selected || deckSelected ? 4 : 3;

  roundedRect(ctx, x, y, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);

  ctx.fillStyle = faceUp ? "#FFF" : "#1E40AF";
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  ctx.strokeStyle = selected ? "#FFD700" : deckSelected ? "#0096FF" : "#333";
  ctx.lineWidth = selected ? 4 : deckSelected ? 3 : 1;
  ctx.stroke();

  if (faceUp && card) {
    const suitSymbol = getSuitSymbol(card.suit);
    const shortRank = getShortRank(card.rank);
    const color = ["hearts", "diamonds"].includes(card.suit?.toLowerCase())
      ? "#E53E3E"
      : "#1A202C";
    ctx.fillStyle = color;
    const cornerFontSize = 24;
    const centerFontSize = 48;

    ctx.font = `bold ${cornerFontSize}px Arial`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(shortRank, x + 8, y + 8);
    ctx.font = `${cornerFontSize * 0.8}px Arial`;
    ctx.fillText(suitSymbol, x + 10, y + 8 + cornerFontSize + 2);

    ctx.save();
    ctx.translate(x + CARD_WIDTH, y + CARD_HEIGHT);
    ctx.rotate(Math.PI);
    ctx.font = `bold ${cornerFontSize}px Arial`;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillText(shortRank, 8, 8);
    ctx.font = `${cornerFontSize * 0.8}px Arial`;
    ctx.fillText(suitSymbol, 10, 8 + cornerFontSize + 2);
    ctx.restore();

    if (["K", "Q", "J", "A"].includes(shortRank)) {
      ctx.font = `${centerFontSize}px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(suitSymbol, x + CARD_WIDTH / 2, y + CARD_HEIGHT / 2);
    }
  } else if (!faceUp) {
    drawCardBackPattern(ctx, x, y);
  }

  ctx.restore();
};

export const drawDeck = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  count: number,
  faceUp: boolean = false,
  deckSelected: boolean = false
): void => {
  if (count <= 0) return;
  const maxVisibleCards = 10;
  const drawCount = Math.min(count, maxVisibleCards);
  const stepOffset = 2;

  for (let i = 0; i < drawCount; i++) {
    const offsetX = (drawCount - 1 - i) * stepOffset;
    const offsetY = (drawCount - 1 - i) * stepOffset;
    const isTopCard = i === drawCount - 1;
    drawCard(
      ctx,
      null,
      x + offsetX,
      y + offsetY,
      isTopCard ? faceUp : false,
      false,
      deckSelected
    );
  }
};
