# Solar 3D

Interactive 3D solar system visualization built with Next.js 15, React 19, Three.js (via React Three Fiber), Zustand, and Tailwind CSS v4.

## Cursor Cloud specific instructions

- **Single service:** Only one service is needed — the Next.js dev server (`npm run dev` on port 3000, or `npm run dev:8080` on port 8080).
- **No backend/database/Docker:** This is a purely client-side 3D app. No external services required.
- **No test suite:** The repository has no automated tests. Validate changes manually in the browser.
- **Lint:** `npm run lint` — pre-existing lint errors exist in `download-textures.js` (CJS `require()` in a TS-linted project) and a warning in `Hud.tsx` (`<img>` vs `<Image />`). These are not regressions.
- **Build:** `npm run build` compiles and type-checks successfully.
- **Peer dependency warnings on install:** `leva` (debug UI library) has peer deps pinned to React <=18. These warnings are harmless with React 19 — the app works fine.
- **Planet textures:** Real 2K textures from Solar System Scope (CC BY 4.0) are in `public/textures/2k_*.jpg`. Planets load these via `useTexture` from drei with Suspense fallback to solid colors. Old placeholder files in `public/textures/` (0-byte) and `src/assets/textures/` are legacy artifacts.
- **Orbital mechanics:** Planet positions use full Keplerian orbital elements (J2000 epoch) with Kepler's equation solver in `src/lib/planets.ts`.
- **Standard commands** are in `package.json` `scripts`: `dev`, `dev:8080`, `build`, `start`, `lint`.
