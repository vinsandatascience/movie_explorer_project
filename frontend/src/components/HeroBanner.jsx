import React from 'react';
import { Play, Info, Star, Calendar, Clock, Tv, Quote, Heart } from 'lucide-react';

export default function HeroBanner({ movie, onSelectMovie, onPlayTrailer, isFavorite, onToggleFavorite }) {
  if (!movie) return null;

  const quote = movie.quotes && movie.quotes.length > 0 ? movie.quotes[0] : null;

  return (
    <div style={{
      position: 'relative',
      borderRadius: 'var(--radius-xl)',
      overflow: 'hidden',
      minHeight: '440px',
      display: 'flex',
      alignItems: 'center',
      margin: '20px 0 32px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: 'var(--shadow-lg)'
    }}>
      {/* Cinematic Backdrop Image */}
      <img
        src={movie.backdrop || movie.poster}
        alt={movie.title}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center 20%',
          zIndex: 1,
          filter: 'brightness(0.6) contrast(1.15)',
          transform: 'scale(1.02)'
        }}
      />

      {/* Multi-layered Cinema Gradients */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, rgba(7, 8, 12, 0.4) 0%, rgba(7, 8, 12, 0.8) 50%, rgba(7, 8, 12, 0.98) 100%), linear-gradient(90deg, rgba(7, 8, 12, 0.95) 0%, rgba(7, 8, 12, 0.75) 50%, rgba(7, 8, 12, 0.3) 100%)',
        zIndex: 2
      }} />

      {/* Hero Content Container */}
      <div style={{
        position: 'relative',
        zIndex: 3,
        padding: '36px 36px 36px 36px',
        maxWidth: '820px',
        width: '100%'
      }}>
        {/* Top Badges (Genre & Spotlight) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
          <span style={{
            background: 'linear-gradient(135deg, #f5c518 0%, #ff9800 100%)',
            color: '#000',
            fontWeight: '800',
            fontSize: '0.72rem',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '3px 9px',
            borderRadius: '6px'
          }}>
            Featured Spotlight
          </span>

          {movie.genres && movie.genres.slice(0, 3).map((g, i) => (
            <span key={i} style={{
              background: 'rgba(255, 255, 255, 0.12)',
              backdropFilter: 'blur(8px)',
              color: '#fff',
              fontSize: '0.72rem',
              fontWeight: '600',
              padding: '3px 9px',
              borderRadius: '6px'
            }}>
              {g}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(2rem, 4vw, 3.4rem)',
          fontWeight: 900,
          color: '#ffffff',
          lineHeight: 1.15,
          marginBottom: '8px',
          textShadow: '0 4px 24px rgba(0,0,0,0.9)'
        }}>
          {movie.title}
        </h1>

        {/* Tagline / Subtitle */}
        {movie.tagline && (
          <p style={{
            fontSize: '1rem',
            fontStyle: 'italic',
            color: 'var(--accent-gold)',
            marginBottom: '14px',
            fontWeight: '500'
          }}>
            "{movie.tagline}"
          </p>
        )}

        {/* Metadata Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
          fontSize: '0.86rem',
          color: 'var(--text-secondary)',
          marginBottom: '14px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', fontWeight: '700' }}>
            <Star size={16} fill="#f5c518" color="#f5c518" />
            <span>{movie.rating} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>/ 10</span></span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={15} />
            <span>{movie.release_year}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={15} />
            <span>{movie.runtime}</span>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Dir:</span> <strong style={{ color: '#fff' }}>{movie.director}</strong>
          </div>
        </div>

        {/* Storyline Overview Snippet */}
        <p style={{
          fontSize: '0.92rem',
          color: '#d1d5db',
          lineHeight: 1.55,
          maxWidth: '680px',
          marginBottom: '16px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {movie.overview}
        </p>

        {/* Iconic Quote Snippet Box */}
        {quote && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            padding: '10px 16px',
            background: 'rgba(157, 78, 221, 0.12)',
            borderLeft: '4px solid var(--accent-purple)',
            borderRadius: '0 var(--radius-md) var(--radius-md) 0',
            marginBottom: '18px',
            backdropFilter: 'blur(10px)',
            maxWidth: '680px'
          }}>
            <Quote size={18} color="var(--accent-purple)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '0.88rem', fontStyle: 'italic', color: '#f3e8ff', fontWeight: '500' }}>
                "{quote.quote}"
              </div>
              <div style={{ fontSize: '0.75rem', color: '#c084fc', fontWeight: '700', marginTop: '2px' }}>
                — {quote.character}
              </div>
            </div>
          </div>
        )}

        {/* OTT Streaming Availability Row */}
        {movie.ott_platforms && movie.ott_platforms.length > 0 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              <Tv size={14} />
              <span>STREAM ON:</span>
            </div>
            {movie.ott_platforms.map((ott, i) => (
              <a
                key={i}
                href={ott.link}
                target="_blank"
                rel="noopener noreferrer"
                className="ott-badge"
                style={{
                  background: ott.badge_color ? `${ott.badge_color}33` : 'rgba(255,255,255,0.1)',
                  borderColor: ott.badge_color || 'rgba(255,255,255,0.2)',
                  fontSize: '0.75rem',
                  padding: '4px 10px'
                }}
              >
                <span>{ott.name}</span>
                <span style={{ fontSize: '0.66rem', opacity: 0.8 }}>({ott.type})</span>
              </a>
            ))}
          </div>
        )}

        {/* Action CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onPlayTrailer(movie)}
            className="btn btn-primary"
            style={{ padding: '10px 22px', fontSize: '0.92rem' }}
          >
            <Play size={16} fill="#000" />
            <span>Watch Trailer</span>
          </button>

          <button
            onClick={() => onSelectMovie(movie)}
            className="btn btn-secondary"
            style={{ padding: '10px 20px', fontSize: '0.92rem' }}
          >
            <Info size={16} />
            <span>Movie Details</span>
          </button>

          <button
            onClick={() => onToggleFavorite(movie)}
            className="btn btn-secondary btn-icon"
            title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            style={{
              width: '38px',
              height: '38px',
              borderColor: isFavorite ? 'var(--accent-red)' : 'rgba(255,255,255,0.15)',
              background: isFavorite ? 'rgba(255, 51, 102, 0.18)' : 'rgba(255,255,255,0.08)'
            }}
          >
            <Heart 
              size={18} 
              fill={isFavorite ? 'var(--accent-red)' : 'none'} 
              color={isFavorite ? 'var(--accent-red)' : '#fff'} 
            />
          </button>
        </div>
      </div>
    </div>
  );
}
