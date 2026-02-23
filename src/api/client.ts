import { World } from '@molroo-ai/world-sdk'
import type { Persona } from '../types'

const VID = import.meta.env.PROD
  ? 'a0393412-751c-4e95-a4ea-879a7a0b1299'
  : '80cd2060-e194-4261-a2d5-d2d88162fc3c'

const world = new World({
  apiKey: import.meta.env.VITE_API_KEY ?? 'dev-test-key',
  baseUrl: import.meta.env.PROD ? 'https://world-api.molroo.io' : 'http://localhost:8788',
})

const villagePromise = world.getVillage(VID)

export async function fetchPersonas(_signal?: AbortSignal): Promise<Persona[]> {
  const village = await villagePromise
  const list = await village.listPersonas() as Persona[]
  if (!list.length) return []

  await Promise.all(
    list.map(async (p) => {
      try {
        const detail = await village.getPersona(p.persona_config_id) as Persona & { state?: Persona['state'] }
        if (detail?.state) p.state = detail.state
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
  const village = await villagePromise
  const result = await village.interact({
    target: targetId,
    action: actionName,
    actor: actorId,
    actorType,
  })
  return (result as unknown as ActResult) ?? null
}
