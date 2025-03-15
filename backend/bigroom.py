from room import Room

class BigRoom:
    def __init__(self):
        self.players = []
        self.room = Room()
    
    def addPlayer(self, playerName):
        self.players.append(playerName)
    
    def removePlayer(self, playerName):
        self.players.remove(playerName)

    def numPlayers(self):
        return len(self.players)
    
    def updateState(self, action):
        if action["name"] == "shuffle":
            self.room.shuffle(action["args"][0])
        #TODO integrate other functions