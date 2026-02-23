import { useState } from 'react'
import type { LogEntry } from '../types'
import { COLORS } from '../constants'

const ACLS: Record<string, string> = {
  affection: 'p', comfort: 'p', praise: 'p', gift: 'p', encourage: 'p', excite: 'p',
  tease: 'm', challenge: 'm', startle: 'm',
  provoke: 'n', neglect: 'n', disgrace: 'n', criticize: 'n', attack: 'n', betray: 'n', threaten: 'n',
}

interface Props {
  logs: LogEntry[]
}

export function EventLog({ logs }: Props) {
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
          Global Log <span style={{ color: COLORS.dim }}>({logs.length})</span>
        </span>
        <button
          style={{ fontSize: 9, color: COLORS.dim, cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit' }}
        >
          {expanded ? '\u25BC collapse' : '\u25B2 expand'}
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
          <div style={{ color: COLORS.muted, fontSize: 10, padding: '4px 0' }}>perform an action to see logs here</div>
        ) : (
          logs.slice(0, 50).map((e, i) => {
            const cls = ACLS[e.action] === 'p' ? COLORS.pos : ACLS[e.action] === 'n' ? COLORS.neg : COLORS.warn
            return (
              <div
                key={i}
                style={{ display: 'flex', gap: 8, padding: '3px 0', fontSize: 10, borderBottom: '1px solid #ffffff04', alignItems: 'baseline' }}
              >
                <span style={{ color: COLORS.muted, fontSize: 9, minWidth: 55 }}>{e.time}</span>
                <span style={{ minWidth: 50, fontWeight: 600, color: e.from === 'user-1' ? COLORS.accent : e.auto ? COLORS.blue : COLORS.text }}>
                  {e.from === 'user-1' ? 'You' : e.from.slice(0, 8)}{e.auto ? ' \u{1F916}' : ''}
                </span>
                <span style={{ color: COLORS.muted, fontSize: 8 }}>\u2192</span>
                <span style={{ minWidth: 50, color: COLORS.text }}>{e.target.slice(0, 8)}</span>
                <span style={{ minWidth: 65, fontWeight: 600, color: cls }}>{e.action}</span>
                <span style={{ fontSize: 12, minWidth: 16 }}>{e.emoji}</span>
                <span style={{ color: COLORS.dim, flex: 1, fontSize: 10 }}>{e.emotion}</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
