# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

Pixel art world simulation demo for the molroo emotion engine. Characters wander a 48×36 tile map across 6 zones (Cafe, Library, Square, Park, Training, Residential), interact via REST API calls to the molroo emotion computation backend, and display real-time VAD (Valence-Arousal-Dominance) emotion state.

## Commands

```bash
npm run dev      # Vite dev server (localhost:5173)
npm run build    # tsc type-check + Vite production build
npm run preview  # Preview production build locally
```

No test framework is configured.

## Architecture

**React 19 + Vite + Canvas 2D** — all game rendering happens on a single `<canvas>`, not DOM elements. React manages UI chrome only (side panel, toolbar, event log).

### Core Loop

```
App.tsx (orchestrator)
  ├── usePersonas     → fetches personas from API (fallback: 12 mocks)
  ├── useAutoTick     → AI decision loop (personality-biased action selection)
  └── useGameLoop     → RAF loop via engine/gameLoop.ts
        ├── UPDATE: characters.ts (state machine, pathfinding, wandering)
        └── RENDER: renderer.ts (tile grid → furniture → z-sorted characters → HUD → bubbles)
```

### Key Modules

- **`engine/`** — All game logic. Characters follow a state machine: `IDLE → WALK → IDLE | INTERACT → REACT → IDLE`. Pathfinding is BFS 4-directional.
- **`layout/`** — Tile map definition (`defaultMap.ts`) and furniture placement (`furniture.ts`). Walkable tiles: GRASS, STONE_PATH, WOOD_FLOOR, CARPET, SAND, BRIDGE.
- **`auto-tick/`** — AI action picker. HEXACO personality traits bias action selection; relationship feelings map modulates behavior.
- **`sprites/`** — Asset loading (Ninja Adventure tileset + 12 character sprite sheets) and emotion-to-emoji/tint mappings.
- **`api/client.ts`** — REST client. Dev proxies `/api` to `localhost:8788`; prod hits `https://world-api.molroo.io`.
- **`ui/`** — React components (OfficeCanvas, SidePanel, Toolbar, EventLog, BottomSheet for mobile).

### State Management

World state (characters, personas, furniture, tile map) lives in a `useRef` — not React state — to avoid re-renders during the game loop. UI state (selected character, logs, busy set) uses normal React hooks.

## API Integration

- **Dev**: Vite proxy `/api` → `http://localhost:8788` (local game API)
- **Prod**: `https://world-api.molroo.io`
- **Env var**: `VITE_API_KEY` (defaults to `'dev-test-key'`)
- **Endpoints**: `GET /villages/{vid}/personas`, `POST /villages/{vid}/act`

## Rendering Notes

- Pixel-perfect: `imageSmoothingEnabled = false`, 16×16 base tile size
- Z-ordering by Y-coordinate for isometric-style depth
- Emotion tinting overlays VAD-derived colors on character sprites
- Zoom range: 1–8x with exponential decay camera follow on selected character
- Mobile: touch pan + pinch zoom; bottom sheet replaces side panel

## Types

Core types in `src/types.ts`: `Character` (game entity with position/state/sprite), `Persona` (emotional entity with config + VAD state), `LogEntry` (action history). Character actions are categorized as positive (p), neutral (m), or negative (n).
