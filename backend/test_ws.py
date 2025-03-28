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
        request = {"action": "nothing", "args":[0]}
        await websocket.send(json.dumps(request))
        state = await websocket.recv()
        room = JSONSerializer.deserialize(BigRoom, json.loads(state))
        assert room.numPlayers()==1

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
            request = {"action": "nothing", "args":[0]}
            await websocket.send(json.dumps(request))
            state = await websocket.recv()
            room = JSONSerializer.deserialize(BigRoom, json.loads(state))
            assert x<=room.numPlayers() and room.numPlayers()<=4
            
    
    await asyncio.gather(connect("Evan"), connect("Ben"), connect("Roshan"), connect("Nathan"))
    # assert set(results) == {1, 2, 3, 4} might no
    

