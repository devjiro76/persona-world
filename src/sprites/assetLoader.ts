const TILE_PATHS: Record<string, string> = {
  TilesetFloor: '/assets/tiles/TilesetFloor.png',
  TilesetInteriorFloor: '/assets/tiles/TilesetInteriorFloor.png',
  TilesetWallSimple: '/assets/tiles/TilesetWallSimple.png',
  TilesetWater: '/assets/tiles/TilesetWater.png',
  TilesetNature: '/assets/tiles/TilesetNature.png',
  TilesetHouse: '/assets/tiles/TilesetHouse.png',
  TilesetInterior: '/assets/tiles/TilesetInterior.png',
  TilesetElement: '/assets/tiles/TilesetElement.png',
}

const CHARACTER_COUNT = 12
const SHADOW_PATH = '/assets/misc/Shadow.png'

export interface GameAssets {
  tiles: Record<string, HTMLImageElement>
  characters: HTMLImageElement[]
  shadow: HTMLImageElement
  loaded: boolean
}

export const assets: GameAssets = {
  tiles: {},
  characters: [],
  shadow: new Image(),
  loaded: false,
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load: ${src}`))
    img.src = src
  })
}

export async function loadAssets(): Promise<void> {
  const promises: Promise<void>[] = []

  for (const [key, path] of Object.entries(TILE_PATHS)) {
    promises.push(
      loadImage(path).then((img) => { assets.tiles[key] = img }),
    )
  }

  for (let i = 0; i < CHARACTER_COUNT; i++) {
    promises.push(
      loadImage(`/assets/characters/char_${i}.png`).then((img) => { assets.characters[i] = img }),
    )
  }

  promises.push(
    loadImage(SHADOW_PATH).then((img) => { assets.shadow = img }),
  )

  await Promise.all(promises)
  assets.loaded = true
}
