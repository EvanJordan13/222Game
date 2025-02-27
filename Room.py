from dataclasses import dataclass
import copy 
import random
@dataclass 
class Room:
    players = []
    decks = {}
    hands = {}
    
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
    

    
@dataclass
class Deck:
    id = ""
    cards = []
    def shuffle(self) -> "Deck":
        deck = copy.copy(self)
        deck.cards = copy.copy(deck.cards)
        random.shuffle(deck.cards)
        return deck

    def remove_top(self, n=1) -> "Deck":
        deck = copy.copy(self)
        deck.cards = deck.cards[:-n]
        return deck
    
    def add_top(self, card:"Card") -> "Deck":
        deck = copy.copy(self)
        deck.cards = copy.copy(deck.cards)
        deck.cards.append(card)
        return deck

@dataclass
class Hand:
    cards = []
    def remove_nth(self, n) -> "Hand":
        hand = copy.copy(self)
        hand.cards = copy.copy(hand.cards)
        hand.cards.pop(n)
        return hand
    
    def add():#TODO
        return 
@dataclass
class Card:
    png = ""