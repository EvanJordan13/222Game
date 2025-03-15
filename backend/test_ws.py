import asyncio
import websockets
import json
import pytest
from main import app
from fastapi.testclient import TestClient

### Make sure FastAPI server is already running or this won't work!

@pytest.mark.asyncio
async def test_single_connection():
    async with websockets.connect("ws://127.0.0.1:8000/ws/mcI5j0Kw") as websocket:
        await websocket.send("Ma")
        request = {"speed": 100}
        await websocket.send(json.dumps(request))
        response = await websocket.recv()
        data = json.loads(response)
        assert "speed" in data
        assert data["speed"] == 100

@pytest.mark.asyncio
async def test_multiple_connections():
    
    async def connect_and_send(name, request):
        async with websockets.connect("ws://127.0.0.1:8000/ws/mcI5j0Kw") as websocket:
            await websocket.send(name)
            await websocket.send(json.dumps(request))
            response = await websocket.recv()
            data = json.loads(response)
            return data
    
    response1 = await asyncio.create_task(connect_and_send("Joe", {"age": 32}))
    response2 = await asyncio.create_task(connect_and_send("Jill", {"age": 53}))

    assert "age" in response1 and "age" in response2
    assert response1["age"] == 32
    assert response2["age"] == 53