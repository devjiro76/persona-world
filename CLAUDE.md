# world-viz-pixel

Pixel art world simulation demo for the molroo emotion engine. Characters wander a tile map, interact via molroo world-api, and display real-time VAD emotion state.

```bash
npm run dev      # Vite dev server (localhost:5173)
npm run build    # tsc + Vite production build
```

## Architecture

**React 19 + Vite + Canvas 2D** — game rendering on `<canvas>`, React for UI chrome only.

- `engine/` — Game logic. State machine: `IDLE → WALK → IDLE | INTERACT → REACT → IDLE`. BFS pathfinding.
- `auto-tick/` — AI action picker. HEXACO personality biases action selection.
- `api/client.ts` — REST client. Dev proxies `/api` → `localhost:8788`; prod → `https://api.molroo.io`.
- `ui/` — React components (canvas, side panel, toolbar, event log).

## Gotchas

- World state in `useRef` (not React state) to avoid re-renders during game loop.
- Env var: `VITE_API_KEY` (defaults to `'dev-test-key'`).
- No test framework configured.
