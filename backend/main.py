from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from functions import get_room_id
from bigroom import BigRoom

app = FastAPI()
origins = [
    "ws://127.0.0.1:8000/ws"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

room_ids = {}
rooms = {}
@app.get("/")
def root():
    return {"message": "Hello World"}

@app.get("/create-room")
def create_room():
    invite_code = get_room_id(room_ids)
    room_ids[invite_code] = 1
    rooms[invite_code] = BigRoom()
    return {"code": invite_code}

@app.post("/join-room")
def join_room(room_id: str):
    if room_id not in room_ids:
        raise HTTPException(status_code=400, detail="Room ID not found!")
    return {"code": room_id}

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(ws: WebSocket, room_id: str):
    await ws.accept()
    playerName = await ws.receive_text()
    print(f'{playerName} has joined the lobby!')
    rooms[room_id].addPlayer(playerName)
    print(rooms[room_id].numPlayers())
    try:
        while True:
            data = await ws.receive_json()
            await ws.send_json(data)
    except WebSocketDisconnect:
        rooms[room_id].removePlayer(playerName)
        print(f'{playerName} has left the lobby!')
        print(rooms[room_id].numPlayers())
