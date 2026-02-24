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

    fetchPersonas(ctrl.signal)
      .then((result) => {
        setPersonas(result.length > 0 ? result : MOCK_PERSONAS)
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
