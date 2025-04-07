/* eslint-disable testing-library/no-container */
/* eslint-disable testing-library/no-node-access */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom"; // Add this import for toBeInTheDocument()
import userEvent from "@testing-library/user-event";
import GameUI from "./GameUI";

// Mock functions for props
const mockAddCard = jest.fn();
const mockDealCards = jest.fn();
const mockClearTable = jest.fn();
const mockSavePreset = jest.fn();
const mockLoadPreset = jest.fn();

describe("GameUI Component", () => {
  // Basic rendering test
  test("renders without crashing", () => {
    render(
      <GameUI
        onAddCard={mockAddCard}
        onDealCards={mockDealCards}
        onClearTable={mockClearTable}
        onSavePreset={mockSavePreset}
        onLoadPreset={mockLoadPreset}
      />
    );

    expect(screen.getByText("Card Game Sandbox")).toBeInTheDocument();
  });

  // Test tab switching
  test("switches between tabs correctly", () => {
    render(
      <GameUI
        onAddCard={mockAddCard}
        onDealCards={mockDealCards}
        onClearTable={mockClearTable}
        onSavePreset={mockSavePreset}
        onLoadPreset={mockLoadPreset}
      />
    );

    // Should start with Cards tab active
    expect(
      screen.getByRole("heading", { name: "Add Card" })
    ).toBeInTheDocument();

    // Switch to Presets tab
    fireEvent.click(screen.getByRole("tab", { name: /presets/i }));
    expect(screen.getByText("Load Preset")).toBeInTheDocument();
    expect(screen.queryByText("Add Card")).not.toBeInTheDocument();

    // Switch to Settings tab
    fireEvent.click(screen.getByRole("tab", { name: /settings/i }));
    expect(screen.getByText("Appearance")).toBeInTheDocument();
    expect(screen.queryByText("Load Preset")).not.toBeInTheDocument();
  });

  // Test card addition
  test("adds a card with selected options", async () => {
    render(
      <GameUI
        onAddCard={mockAddCard}
        onDealCards={mockDealCards}
        onClearTable={mockClearTable}
        onSavePreset={mockSavePreset}
        onLoadPreset={mockLoadPreset}
      />
    );

    fireEvent.mouseDown(screen.getByLabelText("Suit"));
    fireEvent.click(screen.getByRole("option", { name: "Diamonds" }));

    fireEvent.mouseDown(screen.getByLabelText("Rank"));
    fireEvent.click(screen.getByRole("option", { name: "King" }));

    fireEvent.click(screen.getByLabelText("Face Up"));

    fireEvent.click(screen.getByRole("button", { name: /add card/i }));

    expect(mockAddCard).toHaveBeenCalledTimes(1);
    expect(mockAddCard).toHaveBeenCalledWith(
      expect.objectContaining({
        suit: "diamonds",
        rank: "king",
        faceUp: false,
      })
    );
  });

  // Test quick actions
  test("deal cards buttons call onDealCards with correct values", () => {
    render(
      <GameUI
        onAddCard={mockAddCard}
        onDealCards={mockDealCards}
        onClearTable={mockClearTable}
        onSavePreset={mockSavePreset}
        onLoadPreset={mockLoadPreset}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /deal 5 cards/i }));
    expect(mockDealCards).toHaveBeenCalledWith(5);

    fireEvent.click(screen.getByRole("button", { name: /deal 7 cards/i }));
    expect(mockDealCards).toHaveBeenCalledWith(7);
  });

  // Test clear table
  test("clear table button calls onClearTable", () => {
    render(
      <GameUI
        onAddCard={mockAddCard}
        onDealCards={mockDealCards}
        onClearTable={mockClearTable}
        onSavePreset={mockSavePreset}
        onLoadPreset={mockLoadPreset}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /clear table/i }));
    expect(mockClearTable).toHaveBeenCalledTimes(1);
  });

  // Test preset saving
  test("saves a new preset with provided name", () => {
    render(
      <GameUI
        onAddCard={mockAddCard}
        onDealCards={mockDealCards}
        onClearTable={mockClearTable}
        onSavePreset={mockSavePreset}
        onLoadPreset={mockLoadPreset}
      />
    );

    // Switch to Presets tab
    fireEvent.click(screen.getByRole("tab", { name: /presets/i }));

    // Enter preset name
    fireEvent.change(screen.getByLabelText("Preset name"), {
      target: { value: "Test Preset" },
    });

    // Click Save Preset button
    fireEvent.click(screen.getByRole("button", { name: /save preset/i }));

    // Verify onSavePreset was called
    expect(mockSavePreset).toHaveBeenCalledTimes(1);
    expect(mockSavePreset).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Test Preset",
        description: "Custom user preset",
      })
    );
  });

  // Test preset loading
  test("loads a preset when clicked", () => {
    render(
      <GameUI
        onAddCard={mockAddCard}
        onDealCards={mockDealCards}
        onClearTable={mockClearTable}
        onSavePreset={mockSavePreset}
        onLoadPreset={mockLoadPreset}
      />
    );

    fireEvent.click(screen.getByRole("tab", { name: /presets/i }));

    fireEvent.click(screen.getByText("Poker"));

    expect(mockLoadPreset).toHaveBeenCalledTimes(1);
    expect(mockLoadPreset).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Poker",
        description: "Standard 5-card draw poker",
      })
    );
  });

  // Test drawer toggle
  test("toggles menu drawer when button is clicked", () => {
    const { container } = render(
      <GameUI
        onAddCard={mockAddCard}
        onDealCards={mockDealCards}
        onClearTable={mockClearTable}
        onSavePreset={mockSavePreset}
        onLoadPreset={mockLoadPreset}
      />
    );

    const drawer = container.querySelector(".MuiDrawer-root");
    expect(drawer).toBeTruthy();

    const toggleButton = screen
      .getByTestId("ChevronRightIcon")
      .closest("button");
    expect(toggleButton).toBeTruthy();

    fireEvent.click(toggleButton);

    expect(mockAddCard).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId("ChevronLeftIcon").closest("button"));

    // Verify drawer exists
    const drawerAfterToggle = container.querySelector(".MuiDrawer-root");
    expect(drawerAfterToggle).toBeTruthy();
  });
});
