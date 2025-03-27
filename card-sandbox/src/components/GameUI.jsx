import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Drawer,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  FormControl,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";

// Styled components
const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "space-between",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`panel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const GameUI = ({
  onAddCard,
  onDealCards,
  onClearTable,
  onSavePreset,
  onLoadPreset,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [presets, setPresets] = useState([
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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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
      setPresets([...presets, newPreset]);
      setNewPresetName("");
      onSavePreset(newPreset);
    }
  };

  const handleLoadPreset = (preset) => {
    if (onLoadPreset) {
      onLoadPreset(preset);
    }
  };

  // Toggle button outside drawer
  const toggleButton = (
    <IconButton
      onClick={toggleMenu}
      sx={{
        position: "fixed",
        right: isMenuOpen ? 320 : 0,
        top: "50%",
        transform: "translateY(-50%)",
        backgroundColor: "primary.main",
        color: "white",
        transition: "right 0.3s",
        borderTopRightRadius: isMenuOpen ? 4 : 0,
        borderBottomRightRadius: isMenuOpen ? 4 : 0,
        borderTopLeftRadius: isMenuOpen ? 0 : 4,
        borderBottomLeftRadius: isMenuOpen ? 0 : 4,
        "&:hover": {
          backgroundColor: "primary.dark",
        },
        zIndex: 1300,
      }}
    >
      {isMenuOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
    </IconButton>
  );

  return (
    <>
      {toggleButton}
      <Drawer
        variant="persistent"
        anchor="right"
        open={isMenuOpen}
        sx={{
          width: 320,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: 320,
            boxSizing: "border-box",
            backgroundColor: "background.paper",
          },
          zIndex: 1200,
        }}
      >
        <DrawerHeader>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, pl: 1 }}>
            Card Game Sandbox
          </Typography>
        </DrawerHeader>

        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="game options tabs"
            variant="fullWidth"
          >
            <Tab label="Cards" id="tab-0" aria-controls="panel-0" />
            <Tab label="Presets" id="tab-1" aria-controls="panel-1" />
            <Tab
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <SettingsIcon sx={{ mr: 0.5, fontSize: 18 }} />
                  <span>Settings</span>
                </Box>
              }
              id="tab-2"
              aria-controls="panel-2"
            />
          </Tabs>
        </Box>

        {/* Cards Tab */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Add Card
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                mb: 2,
              }}
            >
              <FormControl fullWidth size="small">
                <InputLabel id="suit-select-label">Suit</InputLabel>
                <Select
                  labelId="suit-select-label"
                  value={cardOptions.suit}
                  label="Suit"
                  onChange={(e) =>
                    setCardOptions({ ...cardOptions, suit: e.target.value })
                  }
                >
                  <MenuItem value="hearts">Hearts</MenuItem>
                  <MenuItem value="diamonds">Diamonds</MenuItem>
                  <MenuItem value="clubs">Clubs</MenuItem>
                  <MenuItem value="spades">Spades</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel id="rank-select-label">Rank</InputLabel>
                <Select
                  labelId="rank-select-label"
                  value={cardOptions.rank}
                  label="Rank"
                  onChange={(e) =>
                    setCardOptions({ ...cardOptions, rank: e.target.value })
                  }
                >
                  <MenuItem value="ace">Ace</MenuItem>
                  <MenuItem value="2">2</MenuItem>
                  <MenuItem value="3">3</MenuItem>
                  <MenuItem value="4">4</MenuItem>
                  <MenuItem value="5">5</MenuItem>
                  <MenuItem value="6">6</MenuItem>
                  <MenuItem value="7">7</MenuItem>
                  <MenuItem value="8">8</MenuItem>
                  <MenuItem value="9">9</MenuItem>
                  <MenuItem value="10">10</MenuItem>
                  <MenuItem value="jack">Jack</MenuItem>
                  <MenuItem value="queen">Queen</MenuItem>
                  <MenuItem value="king">King</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <FormControlLabel
              control={
                <Checkbox
                  checked={cardOptions.faceUp}
                  onChange={(e) =>
                    setCardOptions({ ...cardOptions, faceUp: e.target.checked })
                  }
                />
              }
              label="Face Up"
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              fullWidth
              startIcon={<AddIcon />}
              onClick={handleAddCard}
              sx={{ mb: 2 }}
            >
              Add Card
            </Button>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Quick Actions
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 2,
                mb: 2,
              }}
            >
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleDealCards(5)}
              >
                Deal 5 Cards
              </Button>
              <Button
                variant="contained"
                color="secondary"
                onClick={() => handleDealCards(7)}
              >
                Deal 7 Cards
              </Button>
            </Box>
            <Button
              variant="contained"
              color="error"
              fullWidth
              startIcon={<DeleteIcon />}
              onClick={onClearTable}
            >
              Clear Table
            </Button>
          </Box>
        </TabPanel>

        {/* Presets Tab */}
        <TabPanel value={activeTab} index={1}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Load Preset
          </Typography>
          <List sx={{ mb: 3 }}>
            {presets.map((preset) => (
              <Paper
                key={preset.id}
                elevation={1}
                sx={{
                  mb: 1,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "action.hover",
                  },
                }}
                onClick={() => handleLoadPreset(preset)}
              >
                <ListItem>
                  <ListItemText
                    primary={preset.name}
                    secondary={preset.description}
                  />
                </ListItem>
              </Paper>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Save Current Setup
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Preset name"
            variant="outlined"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="success"
            fullWidth
            startIcon={<SaveIcon />}
            onClick={handleSavePreset}
          >
            Save Preset
          </Button>
        </TabPanel>

        {/* Settings Tab */}
        <TabPanel value={activeTab} index={2}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Appearance
          </Typography>
          <FormControl fullWidth size="small" sx={{ mb: 2 }}>
            <InputLabel id="table-color-label">Table Color</InputLabel>
            <Select
              labelId="table-color-label"
              defaultValue="green"
              label="Table Color"
            >
              <MenuItem value="green">Green (Default)</MenuItem>
              <MenuItem value="blue">Blue</MenuItem>
              <MenuItem value="red">Red</MenuItem>
              <MenuItem value="black">Black</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth size="small" sx={{ mb: 3 }}>
            <InputLabel id="card-back-label">Card Back</InputLabel>
            <Select
              labelId="card-back-label"
              defaultValue="blue"
              label="Card Back"
            >
              <MenuItem value="blue">Blue Pattern (Default)</MenuItem>
              <MenuItem value="red">Red Pattern</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Game Rules
          </Typography>
          <FormControlLabel
            control={<Checkbox />}
            label="Auto-sort cards in hand"
            sx={{ display: "block", mb: 1 }}
          />
          <FormControlLabel
            control={<Checkbox />}
            label="Snap cards to grid"
            sx={{ display: "block", mb: 3 }}
          />

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Controls
          </Typography>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}
            >
              <Typography variant="body2">Pan Camera:</Typography>
              <Typography variant="body2">Drag or Arrow Keys</Typography>
              <Typography variant="body2">Move Card:</Typography>
              <Typography variant="body2">Click + Drag</Typography>
              <Typography variant="body2">Flip Card:</Typography>
              <Typography variant="body2">Double Click</Typography>
            </Box>
          </Paper>
        </TabPanel>
      </Drawer>
    </>
  );
};

export default GameUI;
