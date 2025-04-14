# Functions

### Draw Card
```
{
    "action": "draw_card",
    "args": {
        "hand_id": [hand id], 
        "deck_id": [deck id],
        "n": [number of cards to draw],
        "from_bottom": [True/False]
    }
 }
```

### Initialize Deck
```
{
    "action": "initialize_deck",
    "args": {
        "pos": [[x,y] (should be list)], 
        "deck_type": ["standard_52" is default]
    }
 }
```

### Split Deck
```
{
    "action": "split_deck",
    "args": {
        "pos": [[x,y] (should be list)], 
        "deck_id": [deck id],
        "n": [number of cards off the top to put into new deck]
    }
 }
```

### Shuffle
```
{
    "action": "shuffle",
    "args": {"deck_id": [deck id]}
 }
```

### Remove Top
```
{
    "action": "shuffle",
    "args": {
        "deck_id": [deck id],
        "n": [number of cards to remove from top]  
    }
 }
```

### Add Top
```
{
    "action": "add_top",
    "args": {
        "card": {
            "card_front": [str],
            "card_back": [str],
            "face_up": [True/False]
        },
        "deck_id": [deck id]
    }
 }
```

### Flip Deck Card
```
{
    "action": "flip_deck_card",
    "args": {
        "deck_id": [deck id],
        "idx": [card idx to flip],
        "face_up": [True/False, value after flip]
    }
 }
```

### Flip Deck
```
{
    "action": "flip_deck",
    "args": {
        "deck_id": [deck id]
    }
 }
```

### Move Deck
```
{
    "action": "move_deck",
    "args": {
        "deck_id": [deck id],
        "pos": [[x, y] <- list]
    }
 }
```

### Remove Nth
```
{
    "action": "remove_nth",
    "args": {
        "hand_id": [hand id],
        "n": [idx of card]
    }
 }
```

### Add Card to Hand
```
{
    "action": "add_card_to_hand",
    "args": {
        "card": {
            "card_front": [str],
            "card_back": [str],
            "face_up": [True/False]
        },
        "hand_id": [hand id]
    }
 }
```

### Flip Hand Card
```
{
    "action": "add_card_to_hand",
    "args": {
        "hand_id": [hand id],
        "idx": [card idx to flip],
        "face_up": [True/False, final value]
    }
 }
```