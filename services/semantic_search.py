"""
Semantic Search Service for BISENSE
Builds and queries FAISS vector index for multi-chunk standard retrieval with cosine similarity,
domain filtering, and product matching.
"""

import os
import json
import numpy as np
from typing import List, Dict, Any, Optional

try:
    import faiss
    FAISS_AVAILABLE = True
except ImportError:
    FAISS_AVAILABLE = False


class SemanticSearchService:
    def __init__(self):
        self.index = None
        self.chunk_metas: List[Dict[str, Any]] = []
        self.embeddings: Optional[np.ndarray] = None
        self.dim = 384
        self.is_indexed = False

    def build_index(self, embeddings: np.ndarray, chunk_metas: List[Dict[str, Any]]):
        """
        Builds FAISS index (or numpy vector bank) from embeddings and chunk metadata.
        """
        self.chunk_metas = chunk_metas
        self.embeddings = embeddings.astype(np.float32)
        self.dim = embeddings.shape[1]

        if FAISS_AVAILABLE:
            try:
                # Using Inner Product (equivalent to Cosine Similarity on L2 normalized vectors)
                self.index = faiss.IndexFlatIP(self.dim)
                self.index.add(self.embeddings)
                print(f"[BISENSE] FAISS IndexFlatIP initialized with {self.index.ntotal} vectors (dim={self.dim}).")
                self.is_indexed = True
                return
            except Exception as e:
                print(f"[BISENSE] FAISS initialization error: {e}. Falling back to NumPy vector search.")

        self.is_indexed = True
        print(f"[BISENSE] NumPy vector search engine initialized with {len(self.chunk_metas)} vectors.")

    def search(
        self,
        query_vector: np.ndarray,
        top_k: int = 15,
        target_product_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Searches index with normalized query vector and returns scored chunk matches.
        """
        if not self.is_indexed or self.embeddings is None:
            return []

        query_vector = query_vector.astype(np.float32)
        if len(query_vector.shape) == 1:
            query_vector = query_vector.reshape(1, -1)

        # Normalize query vector if not already normalized
        q_norm = np.linalg.norm(query_vector)
        if q_norm > 1e-9:
            query_vector = query_vector / q_norm

        raw_results = []

        if FAISS_AVAILABLE and self.index is not None:
            # Query FAISS
            k = min(top_k * 3, len(self.chunk_metas))
            scores, indices = self.index.search(query_vector, k)
            for score, idx in zip(scores[0], indices[0]):
                if idx < 0 or idx >= len(self.chunk_metas):
                    continue
                meta = self.chunk_metas[idx]
                raw_results.append({
                    "score": float(score),
                    "meta": meta
                })
        else:
            # NumPy dot product
            scores = np.dot(self.embeddings, query_vector.T).flatten()
            top_indices = np.argsort(scores)[::-1][:top_k * 3]
            for idx in top_indices:
                raw_results.append({
                    "score": float(scores[idx]),
                    "meta": self.chunk_metas[idx]
                })

        # Apply target product filter or boost if requested
        filtered_results = []
        for item in raw_results:
            meta = item["meta"]
            prod_id = meta.get("product_id", "")

            # If user explicitly requested a product, apply affinity
            if target_product_id and target_product_id != "all":
                if prod_id == target_product_id:
                    item["score"] = min(0.99, item["score"] * 1.35)
                else:
                    item["score"] = item["score"] * 0.70

            filtered_results.append(item)

        # Sort by updated score
        filtered_results.sort(key=lambda x: x["score"], reverse=True)
        return filtered_results[:top_k]


# Global singleton
semantic_search_service = SemanticSearchService()
