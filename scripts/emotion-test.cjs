/**
 * Emotion consistency test — directional + diversity evaluation.
 *
 * Validates:
 *   1. Directional correctness: positive actions → positive emotions, negative → negative
 *   2. Personality diversity: different personas SHOULD react differently
 *   3. Intensity variance: sensitive personas (high N) should show stronger responses
 *
 * Usage:
 *   node scripts/emotion-test.cjs
 *   API_KEY=... API_URL=... WORLD_ID=... node scripts/emotion-test.cjs
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

// ── Emotion classification ──
const POSITIVE = new Set(['joy', 'excitement', 'contentment', 'love', 'pride', 'gratitude', 'amusement', 'relief'])
const NEGATIVE = new Set(['anger', 'fear', 'sadness', 'anxiety', 'disgust', 'shame', 'guilt'])
const NEUTRAL  = new Set(['surprise', 'trust', 'calm', 'numbness'])

function emotionValence(label) {
  if (POSITIVE.has(label)) return '+'
  if (NEGATIVE.has(label)) return '-'
  return '~'
}

// ── Actions with expected direction ──
const ACTIONS = [
  // POSITIVE actions — should produce positive or neutral emotions
  { name: 'affection',  direction: '+', appraisal: { goalRelevance: 0.7, goalCongruence: 0.8, expectedness: 0.5, controllability: 0.6, agency: -0.1, normCompatibility: 0.7, internalStandards: 0.5, adjustmentPotential: 0.7, urgency: 0.2 } },
  { name: 'praise',     direction: '+', appraisal: { goalRelevance: 0.7, goalCongruence: 0.9, expectedness: 0.4, controllability: 0.6, agency: 0.0, normCompatibility: 0.8, internalStandards: 0.8, adjustmentPotential: 0.7, urgency: 0.1 } },
  { name: 'comfort',    direction: '+', appraisal: { goalRelevance: 0.4, goalCongruence: 0.65, expectedness: 0.8, controllability: 0.5, agency: -0.2, normCompatibility: 0.5, internalStandards: 0.3, adjustmentPotential: 0.8, urgency: 0.1 } },
  { name: 'gift',       direction: '+', appraisal: { goalRelevance: 0.5, goalCongruence: 0.7, expectedness: 0.5, controllability: 0.5, agency: -0.2, normCompatibility: 0.7, internalStandards: 0.4, adjustmentPotential: 0.7, urgency: 0.15 } },
  { name: 'encourage',  direction: '+', appraisal: { goalRelevance: 0.5, goalCongruence: 0.5, expectedness: 0.7, controllability: 0.8, agency: 0.3, normCompatibility: 0.7, internalStandards: 0.6, adjustmentPotential: 0.8, urgency: 0.2 } },
  { name: 'excite',     direction: '+', appraisal: { goalRelevance: 0.85, goalCongruence: 0.55, expectedness: 0.05, controllability: 0.5, agency: 0.4, normCompatibility: 0.4, internalStandards: 0.3, adjustmentPotential: 0.5, urgency: 0.8 } },
  // MIXED actions — any emotion is acceptable
  { name: 'startle',    direction: '~', appraisal: { goalRelevance: 0.7, goalCongruence: 0.3, expectedness: 0.02, controllability: 0.5, agency: 0.2, normCompatibility: 0.0, internalStandards: 0.0, adjustmentPotential: 0.4, urgency: 0.9 } },
  { name: 'tease',      direction: '~', appraisal: { goalRelevance: 0.4, goalCongruence: -0.2, expectedness: 0.3, controllability: 0.5, agency: -0.2, normCompatibility: 0.1, internalStandards: -0.1, adjustmentPotential: 0.7, urgency: 0.2 } },
  { name: 'challenge',  direction: '~', appraisal: { goalRelevance: 0.6, goalCongruence: -0.1, expectedness: 0.3, controllability: 0.6, agency: -0.1, normCompatibility: 0.0, internalStandards: 0.2, adjustmentPotential: 0.6, urgency: 0.5 } },
  // NEGATIVE actions — should produce negative or neutral emotions
  { name: 'provoke',    direction: '-', appraisal: { goalRelevance: 0.8, goalCongruence: -0.7, expectedness: 0.2, controllability: 0.8, agency: 0.4, normCompatibility: -0.5, internalStandards: 0.3, adjustmentPotential: 0.3, urgency: 0.8 } },
  { name: 'neglect',    direction: '-', appraisal: { goalRelevance: 0.8, goalCongruence: -0.7, expectedness: 0.9, controllability: 0.4, agency: -0.6, normCompatibility: -0.3, internalStandards: -0.2, adjustmentPotential: 0.3, urgency: 0.1 } },
  { name: 'disgrace',   direction: '-', appraisal: { goalRelevance: 0.6, goalCongruence: -0.6, expectedness: 0.3, controllability: 0.7, agency: 0.2, normCompatibility: -0.8, internalStandards: 0.4, adjustmentPotential: 0.5, urgency: 0.4 } },
  { name: 'criticize',  direction: '-', appraisal: { goalRelevance: 0.7, goalCongruence: -0.6, expectedness: 0.3, controllability: 0.4, agency: -0.6, normCompatibility: -0.4, internalStandards: -0.6, adjustmentPotential: 0.4, urgency: 0.3 } },
  { name: 'attack',     direction: '-', appraisal: { goalRelevance: 0.8, goalCongruence: -0.8, expectedness: 0.15, controllability: 0.3, agency: -0.2, normCompatibility: -0.6, internalStandards: -0.1, adjustmentPotential: 0.2, urgency: 0.9 } },
  { name: 'betray',     direction: '-', appraisal: { goalRelevance: 0.85, goalCongruence: -0.8, expectedness: 0.15, controllability: 0.15, agency: -0.7, normCompatibility: -0.8, internalStandards: -0.8, adjustmentPotential: 0.15, urgency: 0.5 } },
  { name: 'threaten',   direction: '-', appraisal: { goalRelevance: 1.0, goalCongruence: -0.4, expectedness: 0.05, controllability: 0.15, agency: 0.0, normCompatibility: -0.1, internalStandards: -0.3, adjustmentPotential: 0.2, urgency: 0.7 } },
]

// ── Persona HEXACO profiles (for analysis) ──
const PERSONA_TRAITS = {
  luna: { E: 0.25, N: 0.65, label: 'dreamy painter' },
  rex:  { E: 0.95, N: 0.25, label: 'gym coach' },
  sage: { E: 0.30, N: 0.15, label: 'stoic philosopher' },
  miko: { E: 0.75, N: 0.35, label: 'cafe owner' },
  kai:  { E: 0.85, N: 0.50, label: 'restless traveler' },
  nyx:  { E: 0.15, N: 0.85, label: 'brooding poet' },
  ari:  { E: 0.60, N: 0.30, label: 'village nurse' },
  zed:  { E: 0.80, N: 0.55, label: 'cunning trickster' },
  sol:  { E: 0.50, N: 0.20, label: 'retired captain' },
  ivy:  { E: 0.70, N: 0.45, label: 'journalist' },
  finn: { E: 0.20, N: 0.70, label: 'shy librarian' },
  rosa: { E: 0.90, N: 0.60, label: 'street dancer' },
}

async function main() {
  const { Molroo } = require('@molroo-io/sdk/world')

  const molroo = new Molroo({ apiKey: API_KEY, baseUrl: API_URL })
  const world = await molroo.getWorld(WORLD_ID)
  const personas = await world.listPersonas()

  console.log(`World: ${WORLD_ID}`)
  console.log(`Personas: ${personas.length}, Actions: ${ACTIONS.length}`)
  console.log(`Total interactions: ${personas.length * ACTIONS.length}`)
  console.log()

  // ── Collect all results ──
  const results = []
  // per-action: track which emotions each persona produces
  const actionEmotionMap = {}  // action -> { persona: emotion }
  const directionStats = { correct: 0, wrong: 0, neutral: 0 }

  console.log('── Raw Results ──')
  console.log(['persona', 'action', 'dir', 'emotion', 'valence', 'dirOK', 'V', 'A', 'D', 'intensity'].join('\t'))

  for (const persona of personas) {
    const pid = persona.persona_config_id
    for (const act of ACTIONS) {
      try {
        const result = await world.interact({
          target: pid,
          action: act.name,
          actionLabel: act.name,
          appraisal: act.appraisal,
          actor: 'test-runner',
          actorType: 'user',
        })

        const e = result.emotion
        const actualValence = emotionValence(e.label)

        // Direction check: positive action should not produce negative emotion, and vice versa
        let dirOK
        if (act.direction === '~') {
          dirOK = 'OK'  // mixed actions always pass
          directionStats.neutral++
        } else if (act.direction === '+') {
          dirOK = actualValence === '-' ? 'WRONG' : 'OK'
          if (dirOK === 'OK') directionStats.correct++; else directionStats.wrong++
        } else {
          dirOK = actualValence === '+' ? 'WRONG' : 'OK'
          if (dirOK === 'OK') directionStats.correct++; else directionStats.wrong++
        }

        console.log([
          pid, act.name, act.direction, e.label, actualValence, dirOK,
          e.vad.V.toFixed(3), e.vad.A.toFixed(3), e.vad.D.toFixed(3),
          e.intensity.toFixed(3),
        ].join('\t'))

        results.push({ persona: pid, action: act.name, direction: act.direction, emotion: e.label, valence: actualValence, dirOK, intensity: e.intensity, vad: e.vad })

        if (!actionEmotionMap[act.name]) actionEmotionMap[act.name] = {}
        actionEmotionMap[act.name][pid] = e.label
      } catch (err) {
        console.log([pid, act.name, act.direction, 'ERROR', '-', '-', '-', '-', '-', '-'].join('\t'))
      }
    }
  }

  // ── 1. Direction correctness ──
  const totalDirectional = directionStats.correct + directionStats.wrong
  console.log()
  console.log('══ 1. DIRECTIONAL CORRECTNESS ══')
  console.log(`Correct: ${directionStats.correct}/${totalDirectional} (${(directionStats.correct/totalDirectional*100).toFixed(1)}%)`)
  console.log(`Wrong:   ${directionStats.wrong}/${totalDirectional}`)
  console.log(`Mixed (always OK): ${directionStats.neutral}`)

  // Show wrong cases
  const wrongCases = results.filter(r => r.dirOK === 'WRONG')
  if (wrongCases.length > 0) {
    console.log()
    console.log('Direction violations:')
    for (const w of wrongCases) {
      const traits = PERSONA_TRAITS[w.persona]
      console.log(`  ${w.persona} (${traits?.label}, E=${traits?.E} N=${traits?.N}) + ${w.action}(${w.direction}) → ${w.emotion}(${w.valence})`)
    }
  }

  // ── 2. Diversity per action ──
  console.log()
  console.log('══ 2. EMOTION DIVERSITY PER ACTION ══')
  console.log(['action', 'dir', 'unique', 'emotions'].join('\t'))

  for (const act of ACTIONS) {
    const emotions = actionEmotionMap[act.name]
    if (!emotions) continue
    const uniqueEmotions = [...new Set(Object.values(emotions))]
    const emotionCounts = {}
    for (const e of Object.values(emotions)) {
      emotionCounts[e] = (emotionCounts[e] || 0) + 1
    }
    const sorted = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])
    const display = sorted.map(([e, c]) => `${e}(${c})`).join(', ')
    console.log([act.name, act.direction, uniqueEmotions.length, display].join('\t'))
  }

  // ── 3. Personality-driven intensity analysis ──
  console.log()
  console.log('══ 3. INTENSITY BY PERSONALITY (high N = more intense?) ══')
  const personaIntensity = {}
  for (const r of results) {
    if (!personaIntensity[r.persona]) personaIntensity[r.persona] = []
    personaIntensity[r.persona].push(r.intensity)
  }

  const intensityRows = Object.entries(personaIntensity).map(([pid, intensities]) => {
    const avg = intensities.reduce((a, b) => a + b, 0) / intensities.length
    const traits = PERSONA_TRAITS[pid]
    return { pid, avg, N: traits?.N ?? 0, E: traits?.E ?? 0, label: traits?.label ?? '' }
  }).sort((a, b) => b.N - a.N)

  console.log(['persona', 'role', 'N', 'E', 'avgIntensity'].join('\t'))
  for (const row of intensityRows) {
    console.log([row.pid, row.label, row.N.toFixed(2), row.E.toFixed(2), row.avg.toFixed(3)].join('\t'))
  }

  // ── 4. Per-persona reaction profile ──
  console.log()
  console.log('══ 4. PERSONA REACTION PROFILES ══')
  for (const persona of personas) {
    const pid = persona.persona_config_id
    const traits = PERSONA_TRAITS[pid]
    const myResults = results.filter(r => r.persona === pid)
    const positive = myResults.filter(r => r.direction === '+').map(r => r.emotion)
    const negative = myResults.filter(r => r.direction === '-').map(r => r.emotion)

    console.log(`\n  ${pid} (${traits?.label}, E=${traits?.E} N=${traits?.N})`)
    console.log(`    Positive actions → ${[...new Set(positive)].join(', ')}`)
    console.log(`    Negative actions → ${[...new Set(negative)].join(', ')}`)
  }

  // ── Summary ──
  console.log()
  console.log('══ SUMMARY ══')
  console.log(`Direction accuracy: ${(directionStats.correct/totalDirectional*100).toFixed(1)}%`)
  const avgDiversity = ACTIONS.map(a => {
    const emotions = actionEmotionMap[a.name]
    return emotions ? new Set(Object.values(emotions)).size : 0
  }).reduce((a, b) => a + b, 0) / ACTIONS.length
  console.log(`Avg emotion diversity per action: ${avgDiversity.toFixed(1)} unique emotions across 12 personas`)
  const nCorr = intensityRows.length > 1 ? computeCorrelation(intensityRows.map(r => r.N), intensityRows.map(r => r.avg)) : 0
  console.log(`N ↔ intensity correlation: ${nCorr.toFixed(3)} (positive = high N reacts more intensely)`)
}

function computeCorrelation(xs, ys) {
  const n = xs.length
  const mx = xs.reduce((a, b) => a + b) / n
  const my = ys.reduce((a, b) => a + b) / n
  let num = 0, dx2 = 0, dy2 = 0
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx, dy = ys[i] - my
    num += dx * dy; dx2 += dx * dx; dy2 += dy * dy
  }
  return dx2 && dy2 ? num / Math.sqrt(dx2 * dy2) : 0
}

main().catch(err => { console.error(err); process.exit(1) })
