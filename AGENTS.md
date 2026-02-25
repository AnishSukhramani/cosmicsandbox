# Solar 3D

Interactive 3D solar system visualization built with Next.js 15, React 19, Three.js (via React Three Fiber), Zustand, and Tailwind CSS v4.

## Cursor Cloud specific instructions

- **Single service:** Only one service is needed — the Next.js dev server (`npm run dev` on port 3000, or `npm run dev:8080` on port 8080).
- **No backend/database/Docker:** This is a purely client-side 3D app. No external services required.
- **No test suite:** The repository has no automated tests. Validate changes manually in the browser.
- **Lint:** `npm run lint` — pre-existing lint errors exist in `download-textures.js` (CJS `require()` in a TS-linted project) and a warning in `Hud.tsx` (`<img>` vs `<Image />`). These are not regressions.
- **Build:** `npm run build` compiles and type-checks successfully.
- **Peer dependency warnings on install:** `leva` (debug UI library) has peer deps pinned to React <=18. These warnings are harmless with React 19 — the app works fine.
- **Planet textures:** Most texture files under `public/textures/` are 0-byte placeholders. The optional `node download-textures.js` script fetches real textures from GitHub. The app renders without them using fallback solid-color materials.
- **Standard commands** are in `package.json` `scripts`: `dev`, `dev:8080`, `build`, `start`, `lint`.
