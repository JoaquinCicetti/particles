# Silo — Grain Storage Intelligence

Experimental landing page for a cultivation-tech company focused on grain storage silos. Futuristic Three.js scene: particle streams flowing along paths that will converge into an electric circuit-board formation.

## Stack

- [Vite](https://vite.dev) + React 19 + TypeScript
- [three](https://threejs.org) + [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber)
- [@react-three/drei](https://github.com/pmndrs/drei) — helpers (curves, cameras, Html)
- [@react-three/postprocessing](https://github.com/pmndrs/react-postprocessing) — Bloom for the electric glow
- [leva](https://github.com/pmndrs/leva) (dev) — tweak panel for tuning particle params

## Develop

```sh
npm install
npm run dev
```

## Structure

```
src/
  App.tsx                       # full-screen Canvas + HTML overlay
  scene/
    Scene.tsx                   # canvas contents: background, fog, effects
    Effects.tsx                 # Bloom postprocessing
    particles/
      ParticleField.tsx         # points flowing along the path (placeholder)
      paths.ts                  # CatmullRomCurve3 path definitions
  ui/
    Overlay.tsx                 # landing copy layer
  styles/global.css
```

The current scene is a placeholder proving the pipeline (path-following particles + bloom). The detailed scene choreography replaces it next.

## Deploy

Vercel Hobby (free): `npm i -g vercel && vercel`.
