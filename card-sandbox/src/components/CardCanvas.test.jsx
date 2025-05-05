/* eslint-disable testing-library/no-container */
/* eslint-disable testing-library/no-node-access */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import CardCanvas from "./CardCanvas";
import { drawCard, drawTable } from "../utils/canvasUtils";

jest.mock("../utils/canvasUtils", () => ({
  drawCard: jest.fn(),
  drawTable: jest.fn(),
  CARD_WIDTH: 120,
  CARD_HEIGHT: 168,
}));

const mockCameraInstance = {
  worldToScreen: jest.fn(() => new DOMMatrix()),
  hasInertia: jest.fn(() => false),
  updateInertia: jest.fn(function () {
    return this;
  }),
  updatePosition: jest.fn(),
  translate: jest.fn(),
  resetInertia: jest.fn(),
  zoomBy: jest.fn(),
  updateZoom: jest.fn(),
  screenToWorld: jest.fn(() => ({ x: 0, y: 0 })),
};

jest.mock("../utils/camera", () => {
  return {
    __esModule: true,
    default: class Camera {
      static new() {
        return mockCameraInstance;
      }
    },
  };
});

const mockClearRect = jest.fn();
const mockSave = jest.fn();
const mockRestore = jest.fn();
const mockSetTransform = jest.fn();
const mockBeginPath = jest.fn();
const mockMoveTo = jest.fn();
const mockLineTo = jest.fn();
const mockQuadraticCurveTo = jest.fn();
const mockClosePath = jest.fn();
const mockFill = jest.fn();
const mockStroke = jest.fn();
const mockFillText = jest.fn();
const mockArc = jest.fn();

HTMLCanvasElement.prototype.getContext = function () {
  return {
    clearRect: mockClearRect,
    save: mockSave,
    restore: mockRestore,
    setTransform: mockSetTransform,
    translate: jest.fn(),
    scale: jest.fn(),
    beginPath: mockBeginPath,
    moveTo: mockMoveTo,
    lineTo: mockLineTo,
    quadraticCurveTo: mockQuadraticCurveTo,
    closePath: mockClosePath,
    fill: mockFill,
    stroke: mockStroke,
    fillText: mockFillText,
    arc: mockArc,
    fillStyle: "",
    strokeStyle: "",
    lineWidth: 0,
    shadowColor: "",
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    font: "",
    textAlign: "",
    textBaseline: "",
  };
};

global.requestAnimationFrame = (callback) => {
  return setTimeout(callback, 0);
};
global.cancelAnimationFrame = (id) => {
  clearTimeout(id);
};

describe("CardCanvas Component", () => {
  const defaultProps = {
    cards: [],
    dragState: { mode: "none" },
    draggedItemInfo: null,
    onCardMouseDown: jest.fn(),
    onBackgroundMouseDown: jest.fn(),
    onCardMouseMove: jest.fn(),
    onCardMouseUp: jest.fn(),
    onCardFlip: jest.fn(),
    onCardSelect: jest.fn(),
    onDeselectCard: jest.fn(),
    selectedCardIndex: null,
    selectedDeckId: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    Object.values(mockCameraInstance).forEach((mockFn) => {
      if (typeof mockFn.mockClear === "function") {
        mockFn.mockClear();
      }
    });
    mockCameraInstance.worldToScreen.mockReturnValue(new DOMMatrix());
    mockCameraInstance.screenToWorld.mockReturnValue({ x: 0, y: 0 });
  });

  it("calls drawTable with correct dimensions", () => {
    const originalWidth = global.innerWidth;
    const originalHeight = global.innerHeight;
    global.innerWidth = 800;
    global.innerHeight = 600;

    render(<CardCanvas {...defaultProps} />);
    expect(drawTable).toHaveBeenCalledWith(expect.anything(), {
      width: 800,
      height: 600,
    });

    global.innerWidth = originalWidth;
    global.innerHeight = originalHeight;
  });

  it("calls drawCard for each card in the array", () => {
    const testCards = [
      {
        id: "1",
        x: 100,
        y: 100,
        suit: "hearts",
        rank: "ace",
        faceUp: true,
        backendDeckId: "deck1",
        backendIndex: 0,
      },
      {
        id: "2",
        x: 200,
        y: 200,
        suit: "spades",
        rank: "king",
        faceUp: false,
        backendDeckId: "deck1",
        backendIndex: 1,
      },
    ];

    render(<CardCanvas {...defaultProps} cards={testCards} />);
    expect(drawCard).toHaveBeenCalledTimes(2);
    expect(drawCard).toHaveBeenCalledWith(
      expect.anything(),
      testCards[0],
      100,
      100,
      true,
      false,
      false
    );
    expect(drawCard).toHaveBeenCalledWith(
      expect.anything(),
      testCards[1],
      200,
      200,
      false,
      false,
      false
    );
  });

  it("updates dimensions on window resize", () => {
    render(<CardCanvas {...defaultProps} />);
    drawTable.mockClear();

    global.innerWidth = 1024;
    global.innerHeight = 768;
    fireEvent(window, new Event("resize"));

    expect(drawTable).toHaveBeenCalledWith(expect.anything(), {
      width: 1024,
      height: 768,
    });
  });

  test("renders the canvas element", () => {
    const { container } = render(<CardCanvas {...defaultProps} />);
    const canvasElement = container.querySelector("canvas");
    expect(canvasElement).toBeInTheDocument();
  });

  test("renders without crashing with empty cards array", () => {
    render(<CardCanvas {...defaultProps} cards={[]} />);
  });

  test("renders without crashing with null selection props", () => {
    render(
      <CardCanvas
        {...defaultProps}
        selectedCardIndex={null}
        selectedDeckId={null}
      />
    );
  });
});
