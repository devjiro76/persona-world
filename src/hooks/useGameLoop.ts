import { useEffect, useRef } from 'react'
import { startGameLoop, type GameLoopCallbacks } from '../engine/gameLoop'

export function useGameLoop(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  callbacks: GameLoopCallbacks,
): void {
  const callbacksRef = useRef(callbacks)
  callbacksRef.current = callbacks

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const stop = startGameLoop(canvas, {
      update: (dt) => callbacksRef.current.update(dt),
      render: (ctx) => callbacksRef.current.render(ctx),
    })

    return stop
  }, [canvasRef])
}
