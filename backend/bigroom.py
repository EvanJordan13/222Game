from room import Room
from objects import Card, Deck
from typing import List
from dataclasses import dataclass, field
from dataclasses_serialization.json import JSONSerializer
import uuid

@dataclass
class BigRoom:
    players: List[str] = field(default_factory=list)
    room: Room = field(default_factory=lambda: Room([], {}, {}))
    
    def addPlayer(self, playerName):
        self.players.append(playerName)
    
    def removePlayer(self, playerName):
        self.players.remove(playerName)

    def numPlayers(self):
        return len(self.players)
    
    def updateState(self, a):
        if a["action"] == "shuffle":
            self.room = self.room.shuffle(a["args"]["deck_id"])
        elif a["action"] == "nothing":
            pass
        elif a["action"] == "initialize_deck":
            x = 0
            y = 0
            if "pos" in a["args"]:
                x = a["args"]["pos"][0]
                y = a["args"]["pos"][1]
            deck_type = "standard52"
            if "deck_type" in a["args"]:
                deck_type = a["args"]["deck_type"]
            self.room, deck_id = self.room.initialize_deck([x,y], deck_type)
        elif a["action"] == "remove_top":
            self.room = self.room.remove_top(a["args"]["deck_id"], a["args"]["n"])
        elif a["action"] == "add_top":
            card = JSONSerializer.deserialize(Card, a["args"]["card"])
            self.room = self.room.add_top(a["args"]["deck_id"], card)
        elif a["action"] == "flip_deck_card":
            self.room = self.room.flip_deck_card(a["args"]["deck_id"], a["args"]["idx"], a["args"]["face_up"])
        elif a["action"] == "move_card":
            deck_id = a["args"].get("deck_id")
            card_index = a["args"].get("card_index") 
            new_position = a["args"].get("new_position")

            if deck_id is not None and card_index is not None and new_position is not None:
                print(f"Action: move_card from deck {deck_id} at index {card_index} to {new_position}")
                updated_room, removed_card = self.room.remove_card_from_deck(deck_id, card_index)
                self.room = updated_room

                if removed_card:
                    # Create a new deck for the single card
                    new_deck_id = f"card_{uuid.uuid4()}" # Generate unique ID
                    new_deck = Deck(id=new_deck_id, position=new_position, cards=[removed_card])
                    print(f"  -> Created new single-card deck {new_deck_id} for card {removed_card.card_front}")

                    #Add the new deck to the room
                    self.room = self.room.add_deck(new_deck)
                else:
                    print(f"  -> Failed to remove card {deck_id}[{card_index}], cannot move.")
            else:
                print("Error: move_card action missing 'deck_id', 'card_index', or 'new_position'")    
        elif a["action"] == "deck_peek":
            # discuss at meeting
            pass
        #TODO integrate other functions
    