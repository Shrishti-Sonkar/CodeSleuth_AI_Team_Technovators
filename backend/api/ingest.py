"""
Ingest API — POST /api/ingest  and  GET /api/ingest/{session_id}/status
"""
import asyncio
from fastapi import APIRouter, HTTPException, BackgroundTasks

from agents.supervisor import SupervisorAgent, create_session_id
from services.cache_service import get_cache_service
from models.ingest import IngestRequest, IngestResponse, IngestStatusResponse

router = APIRouter()


@router.post("/ingest", response_model=IngestResponse, status_code=202)
async def start_ingest(
    body: IngestRequest,
    background_tasks: BackgroundTasks,
):
    """
    Kick off repository ingestion.
    Returns a session_id immediately; client should poll /api/ingest/{session_id}/status.
    """
    session_id = create_session_id()
    cache = get_cache_service()

    # Set initial status so polling works instantly
    cache.set_status(session_id, {
        "session_id": session_id,
        "status": "queued",
        "progress": 0,
        "error": None,
        "repo_name": None,
        "language_breakdown": None,
        "total_files": None,
        "total_lines": None,
    })

    supervisor = SupervisorAgent()
    background_tasks.add_task(
        supervisor.run,
        session_id,
        str(body.repo_url),
        body.branch,
        body.token,
    )

    return IngestResponse(
        session_id=session_id,
        message="Repository ingestion started. Poll /api/ingest/{session_id}/status for updates.",
    )


@router.get("/ingest/{session_id}/status", response_model=IngestStatusResponse)
async def get_ingest_status(session_id: str):
    """Poll the status of an ongoing or completed ingestion job."""
    cache = get_cache_service()
    status = cache.get_status(session_id)
    if status is None:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")
    return IngestStatusResponse(**status)


@router.delete("/ingest/{session_id}", status_code=204)
async def delete_session(session_id: str):
    """Clear all cached data for a session (reset)."""
    cache = get_cache_service()
    if not cache.get_status(session_id):
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")
    cache.delete_session(session_id)
