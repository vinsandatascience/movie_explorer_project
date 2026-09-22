import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, X, Bot, User, Film, Star, MessageSquare, CornerDownLeft, RotateCcw } from 'lucide-react';
import { sendAIChatMessage } from '../services/api';

export default function AIAgentChat({ isOpen, onClose, initialQuery, onSelectMovie }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "👋 Welcome to **CineAI**! I'm your intelligent cinema assistant.\n\nAsk me anything about movies: recommendations, where to stream, deep plot explanations, iconic quotes, or director trivia!",
      movies: []
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const starterPrompts = [
    "🚀 Recommend Mind-Bending Sci-Fi",
    "💬 Iconic quotes from The Dark Knight",
    "📺 Where to stream Interstellar?",
    "🎭 Best movies directed by Christopher Nolan",
    "⭐ What makes Oppenheimer special?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialQuery && isOpen) {
      handleSendMessage(initialQuery);
    }
  }, [initialQuery, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({ sender: m.sender, text: m.text }));
      const data = await sendAIChatMessage(query, historyPayload);

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: data.reply,
        movies: data.movies || []
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: "I encountered an issue connecting to the movie engine. Please make sure the Flask backend is running on port 5000.",
          movies: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: "👋 Chat reset! What cinematic topic or movie would you like to explore next?",
        movies: []
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '24px',
      width: 'min(440px, calc(100vw - 32px))',
      height: 'min(620px, calc(100vh - 100px))',
      zIndex: 6000,
      background: 'rgba(15, 17, 24, 0.95)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(157, 78, 221, 0.35)',
      borderRadius: 'var(--radius-xl)',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8), 0 0 35px rgba(157, 78, 221, 0.25)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      {/* Chat Header */}
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, rgba(157, 78, 221, 0.2) 0%, rgba(20, 24, 38, 0.8) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #9d4edd 0%, #7b2cbf 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(157, 78, 221, 0.5)'
          }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: '800', fontSize: '1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>CineAI Agent</span>
              <span style={{
                fontSize: '0.65rem',
                background: 'rgba(0, 230, 118, 0.15)',
                color: '#00e676',
                padding: '1px 6px',
                borderRadius: '4px',
                fontWeight: '700'
              }}>
                ONLINE
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              Intelligent Cinema Companion
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={handleResetChat}
            title="Reset Chat"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages Stream */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: '6px'
            }}
          >
            <div style={{
              display: 'flex',
              gap: '8px',
              maxWidth: '88%',
              alignItems: 'flex-start',
              flexDirection: m.sender === 'user' ? 'row-reverse' : 'row'
            }}>
              {/* Avatar Icon */}
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: m.sender === 'user' ? '#f5c518' : 'rgba(157, 78, 221, 0.25)',
                border: m.sender === 'user' ? 'none' : '1px solid rgba(157, 78, 221, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: m.sender === 'user' ? '#000' : '#c084fc'
              }}>
                {m.sender === 'user' ? <User size={15} /> : <Bot size={15} />}
              </div>

              {/* Message Bubble */}
              <div style={{
                padding: '12px 16px',
                borderRadius: m.sender === 'user' ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
                background: m.sender === 'user' 
                  ? 'linear-gradient(135deg, #f5c518 0%, #e6a800 100%)' 
                  : 'rgba(255, 255, 255, 0.07)',
                color: m.sender === 'user' ? '#0a0b0e' : '#f3f4f6',
                fontSize: '0.9rem',
                lineHeight: 1.55,
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                whiteSpace: 'pre-line'
              }}>
                {m.text}
              </div>
            </div>

            {/* If AI returned clickable movie recommendation cards */}
            {m.movies && m.movies.length > 0 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                padding: '4px 0 6px 36px',
                maxWidth: '100%'
              }}>
                {m.movies.map((mov) => (
                  <div
                    key={mov.id}
                    onClick={() => onSelectMovie(mov)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 10px',
                      background: 'rgba(20, 24, 38, 0.9)',
                      border: '1px solid rgba(245, 197, 24, 0.3)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      flexShrink: 0,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-gold)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'rgba(245, 197, 24, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <img
                      src={mov.poster}
                      alt={mov.title}
                      style={{ width: '28px', height: '38px', borderRadius: '4px', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fff' }}>
                        {mov.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Star size={11} fill="#f5c518" />
                        <span>{mov.rating} ({mov.release_year})</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '36px' }}>
            <div style={{
              padding: '10px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              gap: '6px',
              alignItems: 'center'
            }}>
              <span style={{ fontSize: '0.82rem', color: 'var(--accent-purple)', fontWeight: '600' }}>CineAI is thinking...</span>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-purple)', animation: 'pulseGlow 1s infinite' }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Starter Chips */}
      {messages.length <= 2 && (
        <div style={{
          padding: '0 16px 10px',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          scrollbarWidth: 'none'
        }}>
          {starterPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              style={{
                whiteSpace: 'nowrap',
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
                background: 'rgba(157, 78, 221, 0.12)',
                border: '1px solid rgba(157, 78, 221, 0.25)',
                color: '#e2d4f0',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                flexShrink: 0
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(157, 78, 221, 0.25)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(157, 78, 221, 0.12)'}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input Box */}
      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(12, 14, 20, 0.8)',
        display: 'flex',
        gap: '8px',
        alignItems: 'center'
      }}>
        <input
          type="text"
          placeholder="Ask CineAI anything about movies..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          style={{
            flex: 1,
            padding: '10px 14px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: 'var(--radius-full)',
            color: '#fff',
            fontSize: '0.88rem',
            outline: 'none'
          }}
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={!input.trim() || loading}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: input.trim() && !loading ? 'var(--accent-purple)' : 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: input.trim() && !loading ? 'pointer' : 'default',
            transition: 'all 0.2s ease',
            boxShadow: input.trim() && !loading ? '0 0 15px rgba(157, 78, 221, 0.5)' : 'none'
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
