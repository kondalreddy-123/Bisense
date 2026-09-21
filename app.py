"""
BISENSE - AI-Powered Indian Standards Discovery and Recommendation System
Domain: Electrical & Electronic Products
"""

import os
import json
from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS

from services.nlp_service import SUPPORTED_LANGUAGES, nlp_service
from services.recommendation_engine import recommendation_engine

app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")


@app.before_request
def startup_init():
    """Ensure indexes are loaded before handling first API query."""
    if not hasattr(app, "_initialized"):
        app._initialized = True
        print("[BISENSE] Pre-initializing vector search indexes and standard knowledge base...")
        try:
            recommendation_engine.initialize_indexes()
            print("[BISENSE] Initialization complete. System ready.")
        except Exception as e:
            print(f"[BISENSE] Startup index initialization note: {e}")


@app.route("/")
def index():
    """Serves the main BISENSE 3D web application."""
    return render_template("index.html")


@app.route("/api/health", methods=["GET"])
def health():
    """Health check endpoint."""
    return jsonify({
        "status": "online",
        "system": "BISENSE AI Standards Discovery Engine",
        "domain": "Electrical & Electronic Products",
        "supported_languages": len(SUPPORTED_LANGUAGES)
    })


@app.route("/api/languages", methods=["GET"])
def get_languages():
    """Returns supported Indian languages + English + Auto Detect."""
    return jsonify(list(SUPPORTED_LANGUAGES.values()))


@app.route("/api/products", methods=["GET"])
def get_products():
    """Returns products strictly within the Electrical & Electronic Products domain."""
    products_file = os.path.join(DATA_DIR, "products.json")
    if os.path.exists(products_file):
        with open(products_file, "r", encoding="utf-8") as f:
            products = json.load(f)
        return jsonify(products)
    return jsonify([])


@app.route("/api/standards/<standard_id>", methods=["GET"])
def get_standard_detail(standard_id):
    """Returns complete details of a specific Indian Standard by ID or IS Number."""
    std = recommendation_engine.standards_by_id.get(standard_id)
    if not std:
        std = recommendation_engine.standards_by_is.get(standard_id)

    if std:
        return jsonify(std)
    return jsonify({"error": "Standard not found"}), 404


@app.route("/api/check_query", methods=["POST"])
def check_query():
    """
    Checks query for potential product typos (e.g. 'refregerator').
    Returns typo suggestions without automatically replacing.
    """
    data = request.get_json(silent=True) or {}
    query = data.get("query", "").strip()
    if not query:
        return jsonify({"has_typo": False, "suggestions": []})

    result = nlp_service.detect_product_typo(query)
    return jsonify(result)


@app.route("/api/upload_spec", methods=["POST"])
def upload_spec():
    """
    Upload and extract product specifications from tender documents or spec sheets.
    Supports PDF (.pdf), Word (.docx), Plain text (.txt, .md, .csv, .json), and image files.
    """
    if "file" not in request.files:
        return jsonify({"error": "No file provided in request."}), 400

    file = request.files["file"]
    filename = file.filename or "uploaded_spec"
    if not filename:
        return jsonify({"error": "Empty filename provided."}), 400

    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    extracted_text = ""

    try:
        if ext == "pdf":
            import pypdf
            reader = pypdf.PdfReader(file.stream)
            pages_text = []
            for page in reader.pages[:10]:
                t = page.extract_text() or ""
                if t:
                    pages_text.append(t)
            extracted_text = "\n".join(pages_text)

        elif ext in ["docx", "doc"]:
            import docx
            doc = docx.Document(file.stream)
            extracted_text = "\n".join([p.text for p in doc.paragraphs if p.text])

        elif ext in ["txt", "json", "csv", "md"]:
            content = file.read()
            try:
                extracted_text = content.decode("utf-8")
            except UnicodeDecodeError:
                extracted_text = content.decode("latin-1", errors="replace")

        elif ext in ["png", "jpg", "jpeg", "webp", "bmp"]:
            # If an image is uploaded directly to server endpoint, return preview
            extracted_text = f"Specification image uploaded: {filename}"

        else:
            content = file.read()
            extracted_text = content.decode("utf-8", errors="replace")

        if not extracted_text.strip():
            return jsonify({
                "success": False,
                "filename": filename,
                "error": "Could not extract readable text from the uploaded file."
            }), 400

        result = nlp_service.process_specification_document(extracted_text)
        return jsonify({
            "success": True,
            "filename": filename,
            "file_type": ext,
            "extracted_text": result["extracted_text"],
            "suggested_query": result["suggested_query"],
            "detected_specs": result["specs"]
        })

    except Exception as e:
        app.logger.error(f"Error processing spec file {filename}: {e}")
        return jsonify({
            "error": f"Failed to extract text from {filename}",
            "detail": str(e)
        }), 500


@app.route("/api/recommend", methods=["POST"])
def recommend():
    """
    Main AI Semantic Search & Recommendation Endpoint
    Request JSON:
    {
        "query": "Electric cooker for domestic use with automatic temperature control",
        "language": "auto",
        "product": "electric_cooker"
    }
    """
    data = request.get_json(silent=True) or {}
    query = data.get("query", "").strip()
    language = data.get("language", "auto")
    product = data.get("product", "all")

    if not query:
        return jsonify({
            "error": "Query cannot be empty. Please enter your product requirement."
        }), 400

    try:
        results = recommendation_engine.recommend(
            query=query,
            language=language,
            product_filter=product
        )
        return jsonify(results)
    except Exception as e:
        app.logger.error(f"Error processing recommendation: {e}")
        return jsonify({
            "error": "An internal error occurred while processing your requirement.",
            "detail": str(e)
        }), 500


if __name__ == "__main__":
    print("=" * 60)
    print("  BISENSE - 3D AI Indian Standards Discovery System")
    print("  Domain: Electrical & Electronic Products")
    print("  Open your browser at: http://127.0.0.1:5000")
    print("=" * 60)
    recommendation_engine.initialize_indexes()
    app.run(host="0.0.0.0", port=5000, debug=True)
