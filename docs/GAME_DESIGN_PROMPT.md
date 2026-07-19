# Shadow Command — Game Design Prompt

## Concept

Build a 3D, map-based geopolitical strategy game titled **"Shadow Command."** The player controls a fictionalized IRGC and pursues regional dominance while managing internal legitimacy and external escalation. Present it with a satirical, Tropico-style tone — dark comedy about power and corruption, not a straight-faced endorsement.

The game world is a stylized 3D regional map centered on Iran and its neighbours (Iraq, Syria, Lebanon, Yemen, the Gulf states, Afghanistan). Use low-poly / clean-stylized 3D models for cities, military installations, proxy cells, missile silos, drones, and naval assets. The camera should pan, zoom, and rotate over the map. A HUD displays resource meters and an event ticker.

Implement the four core systems below (Corruption, Proxy Operations, Strike Capability, and International Pressure), a turn-based or real-time-with-pause loop, resource management, random events, and clear win/lose conditions.

## Visual & Technical Direction

- **Perspective:** 3D regional map ("dollhouse strategy" look), tilt-shift-ish camera. Rotate / zoom / pan.
- **Models:** Low-poly stylized 3D for cities, bases, oil rigs, launch sites, drone swarms, militia icons, naval units. Animated launch/impact effects.
- **UI:** Strategy-game dashboard — resource bars along the top, a left panel for actions, right panel for the selected region, bottom event log/ticker.
- **Art tone:** Muted, slightly propaganda-poster palette with satirical UI flourishes (over-the-top medals, absurd state-media headlines).
- **Suggested stack:** Unity (URP) or Unreal for a full desktop build; Three.js / react-three-fiber for a browser prototype. Specify your target and the assistant can scaffold accordingly.

## Core Systems

### 1. Corruption & Internal Power

The player entrenches control at the cost of legitimacy and long-term stability.

- **Patronage networks:** Assign loyalists to economic sectors (oil, construction, banking, foundations/bonyads). Each grants recurring funds but raises a hidden Corruption meter.
- **Revenue siphoning:** Divert state oil income into off-book accounts — boosts your treasury, lowers public services and Public Morale.
- **Trade-offs:** Higher corruption = more discretionary funds and loyalty, but rising Unrest and vulnerability to purges, defections, and protest cascades.
- **Faction management:** Keep rival power centers (clergy, army, technocrats) in balance; ignore them and face coups.

### 2. Proxy Operations (Neighbouring Countries)

Project influence abroad without direct war.

- **Network building:** Deploy advisors, funnel funds, and arm local militias on the regional map to build a proxy footprint per country.
- **Escalation dial:** Each proxy front has an intensity slider (political support → funding → arming → active conflict). Higher intensity = more regional influence but more International Pressure and risk of blowback.
- **Supply lines:** Manage smuggling routes; enemy interdiction can sever them.
- **Contested provinces:** Rival powers back opposing factions — creating tug-of-war control meters over territory.

### 3. Strike Capability (Missiles & Drones)

An abstracted deterrence-and-escalation minigame.

- **Arsenal building:** Invest in production of ballistic missiles, cruise missiles, and drone swarms; each has range/cost/accuracy stats represented as simple game numbers.
- **Launch mechanic:** Select a launch site and target on the map; watch a stylized trajectory/impact animation. Outcomes affect target integrity and your standing.
- **Retaliation & defense:** Every strike raises a Retaliation Risk gauge; build air-defense to intercept incoming counter-strikes. Overreach triggers coalition responses.
- **Deterrence value:** Holding an arsenal without firing can itself be a strategic bargaining chip in the diplomacy layer.

### 4. International Pressure & Diplomacy

- **Sanctions meter:** Aggression and corruption raise sanctions, which throttle oil revenue and tech access.
- **Diplomacy actions:** Negotiate ceasefires, cut deals, deny involvement (a "plausible deniability" stat tied to how covert your proxy ops are).
- **Great-power attention:** A rising heat meter that, when maxed, unlocks harsher enemy interventions.

## Resources / Economy

- **Treasury** (oil income, smuggling, siphoned funds)
- **Influence Points** (spent on proxy expansion & diplomacy)
- **Military Assets** (units, missiles, drones)
- **Loyalty** (internal factions)
- **Public Morale** (protest/unrest risk)
- **International Heat** (sanctions & intervention risk)

## Core Loop

1. Collect income & resolve events.
2. Allocate funds: internal patronage vs. military vs. proxies.
3. Run operations (expand a proxy front, launch a strike, suppress unrest, negotiate).
4. World reacts — sanctions, retaliation, protests, defections.
5. Rebalance the meters and repeat.

## Win / Lose Conditions

- **Win:** Achieve regional hegemony (control X influence across the map) while surviving N turns without regime collapse. Alternate victories: economic dominance, or a negotiated grand bargain.
- **Lose:** Regime collapse via mass uprising (Morale → 0), decapitation from foreign strike, coup from neglected factions, or total economic strangulation.

## Events & Flavor

- Randomized event cards: leaked corruption scandal, defecting commander, drone shot down, protest wave, assassination attempt, back-channel peace offer.
- Satirical state-media headlines that spin every disaster as a triumph (Tropico-style).

## Optional Stretch Features

- Tech tree (asymmetric warfare, cyber, air defense, disinformation).
- Multiple difficulty scenarios / historical-flavored start states.
- A "reformist ending" branch where you dismantle your own network.
- Leaderboards for fastest hegemony or highest survived-sanctions score.
