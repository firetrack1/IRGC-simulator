# Shadow Command — Prototype

A browser-based, satirical geopolitical strategy game prototype built with React, Three.js (via `@react-three/fiber`/`drei`), and Zustand. See [`../docs/GAME_DESIGN_PROMPT.md`](../docs/GAME_DESIGN_PROMPT.md) for the full design brief.

## Running locally

```bash
npm install
npm run dev
```

Open the printed local URL. Rotate/pan/zoom the map with the mouse, click a country to select it, and use the side panels to manage patronage, factions, proxy fronts, arsenal, and diplomacy. Click **End Turn** to advance the simulation.

## What's implemented

- **3D regional map**: low-poly stylized tiles for Iran and its neighbours (Iraq, Syria, Lebanon, Yemen, Gulf States, Afghanistan), color-coded by control share, with orbit camera controls.
- **Corruption & patronage**: toggle loyalists across oil/construction/banking/bonyad sectors and a revenue-siphoning switch; each raises income at the cost of a hidden Corruption meter and Public Morale.
- **Faction balance**: clergy/army/technocrat loyalty meters that decay each turn; appease them with treasury or risk a coup.
- **Proxy operations**: a 5-step escalation ladder per country (no presence → political support → covert funding → arming militias → active conflict), costing Influence and shifting the regional control-share tug-of-war.
- **Strike capability**: build missiles/drones and air defense, then launch an animated strike (parabolic trajectory + impact flash) at a selected region. Strikes raise International Heat and Retaliation Risk; unresolved risk triggers a retaliatory strike each turn.
- **International pressure**: a Heat meter that throttles oil income (sanctions) and a back-channel negotiation action to cool tensions.
- **Turn loop**: `End Turn` resolves income, patronage/siphon effects, faction decay, retaliation, contested-region drift, and a weighted random event (scandal, defection, protest wave, peace offer, windfall, assassination attempt) with satirical state-media flavor text.
- **Win/lose conditions**: regime collapse (morale, coup, sanctions-triggered intervention, or prolonged insolvency) vs. regional hegemony or economic dominance.

## Stack

React 19 + TypeScript + Vite, `three` / `@react-three/fiber` / `@react-three/drei` for the 3D scene, `zustand` for game state.

## Not yet implemented (stretch)

Tech tree, alternate scenarios, "reformist ending" branch, leaderboards, and higher-fidelity 3D models (current tiles/buildings are primitive geometry, not sculpted assets).
