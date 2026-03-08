import { useState } from 'react'
import type { Persona, LogEntry, ActionDef } from '../types'
import { emoEmoji } from '../sprites/emotionFx'
import { getFeeling, getFeelingCount, affLabel } from '../auto-tick/autoTick'
import { COLORS } from '../constants'
import { t, tEmotion } from '../data/i18n'

const ACTIONS: ActionDef[] = [
  { name: 'affection', cls: 'p', label: 'affection' },
  { name: 'comfort', cls: 'p', label: 'comfort' },
  { name: 'praise', cls: 'p', label: 'praise' },
  { name: 'gift', cls: 'p', label: 'gift' },
  { name: 'encourage', cls: 'p', label: 'encourage' },
  { name: 'excite', cls: 'p', label: 'excite' },
  { name: 'tease', cls: 'm', label: 'tease' },
  { name: 'challenge', cls: 'm', label: 'challenge' },
  { name: 'provoke', cls: 'n', label: 'provoke' },
  { name: 'neglect', cls: 'n', label: 'neglect' },
  { name: 'disgrace', cls: 'n', label: 'disgrace' },
  { name: 'criticize', cls: 'n', label: 'criticize' },
  { name: 'attack', cls: 'n', label: 'attack' },
  { name: 'betray', cls: 'n', label: 'betray' },
  { name: 'threaten', cls: 'n', label: 'threaten' },
  { name: 'startle', cls: 'm', label: 'startle' },
]

const ACLS: Record<string, string> = Object.fromEntries(ACTIONS.map((a) => [a.name, a.cls]))

interface Props {
  persona: Persona | null
  personas: Persona[]
  logs: LogEntry[]
  onClose: () => void
  onAction: (targetId: string, actionName: string) => void
  onSelectPersona?: (id: string) => void
  busySet: Set<string>
  compact?: boolean
}

function vColor(v: number): string {
  return v > 0.3 ? COLORS.pos : v < -0.3 ? COLORS.neg : COLORS.warn
}

function VadBar({ label, value }: { label: string; value: number }) {
  const pct = Math.abs(value) * 50
  const left = value >= 0 ? 50 : 50 - pct
  const color = vColor(value)
  const display = value >= 0 ? `+${(value * 100).toFixed(0)}` : (value * 100).toFixed(0)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 70, fontSize: 10, color: COLORS.muted, fontWeight: 600 }}>{label}</span>
      <div style={{ flex: 1, height: 6, background: '#ffffff08', borderRadius: 3, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', width: 1, height: '100%', background: '#ffffff20' }} />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `${left}%`,
            width: `${pct}%`,
            height: '100%',
            borderRadius: 3,
            background: color,
            transition: 'left 0.5s, width 0.5s',
          }}
        />
      </div>
      <span style={{ width: 36, fontSize: 10, color: COLORS.dim, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
        {display}
      </span>
    </div>
  )
}

const TRAIT_LABELS: Record<string, [string, string]> = {
  O: ['conventional', 'creative'],
  C: ['spontaneous', 'disciplined'],
  E: ['introverted', 'extraverted'],
  A: ['competitive', 'cooperative'],
  N: ['calm', 'sensitive'],
  H: ['pragmatic', 'sincere'],
}

function describePersonality(p: { O: number; C: number; E: number; A: number; N: number; H: number }): string[] {
  const tags: string[] = []
  for (const [key, [lo, hi]] of Object.entries(TRAIT_LABELS)) {
    const v = p[key as keyof typeof p]
    if (v >= 0.7) tags.push(t(hi))
    else if (v <= 0.3) tags.push(t(lo))
  }
  return tags
}

type CompactTab = 'actions' | 'feelings' | 'log'

// Character directory — shown when no persona is selected
function CharacterDirectory({ personas, onSelect, compact }: { personas: Persona[]; onSelect: (id: string) => void; compact?: boolean }) {
  return (
    <div style={{ padding: compact ? '8px 16px' : 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, marginBottom: 4 }}>
        {t('characters')} ({personas.length})
      </div>
      {personas.map((p) => {
        const name = p.display_name || p.config.identity.name
        const emotion = p.state?.emotion?.label
        const emoji = emotion ? emoEmoji(emotion) : '\u{1F610}'
        const tags = describePersonality(p.config.personality)
        const vad = p.state?.emotion?.vad
        const valColor = vad ? vColor(vad.V) : COLORS.dim

        return (
          <button
            key={p.persona_config_id}
            onClick={() => onSelect(p.persona_config_id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 10px',
              background: COLORS.card,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 6,
              cursor: 'pointer',
              fontFamily: 'inherit',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <span style={{ fontSize: 16 }}>{emoji}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.text }}>{name}</div>
              <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginTop: 2 }}>
                {tags.slice(0, 3).map(tag => (
                  <span key={tag} style={{ fontSize: 10, padding: '2px 6px', background: '#ffffff08', borderRadius: 3, color: COLORS.dim }}>{tag}</span>
                ))}
              </div>
            </div>
            {emotion && (
              <span style={{ fontSize: 10, color: valColor, fontWeight: 500, flexShrink: 0 }}>{tEmotion(emotion)}</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export function SidePanel({ persona, personas, logs, onClose, onAction, onSelectPersona, busySet, compact }: Props) {
  const [tab, setTab] = useState<CompactTab>('actions')

  if (!persona) {
    if (onSelectPersona) {
      return <CharacterDirectory personas={personas} onSelect={onSelectPersona} compact={compact} />
    }
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: COLORS.muted, fontSize: 12 }}>
        {t('click a character to inspect')}
      </div>
    )
  }

  const pid = persona.persona_config_id
  const s = persona.state
  const emoji = emoEmoji(s?.emotion?.label)
  const allEntities = ['user-1', ...personas.map((x) => x.persona_config_id).filter((x) => x !== pid)]

  // --- Shared sub-components ---
  const emotionBlock = (
    <div style={{ background: COLORS.card, borderRadius: 8, padding: compact ? 10 : 12 }}>
      {!compact && (
        <div style={{ fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, fontWeight: 600 }}>
          {t('emotional state')}
        </div>
      )}
      {s?.emotion ? (
        <>
          <div style={{ fontSize: compact ? 12 : 14, fontWeight: 700, textTransform: 'capitalize', color: vColor(s.emotion.vad.V), display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: compact ? 14 : 18 }}>{emoji}</span>
            {s.emotion.label ? tEmotion(s.emotion.label) : '?'}
            {s.emotion.secondary_label && ` / ${tEmotion(s.emotion.secondary_label)}`}
            <span style={{ fontSize: 10, color: COLORS.dim, fontWeight: 400 }}>
              ({((s.emotion.intensity || 0) * 100).toFixed(0)}%)
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: compact ? 4 : 8 }}>
            <VadBar label={t('pleasure')} value={s.emotion.vad.V} />
            <VadBar label={t('energy')} value={s.emotion.vad.A} />
            <VadBar label={t('control')} value={s.emotion.vad.D} />
          </div>
          {!compact && s.mood && (
            <div style={{ fontSize: 10, color: COLORS.dim, marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
              mood: V {s.mood.vad.V >= 0 ? '+' : ''}{(s.mood.vad.V * 100).toFixed(0)} | A {(s.mood.vad.A * 100).toFixed(0)} | D {s.mood.vad.D >= 0 ? '+' : ''}{(s.mood.vad.D * 100).toFixed(0)}
            </div>
          )}
          {!compact && s.somatic?.length ? (
            <div style={{ display: 'flex', gap: 3, marginTop: 6, flexWrap: 'wrap' }}>
              {s.somatic.map((x, i) => (
                <span key={i} style={{ fontSize: 9, padding: '2px 6px', background: '#ffffff06', borderRadius: 3, color: COLORS.dim }}>
                  {x}
                </span>
              ))}
            </div>
          ) : null}
        </>
      ) : (
        <div style={{ color: COLORS.muted, fontSize: 11 }}>{t('no state yet')}</div>
      )}
    </div>
  )

  const actionsBlock = (
    <div style={{
      display: 'grid',
      gridTemplateColumns: compact ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(70px, 1fr))',
      gap: compact ? 4 : 3,
    }}>
      {ACTIONS.map((a) => {
        const busy = busySet.has(pid + a.name)
        const hoverColor = a.cls === 'p' ? COLORS.pos : a.cls === 'n' ? COLORS.neg : COLORS.warn
        return (
          <button
            key={a.name}
            onClick={() => onAction(pid, a.name)}
            disabled={busy}
            style={{
              padding: compact ? '8px 12px' : '4px 6px',
              border: `1px solid ${COLORS.border}`,
              borderRadius: 5,
              background: 'transparent',
              color: busy ? COLORS.muted : COLORS.dim,
              fontSize: compact ? 12 : 10,
              cursor: busy ? 'default' : 'pointer',
              fontFamily: 'inherit',
              opacity: busy ? 0.3 : 1,
            }}
            onMouseEnter={(e) => {
              if (!busy) {
                e.currentTarget.style.borderColor = hoverColor
                e.currentTarget.style.color = hoverColor
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = COLORS.border
              e.currentTarget.style.color = COLORS.dim
            }}
          >
            {t(a.label)}
          </button>
        )
      })}
    </div>
  )

  const feelingsBlock = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {allEntities.map((eid) => {
        const f = getFeeling(pid, eid)
        const cnt = getFeelingCount(pid, eid)
        const a = affLabel(f)
        const pct = f !== null ? Math.min(100, Math.max(0, ((f + 1) / 2) * 100)) : 50
        const isUser = eid === 'user-1'
        return (
          <div key={eid} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', background: '#ffffff04', borderRadius: 5 }}>
            <span style={{ fontSize: 11, fontWeight: 600, minWidth: 60, color: isUser ? COLORS.accent : undefined }}>
              {isUser ? t('You') : eid.slice(0, 8)}
            </span>
            <div style={{ flex: 1, height: 6, background: '#ffffff08', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  borderRadius: 3,
                  width: `${pct}%`,
                  background: a.color,
                  opacity: f !== null ? 0.7 : 0.15,
                  position: 'absolute',
                  top: 0,
                  transition: 'width 0.4s',
                }}
              />
            </div>
            <span style={{ fontSize: 14, minWidth: 20, textAlign: 'center' }}>{a.emoji}</span>
            <span style={{ fontSize: 9, fontWeight: 600, minWidth: 48, textAlign: 'right', color: a.color }}>{t(a.text)}</span>
            <span style={{ fontSize: 9, color: COLORS.muted, minWidth: 20, textAlign: 'right' }}>
              {cnt > 0 ? `${cnt}x` : ''}
            </span>
          </div>
        )
      })}
    </div>
  )

  const logBlock = (
    <div style={{ overflowY: 'auto', maxHeight: compact ? 160 : 240 }}>
      {logs.length === 0 ? (
        <div style={{ color: COLORS.muted, fontSize: 10 }}>{t('no interactions yet')}</div>
      ) : (
        logs.map((e, i) => {
          const cls = ACLS[e.action] === 'p' ? COLORS.pos : ACLS[e.action] === 'n' ? COLORS.neg : COLORS.warn
          return (
            <div key={i} style={{ padding: '3px 0', borderBottom: '1px solid #ffffff04' }}>
              <div style={{ display: 'flex', gap: 6, fontSize: 10 }}>
                <span style={{ color: COLORS.muted, fontSize: 9, minWidth: 55, fontVariantNumeric: 'tabular-nums' }}>{e.time}</span>
                <span style={{ minWidth: 50, fontWeight: 600, color: e.auto ? COLORS.blue : COLORS.blue }}>
                  {e.from === 'user-1' ? t('You') : e.from.slice(0, 8)}
                </span>
                <span style={{ minWidth: 60, fontWeight: 600, color: cls }}>{t(e.action)}</span>
                <span style={{ color: COLORS.dim, flex: 1 }}>
                  {e.emoji} {tEmotion(e.emotion)}
                </span>
              </div>
              {e.narration && (
                <div style={{ fontSize: 9, color: COLORS.dim, fontStyle: 'italic', marginTop: 2, paddingLeft: 55 }}>
                  {e.narration}
                  {e.dialogue && <span style={{ color: COLORS.text, fontStyle: 'normal', marginLeft: 6 }}>&ldquo;{e.dialogue}&rdquo;</span>}
                </div>
              )}
            </div>
          )
        })
      )}
    </div>
  )

  // --- Compact layout (mobile): header + emotion summary + tab navigation ---
  if (compact) {
    const tabs: { key: CompactTab; label: string }[] = [
      { key: 'actions', label: t('actions') },
      { key: 'feelings', label: t('feelings toward others') },
      { key: 'log', label: `${t('personal log')} (${logs.length})` },
    ]

    return (
      <div style={{ padding: '4px 16px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 700 }}>{persona.display_name || persona.config.identity.name}</span>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {describePersonality(persona.config.personality).map((tag) => (
              <span key={tag} style={{ fontSize: 8, padding: '1px 5px', background: '#ffffff08', borderRadius: 3, color: COLORS.dim }}>
                {tag}
              </span>
            ))}
          </div>
          <button
            onClick={onClose}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: COLORS.dim, cursor: 'pointer', fontSize: 14, padding: 2 }}
          >
            x
          </button>
        </div>

        {/* Emotion summary */}
        {emotionBlock}

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${COLORS.border}` }}>
          {tabs.map((tt) => (
            <button
              key={tt.key}
              onClick={() => setTab(tt.key)}
              style={{
                flex: 1,
                padding: '6px 0',
                background: 'none',
                border: 'none',
                borderBottom: tab === tt.key ? `2px solid ${COLORS.accent}` : '2px solid transparent',
                color: tab === tt.key ? COLORS.accent : COLORS.muted,
                fontSize: 10,
                fontWeight: tab === tt.key ? 600 : 400,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {tt.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ overflow: 'auto' }}>
          {tab === 'actions' && actionsBlock}
          {tab === 'feelings' && feelingsBlock}
          {tab === 'log' && logBlock}
        </div>
      </div>
    )
  }

  // --- Desktop layout: full vertical scroll ---
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{persona.display_name || persona.config.identity.name}</div>
          {persona.config.identity.role && (
            <div style={{ color: COLORS.dim, fontSize: 11, marginTop: 2 }}>{persona.config.identity.role}</div>
          )}
        </div>
        <button
          onClick={onClose}
          style={{ marginLeft: 'auto', background: 'none', border: 'none', color: COLORS.dim, cursor: 'pointer', fontSize: 16, padding: 4, alignSelf: 'flex-start' }}
        >
          x
        </button>
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {describePersonality(persona.config.personality).map((tag) => (
          <span key={tag} style={{ fontSize: 9, padding: '2px 6px', background: '#ffffff08', borderRadius: 3, color: COLORS.dim }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Emotional State */}
      {emotionBlock}

      {/* Actions */}
      <div style={{ background: COLORS.card, borderRadius: 8, padding: 12 }}>
        <div style={{ fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, fontWeight: 600 }}>
          {t('actions')}
        </div>
        {actionsBlock}
      </div>

      {/* Feelings */}
      <div style={{ background: COLORS.card, borderRadius: 8, padding: 12 }}>
        <div style={{ fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, fontWeight: 600 }}>
          {t('feelings toward others')}
        </div>
        {feelingsBlock}
      </div>

      {/* Log */}
      <div style={{ background: COLORS.card, borderRadius: 8, padding: 12, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 11, color: COLORS.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, fontWeight: 600 }}>
          {t('personal log')} ({logs.length})
        </div>
        {logBlock}
      </div>
    </div>
  )
}
