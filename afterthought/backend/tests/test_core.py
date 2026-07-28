from datetime import timedelta

from jose import jwt

from app.core.content import sanitize_editorial_html
from app.core.security import ALGORITHM, SECRET_KEY, create_access_token, get_password_hash, verify_password


def test_password_hash_and_access_token_claims():
    password = "correct horse battery staple"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed)
    assert not verify_password("incorrect password", hashed)
    token = create_access_token({"sub": "42"}, timedelta(minutes=5))
    claims = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert claims["sub"] == "42"
    assert claims["type"] == "access"
    assert claims["jti"]
    assert claims["iat"] < claims["exp"]


def test_editorial_html_sanitizer_removes_active_content():
    dirty = (
        '<h2 onclick="steal()">Safe title</h2>'
        '<script>alert("x")</script>'
        '<a href="javascript:alert(1)">bad</a>'
        '<a href="https://example.com" target="_blank">good</a>'
    )
    clean = sanitize_editorial_html(dirty)
    assert 'onclick' not in clean
    assert "script" not in clean
    assert "alert" not in clean
    assert 'href="javascript:' not in clean
    assert 'href="https://example.com"' in clean
    assert 'rel="nofollow noopener noreferrer"' in clean
