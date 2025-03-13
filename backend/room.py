from dataclasses import dataclass, field
from typing import List, Dict
from objects import Deck, Hand, Card
import copy 
import random

@dataclass 
class Room:
    players: List[str] = field(default_factory=list)
    decks: Dict[str, Deck] = field(default_factory=dict)
    hands: Dict[str, Hand] = field(default_factory=dict)


    ##########################
    ### Deck Manipulations ###
    ##########################
    
    #shuffles a deck
    #arg1: name of deck 
    def shuffle(self, deck_id) -> "Room":
        room = copy.copy(self)
        room.decks[deck_id] = room.decks[deck_id].shuffle()
        return room
    
    #removes top card from a deck. removes top n if given
    #arg1: name of deck
    #arg2: number of cards removed. default 1
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
    
    #flips top card from a deck. flips (idx)th card if given
    #arg1: name of deck
    #arg2: card idx to flip. default 0
    #arg3: bool for if the card is now face_up. default to flipping to what it currently isn't
    def flip_deck_card(self, deck_id, idx=0, face_up = None) -> "Room":
        room = copy.copy(self)
        room.decks[deck_id].cards[idx] = room.decks[deck_id].cards[idx].flip(face_up)
        return room

    ##########################
    ### Hand Manipulations ###
    ##########################

    #removes nth card from a hand
    #arg1: name of hand
    #arg2: target number of card
    def remove_nth(self, hand_id, n)-> "Room":
        room = copy.copy(self)
        room.hands[hand_id] = room.hands[hand_id].remove_nth(n)
        return room

    #adds a card to a hand
    #arg1: name of hand
    #arg2: card to add
    def add_card_to_hand(self, hand_id, card:"Card") -> "Room":
        room = copy.copy(self)
        room.hands[hand_id] = room.hands[hand_id].add(card)
        return room

    #Flips (idx)th card from a hand
    #arg1: name of deck
    #arg2: card idx to flip
    #arg3: bool for if the card is now face_up. default to flipping to what it currently isn't
    def flip_hand_card(self, hand_id, idx, face_up = None) -> "Room":
        room = copy.copy(self)
        room.hands[hand_id].cards[idx] = room.hands[hand_id].cards[idx].flip(face_up)
        return room



    ### Deck Inquires ###



    ### Hand Inquires ###



    ### Card Inquires ###

