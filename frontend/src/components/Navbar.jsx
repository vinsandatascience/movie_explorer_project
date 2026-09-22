import React, { useState, useEffect, useRef } from 'react';
import { 
  Film, Search, Sparkles, Heart, Clock, Quote, 
  LogOut, LogIn, Menu, X, Compass, Star, Play, 
  ArrowRight, Flame, Clapperboard, ExternalLink
} from 'lucide-react';
import { filterMoviesLocally, searchMovies } from '../services/api';
import { MOVIES } from '../data/moviesData';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  searchQuery, 
  setSearchQuery, 
  favoritesCount, 
  user, 
  onOpenAuth, 
  onLogout,
  onOpenAI,
  onSelectMovie,
  onPlayTrailer
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  
  // In-Search-Box Live Dropdown state
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [liveResults, setLiveResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchContainerRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const navItems = [
    { id: 'discover', label: 'Discover', icon: <Compass size={17} /> },
    { id: 'genres', label: 'Genres', icon: <Film size={17} /> },
    { id: 'quotes', label: 'Quotes', icon: <Quote size={17} /> },
    { 
      id: 'favorites', 
      label: 'Favorites', 
      icon: <Heart size={17} fill={activeTab === 'favorites' ? '#ff3366' : 'none'} color={activeTab === 'favorites' ? '#ff3366' : 'currentColor'} />,
      badge: favoritesCount > 0 ? favoritesCount : null 
    },
    { id: 'history', label: 'History', icon: <Clock size={17} /> },
  ];

  const popularSearches = ["Vikram", "Leo", "Level Cross", "Manjummel Boys", "Oppenheimer", "Interstellar", "RRR", "Inception"];

  // Update live search results instantly from local cache & global live database
  useEffect(() => {
    let isCurrent = true;
    if (searchQuery.trim()) {
      const local = filterMoviesLocally(searchQuery, 'All', 'rating_desc');
      if (local && local.movies && local.movies.length > 0) {
        setLiveResults(local.movies);
      }
      setSelectedIndex(-1);

      const timer = setTimeout(async () => {
        try {
          const fullRes = await searchMovies(searchQuery, 'All', 'rating_desc');
          if (isCurrent && fullRes && fullRes.movies) {
            setLiveResults(fullRes.movies);
          }
        } catch (err) {
          // keep local
        }
      }, 120);

      return () => {
        isCurrent = false;
        clearTimeout(timer);
      };
    } else {
      setLiveResults([]);
      setSelectedIndex(-1);
    }
  }, [searchQuery]);

  // Click outside listener to dismiss search dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target) &&
        (!mobileSearchRef.current || !mobileSearchRef.current.contains(event.target))
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation for dropdown results
  const handleKeyDown = (e) => {
    if (!dropdownOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setDropdownOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < liveResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : liveResults.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < liveResults.length) {
        e.preventDefault();
        handleMovieClick(liveResults[selectedIndex]);
      } else {
        // Submit full search to discover grid
        setDropdownOpen(false);
        if (activeTab !== 'discover') setActiveTab('discover');
      }
    } else if (e.key === 'Escape') {
      setDropdownOpen(false);
    }
  };

  const handleMovieClick = (movie) => {
    setDropdownOpen(false);
    if (onSelectMovie) {
      onSelectMovie(movie);
    }
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      background: 'rgba(9, 10, 15, 0.92)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      width: '100%'
    }}>
      <div style={{
        maxWidth: '1440px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '70px',
        gap: '12px'
      }}>
        {/* 1. Brand Logo */}
        <div 
          onClick={() => { setActiveTab('discover'); setSearchQuery(''); setDropdownOpen(false); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            userSelect: 'none',
            flexShrink: 0
          }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #f5c518 0%, #ff8c00 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(245, 197, 24, 0.4)',
            transform: 'rotate(-4deg)'
          }}>
            <Film size={22} color="#0a0b0e" strokeWidth={2.5} />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: '1.25rem',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(90deg, #ffffff 40%, #f5c518 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.1
            }}>
              Movie<span style={{ color: '#f5c518' }}>Explorer</span>
            </div>
            <div style={{
              fontSize: '0.62rem',
              fontWeight: '700',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)'
            }}>
              Visual Cinema AI
            </div>
          </div>
        </div>

        {/* 2. Responsive Live Search Box */}
        <div 
          ref={searchContainerRef}
          style={{
            flex: '1 1 200px',
            maxWidth: '340px',
            minWidth: '140px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }} 
          className="desktop-search"
        >
          <div style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search 
              size={16} 
              color={dropdownOpen ? 'var(--accent-gold)' : 'var(--text-muted)'} 
              style={{ position: 'absolute', left: '14px', pointerEvents: 'none', transition: 'color 0.2s' }} 
            />
            <input
              type="text"
              placeholder="Search movies, cast, genres..."
              value={searchQuery}
              onFocus={() => setDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDropdownOpen(true);
                if (activeTab !== 'discover') setActiveTab('discover');
              }}
              onKeyDown={handleKeyDown}
              style={{
                width: '100%',
                padding: '9px 36px 9px 40px',
                borderRadius: 'var(--radius-full)',
                background: dropdownOpen ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.06)',
                border: dropdownOpen ? '1px solid var(--accent-gold)' : '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: dropdownOpen ? '0 0 16px rgba(245, 197, 24, 0.2)' : 'none',
                color: '#fff',
                fontSize: '0.88rem',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setLiveResults([]);
                }}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer'
                }}
                title="Clear search"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Live In-Box Floating Results Dropdown */}
          {dropdownOpen && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              minWidth: '380px',
              maxWidth: '480px',
              maxHeight: '460px',
              overflowY: 'auto',
              background: 'rgba(15, 18, 28, 0.97)',
              backdropFilter: 'blur(28px)',
              WebkitBackdropFilter: 'blur(28px)',
              border: '1px solid rgba(245, 197, 24, 0.3)',
              borderRadius: '16px',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.9), 0 0 25px rgba(245, 197, 24, 0.12)',
              zIndex: 3000,
              animation: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              padding: '10px'
            }}>
              {/* Header Info */}
              {searchQuery.trim() ? (
                <div style={{
                  padding: '6px 10px 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                  marginBottom: '6px'
                }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Search size={13} />
                    {liveResults.length} {liveResults.length === 1 ? 'Movie' : 'Movies'} Found
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    ↑↓ Navigate • ↵ Select
                  </span>
                </div>
              ) : (
                <div style={{ padding: '6px 10px 10px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    color: 'var(--accent-gold)',
                    marginBottom: '8px'
                  }}>
                    <Flame size={14} />
                    <span>TRENDING & POPULAR:</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {popularSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSearchQuery(term);
                          if (activeTab !== 'discover') setActiveTab('discover');
                        }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.07)',
                          border: '1px solid rgba(255, 255, 255, 0.12)',
                          borderRadius: 'var(--radius-full)',
                          padding: '4px 10px',
                          color: '#e2e8f0',
                          fontSize: '0.76rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(245, 197, 24, 0.2)';
                          e.currentTarget.style.borderColor = 'var(--accent-gold)';
                          e.currentTarget.style.color = 'var(--accent-gold)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                          e.currentTarget.style.color = '#e2e8f0';
                        }}
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Movies List */}
              {liveResults.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {liveResults.slice(0, 6).map((movie, idx) => {
                    const isSelected = selectedIndex === idx;

                    return (
                      <div
                        key={movie.id || idx}
                        onClick={() => handleMovieClick(movie)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '8px 10px',
                          borderRadius: '10px',
                          background: isSelected ? 'rgba(245, 197, 24, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                          border: isSelected ? '1px solid var(--accent-gold)' : '1px solid rgba(255, 255, 255, 0.06)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={() => setSelectedIndex(idx)}
                      >
                        {/* Poster Thumbnail */}
                        <img 
                          src={movie.poster} 
                          alt={movie.title}
                          style={{
                            width: '40px',
                            height: '56px',
                            objectFit: 'cover',
                            borderRadius: '6px',
                            flexShrink: 0,
                            boxShadow: '0 4px 10px rgba(0, 0, 0, 0.5)'
                          }}
                        />

                        {/* Details */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                            <span style={{
                              fontWeight: '700',
                              fontSize: '0.9rem',
                              color: '#ffffff',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {movie.title}
                            </span>
                            <span style={{
                              fontSize: '0.74rem',
                              color: 'var(--text-muted)',
                              fontWeight: '600'
                            }}>
                              ({movie.release_year})
                            </span>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              background: 'rgba(245, 197, 24, 0.15)',
                              color: 'var(--accent-gold)',
                              fontSize: '0.7rem',
                              fontWeight: '800',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              marginLeft: 'auto'
                            }}>
                              <Star size={10} fill="currentColor" />
                              {movie.rating}
                            </span>
                          </div>

                          {/* Cast */}
                          <div style={{
                            fontSize: '0.72rem',
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {movie.cast && movie.cast.length > 0 ? movie.cast.slice(0, 2).join(', ') : (movie.director || 'Popular Cinema')}
                          </div>
                        </div>

                        <ArrowRight size={14} color={isSelected ? 'var(--accent-gold)' : 'var(--text-muted)'} />
                      </div>
                    );
                  })}

                  {/* View all button */}
                  <div style={{
                    paddingTop: '6px',
                    borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        if (activeTab !== 'discover') setActiveTab('discover');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--accent-gold)',
                        fontWeight: '700',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 6px'
                      }}
                    >
                      <span>View all results</span>
                      <ArrowRight size={13} />
                    </button>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      Click movie for full details
                    </span>
                  </div>
                </div>
              ) : searchQuery.trim() ? (
                <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.88rem' }}>
                    Searching global database for "{searchQuery}"...
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* 3. Desktop Navigation Links */}
        <nav style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          flexShrink: 0
        }} className="desktop-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (item.id !== 'discover') {
                  setSearchQuery('');
                  setDropdownOpen(false);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                background: activeTab === item.id ? 'rgba(245, 197, 24, 0.15)' : 'transparent',
                color: activeTab === item.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontWeight: activeTab === item.id ? '700' : '500',
                fontSize: '0.84rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              className="nav-btn-item"
            >
              {item.icon}
              <span className="nav-btn-label">{item.label}</span>
              {item.badge !== null && (
                <span style={{
                  background: 'var(--accent-red)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontWeight: '800',
                  padding: '1px 6px',
                  borderRadius: '10px',
                  marginLeft: '2px'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          {/* CineAI Agent Button */}
          <button
            onClick={onOpenAI}
            className="btn-accent"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: 'var(--radius-full)',
              fontWeight: '700',
              fontSize: '0.84rem',
              cursor: 'pointer',
              marginLeft: '4px'
            }}
          >
            <Sparkles size={15} />
            <span>CineAI</span>
          </button>
        </nav>

        {/* 4. Auth & Sign In Area (GUARANTEED VISIBLE with zero clipping) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexShrink: 0,
          marginLeft: '4px'
        }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <div 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '4px 10px 4px 4px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(255, 255, 255, 0.15)'
                }}
              >
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`} 
                  alt={user.username}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                />
                <span style={{ fontSize: '0.84rem', fontWeight: '600', color: '#fff' }}>
                  {user.username}
                </span>
              </div>

              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '44px',
                  width: '170px',
                  background: 'rgba(20, 24, 38, 0.98)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '6px',
                  zIndex: 2000,
                  animation: 'fadeIn 0.2s ease-out'
                }}>
                  <div style={{ padding: '6px 10px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Signed in as</div>
                    <div style={{ fontSize: '0.86rem', fontWeight: '700', color: '#fff' }}>{user.username}</div>
                  </div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 10px',
                      background: 'none',
                      border: 'none',
                      color: 'var(--accent-red)',
                      fontSize: '0.84rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      textAlign: 'left',
                      marginTop: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 51, 102, 0.12)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="btn btn-primary"
              style={{
                padding: '7px 16px',
                fontSize: '0.86rem',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 10px rgba(245, 197, 24, 0.35)'
              }}
            >
              <LogIn size={15} />
              <span>Sign In</span>
            </button>
          )}

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              padding: '6px'
            }}
            className="mobile-menu-btn"
            title="Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          padding: '16px 20px 24px',
          background: 'var(--bg-surface)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div ref={mobileSearchRef} style={{ position: 'relative', width: '100%', marginBottom: '4px' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '12px' }} />
            <input
              type="text"
              placeholder="Search all global movies..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'discover') setActiveTab('discover');
              }}
              style={{
                width: '100%',
                padding: '10px 36px 10px 38px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#fff',
                fontSize: '0.88rem',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '10px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: activeTab === item.id ? 'rgba(245, 197, 24, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: activeTab === item.id ? 'var(--accent-gold)' : 'var(--text-secondary)',
                fontWeight: activeTab === item.id ? '700' : '500',
                fontSize: '0.92rem',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== null && (
                <span style={{
                  background: 'var(--accent-red)',
                  color: '#fff',
                  fontSize: '0.72rem',
                  fontWeight: '800',
                  padding: '2px 7px',
                  borderRadius: '10px'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAI();
            }}
            className="btn btn-accent"
            style={{ width: '100%', marginTop: '4px', padding: '10px' }}
          >
            <Sparkles size={16} />
            <span>Open CineAI Agent</span>
          </button>
        </div>
      )}

      {/* Responsive Breakpoint CSS */}
      <style>{`
        @media (min-width: 900px) {
          .desktop-search { display: flex !important; }
          .desktop-nav { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 1120px) and (min-width: 900px) {
          .nav-btn-item { padding: 6px 8px !important; }
          .nav-btn-label { font-size: 0.8rem !important; }
        }
        @media (max-width: 899px) {
          .desktop-search { display: none !important; }
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </header>
  );
}
