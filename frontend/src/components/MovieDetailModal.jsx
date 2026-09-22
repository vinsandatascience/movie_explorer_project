import React, { useState, useEffect } from 'react';
import { 
  X, Star, Calendar, Clock, Tv, ExternalLink, Play, 
  Heart, Quote, Copy, Check, Sparkles, ArrowLeft, MessageSquare, Film, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MovieDetailModal({ 
  movie, 
  onClose, 
  onPlayTrailer, 
  isFavorite, 
  onToggleFavorite, 
  onAskAI 
}) {
  const [copiedQuoteIndex, setCopiedQuoteIndex] = useState(null);

  // Close on Escape key & lock body scroll
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  if (!movie) return null;

  const handleCopyQuote = (quoteText, index) => {
    navigator.clipboard.writeText(quoteText);
    setCopiedQuoteIndex(index);
    setTimeout(() => setCopiedQuoteIndex(null), 2000);
  };

  const handleFavoriteClick = () => {
    if (!isFavorite) {
      confetti({
        particleCount: 35,
        spread: 55,
        origin: { y: 0.6 },
        colors: ['#ff3366', '#f5c518', '#00f2fe']
      });
    }
    onToggleFavorite(movie);
  };

  // Ensure rich dialogues list
  const dialogues = (movie.quotes && movie.quotes.length > 0)
    ? movie.quotes
    : [
        {
          quote: `Experience the thrilling story and cinematic power of ${movie.title}.`,
          character: movie.cast?.[0] || 'Lead Protagonist'
        },
        {
          quote: movie.tagline || `Every hero has a code, every legend has a beginning.`,
          character: 'Iconic Punch Dialogue'
        }
      ];

  return (
    <div 
      className="movie-detail-fullscreen"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 5000,
        background: '#07080c',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* 🎬 Fullscreen Cinematic Atmospheric Backdrop */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none'
      }}>
        <img
          src={movie.backdrop || movie.poster}
          alt={movie.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 20%',
            filter: 'brightness(0.2) saturate(1.3) blur(4px)',
            transform: 'scale(1.05)'
          }}
        />
        {/* Subtle Vignettes */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 35% 45%, rgba(7, 8, 12, 0.72) 0%, rgba(7, 8, 12, 0.95) 75%, #07080c 100%)'
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(7, 8, 12, 0.96) 0%, rgba(7, 8, 12, 0.85) 65%, rgba(7, 8, 12, 0.98) 100%)'
        }} />
      </div>

      {/* 🔝 Sleek Top Navigation Bar */}
      <header style={{
        position: 'relative',
        zIndex: 10,
        height: '52px',
        minHeight: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 clamp(16px, 2.5vw, 36px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(9, 11, 18, 0.8)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}>
        {/* Left: Back button & Breadcrumbs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onClose}
            className="btn-back"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.84rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to Explorer</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="breadcrumb-nav">
            <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Cinema Information</span>
            <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>/</span>
            <span style={{ color: '#fff', fontWeight: '600', fontSize: '0.86rem' }}>{movie.title}</span>
          </div>
        </div>

        {/* Right: Close button */}
        <button
          onClick={onClose}
          title="Close (Esc)"
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 51, 102, 0.85)';
            e.currentTarget.style.transform = 'scale(1.08)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          <X size={18} />
        </button>
      </header>

      {/* 📺 Fullscreen 2-Section Layout:
          - Center/Left: Movie Details + Directly Below: Watch on OTT
          - Right Side: Movie Dialogues & Quotes Vault
      */}
      <div 
        className="cinema-fullscreen-grid"
        style={{
          position: 'relative',
          zIndex: 10,
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.8fr) minmax(260px, 0.8fr)',
          gap: 'clamp(14px, 1.6vw, 22px)',
          padding: 'clamp(14px, 1.8vw, 24px) clamp(18px, 2.5vw, 36px)',
          height: 'calc(100vh - 52px)',
          maxHeight: 'calc(100vh - 52px)',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {/* ==============================================================
            MAIN / CENTER REGION: 
            1) Movie Presentation (Poster + Info + Trailer)
            2) Directly Below: Where to Watch / OTT Streaming Platforms
            ============================================================== */}
        <div 
          className="center-movie-section"
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            gap: '8px',
            overflow: 'hidden'
          }}
        >
          {/* Top Half: Movie Details & Poster */}
          <div 
            className="movie-info-card"
            style={{
              background: 'rgba(17, 21, 32, 0.72)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              padding: 'clamp(18px, 2vw, 26px)',
              display: 'grid',
              gridTemplateColumns: 'clamp(240px, 23vw, 300px) minmax(0, 1fr)',
              gap: 'clamp(18px, 2vw, 28px)',
              flex: 1,
              minHeight: 0,
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)'
            }}
          >
            {/* Left Sub-Column: Movie Poster + Action Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              height: '100%'
            }}>
              <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                boxShadow: '0 12px 28px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 0, 0, 0.4)',
                border: '2px solid rgba(255, 255, 255, 0.15)',
                aspectRatio: '2/3',
                background: '#12141c',
                flex: '1 1 auto',
                maxHeight: 'min(52vh, 580px)',
                minHeight: '220px'
              }}>
                <img
                  src={movie.poster}
                  alt={movie.title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>

              {/* Action Buttons under poster */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 0 }}>
                <button
                  onClick={() => onPlayTrailer(movie)}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    fontSize: '0.88rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 16px rgba(245, 197, 24, 0.35)'
                  }}
                >
                  <Play size={16} fill="#000" />
                  <span>Watch Trailer</span>
                </button>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <button
                    onClick={handleFavoriteClick}
                    className="btn btn-secondary"
                    style={{
                      padding: '7px 8px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      borderColor: isFavorite ? 'var(--accent-red)' : 'rgba(255, 255, 255, 0.15)',
                      background: isFavorite ? 'rgba(255, 51, 102, 0.2)' : 'rgba(255, 255, 255, 0.06)'
                    }}
                  >
                    <Heart 
                      size={14} 
                      fill={isFavorite ? 'var(--accent-red)' : 'none'} 
                      color={isFavorite ? 'var(--accent-red)' : '#fff'} 
                    />
                    <span>{isFavorite ? 'Saved' : 'Favorite'}</span>
                  </button>

                  <button
                    onClick={() => onAskAI(movie)}
                    className="btn btn-accent"
                    style={{
                      padding: '7px 8px',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px'
                    }}
                  >
                    <Sparkles size={14} />
                    <span>Ask AI</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Sub-Column: Title, Storyline, Cast & Director */}
            <div 
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                overflowY: 'auto',
                paddingRight: '6px'
              }}
              className="details-scrollable"
            >
              <div>
                {/* Genres & Quality Badges */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                  {movie.genres && movie.genres.map((g, i) => (
                    <span 
                      key={i} 
                      style={{
                        background: 'rgba(245, 197, 24, 0.15)',
                        color: 'var(--accent-gold)',
                        border: '1px solid rgba(245, 197, 24, 0.3)',
                        padding: '2px 8px',
                        borderRadius: '5px',
                        fontSize: '0.74rem',
                        fontWeight: '700'
                      }}
                    >
                      {g}
                    </span>
                  ))}
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#94a3b8',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: '600'
                  }}>
                    4K ULTRA HD
                  </span>
                </div>

                {/* Title */}
                <h1 style={{
                  fontSize: 'clamp(1.6rem, 2.4vw, 2.3rem)',
                  fontWeight: 800,
                  color: '#fff',
                  lineHeight: 1.15,
                  margin: 0
                }}>
                  {movie.title}
                </h1>

                {/* Tagline */}
                {movie.tagline && (
                  <p style={{
                    fontStyle: 'italic',
                    color: 'var(--accent-gold)',
                    opacity: 0.9,
                    fontSize: '0.88rem',
                    margin: '3px 0 10px'
                  }}>
                    "{movie.tagline}"
                  </p>
                )}

                {/* Stats Ribbon (Rating, Year, Duration) */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '16px',
                  flexWrap: 'wrap',
                  padding: '6px 14px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  fontSize: '0.84rem',
                  marginBottom: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-gold)', fontWeight: '700' }}>
                    <Star size={15} fill="#f5c518" color="#f5c518" />
                    <span>{movie.rating} / 10</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem', fontWeight: '400' }}>
                      ({movie.vote_count ? `${movie.vote_count.toLocaleString()} votes` : 'Top Rated'})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
                    <Calendar size={13} />
                    <span>{movie.release_year || movie.release_date}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-secondary)' }}>
                    <Clock size={13} />
                    <span>{movie.runtime}</span>
                  </div>
                </div>

                {/* Storyline Overview */}
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '4px'
                  }}>
                    Storyline Overview
                  </h4>
                  <p style={{
                    color: '#e2e8f0',
                    fontSize: '0.9rem',
                    lineHeight: 1.55,
                    margin: 0
                  }}>
                    {movie.overview}
                  </p>
                </div>

                {/* Director & Cast */}
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '6px 14px', fontSize: '0.84rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Director:</span>
                  <span style={{ color: '#fff', fontWeight: '600' }}>{movie.director}</span>

                  {movie.cast && movie.cast.length > 0 && (
                    <>
                      <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>Starring:</span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {movie.cast.map((actor, idx) => (
                          <span 
                            key={idx} 
                            style={{
                              background: 'rgba(255, 255, 255, 0.08)',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              color: '#f1f5f9',
                              fontSize: '0.78rem'
                            }}
                          >
                            {actor}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Official Links Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                paddingTop: '8px',
                marginTop: '10px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Official:</span>
                
                {movie.imdb_id && (
                  <a
                    href={`https://www.imdb.com/title/${movie.imdb_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ padding: '3px 10px', fontSize: '0.76rem', borderColor: 'rgba(245, 197, 24, 0.3)' }}
                  >
                    <span style={{ color: 'var(--accent-gold)', fontWeight: '700' }}>IMDb</span>
                    <ExternalLink size={11} />
                  </a>
                )}

                {movie.tmdb_link && (
                  <a
                    href={movie.tmdb_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ padding: '3px 10px', fontSize: '0.76rem' }}
                  >
                    <span>TMDB</span>
                    <ExternalLink size={11} />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* ==============================================================
              BELOW THAT: WHERE TO WATCH / OTT STREAMING PLATFORMS
              ============================================================== */}
          <div 
            className="ott-streaming-section"
            style={{
              background: 'rgba(17, 21, 32, 0.85)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(0, 242, 254, 0.25)',
              padding: '14px clamp(14px, 1.7vw, 22px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              marginTop: 0
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tv size={16} color="var(--accent-cyan)" />
                <h3 style={{
                  fontSize: '0.85rem',
                  color: '#fff',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  margin: 0
                }}>
                  Where to Watch / OTT Streaming Platforms
                </h3>
              </div>
              <span style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', fontWeight: '600' }}>
                Official OTT Direct Streaming
              </span>
            </div>

            {/* OTT Platform Badges Grid */}
            {movie.ott_platforms && movie.ott_platforms.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '10px'
              }}>
                {movie.ott_platforms.map((ott, i) => (
                  <a
                    key={i}
                    href={ott.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ott-badge-full"
                    style={{
                      background: ott.badge_color ? `${ott.badge_color}25` : 'rgba(255, 255, 255, 0.08)',
                      borderColor: ott.badge_color || 'rgba(255, 255, 255, 0.2)',
                      borderWidth: '1px',
                      borderStyle: 'solid',
                      padding: '12px 14px',
                      fontSize: '0.84rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      textDecoration: 'none',
                      borderRadius: 'var(--radius-md)',
                      color: '#fff',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = `0 6px 18px ${ott.badge_color || 'rgba(0, 242, 254, 0.3)'}44`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                      <Tv size={15} style={{ color: ott.badge_color || 'var(--accent-cyan)' }} />
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.84rem', fontWeight: '700', lineHeight: 1.2 }}>
                          {ott.name}
                        </strong>
                        <span style={{ fontSize: '0.72rem', color: '#cbd5e1', opacity: 0.85 }}>
                          {ott.type}
                        </span>
                      </div>
                    </div>
                    <ExternalLink size={13} style={{ opacity: 0.75, flexShrink: 0 }} />
                  </a>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', margin: 0 }}>
                Streaming provider links updating soon.
              </p>
            )}
          </div>
        </div>

        {/* ==============================================================
            SIDE REGION: MOVIE DIALOGUES & QUOTES VAULT ("in side dialoge")
            ============================================================== */}
        <aside 
          className="side-dialogues-panel"
          style={{
            background: 'linear-gradient(180deg, rgba(26, 18, 42, 0.85) 0%, rgba(15, 17, 28, 0.9) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(157, 78, 221, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: 'clamp(14px, 1.8vw, 20px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            overflow: 'hidden',
            boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 25px rgba(157, 78, 221, 0.15)'
          }}
        >
          {/* Dialogues Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '10px',
            borderBottom: '1px solid rgba(157, 78, 221, 0.25)',
            marginBottom: '10px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Quote size={17} color="#c084fc" />
              <div>
                <h3 style={{
                  fontSize: '0.88rem',
                  fontWeight: '800',
                  color: '#f3e8ff',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  margin: 0
                }}>
                  Movie Dialogues
                </h3>
                <span style={{ fontSize: '0.72rem', color: '#c084fc', opacity: 0.9 }}>
                  Punchlines & Famous Quotes
                </span>
              </div>
            </div>

            <span style={{
              fontSize: '0.7rem',
              color: 'var(--text-muted)',
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '3px 8px',
              borderRadius: 'var(--radius-full)'
            }}>
              Click to copy
            </span>
          </div>

          {/* Dialogues List */}
          <div 
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              overflowY: 'auto',
              flex: 1,
              paddingRight: '4px',
              marginRight: '-4px'
            }}
            className="dialogues-scrollable"
          >
            {dialogues.map((d, idx) => (
              <div 
                key={idx}
                style={{
                  padding: '12px 14px',
                  background: 'rgba(9, 10, 16, 0.65)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: '4px solid var(--accent-purple)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRight: '1px solid rgba(255, 255, 255, 0.06)',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  position: 'relative',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{
                  fontSize: '0.92rem',
                  fontStyle: 'italic',
                  color: '#faf5ff',
                  lineHeight: 1.5,
                  paddingRight: '24px'
                }}>
                  "{d.quote}"
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '6px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                  <span style={{
                    fontSize: '0.78rem',
                    color: '#c084fc',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    — {d.character}
                  </span>

                  <button
                    onClick={() => handleCopyQuote(`"${d.quote}" — ${d.character} (${movie.title})`, idx)}
                    title="Copy dialogue"
                    style={{
                      background: copiedQuoteIndex === idx ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                      border: copiedQuoteIndex === idx ? '1px solid #00e676' : '1px solid rgba(255, 255, 255, 0.1)',
                      color: copiedQuoteIndex === idx ? '#00e676' : 'var(--text-secondary)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      padding: '4px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '0.72rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {copiedQuoteIndex === idx ? (
                      <>
                        <Check size={13} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy size={13} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Interactive CineAI Dialogue Helper Footer */}
          <div style={{
            marginTop: '12px',
            paddingTop: '10px',
            borderTop: '1px solid rgba(157, 78, 221, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <button
              onClick={() => onAskAI(movie)}
              className="btn btn-accent"
              style={{
                width: '100%',
                padding: '8px 12px',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: 'linear-gradient(135deg, #7928ca 0%, #ff0080 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)'
              }}
            >
              <Sparkles size={15} />
              <span>Ask CineAI for More Dialogues</span>
            </button>
          </div>
        </aside>
      </div>

      {/* 📱 Scoped CSS for Scrollbars & Responsive Layouts */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.99); }
          to { opacity: 1; transform: scale(1); }
        }

        .details-scrollable::-webkit-scrollbar,
        .dialogues-scrollable::-webkit-scrollbar {
          width: 5px;
        }
        .details-scrollable::-webkit-scrollbar-thumb,
        .dialogues-scrollable::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.16);
          border-radius: 9999px;
        }

        @media (max-width: 1024px) {
          .cinema-fullscreen-grid {
            grid-template-columns: 1fr !important;
            overflow-y: auto !important;
            height: auto !important;
            max-height: none !important;
          }
          .side-dialogues-panel {
            min-height: 320px;
          }
        }

        @media (max-width: 768px) {
          .movie-info-card {
            grid-template-columns: 1fr !important;
          }
          .breadcrumb-nav {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
