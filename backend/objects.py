from dataclasses import dataclass, field
import random
import copy
from typing import Tuple, List
    
@dataclass
class Deck:
    ###
    ### Deck Data
    ###
    id: str = ""
    position: Tuple[int,int] = (0,0)
    cards: List["Card"] = field(default_factory=list)

    ###
    ### Deck Manipulations
    ###
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
    
    ###
    ### Deck Inquires
    ###
    def deck_peek(self, n=0, bottom = False) -> "Card":
        if (bottom):
            return copy.copy(self.cards[len(self.cards) - n])
        else:
            return copy.copy(self.cards[n])



@dataclass
class Hand:
    ###
    ### Hand Data
    ###
    cards: List["Card"] = field(default_factory=list)

    ###
    ### Hand Manipulations
    ###
    def remove_nth(self, n) -> "Hand":
        hand = copy.copy(self)
        hand.cards = copy.copy(hand.cards)
        hand.cards.pop(n)
        return hand
    
    def add(self, card:"Card") -> "Hand":
        hand = copy.copy(self)
        hand.cards = copy.copy(hand.cards)
        hand.cards.append(card)
        return hand

    ###
    ### Hand Inquires
    ###

@dataclass
class Card:
    ###
    ### Card Data
    ###
    card_front: str  = ""
    card_back: str  = ""
    face_up: bool = False

    ###
    ### Card Manipulations
    ###
    def flip(self, new_face = None) -> "Card":
        card = copy.copy(self)
        if new_face is None:
            card.face_up = not card.face_up
        else:
            card.face_up = new_face 
        return card

    ###
    ### Card Inquires
    ###
