import type { Persona } from '../types'

const API = import.meta.env.PROD ? 'https://world-api.molroo.io' : 'http://localhost:8788'
const VID = import.meta.env.PROD
  ? 'a0393412-751c-4e95-a4ea-879a7a0b1299'
  : '0525b7b4-60e3-4bb0-9642-aab49327be6b'

export function getVillageId() {
  return VID
}

async function api(path: string, opts: RequestInit = {}) {
  const r = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': import.meta.env.VITE_API_KEY ?? 'dev-test-key',
      ...opts.headers,
    },
  })
  return r.json()
}

export async function fetchPersonas(signal?: AbortSignal): Promise<Persona[]> {
  const data = await api(`/villages/${VID}/personas`, { signal })
  if (!data.result) return []

  const list: Persona[] = data.result.personas
  await Promise.all(
    list.map(async (p) => {
      try {
        const sd = await api(`/villages/${VID}/personas/${p.persona_config_id}`)
        if (sd.result?.state) p.state = sd.result.state
      } catch {
        // ignore
      }
    }),
  )
  return list
}

export interface ActResult {
  emotion: {
    vad: { V: number; A: number; D: number }
    discrete: { primary: string; secondary?: string; intensity: number }
  }
  mood?: { vad: { V: number; A: number; D: number } }
  somatic?: string[]
}

export async function actOnPersona(
  targetId: string,
  actionName: string,
  actorId: string,
  actorType: 'user' | 'persona',
): Promise<ActResult | null> {
  const data = await api(`/villages/${VID}/act`, {
    method: 'POST',
    body: JSON.stringify({
      target_persona_id: targetId,
      action_name: actionName,
      actor_id: actorId,
      actor_type: actorType,
    }),
  })
  return data.result ?? null
}
