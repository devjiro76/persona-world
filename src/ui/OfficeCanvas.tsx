import { useRef, useEffect, useCallback } from 'react'
import { TILE_SIZE } from '../constants'
import type { Character } from '../types'
import type { WorldState } from '../engine/worldState'

interface Props {
  worldRef: React.RefObject<WorldState | null>
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  zoom: number
  onZoom: (delta: number) => void
  onSelect: (id: string | null) => void
  offsetRef: React.RefObject<{ x: number; y: number }>
  panRef: React.RefObject<{ x: number; y: number }>
}

const PAN_SPEED = 8 // px per key frame

export function OfficeCanvas({ worldRef, canvasRef, zoom, onZoom, onSelect, offsetRef, panRef }: Props) {
  const dragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const lastMouse = useRef({ x: 0, y: 0 })
  const keysDown = useRef(new Set<string>())

  // Resize canvas to fill container
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const parent = canvas.parentElement
    if (!parent) return

    const resize = () => {
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)
    return () => ro.disconnect()
  }, [canvasRef])

  // Keyboard panning
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        keysDown.current.add(e.key)
      }
    }
    const onKeyUp = (e: KeyboardEvent) => {
      keysDown.current.delete(e.key)
    }

    let rafId = 0
    const tick = () => {
      const keys = keysDown.current
      if (keys.size > 0) {
        if (keys.has('ArrowLeft')) panRef.current.x += PAN_SPEED
        if (keys.has('ArrowRight')) panRef.current.x -= PAN_SPEED
        if (keys.has('ArrowUp')) panRef.current.y += PAN_SPEED
        if (keys.has('ArrowDown')) panRef.current.y -= PAN_SPEED
      }
      rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      cancelAnimationFrame(rafId)
    }
  }, [panRef])

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      onZoom(e.deltaY > 0 ? -1 : 1)
    },
    [onZoom],
  )

  // --- Mouse drag ---
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 0) {
      dragging.current = true
      dragStart.current = { x: e.clientX, y: e.clientY }
      lastMouse.current = { x: e.clientX, y: e.clientY }
    }
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging.current) return
      const dx = e.clientX - lastMouse.current.x
      const dy = e.clientY - lastMouse.current.y
      lastMouse.current = { x: e.clientX, y: e.clientY }
      panRef.current.x += dx
      panRef.current.y += dy
    },
    [panRef],
  )

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging.current) return
      dragging.current = false

      // If barely moved from start, treat as click (select character)
      const dx = Math.abs(e.clientX - dragStart.current.x)
      const dy = Math.abs(e.clientY - dragStart.current.y)
      if (dx < 5 && dy < 5) {
        doSelect(e.clientX, e.clientY)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [zoom],
  )

  // --- Touch drag ---
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let touchStart = { x: 0, y: 0 }
    let lastTouch = { x: 0, y: 0 }
    let touching = false

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        e.preventDefault()
        const t = e.touches[0]
        touching = true
        touchStart = { x: t.clientX, y: t.clientY }
        lastTouch = { x: t.clientX, y: t.clientY }
      }
    }
    const onTouchMove = (e: TouchEvent) => {
      if (!touching || e.touches.length !== 1) return
      e.preventDefault()
      const t = e.touches[0]
      panRef.current.x += t.clientX - lastTouch.x
      panRef.current.y += t.clientY - lastTouch.y
      lastTouch = { x: t.clientX, y: t.clientY }
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (!touching) return
      touching = false
      const t = e.changedTouches[0]
      const dx = Math.abs(t.clientX - touchStart.x)
      const dy = Math.abs(t.clientY - touchStart.y)
      if (dx < 10 && dy < 10) {
        doSelect(t.clientX, t.clientY)
      }
    }

    canvas.addEventListener('touchstart', onTouchStart, { passive: false })
    canvas.addEventListener('touchmove', onTouchMove, { passive: false })
    canvas.addEventListener('touchend', onTouchEnd)
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart)
      canvas.removeEventListener('touchmove', onTouchMove)
      canvas.removeEventListener('touchend', onTouchEnd)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, zoom])

  const doSelect = useCallback(
    (clientX: number, clientY: number) => {
      const world = worldRef.current
      const canvas = canvasRef.current
      if (!world || !canvas) return

      const rect = canvas.getBoundingClientRect()
      const mx = clientX - rect.left
      const my = clientY - rect.top

      const wx = (mx - offsetRef.current.x) / zoom
      const wy = (my - offsetRef.current.y) / zoom

      let closest: Character | null = null
      let closestDist = 12

      for (const ch of world.characters.values()) {
        const dx = wx - ch.x
        const dy = wy - (ch.y - TILE_SIZE / 2)
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < closestDist) {
          closestDist = dist
          closest = ch
        }
      }

      onSelect(closest?.id ?? null)
    },
    [worldRef, canvasRef, zoom, onSelect, offsetRef],
  )

  return (
    <canvas
      ref={canvasRef}
      tabIndex={0}
      style={{ position: 'absolute', top: 0, left: 0, cursor: 'grab', imageRendering: 'pixelated', outline: 'none' }}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    />
  )
}
