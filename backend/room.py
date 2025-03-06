class Room:
    def __init__(self):
        self.players = 0
    
    def addPlayer(self, ct):
        self.players += ct
    
    def numPlayers(self):
        return self.players