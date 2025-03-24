import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CardCanvas from "./CardCanvas";
import { drawCard, drawTable } from "../utils/canvasUtils";

// Mock the canvas utils functions
jest.mock("../utils/canvasUtils", () => ({
  drawCard: jest.fn(),
  drawTable: jest.fn(),
}));

// Mock canvas getContext
const mockGetContext = jest.fn();
const mockClearRect = jest.fn();
const mockSave = jest.fn();

// Mock canvas setup
HTMLCanvasElement.prototype.getContext = function () {
  return {
    clearRect: mockClearRect,
    save: mockSave,
  };
};

describe("CardCanvas Component", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  it("calls drawTable with correct dimensions", () => {
    // Save original innerWidth and innerHeight
    const originalWidth = global.innerWidth;
    const originalHeight = global.innerHeight;

    // Set window dimensions for test
    global.innerWidth = 800;
    global.innerHeight = 600;

    render(<CardCanvas cards={[]} />);

    // Check if drawTable was called with the correct dimensions
    expect(drawTable).toHaveBeenCalledWith(expect.anything(), 800, 600);

    // Restore original dimensions
    global.innerWidth = originalWidth;
    global.innerHeight = originalHeight;
  });

  it("calls drawCard for each card in the array", () => {
    const testCards = [
      { id: "1", x: 100, y: 100, suit: "hearts", rank: "ace" },
      { id: "2", x: 200, y: 200, suit: "spades", rank: "king", faceUp: false },
    ];

    render(<CardCanvas cards={testCards} />);

    // Check if drawCard was called twice (once for each card)
    expect(drawCard).toHaveBeenCalledTimes(2);

    // Check if drawCard was called with correct parameters for first card
    expect(drawCard).toHaveBeenCalledWith(
      expect.anything(),
      testCards[0],
      testCards[0].x,
      testCards[0].y,
      true
    );

    // Check if drawCard was called with correct parameters for second card
    expect(drawCard).toHaveBeenCalledWith(
      expect.anything(),
      testCards[1],
      testCards[1].x,
      testCards[1].y,
      false
    );
  });

  it("updates dimensions on window resize", () => {
    render(<CardCanvas cards={[]} />);

    // Clear previous calls
    drawTable.mockClear();

    // Change window size
    global.innerWidth = 1024;
    global.innerHeight = 768;

    // Trigger resize event
    fireEvent(window, new Event("resize"));

    // Check if drawTable was called with new dimensions
    expect(drawTable).toHaveBeenCalledWith(expect.anything(), { x: 1024, y: 768 });
  });
});
