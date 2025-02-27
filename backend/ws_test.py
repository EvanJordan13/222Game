import asyncio
import websockets
import json

async def test_websocket():
    async with websockets.connect("ws://127.0.0.1:8000/ws") as websocket:
        message = input("Enter JSON data: ")
        message = json.loads(message)
        while message["done"] == "no":
            await websocket.send(json.dumps(message))  
            print(f"Sent: {message}")
            response = await websocket.recv()  
            print(f"Received: {json.loads(response)}")
            message = input("Enter JSON data: ")
            message = json.loads(message)

# Run the async function
asyncio.run(test_websocket())