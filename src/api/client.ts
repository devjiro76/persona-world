import { Molroo } from '@molroo-io/sdk/world'
import type { AppraisalVector, InteractResult } from '@molroo-io/sdk/world'
import type { Persona } from '../types'

const VID = import.meta.env.PROD
  ? 'b9ef7860-2adf-4d97-8ab5-4bacb75f2027'
  : '313b9800-b5a5-4226-b134-12183fbda72f'

const molroo = new Molroo({
  apiKey: import.meta.env.VITE_API_KEY ?? 'dev-test-key',
  baseUrl: import.meta.env.PROD ? 'https://api.molroo.io' : 'http://localhost:8788',
})

const worldPromise = molroo.getWorld(VID)

export async function fetchPersonas(_signal?: AbortSignal): Promise<Persona[]> {
  const world = await worldPromise
  const list = await world.listPersonas() as Persona[]
  if (!list.length) return []

  await Promise.all(
    list.map(async (p) => {
      try {
        const detail = await world.getPersona(p.persona_config_id) as Persona & { state?: Persona['state'] }
        if (detail?.state) p.state = detail.state
      } catch {
        // ignore
      }
    }),
  )
  return list
}

export async function actOnPersona(
  targetId: string,
  actionName: string,
  actorId: string,
  actorType: 'user' | 'persona',
  appraisal?: AppraisalVector,
): Promise<InteractResult | null> {
  try {
    const world = await worldPromise
    return await world.interact({
      target: targetId,
      action: actionName,
      actionLabel: actionName,
      appraisal,
      actor: actorId,
      actorType,
    })
  } catch (err) {
    console.warn(`[interact] ${actionName} on ${targetId} failed:`, err)
    return null
  }
}
