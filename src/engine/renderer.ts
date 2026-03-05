import { TILE_SIZE, BUBBLE_VERTICAL_OFFSET_PX, COLORS } from '../constants'
import { t, tEmotion } from '../data/i18n'
import { TileType, CharacterState, Direction } from '../types'
import type { Character, FurnitureInstance } from '../types'
import { assets } from '../sprites/assetLoader'
import { getEmotionTint, emoEmoji } from '../sprites/emotionFx'

// Character sprite frame size
const FRAME_W = 16
const FRAME_H = 16

// Direction -> sprite sheet column
// SpriteSheet layout: col0=DOWN, col1=UP, col2=LEFT, col3=RIGHT
const DIR_TO_COL: Record<Direction, number> = {
  [Direction.DOWN]: 0,
  [Direction.UP]: 1,
  [Direction.RIGHT]: 3,
  [Direction.LEFT]: 2,
}

// Tile type -> tileset source coordinates (16x16 center fill tiles from autotile groups)
const TILE_COORDS: Partial<Record<TileType, { tileset: string; sx: number; sy: number }>> = {
  [TileType.GRASS]: { tileset: 'TilesetFloor', sx: 16, sy: 192 },             // bright green
  [TileType.STONE_PATH]: { tileset: 'TilesetFloor', sx: 208, sy: 240 },       // brown earth
  [TileType.WOOD_FLOOR]: { tileset: 'TilesetInteriorFloor', sx: 48, sy: 112 }, // warm wood
  [TileType.CARPET]: { tileset: 'TilesetInteriorFloor', sx: 208, sy: 112 },    // green tatami
  [TileType.WALL]: { tileset: 'TilesetWallSimple', sx: 16, sy: 160 },          // brown wall (fully opaque)
  [TileType.VOID]: { tileset: 'TilesetWater', sx: 16, sy: 16 },               // uniform blue water
  [TileType.SAND]: { tileset: 'TilesetFloor', sx: 16, sy: 16 },               // sand/dirt terrain
  [TileType.BRIDGE]: { tileset: 'TilesetWater', sx: 16, sy: 224 },            // wooden bridge planks
}

// Zone label definitions for the 48x36 map
const ZONE_LABELS = [
  { text: 'Cafe', col: 7, row: 1 },
  { text: 'Library', col: 39, row: 1 },
  { text: 'Town Square', col: 21, row: 15 },
  { text: 'Park', col: 40, row: 14 },
  { text: 'Training Ground', col: 8, row: 26 },
  { text: 'Residential', col: 26, row: 26 },
]

// Bubble type -> visual style
const BUBBLE_STYLES: Record<string, { bg: string; border: string; textColor: string }> = {
  think:  { bg: 'rgba(40,40,80,0.85)',  border: 'rgba(100,100,255,0.3)', textColor: '#aac' },
  action: { bg: 'rgba(20,20,40,0.88)',  border: 'rgba(255,200,50,0.3)',  textColor: '#fff' },
  react:  { bg: 'rgba(40,20,30,0.88)',  border: 'rgba(255,100,100,0.3)', textColor: '#fdd' },
}

// Shared offscreen canvas for emotion tint compositing
const tintCanvas = document.createElement('canvas')
tintCanvas.width = FRAME_W
tintCanvas.height = FRAME_H
const tintCtx = tintCanvas.getContext('2d')!
tintCtx.imageSmoothingEnabled = false

// ── Tile grid offscreen cache ──
// Renders all tiles once at native 1:1 resolution. Blitted scaled per frame.
let _tileCache: HTMLCanvasElement | null = null
let _tileCacheRef: TileType[][] | null = null

function ensureTileCache(tileMap: TileType[][]): HTMLCanvasElement {
  if (_tileCache && _tileCacheRef === tileMap) return _tileCache

  const rows = tileMap.length
  const cols = rows > 0 ? tileMap[0].length : 0
  const c = document.createElement('canvas')
  c.width = cols * TILE_SIZE
  c.height = rows * TILE_SIZE
  const cctx = c.getContext('2d')!
  cctx.imageSmoothingEnabled = false

  for (let r = 0; r < rows; r++) {
    for (let cc = 0; cc < cols; cc++) {
      const tile = tileMap[r][cc]
      const coord = TILE_COORDS[tile]
      if (coord) {
        const img = assets.tiles[coord.tileset]
        if (img) {
          cctx.drawImage(img, coord.sx, coord.sy, 16, 16, cc * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE)
          continue
        }
      }
      // Fallback for tiles without asset mapping
      if (tile === TileType.VOID) {
        cctx.fillStyle = '#1a3a5c'
        cctx.fillRect(cc * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE)
      } else if (tile === TileType.WALL) {
        cctx.fillStyle = '#3a3a4e'
        cctx.fillRect(cc * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE)
      } else if (tile === TileType.SAND) {
        cctx.fillStyle = '#c4a96a'
        cctx.fillRect(cc * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE)
      } else if (tile === TileType.BRIDGE) {
        cctx.fillStyle = '#8a6540'
        cctx.fillRect(cc * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE)
      }
    }
  }

  _tileCache = c
  _tileCacheRef = tileMap
  return c
}

// ── Pre-sorted furniture cache ──
let _sortedFurniture: FurnitureInstance[] | null = null
let _furnitureRef: FurnitureInstance[] | null = null

function getSortedFurniture(furniture: FurnitureInstance[]): FurnitureInstance[] {
  if (_furnitureRef === furniture && _sortedFurniture) return _sortedFurniture
  _sortedFurniture = [...furniture].sort((a, b) => a.zY - b.zY)
  _furnitureRef = furniture
  return _sortedFurniture
}

// Render zone labels as semi-transparent text on the tile layer
function renderZoneLabels(
  ctx: CanvasRenderingContext2D,
  offsetX: number, offsetY: number,
  zoom: number,
): void {
  const fontSize = Math.max(6, Math.round(4 * zoom))
  ctx.save()
  ctx.font = `bold ${fontSize}px sans-serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.globalAlpha = 0.12
  ctx.fillStyle = '#fff'

  for (const label of ZONE_LABELS) {
    const x = offsetX + label.col * TILE_SIZE * zoom + (TILE_SIZE * zoom) / 2
    const y = offsetY + label.row * TILE_SIZE * zoom + (TILE_SIZE * zoom) / 2
    ctx.fillText(t(label.text), x, y)
  }

  ctx.restore()
}

// Draw a character sprite with optional emotion tint overlay
function drawCharacterSprite(
  ctx: CanvasRenderingContext2D,
  sheet: HTMLImageElement,
  col: number, row: number,
  dx: number, dy: number,
  zoom: number,
  tint: string | null,
): void {
  const sx = col * FRAME_W
  const sy = row * FRAME_H
  const dw = FRAME_W * zoom
  const dh = FRAME_H * zoom

  if (!tint) {
    ctx.drawImage(sheet, sx, sy, FRAME_W, FRAME_H, dx, dy, dw, dh)
    return
  }

  // Render to temp canvas, apply source-atop tint, then draw to main canvas
  tintCtx.clearRect(0, 0, FRAME_W, FRAME_H)
  tintCtx.globalCompositeOperation = 'source-over'
  tintCtx.drawImage(sheet, sx, sy, FRAME_W, FRAME_H, 0, 0, FRAME_W, FRAME_H)
  tintCtx.save()
  tintCtx.globalCompositeOperation = 'source-atop'
  tintCtx.fillStyle = tint
  tintCtx.fillRect(0, 0, FRAME_W, FRAME_H)
  tintCtx.restore()
  ctx.drawImage(tintCanvas, 0, 0, FRAME_W, FRAME_H, dx, dy, dw, dh)
}

// Draw a single character entity (shadow + sprite + indicators)
function drawCharacterEntity(
  ctx: CanvasRenderingContext2D,
  ch: Character,
  offsetX: number, offsetY: number,
  zoom: number,
  selectedId: string | null,
  time: number,
): void {
  const sheet = assets.characters[ch.spriteIndex % assets.characters.length]
  if (!sheet) return

  const col = DIR_TO_COL[ch.dir]
  const row = ch.state === CharacterState.WALK ? (ch.frame % 4) : 0
  const dw = FRAME_W * zoom
  const dh = FRAME_H * zoom
  const drawX = Math.round(offsetX + ch.x * zoom - dw / 2)
  const drawY = Math.round(offsetY + ch.y * zoom - dh)

  // Shadow
  if (assets.shadow.complete) {
    const sw = 12 * zoom
    const sh = 7 * zoom
    ctx.globalAlpha = 0.3
    ctx.drawImage(assets.shadow, 0, 0, 12, 7, drawX + (dw - sw) / 2, drawY + dh - sh / 2, sw, sh)
    ctx.globalAlpha = 1
  }

  // Character sprite with optional emotion tint
  const tint = ch.persona.state?.emotion?.vad ? getEmotionTint(ch.persona.state.emotion.vad) : null
  drawCharacterSprite(ctx, sheet, col, row, drawX, drawY, zoom, tint)

  // Frozen / busy indicator — pulsing circle
  if (ch.frozen) {
    const pulse = 0.5 + 0.5 * Math.sin(time * 6)
    const radius = (FRAME_W * zoom) / 2 + 2 * zoom
    const cx = drawX + dw / 2
    const cy = drawY + dh / 2
    ctx.save()
    ctx.strokeStyle = `rgba(255, 200, 50, ${0.3 + 0.4 * pulse})`
    ctx.lineWidth = Math.max(1, zoom * 0.5)
    ctx.beginPath()
    ctx.arc(cx, cy, radius, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  // Selection highlight
  if (ch.id === selectedId) {
    ctx.save()
    ctx.strokeStyle = COLORS.accent
    ctx.lineWidth = 1
    ctx.setLineDash([2, 2])
    ctx.strokeRect(drawX - 1, drawY - 1, dw + 2, dh + 2)
    ctx.restore()
  }
}

// Render scene with Z-ordering via merge of pre-sorted furniture + characters
function renderScene(
  ctx: CanvasRenderingContext2D,
  furniture: FurnitureInstance[],
  characters: Character[],
  offsetX: number, offsetY: number,
  zoom: number,
  selectedId: string | null,
  time: number,
): void {
  const sorted = getSortedFurniture(furniture)

  // Sort characters by zY (typically only 12 items)
  const charEntries = characters
    .map(ch => ({ ch, zY: ch.y + TILE_SIZE / 2 + 1 }))
    .sort((a, b) => a.zY - b.zY)

  // Merge-draw furniture + characters in zY order
  let fi = 0, ci = 0
  while (fi < sorted.length || ci < charEntries.length) {
    const fzY = fi < sorted.length ? sorted[fi].zY : Infinity
    const czY = ci < charEntries.length ? charEntries[ci].zY : Infinity

    if (fzY <= czY) {
      const f = sorted[fi++]
      const img = assets.tiles[f.sprite.tileset]
      if (img) {
        ctx.drawImage(img, f.sprite.sx, f.sprite.sy, f.sprite.sw, f.sprite.sh,
          offsetX + f.x * zoom, offsetY + f.y * zoom, f.sprite.sw * zoom, f.sprite.sh * zoom)
      }
    } else {
      drawCharacterEntity(ctx, charEntries[ci++].ch, offsetX, offsetY, zoom, selectedId, time)
    }
  }
}

// Render character HUD: name + emotion + VAD bars in a floating panel
function renderCharacterHUD(
  ctx: CanvasRenderingContext2D,
  characters: Character[],
  offsetX: number, offsetY: number,
  zoom: number,
): void {
  for (const ch of characters) {
    const cx = offsetX + ch.x * zoom
    const spriteTopY = offsetY + ch.y * zoom - FRAME_H * zoom

    const vad = ch.persona.state?.emotion?.vad
    const emotionLabel = ch.persona.state?.emotion?.label
    const name = ch.persona.display_name || ch.persona.config.identity.name
    const emoji = emotionLabel ? emoEmoji(emotionLabel) : ''

    // Layout dimensions
    const nameFontSize = Math.max(12, Math.round(6 * zoom))
    const emoFontSize = Math.max(11, Math.round(5 * zoom))
    const barW = Math.max(28, Math.round(22 * zoom))
    const barH = Math.max(3, Math.round(2.5 * zoom))
    const barGap = Math.max(2, Math.round(1.2 * zoom))
    const padding = Math.round(3 * zoom)

    // Measure total height: name + emotion + 3 bars
    const lineGap = Math.round(1.5 * zoom)
    let totalH = nameFontSize + lineGap
    if (emotionLabel) totalH += emoFontSize + lineGap
    if (vad) totalH += (barH + barGap) * 3
    totalH += padding * 2

    const panelW = barW + padding * 2
    const panelX = cx - panelW / 2
    const panelY = spriteTopY - totalH - 2 * zoom

    // Background panel
    ctx.save()
    ctx.fillStyle = 'rgba(8,8,13,0.85)'
    ctx.beginPath()
    ctx.roundRect(panelX, panelY, panelW, totalH, 3 * zoom)
    ctx.fill()

    let curY = panelY + padding

    // Name
    ctx.font = `bold ${nameFontSize}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    ctx.fillStyle = '#fff'
    ctx.fillText(name, cx, curY, panelW - padding * 2)
    curY += nameFontSize + lineGap

    // Emotion
    if (emotionLabel) {
      const vColor = vad ? (vad.V > 0.3 ? COLORS.pos : vad.V < -0.3 ? COLORS.neg : COLORS.warn) : COLORS.dim
      ctx.font = `${emoFontSize}px sans-serif`
      ctx.fillStyle = vColor
      const emoText = emoji ? `${emoji} ${tEmotion(emotionLabel)}` : tEmotion(emotionLabel)
      ctx.fillText(emoText, cx, curY, panelW - padding * 2)
      curY += emoFontSize + lineGap
    }

    // VAD bars
    if (vad) {
      const barX = cx - barW / 2
      drawHUDBar(ctx, barX, curY, barW, barH, vad.V, COLORS.pos, COLORS.neg)
      curY += barH + barGap
      drawHUDBar(ctx, barX, curY, barW, barH, vad.A, COLORS.warn, COLORS.warn)
      curY += barH + barGap
      drawHUDBar(ctx, barX, curY, barW, barH, vad.D, COLORS.blue, COLORS.blue)
    }

    ctx.restore()
  }
}

function drawHUDBar(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  value: number,
  posColor: string, negColor: string,
): void {
  // Background
  ctx.fillStyle = 'rgba(255,255,255,0.15)'
  ctx.fillRect(x, y, w, h)

  // Center line
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.fillRect(x + w / 2, y, 1, h)

  // Value fill
  const fillW = Math.abs(value) * (w / 2)
  const fillX = value >= 0 ? x + w / 2 : x + w / 2 - fillW
  ctx.fillStyle = value >= 0 ? posColor : negColor
  ctx.globalAlpha = 0.85
  ctx.fillRect(fillX, y, fillW, h)
  ctx.globalAlpha = 1
}


// Render speech bubbles — styled by bubbleType
function renderBubbles(
  ctx: CanvasRenderingContext2D,
  characters: Character[],
  offsetX: number, offsetY: number,
  zoom: number,
): void {
  const fontSize = Math.max(9, Math.round(5 * zoom))
  const padX = Math.round(4 * zoom)
  const padY = Math.round(3 * zoom)
  const tailH = Math.round(3 * zoom)
  const radius = Math.round(2 * zoom)

  for (const ch of characters) {
    if (ch.bubbleTimer <= 0) continue

    const cx = offsetX + ch.x * zoom
    const cy = offsetY + ch.y * zoom - BUBBLE_VERTICAL_OFFSET_PX * zoom

    const style = BUBBLE_STYLES[ch.bubbleType] || BUBBLE_STYLES.action

    ctx.save()
    ctx.globalAlpha = Math.min(1, ch.bubbleTimer)

    // Measure text to auto-size
    ctx.font = `bold ${fontSize}px sans-serif`
    const text = ch.bubbleEmoji ? `${ch.bubbleEmoji} ${ch.bubbleText}` : ch.bubbleText
    const textW = ctx.measureText(text).width
    const bubbleW = textW + padX * 2
    const bubbleH = fontSize + padY * 2
    const bx = cx - bubbleW / 2
    const by = cy - bubbleH - tailH

    // Background
    ctx.fillStyle = style.bg
    ctx.beginPath()
    ctx.roundRect(bx, by, bubbleW, bubbleH, radius)
    ctx.fill()

    // Border
    ctx.strokeStyle = style.border
    ctx.lineWidth = 1
    ctx.stroke()

    // Tail
    ctx.fillStyle = style.bg
    ctx.beginPath()
    ctx.moveTo(cx - 2 * zoom, by + bubbleH)
    ctx.lineTo(cx, by + bubbleH + tailH)
    ctx.lineTo(cx + 2 * zoom, by + bubbleH)
    ctx.fill()

    // Text
    ctx.fillStyle = style.textColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(text, cx, by + bubbleH / 2)

    ctx.restore()
  }
}

// Main render frame
export function renderFrame(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  tileMap: TileType[][],
  furniture: FurnitureInstance[],
  characters: Character[],
  zoom: number,
  panX: number,
  panY: number,
  selectedId: string | null,
  time = 0,
): { offsetX: number; offsetY: number } {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  const cols = tileMap.length > 0 ? tileMap[0].length : 0
  const rows = tileMap.length
  const mapW = cols * TILE_SIZE * zoom
  const mapH = rows * TILE_SIZE * zoom
  const offsetX = Math.floor((canvasWidth - mapW) / 2) + Math.round(panX)
  const offsetY = Math.floor((canvasHeight - mapH) / 2) + Math.round(panY)

  // Blit cached tile grid (1 drawImage instead of 1,728)
  const tileGridCache = ensureTileCache(tileMap)
  ctx.drawImage(tileGridCache, 0, 0, tileGridCache.width, tileGridCache.height, offsetX, offsetY, mapW, mapH)

  renderZoneLabels(ctx, offsetX, offsetY, zoom)
  renderScene(ctx, furniture, characters, offsetX, offsetY, zoom, selectedId, time)
  renderCharacterHUD(ctx, characters, offsetX, offsetY, zoom)
  renderBubbles(ctx, characters, offsetX, offsetY, zoom)

  return { offsetX, offsetY }
}
