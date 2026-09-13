import pytest
import pytest_asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.core.database import Base, get_db
from app.core.config import get_settings

settings = get_settings()

# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"
test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest_asyncio.fixture
async def auth_token(client):
    response = await client.post("/api/auth", json={"password": settings.GAME_ACCESS_PASSWORD})
    assert response.status_code == 200
    return response.json()["access_token"]


@pytest_asyncio.fixture
async def game_session(client, auth_token):
    response = await client.post(
        "/api/game/start",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    return response.json()


# ─── AUTH TESTS ───────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_auth_correct_password(client):
    response = await client.post("/api/auth", json={"password": settings.GAME_ACCESS_PASSWORD})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_auth_wrong_password(client):
    response = await client.post("/api/auth", json={"password": "wrong-password"})
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_auth_empty_password(client):
    response = await client.post("/api/auth", json={"password": ""})
    assert response.status_code == 401


# ─── GAME TESTS ───────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_start_game_requires_auth(client):
    response = await client.post("/api/game/start")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_start_game_success(client, auth_token):
    response = await client.post(
        "/api/game/start",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert data["state"] == "playing"
    assert data["attempts_remaining"] == 3
    assert len(data["characters"]) == 11
    assert len(data["locations"]) == 11
    assert len(data["clues"]) > 0
    # Solution must NOT be in response
    assert "solution" not in data
    assert "placement" not in str(data.get("characters", ""))


@pytest.mark.asyncio
async def test_get_game_state(client, auth_token, game_session):
    session_id = game_session["session_id"]
    response = await client.get(
        f"/api/game/state/{session_id}",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["session_id"] == session_id
    assert data["state"] == "playing"


@pytest.mark.asyncio
async def test_submit_wrong_solution(client, auth_token, game_session):
    from app.data.game_config import CHARACTERS, LOCATIONS
    session_id = game_session["session_id"]

    # Wrong placement (reversed)
    char_ids = [c["id"] for c in CHARACTERS]
    loc_ids = [l["id"] for l in LOCATIONS]
    wrong_placement = {char_ids[i]: loc_ids[(i + 1) % 11] for i in range(11)}

    response = await client.post(
        "/api/game/submit",
        json={"session_id": session_id, "placement": wrong_placement},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["correct"] is False
    assert data["attempts_remaining"] == 2
    assert data["game_over"] is False
    assert data["reward"] is None


@pytest.mark.asyncio
async def test_submit_correct_solution(client, auth_token, game_session):
    from app.data.game_config import SOLUTION
    session_id = game_session["session_id"]

    response = await client.post(
        "/api/game/submit",
        json={"session_id": session_id, "placement": SOLUTION["placement"]},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["correct"] is True
    assert data["game_over"] is False
    assert data["reward"] is not None
    assert "content" in data["reward"]


@pytest.mark.asyncio
async def test_game_over_after_three_attempts(client, auth_token, game_session):
    from app.data.game_config import CHARACTERS, LOCATIONS
    session_id = game_session["session_id"]

    char_ids = [c["id"] for c in CHARACTERS]
    loc_ids = [l["id"] for l in LOCATIONS]
    wrong_placement = {char_ids[i]: loc_ids[(i + 1) % 11] for i in range(11)}

    # 3 wrong attempts
    for i in range(3):
        response = await client.post(
            "/api/game/submit",
            json={"session_id": session_id, "placement": wrong_placement},
            headers={"Authorization": f"Bearer {auth_token}"}
        )
        data = response.json()
        if i < 2:
            assert data["game_over"] is False
        else:
            assert data["game_over"] is True
            assert data["correct"] is False
            assert data["reward"] is None


@pytest.mark.asyncio
async def test_cannot_submit_after_game_over(client, auth_token, game_session):
    from app.data.game_config import CHARACTERS, LOCATIONS, SOLUTION
    session_id = game_session["session_id"]

    char_ids = [c["id"] for c in CHARACTERS]
    loc_ids = [l["id"] for l in LOCATIONS]
    wrong_placement = {char_ids[i]: loc_ids[(i + 1) % 11] for i in range(11)}

    # Use all attempts
    for _ in range(3):
        await client.post(
            "/api/game/submit",
            json={"session_id": session_id, "placement": wrong_placement},
            headers={"Authorization": f"Bearer {auth_token}"}
        )

    # Now submit correct solution — should still fail
    response = await client.post(
        "/api/game/submit",
        json={"session_id": session_id, "placement": SOLUTION["placement"]},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    data = response.json()
    assert data["correct"] is False


@pytest.mark.asyncio
async def test_reward_not_sent_on_wrong_answer(client, auth_token, game_session):
    from app.data.game_config import CHARACTERS, LOCATIONS
    session_id = game_session["session_id"]

    char_ids = [c["id"] for c in CHARACTERS]
    loc_ids = [l["id"] for l in LOCATIONS]
    wrong_placement = {char_ids[i]: loc_ids[(i + 1) % 11] for i in range(11)}

    response = await client.post(
        "/api/game/submit",
        json={"session_id": session_id, "placement": wrong_placement},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    data = response.json()
    assert data["reward"] is None


@pytest.mark.asyncio
async def test_health_endpoint(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
