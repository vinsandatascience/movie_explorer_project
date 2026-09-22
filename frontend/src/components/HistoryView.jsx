import React from 'react';
import { Clock, Trash2, Film, Star, ExternalLink, Calendar } from 'lucide-react';
import MovieCard from './MovieCard';

export default function HistoryView({ 
  history, 
  onSelectMovie, 
  onPlayTrailer, 
  favorites, 
  onToggleFavorite, 
  onClearHistory, 
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
        paddingBottom: '16px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(0, 242, 254, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={20} color="#00f2fe" />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
              Browsing History
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px' }}>
            Movies and titles you've recently explored
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={onClearHistory}
            className="btn btn-secondary"
            style={{
              color: 'var(--accent-red)',
              borderColor: 'rgba(255, 51, 102, 0.3)',
              background: 'rgba(255, 51, 102, 0.08)',
              padding: '8px 16px',
              fontSize: '0.85rem'
            }}
          >
            <Trash2 size={15} />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Grid or Empty */}
      {history.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '24px'
        }}>
          {history.map((movie) => {
            const isFav = favorites.some(f => String(f.id) === String(movie.id));
            return (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelectMovie={onSelectMovie}
                onPlayTrailer={onPlayTrailer}
                isFavorite={isFav}
                onToggleFavorite={onToggleFavorite}
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
          border: '1px dashed rgba(255, 255, 255, 0.12)',
          maxWidth: '560px',
          margin: '40px auto'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'rgba(0, 242, 254, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Clock size={32} color="#00f2fe" />
          </div>
          <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#fff', marginBottom: '8px' }}>
            No history yet
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px', lineHeight: 1.6 }}>
            As you click and explore different movies, they will automatically be recorded here so you can trace back your cinema discoveries!
          </p>
          <button
            onClick={onExploreClick}
            className="btn btn-primary"
            style={{ padding: '12px 28px' }}
          >
            <Film size={18} />
            <span>Start Exploring</span>
          </button>
        </div>
      )}
    </div>
  );
}
