from room import Room
from objects import Card, Deck
from typing import List
from dataclasses import dataclass, field
from dataclasses_serialization.json import JSONSerializer
import uuid
from fastapi import WebSocket

@dataclass
class BigRoom:
    players: List[str] = field(default_factory=list)
    room: Room = field(default_factory=lambda: Room([], {}, {}))
    
    def addPlayer(self, playerName):
        self.players.append(playerName)
    
    def removePlayer(self, playerName):
        self.players.remove(playerName)
    
    def getSockets(self):
        return self.sockets

    def numPlayers(self):
        return len(self.players)
    
    def updateState(self, a):
        try: 
            match a["action"]:
                case "draw_card":
                    self.room = self.room.draw_card(a["args"]["hand_id"], a["args"]["deck_id"], a["args"]["n"], a["args"]["from_bottom"])
                case "initialize_deck":
                    x = 0
                    y = 0
                    if "pos" in a["args"]:
                        x = a["args"]["pos"][0]
                        y = a["args"]["pos"][1]
                    deck_type = "standard52"
                    if "deck_type" in a["args"]:
                        deck_type = a["args"]["deck_type"]
                    self.room, deck_id = self.room.initialize_deck([x, y], deck_type)
                case "split_deck":
                    self.room, new_deck_id = self.room.split_deck(a["args"]["deck_id"], a["args"]["n"], a["args"]["pos"])
                case "shuffle":
                    self.room = self.room.shuffle(a["args"]["deck_id"])
                case "remove_top":
                    self.room = self.room.remove_top(a["args"]["deck_id"], a["args"]["n"])
                case "add_top":
                    card = JSONSerializer.deserialize(Card, a["args"]["card"])
                    self.room = self.room.add_top(a["args"]["deck_id"], card)
                case "flip_deck_card":
                    self.room = self.room.flip_deck_card(a["args"]["deck_id"], a["args"]["idx"], a["args"]["face_up"])
                case "flip_deck":
                    self.room = self.room.flip_deck(a["args"]["deck_id"])
                case "move_deck":
                    self.room = self.room.move_deck(a["args"]["deck_id"], a["args"]["x"], a["args"]["y"])
                case "remove_nth":
                    self.room = self.room.remove_nth(a["args"]["hand_id"], a["args"]["n"])
                case "add_card_to_hand":
                    card = JSONSerializer.deserialize(Card, a["args"]["card"])
                    self.room = self.room.add_card_to_hand(a["args"]["hand_id"], card)
                case "flip_hand_card":
                    self.room = self.room.flip_hand_card(a["args"]["hand_id"], a["args"]["idx"], a["args"]["face_up"])
                case "move_card":
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
                case "combine_cards_into_deck":
                    dragged_deck_id = a["args"].get("dragged_deck_id")
                    dragged_card_index = a["args"].get("dragged_card_index")
                    target_deck_id = a["args"].get("target_deck_id")
                    target_card_index = a["args"].get("target_card_index") 

                    if all([dragged_deck_id, dragged_card_index is not None, target_deck_id, target_card_index is not None]):
                         self.room = self.room.combine_cards_into_deck(
                             dragged_deck_id,
                             dragged_card_index,
                             target_deck_id,
                             target_card_index
                         )
                    else:
                        print(f"  -> Failed to remove card {deck_id}[{card_index}], cannot move.")
                case "merge_decks":
                    dragged_deck_id = a["args"].get("dragged_deck_id")
                    target_deck_id = a["args"].get("target_deck_id")
                    if dragged_deck_id and target_deck_id:
                        self.room = self.room.merge_decks(dragged_deck_id, target_deck_id)
 
        except:
            pass

    
    