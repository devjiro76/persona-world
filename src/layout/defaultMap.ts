import { TileType } from '../types'

const V = TileType.VOID
const G = TileType.GRASS
const S = TileType.STONE_PATH
const W = TileType.WOOD_FLOOR
const X = TileType.WALL
const C = TileType.CARPET
const D = TileType.SAND
const B = TileType.BRIDGE

// 48x36 village map with themed zones
// ┌─────────────────────────────────────────────────┐
// │  CAFE (NW)          road          LIBRARY (NE)  │
// │   3-9, 3-11     row 12-13       3-9, 35-43     │
// │                                                  │
// │ ─── ─── main east-west road ─── ─── ─── ───    │
// │                                                  │
// │     TOWN SQUARE         PARK & POND (E)         │
// │    16-24, 14-28       16-24, 36-46 (water)      │
// │                                                  │
// │ TRAINING (SW)    RESIDENTIAL (S)                 │
// │  27-33, 3-13     27-33, 20-32                   │
// └─────────────────────────────────────────────────┘

function createMap(): TileType[][] {
  // Start with all grass
  const map: TileType[][] = Array.from({ length: 36 }, () => Array(48).fill(G))

  // ── Helper functions ──
  function fill(r1: number, c1: number, r2: number, c2: number, t: TileType) {
    for (let r = r1; r <= r2; r++)
      for (let c = c1; c <= c2; c++)
        map[r][c] = t
  }

  function hLine(row: number, c1: number, c2: number, t: TileType) {
    for (let c = c1; c <= c2; c++) map[row][c] = t
  }

  function vLine(col: number, r1: number, r2: number, t: TileType) {
    for (let r = r1; r <= r2; r++) map[r][col] = t
  }

  // ══════════════════════════════════════════════════
  // Main roads (stone path network)
  // ══════════════════════════════════════════════════

  // East-west main road (rows 12-13)
  fill(12, 1, 13, 46, S)

  // North-south main road (cols 22-23)
  vLine(22, 1, 34, S)
  vLine(23, 1, 34, S)

  // Cafe access path (cols 7-8, rows 8-12)
  vLine(7, 9, 12, S)
  vLine(8, 9, 12, S)

  // Library access path (cols 39-40, rows 8-12)
  vLine(39, 9, 12, S)
  vLine(40, 9, 12, S)

  // Town square paths
  hLine(20, 14, 28, S) // cross path in town square
  vLine(21, 16, 24, S) // vertical in town square
  vLine(24, 16, 24, S)

  // Path to park (east)
  hLine(20, 28, 36, S)
  hLine(21, 28, 36, S)

  // Path to training ground (south-west)
  vLine(8, 13, 27, S)
  vLine(9, 13, 27, S)

  // Path to residential (south)
  vLine(26, 13, 27, S)
  vLine(27, 13, 27, S)

  // Residential internal paths
  hLine(30, 20, 32, S)

  // ══════════════════════════════════════════════════
  // Zone 1: CAFE (northwest) — rows 3-9, cols 3-11
  // ══════════════════════════════════════════════════

  // Building walls
  fill(3, 3, 3, 11, X)  // top wall
  fill(9, 3, 9, 11, X)  // bottom wall
  vLine(3, 3, 9, X)     // left wall
  vLine(11, 3, 9, X)    // right wall

  // Interior floor
  fill(4, 4, 8, 10, W)

  // Carpet runner down center
  fill(4, 7, 8, 7, C)

  // Door opening (bottom wall)
  map[9][7] = S
  map[9][8] = S

  // ══════════════════════════════════════════════════
  // Zone 2: LIBRARY (northeast) — rows 3-9, cols 35-43
  // ══════════════════════════════════════════════════

  // Building walls
  fill(3, 35, 3, 43, X) // top wall
  fill(9, 35, 9, 43, X) // bottom wall
  vLine(35, 3, 9, X)    // left wall
  vLine(43, 3, 9, X)    // right wall

  // Interior floor
  fill(4, 36, 8, 42, W)

  // Carpet reading area
  fill(5, 38, 7, 41, C)

  // Door opening
  map[9][39] = S
  map[9][40] = S

  // ══════════════════════════════════════════════════
  // Zone 3: TOWN SQUARE (center) — rows 16-24, cols 14-28
  // ══════════════════════════════════════════════════

  // Stone plaza center
  fill(17, 16, 23, 27, S)

  // ══════════════════════════════════════════════════
  // Zone 4: PARK & POND (east) — rows 15-25, cols 36-46
  // ══════════════════════════════════════════════════

  // Pond water
  fill(17, 39, 23, 45, V)
  // Rounded edges
  map[17][39] = G; map[17][45] = G
  map[23][39] = G; map[23][45] = G
  map[16][40] = V; map[16][41] = V; map[16][42] = V; map[16][43] = V; map[16][44] = V
  map[24][40] = V; map[24][41] = V; map[24][42] = V; map[24][43] = V; map[24][44] = V

  // Bridge across pond
  map[20][38] = B
  map[20][39] = B
  map[21][38] = B
  map[21][39] = B

  // ══════════════════════════════════════════════════
  // Zone 5: TRAINING GROUND (southwest) — rows 27-33, cols 3-13
  // ══════════════════════════════════════════════════

  // Sand floor
  fill(28, 4, 32, 12, D)

  // ══════════════════════════════════════════════════
  // Zone 6: RESIDENTIAL (south) — rows 27-33, cols 20-32
  // ══════════════════════════════════════════════════

  // House 1 (small)
  fill(28, 21, 28, 24, X)
  fill(31, 21, 31, 24, X)
  vLine(21, 28, 31, X)
  vLine(24, 28, 31, X)
  fill(29, 22, 30, 23, W)
  map[31][22] = S // door

  // House 2 (small)
  fill(28, 27, 28, 30, X)
  fill(31, 27, 31, 30, X)
  vLine(27, 28, 31, X)
  vLine(30, 28, 31, X)
  fill(29, 28, 30, 29, W)
  map[31][28] = S // door

  return map
}

export const DEFAULT_MAP = createMap()
export const MAP_COLS = DEFAULT_MAP[0].length // 48
export const MAP_ROWS = DEFAULT_MAP.length    // 36
