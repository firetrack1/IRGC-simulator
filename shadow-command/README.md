# Shadow Command — Prototype

A browser-based, satirical geopolitical strategy game prototype built with React, Three.js (via `@react-three/fiber`/`drei`), and Zustand. See [`../docs/GAME_DESIGN_PROMPT.md`](../docs/GAME_DESIGN_PROMPT.md) for the full design brief.

## Running locally

```bash
npm install
npm run dev
```

Open the printed local URL. Rotate/pan/zoom the map with the mouse, click a country to select it, and use the side panels to manage patronage, factions, proxy fronts, arsenal, tech, and diplomacy. Click **End Turn** to advance the simulation.

## What's implemented

- **Real-world 3D map**: actual country borders (Iran and its neighbours — Iraq, Syria, Lebanon, Yemen, Saudi Arabia/Gulf States, Afghanistan — plus a ring of neutral context countries) extruded from real Natural Earth geometry, sitting on an ocean plane. See [`scripts/extract-map.cjs`](scripts/extract-map.cjs) — it bakes real ISO country polygons (via the `world-atlas` npm package) into [`src/data/worldGeo.ts`](src/data/worldGeo.ts) at dev-time, so the shipped app has no runtime map-data dependency.
- **Kitbashed 3D models**: the homeland gets a control tower, missile silos, and a radar dish, plus visible sector icons (oil derrick, construction crane, bank vault, bonyad dome) that appear as you assign patronage; proxy regions grow building clusters and watchtowers with escalation; Yemen/Gulf get a naval token at high proxy intensity — all procedural low-poly geometry (no external asset packs).
- **Corruption & patronage**: toggle loyalists across oil/construction/banking/bonyad sectors and a revenue-siphoning switch; each raises income at the cost of a hidden Corruption meter and Public Morale.
- **Faction balance**: clergy/army/technocrat loyalty meters that decay each turn; appease them with treasury or risk a coup.
- **Proxy operations**: a 5-step escalation ladder per country (no presence → political support → covert funding → arming militias → active conflict), costing Influence and shifting the regional control-share tug-of-war.
- **Strike capability**: build missiles/drones and air defense, then launch an animated strike (parabolic trajectory + impact flash) at a selected region. Strikes raise International Heat and Retaliation Risk; unresolved risk triggers a retaliatory strike each turn.
- **Tech tree**: a 5-node, 3-tier tree (Asymmetric Warfare, Cyber Operations, Integrated Air Defense Grid, Disinformation Network, Advanced Missile Guidance) with prerequisites and Treasury/Influence costs, granting passive bonuses to proxy costs, strike heat/control, retaliation mitigation, and unrest resistance.
- **International pressure**: a Heat meter that throttles oil income (sanctions) and a back-channel negotiation action to cool tensions.
- **Reformist ending**: invest in public services to raise Morale and curb Corruption; once Morale ≥70, Corruption ≤20, and turn ≥10, "Dismantle the Network" becomes available for an alternate, non-violent win.
- **Turn loop**: `End Turn` resolves income, patronage/siphon effects, faction decay, retaliation, contested-region drift, and a weighted random event (scandal, defection, protest wave, peace offer, windfall, assassination attempt) with satirical state-media flavor text.
- **Win/lose conditions**: regime collapse (morale, coup, sanctions-triggered intervention, or prolonged insolvency) vs. regional hegemony, economic dominance, or the reformist ending — each with distinct end-game copy.

## Stack

React 19 + TypeScript + Vite, `three` / `@react-three/fiber` / `@react-three/drei` for the 3D scene, `zustand` for game state. `world-atlas` / `topojson-client` are dev-only dependencies used solely by `scripts/extract-map.cjs`.

## Regenerating the map data

```bash
node scripts/extract-map.cjs
```

Re-run this if you change which countries are playable/context, the projection center, or the scale in `scripts/extract-map.cjs`; it overwrites `src/data/worldGeo.ts`.

## Not yet implemented (stretch)

Alternate scenarios/difficulties, leaderboards, and sculpted (hand-modeled/GLTF) assets — the current 3D kit is richer procedural geometry, not imported art.
