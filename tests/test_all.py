import pytest
from gamestate.objects import Deck, Hand, Card
from gamestate.room import Room


def test_card_flip():
    card = Card(card_front="Ace", card_back="Back", face_up=False)
    flipped_card = card.flip()
    assert flipped_card.face_up is True

    flipped_card = card.flip(new_face=True)
    assert flipped_card.face_up is True

    flipped_card = card.flip(new_face=False)
    assert flipped_card.face_up is False


def test_deck_shuffle():
    deck = Deck(cards=[Card(card_front=str(i)) for i in range(5)])
    shuffled_deck = deck.shuffle()
    assert len(shuffled_deck.cards) == 5
    assert set(c.card_front for c in shuffled_deck.cards) == {"0", "1", "2", "3", "4"}
    assert shuffled_deck.cards != deck.cards  # high chance it's shuffled


def test_deck_remove_top():
    deck = Deck(cards=[Card(card_front=str(i)) for i in range(5)])
    new_deck = deck.remove_top()
    assert len(new_deck.cards) == 4
    assert new_deck.cards[-1].card_front == "3"


def test_deck_add_top():
    card = Card(card_front="Joker")
    deck = Deck(cards=[])
    new_deck = deck.add_top(card)
    assert len(new_deck.cards) == 1
    assert new_deck.cards[-1].card_front == "Joker"


def test_hand_add_remove():
    card1 = Card(card_front="Queen")
    hand = Hand(cards=[])
    new_hand = hand.add(card1)
    assert len(new_hand.cards) == 1
    assert new_hand.cards[0].card_front == "Queen"

    new_hand = new_hand.remove_nth(0)
    assert len(new_hand.cards) == 0


def test_room_deck_operations():
    room = Room(
        decks={"main": Deck(cards=[Card(card_front="Ace"), Card(card_front="King")])}
    )
    room = room.shuffle("main")
    assert len(room.decks["main"].cards) == 2

    room = room.remove_top("main")
    assert len(room.decks["main"].cards) == 1

    new_card = Card(card_front="Joker")
    room = room.add_top("main", new_card)
    assert len(room.decks["main"].cards) == 2
    assert room.decks["main"].cards[-1].card_front == "Joker"


def test_room_flip_deck_card():
    room = Room(
        decks={"main": Deck(cards=[Card(card_front="Ace", face_up=False)])}
    )
    room = room.flip_deck_card("main")
    assert room.decks["main"].cards[0].face_up is True


def test_room_hand_operations():
    room = Room(
        hands={"player1": Hand(cards=[Card(card_front="3"), Card(card_front="5")])}
    )
    new_card = Card(card_front="Queen")
    room = room.add_card_to_hand("player1", new_card)
    assert len(room.hands["player1"].cards) == 3

    room = room.remove_nth("player1", 1)
    assert len(room.hands["player1"].cards) == 2
    assert room.hands["player1"].cards[1].card_front == "Queen"

    room = room.flip_hand_card("player1", 0)
    assert room.hands["player1"].cards[0].face_up is True
