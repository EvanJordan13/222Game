from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from functions import get_room_id
from bigroom import BigRoom
from models import JoinRoomRequest
from dataclasses_serialization.json import JSONSerializer
import json

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
id_list = ["mcI5j0Kw", "mcI5j0Kx", "mcI5j0Ky", "mcI5j0Kz"]
for id in id_list:
    room_ids[id] = 1
    rooms[id] = BigRoom()

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
def join_room(request: JoinRoomRequest):
    if request.room_id not in room_ids:
        raise HTTPException(status_code=400, detail="Room ID not found!")
    return {"code": request.room_id}

@app.websocket("/ws/{room_id}")
async def websocket_endpoint(ws: WebSocket, room_id: str):
    await ws.accept()
    playerName = await ws.receive_text()
    rooms[room_id].addPlayer(playerName)
    await ws.send_json(JSONSerializer.serialize(rooms[room_id]))
    try:
        while True:
            action = await ws.receive_json()
            rooms[room_id].updateState(action)
            await ws.send_json(JSONSerializer.serialize(rooms[room_id]))
    except WebSocketDisconnect:
        rooms[room_id].removePlayer(playerName)
