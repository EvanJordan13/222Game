import asyncio
import websockets
import json

async def test_websocket(room_id):
    async with websockets.connect(f"ws://127.0.0.1:8000/ws/{room_id}") as websocket:
        name = input("Enter player name: ")
        await websocket.send(name)
        while True:
            message = input("Enter JSON data: ")
            try:
                message = json.loads(message)
            except:
                break
            await websocket.send(json.dumps(message))  
            print(f"Room {room_id} sent: {message}")
            response = await websocket.recv()  
            print(f"Room {room_id} received: {json.loads(response)}")

# Run the async function
async def main():
    x = input("Enter room ID: ")
    t1 = asyncio.create_task(test_websocket(x))
    t2 = asyncio.create_task(test_websocket(x))
    await asyncio.gather(t1, t2)

asyncio.run(main())