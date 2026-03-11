import { getLocale } from '../data/i18n'

const STORAGE_KEY = 'persona-world:openrouter-key'
const MODEL = 'google/gemini-2.0-flash-lite-001'

export function getLLMKey(): string {
  return localStorage.getItem(STORAGE_KEY) || ''
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

async function callLLM(prompt: string, maxTokens: number, temperature = 0.9): Promise<string | null> {
  try {
    // Try server proxy first (production: Pages Function, dev: Vite proxy)
    const body = JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature,
    })

    let res = await fetch('/llm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    })

    // Fallback to direct OpenRouter call with user's custom key
    if (!res.ok && isCustomKey()) {
      res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getLLMKey()}`,
          'Content-Type': 'application/json',
        },
        body,
      })
    }

    if (!res.ok) return null
    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() || null
  } catch {
    return null
  }
}

export async function generateNarration(
  actorName: string,
  actorRole: string,
  targetName: string,
  targetRole: string,
  action: string,
  emotionLabel: string,
): Promise<LLMNarration | null> {
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

  const content = await callLLM(prompt, 150)
  if (!content) return null
  const match = content.match(/\{[\s\S]*\}/)
  if (!match) return null
  try { return JSON.parse(match[0]) as LLMNarration } catch { return null }
}

export async function generateActorLine(
  actorName: string,
  actorRole: string,
  targetName: string,
  action: string,
): Promise<string | null> {
  const lang = getLocale() === 'ko' ? 'Korean' : 'English'

  const prompt = `Pixel art village. ${actorName} (${actorRole}) is about to "${action}" ${targetName}.
Write what ${actorName} says as they approach. 1 sentence, max 12 words, in character. Write in ${lang}. Return ONLY the dialogue line, no quotes.`

  return callLLM(prompt, 80, 0.9)
}

export async function generateMonologue(
  name: string,
  role: string,
  emotionLabel: string,
  moodLabel: string,
): Promise<string | null> {
  const lang = getLocale() === 'ko' ? 'Korean' : 'English'

  const prompt = `Pixel art village. ${name} (${role}) is alone, feeling ${emotionLabel} (mood: ${moodLabel}).
Write their inner thought or muttered words. 1 sentence, max 12 words, in character. Write in ${lang}. Return ONLY the line, no quotes.`

  return callLLM(prompt, 80, 0.95)
}

export interface ChatMessage {
  role: 'user' | 'character'
  text: string
}

export interface RecentEvent {
  actorName: string
  targetName: string
  action: string
  emotion: string
}

export async function generateChatResponse(
  characterName: string,
  characterRole: string,
  personality: { O: number; C: number; E: number; A: number; N: number; H: number },
  emotionLabel: string,
  moodLabel: string,
  userMessage: string,
  history: ChatMessage[],
  recentEvents?: RecentEvent[],
): Promise<string | null> {
  const lang = getLocale() === 'ko' ? 'Korean' : 'English'

  const traits: string[] = []
  if (personality.E >= 0.7) traits.push('extraverted')
  else if (personality.E <= 0.3) traits.push('introverted')
  if (personality.A >= 0.7) traits.push('cooperative')
  else if (personality.A <= 0.3) traits.push('competitive')
  if (personality.N >= 0.7) traits.push('sensitive')
  else if (personality.N <= 0.3) traits.push('calm')
  if (personality.O >= 0.7) traits.push('creative')
  if (personality.H >= 0.7) traits.push('sincere')

  const historyStr = history.slice(-6).map((m) =>
    m.role === 'user' ? `Player: ${m.text}` : `${characterName}: ${m.text}`
  ).join('\n')

  const eventsStr = recentEvents?.slice(-5).map((e) =>
    e.actorName === characterName
      ? `${characterName} did "${e.action}" to ${e.targetName} → ${e.targetName} felt ${e.emotion}`
      : `${e.actorName} did "${e.action}" to ${characterName} → ${characterName} felt ${e.emotion}`
  ).join('\n')

  const prompt = `You are ${characterName}, a ${characterRole} in a pixel art village.
Personality: ${traits.join(', ')}
Current emotion: ${emotionLabel}, mood: ${moodLabel}
${eventsStr ? `\nRecent things that happened to you:\n${eventsStr}\n` : ''}
${historyStr ? `Conversation so far:\n${historyStr}\n` : ''}Player: ${userMessage}

Reply as ${characterName}. Max 20 words. Stay in character. Reference recent events if relevant. No emoji. Write in ${lang}. Return ONLY the reply.`

  return callLLM(prompt, 100, 0.85)
}
