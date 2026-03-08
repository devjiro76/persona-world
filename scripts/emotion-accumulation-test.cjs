/**
 * Emotion accumulation test — simulates sequential interactions to observe state drift.
 *
 * The live app sends interactions every few seconds without time for idle decay.
 * This test reproduces that pattern and tracks how VAD state evolves.
 *
 * Usage:
 *   API_KEY=dev-test-key WORLD_ID=... API_URL=http://localhost:4371 node scripts/emotion-accumulation-test.cjs
 */

const { readFileSync } = require('fs')
const { join } = require('path')

// ── Load env ──
try {
  const text = readFileSync(join(__dirname, '..', '.env.production'), 'utf8')
  for (const line of text.split('\n')) {
    const m = line.match(/^(\w+)=(.*)$/)
    if (m) process.env[m[1]] ??= m[2]
  }
} catch { /* ignore */ }

const API_KEY = process.env.API_KEY || process.env.VITE_API_KEY
const WORLD_ID = process.env.WORLD_ID || process.env.VITE_WORLD_ID
const API_URL = process.env.API_URL || process.env.VITE_API_URL || 'https://api.molroo.io'

if (!API_KEY || !WORLD_ID) {
  console.error('Missing API_KEY or WORLD_ID')
  process.exit(1)
}

// ── Actions (from src/data/actions.ts) ──
const ACTIONS = {
  affection:  { dir: '+', appraisal: { goalRelevance: 0.7, goalCongruence: 0.8, expectedness: 0.5, controllability: 0.6, agency: -0.1, normCompatibility: 0.7, internalStandards: 0.5, adjustmentPotential: 0.7, urgency: 0.2 } },
  praise:     { dir: '+', appraisal: { goalRelevance: 0.7, goalCongruence: 0.9, expectedness: 0.4, controllability: 0.6, agency: 0.0, normCompatibility: 0.8, internalStandards: 0.8, adjustmentPotential: 0.7, urgency: 0.1 } },
  comfort:    { dir: '+', appraisal: { goalRelevance: 0.4, goalCongruence: 0.65, expectedness: 0.8, controllability: 0.5, agency: -0.2, normCompatibility: 0.5, internalStandards: 0.3, adjustmentPotential: 0.8, urgency: 0.1 } },
  gift:       { dir: '+', appraisal: { goalRelevance: 0.5, goalCongruence: 0.7, expectedness: 0.5, controllability: 0.5, agency: -0.2, normCompatibility: 0.7, internalStandards: 0.4, adjustmentPotential: 0.7, urgency: 0.15 } },
  encourage:  { dir: '+', appraisal: { goalRelevance: 0.5, goalCongruence: 0.5, expectedness: 0.7, controllability: 0.8, agency: 0.3, normCompatibility: 0.7, internalStandards: 0.6, adjustmentPotential: 0.8, urgency: 0.2 } },
  excite:     { dir: '+', appraisal: { goalRelevance: 0.85, goalCongruence: 0.55, expectedness: 0.05, controllability: 0.5, agency: 0.4, normCompatibility: 0.4, internalStandards: 0.3, adjustmentPotential: 0.5, urgency: 0.8 } },
  tease:      { dir: '~', appraisal: { goalRelevance: 0.4, goalCongruence: -0.2, expectedness: 0.3, controllability: 0.5, agency: -0.2, normCompatibility: 0.1, internalStandards: -0.1, adjustmentPotential: 0.7, urgency: 0.2 } },
  challenge:  { dir: '~', appraisal: { goalRelevance: 0.6, goalCongruence: -0.1, expectedness: 0.3, controllability: 0.6, agency: -0.1, normCompatibility: 0.0, internalStandards: 0.2, adjustmentPotential: 0.6, urgency: 0.5 } },
  provoke:    { dir: '-', appraisal: { goalRelevance: 0.8, goalCongruence: -0.7, expectedness: 0.2, controllability: 0.8, agency: 0.4, normCompatibility: -0.5, internalStandards: 0.3, adjustmentPotential: 0.3, urgency: 0.8 } },
  neglect:    { dir: '-', appraisal: { goalRelevance: 0.8, goalCongruence: -0.7, expectedness: 0.9, controllability: 0.4, agency: -0.6, normCompatibility: -0.3, internalStandards: -0.2, adjustmentPotential: 0.3, urgency: 0.1 } },
  disgrace:   { dir: '-', appraisal: { goalRelevance: 0.6, goalCongruence: -0.6, expectedness: 0.3, controllability: 0.7, agency: 0.2, normCompatibility: -0.8, internalStandards: 0.4, adjustmentPotential: 0.5, urgency: 0.4 } },
  criticize:  { dir: '-', appraisal: { goalRelevance: 0.7, goalCongruence: -0.6, expectedness: 0.3, controllability: 0.4, agency: -0.6, normCompatibility: -0.4, internalStandards: -0.6, adjustmentPotential: 0.4, urgency: 0.3 } },
  attack:     { dir: '-', appraisal: { goalRelevance: 0.8, goalCongruence: -0.8, expectedness: 0.15, controllability: 0.3, agency: -0.2, normCompatibility: -0.6, internalStandards: -0.1, adjustmentPotential: 0.2, urgency: 0.9 } },
  betray:     { dir: '-', appraisal: { goalRelevance: 0.85, goalCongruence: -0.8, expectedness: 0.15, controllability: 0.15, agency: -0.7, normCompatibility: -0.8, internalStandards: -0.8, adjustmentPotential: 0.15, urgency: 0.5 } },
  threaten:   { dir: '-', appraisal: { goalRelevance: 1.0, goalCongruence: -0.4, expectedness: 0.05, controllability: 0.15, agency: 0.0, normCompatibility: -0.1, internalStandards: -0.3, adjustmentPotential: 0.2, urgency: 0.7 } },
}

// ── Simulated interaction sequences (mimicking auto-tick patterns) ──
// Realistic mix: some positive, some negative, some mixed — like a real village day
const SEQUENCES = {
  // finn gets a mix of actions from different villagers (from the log, finn receives many negative)
  finn_realistic: [
    'praise', 'comfort', 'tease', 'challenge', 'criticize',
    'attack', 'gift', 'betray', 'affection', 'neglect',
    'comfort', 'provoke', 'gift', 'tease', 'attack',
    'praise', 'encourage', 'criticize', 'affection', 'challenge',
  ],
  // Mostly positive then suddenly negative (should we see recovery?)
  positive_then_negative: [
    'affection', 'praise', 'comfort', 'gift', 'encourage', 'affection',
    'attack', 'betray', 'criticize', 'provoke',
    'gift', 'comfort', 'praise',  // can it recover?
  ],
  // Sustained negative — does it get stuck?
  sustained_negative: [
    'criticize', 'neglect', 'attack', 'betray', 'threaten',
    'provoke', 'disgrace', 'criticize', 'neglect', 'attack',
    'gift', 'gift', 'gift', 'gift', 'gift',  // can gifts pull it out?
  ],
  // All positive — does relief dominate?
  all_positive: [
    'affection', 'praise', 'comfort', 'gift', 'encourage', 'excite',
    'affection', 'praise', 'comfort', 'gift', 'encourage', 'excite',
  ],
}

const POSITIVE = new Set(['joy', 'excitement', 'contentment', 'love', 'pride', 'gratitude', 'amusement', 'relief'])
const NEGATIVE = new Set(['anger', 'fear', 'sadness', 'anxiety', 'disgust', 'shame', 'guilt'])

function emotionSign(label) {
  if (POSITIVE.has(label)) return '+'
  if (NEGATIVE.has(label)) return '-'
  return '~'
}

async function main() {
  const { Molroo } = require('@molroo-io/sdk/world')

  const molroo = new Molroo({ apiKey: API_KEY, baseUrl: API_URL })
  const world = await molroo.getWorld(WORLD_ID)
  const personas = await world.listPersonas()

  // Test with specific personas that showed issues
  const targetNames = ['finn', 'nyx', 'rex', 'sage']
  const targets = personas.filter(p => targetNames.includes(p.persona_config_id))

  if (targets.length === 0) {
    console.error('Target personas not found')
    process.exit(1)
  }

  for (const [seqName, sequence] of Object.entries(SEQUENCES)) {
    for (const persona of targets) {
      const pid = persona.persona_config_id
      console.log()
      console.log(`${'='.repeat(100)}`)
      console.log(`SEQUENCE: ${seqName}  |  PERSONA: ${pid}`)
      console.log(`${'='.repeat(100)}`)
      console.log(['#', 'action', 'dir', 'emotion', 'sign', 'ok?', 'V', 'A', 'D', 'intensity', 'secondary', 'mood'].join('\t'))

      let weirdCount = 0

      for (let i = 0; i < sequence.length; i++) {
        const actionName = sequence[i]
        const act = ACTIONS[actionName]
        if (!act) { console.log(`Unknown action: ${actionName}`); continue }

        try {
          const result = await world.interact({
            target: pid,
            action: actionName,
            actionLabel: actionName,
            appraisal: act.appraisal,
            actor: 'test-runner',
            actorType: 'user',
          })

          const e = result.emotion
          const sign = emotionSign(e.label)

          // Check if the emotion direction matches the action direction
          let ok = 'OK'
          if (act.dir === '+' && sign === '-') { ok = 'WEIRD'; weirdCount++ }
          if (act.dir === '-' && sign === '+') { ok = 'WEIRD'; weirdCount++ }

          console.log([
            String(i + 1).padStart(2),
            actionName.padEnd(10),
            act.dir,
            e.label.padEnd(12),
            sign,
            ok.padEnd(5),
            e.vad.V.toFixed(3),
            e.vad.A.toFixed(3),
            e.vad.D.toFixed(3),
            e.intensity.toFixed(3),
            e.secondary_label ?? '-',
            result.mood?.label ?? '-',
          ].join('\t'))
        } catch (err) {
          console.log([String(i + 1).padStart(2), actionName.padEnd(10), act.dir, 'ERROR', '-', '-', '-', '-', '-', '-', '-', '-'].join('\t'))
        }
      }

      console.log(`--- ${pid}: ${weirdCount}/${sequence.length} weird reactions ---`)
    }
  }
}

main().catch(err => { console.error(err); process.exit(1) })
