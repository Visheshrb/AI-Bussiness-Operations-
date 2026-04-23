"""
app/db/vector_store.py  — FIXED

The VectorStore logic now lives in app/core/rag.py (with persistence).
This file re-exports it so any old imports from this path still work.
"""

from app.core.rag import _vector_store as vector_store

__all__ = ["vector_store"]