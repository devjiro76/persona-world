export const TILE_SIZE = 16
export const WALK_SPEED_PX_PER_SEC = 48
export const WALK_FRAME_DURATION_SEC = 0.15
export const IDLE_FRAME_DURATION_SEC = 0.5
export const MAX_DELTA_TIME_SEC = 0.1

// Wander timers
export const WANDER_PAUSE_MIN_SEC = 1
export const WANDER_PAUSE_MAX_SEC = 6
export const REACT_DURATION_SEC = 1.5

// Speech bubble
export const BUBBLE_DURATION_SEC = 3
export const BUBBLE_VERTICAL_OFFSET_PX = 26

// Mini VAD bar
export const MINIBAR_WIDTH = 14
export const MINIBAR_HEIGHT = 2
export const MINIBAR_GAP = 1
export const MINIBAR_OFFSET_Y = 4

// Colors (matching existing viz dark theme)
export const COLORS = {
  bg: '#08080d',
  surface: '#10101a',
  card: '#161622',
  cardHover: '#1c1c2e',
  border: '#252538',
  text: '#e4e4ee',
  dim: '#7a7a96',
  muted: '#55556a',
  accent: '#e94560',
  accent2: '#ff6b81',
  pos: '#34d399',
  neg: '#f87171',
  warn: '#fbbf24',
  blue: '#60a5fa',
} as const
