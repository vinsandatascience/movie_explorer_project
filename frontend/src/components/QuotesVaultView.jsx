import React, { useState, useEffect } from 'react';
import { Quote, Copy, Check, Search, Sparkles, Film, Play } from 'lucide-react';
import { fetchAllQuotes } from '../services/api';

export default function QuotesVaultView({ onSelectMovieId }) {
  const [quotes, setQuotes] = useState([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadQuotes() {
      setLoading(true);
      const data = await fetchAllQuotes();
      if (data && data.quotes) {
        setQuotes(data.quotes);
      }
      setLoading(false);
    }
    loadQuotes();
  }, []);

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const filteredQuotes = quotes.filter(q => 
    q.quote.toLowerCase().includes(filterQuery.toLowerCase()) ||
    q.character.toLowerCase().includes(filterQuery.toLowerCase()) ||
    q.movie_title.toLowerCase().includes(filterQuery.toLowerCase())
  );

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
              background: 'rgba(157, 78, 221, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Quote size={20} color="var(--accent-purple)" />
            </div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
              Iconic Cinema Quotes Vault
            </h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: '4px' }}>
            Legendary, memorable, and powerful words from the world of cinema
          </p>
        </div>

        {/* Filter Input */}
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '14px', top: '11px' }} />
          <input
            type="text"
            placeholder="Search quotes, characters, movies..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px 9px 38px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#fff',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Quotes Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        {filteredQuotes.map((q, idx) => (
          <div
            key={idx}
            style={{
              background: 'linear-gradient(135deg, rgba(23, 27, 42, 0.7) 0%, rgba(15, 17, 24, 0.9) 100%)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(157, 78, 221, 0.25)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'var(--accent-purple)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(157, 78, 221, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'rgba(157, 78, 221, 0.25)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
            }}
          >
            {/* Ambient subtle quote watermark in background */}
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '16px',
              opacity: 0.08,
              pointerEvents: 'none'
            }}>
              <Quote size={80} color="#fff" />
            </div>

            {/* Quote Body */}
            <div style={{ position: 'relative', zIndex: 2, marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-purple)', marginBottom: '10px' }}>
                <Quote size={18} />
              </div>
              <p style={{
                fontSize: '1.05rem',
                fontStyle: 'italic',
                color: '#f8fafc',
                lineHeight: 1.6,
                fontWeight: '500'
              }}>
                "{q.quote}"
              </p>
            </div>

            {/* Speaker & Movie Info */}
            <div style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '14px'
            }}>
              <div 
                onClick={() => onSelectMovieId(q.movie_id)}
                style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
                title="Click to view movie"
              >
                {q.poster && (
                  <img
                    src={q.poster}
                    alt={q.movie_title}
                    style={{ width: '32px', height: '44px', borderRadius: '4px', objectFit: 'cover' }}
                  />
                )}
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#c084fc' }}>
                    {q.character}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    in <span style={{ color: '#e5e7eb', textDecoration: 'underline' }}>{q.movie_title}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleCopy(`"${q.quote}" — ${q.character} (${q.movie_title})`, idx)}
                title="Copy quote"
                style={{
                  background: copiedIndex === idx ? 'rgba(0, 230, 118, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: copiedIndex === idx ? '#00e676' : 'var(--text-secondary)',
                  borderRadius: 'var(--radius-full)',
                  padding: '6px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  fontSize: '0.78rem',
                  fontWeight: '600'
                }}
              >
                {copiedIndex === idx ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
