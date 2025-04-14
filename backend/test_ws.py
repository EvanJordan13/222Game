import asyncio
import websockets
import json
import pytest
from bigroom import BigRoom
from dataclasses_serialization.json import JSONSerializer

### Make sure FastAPI server is already running or this won't work!
### Make sure to refresh FastAPI server in between test runs in order to refresh server state

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
    async with websockets.connect("ws://127.0.0.1:8000/ws/mcI5j0Kx") as websocket:
        await websocket.send("Ma")
        await websocket.recv()
        request = {"action": "initialize_deck", "args":{}}
        await websocket.send(json.dumps(request))
        await websocket.recv()
        request = {"action":"remove_top", "args":{"deck_id":"standard_52_0", "n":51}}
        await websocket.send(json.dumps(request))
        await websocket.recv()
        request = {"action":"add_top", "args":{"deck_id": "standard_52_0", "card":{"card_front":"lala", "card_back":"zaza", "face_up":False}}}
        await websocket.send(json.dumps(request))
        state = await websocket.recv()
        json_room = json.loads(state)
        assert "standard_52_0" in json_room["room"]["decks"]
        my_deck = json_room["room"]["decks"]["standard_52_0"]
        assert my_deck["id"] == "standard_52_0"
        assert my_deck["position"] == [0,0]
        assert len(my_deck["cards"]) == 2
        assert my_deck["cards"][1]["card_front"] == "lala"

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
    
@pytest.mark.asyncio
async def test_multiple_connects_with_complex_requests_1():
    async def create(name):
        async with websockets.connect("ws://127.0.0.1:8000/ws/mcI5j0Ky") as websocket:
            await websocket.send(name)
            await websocket.recv()
            request = {"action": "initialize_deck", "args":{"pos":[2, 2]}}
            await websocket.send(json.dumps(request))
    async def connect(name):
        async with websockets.connect("ws://127.0.0.1:8000/ws/mcI5j0Ky") as websocket:
            await websocket.send(name)
            state = await websocket.recv()
            json_room = json.loads(state)
            assert "standard_52_0" in json_room["room"]["decks"]
            request = {"action": "remove_top", "args": {"deck_id": "standard_52_0", "n": 1}}
            await websocket.send(json.dumps(request))
            state = await websocket.recv()
            json_room = json.loads(state)
            my_deck = json_room["room"]["decks"]["standard_52_0"]
            assert len(my_deck["cards"]) < 52 and len(my_deck["cards"]) > 47
    await asyncio.create_task(create("Vishal"))
    await asyncio.gather(connect("Evan"), connect("Ben"), connect("Roshan"), connect("Nathan"))

@pytest.mark.asyncio
async def test_multiple_connects_with_add_and_remove():
    async def create(name):
        async with websockets.connect("ws://127.0.0.1:8000/ws/mcI5j0Kz") as websocket:
            await websocket.send(name)
            await websocket.recv()
            request = {"action": "initialize_deck", "args":{"pos":[2, 2]}}
            await websocket.send(json.dumps(request))
    async def add(name):
        async with websockets.connect("ws://127.0.0.1:8000/ws/mcI5j0Kz") as websocket:
            await websocket.send(name)
            for i in range(10):
                await websocket.recv()
                request = {"action":"add_top", "args":{"deck_id": "standard_52_0", "card":{"card_front":"lala", "card_back":"zaza", "face_up":False}}}
                await websocket.send(json.dumps(request))
    async def subtract(name):
        async with websockets.connect("ws://127.0.0.1:8000/ws/mcI5j0Kz") as websocket:
            await websocket.send(name)
            for i in range(11):
                await websocket.recv()
                request = {"action":"remove_top", "args":{"deck_id": "standard_52_0", "n": 1}}
                await websocket.send(json.dumps(request))
    async def verify(name):
        async with websockets.connect("ws://127.0.0.1:8000/ws/mcI5j0Kz") as websocket:
            await websocket.send(name)
            state = await websocket.recv()
            json_room = json.loads(state)
            assert "standard_52_0" in json_room["room"]["decks"]
            assert len(json_room["room"]["decks"]["standard_52_0"]["cards"]) == 50
    await asyncio.create_task(create("Vishal"))
    await asyncio.gather(add("Evan"), add("Roshan"), subtract("Nathan"), subtract("Ben"))
    await asyncio.create_task(verify("Vishal"))