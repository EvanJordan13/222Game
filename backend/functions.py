import secrets, string

def get_room_id(room_ids):
    characters = string.ascii_letters + string.digits
    invite = ''.join(secrets.choice(characters) for _ in range(8))
    while invite in room_ids:
        invite = ''.join(secrets.choice(characters) for _ in range(8))
    return invite