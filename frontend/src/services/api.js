// Resilient & Live Global API Service for Movie Explorer Frontend
import { MOVIES, GENRES } from '../data/moviesData';

const API_BASE = "http://127.0.0.1:5000/api";

// Client-side IMDb Live Global Search fallback
export async function searchIMDbClientSide(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const encoded = encodeURIComponent(query.trim().toLowerCase());
    const res = await fetch(`https://v3.sg.media-imdb.com/suggestion/x/${encoded}.json`);
    if (!res.ok) return [];
    const data = await res.json();
    const items = data.d || [];
    
    return items
      .filter(item => item.id && item.id.startsWith('tt') && (!item.qid || ['movie', 'tvSeries', 'tvMovie', 'tvMiniSeries', 'feature'].includes(item.qid)))
      .map(item => {
        const imdbId = item.id;
        const title = item.l;
        const year = String(item.y || item.tl || '2024');
        const castStr = item.s || '';
        const cast = castStr ? castStr.split(',').map(s => s.trim()) : [];
        const poster = item.i?.imageUrl || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=80';
        
        let inferredGenres = ['Drama', 'Thriller'];
        const tl = title.toLowerCase();
        if (tl.includes('action') || tl.includes('war') || tl.includes('strike') || tl.includes('hero')) inferredGenres = ['Action', 'Thriller'];
        else if (tl.includes('space') || tl.includes('sci') || tl.includes('future') || tl.includes('world')) inferredGenres = ['Sci-Fi', 'Adventure'];
        else if (tl.includes('love') || tl.includes('romance') || tl.includes('story')) inferredGenres = ['Romance', 'Drama'];
        else if (tl.includes('comedy') || tl.includes('boys') || tl.includes('party')) inferredGenres = ['Comedy', 'Drama'];

        return {
          id: imdbId,
          imdb_id: imdbId,
          title,
          tagline: `Acclaimed cinema release (${year}).`,
          release_year: year,
          release_date: `${year}-01-01`,
          rating: 7.6,
          vote_count: 15000,
          runtime: '128 min',
          genres: inferredGenres,
          director: 'Acclaimed Director',
          cast: cast.length ? cast : ['Starring Ensemble'],
          poster,
          backdrop: poster,
          overview: `${title} is a ${year} film starring ${cast.slice(0, 3).join(', ') || 'an ensemble cast'}. Explore official trailers, synopsis, streaming platforms and cast details.`,
          ott_platforms: [
            { name: "Prime Video", badge_color: "#00A8E1", type: "Stream/Rent", link: `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(title)}`, icon: "amazon" },
            { name: "Netflix", badge_color: "#E50914", type: "Stream", link: `https://www.netflix.com/search?q=${encodeURIComponent(title)}`, icon: "netflix" },
            { name: "Disney+ Hotstar", badge_color: "#0C111B", type: "Stream", link: `https://www.hotstar.com/in/explore?search_query=${encodeURIComponent(title)}`, icon: "film" },
            { name: "Apple TV+", badge_color: "#000000", type: "Rent/Buy", link: `https://tv.apple.com/search?term=${encodeURIComponent(title)}`, icon: "apple" }
          ],
          quotes: [
            { quote: `Experience the thrilling story of ${title}.`, character: cast[0] || 'Lead' }
          ],
          trailer_url: '',
          tmdb_link: `https://www.imdb.com/title/${imdbId}`
        };
      });
  } catch (err) {
    return [];
  }
}

// Helper for local search filtering
export function filterMoviesLocally(query = "", genre = "All", sortBy = "rating_desc") {
  const cleanQuery = (query || "").trim().toLowerCase();
  let results = MOVIES.filter(m => {
    // Genre match
    if (genre && genre.toLowerCase() !== "all") {
      const matchGenre = (m.genres || []).some(g => g.toLowerCase() === genre.toLowerCase());
      if (!matchGenre) return false;
    }

    // Query match
    if (cleanQuery) {
      const titleMatch = (m.title || "").toLowerCase().includes(cleanQuery);
      const taglineMatch = (m.tagline || "").toLowerCase().includes(cleanQuery);
      const directorMatch = (m.director || "").toLowerCase().includes(cleanQuery);
      const castMatch = (m.cast || []).some(c => c.toLowerCase().includes(cleanQuery));
      const genreMatch = (m.genres || []).some(g => g.toLowerCase().includes(cleanQuery));
      const quoteMatch = (m.quotes || []).some(q => 
        (q.quote || "").toLowerCase().includes(cleanQuery) || 
        (q.character || "").toLowerCase().includes(cleanQuery)
      );
      const overviewMatch = (m.overview || "").toLowerCase().includes(cleanQuery);

      return titleMatch || taglineMatch || directorMatch || castMatch || genreMatch || quoteMatch || overviewMatch;
    }

    return true;
  });

  // Sorting
  if (sortBy === "rating_desc") {
    results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortBy === "rating_asc") {
    results.sort((a, b) => (a.rating || 0) - (b.rating || 0));
  } else if (sortBy === "year_desc") {
    results.sort((a, b) => Number(b.release_year || 0) - Number(a.release_year || 0));
  } else if (sortBy === "year_asc") {
    results.sort((a, b) => Number(a.release_year || 0) - Number(b.release_year || 0));
  } else if (sortBy === "title_asc") {
    results.sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  }

  return {
    query: cleanQuery,
    genre,
    total: results.length,
    movies: results
  };
}

export async function fetchTrendingMovies() {
  try {
    const res = await fetch(`${API_BASE}/movies/trending`);
    if (!res.ok) throw new Error("Failed to fetch trending movies");
    return await res.json();
  } catch (err) {
    const sorted = [...MOVIES].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return {
      spotlight: sorted[0] || null,
      trending: sorted
    };
  }
}

export async function searchMovies(query = "", genre = "All", sortBy = "rating_desc") {
  try {
    const params = new URLSearchParams();
    if (query) params.append("q", query.trim());
    if (genre && genre !== "All") params.append("genre", genre);
    if (sortBy) params.append("sort", sortBy);

    const res = await fetch(`${API_BASE}/movies/search?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to search movies");
    const data = await res.json();
    
    // If backend returned results, return them
    if (data && data.movies && data.movies.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn("Backend search unreachable, using live client-side search fallback");
  }

  // Graceful client-side live search fallback
  const localRes = filterMoviesLocally(query, genre, sortBy);
  if (query && query.trim().length >= 2) {
    try {
      const liveMatches = await searchIMDbClientSide(query);
      const seen = new Set(localRes.movies.map(m => m.title.toLowerCase()));
      const merged = [...localRes.movies];
      
      for (const lm of liveMatches) {
        if (!seen.has(lm.title.toLowerCase())) {
          seen.add(lm.title.toLowerCase());
          merged.push(lm);
        }
      }
      return {
        query: query.trim(),
        genre,
        total: merged.length,
        movies: merged
      };
    } catch (e) {
      return localRes;
    }
  }

  return localRes;
}

export async function fetchGenres() {
  try {
    const res = await fetch(`${API_BASE}/movies/genres`);
    if (!res.ok) throw new Error("Failed to fetch genres");
    return await res.json();
  } catch (err) {
    return { genres: GENRES };
  }
}

export async function fetchMovieDetail(movieId) {
  try {
    const res = await fetch(`${API_BASE}/movies/detail/${movieId}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Backend detail fetch error, using client-side fallback");
  }

  // If starts with tt (IMDb ID), fetch from Cinemeta API directly
  if (String(movieId).startsWith('tt')) {
    try {
      const metaRes = await fetch(`https://v3-cinemeta.strem.io/meta/movie/${movieId}.json`);
      if (metaRes.ok) {
        const metaData = await metaRes.json();
        const meta = metaData.meta;
        if (meta) {
          const title = meta.name || 'Movie';
          const year = String(meta.year || meta.releaseInfo || '2024');
          const cast = meta.cast || [];
          const genres = meta.genres || meta.genre || ['Drama', 'Thriller'];
          
          return {
            movie: {
              id: movieId,
              imdb_id: movieId,
              title,
              tagline: `Official metadata for ${title}.`,
              release_year: year,
              release_date: meta.released || `${year}-01-01`,
              rating: meta.imdbRating ? parseFloat(meta.imdbRating) : 7.5,
              vote_count: 24000,
              runtime: meta.runtime || '125 min',
              genres,
              director: Array.isArray(meta.director) ? meta.director.join(', ') : (meta.director || 'Acclaimed Director'),
              cast,
              poster: meta.poster || `https://images.metahub.space/poster/small/${movieId}/img`,
              backdrop: meta.background || `https://images.metahub.space/background/medium/${movieId}/img`,
              overview: meta.description || `${title} (${year}) starring ${cast.slice(0, 3).join(', ')}.`,
              ott_platforms: [
                { name: "Prime Video", badge_color: "#00A8E1", type: "Stream/Rent", link: `https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(title)}`, icon: "amazon" },
                { name: "Netflix", badge_color: "#E50914", type: "Stream", link: `https://www.netflix.com/search?q=${encodeURIComponent(title)}`, icon: "netflix" },
                { name: "Disney+ Hotstar", badge_color: "#0C111B", type: "Stream", link: `https://www.hotstar.com/in/explore?search_query=${encodeURIComponent(title)}`, icon: "film" },
                { name: "Apple TV+", badge_color: "#000000", type: "Rent/Buy", link: `https://tv.apple.com/search?term=${encodeURIComponent(title)}`, icon: "apple" }
              ],
              quotes: [
                { quote: `Experience the cinematic journey of ${title}.`, character: cast[0] || 'Protagonist' }
              ],
              trailer_url: meta.trailer || '',
              tmdb_link: `https://www.imdb.com/title/${movieId}`
            },
            recommendations: MOVIES.slice(0, 4)
          };
        }
      }
    } catch (e) {
      console.warn("Cinemeta fetch failed", e);
    }
  }

  // Fallback to local curated
  const found = MOVIES.find(m => String(m.id) === String(movieId) || String(m.imdb_id) === String(movieId));
  if (found) {
    const firstGenre = (found.genres || ["Action"])[0];
    const recs = MOVIES.filter(m => String(m.id) !== String(movieId) && (m.genres || []).includes(firstGenre)).slice(0, 4);
    return {
      movie: found,
      recommendations: recs
    };
  }

  return null;
}

export async function fetchRandomQuote() {
  try {
    const res = await fetch(`${API_BASE}/movies/quotes/random`);
    if (!res.ok) throw new Error("Failed to fetch quote");
    return await res.json();
  } catch (err) {
    const allQuotes = [];
    MOVIES.forEach(m => {
      (m.quotes || []).forEach(q => {
        allQuotes.push({
          quote: q.quote,
          character: q.character,
          movie_id: m.id,
          movie_title: m.title,
          poster: m.poster
        });
      });
    });
    if (allQuotes.length > 0) {
      const idx = Math.floor(Math.random() * allQuotes.length);
      return allQuotes[idx];
    }
    return {
      quote: "Do not go gentle into that good night; Rage, rage against the dying of the light.",
      character: "Prof. Brand",
      movie_title: "Interstellar"
    };
  }
}

export async function fetchAllQuotes() {
  try {
    const res = await fetch(`${API_BASE}/movies/quotes/all`);
    if (!res.ok) throw new Error("Failed to fetch all quotes");
    return await res.json();
  } catch (err) {
    const quotes = [];
    MOVIES.forEach(m => {
      (m.quotes || []).forEach(q => {
        quotes.push({
          quote: q.quote,
          character: q.character,
          movie_id: m.id,
          movie_title: m.title,
          release_year: m.release_year,
          poster: m.poster
        });
      });
    });
    return { quotes, total: quotes.length };
  }
}

export async function toggleFavoriteAPI(userId, movie) {
  try {
    const res = await fetch(`${API_BASE}/user/favorites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, movie })
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchUserFavorites(userId) {
  try {
    const res = await fetch(`${API_BASE}/user/favorites/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch favorites");
    return await res.json();
  } catch (err) {
    return { favorites: [] };
  }
}

export async function recordHistoryAPI(userId, movie) {
  try {
    const res = await fetch(`${API_BASE}/user/history`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, movie })
    });
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchUserHistory(userId) {
  try {
    const res = await fetch(`${API_BASE}/user/history/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch history");
    return await res.json();
  } catch (err) {
    return { history: [] };
  }
}

export async function clearUserHistoryAPI(userId) {
  try {
    const res = await fetch(`${API_BASE}/user/history/${userId}/clear`, {
      method: "POST"
    });
    return await res.json();
  } catch (err) {
    return { success: false };
  }
}

export async function loginUserAPI(credentials) {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");
    return data;
  } catch (err) {
    throw err;
  }
}

export async function registerUserAPI(userData) {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    return data;
  } catch (err) {
    throw err;
  }
}

export async function sendAIChatMessage(message, history = []) {
  try {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history })
    });
    if (!res.ok) throw new Error("AI Agent response error");
    return await res.json();
  } catch (err) {
    const clean = message.toLowerCase();
    const matched = MOVIES.filter(m => 
      clean.includes(m.title.toLowerCase()) || 
      (m.genres || []).some(g => clean.includes(g.toLowerCase()))
    ).slice(0, 3);
    
    return {
      reply: `Here are cinematic recommendations tailored to your query:`,
      movies: matched
    };
  }
}
