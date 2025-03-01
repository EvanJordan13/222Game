from dataclasses import dataclass
import random
import copy
    
@dataclass
class Deck:
    id = ""
    position = (0,0)
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