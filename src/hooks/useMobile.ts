import { useState, useEffect } from 'react'

export function useMobile(breakpoint = 768): boolean {
  const [mobile, setMobile] = useState(() => window.innerWidth < breakpoint)

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [breakpoint])

  return mobile
}
