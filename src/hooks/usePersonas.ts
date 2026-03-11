import { useState, useEffect } from 'react'
import type { Persona } from '../types'
import { fetchPersonas } from '../api/client'
import { PERSONAS } from '../data/personas'

const MOCK_PERSONAS: Persona[] = PERSONAS.map((p) => ({
  persona_config_id: p.persona_config_id,
  display_name: p.display_name,
  config: p.config,
  state: {},
}))

export function usePersonas() {
  const [personas, setPersonas] = useState<Persona[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 3000)

    const seedMap = new Map(PERSONAS.map((p) => [p.persona_config_id, p]))

    fetchPersonas(ctrl.signal)
      .then((result) => {
        if (result.length > 0) {
          // Restore original names from seed data (API may return mutated names)
          for (const p of result) {
            const seed = seedMap.get(p.persona_config_id)
            if (seed) {
              p.display_name = seed.display_name
              p.config.identity.name = seed.config.identity.name
              p.config.identity.role = seed.config.identity.role
            }
          }
          setPersonas(result)
        } else {
          setPersonas(MOCK_PERSONAS)
        }
      })
      .catch(() => {
        setPersonas(MOCK_PERSONAS)
      })
      .finally(() => {
        clearTimeout(timer)
        setLoading(false)
      })

    return () => { ctrl.abort(); clearTimeout(timer) }
  }, [])

  return { personas, loading, setPersonas }
}
