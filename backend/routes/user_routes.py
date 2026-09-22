from flask import Blueprint, request, jsonify
from models import (
    add_favorite, remove_favorite, get_user_favorites, is_movie_favorite,
    add_history, get_user_history, clear_user_history
)

user_bp = Blueprint("user", __name__)

# --- Favorites Routes ---

@user_bp.route("/favorites/<int:user_id>", methods=["GET"])
def get_favorites(user_id):
    favs = get_user_favorites(user_id)
    return jsonify({"favorites": favs, "count": len(favs)})

@user_bp.route("/favorites", methods=["POST"])
def toggle_favorite():
    data = request.get_json() or {}
    user_id = data.get("user_id")
    movie = data.get("movie")

    if not user_id or not movie:
        return jsonify({"error": "user_id and movie data are required"}), 400

    movie_id = str(movie.get("id"))
    currently_fav = is_movie_favorite(user_id, movie_id)

    if currently_fav:
        remove_favorite(user_id, movie_id)
        return jsonify({"favorited": False, "message": "Removed from favorites."})
    else:
        success = add_favorite(user_id, movie)
        if success:
            return jsonify({"favorited": True, "message": "Added to favorites!"})
        return jsonify({"error": "Failed to save favorite"}), 500

@user_bp.route("/favorites/<int:user_id>/<movie_id>", methods=["DELETE"])
def delete_favorite(user_id, movie_id):
    success = remove_favorite(user_id, movie_id)
    return jsonify({"success": success})

# --- History Routes ---

@user_bp.route("/history/<int:user_id>", methods=["GET"])
def get_history(user_id):
    history = get_user_history(user_id)
    return jsonify({"history": history, "count": len(history)})

@user_bp.route("/history", methods=["POST"])
def record_history():
    data = request.get_json() or {}
    user_id = data.get("user_id")
    movie = data.get("movie")

    if not user_id or not movie:
        return jsonify({"error": "user_id and movie are required"}), 400

    success = add_history(user_id, movie)
    return jsonify({"success": success})

@user_bp.route("/history/<int:user_id>/clear", methods=["POST", "DELETE"])
def clear_history(user_id):
    clear_user_history(user_id)
    return jsonify({"message": "History cleared successfully."})
