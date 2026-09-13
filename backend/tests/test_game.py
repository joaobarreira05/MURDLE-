"""
Integration tests for MURDOKU game API.
"""

import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession

from app.main import app
from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.data.game_config import CHARACTERS, LOCATIONS, SOLUTION

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(scope="function")
async def test_engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def test_db(test_engine):
    session_factory = async_sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )
    async with session_factory() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def client(test_db):
    async def override_get_db():
        yield test_db

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
def auth_token():
    return create_access_token({"type": "auth"})


@pytest_asyncio.fixture
async def game_session(client, auth_token):
    response = await client.post(
        "/api/game/start",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    return response.json()


# ─── AUTH TESTS ───────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_auth_correct_password(client):
    response = await client.post(
        "/api/auth",
        json={"password": "DETI2026"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_auth_wrong_password(client):
    response = await client.post(
        "/api/auth",
        json={"password": "wrongpassword"}
    )
    assert response.status_code == 401
    assert "detail" in response.json()


@pytest.mark.asyncio
async def test_game_requires_auth(client):
    response = await client.post("/api/game/start")
    assert response.status_code in (401, 403)


# ─── GAME LIFECYCLE TESTS ─────────────────────────────────────────────────────

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
    assert len(data["characters"]) == len(CHARACTERS)
    assert len(data["locations"]) == len(LOCATIONS)
    assert len(data["clues"]) > 0
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
    session_id = game_session["session_id"]
    char_ids = [c["id"] for c in CHARACTERS]
    loc_ids = [l["id"] for l in LOCATIONS]
    n = len(char_ids)
    wrong_placement = {char_ids[i]: loc_ids[(i + 1) % n] for i in range(n)}

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
    session_id = game_session["session_id"]
    char_ids = [c["id"] for c in CHARACTERS]
    loc_ids = [l["id"] for l in LOCATIONS]
    n = len(char_ids)
    wrong_placement = {char_ids[i]: loc_ids[(i + 1) % n] for i in range(n)}

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
    session_id = game_session["session_id"]
    char_ids = [c["id"] for c in CHARACTERS]
    loc_ids = [l["id"] for l in LOCATIONS]
    n = len(char_ids)
    wrong_placement = {char_ids[i]: loc_ids[(i + 1) % n] for i in range(n)}

    for _ in range(3):
        await client.post(
            "/api/game/submit",
            json={"session_id": session_id, "placement": wrong_placement},
            headers={"Authorization": f"Bearer {auth_token}"}
        )

    response = await client.post(
        "/api/game/submit",
        json={"session_id": session_id, "placement": SOLUTION["placement"]},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    data = response.json()
    assert data["correct"] is False


@pytest.mark.asyncio
async def test_reward_not_sent_on_wrong_answer(client, auth_token, game_session):
    session_id = game_session["session_id"]
    char_ids = [c["id"] for c in CHARACTERS]
    loc_ids = [l["id"] for l in LOCATIONS]
    n = len(char_ids)
    wrong_placement = {char_ids[i]: loc_ids[(i + 1) % n] for i in range(n)}

    response = await client.post(
        "/api/game/submit",
        json={"session_id": session_id, "placement": wrong_placement},
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert response.json()["reward"] is None


@pytest.mark.asyncio
async def test_save_and_restore_placement(client, auth_token, game_session):
    session_id = game_session["session_id"]
    partial_placement = {"barreira": "2_2", "varela": "8_1"}
    marked_clues = ["clue_01", "clue_02"]

    save_res = await client.post(
        "/api/game/save",
        json={
            "session_id": session_id,
            "placement": partial_placement,
            "marked_clues": marked_clues,
        },
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert save_res.status_code == 200

    state_res = await client.get(
        f"/api/game/state/{session_id}",
        headers={"Authorization": f"Bearer {auth_token}"}
    )
    assert state_res.status_code == 200
    state_data = state_res.json()
    assert state_data["current_placement"] == partial_placement
    assert state_data["marked_clues"] == marked_clues
