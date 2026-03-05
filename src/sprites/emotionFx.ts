import type { VAD } from '../types'

/**
 * Get a tint color overlay based on VAD values.
 * Returns an rgba string for canvas globalCompositeOperation overlay, or null for no tint.
 */
export function getEmotionTint(vad: VAD): string | null {
  // High valence: warm glow
  if (vad.V > 0.3) return 'rgba(255,180,50,0.15)'
  // Low valence: cold tint
  if (vad.V < -0.3) return 'rgba(100,100,255,0.15)'
  // High arousal: red pulse
  if (vad.A > 0.5) return 'rgba(255,50,50,0.1)'
  // No tint
  return null
}

/**
 * Get walk speed multiplier based on arousal.
 * High arousal characters move faster, low arousal characters move slower.
 */
export function getSpeedMultiplier(vad: VAD): number {
  if (vad.A > 0.5) return 1.5
  if (vad.A < -0.3) return 0.7
  return 1.0
}

/** Map of discrete emotion names to emoji */
const EMOTION_EMOJIS: Record<string, string> = {
  joy: '\u{1F604}',             // smiling face with open mouth and smiling eyes
  happiness: '\u{1F60A}',      // smiling face with smiling eyes
  sadness: '\u{1F622}',        // crying face
  anger: '\u{1F621}',          // pouting face
  fear: '\u{1F628}',           // fearful face
  surprise: '\u{1F632}',       // astonished face
  disgust: '\u{1F922}',        // nauseated face
  contempt: '\u{1F624}',       // face with look of triumph
  trust: '\u{1F91D}',          // handshake
  love: '\u{1F970}',           // smiling face with hearts
  pride: '\u{1F60E}',          // smiling face with sunglasses
  shame: '\u{1F633}',          // flushed face
  guilt: '\u{1F614}',          // pensive face
  envy: '\u{1F612}',           // unamused face
  gratitude: '\u{1F64F}',      // person with folded hands
  hope: '\u{2728}',            // sparkles
  anxiety: '\u{1F630}',        // face with open mouth and cold sweat
  contentment: '\u{1F60C}',    // relieved face
  amusement: '\u{1F606}',      // smiling face with open mouth and tightly-closed eyes
  boredom: '\u{1F611}',        // expressionless face
  relief: '\u{1F62E}\u{200D}\u{1F4A8}', // face exhaling
  interest: '\u{1F9D0}',       // face with monocle
  awe: '\u{1F929}',            // star-struck
  serenity: '\u{1F607}',       // smiling face with halo
  neutral: '\u{1F610}',        // neutral face
  calm: '\u{1F60C}',            // relieved face
  numbness: '\u{1F636}',        // face without mouth
  excitement: '\u{1F929}',     // star-struck
  frustration: '\u{1F624}',    // face with look of triumph
  disappointment: '\u{1F61E}', // disappointed face
  tenderness: '\u{1F970}',     // smiling face with hearts
  anticipation: '\u{1F914}',   // thinking face
  nostalgia: '\u{1F97A}',      // pleading face
  admiration: '\u{1F929}',     // star-struck
}

/**
 * Get an emoji for a discrete emotion name.
 * Falls back to a neutral emoji if the emotion is unknown.
 */
export function emoEmoji(discrete: string | undefined): string {
  return EMOTION_EMOJIS[discrete?.toLowerCase() ?? ''] ?? '\u{1F636}' // dotted line face
}
