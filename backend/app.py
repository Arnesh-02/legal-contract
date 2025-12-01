# app.py — Full Backend with Auth, Profile, GridFS PDF Storage

import os
import re
from io import BytesIO
from datetime import datetime
from dotenv import load_dotenv

from flask import (
    Flask, request, jsonify, redirect, Response, send_file
)

from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from gridfs import GridFS

from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity,
    set_access_cookies, set_refresh_cookies, unset_jwt_cookies
)

from authlib.integrations.flask_client import OAuth
import bcrypt
from weasyprint import HTML

# ----------------------------------------------------
# LOAD ENVIRONMENT
# ----------------------------------------------------
load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL")
MONGO_URI = os.getenv("MONGO_URI")
JWT_SECRET = os.getenv("JWT_SECRET_KEY")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
OAUTH_REDIRECT_URI = os.getenv("OAUTH_REDIRECT_URI")

# ----------------------------------------------------
# FLASK INIT
# ----------------------------------------------------
app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = JWT_SECRET
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_COOKIE_SAMESITE"] = "Lax"
app.config["JWT_COOKIE_SECURE"] = False
app.config["JWT_COOKIE_CSRF_PROTECT"] = False  # IMPORTANT FOR FRONTEND


jwt = JWTManager(app)

# ----------------------------------------------------
# DATABASE + GRIDFS
# ----------------------------------------------------
client = MongoClient(MONGO_URI)
db = client.get_default_database()
users = db.users
documents = db.documents
fs = GridFS(db)  # ---- GRIDFS INITIALIZED ----

# ----------------------------------------------------
# AUTH HELPERS
# ----------------------------------------------------
def find_user_by_email(email):
    return users.find_one({"email": email})

CORS(app, resources={r"/*": {"origins": [
    "http://localhost:5173"
]}}, supports_credentials=True)


@app.after_request
def apply_cors(response):
    origin = request.headers.get("Origin")
    if origin == "http://localhost:5173":
        response.headers["Access-Control-Allow-Origin"] = origin
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS, DELETE"
    return response



def create_user(email, name=None, picture=None, oauth="password"):
    doc = {
        "email": email,
        "name": name or "",
        "picture": picture or "",
        "oauth_provider": oauth,
        "created_at": datetime.utcnow()
    }
    users.insert_one(doc)
    return users.find_one({"email": email})

# ----------------------------------------------------
# AUTH ROUTES
# ----------------------------------------------------

@app.route("/auth/register", methods=["POST"])
def register():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    name = data.get("name")

    if find_user_by_email(email):
        return jsonify({"msg": "User already exists"}), 400

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    users.insert_one({
        "email": email,
        "password": hashed,
        "name": name,
        "created_at": datetime.utcnow()
    })

    return jsonify({"msg": "Registered successfully"}), 201


@app.route("/auth/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = find_user_by_email(email)
    if not user:
        return jsonify({"msg": "Invalid credentials"}), 401

    if not bcrypt.checkpw(password.encode(), user["password"]):
        return jsonify({"msg": "Invalid credentials"}), 401

    token = create_access_token(identity=str(user["_id"]))
    refresh = create_refresh_token(identity=str(user["_id"]))

    resp = jsonify({"msg": "login ok"})
    set_access_cookies(resp, token)
    set_refresh_cookies(resp, refresh)
    return resp, 200


@app.route("/auth/me")
@jwt_required(optional=True)
def me():
    uid = get_jwt_identity()
    if not uid:
        return jsonify({"user": None}), 200

    u = users.find_one({"_id": ObjectId(uid)})
    return jsonify({"user": {
        "email": u["email"],
        "name": u.get("name", ""),
        "company": u.get("company", ""),
        "role": u.get("role", ""),
        "phone": u.get("phone", ""),
        "address": u.get("address", ""),
        "bio": u.get("bio", ""),
        "picture": u.get("picture", "")
    }}), 200


@app.route("/auth/logout", methods=["POST"])
def logout():
    resp = jsonify({"msg": "logout"})
    unset_jwt_cookies(resp)
    return resp, 200

# ----------------------------------------------------
# PROFILE ROUTES
# ----------------------------------------------------
@app.route("/api/profile", methods=["GET"])
@jwt_required()
def get_profile():
    uid = get_jwt_identity()
    u = users.find_one({"_id": ObjectId(uid)})
    return jsonify({
        "email": u["email"],
        "name": u.get("name", ""),
        "company": u.get("company", ""),
        "role": u.get("role", ""),
        "phone": u.get("phone", ""),
        "address": u.get("address", ""),
        "bio": u.get("bio", ""),
        "picture": u.get("picture", "")
    })


@app.route("/api/profile", methods=["POST"])
@jwt_required()
def update_profile():
    uid = get_jwt_identity()
    payload = request.json

    allowed = ["name", "company", "role", "phone", "address", "bio"]

    update = {k: payload[k] for k in allowed if k in payload}

    if not update:
        return jsonify({"msg": "Nothing to update"}), 400

    users.update_one({"_id": ObjectId(uid)}, {"$set": update})

    return jsonify({"msg": "Profile updated"}), 200


@app.route("/api/profile/photo", methods=["POST"])
@jwt_required()
def upload_photo():
    uid = get_jwt_identity()
    data_url = request.json.get("data_url")

    users.update_one({"_id": ObjectId(uid)}, {"$set": {"picture": data_url}})
    return jsonify({"msg": "Updated"}), 200

# ----------------------------------------------------
# TEMPLATE
# ----------------------------------------------------
@app.route("/get-template/<name>")
def get_template(name):
    path = f"templates/{name}-agreement-template.html"
    if not os.path.exists(path):
        return jsonify({"msg": "Template missing"}), 404

    return Response(open(path).read(), mimetype="text/html")

# ----------------------------------------------------
# PDF GENERATE + GRIDFS SAVE
# ----------------------------------------------------
@app.route("/generate", methods=["POST"])
@jwt_required()
def generate_pdf():
    uid = get_jwt_identity()
    data = request.json
    doc_type = data.get("document_type")
    context = data.get("context")

    # load template
    file_name = "founders-agreement-template.html" if doc_type == "founders" else "nda-agreement-template.html"
    template_path = f"templates/{file_name}"
    html = open(template_path).read()

    # replace template placeholders
    for key, value in context.items():
        html = html.replace(f"{{{{ {key.lower().replace('_','.') }}}}}", str(value))

    # generate PDF
    pdf_bytes = HTML(string=html).write_pdf()

    # store PDF in GridFS
    pdf_id = fs.put(pdf_bytes, filename=f"{doc_type}.pdf")

    # store metadata
    doc_record = {
        "user_id": uid,
        "title": f"{doc_type} document",
        "type": doc_type,
        "created_at": datetime.utcnow(),
        "pdf_id": pdf_id
    }

    documents.insert_one(doc_record)

    return send_file(
        BytesIO(pdf_bytes),
        as_attachment=True,
        download_name=f"{doc_type}.pdf",
        mimetype="application/pdf"
    )

# ----------------------------------------------------
# DOCUMENT LIST & DOWNLOAD
# ----------------------------------------------------
@app.route("/api/documents", methods=["GET"])
@jwt_required()
def get_user_docs():
    uid = get_jwt_identity()
    docs = list(documents.find({"user_id": uid}))

    for d in docs:
        d["_id"] = str(d["_id"])
        d["pdf_id"] = str(d["pdf_id"])

    return jsonify(docs)


@app.route("/api/documents/<doc_id>/download")
@jwt_required()
def download_doc(doc_id):
    record = documents.find_one({"_id": ObjectId(doc_id)})
    if not record:
        return jsonify({"msg": "Not found"}), 404

    pdf_file = fs.get(record["pdf_id"])
    return send_file(pdf_file, download_name="document.pdf")


@app.route("/api/documents/<doc_id>/delete", methods=["DELETE"])
@jwt_required()
def delete_doc(doc_id):
    record = documents.find_one({"_id": ObjectId(doc_id)})
    if not record:
        return jsonify({"msg": "Not found"}), 404

    fs.delete(record["pdf_id"])
    documents.delete_one({"_id": ObjectId(doc_id)})

    return jsonify({"msg": "Deleted"}), 200


# ----------------------------------------------------
# RUN SERVER
# ----------------------------------------------------
if __name__ == "__main__":
    app.run(port=5000, debug=True)
