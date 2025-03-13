// Card dimensions and constants
const CARD_WIDTH = 120;
const CARD_HEIGHT = 168;
const CARD_RADIUS = 8;


// Table surface constants
const TABLE_GRID_SIZE = 40

// Draw the table background
export const drawTable = (ctx, dimensions, camera) => {
  let width = dimensions.width;
  let height = dimensions.height;
  // Table background
  ctx.fillStyle = "#076324"; // Dark green for the table
  ctx.fillRect(0, 0, width, height);


  // Table pattern oooo
  ctx.fillStyle = "#0a7c2e"; // lighter green

  ctx.save();
  ctx.translate(-camera.x % TABLE_GRID_SIZE, -camera.y % TABLE_GRID_SIZE);
  // Draw pattern
  for (let x = 20; x < width; x += 40) {
    for (let y = 20; y < height; y += 40) {
      ctx.beginPath();
      ctx.arc(x, y, 1, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();

  // Table border
  ctx.strokeStyle = "#8B4513"; // Brown border
  ctx.lineWidth = 12;
  ctx.strokeRect(6, 6, width - 12, height - 12);
};

// Draw a single card
export const drawCard = (ctx, card, x, y, faceUp = true, selected = false) => {
  // Card shadow
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.beginPath();
  roundedRect(ctx, x + 3, y + 3, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  ctx.fill();

  // Card background
  ctx.fillStyle = faceUp ? "#FFF" : "#1E40AF"; // White if face up, blue if face down
  ctx.beginPath();
  roundedRect(ctx, x, y, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS);
  ctx.fill();

  // Card border

  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  ctx.stroke();

  // If the card is face up, draw its contents
  if (faceUp && card) {
    const { suit, rank } = card;
    const color =
      suit === "hearts" || suit === "diamonds" ? "#E53E3E" : "#1A202C";

    // Draw the rank and suit in the corners
    ctx.fillStyle = color;
    ctx.font = "24px Arial";
    ctx.textAlign = "left";
    ctx.fillText(getShortRank(rank), x + 8, y + 28);

    // Draw the suit symbol
    ctx.font = "20px Arial";
    ctx.fillText(getSuitSymbol(suit), x + 8, y + 50);

    // Draw the center symbol
    ctx.font = "48px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      getSuitSymbol(suit),
      x + CARD_WIDTH / 2,
      y + CARD_HEIGHT / 2 + 10
    );

    // Bottom corner (inverted)
    ctx.font = "24px Arial";
    ctx.textAlign = "right";
    ctx.fillText(getShortRank(rank), x + CARD_WIDTH - 8, y + CARD_HEIGHT - 16);
    ctx.font = "20px Arial";
    ctx.fillText(getSuitSymbol(suit), x + CARD_WIDTH - 8, y + CARD_HEIGHT - 38);
  } else {
    // Draw card back pattern
    drawCardBackPattern(ctx, x, y);
  }
};

// Draw card back pattern
const drawCardBackPattern = (ctx, x, y) => {
  ctx.fillStyle = "#0F52BA"; // Darker blue

  // Draw pattern for the card back
  const patternSize = 12;
  for (let i = 0; i < CARD_WIDTH - 16; i += patternSize) {
    for (let j = 0; j < CARD_HEIGHT - 16; j += patternSize) {
      if ((i + j) % (patternSize * 2) === 0) {
        ctx.fillRect(x + 8 + i, y + 8 + j, patternSize, patternSize);
      }
    }
  }

  // Draw a border around the card back
  ctx.strokeStyle = "#FFF";
  ctx.lineWidth = 2;
  roundedRect(ctx, x + 8, y + 8, CARD_WIDTH - 16, CARD_HEIGHT - 16, 5);
  ctx.stroke();
};

// Helper function to draw rounded rectangles :skull:
export const roundedRect = (ctx, x, y, width, height, radius) => {
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

// Helper function to get suit symbols oooo aaaa
export const getSuitSymbol = (suit) => {
  switch (suit) {
    case "hearts":
      return "♥";
    case "diamonds":
      return "♦";
    case "clubs":
      return "♣";
    case "spades":
      return "♠";
    default:
      return suit;
  }
};

// Helper function to get short ranks
export const getShortRank = (rank) => {
  switch (rank) {
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
      return rank;
  }
};

// Draw a deck of cards
export const drawDeck = (ctx, x, y, count, faceUp = false) => {
  // Draw from back to front
  for (let i = 0; i < count; i++) {
    const offsetX = i * 0.5;
    const offsetY = i * 0.7;
    drawCard(ctx, null, x + offsetX, y + offsetY, faceUp);
  }
};
