import { TILE_SIZE } from '../constants'
import type { FurnitureInstance, SpriteSource } from '../types'

// Furniture sprite definitions — source rectangles from tileset images
const SPRITES = {
  TABLE:     { tileset: 'TilesetElement', sx: 48,  sy: 16,  sw: 16, sh: 16 } satisfies SpriteSource,
  CHAIR:     { tileset: 'TilesetElement', sx: 64,  sy: 16,  sw: 16, sh: 16 } satisfies SpriteSource,
  TREE:      { tileset: 'TilesetNature',  sx: 80,  sy: 64,  sw: 16, sh: 32 } satisfies SpriteSource,
  BENCH:     { tileset: 'TilesetElement', sx: 0,   sy: 96,  sw: 32, sh: 16 } satisfies SpriteSource,
  FLOWER:    { tileset: 'TilesetNature',  sx: 80,  sy: 176, sw: 16, sh: 16 } satisfies SpriteSource,
  LAMP_POST: { tileset: 'TilesetElement', sx: 48,  sy: 160, sw: 16, sh: 16 } satisfies SpriteSource,
}

function placeFurniture(
  sprite: SpriteSource,
  col: number,
  row: number,
  tileW = 1,
  tileH = 1,
  blocksWalk = true,
): FurnitureInstance {
  return {
    sprite,
    x: col * TILE_SIZE,
    y: row * TILE_SIZE,
    zY: (row + tileH) * TILE_SIZE,
    tileCol: col,
    tileRow: row,
    tileW,
    tileH,
    blocksWalk,
  }
}

export const FURNITURE: FurnitureInstance[] = [
  // ── Top-left cafe (rows 2-6, cols 2-7) ──
  placeFurniture(SPRITES.TABLE, 3, 3),
  placeFurniture(SPRITES.CHAIR, 3, 4, 1, 1, false),
  placeFurniture(SPRITES.TABLE, 6, 3),
  placeFurniture(SPRITES.CHAIR, 6, 4, 1, 1, false),

  // ── Bottom-right shop (rows 18-20, cols 19-23) ──
  placeFurniture(SPRITES.TABLE, 20, 19),
  placeFurniture(SPRITES.CHAIR, 20, 20, 1, 1, false),
  placeFurniture(SPRITES.TABLE, 22, 19),

  // ── Trees — scattered around map ──
  placeFurniture(SPRITES.TREE, 0, 0, 1, 2),
  placeFurniture(SPRITES.TREE, 12, 1, 1, 2),
  placeFurniture(SPRITES.TREE, 28, 0, 1, 2),
  placeFurniture(SPRITES.TREE, 0, 12, 1, 2),
  placeFurniture(SPRITES.TREE, 10, 6, 1, 2),
  placeFurniture(SPRITES.TREE, 30, 8, 1, 2),
  placeFurniture(SPRITES.TREE, 8, 18, 1, 2),
  placeFurniture(SPRITES.TREE, 15, 20, 1, 2),
  placeFurniture(SPRITES.TREE, 30, 18, 1, 2),

  // ── Benches ──
  placeFurniture(SPRITES.BENCH, 7, 11, 1, 1),
  placeFurniture(SPRITES.BENCH, 18, 8, 1, 1),
  placeFurniture(SPRITES.BENCH, 25, 14, 1, 1),

  // ── Flowers (decorative) ──
  placeFurniture(SPRITES.FLOWER, 2, 9, 1, 1, false),
  placeFurniture(SPRITES.FLOWER, 7, 14, 1, 1, false),
  placeFurniture(SPRITES.FLOWER, 12, 12, 1, 1, false),
  placeFurniture(SPRITES.FLOWER, 20, 2, 1, 1, false),
  placeFurniture(SPRITES.FLOWER, 26, 10, 1, 1, false),
  placeFurniture(SPRITES.FLOWER, 10, 22, 1, 1, false),
  placeFurniture(SPRITES.FLOWER, 16, 16, 1, 1, false),
  placeFurniture(SPRITES.FLOWER, 3, 22, 1, 1, false),

  // ── Lamp posts ──
  placeFurniture(SPRITES.LAMP_POST, 6, 8),
  placeFurniture(SPRITES.LAMP_POST, 14, 7),
  placeFurniture(SPRITES.LAMP_POST, 22, 10),
  placeFurniture(SPRITES.LAMP_POST, 4, 17),
  placeFurniture(SPRITES.LAMP_POST, 29, 14),
]

export function getBlockedTiles(): Set<string> {
  const blocked = new Set<string>()
  for (const f of FURNITURE) {
    if (!f.blocksWalk) continue
    for (let r = 0; r < f.tileH; r++) {
      for (let c = 0; c < f.tileW; c++) {
        blocked.add(`${f.tileCol + c},${f.tileRow + r}`)
      }
    }
  }
  return blocked
}
