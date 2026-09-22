import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import MovieCard from './components/MovieCard';
import MovieDetailModal from './components/MovieDetailModal';
import TrailerModal from './components/TrailerModal';
import AIAgentChat from './components/AIAgentChat';
import FavoritesView from './components/FavoritesView';
import HistoryView from './components/HistoryView';
import QuotesVaultView from './components/QuotesVaultView';
import AuthModal from './components/AuthModal';
import ToastNotification from './components/ToastNotification';

import { 
  searchMovies, fetchTrendingMovies, fetchGenres, 
  toggleFavoriteAPI, fetchUserFavorites, 
  recordHistoryAPI, fetchUserHistory, clearUserHistoryAPI 
} from './services/api';

import { 
  Sparkles, Flame, Film, SlidersHorizontal, 
  Layers, Star, Tv, Search, Quote, Heart 
} from 'lucide-react';

export default function App() {
  // App State
  const [activeTab, setActiveTab] = useState('discover'); // 'discover' | 'genres' | 'quotes' | 'favorites' | 'history'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState('rating_desc');
  const [genresList, setGenresList] = useState([]);

  // Movie collections
  const [movies, setMovies] = useState([]);
  const [spotlightMovie, setSpotlightMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals & Drawers
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [trailerMovie, setTrailerMovie] = useState(null);
  const [aiChatOpen, setAiChatOpen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState('');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // User State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('movie_explorer_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [favorites, setFavorites] = useState([]);
  const [history, setHistory] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load genres
  useEffect(() => {
    async function loadGenres() {
      const data = await fetchGenres();
      if (data && data.genres) {
        setGenresList(data.genres);
      }
    }
    loadGenres();
  }, []);

  // Load user favorites & history
  useEffect(() => {
    if (user && user.id) {
      fetchUserFavorites(user.id).then(res => {
        if (res && res.favorites) setFavorites(res.favorites);
      });
      fetchUserHistory(user.id).then(res => {
        if (res && res.history) setHistory(res.history);
      });
    } else {
      // Local storage fallback for guest
      const localFavs = localStorage.getItem('guest_favs');
      if (localFavs) setFavorites(JSON.parse(localFavs));
      const localHist = localStorage.getItem('guest_hist');
      if (localHist) setHistory(JSON.parse(localHist));
    }
  }, [user]);

  // Load movies on search/filter change
  useEffect(() => {
    let isMounted = true;
    async function loadMovies() {
      setLoading(true);
      const data = await searchMovies(searchQuery, selectedGenre, sortBy);
      if (isMounted && data && data.movies) {
        setMovies(data.movies);
        if (!spotlightMovie && data.movies.length > 0) {
          setSpotlightMovie(data.movies[0]);
        }
      }
      setLoading(false);
    }

    const timer = setTimeout(() => {
      loadMovies();
    }, 150);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery, selectedGenre, sortBy]);

  // Handlers
  const handleSelectMovie = (movie) => {
    setSelectedMovie(movie);
    
    // Add to history
    if (user && user.id) {
      recordHistoryAPI(user.id, movie).then(() => {
        fetchUserHistory(user.id).then(res => res && res.history && setHistory(res.history));
      });
    } else {
      const updated = [movie, ...history.filter(m => String(m.id) !== String(movie.id))].slice(0, 30);
      setHistory(updated);
      localStorage.setItem('guest_hist', JSON.stringify(updated));
    }
  };

  const handleToggleFavorite = async (movie) => {
    const isFav = favorites.some(f => String(f.id) === String(movie.id));
    if (user && user.id) {
      const res = await toggleFavoriteAPI(user.id, movie);
      if (res) {
        showToast(res.message, res.favorited ? 'success' : 'info');
        const favsRes = await fetchUserFavorites(user.id);
        if (favsRes && favsRes.favorites) setFavorites(favsRes.favorites);
      }
    } else {
      // Guest local storage
      let updated;
      if (isFav) {
        updated = favorites.filter(f => String(f.id) !== String(movie.id));
        showToast(`Removed "${movie.title}" from favorites`, 'info');
      } else {
        updated = [movie, ...favorites];
        showToast(`Added "${movie.title}" to favorites! ❤️`, 'success');
      }
      setFavorites(updated);
      localStorage.setItem('guest_favs', JSON.stringify(updated));
    }
  };

  const handleClearHistory = async () => {
    if (user && user.id) {
      await clearUserHistoryAPI(user.id);
      setHistory([]);
      showToast('Browsing history cleared!', 'info');
    } else {
      setHistory([]);
      localStorage.removeItem('guest_hist');
      showToast('Browsing history cleared!', 'info');
    }
  };

  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('movie_explorer_user', JSON.stringify(userData));
    showToast(`Welcome back, ${userData.username}! 🎉`, 'success');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('movie_explorer_user');
    showToast('Signed out successfully.', 'info');
  };

  const handleAskAIAboutMovie = (movie) => {
    setSelectedMovie(null);
    setAiInitialQuery(`Tell me all about the movie "${movie.title}" (${movie.release_year}): the core themes, where to watch, and the most powerful quote!`);
    setAiChatOpen(true);
  };

  const handleSelectMovieById = async (id) => {
    const found = movies.find(m => String(m.id) === String(id));
    if (found) {
      handleSelectMovie(found);
    } else {
      const res = await searchMovies('', 'All');
      const direct = res?.movies?.find(m => String(m.id) === String(id));
      if (direct) handleSelectMovie(direct);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        favoritesCount={favorites.length}
        user={user}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        onOpenAI={() => {
          setAiInitialQuery('');
          setAiChatOpen(true);
        }}
        onSelectMovie={handleSelectMovie}
        onPlayTrailer={(mov) => setTrailerMovie(mov)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }} className="app-container">
        
        {/* Tab 1: Discover & Main Movie Explorer */}
        {activeTab === 'discover' && (
          <div className="animate-fade-in">
            {/* Cinematic Hero Spotlight Banner (only when not searching deeply) */}
            {!searchQuery && spotlightMovie && (
              <HeroBanner
                movie={spotlightMovie}
                onSelectMovie={handleSelectMovie}
                onPlayTrailer={(mov) => setTrailerMovie(mov)}
                isFavorite={favorites.some(f => String(f.id) === String(spotlightMovie.id))}
                onToggleFavorite={handleToggleFavorite}
              />
            )}

            {/* Filter and Genre Bar */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
              margin: '28px 0 20px',
              padding: '16px 20px',
              background: 'var(--bg-glass-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-glass)'
            }}>
              {/* Genre Pills */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                overflowX: 'auto',
                maxWidth: '100%',
                paddingBottom: '2px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', fontWeight: '700', fontSize: '0.85rem', marginRight: '6px' }}>
                  <Flame size={18} />
                  <span>GENRES:</span>
                </div>
                {genresList.slice(0, 10).map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedGenre(g)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 'var(--radius-full)',
                      border: selectedGenre === g ? '1px solid var(--accent-gold)' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: selectedGenre === g ? 'rgba(245, 197, 24, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      color: selectedGenre === g ? 'var(--accent-gold)' : 'var(--text-secondary)',
                      fontWeight: selectedGenre === g ? '700' : '500',
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>

              {/* Sort By Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal size={16} color="var(--text-muted)" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    padding: '6px 12px',
                    fontSize: '0.84rem',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="rating_desc">Highest Rated (IMDb)</option>
                  <option value="year_desc">Latest Release</option>
                  <option value="year_asc">Classic / Oldest</option>
                  <option value="title_asc">Title (A - Z)</option>
                </select>
              </div>
            </div>

            {/* Movies Section Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <div>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>
                  {searchQuery ? `Search Results for "${searchQuery}"` : selectedGenre !== 'All' ? `${selectedGenre} Movies` : '🎬 Trending & Masterpieces'}
                </h2>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Showing {movies.length} {movies.length === 1 ? 'movie' : 'movies'} with posters, OTT platforms & quotes
                </span>
              </div>
            </div>

            {/* Visual Movie Grid */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px', padding: '20px 0 60px' }}>
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={i} 
                    style={{
                      aspectRatio: '2/3',
                      borderRadius: 'var(--radius-lg)',
                      background: 'rgba(255,255,255,0.04)',
                      animation: 'pulseGlow 1.5s infinite'
                    }}
                  />
                ))}
              </div>
            ) : movies.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '24px',
                paddingBottom: '60px'
              }}>
                {movies.map((movie) => {
                  const isFav = favorites.some(f => String(f.id) === String(movie.id));
                  return (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onSelectMovie={handleSelectMovie}
                      onPlayTrailer={(mov) => setTrailerMovie(mov)}
                      isFavorite={isFav}
                      onToggleFavorite={handleToggleFavorite}
                    />
                  );
                })}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                background: 'rgba(255, 255, 255, 0.02)',
                borderRadius: 'var(--radius-xl)',
                border: '1px dashed rgba(255, 255, 255, 0.1)',
                margin: '20px 0 60px'
              }}>
                <Search size={40} color="var(--text-muted)" style={{ margin: '0 auto 16px' }} />
                <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
                  No movies found
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                  Try changing your search keywords or resetting genre filters.
                </p>
                <button
                  onClick={() => { setSearchQuery(''); setSelectedGenre('All'); }}
                  className="btn btn-secondary"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Genres View */}
        {activeTab === 'genres' && (
          <div className="animate-fade-in" style={{ padding: '24px 0 60px' }}>
            <div style={{ marginBottom: '28px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
                Browse by Movie Genre
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem' }}>
                Select a genre category to explore curated films and streaming providers
              </p>
            </div>

            {/* Genre Category Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '16px',
              marginBottom: '36px'
            }}>
              {genresList.map((g, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedGenre(g);
                    setActiveTab('discover');
                  }}
                  style={{
                    padding: '24px 16px',
                    borderRadius: 'var(--radius-lg)',
                    background: selectedGenre === g 
                      ? 'linear-gradient(135deg, rgba(245, 197, 24, 0.25) 0%, rgba(23, 27, 42, 0.9) 100%)' 
                      : 'var(--bg-glass-card)',
                    border: selectedGenre === g ? '1px solid var(--accent-gold)' : '1px solid var(--border-glass)',
                    color: '#fff',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.borderColor = 'var(--accent-gold)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.borderColor = selectedGenre === g ? 'var(--accent-gold)' : 'var(--border-glass)';
                  }}
                >
                  <Film size={26} color={selectedGenre === g ? 'var(--accent-gold)' : '#c084fc'} style={{ margin: '0 auto 10px' }} />
                  <div style={{ fontWeight: '700', fontSize: '1.05rem' }}>{g}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Explore Titles →
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Quotes Vault */}
        {activeTab === 'quotes' && (
          <QuotesVaultView onSelectMovieId={handleSelectMovieById} />
        )}

        {/* Tab 4: Favorites View */}
        {activeTab === 'favorites' && (
          <FavoritesView
            favorites={favorites}
            onSelectMovie={handleSelectMovie}
            onPlayTrailer={(mov) => setTrailerMovie(mov)}
            onToggleFavorite={handleToggleFavorite}
            onExploreClick={() => setActiveTab('discover')}
          />
        )}

        {/* Tab 5: History View */}
        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onSelectMovie={handleSelectMovie}
            onPlayTrailer={(mov) => setTrailerMovie(mov)}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onClearHistory={handleClearHistory}
            onExploreClick={() => setActiveTab('discover')}
          />
        )}
      </main>

      {/* Floating CineAI Button (if chat not open) */}
      {!aiChatOpen && (
        <button
          onClick={() => setAiChatOpen(true)}
          style={{
            position: 'fixed',
            bottom: '28px',
            right: '28px',
            zIndex: 4000,
            padding: '12px 22px',
            borderRadius: 'var(--radius-full)',
            background: 'linear-gradient(135deg, #9d4edd 0%, #7b2cbf 100%)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 8px 30px rgba(157, 78, 221, 0.5), 0 0 20px rgba(157, 78, 221, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: '700',
            fontSize: '0.95rem',
            animation: 'floatAnim 4s ease-in-out infinite'
          }}
        >
          <Sparkles size={20} />
          <span>Ask CineAI</span>
        </button>
      )}

      {/* Modals & Popups */}
      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onPlayTrailer={(mov) => setTrailerMovie(mov)}
          isFavorite={favorites.some(f => String(f.id) === String(selectedMovie.id))}
          onToggleFavorite={handleToggleFavorite}
          onAskAI={handleAskAIAboutMovie}
        />
      )}

      {trailerMovie && (
        <TrailerModal
          movie={trailerMovie}
          onClose={() => setTrailerMovie(null)}
        />
      )}

      <AIAgentChat
        isOpen={aiChatOpen}
        onClose={() => setAiChatOpen(false)}
        initialQuery={aiInitialQuery}
        onSelectMovie={handleSelectMovie}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      <ToastNotification
        toast={toast}
        onClose={() => setToast(null)}
      />

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(9, 10, 15, 0.95)',
        padding: '30px 0 24px'
      }}>
        <div className="app-container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Film size={20} color="var(--accent-gold)" />
            <span style={{ fontWeight: '800', fontSize: '1rem', color: '#fff' }}>
              Movie<span style={{ color: 'var(--accent-gold)' }}>Explorer</span>
            </span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: '8px' }}>
              — Visual Cinematic Intelligence
            </span>
          </div>

          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Powered by Flask REST API & React • Streaming OTT links & Iconic quotes included
          </div>
        </div>
      </footer>
    </div>
  );
}
