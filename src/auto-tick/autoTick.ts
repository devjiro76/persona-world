import type { Persona, Character, ActionDef } from '../types'

// Feelings: feelings[target][source] = { total, count, avg }
const feelings: Record<string, Record<string, { total: number; count: number; avg: number }>> = {}

export function trackFeeling(targetPid: string, sourceName: string, valence: number): void {
  if (!feelings[targetPid]) feelings[targetPid] = {}
  if (!feelings[targetPid][sourceName]) feelings[targetPid][sourceName] = { total: 0, count: 0, avg: 0 }
  const f = feelings[targetPid][sourceName]
  f.total += (valence - 0.5) * 2
  f.count++
  f.avg = f.total / f.count
}

export function getFeeling(targetPid: string, sourceName: string): number | null {
  return feelings[targetPid]?.[sourceName]?.avg ?? null
}

export function getFeelingCount(targetPid: string, sourceName: string): number {
  return feelings[targetPid]?.[sourceName]?.count ?? 0
}

// Personality -> action tendency weights
function getActionWeights(
  personality: { O: number; C: number; E: number; A: number; N: number; H: number },
  mood?: { vad: { V: number } },
) {
  const { O, C, E, A, N, H } = personality
  const moodV = mood?.vad?.V ?? 0.5

  return {
    affection: 0.2 + E * 0.4 + A * 0.3 + H * 0.1 + moodV * 0.2,
    comfort: 0.1 + A * 0.5 + E * 0.2 + H * 0.2 + moodV * 0.1,
    praise: 0.1 + A * 0.3 + H * 0.3 + C * 0.2 + moodV * 0.15,
    gift: 0.1 + H * 0.3 + A * 0.3 + O * 0.2 + moodV * 0.1,
    tease: 0.1 + E * 0.3 + (1 - A) * 0.2 + (1 - H) * 0.2 + (1 - C) * 0.1,
    challenge: 0.1 + O * 0.3 + (1 - A) * 0.2 + E * 0.15,
    provoke: 0.05 + (1 - A) * 0.25 + E * 0.2 + (1 - H) * 0.15 + (1 - moodV) * 0.1,
    neglect: 0.05 + (1 - E) * 0.3 + (1 - A) * 0.15 + (1 - O) * 0.1,
    disgrace: 0.02 + (1 - H) * 0.3 + (1 - A) * 0.2 + N * 0.15 + (1 - moodV) * 0.1,
    criticize: 0.05 + (1 - A) * 0.3 + (1 - H) * 0.2 + N * 0.2 + (1 - moodV) * 0.15,
    attack: 0.02 + (1 - A) * 0.2 + (1 - H) * 0.2 + N * 0.3 + (1 - moodV) * 0.2,
    betray: 0.01 + (1 - H) * 0.4 + (1 - A) * 0.2 + (1 - C) * 0.1,
  }
}

function weightedPickIdx(weights: number[]): number {
  const total = weights.reduce((s, w) => s + w, 0)
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return i
  }
  return weights.length - 1
}

function weightedPick<T>(items: T[], weights: number[]): T {
  return items[weightedPickIdx(weights)]
}

// Pick a random persona weighted by sociability
export function pickActor(personas: Persona[]): Persona {
  const weights = personas.map((p) => {
    const t = p.config.personality
    return 0.1 + t.E * 0.5 + t.A * 0.2 + (1 - t.N) * 0.1
  })
  return weightedPick(personas, weights)
}

// Pick a target for the actor
export function pickTarget(actor: Persona, personas: Persona[]): Persona | null {
  const others = personas.filter((p) => p.persona_config_id !== actor.persona_config_id)
  if (others.length === 0) return null

  const weights = others.map((t) => {
    const familiarity = getFeelingCount(actor.persona_config_id, t.persona_config_id)
    return 0.3 + (familiarity > 0 ? 0.3 : 0.5) + Math.random() * 0.2
  })
  return weightedPick(others, weights)
}

// Pick action based on personality + relationship
export function pickAction(actor: Persona, target: Persona): string {
  const weights = getActionWeights(actor.config.personality, actor.state?.mood)
  const feel = getFeeling(actor.persona_config_id, target.persona_config_id)

  // Modulate by relationship
  if (feel !== null) {
    if (feel > 0.1) {
      weights.affection *= 1.5
      weights.comfort *= 1.3
      weights.praise *= 1.3
      weights.gift *= 1.4
      weights.attack *= 0.3
      weights.betray *= 0.1
      weights.criticize *= 0.5
      weights.provoke *= 0.4
      weights.disgrace *= 0.2
      weights.neglect *= 0.4
    } else if (feel < -0.1) {
      weights.criticize *= 1.5
      weights.attack *= 1.3
      weights.tease *= 1.4
      weights.neglect *= 1.5
      weights.provoke *= 1.4
      weights.disgrace *= 1.3
      weights.affection *= 0.3
      weights.comfort *= 0.3
      weights.gift *= 0.2
    }
  }

  const actionNames = Object.keys(weights)
  const actionWeights = actionNames.map(
    (n) => Math.max(0.01, (weights as Record<string, number>)[n] + (Math.random() - 0.5) * 0.1),
  )

  const idx = weightedPickIdx(actionWeights)
  return actionNames[idx]
}

// Affinity label for UI
export function affLabel(v: number | null): { text: string; emoji: string; color: string } {
  if (v === null) return { text: 'unknown', emoji: '?', color: '#55556a' }
  if (v > 0.6) return { text: 'adores', emoji: '\u{1F495}', color: '#34d399' }
  if (v > 0.3) return { text: 'loves', emoji: '\u{1F497}', color: '#34d399' }
  if (v > 0.1) return { text: 'likes', emoji: '\u{1F60A}', color: '#6ee7b7' }
  if (v > 0.03) return { text: 'warm', emoji: '\u{1F642}', color: '#a7f3d0' }
  if (v > -0.03) return { text: 'neutral', emoji: '\u{1F610}', color: '#55556a' }
  if (v > -0.1) return { text: 'cool', emoji: '\u{1F612}', color: '#fca5a5' }
  if (v > -0.3) return { text: 'wary', emoji: '\u{1F620}', color: '#f87171' }
  if (v > -0.6) return { text: 'hostile', emoji: '\u{1F621}', color: '#ef4444' }
  return { text: 'despises', emoji: '\u{1F92C}', color: '#dc2626' }
}
