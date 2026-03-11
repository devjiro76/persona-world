import { useState, useRef, useEffect } from 'react'
import type { Persona } from '../types'
import type { ChatMessage } from '../api/llm'
import { COLORS } from '../constants'
import { t } from '../data/i18n'

interface ChatOverlayProps {
  persona: Persona
  messages: ChatMessage[]
  onSend: (message: string) => void
  loading: boolean
  llmEnabled: boolean
  onClose: () => void
}

export function ChatOverlay({ persona, messages, onSend, loading, llmEnabled, onClose }: ChatOverlayProps) {
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)
  const name = persona.config.identity.name || persona.display_name

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const msg = input.trim()
    if (!msg || loading) return
    onSend(msg)
    setInput('')
  }

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'min(400px, calc(100% - 32px))',
        maxHeight: 360,
        background: 'rgba(18, 18, 26, 0.95)',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 14,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 60,
        overflow: 'hidden',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderBottom: `1px solid ${COLORS.border}`,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>
          {name}
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: COLORS.dim,
            cursor: 'pointer',
            fontSize: 16,
            padding: '0 4px',
            lineHeight: 1,
          }}
        >
          {'\u2715'}
        </button>
      </div>

      {!llmEnabled ? (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 80,
          color: COLORS.muted,
          fontSize: 11,
          textAlign: 'center',
          padding: 16,
        }}>
          {t('enable LLM to chat')}
        </div>
      ) : (
        <>
          {/* Messages */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '8px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              minHeight: 60,
              maxHeight: 220,
            }}
          >
            {messages.length === 0 && (
              <div style={{ color: COLORS.muted, fontSize: 10, textAlign: 'center', padding: 12 }}>
                {t('say something to')} {name}
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  paddingLeft: msg.role === 'user' ? 32 : 0,
                  paddingRight: msg.role === 'character' ? 32 : 0,
                }}
              >
                <div
                  style={{
                    padding: '6px 10px',
                    borderRadius: 10,
                    fontSize: 12,
                    lineHeight: 1.5,
                    maxWidth: '85%',
                    background: msg.role === 'user' ? COLORS.accent : 'rgba(255,255,255,0.06)',
                    color: msg.role === 'user' ? '#fff' : COLORS.text,
                    border: msg.role === 'character' ? `1px solid ${COLORS.border}` : 'none',
                  }}
                >
                  {msg.role === 'character' && (
                    <div style={{ fontSize: 9, color: COLORS.muted, marginBottom: 2, fontWeight: 600 }}>
                      {name}
                    </div>
                  )}
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{
                  padding: '6px 10px',
                  borderRadius: 10,
                  fontSize: 12,
                  background: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${COLORS.border}`,
                  color: COLORS.muted,
                }}>
                  <span style={{ fontSize: 9, color: COLORS.muted, display: 'block', marginBottom: 2, fontWeight: 600 }}>
                    {name}
                  </span>
                  ...
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            style={{
              display: 'flex',
              gap: 6,
              padding: '10px 14px',
              borderTop: `1px solid ${COLORS.border}`,
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`${t('message')}...`}
              disabled={loading}
              autoFocus
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: 8,
                border: `1px solid ${COLORS.border}`,
                background: 'rgba(255,255,255,0.04)',
                color: COLORS.text,
                fontSize: 12,
                fontFamily: 'inherit',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: 'none',
                background: input.trim() && !loading ? COLORS.accent : COLORS.border,
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                fontFamily: 'inherit',
                opacity: input.trim() && !loading ? 1 : 0.5,
              }}
            >
              {t('send')}
            </button>
          </form>
        </>
      )}
    </div>
  )
}
