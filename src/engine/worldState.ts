import type { Character, Persona, FurnitureInstance } from '../types'
import { TileType } from '../types'
import { createCharacter } from './characters'
import { getWalkableTiles } from './pathfinding'
import { DEFAULT_MAP, MAP_COLS, MAP_ROWS } from '../layout/defaultMap'
import { FURNITURE, getBlockedTiles } from '../layout/furniture'

export interface WorldState {
  characters: Map<string, Character>
  personas: Persona[]
  furniture: FurnitureInstance[]
  tileMap: TileType[][]
  blockedTiles: Set<string>
  selectedId: string | null
}

export function createWorldState(): WorldState {
  return {
    characters: new Map(),
    personas: [],
    furniture: [...FURNITURE],
    tileMap: DEFAULT_MAP,
    blockedTiles: getBlockedTiles(),
    selectedId: null,
  }
}

export function initCharacters(world: WorldState, personas: Persona[]): void {
  world.personas = personas
  world.characters.clear()
  const walkable = getWalkableTiles(world.tileMap, world.blockedTiles)

  personas.forEach((p, i) => {
    // Distribute characters across walkable tiles
    const tileIdx = Math.floor((i / personas.length) * walkable.length)
    const tile = walkable[Math.min(tileIdx, walkable.length - 1)]
    const ch = createCharacter(p, tile.col, tile.row, i)
    world.characters.set(p.persona_config_id, ch)
  })
}

export function updatePersonaState(world: WorldState, personaId: string, state: Persona['state']): void {
  const persona = world.personas.find(p => p.persona_config_id === personaId)
  if (persona) persona.state = state
  const ch = world.characters.get(personaId)
  if (ch) ch.persona = persona!
}
