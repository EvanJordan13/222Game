/* eslint-disable testing-library/no-container */
/* eslint-disable testing-library/no-node-access */
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import GameHUD from "./GameHUD";

describe("GameHUD Component", () => {
  // Mock card data
  const mockCards = [
    { id: "card-1", suit: "hearts", rank: "ace", x: 100, y: 150, faceUp: true },
    {
      id: "card-2",
      suit: "diamonds",
      rank: "king",
      x: 200,
      y: 250,
      faceUp: false,
    },
    { id: "card-3", suit: "clubs", rank: "10", x: 300, y: 350, faceUp: true },
    {
      id: "card-4",
      suit: "spades",
      rank: "queen",
      x: 400,
      y: 450,
      faceUp: false,
    },
  ];

  // Basic rendering test
  test("renders without crashing", () => {
    render(<GameHUD cards={mockCards} selectedCardIndex={null} />);

    expect(screen.getByText("Cards")).toBeInTheDocument();
    expect(screen.getByText("Face Up")).toBeInTheDocument();
    expect(screen.getByText("Face Down")).toBeInTheDocument();
  });

  // Test card counting display
  test("displays correct card counts", () => {
    render(<GameHUD cards={mockCards} selectedCardIndex={null} />);

    expect(screen.getByText("4")).toBeInTheDocument();

    const faceUpLabel = screen.getByText("Face Up");
    const faceUpCount = faceUpLabel.parentElement.querySelector(
      ".MuiTypography-body1"
    );
    expect(faceUpCount).toHaveTextContent("2");

    const faceDownLabel = screen.getByText("Face Down");
    const faceDownCount = faceDownLabel.parentElement.querySelector(
      ".MuiTypography-body1"
    );
    expect(faceDownCount).toHaveTextContent("2");
  });

  // Test with no cards
  test("handles empty cards array", () => {
    render(<GameHUD cards={[]} selectedCardIndex={null} />);

    const counts = screen.getAllByText("0");
    expect(counts.length).toBe(3);
  });

  // Test with a selected card
  test("displays selected card information", () => {
    const { container } = render(
      <GameHUD cards={mockCards} selectedCardIndex={0} />
    );

    //selected card info should be visible
    expect(screen.getByText("Selected:")).toBeInTheDocument();
    expect(screen.getByText("Ace of Hearts")).toBeInTheDocument();

    // Check for face up
    const chipLabel = container.querySelector(".MuiChip-label");
    expect(chipLabel).toHaveTextContent("Face Up");

    // Position infoo
    expect(screen.getByText(/Position: X: 100, Y: 150/)).toBeInTheDocument();
  });

  // Test with a different selected card
  test("displays correct information for different selected card", () => {
    const { container } = render(
      <GameHUD cards={mockCards} selectedCardIndex={1} />
    );

    expect(screen.getByText("King of Diamonds")).toBeInTheDocument();

    const chipLabel = container.querySelector(".MuiChip-label");
    expect(chipLabel).toHaveTextContent("Face Down");

    expect(screen.getByText(/Position: X: 200, Y: 250/)).toBeInTheDocument();
  });

  // Test with a number card (not a face card)
  test("correctly formats number cards", () => {
    render(<GameHUD cards={mockCards} selectedCardIndex={2} />);

    expect(screen.getByText("10 of Clubs")).toBeInTheDocument();
  });

  // Test instruction text
  test("displays instruction text", () => {
    render(<GameHUD cards={mockCards} selectedCardIndex={null} />);

    expect(
      screen.getByText("Double-click to flip cards • Drag to move")
    ).toBeInTheDocument();
  });

  // Test suit symbol display
  test("displays correct suit symbol for selected card", () => {
    const { container } = render(
      <GameHUD cards={mockCards} selectedCardIndex={3} />
    );

    expect(screen.getByText("Queen of Spades")).toBeInTheDocument();

    const cardNameElement = screen.getByText("Queen of Spades");

    const cardContainer = cardNameElement.closest(".MuiBox-root");
    const symbolElement = cardContainer.querySelector(
      'span[class*="MuiBox-root"]'
    );

    expect(symbolElement).toBeTruthy();
    expect(symbolElement.textContent).toBe("♠");
  });
});
