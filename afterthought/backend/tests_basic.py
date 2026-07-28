import pytest
from app.models.user import User
from app.core.security import verify_password, get_password_hash

def test_password_hashing():
    password = "supersecret"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed)
    assert not verify_password("wrongpassword", hashed)
