import asyncio
import websockets
import json
import pytest
from bigroom import BigRoom
from dataclasses_serialization.json import JSONSerializer

### Make sure FastAPI server is already running or this won't work!

@pytest.mark.asyncio
async def test_single_connection():
    async with websockets.connect("ws://127.0.0.1:8000/ws/mcI5j0Kw") as websocket:
        await websocket.send("Ma")
        state = await websocket.recv()
        room = JSONSerializer.deserialize(BigRoom, json.loads(state))
        assert room.numPlayers() == 1

@pytest.mark.asyncio
async def test_single_connection_with_request():
    async with websockets.connect("ws://127.0.0.1:8000/ws/mcI5j0Kw") as websocket:
        await websocket.send("Ma")
        state = await websocket.recv()
        room = JSONSerializer.deserialize(BigRoom, json.loads(state))
        assert room.numPlayers()==1
        request = {"action": "initialize_deck", "args":{"pos":[2, 2]}}
        await websocket.send(json.dumps(request))
        state = await websocket.recv()
        json_room = json.loads(state)
        assert "standard_52_0" in json_room["room"]["decks"]
        my_deck = json_room["room"]["decks"]["standard_52_0"]
        assert my_deck["id"] == "standard_52_0"
        assert my_deck["position"] == [2,2]
        assert len(my_deck["cards"]) == 52
        card_fronts = [card["card_front"] for card in my_deck["cards"]]
        assert "H2" in card_fronts
        assert "DQ" in card_fronts
        assert "SK" in card_fronts
        assert "CA" in card_fronts
        room = JSONSerializer.deserialize(BigRoom, json_room)
        assert room.numPlayers()==1

@pytest.mark.asyncio
async def test_single_connection_with_complex_request():
    async with websockets.connect("ws://127.0.0.1:8000/ws/mcI5j0Kw") as websocket:
        await websocket.send("Ma")
        state = await websocket.recv()
        room = JSONSerializer.deserialize(BigRoom, json.loads(state))

@pytest.mark.asyncio
async def test_multiple_connections():
    
    async def connect(name):
        async with websockets.connect("ws://127.0.0.1:8000/ws/mcI5j0Kw") as websocket:
            await websocket.send(name)
            state = await websocket.recv()
            room = JSONSerializer.deserialize(BigRoom, json.loads(state))
            return room.numPlayers()
    
    results = await asyncio.gather(connect("Evan"), connect("Ben"), connect("Roshan"), connect("Nathan"))

    assert len(results) == 4
    assert set(results) == {1, 2, 3, 4}


@pytest.mark.asyncio
async def test_multiple_connections_with_requests():
    
    async def connect(name):
        async with websockets.connect("ws://127.0.0.1:8000/ws/mcI5j0Kw") as websocket:
            await websocket.send(name)
            state = await websocket.recv()
            room = JSONSerializer.deserialize(BigRoom, json.loads(state))
            x = room.numPlayers()
            assert 1<=room.numPlayers() and room.numPlayers()<=4
            request = {"action": "initialize_deck", "args":{"pos":[2, 2]}}
            await websocket.send(json.dumps(request))
            state = await websocket.recv()
            json_room = json.loads(state)
            assert f"standard_52_{x-1}" in json_room["room"]["decks"]
            my_deck = json_room["room"]["decks"][f"standard_52_{x-1}"]
            assert my_deck["id"] == f"standard_52_{x-1}"
            assert my_deck["position"] == [2,2]
            assert len(my_deck["cards"]) == 52
            card_fronts = [card["card_front"] for card in my_deck["cards"]]
            assert "H2" in card_fronts
            assert "DQ" in card_fronts
            assert "SK" in card_fronts
            assert "CA" in card_fronts
            room = JSONSerializer.deserialize(BigRoom, json.loads(state))
            assert x<=room.numPlayers() and room.numPlayers()<=4
            
    
    await asyncio.gather(connect("Evan"), connect("Ben"), connect("Roshan"), connect("Nathan"))
    

