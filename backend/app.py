import os
from flask import Flask, jsonify
from flask_cors import CORS
from models import init_db
from routes.auth_routes import auth_bp
from routes.movie_routes import movie_bp
from routes.user_routes import user_bp
from routes.ai_routes import ai_bp

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Initialize SQLite database
    init_db()

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(movie_bp, url_prefix="/api/movies")
    app.register_blueprint(user_bp, url_prefix="/api/user")
    app.register_blueprint(ai_bp, url_prefix="/api/ai")

    @app.route("/")
    def index():
        return jsonify({
            "status": "online",
            "name": "Movie Explorer API",
            "version": "1.0.0",
            "endpoints": [
                "/api/movies/trending",
                "/api/movies/search",
                "/api/movies/genres",
                "/api/movies/detail/<id>",
                "/api/movies/quotes/random",
                "/api/movies/quotes/all",
                "/api/auth/login",
                "/api/auth/register",
                "/api/user/favorites",
                "/api/user/history",
                "/api/ai/chat"
            ]
        })

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app

if __name__ == "__main__":
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    print(f"=== Movie Explorer Backend running on http://127.0.0.1:{port} ===")
    app.run(host="0.0.0.0", port=port, debug=False)
