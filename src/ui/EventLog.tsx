import { useState } from 'react'
import type { LogEntry } from '../types'
import { COLORS } from '../constants'
import { t, tEmotion } from '../data/i18n'

const ACLS: Record<string, string> = {
  affection: 'p', comfort: 'p', praise: 'p', gift: 'p', encourage: 'p', excite: 'p',
  tease: 'm', challenge: 'm', startle: 'm',
  provoke: 'n', neglect: 'n', disgrace: 'n', criticize: 'n', attack: 'n', betray: 'n', threaten: 'n',
}

interface Props {
  logs: LogEntry[]
  compact?: boolean
  onSelect?: (id: string) => void
}

// Mobile toast: shows last 3 events as floating notifications
export function MobileEventToast({ logs }: { logs: LogEntry[] }) {
  const recent = logs.slice(0, 3)
  if (recent.length === 0) return null

  return (
    <div style={{
      position: 'absolute',
      top: 8,
      left: 8,
      right: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      pointerEvents: 'none',
      zIndex: 40,
    }}>
      {recent.map((e, i) => {
        const cls = ACLS[e.action] === 'p' ? COLORS.pos : ACLS[e.action] === 'n' ? COLORS.neg : COLORS.warn
        return (
          <div
            key={`${e.time}-${i}`}
            style={{
              display: 'flex',
              gap: 6,
              padding: '4px 10px',
              background: 'rgba(8,8,13,0.85)',
              borderRadius: 6,
              fontSize: 10,
              opacity: i === 0 ? 0.95 : 0.6 - i * 0.15,
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 12 }}>{e.emoji}</span>
            <span style={{ fontWeight: 600, color: e.from === 'user-1' ? COLORS.accent : COLORS.blue }}>
              {e.from === 'user-1' ? t('You') : e.from.slice(0, 6)}
            </span>
            <span style={{ color: cls, fontWeight: 600 }}>{t(e.action)}</span>
            <span style={{ color: COLORS.dim }}>{tEmotion(e.emotion)}</span>
          </div>
        )
      })}
    </div>
  )
}

// Mobile full log overlay
export function MobileEventOverlay({ logs, onClose }: { logs: LogEntry[]; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxHeight: '60dvh',
          background: COLORS.surface,
          borderRadius: '12px 12px 0 0',
          overflow: 'auto',
          padding: '16px 16px 24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: COLORS.text }}>
            {t('Global Log')} <span style={{ color: COLORS.dim }}>({logs.length})</span>
          </span>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: COLORS.dim, cursor: 'pointer', fontSize: 14, padding: 2, fontFamily: 'inherit' }}
          >
            x
          </button>
        </div>
        {logs.length === 0 ? (
          <div style={{ color: COLORS.muted, fontSize: 10 }}>{t('no interactions yet')}</div>
        ) : (
          logs.slice(0, 50).map((e, i) => {
            const cls = ACLS[e.action] === 'p' ? COLORS.pos : ACLS[e.action] === 'n' ? COLORS.neg : COLORS.warn
            return (
              <div key={i} style={{ display: 'flex', gap: 6, padding: '4px 0', fontSize: 10, borderBottom: '1px solid #ffffff04' }}>
                <span style={{ color: COLORS.muted, fontSize: 9, minWidth: 48 }}>{e.time}</span>
                <span style={{ fontSize: 12, minWidth: 16 }}>{e.emoji}</span>
                <span style={{ fontWeight: 600, color: e.from === 'user-1' ? COLORS.accent : COLORS.blue, minWidth: 40 }}>
                  {e.from === 'user-1' ? t('You') : e.from.slice(0, 6)}
                </span>
                <span style={{ fontWeight: 600, color: cls, minWidth: 55 }}>{t(e.action)}</span>
                <span style={{ color: COLORS.dim, flex: 1 }}>{tEmotion(e.emotion)}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// Desktop event log (bottom bar)
export function EventLog({ logs, onSelect }: Props) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div style={{ borderTop: `1px solid ${COLORS.border}`, background: '#0a0a10', display: 'flex', flexDirection: 'column' }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 20px',
          cursor: 'pointer',
        }}
      >
        <span style={{ fontSize: 10, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>
          {t('Global Log')} <span style={{ color: COLORS.dim }}>({logs.length})</span>
        </span>
        <button
          style={{ fontSize: 9, color: COLORS.dim, cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' }}
        >
          {expanded ? `\u25BC ${t('collapse')}` : `\u25B2 ${t('expand')}`}
        </button>
      </div>
      <div
        style={{
          overflow: 'auto',
          padding: expanded ? '0 20px 8px' : '0 20px',
          maxHeight: expanded ? '30vh' : 0,
          minHeight: expanded ? 120 : 0,
          transition: 'max-height 0.3s',
        }}
      >
        {logs.length === 0 ? (
          <div style={{ color: COLORS.muted, fontSize: 10, padding: '4px 0' }}>{t('perform an action to see logs here')}</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                {[t('time'), t('actor'), '', t('target'), t('action_header'), t('reaction')].map((h, i) => (
                  <th key={i} style={{ padding: '4px 6px', textAlign: 'left', fontSize: 10, color: COLORS.muted, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.slice(0, 50).map((e, i) => {
                const cls = ACLS[e.action] === 'p' ? COLORS.pos : ACLS[e.action] === 'n' ? COLORS.neg : COLORS.warn
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #ffffff04' }}>
                    <td style={{ padding: '3px 6px', color: COLORS.muted, fontSize: 10, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{e.time}</td>
                    <td
                      onClick={() => e.from !== 'user-1' && onSelect?.(e.from)}
                      style={{ padding: '3px 6px', fontWeight: 600, color: e.from === 'user-1' ? COLORS.accent : e.auto ? COLORS.blue : COLORS.text, whiteSpace: 'nowrap', cursor: e.from !== 'user-1' ? 'pointer' : 'default' }}
                    >
                      {e.from === 'user-1' ? t('You') : e.from.slice(0, 8)}{e.auto ? ' \u{1F916}' : ''}
                    </td>
                    <td style={{ padding: '3px 2px', color: COLORS.muted, fontSize: 10 }}>{'\u2192'}</td>
                    <td
                      onClick={() => onSelect?.(e.target)}
                      style={{ padding: '3px 6px', color: COLORS.text, whiteSpace: 'nowrap', cursor: 'pointer' }}
                    >
                      {e.target.slice(0, 8)}
                    </td>
                    <td style={{ padding: '3px 6px', fontWeight: 600, color: cls, whiteSpace: 'nowrap' }}>{t(e.action)}</td>
                    <td style={{ padding: '3px 6px', color: COLORS.dim, whiteSpace: 'nowrap' }}>
                      {e.emoji} {tEmotion(e.emotion)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
