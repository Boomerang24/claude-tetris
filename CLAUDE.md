# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Vanilla JS Tetris. No dependencies, no build system, no package.json. Three files only:

- `index.html` — DOM structure: `<canvas id="board">` (300×600, 30px blocks), `<canvas id="next-canvas">` for the piece preview, HUD (score/lines/level), and a pause/game-over overlay.
- `style.css` — dark retro-arcade theme.
- `game.js` — all game logic (~300 lines, single file, no modules).

## Running

No install/build step. Either:

```bash
open index.html          # just open it
python3 -m http.server 8000   # or serve locally, then visit localhost:8000
```

No test suite, linter, or formatter is configured in this repo.

## Architecture (`game.js`)

Everything is global state and top-level functions (no classes, no modules) operating on:

- `board`: `ROWS × COLS` matrix, each cell is `0` (empty) or `1–7` (color index of a locked piece).
- `current` / `next`: `{ type, shape, x, y }`, where `shape` is a square matrix from `PIECES` (color indices, 0 = empty).
- `PIECES`/`COLORS`: index 0 is unused/null so piece type doubles as both the array index and the board's stored color index.

Key functions and how they relate:

- `rotateCW(shape)` — transpose + reverse rows to rotate a piece matrix 90°.
- `tryRotate()` — calls `rotateCW`, then tests wall-kick offsets `[0, -1, 1, -2, 2]` via `collide()` and applies the first that doesn't collide.
- `collide(shape, ox, oy)` — bounds/overlap check against `board`; used by movement, rotation, ghost-piece projection, and spawn (game-over check).
- `ghostY()` — projects `current` straight down via repeated `collide()` calls to find the landing row; used both for the ghost-piece render and `hardDrop()` scoring.
- `lockPiece()` — `merge()` (writes shape into `board`) → `clearLines()` → `spawn()`.
- `clearLines()` — scans bottom-up, splices full rows out and unshifts empty ones in; updates `lines`/`score`/`level`/`dropInterval`.
- `spawn()` — promotes `next` to `current`, generates a new `next`; if the new `current` immediately collides, calls `endGame()`.
- `loop(ts)` — `requestAnimationFrame` loop; accumulates `dt` in `dropAccum`, advances the piece one row (or locks it) once `dropAccum >= dropInterval`, then redraws.

Rendering (`draw()`) redraws the whole canvas every frame in a fixed order: grid → locked board cells → ghost piece (`globalAlpha = 0.2`) → current piece. `drawNext()` renders the preview canvas the same way via `drawBlock()`.

Scoring/leveling: `LINE_SCORES = [0, 100, 300, 500, 800]` × `level`; level increases every 10 lines; `dropInterval = max(100, 1000 - (level-1)*90)` ms.

Input is a single `keydown` listener switching on `e.code` (arrows + `KeyX` for rotate, `Space` for hard drop, `KeyP` for pause), guarded by `paused`/`gameOver` flags.

## Tuning constants (top of `game.js`)

`COLS`, `ROWS`, `BLOCK`, `COLORS`, `LINE_SCORES`, `dropInterval`. If `COLS`/`ROWS`/`BLOCK` change, also update the `<canvas id="board">` `width`/`height` in `index.html` to match (`COLS×BLOCK` by `ROWS×BLOCK`).
