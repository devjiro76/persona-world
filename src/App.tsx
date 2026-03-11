import { useState, useRef, useCallback, useEffect } from 'react'
import { CharacterState } from './types'
import type { LogEntry } from './types'
import { COLORS, TILE_SIZE } from './constants'
import { renderFrame } from './engine/renderer'
import { updateCharacter, walkToCharacter, triggerReact, finishInteract } from './engine/characters'
import { createWorldState, initCharacters, updatePersonaState, type WorldState } from './engine/worldState'
import { usePersonas } from './hooks/usePersonas'
import { useGameLoop } from './hooks/useGameLoop'
import { useAutoTick } from './hooks/useAutoTick'
import { trackFeeling } from './auto-tick/autoTick'
import { emoEmoji } from './sprites/emotionFx'
import { actOnPersona } from './api/client'
import { ACTIONS_BY_NAME } from './data/actions'
import { t, tEmotion } from './data/i18n'
import { loadAssets } from './sprites/assetLoader'
import { OfficeCanvas } from './ui/OfficeCanvas'
import { SidePanel } from './ui/SidePanel'
import { Toolbar } from './ui/Toolbar'
import { EventLog, MobileEventToast, MobileEventOverlay } from './ui/EventLog'
import { BottomSheet } from './ui/BottomSheet'
import { ChatOverlay } from './ui/ChatPanel'
import { useMobile } from './hooks/useMobile'
import { useLLM } from './hooks/useLLM'
import { useIdleSpeech } from './hooks/useIdleSpeech'
import { generateNarration, generateActorLine, generateChatResponse } from './api/llm'
import type { ChatMessage, RecentEvent } from './api/llm'

function OnboardingOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 360,
          background: COLORS.surface,
          border: `1px solid ${COLORS.border}`,
          borderRadius: 12,
          padding: '28px 28px 20px',
          boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>
          <span style={{ color: COLORS.accent }}>Persona</span> World
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {[
            { icon: '\u{1F447}', text: t('Click a character to select') },
            { icon: '\u{1F3AF}', text: t('Use action buttons to interact and watch their emotional reaction') },
            { icon: '\u{25B6}\u{FE0F}', text: t('Press Auto to let characters interact on their own') },
            { icon: '\u{1F50D}', text: t('Scroll to zoom, drag to pan the map') },
          ].map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 18, lineHeight: '22px', flexShrink: 0 }}>{step.icon}</span>
              <span style={{ fontSize: 13, color: COLORS.dim, lineHeight: 1.5 }}>{step.text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px 0',
            background: COLORS.accent,
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          {t('Got it')}
        </button>

        <div style={{ fontSize: 10, color: COLORS.muted, textAlign: 'center', marginTop: 12 }}>
          powered by{' '}
          <a href="https://molroo.io" target="_blank" rel="noopener noreferrer"
            style={{ color: COLORS.accent, textDecoration: 'none', fontWeight: 600 }}>
            molroo.io
          </a>
        </div>
      </div>
    </div>
  )
}

const ACT_EMOJI: Record<string, string> = {
  affection: '\u{1F495}', comfort: '\u{1F917}', praise: '\u{1F31F}', gift: '\u{1F381}',
  encourage: '\u{1F4AA}', excite: '\u{1F389}',
  tease: '\u{1F61C}', challenge: '\u{1F525}', startle: '\u{1F4A5}',
  provoke: '\u{1F620}', neglect: '\u{1F4A4}', disgrace: '\u{1F612}',
  criticize: '\u{1F44E}', attack: '\u{2694}\u{FE0F}', betray: '\u{1F5E1}\u{FE0F}', threaten: '\u{26A0}\u{FE0F}',
}

export function App() {
  const { personas, loading } = usePersonas()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const worldRef = useRef<WorldState | null>(null)
  const offsetRef = useRef({ x: 0, y: 0 })
  const panRef = useRef({ x: 0, y: 0 })
  const timeRef = useRef(0)

  const [zoom, setZoom] = useState(3)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [totalActions, setTotalActions] = useState(0)
  const [globalLogs, setGlobalLogs] = useState<LogEntry[]>([])
  const [personalLogs, setPersonalLogs] = useState<Record<string, LogEntry[]>>({})
  const [busySet, setBusySet] = useState<Set<string>>(new Set())
  const [showOnboarding, setShowOnboarding] = useState(true)
  const [assetsReady, setAssetsReady] = useState(false)
  const [showMobileLog, setShowMobileLog] = useState(false)
  const [showMobileSheet, setShowMobileSheet] = useState(true)
  const [, forceUpdate] = useState(0)
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({})
  const [chatLoading, setChatLoading] = useState(false)
  const { llmEnabled, toggleLLM } = useLLM()
  const llmEnabledRef = useRef(false)
  llmEnabledRef.current = llmEnabled

  // Load sprite assets on mount
  useEffect(() => {
    loadAssets().then(() => setAssetsReady(true))
  }, [])

  // Initialize world when personas load and assets are ready
  if (!worldRef.current && personas.length > 0 && assetsReady) {
    worldRef.current = createWorldState()
    initCharacters(worldRef.current, personas)
  }

  // Idle speech — characters mutter thoughts when idle
  useIdleSpeech({ worldRef, personas, enabled: llmEnabled })

  // Game loop
  useGameLoop(canvasRef, {
    update: (dt) => {
      const world = worldRef.current
      if (!world) return

      timeRef.current += dt

      for (const ch of world.characters.values()) {
        updateCharacter(ch, dt, world.tileMap, world.blockedTiles, world.characters, world.walkableTiles)
      }

      // Camera follow selected character — exponential decay smoothing
      if (selectedId) {
        const ch = world.characters.get(selectedId)
        if (ch) {
          const cols = world.tileMap[0]?.length || 0
          const rows = world.tileMap.length
          const mapW = cols * TILE_SIZE * zoom
          const mapH = rows * TILE_SIZE * zoom
          const targetPanX = mapW / 2 - ch.x * zoom
          const targetPanY = mapH / 2 - ch.y * zoom

          // Frame-rate independent exponential decay
          const smoothing = 1 - Math.exp(-4 * dt)
          panRef.current.x += (targetPanX - panRef.current.x) * smoothing
          panRef.current.y += (targetPanY - panRef.current.y) * smoothing
        }
      }

      // Clamp pan so the camera stays within map bounds
      const canvas = canvasRef.current
      if (canvas) {
        const cols = world.tileMap[0]?.length || 0
        const rows = world.tileMap.length
        const mapW = cols * TILE_SIZE * zoom
        const mapH = rows * TILE_SIZE * zoom
        const maxPanX = Math.max(0, (mapW - canvas.width) / 2)
        const maxPanY = Math.max(0, (mapH - canvas.height) / 2)
        panRef.current.x = Math.max(-maxPanX, Math.min(maxPanX, panRef.current.x))
        panRef.current.y = Math.max(-maxPanY, Math.min(maxPanY, panRef.current.y))
      }
    },
    render: (ctx) => {
      const world = worldRef.current
      if (!world) return

      const canvas = canvasRef.current
      if (!canvas) return

      const result = renderFrame(
        ctx,
        canvas.width,
        canvas.height,
        world.tileMap,
        world.furniture,
        [...world.characters.values()],
        zoom,
        panRef.current.x,
        panRef.current.y,
        selectedId,
        timeRef.current,
      )
      offsetRef.current = { x: result.offsetX, y: result.offsetY }
    },
  })

  // Handle action execution
  const executeAction = useCallback(
    async (targetId: string, actionName: string, actorId = 'user-1', isAuto = false) => {
      const world = worldRef.current
      if (!world) return

      const bkey = targetId + actionName
      setBusySet((prev) => new Set(prev).add(bkey))

      const targetCh = world.characters.get(targetId)
      const targetName = targetCh?.persona.config.identity.name || targetId.slice(0, 6)
      const actorName = actorId === 'user-1' ? t('You') : (world.characters.get(actorId)?.persona.config.identity.name || actorId.slice(0, 6))

      // Track what we froze so we always clean up
      let frozeActor = false
      let frozeTarget = false

      // If auto-tick: walk actor to target, re-chase if target moves away
      if (isAuto && actorId !== 'user-1') {
        const actor = world.characters.get(actorId)
        if (actor && targetCh) {
          // Stop target wandering so actor has a stable destination
          if (targetCh.state === CharacterState.WALK) {
            targetCh.path = []
            targetCh.state = CharacterState.IDLE
          }
          targetCh.wanderTimer = 999

          walkToCharacter(actor, targetId, world.tileMap, world.blockedTiles, world.characters)
          actor.bubbleEmoji = '\u{1F4AD}'
          actor.bubbleText = `${targetName}`
          actor.bubbleTimer = 999
          actor.bubbleType = 'think'

          // Fire LLM actor line generation in background while walking
          let actorLinePromise: Promise<string | null> | null = null
          if (llmEnabledRef.current) {
            const actorP = personas.find((p) => p.persona_config_id === actorId)
            if (actorP) {
              actorLinePromise = generateActorLine(
                actorP.config.identity.name,
                actorP.config.identity.role || '',
                targetName,
                actionName,
              )
            }
          }

          const PROXIMITY = 1.5 * 16
          const MAX_CHASE_MS = 10_000
          let bailed = false
          await new Promise<void>((resolve) => {
            const t0 = Date.now()
            const check = () => {
              // actor got frozen externally — bail
              if (actor.frozen) { bailed = true; resolve(); return }
              // chase timeout — prevent infinite pursuit
              if (Date.now() - t0 > MAX_CHASE_MS) { bailed = true; resolve(); return }
              const dx = actor.x - targetCh.x
              const dy = actor.y - targetCh.y
              const dist = Math.sqrt(dx * dx + dy * dy)
              if (dist <= PROXIMITY) {
                resolve()
              } else if ((actor.state === CharacterState.IDLE || actor.state === CharacterState.INTERACT || (actor.state === CharacterState.WALK && actor.path.length === 0)) && dist > PROXIMITY) {
                walkToCharacter(actor, targetId, world.tileMap, world.blockedTiles, world.characters)
                setTimeout(check, 100)
              } else {
                setTimeout(check, 200)
              }
            }
            check()
          })

          // Restore target wandering
          targetCh.wanderTimer = 2 + Math.random() * 3

          // If bailed (frozen externally or chase timeout), abort entirely
          if (bailed) {
            finishInteract(actor)
            actor.bubbleEmoji = ''
            actor.bubbleTimer = 0
            setBusySet((prev) => { const n = new Set(prev); n.delete(bkey); return n })
            return
          }

          finishInteract(actor)
          actor.frozen = true; frozeActor = true
          targetCh.frozen = true; frozeTarget = true

          // Use LLM-generated actor line if available
          const actorLine = actorLinePromise ? await actorLinePromise : null
          actor.bubbleEmoji = ACT_EMOJI[actionName] || '\u{2753}'
          actor.bubbleText = actorLine || `${t(actionName)} -> ${targetName}`
          actor.bubbleTimer = 3
          actor.bubbleType = 'action'
        }
      } else {
        // User action: freeze target
        if (targetCh) {
          targetCh.frozen = true; frozeTarget = true
          targetCh.bubbleEmoji = ACT_EMOJI[actionName] || '\u{2753}'
          targetCh.bubbleText = `${t(actionName)} <- ${actorName}`
          targetCh.bubbleTimer = 3
          targetCh.bubbleType = 'action'
        }
      }
      await new Promise((r) => setTimeout(r, 800))

      const actorType = actorId === 'user-1' ? 'user' as const : 'persona' as const
      const appraisal = ACTIONS_BY_NAME.get(actionName)?.appraisalVector
      const result = await actOnPersona(targetId, actionName, actorId, actorType, appraisal)

      setBusySet((prev) => {
        const next = new Set(prev)
        next.delete(bkey)
        return next
      })

      if (result) {
        updatePersonaState(world, targetId, {
          emotion: result.emotion,
          mood: result.mood,
          somatic: result.somatic,
        })

        setTotalActions((prev) => prev + 1)
        trackFeeling(targetId, actorId, result.emotion.vad.V)

        const disc = result.emotion.label || '?'
        const emoji = emoEmoji(disc)
        const time = new Date().toLocaleTimeString(undefined, { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })

        // LLM narration (non-blocking: fire alongside bubble animation)
        let narrationText: string | undefined
        let dialogueText: string | undefined
        if (llmEnabledRef.current) {
          const actorP = actorId === 'user-1' ? null : personas.find((p) => p.persona_config_id === actorId)
          const targetP = personas.find((p) => p.persona_config_id === targetId)
          if (targetP) {
            const llmResult = await generateNarration(
              actorId === 'user-1' ? 'Player' : (actorP?.config.identity.name || actorId),
              actorId === 'user-1' ? 'the player' : (actorP?.config.identity.role || ''),
              targetP.config.identity.name,
              targetP.config.identity.role || '',
              actionName,
              disc,
            )
            if (llmResult) {
              narrationText = llmResult.narration
              dialogueText = llmResult.dialogue
            }
          }
        }

        // React animation on target
        if (targetCh) {
          const bubbleMsg = dialogueText || `${tEmotion(disc)} <- ${actorName}`
          triggerReact(targetCh, emoji, bubbleMsg)
          targetCh.bubbleType = 'react'
          if (dialogueText) targetCh.bubbleTimer = 4
        }

        const logEntry: LogEntry = {
          time,
          from: actorId,
          action: actionName,
          target: targetId,
          emotion: disc,
          emoji,
          auto: isAuto,
          narration: narrationText,
          dialogue: dialogueText,
        }

        setGlobalLogs((prev) => [logEntry, ...prev].slice(0, 200))
        setPersonalLogs((prev) => ({
          ...prev,
          [targetId]: [logEntry, ...(prev[targetId] || [])].slice(0, 100),
        }))
        forceUpdate((n) => n + 1)
      }

      // Always unfreeze what we froze
      if (frozeActor) {
        const actorCh = world.characters.get(actorId)
        if (actorCh) actorCh.frozen = false
      }
      if (frozeTarget && targetCh) targetCh.frozen = false
    },
    [],
  )

  // Auto-tick
  const autoTick = useAutoTick({
    personas,
    onTick: async (actorId, targetId, actionName) => {
      await executeAction(targetId, actionName, actorId, true)
    },
  })

  const handleZoom = useCallback((delta: number) => {
    setZoom((prev) => Math.max(1, Math.min(3, Math.round(prev) + delta)))
  }, [])

  const handleZoomFloat = useCallback((newZoom: number) => {
    setZoom(Math.max(1, Math.min(3, newZoom)))
  }, [])

  const sendChatMessage = useCallback(
    async (personaId: string, message: string) => {
      const world = worldRef.current
      if (!world) return

      const persona = personas.find((p) => p.persona_config_id === personaId)
      if (!persona) return

      // Add user message
      setChatMessages((prev) => ({
        ...prev,
        [personaId]: [...(prev[personaId] || []), { role: 'user' as const, text: message }],
      }))

      setChatLoading(true)

      const emotionLabel = persona.state?.emotion?.label || 'neutral'
      const moodLabel = persona.state?.mood?.label || 'neutral'
      const history = chatMessages[personaId] || []

      // Gather recent events involving this character
      const logs = personalLogs[personaId] || []
      const recentEvents: RecentEvent[] = logs.slice(0, 5).map((log) => {
        const actorP = personas.find((p) => p.persona_config_id === log.from)
        const targetP = personas.find((p) => p.persona_config_id === log.target)
        return {
          actorName: log.from === 'user-1' ? 'Player' : (actorP?.config.identity.name || log.from),
          targetName: targetP?.config.identity.name || log.target,
          action: log.action,
          emotion: log.emotion,
        }
      })

      const response = await generateChatResponse(
        persona.config.identity.name,
        persona.config.identity.role || '',
        persona.config.personality,
        emotionLabel,
        moodLabel,
        message,
        history,
        recentEvents,
      )

      setChatLoading(false)

      const responseText = response || t('chat failed')
      setChatMessages((prev) => ({
        ...prev,
        [personaId]: [...(prev[personaId] || []), { role: 'character' as const, text: responseText }],
      }))

      // Show response as speech bubble on canvas
      const ch = world.characters.get(personaId)
      if (ch && response) {
        ch.bubbleEmoji = '\u{1F4AC}'
        ch.bubbleText = response
        ch.bubbleType = 'react'
        ch.bubbleTimer = 4
      }
    },
    [personas, chatMessages],
  )

  const handleSelectFromDirectory = useCallback((id: string) => {
    setSelectedId(id)
    setShowMobileSheet(true)
    // Camera will follow via the game loop
  }, [])

  const selectedPersona = personas.find((p) => p.persona_config_id === selectedId) || null
  const mobile = useMobile()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100dvh', background: COLORS.bg }}>
      <Toolbar
        autoRunning={autoTick.running}
        autoSpeed={autoTick.speed}
        onToggleAuto={autoTick.toggle}
        onSpeedChange={autoTick.setSpeed}
        totalActions={totalActions}
        zoom={zoom}
        onZoomChange={setZoom}
        llmEnabled={llmEnabled}
        onToggleLLM={toggleLLM}
        mobile={mobile}
      />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Canvas area */}
        <div style={{ flex: 1, position: 'relative' }}>
          <OfficeCanvas
            worldRef={worldRef}
            canvasRef={canvasRef}
            zoom={zoom}
            onZoom={handleZoom}
            onZoomFloat={handleZoomFloat}
            onSelect={(id) => { setSelectedId(id); if (id) setShowMobileSheet(true) }}
            offsetRef={offsetRef}
            panRef={panRef}
            disabled={!autoTick.running}
          />
          {(loading || !assetsReady) && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.dim, fontSize: 12 }}>
              {!assetsReady ? 'loading assets...' : 'loading...'}
            </div>
          )}

          {/* Center play button when auto-tick is off */}
          {!autoTick.running && assetsReady && !loading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 50,
                background: 'rgba(8,8,13,0.5)',
                cursor: 'pointer',
              }}
              onClick={autoTick.toggle}
            >
              <button
                style={{
                  width: mobile ? 88 : 100,
                  height: mobile ? 88 : 100,
                  borderRadius: '50%',
                  border: `3px solid ${COLORS.accent}`,
                  background: 'rgba(233,69,96,0.2)',
                  color: '#fff',
                  fontSize: mobile ? 36 : 42,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(8px)',
                  transition: 'transform 0.15s, background 0.15s, box-shadow 0.15s',
                  paddingLeft: 6,
                  boxShadow: `0 0 40px rgba(233,69,96,0.3)`,
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(233,69,96,0.4)'; e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 0 60px rgba(233,69,96,0.5)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(233,69,96,0.2)'; e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(233,69,96,0.3)' }}
              >
                {'\u25B6'}
              </button>
              <div style={{ marginTop: 16, color: '#fff', fontSize: mobile ? 14 : 16, fontWeight: 600, letterSpacing: 1, opacity: 0.9 }}>
                {t('Click to start')}
              </div>
            </div>
          )}

          {/* Chat overlay */}
          {selectedPersona && (
            <ChatOverlay
              persona={selectedPersona}
              messages={chatMessages[selectedId || ''] || []}
              onSend={(msg) => selectedId && sendChatMessage(selectedId, msg)}
              loading={chatLoading}
              llmEnabled={llmEnabled}
              onClose={() => setSelectedId(null)}
            />
          )}

          {/* Mobile event toast */}
          {mobile && <MobileEventToast logs={globalLogs} />}

          {/* Mobile FAB buttons */}
          {mobile && (
            <div style={{
              position: 'absolute',
              bottom: 'calc(8px + env(safe-area-inset-bottom, 0px))',
              right: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              zIndex: 45,
            }}>
              {/* Character directory FAB — shown when sheet is closed */}
              {!showMobileSheet && (
                <button
                  onClick={() => setShowMobileSheet(true)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.surface,
                    color: COLORS.accent,
                    fontSize: 18,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                  }}
                >
                  {'\u{1F464}'}
                </button>
              )}
              {/* Log FAB */}
              {globalLogs.length > 0 && (
                <button
                  onClick={() => setShowMobileLog(true)}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    border: `1px solid ${COLORS.border}`,
                    background: COLORS.surface,
                    color: COLORS.dim,
                    fontSize: 16,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.4)',
                  }}
                >
                  {'\u{1F4DC}'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Side panel — desktop: right sidebar, mobile: bottom sheet */}
        {mobile ? (
          showMobileSheet ? (
            selectedPersona ? (
              <BottomSheet key="persona" onClose={() => { setSelectedId(null); setShowMobileSheet(false) }}>
                <SidePanel
                  persona={selectedPersona}
                  personas={personas}
                  logs={personalLogs[selectedId || ''] || []}
                  onClose={() => { setSelectedId(null); setShowMobileSheet(false) }}
                  onAction={(targetId, actionName) => executeAction(targetId, actionName)}
                  busySet={busySet}
                  compact
                />
              </BottomSheet>
            ) : (
              <BottomSheet key="directory" onClose={() => setShowMobileSheet(false)}>
                <SidePanel
                  persona={null}
                  personas={personas}
                  logs={[]}
                  onClose={() => setShowMobileSheet(false)}
                  onAction={() => {}}
                  onSelectPersona={handleSelectFromDirectory}
                  busySet={busySet}
                  compact
                />
              </BottomSheet>
            )
          ) : null
        ) : (
          <div
            style={{
              width: 380,
              borderLeft: `1px solid ${COLORS.border}`,
              background: COLORS.surface,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <SidePanel
              persona={selectedPersona}
              personas={personas}
              logs={personalLogs[selectedId || ''] || []}
              onClose={() => { setSelectedId(null) }}
              onAction={(targetId, actionName) => executeAction(targetId, actionName)}
              onSelectPersona={handleSelectFromDirectory}
              busySet={busySet}
            />
          </div>
        )}
      </div>

      {!mobile && <EventLog logs={globalLogs} onSelect={setSelectedId} />}

      {/* Mobile full log overlay */}
      {mobile && showMobileLog && (
        <MobileEventOverlay logs={globalLogs} onClose={() => setShowMobileLog(false)} />
      )}

      {showOnboarding && <OnboardingOverlay onClose={() => setShowOnboarding(false)} />}
    </div>
  )
}
