import { getLocale } from '../data/i18n'

const DEFAULT_KEY = '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'
const STORAGE_KEY = 'persona-world:openrouter-key'
const MODEL = 'google/gemini-2.0-flash-lite-001'

export function getLLMKey(): string {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_KEY
}

export function setLLMKey(key: string): void {
  if (key) {
    localStorage.setItem(STORAGE_KEY, key)
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function isCustomKey(): boolean {
  return !!localStorage.getItem(STORAGE_KEY)
}

export interface LLMNarration {
  narration: string
  dialogue: string
}

export async function generateNarration(
  actorName: string,
  actorRole: string,
  targetName: string,
  targetRole: string,
  action: string,
  emotionLabel: string,
): Promise<LLMNarration | null> {
  const apiKey = getLLMKey()
  const lang = getLocale() === 'ko' ? 'Korean' : 'English'

  const prompt = `You narrate a pixel art village simulation. Generate a brief narration and a character dialogue line.

Actor: ${actorName} (${actorRole})
Target: ${targetName} (${targetRole})
Action: ${action}
Target's resulting emotion: ${emotionLabel}

Rules:
- Write in ${lang}
- Narration: 1 sentence, max 20 words, third person
- Dialogue: 1 sentence from ${targetName}, max 15 words, in character
- Return ONLY valid JSON: {"narration":"...","dialogue":"..."}`

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.9,
      }),
    })

    if (!res.ok) return null

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content?.trim()
    if (!content) return null

    const match = content.match(/\{[\s\S]*\}/)
    if (!match) return null

    return JSON.parse(match[0]) as LLMNarration
  } catch {
    return null
  }
}
