import { useState } from 'react'
import { COLORS } from '../constants'

interface Props {
  autoRunning: boolean
  autoSpeed: number
  onToggleAuto: () => void
  onSpeedChange: (speed: number) => void
  totalActions: number
  zoom: number
  onZoomChange: (zoom: number) => void
  mobile?: boolean
}

export function Toolbar({ autoRunning, autoSpeed, onToggleAuto, onSpeedChange, totalActions, zoom, onZoomChange, mobile }: Props) {
  const [showInfo, setShowInfo] = useState(false)

  return (
    <div
      style={{
        padding: mobile ? '6px 12px' : '10px 24px',
        background: COLORS.surface,
        borderBottom: `1px solid ${COLORS.border}`,
        display: 'flex',
        gap: mobile ? 8 : 16,
        alignItems: 'center',
        flexWrap: 'wrap',
        position: 'relative',
      }}
    >
      {/* Logo */}
      <div style={{ fontSize: mobile ? 12 : 14, fontWeight: 700, letterSpacing: 0.5 }}>
        <span style={{ color: COLORS.accent }}>Persona</span> World
      </div>

      {/* Auto-tick controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: mobile ? 4 : 8, borderLeft: `1px solid ${COLORS.border}`, paddingLeft: mobile ? 8 : 16 }}>
        <button
          onClick={onToggleAuto}
          style={{
            padding: mobile ? '3px 8px' : '4px 10px',
            border: `1px solid ${autoRunning ? COLORS.pos : COLORS.border}`,
            borderRadius: 5,
            background: autoRunning ? COLORS.pos : 'transparent',
            color: autoRunning ? '#000' : COLORS.dim,
            fontSize: mobile ? 10 : 11,
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontWeight: autoRunning ? 600 : 400,
          }}
        >
          {autoRunning ? '\u23F8' : '\u25B6'}{mobile ? '' : (autoRunning ? ' Auto' : ' Auto')}
        </button>

        {!mobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <label style={{ fontSize: 9, color: COLORS.muted }}>pace</label>
            <input
              type="range"
              min={1}
              max={10}
              value={autoSpeed}
              onChange={(e) => onSpeedChange(parseInt(e.target.value))}
              style={{ width: 60, accentColor: COLORS.accent }}
            />
            <span style={{ fontSize: 9, color: COLORS.dim, minWidth: 20 }}>{autoSpeed}</span>
          </div>
        )}
      </div>

      {/* Zoom — hide on mobile */}
      {!mobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, borderLeft: `1px solid ${COLORS.border}`, paddingLeft: 16 }}>
          <label style={{ fontSize: 9, color: COLORS.muted }}>zoom</label>
          <input
            type="range"
            min={1}
            max={8}
            value={zoom}
            onChange={(e) => onZoomChange(parseInt(e.target.value))}
            style={{ width: 60, accentColor: COLORS.accent }}
          />
          <span style={{ fontSize: 9, color: COLORS.dim, minWidth: 20 }}>{zoom}x</span>
        </div>
      )}

      {/* Stats + Info */}
      <div style={{ display: 'flex', gap: mobile ? 8 : 12, marginLeft: 'auto', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontSize: mobile ? 12 : 14, fontWeight: 700, color: COLORS.accent }}>{totalActions}</span>
          <span style={{ fontSize: 9, color: COLORS.muted }}>acts</span>
        </div>

        <button
          onClick={() => setShowInfo((v) => !v)}
          style={{
            width: 22,
            height: 22,
            borderRadius: '50%',
            border: `1px solid ${COLORS.border}`,
            background: showInfo ? COLORS.accent : 'transparent',
            color: showInfo ? '#fff' : COLORS.dim,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
          }}
        >
          ?
        </button>
      </div>

      {/* Info popover */}
      {showInfo && (
        <>
          {/* Backdrop on mobile */}
          {mobile && (
            <div
              onClick={() => setShowInfo(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(0,0,0,0.3)' }}
            />
          )}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              right: mobile ? 12 : 24,
              marginTop: 8,
              width: mobile ? 'calc(100vw - 24px)' : 280,
              maxWidth: 320,
              padding: '16px 20px',
              background: COLORS.surface,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 8,
              zIndex: 100,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
              <span style={{ color: COLORS.accent }}>Persona</span> World
            </div>
            <p style={{ fontSize: 11, color: COLORS.dim, lineHeight: 1.6, margin: '0 0 10px' }}>
              Each character has a unique personality and emotional state.
              They interact autonomously — building relationships,
              reacting emotionally, and evolving over time.
            </p>
            <p style={{ fontSize: 11, color: COLORS.dim, lineHeight: 1.6, margin: '0 0 12px' }}>
              Click a character to see their inner world.
              Try performing actions and watch how they feel.
            </p>
            <div style={{ fontSize: 10, color: COLORS.muted, borderTop: `1px solid ${COLORS.border}`, paddingTop: 10 }}>
              powered by{' '}
              <a
                href="https://molroo.io"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: COLORS.accent, textDecoration: 'none', fontWeight: 600 }}
              >
                molroo.io
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
