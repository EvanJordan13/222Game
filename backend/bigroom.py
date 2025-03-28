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
            self.room.shuffle(action["args"][0])
        elif action["action"] == "nothing":
            pass
        #TODO integrate other functions
    