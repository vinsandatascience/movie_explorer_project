from flask import Blueprint, request, jsonify
import os
import re
from movie_data import MOVIES

ai_bp = Blueprint("ai", __name__)

def find_relevant_movies(text):
    text_lower = text.lower()
    matched = []
    for m in MOVIES:
        title = m["title"].lower()
        director = m["director"].lower()
        actors = [a.lower() for a in m.get("cast", [])]
        genres = [g.lower() for g in m.get("genres", [])]
        
        score = 0
        if title in text_lower:
            score += 10
        if director in text_lower:
            score += 5
        for a in actors:
            if a in text_lower:
                score += 4
        for g in genres:
            if g in text_lower:
                score += 2

        if score > 0:
            matched.append((score, m))
            
    matched.sort(key=lambda x: x[0], reverse=True)
    return [m for score, m in matched[:3]]

def generate_ai_response(prompt, history=[]):
    prompt_clean = prompt.strip()
    prompt_lower = prompt_clean.lower()
    
    # Check if asking about quotes
    if "quote" in prompt_lower or "dialogue" in prompt_lower or "line" in prompt_lower or "saying" in prompt_lower:
        for m in MOVIES:
            if m["title"].lower() in prompt_lower:
                quotes = m.get("quotes", [])
                if quotes:
                    quote_text = "\n\n".join([f'💬 **"{q["quote"]}"** — *{q["character"]}*' for q in quotes])
                    return f"Here are iconic, powerful lines from **{m['title']}**:\n\n{quote_text}", [m]
        
        # General quote request
        all_q = []
        for m in MOVIES:
            for q in m.get("quotes", []):
                all_q.append((m, q))
        if all_q:
            import random
            selected = random.sample(all_q, min(3, len(all_q)))
            res = "🎬 **Memorable Iconic Quotes Across Cinema:**\n\n"
            rec_movies = []
            for m, q in selected:
                res += f'• 💬 *"{q["quote"]}"*\n  — **{q["character"]}** in *{m["title"]}* ({m["release_year"]})\n\n'
                if m not in rec_movies:
                    rec_movies.append(m)
            return res, rec_movies

    # Check if asking where to watch / OTT
    if any(w in prompt_lower for w in ["where to watch", "streaming", "ott", "netflix", "prime", "stream", "watch on"]):
        for m in MOVIES:
            if m["title"].lower() in prompt_lower:
                ott_list = ", ".join([f"{p['name']} ({p['type']})" for p in m.get("ott_platforms", [])])
                return f"📺 **{m['title']}** ({m['release_year']}) is available to stream on:\n\n✨ **{ott_list}**\n\nDirected by {m['director']}, rated ⭐ **{m['rating']}/10**.", [m]

    # Check specific movie info
    for m in MOVIES:
        if m["title"].lower() in prompt_lower:
            if "director" in prompt_lower or "who directed" in prompt_lower or "who made" in prompt_lower:
                return f"🎬 **{m['title']}** was directed by the master filmmaker **{m['director']}**.", [m]
            if "cast" in prompt_lower or "actor" in prompt_lower or "star" in prompt_lower or "who plays" in prompt_lower:
                actors_str = ", ".join(m.get("cast", []))
                return f"🌟 The star cast of **{m['title']}** includes: **{actors_str}**.", [m]
            if "rating" in prompt_lower or "score" in prompt_lower or "good" in prompt_lower:
                return f"⭐ **{m['title']}** holds an outstanding IMDb rating of **{m['rating']}/10** based on {m['vote_count']:,} votes!", [m]
            if "about" in prompt_lower or "plot" in prompt_lower or "story" in prompt_lower or "summary" in prompt_lower:
                return f"📖 **Synopsis for {m['title']} ({m['release_year']}):**\n\n{m['overview']}\n\n🏷️ **Genres:** {', '.join(m.get('genres', []))}\n🎬 **Director:** {m['director']}", [m]

    # Recommendations based on genres or moods
    genre_keywords = {
        "sci-fi": ["Sci-Fi"],
        "science fiction": ["Sci-Fi"],
        "space": ["Sci-Fi", "Adventure"],
        "action": ["Action"],
        "fight": ["Action"],
        "thriller": ["Thriller", "Mystery"],
        "mind": ["Sci-Fi", "Thriller"],
        "mystery": ["Mystery", "Thriller"],
        "drama": ["Drama"],
        "animation": ["Animation"],
        "anime": ["Animation"],
        "cartoon": ["Animation"],
        "family": ["Family", "Animation"],
        "romantic": ["Romance"],
        "love": ["Romance"],
        "romance": ["Romance"],
        "crime": ["Crime", "Thriller"],
        "gangster": ["Crime", "Drama"],
        "superhero": ["Action", "Sci-Fi"],
        "marvel": ["Action", "Sci-Fi"]
    }

    matched_genres = set()
    for kw, g_list in genre_keywords.items():
        if kw in prompt_lower:
            for g in g_list:
                matched_genres.add(g)

    if matched_genres:
        matched_movies = [m for m in MOVIES if any(g in m.get("genres", []) for g in matched_genres)]
        if matched_movies:
            res_text = f"🎯 Based on your interest in **{', '.join(matched_genres)}**, here are top cinema recommendations:\n\n"
            for m in matched_movies[:3]:
                res_text += f"• **{m['title']}** ({m['release_year']}) — ⭐ **{m['rating']}/10**\n  _{m['tagline']}_\n  *Stream on: {', '.join([p['name'] for p in m.get('ott_platforms', [])[:2]])}*\n\n"
            return res_text, matched_movies[:3]

    # Director checks
    directors = ["Christopher Nolan", "Denis Villeneuve", "Quentin Tarantino", "Martin Scorsese", "Bong Joon-ho", "Hayao Miyazaki", "Ridley Scott", "James Cameron"]
    for d in directors:
        if d.lower() in prompt_lower:
            d_movies = [m for m in MOVIES if m["director"].lower() == d.lower()]
            if d_movies:
                res_text = f"🎥 **{d}** is a visionary director! Featured works in Movie Explorer:\n\n"
                for m in d_movies:
                    res_text += f"• **{m['title']}** ({m['release_year']}) — ⭐ {m['rating']}/10\n"
                return res_text, d_movies

    # Natural conversation / greetings / fallback
    if any(w in prompt_lower for w in ["hi", "hello", "hey", "who are you", "what can you do"]):
        return (
            "👋 Hello! I am **CineAI**, your personal Movie Explorer AI agent.\n\n"
            "Here's what I can do for you:\n"
            "• 🎬 **Recommend movies** by mood, genre (Sci-Fi, Thriller, Animation, Action) or favorite director\n"
            "• 📺 **Find OTT streaming platforms** (Netflix, Prime, Disney+, Apple TV+, etc.)\n"
            "• 💬 **Share iconic quotes & character lines**\n"
            "• 🔍 **Explain plot summaries, themes, and trivia**\n"
            "• ⭐ **Give ratings and cast information**\n\n"
            "What kind of movie or question is on your mind today?"
        ), MOVIES[:2]

    # Fallback contextual search
    relevant = find_relevant_movies(prompt_clean)
    if relevant:
        res = f"Here is what I found regarding **\"{prompt_clean}\"**:\n\n"
        for m in relevant:
            res += f"✨ **{m['title']}** ({m['release_year']}) — ⭐ {m['rating']}/10\n_{m['overview'][:140]}..._\n\n"
        return res, relevant

    return (
        f"I explored cinema records for **\"{prompt_clean}\"**! While you can browse across our rich catalog, "
        f"I highly recommend masterpieces like **Interstellar**, **Inception**, **Oppenheimer**, or **Spider-Man: Across the Spider-Verse**.\n\n"
        f"Feel free to ask me for movie quotes, streaming platforms, or specific genres!"
    ), MOVIES[:3]

@ai_bp.route("/chat", methods=["POST"])
def chat():
    data = request.get_json() or {}
    message = data.get("message", "").strip()
    history = data.get("history", [])

    if not message:
        return jsonify({"error": "Message is required."}), 400

    reply_text, movie_cards = generate_ai_response(message, history)

    # Convert movie cards to lightweight payload
    cards_payload = []
    for m in movie_cards:
        cards_payload.append({
            "id": m["id"],
            "title": m["title"],
            "poster": m["poster"],
            "rating": m["rating"],
            "release_year": m["release_year"],
            "genres": m.get("genres", []),
            "tagline": m.get("tagline", "")
        })

    return jsonify({
        "reply": reply_text,
        "movies": cards_payload
    })
