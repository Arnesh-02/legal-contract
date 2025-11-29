# app.py  (single-file backend: auth + templates + PDF generation)
import os
import re
from io import BytesIO
from dotenv import load_dotenv
from flask import (
    Flask, request, jsonify, redirect, Response, send_file, url_for
)
from flask_cors import CORS
from pymongo import MongoClient
from bson.objectid import ObjectId
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, set_access_cookies, set_refresh_cookies,
    unset_jwt_cookies
)
from authlib.integrations.flask_client import OAuth
import bcrypt
from weasyprint import HTML


from flask import request, jsonify
from bson.objectid import ObjectId
from flask_jwt_extended import jwt_required, get_jwt_identity
import base64
from datetime import datetime

load_dotenv()

# -------------------------
# Config
# -------------------------
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/Legal-Tech")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change_this_secret")
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
OAUTH_REDIRECT_URI = os.getenv("OAUTH_REDIRECT_URI", "http://localhost:5000/auth/google/callback")

# -------------------------
# App init
# -------------------------
app = Flask(__name__, static_folder=None)
app.config["JWT_SECRET_KEY"] = JWT_SECRET_KEY
# cookies for JWT
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_COOKIE_SECURE"] = False  # True in production with HTTPS
app.config["JWT_COOKIE_SAMESITE"] = "Lax"
app.config["JWT_ACCESS_COOKIE_PATH"] = "/"
app.config["JWT_REFRESH_COOKIE_PATH"] = "/token/refresh"

# Enable CORS - allow credentials (cookies) from frontend
CORS(app,
     resources={r"/*": {"origins": FRONTEND_URL}},
     supports_credentials=True)

# Ensure response headers include Allow-Credentials for preflight & actual responses
@app.after_request
def apply_cors(response):
    # only add these headers for permitted origin
    response.headers["Access-Control-Allow-Origin"] = FRONTEND_URL
    response.headers["Access-Control-Allow-Credentials"] = "true"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

jwt = JWTManager(app)

# -------------------------
# DB
# -------------------------
client = MongoClient(MONGO_URI)
db = client.get_default_database()
users = db.users
documents = db.documents

# -------------------------
# OAuth (Google)
# -------------------------
oauth = OAuth(app)
if GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET:
    google = oauth.register(
        name='google',
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
        access_token_url='https://oauth2.googleapis.com/token',
        authorize_url='https://accounts.google.com/o/oauth2/v2/auth',
        api_base_url='https://www.googleapis.com/oauth2/v2/',
        client_kwargs={'scope': 'openid email profile'}
    )
else:
    google = None

# -------------------------
# Utilities
# -------------------------
def find_user_by_email(email):
    if not email:
        return None
    return users.find_one({"email": email})

def create_user_doc(email, name=None, picture=None, oauth_provider=None):
    user = {"email": email, "name": name or "", "picture": picture or "", "oauth_provider": oauth_provider}
    res = users.insert_one(user)
    return users.find_one({"_id": res.inserted_id})

# -------------------------
# AUTH ROUTES
# -------------------------



@app.route("/api/profile", methods=["GET"])
@jwt_required()
def api_get_profile():
    uid = get_jwt_identity()
    u = users.find_one({"_id": ObjectId(uid)})
    if not u:
        return jsonify({"error": "user not found"}), 404
    return jsonify({
        "email": u.get("email"),
        "name": u.get("name", ""),
        "picture": u.get("picture", "")
    }), 200

@app.route("/api/profile", methods=["POST"])
@jwt_required()
def api_update_profile():
    uid = get_jwt_identity()
    payload = request.json or {}
    name = payload.get("name")
    # only allow changing name for now
    update = {}
    if name is not None:
        update["name"] = str(name).strip()
    if not update:
        return jsonify({"msg": "nothing to update"}), 400
    users.update_one({"_id": ObjectId(uid)}, {"$set": update})
    u = users.find_one({"_id": ObjectId(uid)})
    return jsonify({"email": u["email"], "name": u.get("name", ""), "picture": u.get("picture", "")}), 200

@app.route("/api/profile/photo", methods=["POST"])
@jwt_required()
def api_upload_photo():
    uid = get_jwt_identity()
    payload = request.json or {}
    data_url = payload.get("data_url")
    if not data_url:
        return jsonify({"msg": "no image data provided"}), 400
    # optional: basic validation of data URL
    if not data_url.startswith("data:image/"):
        return jsonify({"msg": "invalid image data"}), 400
    users.update_one({"_id": ObjectId(uid)}, {"$set": {"picture": data_url}})
    u = users.find_one({"_id": ObjectId(uid)})
    return jsonify({"picture": u.get("picture","")}), 200


@app.route("/auth/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    email = data.get("email"); password = data.get("password"); name = data.get("name","")
    if not email or not password:
        return jsonify({"msg":"email and password required"}), 400
    if find_user_by_email(email):
        return jsonify({"msg":"user exists"}), 400
    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt())
    users.insert_one({"email": email, "password": pw_hash, "name": name})
    return jsonify({"msg":"registered"}), 201

@app.route("/auth/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = data.get("email"); password = data.get("password")
    u = find_user_by_email(email)
    if not u or "password" not in u:
        return jsonify({"msg":"invalid creds"}), 401
    if not bcrypt.checkpw(password.encode(), u["password"]):
        return jsonify({"msg":"invalid creds"}), 401
    identity = str(u["_id"])
    access_token = create_access_token(identity=identity)
    refresh_token = create_refresh_token(identity=identity)
    resp = jsonify({"msg":"login ok"})
    set_access_cookies(resp, access_token)
    set_refresh_cookies(resp, refresh_token)
    return resp, 200

@app.route("/token/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    resp = jsonify({"msg":"refreshed"})
    set_access_cookies(resp, access_token)
    return resp, 200

@app.route("/auth/logout", methods=["POST"])
def logout():
    resp = jsonify({"msg":"logout"})
    unset_jwt_cookies(resp)
    return resp, 200

@app.route("/auth/google")
def auth_google():
    if not google:
        return jsonify({"msg":"Google OAuth not configured on server"}), 500
    return google.authorize_redirect(OAUTH_REDIRECT_URI)

@app.route("/auth/google/callback")
def auth_google_callback():
    if not google:
        return jsonify({"msg":"Google OAuth not configured on server"}), 500
    token = google.authorize_access_token()
    user_info = google.get("userinfo").json()
    email = user_info.get("email"); name = user_info.get("name"); picture = user_info.get("picture")
    u = find_user_by_email(email)
    if not u:
        u = create_user_doc(email, name=name, picture=picture, oauth_provider="google")
    identity = str(u["_id"])
    access_token = create_access_token(identity=identity)
    refresh_token = create_refresh_token(identity=identity)
    # redirect to frontend and set cookies on response
    resp = redirect(FRONTEND_URL + "/oauth-success")
    set_access_cookies(resp, access_token)
    set_refresh_cookies(resp, refresh_token)
    return resp

@app.route("/auth/me", methods=["GET"])
@jwt_required(optional=True)
def me():
    uid = get_jwt_identity()
    if not uid:
        return jsonify({"user": None}), 200
    u = users.find_one({"_id": ObjectId(uid)})
    if not u:
        return jsonify({"user": None}), 200
    return jsonify({"user": {"email": u["email"], "name": u.get("name",""), "picture": u.get("picture","")}}), 200

# -------------------------
# Basic document endpoints (protected) - sample
# -------------------------
@app.route("/api/documents", methods=["GET"])
@jwt_required()
def list_documents():
    user_id = get_jwt_identity()
    docs = list(documents.find({"owner_id": user_id}, {"html":0}))
    for d in docs:
        d["_id"] = str(d["_id"])
    return jsonify(docs),200

@app.route("/api/documents", methods=["POST"])
@jwt_required()
def save_document():
    user_id = get_jwt_identity()
    payload = request.json or {}
    doc = {"owner_id": user_id, "title": payload.get("title","Untitled"), "html": payload.get("html"), "created_at": payload.get("created_at")}
    res = documents.insert_one(doc)
    return jsonify({"id": str(res.inserted_id)}), 201

# -------------------------
# Template serving + PDF generation
# -------------------------
@app.route("/get-template/<name>", methods=["GET"])
def get_template(name):
    file_map = {
        "nda": "nda-agreement-template.html",
        "founders": "founders-agreement-template.html",
    }
    file_name = file_map.get(name, "nda-agreement-template.html")
    template_path = os.path.join(app.root_path, "templates", file_name)
    if os.path.exists(template_path):
        with open(template_path, "r", encoding="utf-8") as f:
            return Response(f.read(), mimetype="text/html")
    else:
        return jsonify({"error": f"Template not found: {file_name}"}), 404

@app.route("/generate", methods=["POST"])
def generate_pdf():
    """
    Generate PDF from provided context.
    Replace placeholders using a simple ALIASES map and regex.
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No JSON data received"}), 400

        document_type = data.get("document_type", "nda")
        context = data.get("context", {}) or {}

        template_file_name = (
            "founders-agreement-template.html" if document_type == "founders" else "nda-agreement-template.html"
        )
        template_path = os.path.join(app.root_path, "templates", template_file_name)
        if not os.path.exists(template_path):
            return jsonify({"error": f"Template file not found: {template_file_name}"}), 404

        # Map template placeholders to context keys (must correspond to frontend)
        ALIASES = {
            "company.name": "COMPANY_NAME",
            "company.address": "COMPANY_ADDRESS",
            "company.authorized_signatory.signature": "COMPANY_SIGNATURE",
            "authorized.signatory.name": "COMPANY_SIGNATORY_NAME",
            "authorized.signatory.designation": "COMPANY_SIGNATORY_DESIGNATION",
            "founder.name": "FOUNDER_NAME",
            "founder.address": "FOUNDER_ADDRESS",
            "founder.designation": "FOUNDER_DESIGNATION",
            "founder.signature": "FOUNDER_SIGNATURE",
            "founder.salary": "FOUNDER_SALARY",
            "founder.salary.words": "FOUNDER_SALARY_WORDS",
            "noncompete.period": "NONCOMPETE_PERIOD",
            "notice.period": "NOTICE_PERIOD",
            "severance.amount": "SEVERANCE_AMOUNT",
            "effective.date": "EFFECTIVE_DATE",
            "jurisdiction.city": "JURISDICTION_CITY",
        }

        with open(template_path, "r", encoding="utf-8") as f:
            rendered_html = f.read()

        # Replace placeholders robustly ({{ key }}, with optional spaces)
        for template_key, data_key in ALIASES.items():
            value = context.get(data_key)
            str_value = str(value) if value is not None else ""
            if str_value.strip() == "":
                replacement_value = "&nbsp;&nbsp;____________________&nbsp;&nbsp;"
            else:
                replacement_value = str_value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                # if this is an image data URL (signature), render an <img>
                if data_key.endswith("SIGNATURE") and str_value.startswith("data:"):
                    replacement_value = f'<img src="{str_value}" class="signature-image" alt="signature" />'
            placeholder_regex = re.compile(r"{{\s*" + re.escape(template_key) + r"\s*}}", re.IGNORECASE)
            rendered_html = placeholder_regex.sub(replacement_value, rendered_html)

        # Convert to PDF
        pdf_stream = BytesIO()
        HTML(string=rendered_html, base_url=request.host_url).write_pdf(pdf_stream)
        pdf_stream.seek(0)
        return send_file(pdf_stream, as_attachment=True, download_name=f"{document_type}_agreement.pdf", mimetype="application/pdf")
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# -------------------------
# Root
# -------------------------
@app.route("/")
def index():
    return jsonify({"message": "Document Generator Backend Running 🚀"})

# -------------------------
# Run
# -------------------------
if __name__ == "__main__":
    # Use host 0.0.0.0 if you need to access from other machines
    app.run(port=5000, debug=True)
