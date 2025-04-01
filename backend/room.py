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

    ###################
    ### Room Macros ###
    ###################
    #draws cards from a deck to a hand
    #arg1 name of hand
    #arg2 name of deck
    #arg3 optional. number of cards to draw. default 1
    #arg4 optional. bool for if to draw from bottom. default False
    def draw_card(self, hand_id, deck_id, n=1, from_bottom = False) -> "Room":
        if n > len(self.decks[deck_id].cards):
            return self
        room = copy.copy(self)
        room.decks = copy.copy(room.decks)
        room.hands = copy.copy(room.hands)
        room.hands[hand_id] = copy.copy(room.hands[hand_id])
        room.decks[deck_id] = copy.copy(room.decks[deck_id])

        hand = room.hands[hand_id]
        deck = room.decks[deck_id]
        for i in range(n):
            hand = hand.add(deck.deck_peek(i, from_bottom))

        if from_bottom:
            room.decks[deck_id] = deck.remove_bottom(n)
        else:
            room.decks[deck_id] = deck.remove_top(n)

        room.hands[hand_id] = hand
        return room
    
    #initializes a deck and returns the new room and deck id

    def initialize_deck(self, pos = (0,0), deck_type ="standard52") -> tuple["Room", str]:
        match deck_type:
            case "standard52":
                room = copy.copy(self)
                room.decks = copy.copy(room.decks)

                deck_id = "standard_52_" + str(len(room.decks))

                def rank_to_str(rank):
                    return {11: "J", 12: "Q", 13: "K", 14: "A"}.get(rank, str(rank))
                
                deck = Deck(id= deck_id, position= pos, cards=[
                    Card(card_front=suit + rank_to_str(rank))
                    for rank in range(2, 15)
                    for suit in ["H", "D", "S", "C"]
                ])

                room.decks[deck_id] = deck
                return room, deck_id
                
            case _ :
                return self, ""



    ##########################
    ### Deck Manipulations ###
    ##########################
    
    #shuffles a deck
    #arg1 name of deck 
    def shuffle(self, deck_id) -> "Room":
        room = copy.copy(self)
        room.decks = copy.copy(room.decks)
        room.decks[deck_id] = room.decks[deck_id].shuffle()
        return room
    
    #removes top card from a deck. removes top n if given
    #arg1 name of deck
    #arg2 number of cards removed. default 1
    def remove_top(self, deck_id, n=1) -> "Room":
        room = copy.copy(self)
        room.decks = copy.copy(room.decks)
        room.decks[deck_id] = room.decks[deck_id].remove_top(n)
        return room

    #adds a card to the top of a deck.
    #arg1 name of deck
    #arg2 card
    def add_top(self, deck_id, card: "Card") -> "Room":
        room = copy.copy(self)
        room.decks[deck_id] = room.decks[deck_id].add_top(card)
        return room
    
    #flips top card from a deck. flips (idx)th card if given
    #arg1 name of deck
    #arg2 card idx to flip. default 0
    #arg3 bool for if the card is now face_up. default to flipping to what it currently isn't
    def flip_deck_card(self, deck_id, idx=0, face_up = None) -> "Room":
        room = copy.copy(self)
        room.decks[deck_id] = copy.copy(room.decks[deck_id])
        room.decks[deck_id].cards[idx] = room.decks[deck_id].cards[idx].flip(face_up)
        return room
    
    #changes location of the deck
    #arg1 tuple of new (x,y) location
    def move_deck(self, deck_id, tuple) -> "Room":
        room = copy.copy(self)
        room.decks[deck_id] = room.decks[deck_id].move_deck()

    ##########################
    ### Hand Manipulations ###
    ##########################

    #removes nth card from a hand
    #arg1 name of hand
    #arg2 target number of card
    def remove_nth(self, hand_id, n) -> "Room":
        room = copy.copy(self)
        room.hands[hand_id] = room.hands[hand_id].remove_nth(n)
        return room

    #adds a card to a hand
    #arg1 name of hand
    #arg2 card to add
    def add_card_to_hand(self, hand_id, card: "Card") -> "Room":
        room = copy.copy(self)
        room.hands[hand_id] = room.hands[hand_id].add(card)
        return room

    #Flips (idx)th card from a hand
    #arg1 name of deck
    #arg2 card idx to flip
    #arg3 bool for if the card is now face_up. default to flipping to what it currently isn't
    def flip_hand_card(self, hand_id, idx, face_up = None) -> "Room":
        room = copy.copy(self)
        room.hands[hand_id].cards[idx] = room.hands[hand_id].cards[idx].flip(face_up)
        return room

    #############
    # Inquires do not return a Room and do not modify the current Room 
    #############

    ### Deck Inquires ###

    #returns a copy of the 0-indexed nth card of a deck. returns None if OOB
    #arg1 name of deck
    #arg2 index to get. default 0
    #arg3 bool for if we are indexing from the bottom. default False
    def deck_peek(self, deck_id, n=0, bottom = False) -> "Card":
        return self.decks[deck_id].deck_peek(n,bottom)


    ### Hand Inquires ###

    #returns a copy of the 0-indexed nth card of a hand. returns None if OOB
    #arg1 name of hand
    #arg2 index to get
    def hand_peek(self, hand_id, n) -> "Card":
        return self.hands[hand_id].hand_peek(n)


    ### Card Inquires ###

