from main import app
from fastapi.testclient import TestClient

def test_root():
    client = TestClient(app)
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}

def test_create_single_room():
    client = TestClient(app)
    response = client.get("/create-room")
    assert response.status_code == 200
    data = response.json()
    assert "code" in data

def test_create_multiple_rooms():
    client = TestClient(app)
    room_ids = {}
    for _ in range(100):
        response = client.get("/create-room")
        assert response.status_code == 200
        data = response.json()
        assert "code" in data
        assert data["code"] not in room_ids
        room_ids[data["code"]] = 1

def test_bad_join():
    client = TestClient(app)
    response = client.post("/join-room", json = {"room_id": "BADCODE"})
    assert response.status_code == 400
    assert "detail" in response.json()

def test_good_join():
    client = TestClient(app)
    response = client.get("/create-room")
    assert response.status_code == 200
    data = response.json()
    assert "code" in data
    response = client.post("/join-room", json={"room_id": data["code"]})
    assert response.status_code == 200
    data2 = response.json()
    assert "code" in data2
    assert data["code"] == data2["code"]