import React from 'react';
import { Heart, Film, ArrowRight, Sparkles } from 'lucide-react';
import MovieCard from './MovieCard';

export default function FavoritesView({ 
  favorites, 
  onSelectMovie, 
  onPlayTrailer, 
  onToggleFavorite, 
  onExploreClick 
}) {
  return (
    <div style={{ padding: '20px 0 60px' }} className="animate-fade-in">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '28px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(255, 51, 102, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Heart size={20} color="#ff3366" fill="#ff3366" />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
              My Favorite Movies
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px' }}>
            Your personally curated collection of cinematic favorites
          </p>
        </div>

        <div style={{
          padding: '6px 14px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(255, 51, 102, 0.12)',
          color: '#ff3366',
          fontWeight: '700',
          fontSize: '0.88rem',
          border: '1px solid rgba(255, 51, 102, 0.3)'
        }}>
          {favorites.length} Saved {favorites.length === 1 ? 'Movie' : 'Movies'}
        </div>
      </div>

      {/* Movies Grid or Empty State */}
      {favorites.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '24px'
        }}>
          {favorites.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onSelectMovie={onSelectMovie}
              onPlayTrailer={onPlayTrailer}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '80px 20px',
          background: 'rgba(255, 255, 255, 0.02)',
          borderRadius: 'var(--radius-xl)',
          border: '1px dashed rgba(255, 255, 255, 0.12)',
          maxWidth: '560px',
          margin: '40px auto'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(255, 51, 102, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Heart size={32} color="#ff3366" />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
            No favorite movies yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.6 }}>
            Click the heart icon on any movie card or detail page to save your favorite films here for quick access!
          </p>
          <button
            onClick={onExploreClick}
            className="btn btn-primary"
            style={{ padding: '12px 28px' }}
          >
            <Film size={18} />
            <span>Discover Movies</span>
          </button>
        </div>
      )}
    </div>
  );
}
