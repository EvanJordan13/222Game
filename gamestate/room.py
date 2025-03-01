from dataclasses import dataclass
from deck import Deck, Hand, Card
import copy 
import random

@dataclass 
class Room:
    players = []
    decks = {}
    hands = {}
    
    ### Deck Manipulations ###
    
    #shuffles a deck
    #arg1: name of deck 
    def shuffle(self, deck_id) -> "Room":
        room = copy.copy(self)
        room.decks[deck_id] = room.decks[deck_id].shuffle()
        return room
    
    #removes top card from a deck. removes top n if given
    #arg1: name of deck
    #arg2: number of cards removed. default 0
    def remove_top(self, deck_id, n=1) -> "Room":
        room = copy.copy(self)

        room.decks[deck_id] = room.decks[deck_id].remove_top(n)
        return room

    #adds a card to the top of a deck.
    #arg1: name of deck
    #arg2: card
    def add_top(self, deck_id, card:"Card") -> "Room":
        room = copy.copy(self)
        room.decks[deck_id] = room.decks[deck_id].add_top(card)
        return room
    
    ### Hand Manipulations ###





    ### Card Manipulations ###




    ### Deck Inquires ###



    ### Hand Inquires ###



    ### Card Inquires ###

