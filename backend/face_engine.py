import cv2
import numpy as np
from deepface import DeepFace

def get_embedding(image_bytes: bytes) -> list:
    """
    Decodes image bytes to an OpenCV image and extracts facial embeddings using DeepFace.
    Returns the embedding as a list of floats.
    """
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Invalid image file or format.")
    
    try:
        # Get embedding using VGG-Face (default)
        representation = DeepFace.represent(img_path=img, model_name="VGG-Face", enforce_detection=True)
        if not representation:
            raise ValueError("No faces detected.")
        return representation[0]["embedding"]
    except Exception as e:
        raise ValueError(f"Face extraction failed: {str(e)}")

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
    """Calculates cosine similarity between two numpy arrays."""
    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot_product / (norm_a * norm_b)

def find_best_match(probe_embedding: list, cache: dict, threshold: float = 0.75):
    """
    Compares probe_embedding against all cached embeddings using cosine similarity.
    Returns (member_id, name, confidence) if a match above threshold is found,
    else returns None.
    """
    if not cache:
        return None
        
    probe_arr = np.array(probe_embedding, dtype=np.float32)
    
    best_match_id = None
    best_match_name = None
    best_score = -1.0
    
    for member_id, data in cache.items():
        stored_arr = data["embedding"]
        score = cosine_similarity(probe_arr, stored_arr)
        
        if score > best_score:
            best_score = score
            best_match_id = member_id
            best_match_name = data["name"]
            
    if best_score >= threshold:
        return best_match_id, best_match_name, float(best_score)
    
    return None
