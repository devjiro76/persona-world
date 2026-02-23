import { useState, useEffect } from 'react'
import type { Persona } from '../types'
import { fetchPersonas } from '../api/client'

const MOCK_PERSONAS: Persona[] = [
  'Alice', 'Bob', 'Clara', 'David', 'Eve', 'Frank',
  'Grace', 'Henry', 'Iris', 'Jack', 'Kate', 'Leo',
].map((name, i) => ({
  persona_config_id: `mock-${i}`,
  display_name: name,
  config: {
    identity: { name, role: 'villager' },
    personality: { O: 0.5, C: 0.5, E: 0.5, A: 0.5, N: 0.5, H: 0.5 },
  },
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
