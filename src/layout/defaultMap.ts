import { TileType } from '../types'

const V = TileType.VOID
const G = TileType.GRASS
const S = TileType.STONE_PATH
const W = TileType.WOOD_FLOOR
const X = TileType.WALL
const C = TileType.CARPET

// 32x24 village map
// Top-left: cafe building
// Top-right: park with pond area (void = water)
// Center: stone path network
// Bottom-left: garden
// Bottom-right: open grass area with paths

export const DEFAULT_MAP: TileType[][] = [
  //0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30 31
  [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G], // 0
  [G, X, X, X, X, X, X, X, X, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G], // 1
  [G, X, W, W, C, C, W, W, X, G, G, G, G, G, G, G, G, G, G, G, G, G, G, V, V, V, V, G, G, G, G, G], // 2
  [G, X, W, W, C, C, W, W, X, G, G, G, G, G, G, G, G, G, G, G, G, G, V, V, V, V, V, V, G, G, G, G], // 3
  [G, X, W, W, C, C, W, W, X, G, G, G, G, G, G, G, G, G, G, G, G, V, V, V, V, V, V, V, V, G, G, G], // 4
  [G, X, W, W, C, C, W, W, X, G, G, G, G, G, G, G, G, G, G, G, G, V, V, V, V, V, V, V, V, G, G, G], // 5
  [G, X, W, W, W, W, W, W, X, G, G, G, G, G, G, G, G, G, G, G, G, G, V, V, V, V, V, V, G, G, G, G], // 6
  [G, X, X, X, S, S, X, X, X, G, G, G, G, G, S, S, G, G, G, G, G, G, G, V, V, V, V, G, G, G, G, G], // 7
  [G, G, G, G, S, S, G, G, G, G, G, G, G, G, S, S, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G], // 8
  [G, G, G, G, S, S, G, G, G, G, G, G, G, G, S, S, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G], // 9
  [G, G, G, G, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, S, G, G, G, G, G, G, G, G, G], // 10
  [G, G, G, G, S, S, G, G, G, G, G, G, G, G, S, S, G, G, G, G, G, G, S, G, G, G, G, G, G, G, G, G], // 11
  [G, G, G, G, S, S, G, G, G, G, G, G, G, G, S, S, G, G, G, G, G, G, S, G, G, G, G, G, G, G, G, G], // 12
  [G, G, G, G, S, S, G, G, G, G, G, G, G, G, S, S, G, G, G, G, G, G, S, G, G, G, G, G, G, G, G, G], // 13
  [G, G, G, G, S, S, G, G, G, G, G, G, G, G, S, S, G, G, G, G, G, G, S, S, S, S, S, S, S, S, G, G], // 14
  [G, G, G, G, S, S, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, S, G, G], // 15
  [G, G, G, G, S, S, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, S, G, G], // 16
  [S, S, S, S, S, S, G, G, G, G, G, G, G, G, G, G, G, G, X, X, X, X, X, X, X, G, G, G, G, S, G, G], // 17
  [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, X, W, W, W, W, W, X, G, G, G, G, S, G, G], // 18
  [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, X, W, W, C, W, W, X, G, G, G, G, S, G, G], // 19
  [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, X, W, W, C, W, W, X, G, G, G, G, S, G, G], // 20
  [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, X, X, X, S, X, X, X, G, G, G, G, S, G, G], // 21
  [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, S, S, S, S, S, S, S, S, S, G, G], // 22
  [G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G, G], // 23
]

export const MAP_COLS = DEFAULT_MAP[0].length
export const MAP_ROWS = DEFAULT_MAP.length
