import uuid

import pytest
from fastapi.testclient import TestClient

from tests.conftest import login, register_verified


def create_task(
    client: TestClient,
    title: str,
    *,
    task_date: str | None = None,
    order: int = 0,
) -> dict[str, object]:
    payload: dict[str, object] = {"title": title, "order": order}
    if task_date is not None:
        payload["date"] = task_date
    response = client.post("/api/tasks", json=payload)
    assert response.status_code == 201
    return response.json()


def test_task_crud_trims_content_and_allows_clearing_date(
    client: TestClient,
) -> None:
    register_verified(client)

    created = client.post(
        "/api/tasks",
        json={
            "title": "  Plan the day  ",
            "description": "  Start with the hardest thing.  ",
            "date": "2026-08-31",
            "order": 3,
        },
    )

    assert created.status_code == 201
    task = created.json()
    assert task["title"] == "Plan the day"
    assert task["description"] == "Start with the hardest thing."
    assert task["date"] == "2026-08-31"
    assert set(task) == {
        "id",
        "title",
        "description",
        "done",
        "date",
        "timeBlockId",
        "order",
        "createdAt",
    }

    fetched = client.get(f"/api/tasks/{task['id']}")
    assert fetched.status_code == 200
    assert fetched.json() == task

    updated = client.patch(
        f"/api/tasks/{task['id']}",
        json={
            "title": "  Finish the plan ",
            "description": " ",
            "done": True,
            "date": None,
            "timeBlockId": None,
            "order": 1,
        },
    )
    assert updated.status_code == 200
    assert updated.json() | {"createdAt": task["createdAt"]} == {
        **task,
        "title": "Finish the plan",
        "description": "",
        "done": True,
        "date": None,
        "timeBlockId": None,
        "order": 1,
    }

    deleted = client.delete(f"/api/tasks/{task['id']}")
    assert deleted.status_code == 204
    assert client.get(f"/api/tasks/{task['id']}").status_code == 404


@pytest.mark.parametrize(
    "payload",
    [
        {},
        {"title": ""},
        {"title": "   "},
        {"title": "x" * 256},
        {"title": "Valid", "order": -1},
    ],
)
def test_create_validates_task_fields(
    client: TestClient,
    payload: dict[str, object],
) -> None:
    register_verified(client)

    response = client.post("/api/tasks", json=payload)

    assert response.status_code == 422


@pytest.mark.parametrize(
    "payload",
    [
        {"title": None},
        {"description": None},
        {"done": None},
        {"order": None},
        {"order": -1},
    ],
)
def test_patch_rejects_invalid_non_nullable_fields(
    client: TestClient,
    payload: dict[str, object],
) -> None:
    register_verified(client)
    task = create_task(client, "Keep this valid")

    response = client.patch(f"/api/tasks/{task['id']}", json=payload)

    assert response.status_code == 422


def test_list_supports_all_date_and_undated_filters(
    client: TestClient,
) -> None:
    register_verified(client)
    later = create_task(client, "Later", order=2)
    today = create_task(client, "Today", task_date="2026-08-31", order=1)
    tomorrow = create_task(client, "Tomorrow", task_date="2026-09-01", order=0)

    all_tasks = client.get("/api/tasks")
    dated = client.get("/api/tasks?date=2026-08-31")
    undated = client.get("/api/tasks?date=undated")

    assert all_tasks.status_code == 200
    assert [task["id"] for task in all_tasks.json()] == [
        tomorrow["id"],
        today["id"],
        later["id"],
    ]
    assert [task["id"] for task in dated.json()] == [today["id"]]
    assert [task["id"] for task in undated.json()] == [later["id"]]
    assert client.get("/api/tasks?date=today").status_code == 422


def test_tasks_are_isolated_between_users(client: TestClient) -> None:
    register_verified(client, "ada@example.com")
    adas_task = create_task(client, "Ada’s private task")

    register_verified(client, "grace@example.com")
    graces_task = create_task(client, "Grace’s private task")

    assert [task["id"] for task in client.get("/api/tasks").json()] == [
        graces_task["id"]
    ]
    for method in ("get", "patch", "delete"):
        request = getattr(client, method)
        kwargs = {"json": {"done": True}} if method == "patch" else {}
        response = request(f"/api/tasks/{adas_task['id']}", **kwargs)
        assert response.status_code == 404

    assert login(client, "ada@example.com").status_code == 200
    assert [task["id"] for task in client.get("/api/tasks").json()] == [
        adas_task["id"]
    ]
    assert client.get(f"/api/tasks/{uuid.uuid4()}").status_code == 404


def test_cannot_pin_a_task_to_another_users_block(client: TestClient) -> None:
    register_verified(client, "ada@example.com")
    ada_block = client.post(
        "/api/blocks",
        json={
            "title": "Ada’s block",
            "date": "2026-08-31",
            "start": "09:00:00",
            "end": "10:00:00",
        },
    )
    assert ada_block.status_code == 201

    register_verified(client, "grace@example.com")
    response = client.post(
        "/api/tasks",
        json={"title": "Stolen pin", "timeBlockId": ada_block.json()["id"]},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Time block not found."
