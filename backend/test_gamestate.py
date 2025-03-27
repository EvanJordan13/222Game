import pytest
from objects import Deck, Hand, Card
from room import Room


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


def test_room_deck_peek():
    room = Room(decks={"main": Deck(cards=[Card(card_front="Ace"), Card(card_front="King")])})
    
    top_card = room.deck_peek("main")
    assert top_card.card_front == "King"
    
    bottom_card = room.deck_peek("main", bottom=True)
    assert bottom_card.card_front == "Ace"
    
    out_of_bounds_card = room.deck_peek("main", n=5)
    assert out_of_bounds_card is None


def test_room_hand_peek():
    room = Room(hands={"player1": Hand(cards=[Card(card_front="3"), Card(card_front="5")])})
    
    card = room.hand_peek("player1", 1)
    assert card.card_front == "5"
    
    out_of_bounds_card = room.hand_peek("player1", 5)
    assert out_of_bounds_card is None


def test_room_flip_hand_card():
    room = Room(
        hands={"player1": Hand(cards=[Card(card_front="3", face_up=False)])}
    )
    room = room.flip_hand_card("player1", 0)
    assert room.hands["player1"].cards[0].face_up is True


def test_room_multiple_shuffles():
    room = Room(
        decks={"main": Deck(cards=[Card(card_front=str(i)) for i in range(10)])}
    )
    shuffled_deck_1 = room.shuffle("main")
    shuffled_deck_2 = shuffled_deck_1.shuffle("main")
    assert len(shuffled_deck_2.decks["main"].cards) == 10
    assert shuffled_deck_1.decks["main"].cards != shuffled_deck_2.decks["main"].cards


def test_room_multiple_adds_removes():
    room = Room(hands={"player1": Hand(cards=[])})
    
    card1 = Card(card_front="Queen")
    card2 = Card(card_front="King")
    room = room.add_card_to_hand("player1", card1)
    room = room.add_card_to_hand("player1", card2)
    
    assert len(room.hands["player1"].cards) == 2
    
    room = room.remove_nth("player1", 0)
    assert len(room.hands["player1"].cards) == 1
    assert room.hands["player1"].cards[0].card_front == "King"


def test_room_remove_top_multiple():
    room = Room(decks={"main": Deck(cards=[Card(card_front=str(i)) for i in range(5)])})
    
    room = room.remove_top("main", n=2)
    assert len(room.decks["main"].cards) == 3
    print(room.decks["main"])
    assert room.decks["main"].deck_peek().card_front == "2"


def test_room_flip_specific_deck_card():
    room = Room(decks={"main": Deck(cards=[Card(card_front="Ace", face_up=False), Card(card_front="King", face_up=True)])})
    
    room = room.flip_deck_card("main", 1, face_up=False)
    assert room.decks["main"].cards[1].face_up is False


def test_room_flip_specific_hand_card():
    room = Room(hands={"player1": Hand(cards=[Card(card_front="3", face_up=False), Card(card_front="5", face_up=True)])})
    
    room = room.flip_hand_card("player1", 1, face_up=False)
    assert room.hands["player1"].cards[1].face_up is False

def test_room_draw_card():
    # Setup: deck has 3 cards, hand is empty
    room = Room(
        decks={"main": Deck(cards=[
            Card(card_front="1"),
            Card(card_front="2"),
            Card(card_front="3")
        ])},
        hands={"player1": Hand(cards=[])}
    )

    # Default draw (1 card from top)
    room = room.draw_card("player1", "main")
    assert len(room.decks["main"].cards) == 2
    assert len(room.hands["player1"].cards) == 1
    assert room.hands["player1"].cards[0].card_front == "3"  # top of deck

    # Draw 2 cards from bottom
    room = room.draw_card("player1", "main", n=2, from_bottom=True)
    assert len(room.decks["main"].cards) == 0
    assert len(room.hands["player1"].cards) == 3
    assert room.hands["player1"].cards[1].card_front == "1"  # first drawn from bottom
    assert room.hands["player1"].cards[2].card_front == "2"  # second drawn from bottom

    # Try drawing from empty deck
    room = room.draw_card("player1", "main")
    assert len(room.decks["main"].cards) == 0  # still empty
    assert len(room.hands["player1"].cards) == 3  # no new cards added

def test_room_draw_card_new():
    # Setup original room
    original_deck = Deck(cards=[
        Card(card_front="1"),
        Card(card_front="2"),
        Card(card_front="3")
    ])
    original_hand = Hand(cards=[])

    room = Room(
        decks={"main": original_deck},
        hands={"player1": original_hand}
    )

    # Draw a card into a new room instance
    new_room = room.draw_card("player1", "main")

    # Assert original room was not changed
    assert len(room.decks["main"].cards) == 3
    assert len(room.hands["player1"].cards) == 0

    # Assert new room reflects the change
    assert len(new_room.decks["main"].cards) == 2
    assert len(new_room.hands["player1"].cards) == 1
    assert new_room.hands["player1"].cards[0].card_front == "3"  # drew from top

