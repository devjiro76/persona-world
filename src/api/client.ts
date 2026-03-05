import { Molroo } from '@molroo-io/sdk/world'
import type { Appraisal, InteractResult } from '@molroo-io/sdk/world'
import type { Persona } from '../types'
import { PERSONAS } from '../data/personas'

const STORAGE_KEY = 'persona-world:world-id'

const molroo = new Molroo({
  apiKey: import.meta.env.VITE_API_KEY ?? '',
  baseUrl: import.meta.env.VITE_API_URL ?? 'https://api.molroo.io',
})

async function resolveWorld() {
  // 1. Env var takes priority
  const envId = import.meta.env.VITE_WORLD_ID
  if (envId) return molroo.getWorld(envId)

  // 2. Check localStorage for previously created world
  const storedId = localStorage.getItem(STORAGE_KEY)
  if (storedId) {
    try {
      return await molroo.getWorld(storedId)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // 3. Create a new world + seed personas
  console.log('[persona-world] Creating new world...')
  const world = await molroo.createWorld({ name: 'Persona World' })
  localStorage.setItem(STORAGE_KEY, world.id)

  console.log('[persona-world] Seeding personas...')
  await Promise.all(
    PERSONAS.map((p) =>
      world.addPersona({
        configId: p.persona_config_id,
        displayName: p.display_name,
        config: p.config,
      }),
    ),
  )
  console.log(`[persona-world] Seeded ${PERSONAS.length} personas`)

  return world
}

const worldPromise = resolveWorld()

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
  appraisal?: Appraisal,
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
