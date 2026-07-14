# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Idol Math** — a mobile-first, Phaser 3 multiplication-tables ("tabuada") game with a
K-pop/heavy-metal aesthetic. Portuguese (pt-BR) codebase: identifiers, comments and UI
strings are all in Portuguese. It's a buildless static site (no npm, no bundler) meant to
run directly in a browser or be hosted on GitHub Pages, and works offline as a PWA.

## Commands

Run a local server (required — the game uses `localStorage` and `fetch`s `manifest.json`,
so opening `index.html` via `file://` will not work):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Run tests (plain Node, no test runner/framework — `package.json` exists only for the
`test` script; the game itself has no npm dependency):

```bash
npm test                          # all of them, or individually:
node tests/mathengine.test.mjs
node tests/storage.test.mjs
node tests/regras.test.mjs        # scoring/stars/coins formulas
node tests/sw.test.mjs            # sw.js ASSETS list consistency (see below)
```

There is no build, lint, or typecheck step. CI (`.github/workflows/deploy-pages.yml`) runs
`npm test` on every push/PR to `master`, then deploys the repo root to GitHub Pages on
push/dispatch (PRs only run tests).

### How the tests load buildless global scripts

Both `tests/*.mjs` files load production source as plain global scripts (they are IIFEs
assigning to globals like `MathEngine` / `Storage`, not ES modules): they `readFileSync` the
`.js` files and evaluate them with `new Function(...)`, concatenating any global dependencies
the module needs (e.g. `Storage.js` needs the `js/data/*.js` globals plus `MathEngine.js`
bundled in before it). `storage.test.mjs` also injects a mock `localStorage`. When adding a
new pure/testable module, follow this same loader pattern rather than introducing `import`/
`export` (that would break the no-build browser loading via `<script>` tags in `index.html`).

## Architecture

### Buildless global-script loading order

There's no bundler — `index.html` loads every script via `<script src=...>` tags in a strict
dependency order (see the bottom of `index.html`): Phaser (vendored) → `js/data/*.js` (pure
data, no deps) → `js/core/*.js` (MathEngine → Storage → Audio/UI/Util, since Storage reads
`MathEngine.chaveFato` and the data globals) → `js/scenes/*.js` (Phaser scenes) →
`js/ui/*.js` (HTML-based screens) → `js/main.js` (bootstraps `new Phaser.Game`). When adding
a new file, wire it into `index.html` in the right position, and be mindful of load-order
dependencies (everything is a global, no explicit imports catch a wrong order until runtime).

### Two UI layers: Phaser canvas vs. HTML overlay

Navigation/menus are **not** Phaser — they're plain HTML sections (`#ui-root` in
`index.html`, populated by `js/ui/screens.js`) shown/hidden over the canvas. Phaser
(`js/scenes/`) only renders actual gameplay: `BootScene` (procedurally generates textures),
`GameScene` (main battle: enemies, boss, combo), and `TrainScene` (untimed practice mode).
The answer buttons and pause modal during gameplay are also HTML, positioned over the canvas
by `js/ui/gameui.js` (`GameUI.posicionar()`, re-run on resize/orientation change to
compensate for mobile browsers' dynamic viewport/address bar).

### Data-driven design (js/data/)

Game content is separated from mechanics so new content doesn't require touching engine
code:
- `js/data/fases.js` — the `JOGO` config object (constant mechanics: timer, factor range,
  boss HP, points, coin rewards) and the `FASES` array (12 phases; each just declares which
  `tabuadas` — times-tables — it focuses on, theme color, enemy/boss emoji). Difficulty comes
  entirely from which tables a phase targets, not from mechanics — those stay constant across
  phases. Adding a phase = pushing an object onto `FASES` (see README "Como adicionar fases"
  for the exact shape); it auto-appears in the phase grid/progression.
- `js/data/herois.js` — playable character cosmetic definitions (figure/color/name).
- `js/data/roupas.js` — shop outfits per hero.
- `js/data/conquistas.js` — achievements as `{ id, cond(snapshot), recompensa }`; `cond` is
  evaluated against a stats snapshot built in `Storage.avaliarConquistas`.

### Core modules (js/core/)

- `MathEngine.js` — pure, dependency-free question/answer generation (`gerarPergunta`,
  `gerarOpcoes`, weighted "spaced repetition" selection from a `fatos` weight map,
  pedagogical distractors using the classic "neighbor row" multiplication mistakes). Keep it
  side-effect-free.
- `Regras.js` — pure scoring formulas (points per hit, victory bonus, stars, victory coins),
  extracted from `GameScene` so game-balance changes are testable (`tests/regras.test.mjs`).
  Uses only the global `JOGO` config. Keep reward math here, not in scenes.
- `Storage.js` — all persistence, via `localStorage`, under three key namespaces:
  `idolmath.perfis.v1` (multi-profile index — several local player profiles per device, not
  login/auth), `idolmath.save.<id>` (per-profile progress: stars, unlocked phases, coins,
  achievements, streak, fact weights), `idolmath.config.v1` (device-global settings shared
  across profiles). Contains one-time migration logic from a legacy single-player save format
  (`idolmath.save.v2`) — preserve this path if you touch the save shape. Exposes
  `exportarTudo`/`importarTudo` for the JSON backup/restore feature.
- `Audio.js`, `UI.js`, `Util.js` — Web Audio music/SFX (no audio files), canvas text/button
  helpers for Phaser, and misc utilities (vibration, speech synthesis, multiplication-grid
  visualization on wrong answers).

### Adjusting game feel vs. content

Mechanics (timer length, factor range, boss HP, points, coin rates) live in the single
`JOGO` object in `js/data/fases.js` and apply uniformly to every phase — don't hardcode
per-phase mechanics. Content (which tables a phase drills, its theme/boss) lives in `FASES`.

### PWA / offline

`sw.js` is a service worker caching the app shell for offline play. Its `ASSETS` list is
maintained by hand and `tests/sw.test.mjs` enforces it: every file referenced by
`index.html` and every hero/outfit SVG (from `HEROIS`/`ROUPAS`) must be listed, and every
listed file must exist. When adding a file to the app, add it to `ASSETS` too (and bump the
`CACHE` version string), or that test fails. `index.html` has inline
bootstrap logic that intentionally holds a new service-worker version in `waiting` state and
only reloads the page after the player taps an "update available" banner — never mid-game.
Phaser is vendored locally (`vendor/phaser.min.js`), not loaded from a CDN, so the app has no
runtime external dependencies.
