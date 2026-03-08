/**
 * Bulk emotion consistency test.
 *
 * Usage:
 *   node scripts/emotion-test.mjs                     # uses .env.production
 *   API_KEY=mk_live_... WORLD_ID=... node scripts/emotion-test.mjs
 */

import { Molroo } from '@molroo-io/sdk/world'
import { readFileSync } from 'fs'

// ── Load env from .env.production ──
function loadEnv() {
  try {
    const text = readFileSync(new URL('../.env.production', import.meta.url), 'utf8')
    for (const line of text.split('\n')) {
      const m = line.match(/^(\w+)=(.*)$/)
      if (m) process.env[m[1]] ??= m[2]
    }
  } catch { /* ignore */ }
}
loadEnv()

const API_KEY = process.env.API_KEY || process.env.VITE_API_KEY
const WORLD_ID = process.env.WORLD_ID || process.env.VITE_WORLD_ID
const API_URL = process.env.API_URL || process.env.VITE_API_URL || 'https://api.molroo.io'

if (!API_KEY || !WORLD_ID) {
  console.error('Missing API_KEY or WORLD_ID')
  process.exit(1)
}

// ── Actions (from src/data/actions.ts) ──
const ACTIONS = [
  { name: 'affection',  expected: 'joy',         valence: '+', appraisal: { goalRelevance: 0.7, goalCongruence: 0.8, expectedness: 0.5, controllability: 0.6, agency: -0.1, normCompatibility: 0.7, internalStandards: 0.5, adjustmentPotential: 0.7, urgency: 0.2 } },
  { name: 'praise',     expected: 'joy',         valence: '+', appraisal: { goalRelevance: 0.7, goalCongruence: 0.9, expectedness: 0.4, controllability: 0.6, agency: 0.0, normCompatibility: 0.8, internalStandards: 0.8, adjustmentPotential: 0.7, urgency: 0.1 } },
  { name: 'comfort',    expected: 'contentment', valence: '+', appraisal: { goalRelevance: 0.4, goalCongruence: 0.65, expectedness: 0.8, controllability: 0.5, agency: -0.2, normCompatibility: 0.5, internalStandards: 0.3, adjustmentPotential: 0.8, urgency: 0.1 } },
  { name: 'gift',       expected: 'contentment', valence: '+', appraisal: { goalRelevance: 0.5, goalCongruence: 0.7, expectedness: 0.5, controllability: 0.5, agency: -0.2, normCompatibility: 0.7, internalStandards: 0.4, adjustmentPotential: 0.7, urgency: 0.15 } },
  { name: 'encourage',  expected: 'trust',       valence: '+', appraisal: { goalRelevance: 0.5, goalCongruence: 0.5, expectedness: 0.7, controllability: 0.8, agency: 0.3, normCompatibility: 0.7, internalStandards: 0.6, adjustmentPotential: 0.8, urgency: 0.2 } },
  { name: 'excite',     expected: 'excitement',  valence: '+', appraisal: { goalRelevance: 0.85, goalCongruence: 0.55, expectedness: 0.05, controllability: 0.5, agency: 0.4, normCompatibility: 0.4, internalStandards: 0.3, adjustmentPotential: 0.5, urgency: 0.8 } },
  { name: 'startle',    expected: 'surprise',    valence: '~', appraisal: { goalRelevance: 0.7, goalCongruence: 0.3, expectedness: 0.02, controllability: 0.5, agency: 0.2, normCompatibility: 0.0, internalStandards: 0.0, adjustmentPotential: 0.4, urgency: 0.9 } },
  { name: 'tease',      expected: 'calm',        valence: '~', appraisal: { goalRelevance: 0.4, goalCongruence: -0.2, expectedness: 0.3, controllability: 0.5, agency: -0.2, normCompatibility: 0.1, internalStandards: -0.1, adjustmentPotential: 0.7, urgency: 0.2 } },
  { name: 'challenge',  expected: 'calm',        valence: '~', appraisal: { goalRelevance: 0.6, goalCongruence: -0.1, expectedness: 0.3, controllability: 0.6, agency: -0.1, normCompatibility: 0.0, internalStandards: 0.2, adjustmentPotential: 0.6, urgency: 0.5 } },
  { name: 'provoke',    expected: 'anger',       valence: '-', appraisal: { goalRelevance: 0.8, goalCongruence: -0.7, expectedness: 0.2, controllability: 0.8, agency: 0.4, normCompatibility: -0.5, internalStandards: 0.3, adjustmentPotential: 0.3, urgency: 0.8 } },
  { name: 'neglect',    expected: 'sadness',     valence: '-', appraisal: { goalRelevance: 0.8, goalCongruence: -0.7, expectedness: 0.9, controllability: 0.4, agency: -0.6, normCompatibility: -0.3, internalStandards: -0.2, adjustmentPotential: 0.3, urgency: 0.1 } },
  { name: 'disgrace',   expected: 'disgust',     valence: '-', appraisal: { goalRelevance: 0.6, goalCongruence: -0.6, expectedness: 0.3, controllability: 0.7, agency: 0.2, normCompatibility: -0.8, internalStandards: 0.4, adjustmentPotential: 0.5, urgency: 0.4 } },
  { name: 'criticize',  expected: 'guilt',       valence: '-', appraisal: { goalRelevance: 0.7, goalCongruence: -0.6, expectedness: 0.3, controllability: 0.4, agency: -0.6, normCompatibility: -0.4, internalStandards: -0.6, adjustmentPotential: 0.4, urgency: 0.3 } },
  { name: 'attack',     expected: 'fear',        valence: '-', appraisal: { goalRelevance: 0.8, goalCongruence: -0.8, expectedness: 0.15, controllability: 0.3, agency: -0.2, normCompatibility: -0.6, internalStandards: -0.1, adjustmentPotential: 0.2, urgency: 0.9 } },
  { name: 'betray',     expected: 'shame',       valence: '-', appraisal: { goalRelevance: 0.85, goalCongruence: -0.8, expectedness: 0.15, controllability: 0.15, agency: -0.7, normCompatibility: -0.8, internalStandards: -0.8, adjustmentPotential: 0.15, urgency: 0.5 } },
  { name: 'threaten',   expected: 'anxiety',     valence: '-', appraisal: { goalRelevance: 1.0, goalCongruence: -0.4, expectedness: 0.05, controllability: 0.15, agency: 0.0, normCompatibility: -0.1, internalStandards: -0.3, adjustmentPotential: 0.2, urgency: 0.7 } },
]

// ── Run ──
const molroo = new Molroo({ apiKey: API_KEY, baseUrl: API_URL })
const world = await molroo.getWorld(WORLD_ID)
const personas = await world.listPersonas()

console.log(`World: ${WORLD_ID}`)
console.log(`Personas: ${personas.length}, Actions: ${ACTIONS.length}`)
console.log(`Total interactions: ${personas.length * ACTIONS.length}`)
console.log('─'.repeat(120))

// CSV header
console.log(['persona', 'action', 'expected', 'actual', 'match', 'V', 'A', 'D', 'dV', 'dA', 'dD', 'intensity', 'secondary', 'mood', 'somatic'].join('\t'))

let total = 0, matched = 0, mismatched = 0

for (const persona of personas) {
  for (const act of ACTIONS) {
    try {
      const result = await world.interact({
        target: persona.persona_config_id,
        action: act.name,
        actionLabel: act.name,
        appraisal: act.appraisal,
        actor: 'test-runner',
        actorType: 'user',
      })

      const e = result.emotion
      const d = e.delta ?? { V: 0, A: 0, D: 0 }
      const isMatch = e.label === act.expected
      total++
      if (isMatch) matched++; else mismatched++

      console.log([
        persona.persona_config_id,
        act.name,
        act.expected,
        e.label,
        isMatch ? 'OK' : 'MISS',
        e.vad.V.toFixed(3),
        e.vad.A.toFixed(3),
        e.vad.D.toFixed(3),
        d.V.toFixed(3),
        d.A.toFixed(3),
        d.D.toFixed(3),
        e.intensity.toFixed(3),
        e.secondary_label ?? '-',
        result.mood?.label ?? '-',
        result.somatic.join(', ') || '-',
      ].join('\t'))
    } catch (err) {
      console.log([persona.persona_config_id, act.name, act.expected, 'ERROR', '-', '-', '-', '-', '-', '-', '-', '-', '-', '-', err.message].join('\t'))
      total++; mismatched++
    }
  }
}

console.log('─'.repeat(120))
console.log(`Total: ${total}  Matched: ${matched} (${(matched/total*100).toFixed(1)}%)  Mismatched: ${mismatched} (${(mismatched/total*100).toFixed(1)}%)`)
