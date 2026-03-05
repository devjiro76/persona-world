# Persona World

Pixel art world simulation demo powered by the [molroo](https://molroo.io) emotion engine.
Characters wander a tile map, interact autonomously, and display real-time emotional states.

## Quick Start

```bash
cp .env.example .env        # Set your API key
npm install
npm run dev                  # http://localhost:5173
```

Only `VITE_API_KEY` is required. On first run the app automatically creates a world and seeds 12 characters via the molroo SDK.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_KEY` | Yes | API key from [molroo.io](https://molroo.io) |
| `VITE_WORLD_ID` | No | Existing world ID (auto-created if omitted) |
| `VITE_API_URL` | No | API base URL (default: `https://api.molroo.io`) |

## Architecture

**React 19 + Vite + Canvas 2D** -- game rendering on `<canvas>`, React for UI chrome only.

- `engine/` -- Game loop, character state machine (`IDLE -> WALK -> INTERACT -> REACT`), BFS pathfinding
- `auto-tick/` -- AI action picker. HEXACO personality biases action selection
- `api/client.ts` -- molroo SDK integration with auto world/persona provisioning
- `data/personas.ts` -- 12 pre-configured character personalities
- `ui/` -- React components (canvas, side panel, toolbar, event log)

## Features

- Real-time VAD (Valence-Arousal-Dominance) emotion visualization
- Personality-driven autonomous interactions between characters
- Relationship tracking that evolves over time
- i18n auto-detection (ko/en), override with `?lang=ko` or `?lang=en`
- Touch support with pinch-to-zoom

## Build

```bash
npm run build    # Production build -> dist/
```
