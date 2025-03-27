import React, { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Save,
  Plus,
  Trash,
} from "lucide-react";

const GameUI = ({
  onAddCard,
  onDealCards,
  onClearTable,
  onSavePreset,
  onLoadPreset,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("cards");
  const [presets] = useState([
    { id: 1, name: "Poker", description: "Standard 5-card draw poker" },
    { id: 2, name: "Solitaire", description: "Classic solitaire setup" },
    { id: 3, name: "Blackjack", description: "Casino-style blackjack" },
  ]);
  const [newPresetName, setNewPresetName] = useState("");
  const [cardOptions, setCardOptions] = useState({
    suit: "hearts",
    rank: "ace",
    faceUp: true,
  });

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleAddCard = () => {
    if (onAddCard) {
      onAddCard({
        id: `card-${Date.now()}`,
        suit: cardOptions.suit,
        rank: cardOptions.rank,
        x: Math.random() * 400 + 100,
        y: Math.random() * 200 + 100,
        faceUp: cardOptions.faceUp,
      });
    }
  };

  const handleDealCards = (count) => {
    if (onDealCards) {
      onDealCards(count);
    }
  };

  const handleSavePreset = () => {
    if (newPresetName.trim() && onSavePreset) {
      const newPreset = {
        id: Date.now(),
        name: newPresetName,
        description: "Custom user preset",
      };
      setNewPresetName("");
      onSavePreset(newPreset);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        height: "100%",
        display: "flex",
        zIndex: 10,
      }}
    >
      {/* Toggle button */}
      <button
        onClick={toggleMenu}
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          width: "30px",
          alignSelf: "center",
          padding: "10px 0",
          display: "flex",
          justifyContent: "center",
          borderTopLeftRadius: "5px",
          borderBottomLeftRadius: "5px",
          boxShadow: "0 0 10px rgba(0,0,0,0.5)",
        }}
      >
        {isMenuOpen ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {/* Panel */}
      {isMenuOpen && (
        <div
          style={{
            backgroundColor: "#1f2937",
            color: "white",
            width: "300px",
            height: "100%",
            overflowY: "auto",
            boxShadow: "0 0 10px rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ padding: "16px", borderBottom: "1px solid #374151" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>
              Card Game Sandbox
            </h2>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #374151" }}>
            <button
              style={{
                padding: "8px 16px",
                flexGrow: 1,
                backgroundColor:
                  activeTab === "cards" ? "#374151" : "transparent",
              }}
              onClick={() => setActiveTab("cards")}
            >
              Cards
            </button>
            <button
              style={{
                padding: "8px 16px",
                flexGrow: 1,
                backgroundColor:
                  activeTab === "presets" ? "#374151" : "transparent",
              }}
              onClick={() => setActiveTab("presets")}
            >
              Presets
            </button>
            <button
              style={{
                padding: "8px 16px",
                flexGrow: 1,
                backgroundColor:
                  activeTab === "settings" ? "#374151" : "transparent",
              }}
              onClick={() => setActiveTab("settings")}
            >
              <Settings
                size={16}
                style={{ display: "inline", marginRight: "4px" }}
              />{" "}
              Settings
            </button>
          </div>

          {/* Content */}
          <div style={{ padding: "16px" }}>
            {activeTab === "cards" && (
              <div>
                <div style={{ marginBottom: "16px" }}>
                  <h3 style={{ fontWeight: "medium", marginBottom: "8px" }}>
                    Add Card
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          color: "#9ca3af",
                          marginBottom: "4px",
                        }}
                      >
                        Suit
                      </label>
                      <select
                        style={{
                          width: "100%",
                          backgroundColor: "#374151",
                          borderRadius: "4px",
                          padding: "8px",
                        }}
                        value={cardOptions.suit}
                        onChange={(e) =>
                          setCardOptions({
                            ...cardOptions,
                            suit: e.target.value,
                          })
                        }
                      >
                        <option value="hearts">Hearts</option>
                        <option value="diamonds">Diamonds</option>
                        <option value="clubs">Clubs</option>
                        <option value="spades">Spades</option>
                      </select>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "14px",
                          color: "#9ca3af",
                          marginBottom: "4px",
                        }}
                      >
                        Rank
                      </label>
                      <select
                        style={{
                          width: "100%",
                          backgroundColor: "#374151",
                          borderRadius: "4px",
                          padding: "8px",
                        }}
                        value={cardOptions.rank}
                        onChange={(e) =>
                          setCardOptions({
                            ...cardOptions,
                            rank: e.target.value,
                          })
                        }
                      >
                        <option value="ace">Ace</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                        <option value="jack">Jack</option>
                        <option value="queen">Queen</option>
                        <option value="king">King</option>
                      </select>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <input
                      type="checkbox"
                      id="faceUp"
                      checked={cardOptions.faceUp}
                      onChange={(e) =>
                        setCardOptions({
                          ...cardOptions,
                          faceUp: e.target.checked,
                        })
                      }
                      style={{ marginRight: "8px" }}
                    />
                    <label htmlFor="faceUp" style={{ fontSize: "14px" }}>
                      Face Up
                    </label>
                  </div>
                  <button
                    style={{
                      width: "100%",
                      backgroundColor: "#2563eb",
                      borderRadius: "4px",
                      padding: "8px 0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={handleAddCard}
                  >
                    <Plus size={16} style={{ marginRight: "4px" }} /> Add Card
                  </button>
                </div>

                <div>
                  <h3 style={{ fontWeight: "medium", marginBottom: "8px" }}>
                    Quick Actions
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "8px",
                      marginBottom: "8px",
                    }}
                  >
                    <button
                      style={{
                        backgroundColor: "#4f46e5",
                        borderRadius: "4px",
                        padding: "8px 0",
                        fontSize: "14px",
                      }}
                      onClick={() => handleDealCards(5)}
                    >
                      Deal 5 Cards
                    </button>
                    <button
                      style={{
                        backgroundColor: "#4f46e5",
                        borderRadius: "4px",
                        padding: "8px 0",
                        fontSize: "14px",
                      }}
                      onClick={() => handleDealCards(7)}
                    >
                      Deal 7 Cards
                    </button>
                  </div>
                  <button
                    style={{
                      width: "100%",
                      backgroundColor: "#dc2626",
                      borderRadius: "4px",
                      padding: "8px 0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={onClearTable}
                  >
                    <Trash size={16} style={{ marginRight: "4px" }} /> Clear
                    Table
                  </button>
                </div>
              </div>
            )}

            {activeTab === "presets" && (
              <div>
                <div style={{ marginBottom: "16px" }}>
                  <h3 style={{ fontWeight: "medium", marginBottom: "8px" }}>
                    Load Preset
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {presets.map((preset) => (
                      <div
                        key={preset.id}
                        style={{
                          backgroundColor: "#374151",
                          borderRadius: "4px",
                          padding: "12px",
                          cursor: "pointer",
                        }}
                        onClick={() => onLoadPreset(preset)}
                      >
                        <div style={{ fontWeight: "medium" }}>
                          {preset.name}
                        </div>
                        <div style={{ fontSize: "14px", color: "#9ca3af" }}>
                          {preset.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ fontWeight: "medium", marginBottom: "8px" }}>
                    Save Current Setup
                  </h3>
                  <input
                    type="text"
                    placeholder="Preset name"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    style={{
                      width: "100%",
                      backgroundColor: "#374151",
                      borderRadius: "4px",
                      padding: "8px",
                      marginBottom: "8px",
                    }}
                  />
                  <button
                    style={{
                      width: "100%",
                      backgroundColor: "#059669",
                      borderRadius: "4px",
                      padding: "8px 0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    onClick={handleSavePreset}
                  >
                    <Save size={16} style={{ marginRight: "4px" }} /> Save
                    Preset
                  </button>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div>
                <div style={{ marginBottom: "16px" }}>
                  <h3 style={{ fontWeight: "medium", marginBottom: "8px" }}>
                    Appearance
                  </h3>
                  <div style={{ marginBottom: "8px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "14px",
                        color: "#9ca3af",
                        marginBottom: "4px",
                      }}
                    >
                      Table Color
                    </label>
                    <select
                      style={{
                        width: "100%",
                        backgroundColor: "#374151",
                        borderRadius: "4px",
                        padding: "8px",
                      }}
                    >
                      <option value="green">Green (Default)</option>
                      <option value="blue">Blue</option>
                      <option value="red">Red</option>
                      <option value="black">Black</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "16px" }}>
                  <h3 style={{ fontWeight: "medium", marginBottom: "8px" }}>
                    Game Rules
                  </h3>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <input
                      type="checkbox"
                      id="autoSort"
                      style={{ marginRight: "8px" }}
                    />
                    <label htmlFor="autoSort" style={{ fontSize: "14px" }}>
                      Auto-sort cards in hand
                    </label>
                  </div>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      id="snapToGrid"
                      style={{ marginRight: "8px" }}
                    />
                    <label htmlFor="snapToGrid" style={{ fontSize: "14px" }}>
                      Snap cards to grid
                    </label>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontWeight: "medium", marginBottom: "8px" }}>
                    Controls
                  </h3>
                  <div
                    style={{
                      backgroundColor: "#374151",
                      borderRadius: "4px",
                      padding: "12px",
                      fontSize: "14px",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "8px",
                      }}
                    >
                      <div>Pan Camera:</div>
                      <div>Drag or Arrow Keys</div>
                      <div>Move Card:</div>
                      <div>Click + Drag</div>
                      <div>Flip Card:</div>
                      <div>Double Click</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameUI;
