import sqlite3
import os
from werkzeug.security import generate_password_hash, check_password_hash
import json

DB_PATH = os.path.join(os.path.dirname(__file__), "movie_explorer.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Favorites table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        movie_id TEXT NOT NULL,
        movie_title TEXT NOT NULL,
        poster_path TEXT,
        backdrop_path TEXT,
        vote_average REAL,
        release_date TEXT,
        genres TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, movie_id),
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    # History table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        movie_id TEXT NOT NULL,
        movie_title TEXT NOT NULL,
        poster_path TEXT,
        backdrop_path TEXT,
        vote_average REAL,
        release_date TEXT,
        genres TEXT,
        viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    )
    """)
    
    conn.commit()
    
    # Insert a default demo user if not exists
    cursor.execute("SELECT id FROM users WHERE username = 'demouser'")
    if not cursor.fetchone():
        hashed = generate_password_hash("password123")
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, avatar) VALUES (?, ?, ?, ?)",
            ("demouser", "demo@movieexplorer.io", hashed, "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80")
        )
        conn.commit()
        
    conn.close()

def create_user(username, email, password, avatar=None):
    conn = get_db()
    cursor = conn.cursor()
    if not avatar:
        avatar = f"https://api.dicebear.com/7.x/bottts/svg?seed={username}"
    hashed = generate_password_hash(password)
    try:
        cursor.execute(
            "INSERT INTO users (username, email, password_hash, avatar) VALUES (?, ?, ?, ?)",
            (username, email, hashed, avatar)
        )
        conn.commit()
        user_id = cursor.lastrowid
        conn.close()
        return {"id": user_id, "username": username, "email": email, "avatar": avatar}
    except sqlite3.IntegrityError:
        conn.close()
        return None

def authenticate_user(username_or_email, password):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT * FROM users WHERE username = ? OR email = ?",
        (username_or_email, username_or_email)
    )
    user = cursor.fetchone()
    conn.close()
    if user and check_password_hash(user["password_hash"], password):
        return {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "avatar": user["avatar"]
        }
    return None

def get_user_by_id(user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email, avatar, created_at FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    if user:
        return dict(user)
    return None

def add_favorite(user_id, movie_data):
    conn = get_db()
    cursor = conn.cursor()
    genres_str = json.dumps(movie_data.get("genres", []))
    try:
        cursor.execute("""
        INSERT OR REPLACE INTO favorites 
        (user_id, movie_id, movie_title, poster_path, backdrop_path, vote_average, release_date, genres)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            str(movie_data.get("id")),
            movie_data.get("title", ""),
            movie_data.get("poster", ""),
            movie_data.get("backdrop", ""),
            movie_data.get("rating", 0.0),
            str(movie_data.get("release_year", movie_data.get("release_date", ""))),
            genres_str
        ))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print("Error adding favorite:", e)
        conn.close()
        return False

def remove_favorite(user_id, movie_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM favorites WHERE user_id = ? AND movie_id = ?", (user_id, str(movie_id)))
    conn.commit()
    affected = cursor.rowcount
    conn.close()
    return affected > 0

def get_user_favorites(user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM favorites WHERE user_id = ? ORDER BY created_at DESC", (user_id,))
    rows = cursor.fetchall()
    conn.close()
    favs = []
    for r in rows:
        d = dict(r)
        try:
            d["genres"] = json.loads(d["genres"]) if d["genres"] else []
        except:
            d["genres"] = []
        d["id"] = d["movie_id"]
        d["title"] = d["movie_title"]
        d["poster"] = d["poster_path"]
        d["backdrop"] = d["backdrop_path"]
        d["rating"] = d["vote_average"]
        d["release_year"] = d["release_date"]
        favs.append(d)
    return favs

def is_movie_favorite(user_id, movie_id):
    if not user_id:
        return False
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM favorites WHERE user_id = ? AND movie_id = ?", (user_id, str(movie_id)))
    row = cursor.fetchone()
    conn.close()
    return bool(row)

def add_history(user_id, movie_data):
    if not user_id:
        return False
    conn = get_db()
    cursor = conn.cursor()
    genres_str = json.dumps(movie_data.get("genres", []))
    try:
        # Delete prior recent visit to keep only latest if duplicated
        cursor.execute("DELETE FROM history WHERE user_id = ? AND movie_id = ?", (user_id, str(movie_data.get("id"))))
        cursor.execute("""
        INSERT INTO history 
        (user_id, movie_id, movie_title, poster_path, backdrop_path, vote_average, release_date, genres)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            user_id,
            str(movie_data.get("id")),
            movie_data.get("title", ""),
            movie_data.get("poster", ""),
            movie_data.get("backdrop", ""),
            movie_data.get("rating", 0.0),
            str(movie_data.get("release_year", movie_data.get("release_date", ""))),
            genres_str
        ))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print("Error recording history:", e)
        conn.close()
        return False

def get_user_history(user_id, limit=30):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM history WHERE user_id = ? ORDER BY viewed_at DESC LIMIT ?", (user_id, limit))
    rows = cursor.fetchall()
    conn.close()
    history = []
    for r in rows:
        d = dict(r)
        try:
            d["genres"] = json.loads(d["genres"]) if d["genres"] else []
        except:
            d["genres"] = []
        d["id"] = d["movie_id"]
        d["title"] = d["movie_title"]
        d["poster"] = d["poster_path"]
        d["backdrop"] = d["backdrop_path"]
        d["rating"] = d["vote_average"]
        d["release_year"] = d["release_date"]
        history.append(d)
    return history

def clear_user_history(user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM history WHERE user_id = ?", (user_id,))
    conn.commit()
    conn.close()
    return True
