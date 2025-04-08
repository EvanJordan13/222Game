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

def test_initialize_standard52_deck_creates_new_room():
    original_room = Room()  # No decks initially

    # Call initialize_deck and unpack results
    new_room, deck_id = original_room.initialize_deck(deck_type="standard52")

    # Original room should be unchanged
    assert len(original_room.decks) == 0

    # New room should have one deck with the given ID
    assert len(new_room.decks) == 1
    assert deck_id in new_room.decks

    # Get and verify the deck
    deck = new_room.decks[deck_id]
    assert len(deck.cards) == 52

    card_fronts = [card.card_front for card in deck.cards]
    assert len(set(card_fronts)) == 52  # Unique cards
    assert "H2" in card_fronts
    assert "DQ" in card_fronts
    assert "SK" in card_fronts
    assert "CA" in card_fronts


def test_room_flip_deck():
    """
    Tests that flipping a deck:
      1) Reverses the card order and toggles face_up status in the new room.
      2) Does not mutate the original room.
    """
    # Original room setup
    original_deck = Deck(cards=[
        Card(card_front="A", face_up=True),
        Card(card_front="K", face_up=False),
        Card(card_front="Q", face_up=True),
    ])
    room = Room(decks={"main": original_deck})

    # Flip the deck in a new room
    new_room = room.flip_deck("main")

    # -- Check original room is unchanged --
    # Deck order
    assert [card.card_front for card in room.decks["main"].cards] == ["A", "K", "Q"]
    # Face-up states
    assert [card.face_up for card in room.decks["main"].cards] == [True, False, True]

    # -- Check new room is changed --
    flipped_cards = new_room.decks["main"].cards
    # Order should be reversed
    assert [card.card_front for card in flipped_cards] == ["Q", "K", "A"]
    # Face-up statuses should be toggled
    assert [card.face_up for card in flipped_cards] == [False, True, False]

def test_room_split_deck():
    """
    Tests that splitting a deck:
      1) Creates a new deck with the top N cards in the new room.
      2) Removes those N cards from the original deck in the new room.
      3) Does not mutate the original room.
    """
    # Original room setup
    original_deck = Deck(cards=[
        Card(card_front="A"),
        Card(card_front="K"),
        Card(card_front="Q"),
        Card(card_front="J"),
        Card(card_front="10"),
        Card(card_front="9"),
    ])
    room = Room(decks={"main": original_deck})

    # Split off the top 2 cards into a new deck
    new_room, new_deck_id = room.split_deck("main", n=2, pos="split1")

    # -- Check original room is unchanged --
    assert len(room.decks) == 1  # only "main" deck
    assert [c.card_front for c in room.decks["main"].cards] == ["A", "K", "Q", "J", "10", "9"]

    # -- Check new room has two decks --
    assert len(new_room.decks) == 2
    assert "main" in new_room.decks
    assert new_deck_id in new_room.decks  # should be "main_copy"

    # The new deck should have the top 2 cards (last two in original order)
    split_deck = new_room.decks[new_deck_id].cards
    assert [c.card_front for c in split_deck] == ["10", "9"]

    # The main deck in the new room should have the remaining 4 cards (top 2 removed)
    main_deck_in_new_room = new_room.decks["main"].cards
    assert [c.card_front for c in main_deck_in_new_room] == ["A", "K", "Q", "J"]
