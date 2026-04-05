"""
Tests for POST /api/ingest and GET /api/ingest/{session_id}/status
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from main import app

client = TestClient(app)


def test_ingest_returns_session_id():
    with patch("api.ingest.SupervisorAgent") as MockSupervisor:
        mock_instance = MagicMock()
        mock_instance.run = MagicMock(return_value=None)
        MockSupervisor.return_value = mock_instance

        resp = client.post("/api/ingest", json={"repo_url": "https://github.com/tiangolo/fastapi"})
        assert resp.status_code == 202
        data = resp.json()
        assert "session_id" in data
        assert len(data["session_id"]) == 32  # uuid4 hex


def test_ingest_status_not_found():
    resp = client.get("/api/ingest/nonexistent_session/status")
    assert resp.status_code == 404


def test_ingest_status_queued():
    with patch("api.ingest.SupervisorAgent") as MockSupervisor:
        mock_instance = MagicMock()
        mock_instance.run = MagicMock(return_value=None)
        MockSupervisor.return_value = mock_instance

        resp = client.post("/api/ingest", json={"repo_url": "https://github.com/tiangolo/fastapi"})
        session_id = resp.json()["session_id"]

        status_resp = client.get(f"/api/ingest/{session_id}/status")
        assert status_resp.status_code == 200
        status_data = status_resp.json()
        assert status_data["session_id"] == session_id
        assert status_data["status"] in ("queued", "cloning", "parsing", "ready", "error")


def test_ingest_delete_session():
    with patch("api.ingest.SupervisorAgent") as MockSupervisor:
        mock_instance = MagicMock()
        mock_instance.run = MagicMock(return_value=None)
        MockSupervisor.return_value = mock_instance

        resp = client.post("/api/ingest", json={"repo_url": "https://github.com/tiangolo/fastapi"})
        session_id = resp.json()["session_id"]

        del_resp = client.delete(f"/api/ingest/{session_id}")
        assert del_resp.status_code == 204
