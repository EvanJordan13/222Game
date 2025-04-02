from room import Room
from typing import List
from dataclasses import dataclass, field

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
    
    def updateState(self, action):
        if action["action"] == "shuffle":
            self.room.shuffle(action["args"]["deck_id"])
        elif action["action"] == "nothing":
            pass
        elif action["action"] == "initialize_deck":
            x = 0
            y = 0
            if "pos" in action["args"]:
                x = action["args"]["pos"][0]
                y = action["args"]["pos"][1]
            deck_type = "standard52"
            if "deck_type" in action["args"]:
                deck_type = action["args"]["deck_type"]
            print(x, y, deck_type)
            self.room, deck_id = self.room.initialize_deck([x,y], deck_type)

        #TODO integrate other functions
    