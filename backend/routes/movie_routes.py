from flask import Blueprint, request, jsonify
import urllib.request
import urllib.parse
import json
import random
import os
from movie_data import MOVIES, GENRES

movie_bp = Blueprint("movies", __name__)

def fetch_imdb_live_movies(query):
    if not query or len(query.strip()) < 2:
        return []
    
    clean = query.strip().lower()
    encoded = urllib.parse.quote(clean)
    url = f"https://v3.sg.media-imdb.com/suggestion/x/{encoded}.json"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    )
    
    try:
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            items = data.get("d", [])
            live_movies = []
            
            for item in items:
                qid = item.get("qid")
                qtype = item.get("q")
                # Include movies, features, series
                if qid not in ["movie", "tvSeries", "tvMovie", "tvMiniSeries", "short", "feature", None] and qtype not in ["feature", "movie", None]:
                    continue
                
                title = item.get("l")
                if not title:
                    continue
                    
                imdb_id = item.get("id", "")
                if not imdb_id.startswith("tt"):
                    continue
                year = str(item.get("y", item.get("tl", "2024")))
                cast_str = item.get("s", "")
                cast = [c.strip() for c in cast_str.split(",")] if cast_str else []
                
                img = item.get("i", {})
                poster = img.get("imageUrl", "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80")
                
                # Inferred realistic genres from title/context
                inferred_genres = ["Drama"]
                title_lower = title.lower()
                if any(k in title_lower for k in ["action", "war", "fight", "hunt", "mission", "strike", "hero", "kill"]):
                    inferred_genres = ["Action", "Thriller"]
                elif any(k in title_lower for k in ["space", "alien", "star", "future", "time", "cyber", "world"]):
                    inferred_genres = ["Sci-Fi", "Adventure"]
                elif any(k in title_lower for k in ["love", "heart", "romance", "kiss", "story"]):
                    inferred_genres = ["Romance", "Drama"]
                elif any(k in title_lower for k in ["laugh", "comedy", "funny", "party", "boys"]):
                    inferred_genres = ["Comedy", "Drama"]
                elif any(k in title_lower for k in ["cross", "dead", "dark", "secret", "detective", "murder", "blood"]):
                    inferred_genres = ["Thriller", "Crime", "Drama"]
                else:
                    inferred_genres = ["Drama", "Action"]

                safe_title = urllib.parse.quote(title)
                
                live_movies.append({
                    "id": imdb_id,
                    "imdb_id": imdb_id,
                    "title": title,
                    "tagline": f"The acclaimed cinema experience of {title} ({year}).",
                    "release_year": year,
                    "release_date": f"{year}-01-01",
                    "rating": 7.6,
                    "vote_count": random.randint(1500, 45000),
                    "runtime": "130 min",
                    "genres": inferred_genres,
                    "director": "Acclaimed Filmmaker",
                    "cast": cast if cast else ["Starring Ensemble"],
                    "poster": poster,
                    "backdrop": poster,
                    "overview": f"{title} is a {year} film starring {', '.join(cast[:3]) if cast else 'a stellar cast'}. Explore official trailers, synopsis, OTT streaming platforms and trivia.",
                    "ott_platforms": [
                        {"name": "Prime Video", "badge_color": "#00A8E1", "type": "Stream/Rent", "link": f"https://www.primevideo.com/search/ref=atv_nb_sr?phrase={safe_title}", "icon": "amazon"},
                        {"name": "Netflix", "badge_color": "#E50914", "type": "Stream", "link": f"https://www.netflix.com/search?q={safe_title}", "icon": "netflix"},
                        {"name": "Disney+ Hotstar", "badge_color": "#0C111B", "type": "Stream", "link": f"https://www.hotstar.com/in/explore?search_query={safe_title}", "icon": "film"},
                        {"name": "Apple TV+", "badge_color": "#000000", "type": "Rent/Buy", "link": f"https://tv.apple.com/search?term={safe_title}", "icon": "apple"}
                    ],
                    "quotes": [
                        {"quote": f"Experience the powerful cinematic journey of {title}.", "character": cast[0] if cast else "Lead Character"}
                    ],
                    "trailer_url": "", # dynamically handled by YouTube embed search
                    "tmdb_link": f"https://www.imdb.com/title/{imdb_id}"
                })
            return live_movies
    except Exception as e:
        print(f"[IMDb Live API] Error querying '{query}': {e}")
        return []

def fetch_cinemeta_detail(imdb_id):
    if not imdb_id or not imdb_id.startswith("tt"):
        return None
    url = f"https://v3-cinemeta.strem.io/meta/movie/{imdb_id}.json"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
    )
    try:
        with urllib.request.urlopen(req, timeout=3.5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            meta = data.get("meta", {})
            if meta:
                title = meta.get("name", "Unknown Title")
                year = str(meta.get("year", meta.get("releaseInfo", "2024")))
                cast = meta.get("cast", [])
                genres = meta.get("genres", meta.get("genre", ["Drama", "Thriller"]))
                safe_title = urllib.parse.quote(title)
                
                return {
                    "id": imdb_id,
                    "imdb_id": imdb_id,
                    "title": title,
                    "tagline": f"Official metadata & streaming info for {title}.",
                    "release_year": year,
                    "release_date": meta.get("released", f"{year}-01-01"),
                    "rating": float(meta.get("imdbRating", 7.5)) if meta.get("imdbRating") else 7.5,
                    "vote_count": 28000,
                    "runtime": meta.get("runtime", "125 min"),
                    "genres": genres if genres else ["Drama"],
                    "director": ", ".join(meta.get("director", [])) if isinstance(meta.get("director"), list) else str(meta.get("director", "Acclaimed Director")),
                    "cast": cast,
                    "poster": meta.get("poster") or f"https://images.metahub.space/poster/small/{imdb_id}/img",
                    "backdrop": meta.get("background") or f"https://images.metahub.space/background/medium/{imdb_id}/img",
                    "overview": meta.get("description", f"{title} ({year}) starring {', '.join(cast[:3]) if cast else 'a top ensemble'}. Explore full details and streaming links."),
                    "ott_platforms": [
                        {"name": "Prime Video", "badge_color": "#00A8E1", "type": "Stream/Rent", "link": f"https://www.primevideo.com/search/ref=atv_nb_sr?phrase={safe_title}", "icon": "amazon"},
                        {"name": "Netflix", "badge_color": "#E50914", "type": "Stream", "link": f"https://www.netflix.com/search?q={safe_title}", "icon": "netflix"},
                        {"name": "Disney+ Hotstar", "badge_color": "#0C111B", "type": "Stream", "link": f"https://www.hotstar.com/in/explore?search_query={safe_title}", "icon": "film"},
                        {"name": "Apple TV+", "badge_color": "#000000", "type": "Rent/Buy", "link": f"https://tv.apple.com/search?term={safe_title}", "icon": "apple"}
                    ],
                    "quotes": [
                        {"quote": f"Experience the compelling story of {title}.", "character": cast[0] if cast else "Protagonist"}
                    ],
                    "trailer_url": meta.get("trailer", ""),
                    "tmdb_link": f"https://www.imdb.com/title/{imdb_id}"
                }
    except Exception as e:
        print(f"[Cinemeta Detail API] Error fetching '{imdb_id}': {e}")
    return None

@movie_bp.route("/genres", methods=["GET"])
def get_genres():
    return jsonify({"genres": GENRES})

@movie_bp.route("/trending", methods=["GET"])
def get_trending():
    sorted_movies = sorted(MOVIES, key=lambda m: m["rating"], reverse=True)
    return jsonify({
        "spotlight": sorted_movies[0] if sorted_movies else None,
        "trending": sorted_movies
    })

@movie_bp.route("/search", methods=["GET"])
def search_movies():
    query = request.args.get("q", "").strip()
    genre = request.args.get("genre", "").strip()
    sort_by = request.args.get("sort", "rating_desc")

    results = []
    seen_ids = set()

    # 1. Local curated database matching
    for m in MOVIES:
        if genre and genre.lower() != "all":
            movie_genres_lower = [g.lower() for g in m.get("genres", [])]
            if genre.lower() not in movie_genres_lower:
                continue

        if query:
            clean_q = query.lower()
            title_match = clean_q in m.get("title", "").lower()
            tagline_match = clean_q in m.get("tagline", "").lower()
            director_match = clean_q in m.get("director", "").lower()
            cast_match = any(clean_q in actor.lower() for actor in m.get("cast", []))
            overview_match = clean_q in m.get("overview", "").lower()
            genres_match = any(clean_q in g.lower() for g in m.get("genres", []))
            quotes_match = any(clean_q in q.get("quote", "").lower() for q in m.get("quotes", []))

            if not (title_match or tagline_match or director_match or cast_match or overview_match or genres_match or quotes_match):
                continue

        results.append(m)
        seen_ids.add(str(m["id"]))
        if m.get("imdb_id"):
            seen_ids.add(str(m["imdb_id"]))

    # 2. Live Global IMDb Search Query (if query is present)
    if query and len(query) >= 2:
        live_matches = fetch_imdb_live_movies(query)
        for lm in live_matches:
            if str(lm["id"]) not in seen_ids and str(lm.get("imdb_id")) not in seen_ids:
                # Apply genre filter if set
                if genre and genre.lower() != "all":
                    lm_genres_lower = [g.lower() for g in lm.get("genres", [])]
                    if genre.lower() not in lm_genres_lower:
                        continue
                results.append(lm)
                seen_ids.add(str(lm["id"]))

    # 3. Sorting
    if sort_by == "rating_desc":
        results.sort(key=lambda x: x.get("rating", 0), reverse=True)
    elif sort_by == "rating_asc":
        results.sort(key=lambda x: x.get("rating", 0))
    elif sort_by == "year_desc":
        results.sort(key=lambda x: str(x.get("release_year", "0")), reverse=True)
    elif sort_by == "year_asc":
        results.sort(key=lambda x: str(x.get("release_year", "0")))
    elif sort_by == "title_asc":
        results.sort(key=lambda x: x.get("title", "").lower())

    return jsonify({
        "query": query,
        "genre": genre,
        "total": len(results),
        "movies": results
    })

@movie_bp.route("/detail/<movie_id>", methods=["GET"])
def get_movie_detail(movie_id):
    # Check local curated database first
    movie = next((m for m in MOVIES if str(m["id"]) == str(movie_id) or str(m.get("imdb_id")) == str(movie_id)), None)
    
    # If not found locally, fetch rich details from Cinemeta metadata API
    if not movie and str(movie_id).startswith("tt"):
        movie = fetch_cinemeta_detail(str(movie_id))
        
    if not movie:
        return jsonify({"error": "Movie not found"}), 404
    
    # Recommendations
    first_genre = movie.get("genres", ["Action"])[0] if movie.get("genres") else "Action"
    recommendations = [
        m for m in MOVIES 
        if str(m["id"]) != str(movie_id) and first_genre in m.get("genres", [])
    ][:4]

    return jsonify({
        "movie": movie,
        "recommendations": recommendations
    })

@movie_bp.route("/quotes/random", methods=["GET"])
def get_random_quote():
    all_quotes = []
    for m in MOVIES:
        for q in m.get("quotes", []):
            all_quotes.append({
                "quote": q["quote"],
                "character": q["character"],
                "movie_id": m["id"],
                "movie_title": m["title"],
                "poster": m["poster"]
            })
    
    if not all_quotes:
        return jsonify({"quote": "May the Force be with you.", "character": "Jedi", "movie_title": "Star Wars"})

    chosen = random.choice(all_quotes)
    return jsonify(chosen)

@movie_bp.route("/quotes/all", methods=["GET"])
def get_all_quotes():
    quotes_list = []
    for m in MOVIES:
        for q in m.get("quotes", []):
            quotes_list.append({
                "quote": q["quote"],
                "character": q["character"],
                "movie_id": m["id"],
                "movie_title": m["title"],
                "release_year": m["release_year"],
                "poster": m["poster"]
            })
    return jsonify({"quotes": quotes_list, "total": len(quotes_list)})
