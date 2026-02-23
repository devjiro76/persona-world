import { TILE_SIZE } from '../constants'
import type { FurnitureInstance, SpriteSource } from '../types'

// ── Sprite definitions — source rectangles from tileset images ──
// Coordinates verified against Ninja Adventure tileset PNGs (16×16 grid)

const SPRITES = {
  // TilesetElement (256×240) — indoor items
  TABLE:        { tileset: 'TilesetElement', sx: 48,  sy: 16,  sw: 16, sh: 16 } satisfies SpriteSource,
  CHAIR:        { tileset: 'TilesetElement', sx: 64,  sy: 16,  sw: 16, sh: 16 } satisfies SpriteSource,
  BENCH:        { tileset: 'TilesetElement', sx: 0,   sy: 96,  sw: 32, sh: 16 } satisfies SpriteSource,
  BOOKSHELF:    { tileset: 'TilesetElement', sx: 0,   sy: 128, sw: 32, sh: 16 } satisfies SpriteSource,
  BARREL:       { tileset: 'TilesetElement', sx: 0,   sy: 0,   sw: 16, sh: 16 } satisfies SpriteSource,
  CRATE:        { tileset: 'TilesetElement', sx: 96,  sy: 0,   sw: 16, sh: 16 } satisfies SpriteSource,

  // TilesetNature (384×336) — trees are 32×48 (2 wide, 3 tall)
  TREE:         { tileset: 'TilesetNature',  sx: 256, sy: 0,   sw: 32, sh: 48 } satisfies SpriteSource,
  TREE_BIG:     { tileset: 'TilesetNature',  sx: 0,   sy: 0,   sw: 32, sh: 48 } satisfies SpriteSource,
  TREE_CHERRY:  { tileset: 'TilesetNature',  sx: 224, sy: 0,   sw: 32, sh: 48 } satisfies SpriteSource,
  TREE_DARK:    { tileset: 'TilesetNature',  sx: 32,  sy: 0,   sw: 32, sh: 48 } satisfies SpriteSource,
  TREE_SNOW:    { tileset: 'TilesetNature',  sx: 128, sy: 0,   sw: 32, sh: 48 } satisfies SpriteSource,
  BUSH:         { tileset: 'TilesetNature',  sx: 0,   sy: 160, sw: 16, sh: 16 } satisfies SpriteSource,
  BUSH_FLOWER:  { tileset: 'TilesetNature',  sx: 16,  sy: 160, sw: 16, sh: 16 } satisfies SpriteSource,
  FLOWER:       { tileset: 'TilesetNature',  sx: 80,  sy: 176, sw: 16, sh: 16 } satisfies SpriteSource,
  FLOWER2:      { tileset: 'TilesetNature',  sx: 96,  sy: 176, sw: 16, sh: 16 } satisfies SpriteSource,
  ROCK_BIG:     { tileset: 'TilesetNature',  sx: 272, sy: 160, sw: 32, sh: 16 } satisfies SpriteSource,
  ROCK_SMALL:   { tileset: 'TilesetNature',  sx: 256, sy: 160, sw: 16, sh: 16 } satisfies SpriteSource,
  MUSHROOM:     { tileset: 'TilesetNature',  sx: 64,  sy: 128, sw: 16, sh: 16 } satisfies SpriteSource,
  STUMP:        { tileset: 'TilesetNature',  sx: 0,   sy: 128, sw: 16, sh: 16 } satisfies SpriteSource,

  // TilesetHouse (528×368) — buildings are 64×48 (4 wide, 3 tall)
  HOUSE_SMALL:  { tileset: 'TilesetHouse', sx: 0,   sy: 0,   sw: 64, sh: 48 } satisfies SpriteSource,
  HOUSE_RED:    { tileset: 'TilesetHouse', sx: 192, sy: 0,   sw: 64, sh: 48 } satisfies SpriteSource,
  HOUSE_SHOP:   { tileset: 'TilesetHouse', sx: 128, sy: 0,   sw: 64, sh: 48 } satisfies SpriteSource,
  HOUSE_DARK:   { tileset: 'TilesetHouse', sx: 64,  sy: 0,   sw: 64, sh: 48 } satisfies SpriteSource,
  FENCE_H:      { tileset: 'TilesetHouse', sx: 160, sy: 80,  sw: 16, sh: 16 } satisfies SpriteSource,
  FENCE_V:      { tileset: 'TilesetHouse', sx: 208, sy: 80,  sw: 16, sh: 16 } satisfies SpriteSource,
  JIZO:         { tileset: 'TilesetHouse', sx: 48,  sy: 240, sw: 32, sh: 32 } satisfies SpriteSource,
  JIZO_SMALL:   { tileset: 'TilesetHouse', sx: 16,  sy: 240, sw: 32, sh: 32 } satisfies SpriteSource,
  ARCH:         { tileset: 'TilesetHouse', sx: 464, sy: 320, sw: 48, sh: 48 } satisfies SpriteSource,
  SIGN:         { tileset: 'TilesetHouse', sx: 64,  sy: 64,  sw: 32, sh: 16 } satisfies SpriteSource,
}

function place(
  sprite: SpriteSource,
  col: number,
  row: number,
  tileW = Math.ceil(sprite.sw / TILE_SIZE),
  tileH = Math.ceil(sprite.sh / TILE_SIZE),
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
  // ══════════════════════════════════════════════════
  // Zone 1: CAFE (NW) — rows 3-9, cols 3-11
  // ══════════════════════════════════════════════════

  // Indoor tables & chairs
  place(SPRITES.TABLE, 5, 5),
  place(SPRITES.CHAIR, 5, 6, 1, 1, false),
  place(SPRITES.TABLE, 9, 5),
  place(SPRITES.CHAIR, 9, 6, 1, 1, false),
  place(SPRITES.TABLE, 5, 7),
  place(SPRITES.CHAIR, 5, 8, 1, 1, false),
  place(SPRITES.TABLE, 9, 7),
  place(SPRITES.CHAIR, 9, 8, 1, 1, false),

  // Outdoor cafe terrace
  place(SPRITES.TABLE, 13, 5),
  place(SPRITES.CHAIR, 13, 6, 1, 1, false),
  place(SPRITES.TABLE, 15, 5),
  place(SPRITES.CHAIR, 15, 6, 1, 1, false),
  place(SPRITES.BENCH, 13, 8, 2, 1),

  // Cafe sign
  place(SPRITES.SIGN, 7, 2, 2, 1, false),

  // ══════════════════════════════════════════════════
  // Zone 2: LIBRARY (NE) — rows 3-9, cols 35-43
  // ══════════════════════════════════════════════════

  // Bookshelves along walls
  place(SPRITES.BOOKSHELF, 36, 4, 2, 1),
  place(SPRITES.BOOKSHELF, 36, 5, 2, 1),
  place(SPRITES.BOOKSHELF, 41, 4, 2, 1),
  place(SPRITES.BOOKSHELF, 41, 5, 2, 1),

  // Reading tables
  place(SPRITES.TABLE, 38, 6),
  place(SPRITES.CHAIR, 39, 6, 1, 1, false),
  place(SPRITES.TABLE, 38, 8),
  place(SPRITES.CHAIR, 39, 8, 1, 1, false),

  // Quiet garden outside library
  place(SPRITES.BARREL, 37, 10),
  place(SPRITES.BARREL, 42, 10),
  place(SPRITES.BENCH, 39, 11, 2, 1),
  place(SPRITES.BUSH_FLOWER, 36, 11, 1, 1, false),
  place(SPRITES.BUSH_FLOWER, 43, 11, 1, 1, false),

  // ══════════════════════════════════════════════════
  // Zone 3: TOWN SQUARE (center) — rows 16-24, cols 14-28
  // ══════════════════════════════════════════════════

  // Jizo fountain at center (replaces well — this tileset is ninja-themed)
  place(SPRITES.JIZO, 22, 19, 2, 2),

  // Barrel clusters (replaces market stalls — no stall sprite in this tileset)
  place(SPRITES.BARREL, 15, 17),
  place(SPRITES.CRATE, 16, 17),
  place(SPRITES.BARREL, 17, 17),
  place(SPRITES.BARREL, 15, 22),
  place(SPRITES.CRATE, 16, 22),
  place(SPRITES.BARREL, 17, 22),
  place(SPRITES.BARREL, 25, 17),
  place(SPRITES.CRATE, 26, 17),
  place(SPRITES.BARREL, 27, 17),

  // More barrels/crates
  place(SPRITES.BARREL, 18, 17),
  place(SPRITES.BARREL, 18, 22),
  place(SPRITES.CRATE, 25, 19),
  place(SPRITES.BARREL, 28, 17),
  place(SPRITES.CRATE, 28, 18),

  // Benches around square
  place(SPRITES.BENCH, 16, 20, 2, 1),
  place(SPRITES.BENCH, 26, 20, 2, 1),
  place(SPRITES.BENCH, 20, 24, 2, 1),

  // Fence posts at corners of the square (replaces lanterns)
  place(SPRITES.FENCE_V, 14, 16),
  place(SPRITES.FENCE_V, 28, 16),
  place(SPRITES.FENCE_V, 14, 23),
  place(SPRITES.FENCE_V, 28, 23),

  // Stone arch at town square entrance
  place(SPRITES.ARCH, 20, 15, 3, 3),

  // ══════════════════════════════════════════════════
  // Zone 4: PARK & POND (east) — rows 15-25, cols 36-46
  // ══════════════════════════════════════════════════

  // Cherry blossom trees around pond (now 32×48 = 2×3 tiles)
  place(SPRITES.TREE_CHERRY, 36, 14, 2, 3),
  place(SPRITES.TREE_CHERRY, 44, 14, 2, 3),
  place(SPRITES.TREE_CHERRY, 36, 23, 2, 3),
  place(SPRITES.TREE_CHERRY, 44, 23, 2, 3),
  place(SPRITES.TREE_CHERRY, 38, 25, 2, 3),

  // Benches near water
  place(SPRITES.BENCH, 36, 20, 2, 1),
  place(SPRITES.BENCH, 36, 22, 2, 1),

  // Flowers along pond edge
  place(SPRITES.FLOWER, 38, 16, 1, 1, false),
  place(SPRITES.FLOWER2, 40, 16, 1, 1, false),
  place(SPRITES.FLOWER, 42, 16, 1, 1, false),
  place(SPRITES.FLOWER2, 44, 16, 1, 1, false),
  place(SPRITES.FLOWER, 38, 25, 1, 1, false),
  place(SPRITES.FLOWER2, 42, 25, 1, 1, false),

  // Rocks near pond
  place(SPRITES.ROCK_SMALL, 46, 18, 1, 1),
  place(SPRITES.ROCK_SMALL, 46, 22, 1, 1),

  // ══════════════════════════════════════════════════
  // Zone 5: TRAINING GROUND (SW) — rows 27-33, cols 3-13
  // ══════════════════════════════════════════════════

  // Fence perimeter
  place(SPRITES.FENCE_H, 4, 27),
  place(SPRITES.FENCE_H, 5, 27),
  place(SPRITES.FENCE_H, 6, 27),
  place(SPRITES.FENCE_H, 7, 27),
  place(SPRITES.FENCE_H, 10, 27),
  place(SPRITES.FENCE_H, 11, 27),
  place(SPRITES.FENCE_H, 12, 27),
  place(SPRITES.FENCE_H, 4, 33),
  place(SPRITES.FENCE_H, 5, 33),
  place(SPRITES.FENCE_H, 6, 33),
  place(SPRITES.FENCE_H, 7, 33),
  place(SPRITES.FENCE_H, 8, 33),
  place(SPRITES.FENCE_H, 9, 33),
  place(SPRITES.FENCE_H, 10, 33),
  place(SPRITES.FENCE_H, 11, 33),
  place(SPRITES.FENCE_H, 12, 33),
  place(SPRITES.FENCE_V, 3, 28),
  place(SPRITES.FENCE_V, 3, 29),
  place(SPRITES.FENCE_V, 3, 30),
  place(SPRITES.FENCE_V, 3, 31),
  place(SPRITES.FENCE_V, 3, 32),
  place(SPRITES.FENCE_V, 13, 28),
  place(SPRITES.FENCE_V, 13, 29),
  place(SPRITES.FENCE_V, 13, 30),
  place(SPRITES.FENCE_V, 13, 31),
  place(SPRITES.FENCE_V, 13, 32),

  // Training props
  place(SPRITES.BARREL, 6, 29),
  place(SPRITES.BARREL, 10, 29),
  place(SPRITES.CRATE, 6, 31),
  place(SPRITES.CRATE, 10, 31),
  place(SPRITES.STUMP, 8, 30),

  // ══════════════════════════════════════════════════
  // Zone 6: RESIDENTIAL (south) — rows 27-33, cols 20-32
  // ══════════════════════════════════════════════════

  // Flowers in residential gardens
  place(SPRITES.FLOWER, 25, 28, 1, 1, false),
  place(SPRITES.FLOWER2, 25, 29, 1, 1, false),
  place(SPRITES.FLOWER, 26, 28, 1, 1, false),
  place(SPRITES.FLOWER2, 26, 29, 1, 1, false),
  place(SPRITES.FLOWER, 31, 29, 1, 1, false),
  place(SPRITES.FLOWER2, 32, 29, 1, 1, false),

  // Jizo statues along residential path (replaces lanterns)
  place(SPRITES.JIZO_SMALL, 20, 29, 2, 2),
  place(SPRITES.JIZO_SMALL, 33, 29, 2, 2),

  // Benches
  place(SPRITES.BENCH, 23, 33, 2, 1),
  place(SPRITES.BENCH, 29, 33, 2, 1),

  // ══════════════════════════════════════════════════
  // Scattered environment — trees, rocks, flowers along roads
  // ══════════════════════════════════════════════════

  // Large trees along map edges (32×48 = 2×3 tiles)
  place(SPRITES.TREE_BIG, 0, 0, 2, 3),
  place(SPRITES.TREE_BIG, 0, 5, 2, 3),
  place(SPRITES.TREE_BIG, 0, 14, 2, 3),
  place(SPRITES.TREE_BIG, 0, 24, 2, 3),
  place(SPRITES.TREE_BIG, 0, 33, 2, 3),
  place(SPRITES.TREE_BIG, 46, 0, 2, 3),
  place(SPRITES.TREE_BIG, 46, 5, 2, 3),
  place(SPRITES.TREE_BIG, 46, 28, 2, 3),
  place(SPRITES.TREE_BIG, 46, 33, 2, 3),

  // Trees between zones (32×48 = 2×3 tiles)
  place(SPRITES.TREE, 17, 1, 2, 3),
  place(SPRITES.TREE, 20, 0, 2, 3),
  place(SPRITES.TREE, 25, 1, 2, 3),
  place(SPRITES.TREE, 28, 0, 2, 3),
  place(SPRITES.TREE, 31, 1, 2, 3),

  // Dark trees near library
  place(SPRITES.TREE_DARK, 34, 0, 2, 3),
  place(SPRITES.TREE_DARK, 44, 1, 2, 3),

  // Trees south of main road
  place(SPRITES.TREE, 2, 14, 2, 3),
  place(SPRITES.TREE, 12, 14, 2, 3),
  place(SPRITES.TREE, 30, 14, 2, 3),
  place(SPRITES.TREE, 34, 14, 2, 3),

  // Snow/birch trees (decorative, rare)
  place(SPRITES.TREE_SNOW, 44, 9, 2, 3),

  // Small trees near training ground
  place(SPRITES.TREE, 1, 27, 2, 3),
  place(SPRITES.TREE, 15, 29, 2, 3),

  // Bushes scattered
  place(SPRITES.BUSH, 13, 2, 1, 1, false),
  place(SPRITES.BUSH, 16, 10, 1, 1, false),
  place(SPRITES.BUSH, 32, 4, 1, 1, false),
  place(SPRITES.BUSH, 33, 10, 1, 1, false),
  place(SPRITES.BUSH, 2, 20, 1, 1, false),
  place(SPRITES.BUSH, 11, 25, 1, 1, false),
  place(SPRITES.BUSH, 35, 27, 1, 1, false),

  // Rocks along paths (32×16 = 2×1 tile)
  place(SPRITES.ROCK_BIG, 30, 6, 2, 1),
  place(SPRITES.ROCK_SMALL, 17, 26, 1, 1),
  place(SPRITES.ROCK_SMALL, 45, 13, 1, 1),

  // Mushrooms (decorative, near trees)
  place(SPRITES.MUSHROOM, 3, 16, 1, 1, false),
  place(SPRITES.MUSHROOM, 19, 3, 1, 1, false),
  place(SPRITES.MUSHROOM, 33, 26, 1, 1, false),

  // Flowers along main roads
  place(SPRITES.FLOWER, 10, 11, 1, 1, false),
  place(SPRITES.FLOWER2, 15, 11, 1, 1, false),
  place(SPRITES.FLOWER, 26, 11, 1, 1, false),
  place(SPRITES.FLOWER2, 32, 11, 1, 1, false),
  place(SPRITES.FLOWER, 37, 11, 1, 1, false),
  place(SPRITES.FLOWER, 10, 14, 1, 1, false),
  place(SPRITES.FLOWER2, 34, 26, 1, 1, false),

  // Fence posts along roads (replaces lanterns — no lantern sprite in tileset)
  place(SPRITES.FENCE_V, 5, 11),
  place(SPRITES.FENCE_V, 18, 11),
  place(SPRITES.FENCE_V, 30, 11),
  place(SPRITES.FENCE_V, 42, 11),
  place(SPRITES.FENCE_V, 8, 25),
  place(SPRITES.FENCE_V, 22, 26),
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
