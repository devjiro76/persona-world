import { useRef, useCallback, useEffect, useState } from 'react'
import { COLORS } from '../constants'

interface Props {
  children: React.ReactNode
  onClose: () => void
}

const SNAP_POINTS = [0.2, 0.4, 0.8] // percentage of viewport height

export function BottomSheet({ children, onClose }: Props) {
  const [height, setHeight] = useState(0.4) // start at 40%
  const dragging = useRef(false)
  const startY = useRef(0)
  const startHeight = useRef(0)

  const handleDragStart = useCallback((clientY: number) => {
    dragging.current = true
    startY.current = clientY
    startHeight.current = height
  }, [height])

  const handleDragMove = useCallback((clientY: number) => {
    if (!dragging.current) return
    const vh = window.innerHeight
    const delta = (startY.current - clientY) / vh
    const newHeight = Math.max(0.1, Math.min(0.85, startHeight.current + delta))
    setHeight(newHeight)
  }, [])

  const handleDragEnd = useCallback(() => {
    if (!dragging.current) return
    dragging.current = false

    // Snap to closest point or close
    if (height < 0.12) {
      onClose()
      return
    }

    let closest = SNAP_POINTS[0]
    let minDist = Math.abs(height - closest)
    for (const sp of SNAP_POINTS) {
      const d = Math.abs(height - sp)
      if (d < minDist) { minDist = d; closest = sp }
    }
    setHeight(closest)
  }, [height, onClose])

  // Touch handlers for the drag handle
  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return
      e.preventDefault()
      handleDragMove(e.touches[0].clientY)
    }
    const onTouchEnd = () => handleDragEnd()
    const onMouseMove = (e: MouseEvent) => handleDragMove(e.clientY)
    const onMouseUp = () => handleDragEnd()

    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onTouchEnd)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)

    return () => {
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [handleDragMove, handleDragEnd])

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: `${height * 100}dvh`,
        maxHeight: '85dvh',
        background: COLORS.surface,
        borderTop: `1px solid ${COLORS.border}`,
        borderRadius: '12px 12px 0 0',
        overflow: 'hidden',
        zIndex: 50,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        transition: dragging.current ? 'none' : 'height 0.2s ease-out',
      }}
    >
      {/* Drag handle */}
      <div
        onTouchStart={(e) => handleDragStart(e.touches[0].clientY)}
        onMouseDown={(e) => handleDragStart(e.clientY)}
        style={{
          display: 'flex',
          justifyContent: 'center',
          padding: '8px 0 4px',
          cursor: 'grab',
          flexShrink: 0,
          touchAction: 'none',
        }}
      >
        <div style={{ width: 32, height: 4, borderRadius: 2, background: '#ffffff20' }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {children}
      </div>
    </div>
  )
}
