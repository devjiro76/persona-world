import { useState, useCallback } from 'react'

function getLLMFromURL(): boolean {
  if (typeof window === 'undefined') return false
  return new URLSearchParams(window.location.search).get('llm') === 'on'
}

function syncURL(enabled: boolean): void {
  const url = new URL(window.location.href)
  if (enabled) {
    url.searchParams.set('llm', 'on')
  } else {
    url.searchParams.delete('llm')
  }
  window.history.replaceState({}, '', url.toString())
}

export function useLLM() {
  const [enabled, setEnabled] = useState(getLLMFromURL)

  const toggle = useCallback(() => {
    setEnabled((prev) => {
      const next = !prev
      syncURL(next)
      return next
    })
  }, [])

  return { llmEnabled: enabled, toggleLLM: toggle }
}
