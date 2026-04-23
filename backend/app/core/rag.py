"""
app/core/rag.py  — FIXED
- Adds disk persistence (memory survives restarts)
- Keeps HuggingFace all-MiniLM-L6-v2 (384-dim, fast, great for short texts)
- Single shared VectorStore instance across all agents
"""

import os
import json
import faiss
import numpy as np
from sentence_transformers import SentenceTransformer

# ── Config ────────────────────────────────────────────────────────────────────
DIMENSION = 384   # all-MiniLM-L6-v2 produces 384-dim vectors

# Save memory next to this file so it's always found regardless of where
# uvicorn is launched from
_HERE = os.path.dirname(os.path.abspath(__file__))
SAVE_DIR   = os.path.join(_HERE, "..", "..", "rag_memory")
INDEX_PATH = os.path.join(SAVE_DIR, "faiss.index")
TEXTS_PATH = os.path.join(SAVE_DIR, "texts.json")

os.makedirs(SAVE_DIR, exist_ok=True)

# ── Load embedding model once at startup ──────────────────────────────────────
print("🤖 Loading embedding model...")
_embed_model = SentenceTransformer("all-MiniLM-L6-v2")
print("✅ Embedding model ready")


# ── Vector Store with disk persistence ───────────────────────────────────────
class VectorStore:

    def __init__(self):
        self.dimension = DIMENSION
        self._load()

    def _load(self):
        if os.path.exists(INDEX_PATH) and os.path.exists(TEXTS_PATH):
            self.index = faiss.read_index(INDEX_PATH)
            with open(TEXTS_PATH, "r", encoding="utf-8") as f:
                self.texts = json.load(f)
            print(f"📂 RAG loaded {len(self.texts)} memories from disk")
        else:
            self.index = faiss.IndexFlatL2(self.dimension)
            self.texts = []
            print("🆕 RAG starting fresh — no past memories yet")

    def _save(self):
        faiss.write_index(self.index, INDEX_PATH)
        with open(TEXTS_PATH, "w", encoding="utf-8") as f:
            json.dump(self.texts, f, indent=2)

    def add(self, embedding: np.ndarray, text: str):
        vec = np.array([embedding], dtype="float32")
        self.index.add(vec)
        self.texts.append(text)
        self._save()
        print(f"💾 STORED IN RAG | Total memories: {len(self.texts)}")

    def search(self, embedding: np.ndarray, k: int = 3) -> list:
        if len(self.texts) == 0:
            return []
        vec = np.array([embedding], dtype="float32")
        k = min(k, len(self.texts))
        distances, indices = self.index.search(vec, k)
        return [self.texts[i] for i in indices[0] if i < len(self.texts)]


# ── Singleton (shared across all agents) ─────────────────────────────────────
_vector_store = VectorStore()


# ── Public API ────────────────────────────────────────────────────────────────
def get_embedding(text: str) -> np.ndarray:
    return _embed_model.encode(text)


def store_context(text: str):
    """Embed text and save to persistent vector store."""
    embedding = get_embedding(text)
    _vector_store.add(embedding, text)


def retrieve_context(query: str, k: int = 3) -> str:
    """
    Find k most semantically similar past entries.
    Returns them joined as a string to inject into agent prompts.
    """
    embedding = get_embedding(query)
    results = _vector_store.search(embedding, k)

    if not results:
        print("🔍 RETRIEVED CONTEXT: (none yet)")
        return ""

    print(f"🔍 RETRIEVED CONTEXT: {len(results)} past memories found")
    return "\n\n---\n".join(results)