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

// Zone definitions: name, center tile, radius
const ZONES = [
  { name: 'cafe',     col: 7,  row: 6,  radius: 5 },
  { name: 'library',  col: 39, row: 6,  radius: 5 },
  { name: 'square',   col: 22, row: 20, radius: 7 },
  { name: 'park',     col: 40, row: 20, radius: 6 },
  { name: 'training', col: 8,  row: 30, radius: 5 },
  { name: 'residential', col: 26, row: 30, radius: 5 },
]

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
    // Assign each persona to a zone (round-robin)
    const zone = ZONES[i % ZONES.length]

    // Find walkable tiles within the zone
    const zoneTiles = walkable.filter(t => {
      const dc = t.col - zone.col
      const dr = t.row - zone.row
      return Math.sqrt(dc * dc + dr * dr) <= zone.radius
    })

    // Pick starting tile within zone (or fallback to distributed)
    const tile = zoneTiles.length > 0
      ? zoneTiles[Math.floor(Math.random() * zoneTiles.length)]
      : walkable[Math.min(Math.floor((i / personas.length) * walkable.length), walkable.length - 1)]

    const ch = createCharacter(p, tile.col, tile.row, i)
    ch.homeZone = { col: zone.col, row: zone.row, radius: zone.radius }
    world.characters.set(p.persona_config_id, ch)
  })
}

export function updatePersonaState(world: WorldState, personaId: string, state: Persona['state']): void {
  const persona = world.personas.find(p => p.persona_config_id === personaId)
  if (persona) persona.state = state
  const ch = world.characters.get(personaId)
  if (ch) ch.persona = persona!
}
