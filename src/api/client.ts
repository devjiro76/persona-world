import { World } from '@molroo-io/world-sdk'
import type { AppraisalVector } from '@molroo-io/world-sdk'
import type { Persona } from '../types'

const VID = import.meta.env.PROD
  ? '4a618dba-b9e7-4848-a0d7-9d88000b3999'
  : '6b4ef66c-3140-4e02-bc90-56dfe1903815'

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
  appraisal?: AppraisalVector,
): Promise<ActResult | null> {
  try {
    const village = await villagePromise
    const result = await village.interact({
      target: targetId,
      action: actionName,
      actionLabel: actionName,
      appraisal,
      actor: actorId,
      actorType,
    })
    return (result as unknown as ActResult) ?? null
  } catch (err) {
    console.warn(`[interact] ${actionName} on ${targetId} failed:`, err)
    return null
  }
}
