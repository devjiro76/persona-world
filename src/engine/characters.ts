import { CharacterState, Direction, TileType } from '../types'
import type { Character, Persona } from '../types'
import { findPath, getWalkableTiles, isWalkable } from './pathfinding'
import {
  TILE_SIZE,
  WALK_SPEED_PX_PER_SEC,
  WALK_FRAME_DURATION_SEC,
  WANDER_PAUSE_MIN_SEC,
  WANDER_PAUSE_MAX_SEC,
  REACT_DURATION_SEC,
} from '../constants'

function tileCenter(col: number, row: number) {
  return { x: col * TILE_SIZE + TILE_SIZE / 2, y: row * TILE_SIZE + TILE_SIZE / 2 }
}

function directionBetween(fromCol: number, fromRow: number, toCol: number, toRow: number): Direction {
  const dc = toCol - fromCol
  const dr = toRow - fromRow
  if (dc > 0) return Direction.RIGHT
  if (dc < 0) return Direction.LEFT
  if (dr > 0) return Direction.DOWN
  return Direction.UP
}

export function createCharacter(persona: Persona, col: number, row: number, spriteIndex: number): Character {
  const center = tileCenter(col, row)
  return {
    id: persona.persona_config_id,
    persona,
    state: CharacterState.IDLE,
    dir: Direction.DOWN,
    x: center.x,
    y: center.y,
    tileCol: col,
    tileRow: row,
    path: [],
    moveProgress: 0,
    spriteIndex,
    frame: 0,
    frameTimer: 0,
    wanderTimer: 2 + Math.random() * 5,
    reactTimer: 0,
    interactTarget: null,
    frozen: false,
    bubbleEmoji: '',
    bubbleTimer: 0,
    bubbleText: '',
    bubbleType: 'action' as const,
  }
}

export function updateCharacter(
  ch: Character,
  dt: number,
  tileMap: TileType[][],
  blockedTiles: Set<string>,
  characters: Map<string, Character>,
): void {
  // Handle bubble timer
  if (ch.bubbleTimer > 0) ch.bubbleTimer -= dt

  // Frozen: skip all state updates (waiting for action/reaction)
  if (ch.frozen) return

  ch.frameTimer += dt

  switch (ch.state) {
    case CharacterState.IDLE: {
      ch.frame = 0
      ch.wanderTimer -= dt
      if (ch.wanderTimer <= 0) {
        // Pick target tile — biased toward homeZone if set
        const walkable = getWalkableTiles(tileMap, blockedTiles)
        if (walkable.length > 0) {
          let target: { col: number; row: number }
          if (ch.homeZone && Math.random() < 0.7) {
            // 70% chance to wander within home zone
            const inZone = walkable.filter(t => {
              const dc = t.col - ch.homeZone!.col
              const dr = t.row - ch.homeZone!.row
              return Math.sqrt(dc * dc + dr * dr) <= ch.homeZone!.radius
            })
            target = inZone.length > 0
              ? inZone[Math.floor(Math.random() * inZone.length)]
              : walkable[Math.floor(Math.random() * walkable.length)]
          } else {
            target = walkable[Math.floor(Math.random() * walkable.length)]
          }
          const path = findPath(ch.tileCol, ch.tileRow, target.col, target.row, tileMap, blockedTiles)
          if (path.length > 0) {
            ch.path = path
            ch.moveProgress = 0
            ch.state = CharacterState.WALK
            ch.frame = 0
            ch.frameTimer = 0
          }
        }
        ch.wanderTimer = randomRange(WANDER_PAUSE_MIN_SEC, WANDER_PAUSE_MAX_SEC)
      }
      break
    }

    case CharacterState.WALK: {
      // Walk animation (4-frame cycle)
      if (ch.frameTimer >= WALK_FRAME_DURATION_SEC) {
        ch.frameTimer -= WALK_FRAME_DURATION_SEC
        ch.frame = (ch.frame + 1) % 4
      }

      if (ch.path.length === 0) {
        // Arrived -- transition to IDLE or INTERACT
        const center = tileCenter(ch.tileCol, ch.tileRow)
        ch.x = center.x
        ch.y = center.y
        if (ch.interactTarget) {
          ch.state = CharacterState.INTERACT
        } else {
          ch.state = CharacterState.IDLE
          ch.wanderTimer = randomRange(WANDER_PAUSE_MIN_SEC, WANDER_PAUSE_MAX_SEC)
        }
        ch.frame = 0
        ch.frameTimer = 0
        break
      }

      // Move toward next tile
      const nextTile = ch.path[0]
      ch.dir = directionBetween(ch.tileCol, ch.tileRow, nextTile.col, nextTile.row)

      // Speed multiplier from arousal
      const speedMult = getSpeedFromArousal(ch.persona.state?.emotion?.vad?.A ?? 0)
      ch.moveProgress += (WALK_SPEED_PX_PER_SEC * speedMult / TILE_SIZE) * dt

      const fromCenter = tileCenter(ch.tileCol, ch.tileRow)
      const toCenter = tileCenter(nextTile.col, nextTile.row)
      const t = Math.min(ch.moveProgress, 1)
      ch.x = fromCenter.x + (toCenter.x - fromCenter.x) * t
      ch.y = fromCenter.y + (toCenter.y - fromCenter.y) * t

      if (ch.moveProgress >= 1) {
        ch.tileCol = nextTile.col
        ch.tileRow = nextTile.row
        ch.x = toCenter.x
        ch.y = toCenter.y
        ch.path.shift()
        ch.moveProgress = 0
      }
      break
    }

    case CharacterState.INTERACT: {
      // Interaction is handled externally (API call)
      // Character faces the target and waits
      if (ch.interactTarget) {
        const target = characters.get(ch.interactTarget)
        if (target) {
          ch.dir = directionBetween(ch.tileCol, ch.tileRow, target.tileCol, target.tileRow)
        }
      }
      break
    }

    case CharacterState.REACT: {
      ch.reactTimer -= dt
      if (ch.reactTimer <= 0) {
        // Scatter away from interaction point to prevent clumping
        scatterToHome(ch, tileMap, blockedTiles)
        // scatterToHome sets WALK if path found; otherwise fall back to IDLE
        if ((ch.state as CharacterState) !== CharacterState.WALK) {
          ch.state = CharacterState.IDLE
          ch.wanderTimer = randomRange(WANDER_PAUSE_MIN_SEC, WANDER_PAUSE_MAX_SEC)
        }
        ch.frame = 0
        ch.frameTimer = 0
      }
      break
    }
  }
}

// Walk toward a specific character
export function walkToCharacter(
  ch: Character,
  targetId: string,
  tileMap: TileType[][],
  blockedTiles: Set<string>,
  characters: Map<string, Character>,
): boolean {
  const target = characters.get(targetId)
  if (!target) return false

  // Find adjacent tile to target
  const adjacent = getAdjacentWalkable(target.tileCol, target.tileRow, tileMap, blockedTiles)
  if (adjacent.length === 0) return false

  // Pick closest adjacent tile
  let best = adjacent[0]
  let bestDist = Infinity
  for (const a of adjacent) {
    const d = Math.abs(a.col - ch.tileCol) + Math.abs(a.row - ch.tileRow)
    if (d < bestDist) { bestDist = d; best = a }
  }

  const path = findPath(ch.tileCol, ch.tileRow, best.col, best.row, tileMap, blockedTiles)
  if (path.length === 0 && (ch.tileCol !== best.col || ch.tileRow !== best.row)) return false

  ch.path = path
  ch.moveProgress = 0
  ch.state = CharacterState.WALK
  ch.interactTarget = targetId
  ch.frame = 0
  ch.frameTimer = 0
  return true
}

function getAdjacentWalkable(
  col: number, row: number,
  tileMap: TileType[][],
  blockedTiles: Set<string>,
): Array<{ col: number; row: number }> {
  const dirs = [{ dc: 0, dr: -1 }, { dc: 0, dr: 1 }, { dc: -1, dr: 0 }, { dc: 1, dr: 0 }]
  const result: Array<{ col: number; row: number }> = []
  for (const d of dirs) {
    const nc = col + d.dc
    const nr = row + d.dr
    if (isWalkable(nc, nr, tileMap, blockedTiles)) {
      result.push({ col: nc, row: nr })
    }
  }
  return result
}

export function triggerReact(ch: Character, emoji: string, text: string): void {
  ch.state = CharacterState.REACT
  ch.reactTimer = REACT_DURATION_SEC
  ch.bubbleEmoji = emoji
  ch.bubbleText = text
  ch.bubbleTimer = 3
  ch.interactTarget = null
  ch.frame = 0
  ch.frameTimer = 0
}

export function finishInteract(ch: Character): void {
  ch.state = CharacterState.IDLE
  ch.interactTarget = null
  ch.wanderTimer = randomRange(WANDER_PAUSE_MIN_SEC, WANDER_PAUSE_MAX_SEC)
  ch.frame = 0
  ch.frameTimer = 0
}

/**
 * After react/interact, scatter the character to a random spot in their
 * home zone so they don't clump at the interaction point.
 */
export function scatterToHome(
  ch: Character,
  tileMap: TileType[][],
  blockedTiles: Set<string>,
): void {
  if (!ch.homeZone) return
  const walkable = getWalkableTiles(tileMap, blockedTiles)
  const inZone = walkable.filter(t => {
    const dc = t.col - ch.homeZone!.col
    const dr = t.row - ch.homeZone!.row
    return Math.sqrt(dc * dc + dr * dr) <= ch.homeZone!.radius
  })
  if (inZone.length === 0) return

  const target = inZone[Math.floor(Math.random() * inZone.length)]
  const path = findPath(ch.tileCol, ch.tileRow, target.col, target.row, tileMap, blockedTiles)
  if (path.length > 0) {
    ch.path = path
    ch.moveProgress = 0
    ch.state = CharacterState.WALK
    ch.interactTarget = null
    ch.frame = 0
    ch.frameTimer = 0
  }
}

function getSpeedFromArousal(arousal: number): number {
  if (arousal > 0.5) return 1.5
  if (arousal < -0.3) return 0.7
  return 1.0
}

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}
