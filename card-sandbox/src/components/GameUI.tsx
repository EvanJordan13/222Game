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
  SelectChangeEvent,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Settings as SettingsIcon,
  Shuffle as ShuffleIcon,
  GetApp as GetAppIcon,
  Deck as DeckIcon,
} from "@mui/icons-material";

interface Preset {
  id: number | string;
  name: string;
  description: string;
}

interface GameUIProps {
  onAddCard: (options: { suit: string; rank: string; faceUp: boolean }) => void;
  onInitializeDeck: () => void;
  onShuffleDeck: () => void;
  onRemoveTopCard: (count?: number) => void;
  onClearTable: () => void;
  onSavePreset: (preset: Preset) => void;
  onLoadPreset: (preset: Preset) => void;
}

interface CardOptions {
  suit: string;
  rank: string;
  faceUp: boolean;
}

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "space-between",
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  ...other
}) => {
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

const GameUI: React.FC<GameUIProps> = ({
  onAddCard,
  onInitializeDeck,
  onShuffleDeck,
  onRemoveTopCard,
  onClearTable,
  onSavePreset,
  onLoadPreset,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [presets, setPresets] = useState<Preset[]>([
    { id: 1, name: "Poker", description: "Standard 5-card draw" },
    { id: 2, name: "Solitaire", description: "Classic setup" },
  ]);
  const [newPresetName, setNewPresetName] = useState<string>("");
  const [cardOptions, setCardOptions] = useState<CardOptions>({
    suit: "hearts",
    rank: "ace",
    faceUp: true,
  });

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleAddCardClick = () => {
    onAddCard(cardOptions);
  };

  const handleInitializeDeckClick = () => onInitializeDeck();
  const handleShuffleDeckClick = () => onShuffleDeck();
  const handleRemoveTopCardClick = () => onRemoveTopCard(1);
  const handleClearTableClick = () => onClearTable();

  const handleSavePresetClick = () => {
    if (newPresetName.trim()) {
      const newPreset: Preset = {
        id: `preset-${Date.now()}`,
        name: newPresetName.trim(),
        description: "Custom user preset",
      };
      setPresets((prev) => [...prev, newPreset]);
      setNewPresetName("");
      onSavePreset(newPreset);
    }
  };

  const handleLoadPresetClick = (preset: Preset) => {
    onLoadPreset(preset);
  };

  const handleSuitChange = (event: SelectChangeEvent<string>) => {
    setCardOptions((prev) => ({ ...prev, suit: event.target.value }));
  };

  const handleRankChange = (event: SelectChangeEvent<string>) => {
    setCardOptions((prev) => ({ ...prev, rank: event.target.value }));
  };

  const handleFaceUpChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCardOptions((prev) => ({ ...prev, faceUp: event.target.checked }));
  };

  const handlePresetNameChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewPresetName(event.target.value);
  };

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
        "&:hover": { backgroundColor: "primary.dark" },
        zIndex: 1300,
      }}
      aria-label={isMenuOpen ? "Close menu" : "Open menu"}
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
            {" "}
            Card Sandbox{" "}
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

        <TabPanel value={activeTab} index={0}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {" "}
              Add Card{" "}
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
                  onChange={handleSuitChange}
                >
                  <MenuItem value="hearts">Hearts</MenuItem>{" "}
                  <MenuItem value="diamonds">Diamonds</MenuItem>
                  <MenuItem value="clubs">Clubs</MenuItem>{" "}
                  <MenuItem value="spades">Spades</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth size="small">
                <InputLabel id="rank-select-label">Rank</InputLabel>
                <Select
                  labelId="rank-select-label"
                  value={cardOptions.rank}
                  label="Rank"
                  onChange={handleRankChange}
                >
                  <MenuItem value="ace">Ace</MenuItem>
                  {[...Array(9)].map((_, i) => (
                    <MenuItem key={i + 2} value={`${i + 2}`}>
                      {i + 2}
                    </MenuItem>
                  ))}
                  <MenuItem value="jack">Jack</MenuItem>{" "}
                  <MenuItem value="queen">Queen</MenuItem>{" "}
                  <MenuItem value="king">King</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={cardOptions.faceUp}
                  onChange={handleFaceUpChange}
                />
              }
              label="Face Up"
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddIcon />}
              onClick={handleAddCardClick}
              sx={{ mb: 2 }}
            >
              {" "}
              Add Card To Top{" "}
            </Button>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              {" "}
              Deck Actions{" "}
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
                startIcon={<DeckIcon />}
                onClick={handleInitializeDeckClick}
              >
                {" "}
                Initialize Deck{" "}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<ShuffleIcon />}
                onClick={handleShuffleDeckClick}
              >
                {" "}
                Shuffle Deck{" "}
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={
                  <GetAppIcon style={{ transform: "rotate(180deg)" }} />
                }
                onClick={handleRemoveTopCardClick}
              >
                {" "}
                Remove Top Card{" "}
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleClearTableClick}
              >
                {" "}
                Clear Table{" "}
              </Button>
            </Box>
          </Box>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {" "}
            Load Preset{" "}
          </Typography>
          <List sx={{ mb: 3 }}>
            {presets.map((preset) => (
              <Paper
                key={preset.id}
                elevation={1}
                sx={{
                  mb: 1,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "action.hover" },
                }}
                onClick={() => handleLoadPresetClick(preset)}
              >
                <ListItem>
                  {" "}
                  <ListItemText
                    primary={preset.name}
                    secondary={preset.description}
                  />{" "}
                </ListItem>
              </Paper>
            ))}
          </List>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {" "}
            Save Current Setup{" "}
          </Typography>
          <TextField
            fullWidth
            size="small"
            label="Preset name"
            variant="outlined"
            value={newPresetName}
            onChange={handlePresetNameChange}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            color="success"
            fullWidth
            startIcon={<SaveIcon />}
            onClick={handleSavePresetClick}
          >
            {" "}
            Save Preset{" "}
          </Button>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {" "}
            Appearance{" "}
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
            {" "}
            Game Rules{" "}
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
            {" "}
            Controls{" "}
          </Typography>
          <Paper elevation={1} sx={{ p: 2 }}>
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}
            >
              <Typography variant="body2">Pan Camera:</Typography>{" "}
              <Typography variant="body2">Drag or Arrow Keys</Typography>
              <Typography variant="body2">Move Card:</Typography>{" "}
              <Typography variant="body2">Click + Drag</Typography>
              <Typography variant="body2">Flip Card:</Typography>{" "}
              <Typography variant="body2">Double Click</Typography>
            </Box>
          </Paper>
        </TabPanel>
      </Drawer>
    </>
  );
};

export default GameUI;
