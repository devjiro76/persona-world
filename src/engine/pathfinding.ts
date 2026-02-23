import { TileType } from '../types'

export function isWalkable(
  col: number, row: number,
  tileMap: TileType[][],
  blockedTiles: Set<string>,
): boolean {
  const rows = tileMap.length
  const cols = rows > 0 ? tileMap[0].length : 0
  if (row < 0 || row >= rows || col < 0 || col >= cols) return false
  const t = tileMap[row][col]
  if (t === TileType.VOID || t === TileType.WALL) return false
  // SAND and BRIDGE are walkable (handled by default fall-through)
  if (blockedTiles.has(`${col},${row}`)) return false
  return true
}

export function getWalkableTiles(
  tileMap: TileType[][],
  blockedTiles: Set<string>,
): Array<{ col: number; row: number }> {
  const result: Array<{ col: number; row: number }> = []
  for (let r = 0; r < tileMap.length; r++) {
    for (let c = 0; c < (tileMap[r]?.length ?? 0); c++) {
      if (isWalkable(c, r, tileMap, blockedTiles)) {
        result.push({ col: c, row: r })
      }
    }
  }
  return result
}

const DIRS = [
  { dc: 0, dr: -1 }, // up
  { dc: 0, dr: 1 },  // down
  { dc: -1, dr: 0 }, // left
  { dc: 1, dr: 0 },  // right
]

export function findPath(
  startCol: number, startRow: number,
  endCol: number, endRow: number,
  tileMap: TileType[][],
  blockedTiles: Set<string>,
): Array<{ col: number; row: number }> {
  if (startCol === endCol && startRow === endRow) return []
  if (!isWalkable(endCol, endRow, tileMap, blockedTiles)) return []

  const key = (c: number, r: number) => `${c},${r}`
  const visited = new Set<string>()
  const parent = new Map<string, { col: number; row: number } | null>()

  const startKey = key(startCol, startRow)
  visited.add(startKey)
  parent.set(startKey, null)

  const queue: Array<{ col: number; row: number }> = [{ col: startCol, row: startRow }]
  let found = false

  while (queue.length > 0) {
    const cur = queue.shift()!
    if (cur.col === endCol && cur.row === endRow) {
      found = true
      break
    }

    for (const d of DIRS) {
      const nc = cur.col + d.dc
      const nr = cur.row + d.dr
      const nk = key(nc, nr)
      if (visited.has(nk)) continue
      if (!isWalkable(nc, nr, tileMap, blockedTiles)) continue
      visited.add(nk)
      parent.set(nk, { col: cur.col, row: cur.row })
      queue.push({ col: nc, row: nr })
    }
  }

  if (!found) return []

  // Reconstruct path (excluding start, including end)
  const path: Array<{ col: number; row: number }> = []
  let cur: { col: number; row: number } | null = { col: endCol, row: endRow }
  while (cur !== null) {
    const ck = key(cur.col, cur.row)
    const p = parent.get(ck)
    if (p === null || p === undefined) break // reached start
    path.push(cur)
    cur = p
  }

  path.reverse()
  return path
}
