from backend.room import Room
from backend.objects import Card
from typing import List
from dataclasses import dataclass, field
from dataclasses_serialization.json import JSONSerializer

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
        if a["action"] == "draw_card":
            self.room = self.room.draw_card(a["args"]["hand_id"], a["args"]["deck_id"], a["args"]["n"], a["args"]["from_bottom"])
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
        elif a["action"] == "split_deck":
            self.room, new_deck_id = self.room.split_deck(a["args"]["deck_id"], a["args"]["n"], a["args"]["pos"])
        elif a["action"] == "shuffle":
            self.room = self.room.shuffle(a["args"]["deck_id"])
        elif a["action"] == "remove_top":
            self.room = self.room.remove_top(a["args"]["deck_id"], a["args"]["n"])
        elif a["action"] == "add_top":
            card = JSONSerializer.deserialize(Card, a["args"]["card"])
            self.room = self.room.add_top(a["args"]["deck_id"], card)
        elif a["action"] == "flip_deck_card":
            self.room = self.room.flip_deck_card(a["args"]["deck_id"], a["args"]["idx"], a["args"]["face_up"])
        elif a["action"] == "flip_deck":
            self.room = self.room.flip_deck(a["args"]["deck_id"])
        elif a["action"] == "move_deck":
            # tuple?
            pass
        elif a["action"] == "remove_nth":
            self.room = self.room.remove_nth(a["args"]["hand_id"], a["args"]["n"])
        elif a["action"] == "add_card_to_hand":
            card = JSONSerializer.deserialize(Card, a["args"]["card"])
            self.room = self.room.add_card_to_hand(a["args"]["hand_id"], card)
        elif a["action"] == "flip_hand_card":
            self.room = self.room.flip_hand_card(a["args"]["hand_id"], a["args"]["idx"], a["args"]["face_up"])
        elif a["action"] == "deck_peek":
            # discuss at meeting
            pass
        elif a["action"] == "hand_peek":
            pass
    