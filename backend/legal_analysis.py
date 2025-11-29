from flask import Blueprint, request, jsonify
from transformers import (
    AutoTokenizer,
    AutoModelForTokenClassification,
    pipeline,
    AutoModelForSeq2SeqLM,
)
from tika import parser
from sentence_transformers import SentenceTransformer
import numpy as np
import torch
import os

# ----------------------------------------------------
# Blueprint
# ----------------------------------------------------
legal_analysis_bp = Blueprint("legal_analysis", __name__, url_prefix="/legal")

# ----------------------------------------------------
# Named Entity Recognition (NER) Model
# ----------------------------------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "ner_model")

tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForTokenClassification.from_pretrained(MODEL_PATH)
ner_pipeline = pipeline("ner", model=model, tokenizer=tokenizer, aggregation_strategy="simple")

# ----------------------------------------------------
# Sentence Embedding Model (Lightweight)
# ----------------------------------------------------
# ~22MB model — fast and accurate for legal semantic similarity
legal_model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")

# ----------------------------------------------------
# Legal LLM (Lightweight)
# ----------------------------------------------------
LLM_MODEL_NAME = "google/flan-t5-small"  # small, CPU-friendly model (~300MB)
print(f"Loading LLM model: {LLM_MODEL_NAME}")

tokenizer_llm = AutoTokenizer.from_pretrained(LLM_MODEL_NAME)
model_llm = AutoModelForSeq2SeqLM.from_pretrained(LLM_MODEL_NAME)

device = torch.device("cpu")  # CPU only
model_llm.to(device)

print("✅ All models loaded successfully (NER + Embeddings + LLM)")

# ----------------------------------------------------
# Utility: Chunk text for NER
# ----------------------------------------------------
def chunk_text(text, max_len=1024, stride=512):
    """
    Splits large text into overlapping chunks for NER processing.
    """
    words = text.split()
    for i in range(0, len(words), max_len - stride):
        yield " ".join(words[i:i + max_len])

# ----------------------------------------------------
# Summarization Endpoint
# ----------------------------------------------------
@legal_analysis_bp.route("/analyze", methods=["POST"])
def summarize_contract():
    """
    Accepts a legal contract (PDF or TXT) and returns a concise summary using LLM.
    """
    try:
        print("🟢 /legal/summarize endpoint called")

        if "file" not in request.files:
            return jsonify({"error": "No file uploaded"}), 400

        file = request.files["file"]
        filename = file.filename.lower()
        print(f"📄 File received: {filename}")

        # ----------------- Extract text -----------------
        if filename.endswith(".pdf"):
            print("📥 Extracting text from PDF...")
            parsed = parser.from_buffer(file.read())
            text = parsed.get("content", "")
        elif filename.endswith(".txt"):
            print("📥 Extracting text from TXT file...")
            text = file.read().decode("utf-8")
        else:
            return jsonify({"error": "Unsupported file type"}), 400

        if not text.strip():
            return jsonify({"error": "No text extracted"}), 400

        print(f"✅ Extracted text length: {len(text)} characters")

        # ----------------- LLM: Summarization -----------------
        print("🤖 Generating summary with LLM...")

        summary_prompt = f"""
        Summarize the following legal contract in clear and concise bullet points:

        {text[:4000]}

        Summary:
        """

        inputs = tokenizer_llm(
            summary_prompt, return_tensors="pt", truncation=True, padding=True
        ).to(device)

        output = model_llm.generate(**inputs, max_new_tokens=300)
        summary = tokenizer_llm.decode(output[0], skip_special_tokens=True)

        print("🧠 Summary Output:")
        print(summary[:800])  # print first 800 chars for debug

        return jsonify({"summary": summary})

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500
