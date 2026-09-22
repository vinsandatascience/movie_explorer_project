import React from 'react';
import { X, ExternalLink, Play } from 'lucide-react';

export default function TrailerModal({ movie, onClose }) {
  if (!movie) return null;

  const hasSpecificId = movie.trailer_url && movie.trailer_url.length <= 15 && !movie.trailer_url.includes(' ');
  const searchQuery = encodeURIComponent(`${movie.title} ${movie.release_year || ''} official trailer`);
  
  const iframeSrc = hasSpecificId
    ? `https://www.youtube-nocookie.com/embed/${movie.trailer_url}?autoplay=1&rel=0`
    : `https://www.youtube-nocookie.com/embed?listType=search&list=${searchQuery}&autoplay=1`;

  const youtubeDirectLink = `https://www.youtube.com/results?search_query=${searchQuery}`;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 6000,
        background: 'rgba(0, 0, 0, 0.94)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '1000px',
          aspectRatio: '16/9',
          background: '#000',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 0 60px rgba(245, 197, 24, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.15)'
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            zIndex: 10,
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.75)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          title="Close Trailer"
        >
          <X size={20} />
        </button>

        <iframe
          src={iframeSrc}
          title={`${movie.title} Official Trailer`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{
            width: '100%',
            height: '100%',
            border: 'none'
          }}
        />
      </div>

      <div style={{
        marginTop: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <span style={{ color: '#fff', fontWeight: '700', fontSize: '1rem' }}>
          🎬 {movie.title} ({movie.release_year || 'Trailer'})
        </span>
        <a
          href={youtubeDirectLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--accent-gold)',
            fontSize: '0.88rem',
            fontWeight: '600',
            textDecoration: 'none',
            background: 'rgba(255, 255, 255, 0.08)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          <span>Watch on YouTube</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
