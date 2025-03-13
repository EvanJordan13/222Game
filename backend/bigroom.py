from gamestate import room

class BigRoom:
    def __init__(self):
        self.players = []
        self.room = room.Room()
    
    def addPlayer(self, playerName):
        self.players.append(playerName)
    
    def numPlayers(self):
        return len(self.players)
    
    def updateState(self, action):
        if action["name"] == "shuffle":
            self.room.shuffle(action["args"][0])
        #TODO integrate other functions