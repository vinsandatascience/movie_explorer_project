import React, { useState } from 'react';
import { Star, Play, Heart, Quote, Info, Tv } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MovieCard({ 
  movie, 
  onSelectMovie, 
  onPlayTrailer, 
  isFavorite, 
  onToggleFavorite 
}) {
  const [isHovered, setIsHovered] = useState(false);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (!isFavorite) {
      // Trigger subtle celebratory confetti burst
      confetti({
        particleCount: 25,
        spread: 40,
        origin: { 
          x: e.clientX / window.innerWidth, 
          y: e.clientY / window.innerHeight 
        },
        colors: ['#ff3366', '#f5c518', '#9d4edd']
      });
    }
    onToggleFavorite(movie);
  };

  const quote = movie.quotes && movie.quotes.length > 0 ? movie.quotes[0] : null;

  return (
    <div
      onClick={() => onSelectMovie(movie)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: 'relative',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'var(--bg-surface-elevated)',
        cursor: 'pointer',
        transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        transform: isHovered ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
        boxShadow: isHovered 
          ? '0 20px 35px rgba(0, 0, 0, 0.7), 0 0 25px rgba(245, 197, 24, 0.15)' 
          : '0 8px 20px rgba(0, 0, 0, 0.4)',
        border: isHovered 
          ? '1px solid rgba(245, 197, 24, 0.4)' 
          : '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        aspectRatio: '2/3'
      }}
    >
      {/* Poster Image */}
      <img
        src={movie.poster}
        alt={movie.title}
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transition: 'transform 0.5s ease',
          transform: isHovered ? 'scale(1.08)' : 'scale(1)'
        }}
        onError={(e) => {
          e.target.src = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";
        }}
      />

      {/* Persistent Top Badges */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        right: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 5
      }}>
        {/* Rating Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(9, 10, 15, 0.85)',
          backdropFilter: 'blur(10px)',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          border: '1px solid rgba(245, 197, 24, 0.3)',
          color: 'var(--accent-gold)',
          fontWeight: '700',
          fontSize: '0.82rem',
          boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
        }}>
          <Star size={13} fill="#f5c518" color="#f5c518" />
          <span>{movie.rating}</span>
        </div>

        {/* Favorite Toggle Button */}
        <button
          onClick={handleFavoriteClick}
          title={isFavorite ? "Remove favorite" : "Add to favorites"}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: isFavorite ? 'rgba(255, 51, 102, 0.9)' : 'rgba(9, 10, 15, 0.8)',
            backdropFilter: 'blur(10px)',
            border: isFavorite ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, background 0.2s ease',
            transform: isHovered ? 'scale(1.1)' : 'scale(1)',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)'
          }}
        >
          <Heart 
            size={18} 
            fill={isFavorite ? '#fff' : 'none'} 
            color={isFavorite ? '#fff' : '#fff'} 
          />
        </button>
      </div>

      {/* Release Year Tag (Bottom Left Overlay) */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '84px',
        zIndex: 5
      }}>
        <span style={{
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: '600',
          color: '#e5e7eb',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {movie.release_year}
        </span>
      </div>

      {/* Bottom Gradient & Info Overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'linear-gradient(180deg, transparent 0%, rgba(9, 10, 15, 0.7) 30%, rgba(9, 10, 15, 0.98) 100%)',
        padding: '24px 16px 16px',
        zIndex: 4,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        transition: 'all 0.3s ease'
      }}>
        {/* Title */}
        <h3 style={{
          fontSize: '1.1rem',
          fontWeight: '700',
          color: '#ffffff',
          lineHeight: 1.2,
          textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {movie.title}
        </h3>

        {/* Genre Tags */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {movie.genres && movie.genres.slice(0, 2).map((g, idx) => (
            <span key={idx} style={{
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              background: 'rgba(255, 255, 255, 0.08)',
              padding: '2px 8px',
              borderRadius: '4px'
            }}>
              {g}
            </span>
          ))}
        </div>

        {/* Hover Extended Reveal (Quotes & OTT icons) */}
        {isHovered && (
          <div style={{
            marginTop: '8px',
            paddingTop: '8px',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Powerful Quote Line */}
            {quote && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '0.76rem',
                fontStyle: 'italic',
                color: '#e2d4f0'
              }}>
                <Quote size={13} color="var(--accent-purple)" style={{ flexShrink: 0 }} />
                <span style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  "{quote.quote}"
                </span>
              </div>
            )}

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              {movie.trailer_url && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlayTrailer(movie);
                  }}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: '6px 12px',
                    fontSize: '0.78rem',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  <Play size={13} fill="#000" />
                  <span>Trailer</span>
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectMovie(movie);
                }}
                className="btn btn-secondary"
                style={{
                  padding: '6px 10px',
                  fontSize: '0.78rem',
                  borderRadius: 'var(--radius-sm)'
                }}
              >
                <Info size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
