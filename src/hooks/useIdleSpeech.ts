import { useRef, useEffect } from 'react'
import { CharacterState } from '../types'
import type { Persona } from '../types'
import type { WorldState } from '../engine/worldState'
import { generateMonologue } from '../api/llm'

interface UseIdleSpeechOpts {
  worldRef: React.RefObject<WorldState | null>
  personas: Persona[]
  enabled: boolean
}

export function useIdleSpeech({ worldRef, personas, enabled }: UseIdleSpeechOpts) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const busyRef = useRef(false)

  useEffect(() => {
    if (!enabled) {
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }

    const tick = async () => {
      if (busyRef.current) {
        timerRef.current = setTimeout(tick, 5000)
        return
      }

      const world = worldRef.current
      if (!world || personas.length === 0) {
        timerRef.current = setTimeout(tick, 5000)
        return
      }

      // Find idle, non-frozen characters without active bubbles
      const candidates = [...world.characters.values()].filter(
        (ch) =>
          ch.state === CharacterState.IDLE &&
          !ch.frozen &&
          ch.bubbleTimer <= 0,
      )

      if (candidates.length === 0) {
        timerRef.current = setTimeout(tick, 5000)
        return
      }

      // Pick random idle character
      const ch = candidates[Math.floor(Math.random() * candidates.length)]
      const persona = personas.find((p) => p.persona_config_id === ch.id)
      if (!persona) {
        timerRef.current = setTimeout(tick, 5000)
        return
      }

      busyRef.current = true
      const emotionLabel = persona.state?.emotion?.label || 'neutral'
      const moodLabel = persona.state?.mood?.label || 'neutral'

      const line = await generateMonologue(
        persona.config.identity.name,
        persona.config.identity.role || '',
        emotionLabel,
        moodLabel,
      )

      busyRef.current = false

      if (line && ch.bubbleTimer <= 0 && !ch.frozen) {
        ch.bubbleEmoji = '\u{1F4AD}'
        ch.bubbleText = line
        ch.bubbleType = 'think'
        ch.bubbleTimer = 4
      }

      // Next tick: 15-25 seconds
      const interval = 15000 + Math.random() * 10000
      timerRef.current = setTimeout(tick, interval)
    }

    // Start after initial delay
    timerRef.current = setTimeout(tick, 8000 + Math.random() * 5000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [enabled, personas, worldRef])
}
