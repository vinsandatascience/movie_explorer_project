from flask import Blueprint, request, jsonify
from models import create_user, authenticate_user, get_user_by_id

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    username = data.get("username", "").strip()
    email = data.get("email", "").strip()
    password = data.get("password", "").strip()
    avatar = data.get("avatar")

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required."}), 400

    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters long."}), 400

    user = create_user(username, email, password, avatar)
    if not user:
        return jsonify({"error": "Username or email already exists."}), 409

    return jsonify({
        "message": "User registered successfully!",
        "user": user
    }), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username_or_email = data.get("username", "").strip() or data.get("email", "").strip()
    password = data.get("password", "").strip()

    if not username_or_email or not password:
        return jsonify({"error": "Credentials are required."}), 400

    user = authenticate_user(username_or_email, password)
    if not user:
        return jsonify({"error": "Invalid username/email or password."}), 401

    return jsonify({
        "message": "Login successful!",
        "user": user
    }), 200

@auth_bp.route("/profile/<int:user_id>", methods=["GET"])
def profile(user_id):
    user = get_user_by_id(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"user": user}), 200
