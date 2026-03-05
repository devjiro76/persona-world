import { useRef, useState, useCallback } from 'react'
import type { Persona } from '../types'
import { pickActor, pickTarget, pickAction } from '../auto-tick/autoTick'

interface UseAutoTickOpts {
  personas: Persona[]
  onTick: (actorId: string, targetId: string, actionName: string) => Promise<void>
}

export function useAutoTick({ personas, onTick }: UseAutoTickOpts) {
  const [running, setRunning] = useState(false)
  const [speed, _setSpeed] = useState(5)
  const speedRef = useRef(5)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const runningRef = useRef(false)
  // Tracks actors mid-action AND in post-action cooldown
  const busyActors = useRef(new Set<string>())
  // Tracks current targets to avoid dog-piling one character
  const busyTargets = useRef(new Set<string>())

  const setSpeed = useCallback((v: number) => {
    speedRef.current = v
    _setSpeed(v)
  }, [])

  const getInterval = useCallback(() => {
    const base = 4 - speedRef.current * 0.3
    const jitter = base * 0.4 * (Math.random() - 0.5)
    return Math.max(300, (base + jitter) * 1000)
  }, [])

  const tick = useCallback(() => {
    if (!runningRef.current || personas.length < 2) return

    // Pick an actor that isn't busy or in cooldown
    const available = personas.filter((p) => !busyActors.current.has(p.persona_config_id))
    if (available.length === 0) {
      timerRef.current = setTimeout(tick, 500)
      return
    }

    const actor = pickActor(available)

    // Exclude busy targets AND busy actors (prevents chase-cycles / deadlock)
    const targetCandidates = personas.filter(
      (p) =>
        p.persona_config_id !== actor.persona_config_id &&
        !busyTargets.current.has(p.persona_config_id) &&
        !busyActors.current.has(p.persona_config_id),
    )
    if (targetCandidates.length === 0) {
      timerRef.current = setTimeout(tick, getInterval())
      return
    }

    const target = pickTarget(actor, targetCandidates)
    if (!target) {
      timerRef.current = setTimeout(tick, getInterval())
      return
    }

    const actionName = pickAction(actor, target)
    const actorId = actor.persona_config_id
    const targetId = target.persona_config_id

    // Mark both busy
    busyActors.current.add(actorId)
    busyTargets.current.add(targetId)

    onTick(actorId, targetId, actionName).finally(() => {
      busyTargets.current.delete(targetId)
      // Post-action cooldown: let the actor wander for a few seconds before next action
      const cooldown = 3000 + Math.random() * 4000
      setTimeout(() => {
        busyActors.current.delete(actorId)
      }, cooldown)
    })

    // Schedule next tick — don't wait
    if (runningRef.current) {
      timerRef.current = setTimeout(tick, getInterval())
    }
  }, [personas, onTick, getInterval])

  const toggle = useCallback(() => {
    if (runningRef.current) {
      runningRef.current = false
      setRunning(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      busyActors.current.clear()
      busyTargets.current.clear()
    } else {
      runningRef.current = true
      setRunning(true)
      timerRef.current = setTimeout(tick, getInterval())
    }
  }, [tick, getInterval])

  return { running, speed, setSpeed, toggle }
}
