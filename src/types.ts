// Tile types for the map
export enum TileType {
  VOID = 0,
  GRASS = 1,
  STONE_PATH = 2,
  WOOD_FLOOR = 3,
  WALL = 4,
  CARPET = 5,
}

export enum Direction {
  DOWN = 0,
  UP = 1,
  RIGHT = 2,
  LEFT = 3,
}

export enum CharacterState {
  IDLE = 'idle',
  WALK = 'walk',
  INTERACT = 'interact',
  REACT = 'react',
}

export interface VAD {
  V: number
  A: number
  D: number
}

export interface EmotionState {
  vad: VAD
  discrete: {
    primary: string
    secondary?: string
    intensity: number
  }
}

export interface PersonaConfig {
  identity: { name: string; role?: string }
  personality: { O: number; C: number; E: number; A: number; N: number; H: number }
}

export interface PersonaState {
  emotion?: EmotionState
  mood?: { vad: VAD }
  somatic?: string[]
}

export interface Persona {
  persona_config_id: string
  display_name?: string
  config: PersonaConfig
  state: PersonaState
}

export interface Character {
  id: string // persona_config_id
  persona: Persona
  state: CharacterState
  dir: Direction
  x: number
  y: number
  tileCol: number
  tileRow: number
  path: Array<{ col: number; row: number }>
  moveProgress: number
  spriteIndex: number
  frame: number
  frameTimer: number
  wanderTimer: number
  reactTimer: number
  // Interaction
  interactTarget: string | null
  frozen: boolean
  // Bubble
  bubbleEmoji: string
  bubbleTimer: number
  bubbleText: string
}

/** Source rectangle in a tileset image */
export interface SpriteSource {
  tileset: string // key in assets.tiles
  sx: number
  sy: number
  sw: number
  sh: number
}

export interface FurnitureInstance {
  sprite: SpriteSource
  x: number // pixel x
  y: number // pixel y
  zY: number // sort key
  tileCol: number
  tileRow: number
  tileW: number
  tileH: number
  blocksWalk: boolean
}

export interface ActionDef {
  name: string
  cls: 'p' | 'n' | 'm'
  label: string
}

export interface LogEntry {
  time: string
  from: string
  action: string
  target: string
  emotion: string
  emoji: string
  auto: boolean
}
