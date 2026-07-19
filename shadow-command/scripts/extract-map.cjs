// One-off script: bakes real-world country geometry into src/data/worldGeo.ts
// so the app has no runtime dependency on world-atlas / topojson-client.
const fs = require('fs');
const path = require('path');
const topojson = require('topojson-client');
const topology = require('world-atlas/countries-110m.json');

const geojson = topojson.feature(topology, topology.objects.countries);

// Our playable regions map onto these Natural Earth country names.
// "gulf" is represented by Saudi Arabia (the largest/central Gulf state);
// the smaller Gulf monarchies render as neutral context countries instead.
// "usa" is a distinct "superpower" region: it uses the covert-influence
// ladder (see data/superpower.ts) rather than the military proxy ladder.
const PLAYABLE = {
  iran: 'Iran',
  iraq: 'Iraq',
  syria: 'Syria',
  lebanon: 'Lebanon',
  yemen: 'Yemen',
  gulf: 'Saudi Arabia',
  afghanistan: 'Afghanistan',
  usa: 'United States of America',
};

// Every other country renders as neutral background geography so the map
// covers the whole Earth. Antarctica is dropped: at this projection it'd
// render as a giant, badly distorted bar across the bottom of the map for
// no gameplay value.
const EXCLUDED_CONTEXT_NAMES = new Set(['Antarctica', 'Fr. S. Antarctic Lands']);

// Projection reference centered on Iran. This is a sinusoidal projection:
// longitude is compressed by cos(each point's OWN latitude), not a single
// fixed reference latitude — a fixed cos(latRef) factor made landmasses far
// from Iran's latitude (Greenland, northern Canada/Russia) render far too
// wide (Greenland was ~2x too wide, sprawling across Europe and most of the
// Atlantic), since real meridians converge much faster near the poles than
// a flat cos(32°) factor accounts for.
const LON_REF = 53.5;
const LAT_REF = 32;
const SCALE = 0.5;
const DEG2RAD = Math.PI / 180;

// Normalizes a longitude delta to (-180, 180] — used only to anchor the
// *first* point of each ring to its shortest path from LON_REF.
function wrapDelta(delta) {
  return ((delta + 180) % 360 + 360) % 360 - 180;
}

// Countries whose extent straddles the seam opposite Iran (~Alaska/Yukon)
// were getting torn apart mid-ring by a naive per-point wrap (Canada's
// bounding box was 3x too wide, its Yukon corner snapped to the opposite
// edge of the map), and small islands that happen to sit almost exactly
// antipodal to Iran (e.g. Haida Gwaii, off British Columbia) flew off to
// render on the wrong side of the world by themselves. The fix: keep each
// ring internally contiguous (standard angle-unwrapping relative to the
// previous point), and when a *new* ring starts (a separate island, since
// polygons aren't contiguous across rings), cluster it near the country's
// established anchor ONLY if it's actually geographically close (within
// GEOGRAPHIC_CLUSTER_THRESHOLD_DEG of the anchor's true shortest-path
// distance) — e.g. Haida Gwaii or Sakhalin, a short hop from their
// mainland. A ring that's genuinely far away (French Guiana or French
// Polynesia relative to mainland France, Hawaii relative to the continental
// US) is left at its own independently-anchored position instead of being
// dragged toward the mainland, which previously made countries with
// scattered overseas territories (e.g. France) render an enormous, bogus
// bounding box spanning much of the globe.
const GEOGRAPHIC_CLUSTER_THRESHOLD_DEG = 55;

function unwrapCountry(rawPolygons) {
  let anchorLon = null;
  return rawPolygons.map((rings) =>
    rings.map((ring) => {
      let prevLon = null;
      return ring.map(([lon, lat]) => {
        let adjusted = lon;
        if (anchorLon === null) {
          // Very first point of the whole country.
          adjusted = LON_REF + wrapDelta(lon - LON_REF);
          anchorLon = adjusted;
        } else if (prevLon === null) {
          // First point of a new ring: decide whether to cluster it near
          // the country's anchor or let it stand on its own.
          const distanceFromAnchor = Math.abs(wrapDelta(lon - anchorLon));
          if (distanceFromAnchor < GEOGRAPHIC_CLUSTER_THRESHOLD_DEG) {
            while (adjusted - anchorLon > 180) adjusted -= 360;
            while (adjusted - anchorLon < -180) adjusted += 360;
          } else {
            adjusted = LON_REF + wrapDelta(lon - LON_REF);
          }
        } else {
          while (adjusted - prevLon > 180) adjusted -= 360;
          while (adjusted - prevLon < -180) adjusted += 360;
        }
        prevLon = adjusted;
        return [adjusted, lat];
      });
    })
  );
}

function project([lon, lat]) {
  const x = (lon - LON_REF) * Math.cos(lat * DEG2RAD) * SCALE;
  const z = (lat - LAT_REF) * SCALE * -1; // north = -z
  return [x, z];
}

function round(n) {
  return Math.round(n * 1000) / 1000;
}

function polygonRings(geometry) {
  const rawPolys = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  const unwrapped = unwrapCountry(rawPolys);
  return unwrapped.map((rings) => rings.map((ring) => ring.map(project)));
}

function ringArea(ring) {
  let sum = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, z1] = ring[i];
    const [x2, z2] = ring[i + 1];
    sum += x1 * z2 - x2 * z1;
  }
  return sum / 2;
}

function centroidOfLargestPolygon(polygons) {
  let best = null;
  let bestArea = -Infinity;
  for (const poly of polygons) {
    const outer = poly[0];
    const a = Math.abs(ringArea(outer));
    if (a > bestArea) {
      bestArea = a;
      best = outer;
    }
  }
  let cx = 0;
  let cz = 0;
  let a2 = 0;
  for (let i = 0; i < best.length - 1; i++) {
    const [x1, z1] = best[i];
    const [x2, z2] = best[i + 1];
    const cross = x1 * z2 - x2 * z1;
    cx += (x1 + x2) * cross;
    cz += (z1 + z2) * cross;
    a2 += cross;
  }
  const area = a2 / 2;
  return [cx / (6 * area), cz / (6 * area)];
}

function boundingBox(polygons) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minZ = Infinity;
  let maxZ = -Infinity;
  for (const poly of polygons) {
    for (const ring of poly) {
      for (const [x, z] of ring) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (z < minZ) minZ = z;
        if (z > maxZ) maxZ = z;
      }
    }
  }
  return { minX, maxX, minZ, maxZ };
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function roundPolygons(polygons) {
  return polygons.map((poly) => poly.map((ring) => ring.map(([x, z]) => [round(x), round(z)])));
}

function findFeature(name) {
  const f = geojson.features.find((f) => f.properties.name === name);
  if (!f) throw new Error(`Country not found: ${name}`);
  return f;
}

const playableOut = {};
let overallMinX = Infinity;
let overallMaxX = -Infinity;
let overallMinZ = Infinity;
let overallMaxZ = -Infinity;

for (const [id, name] of Object.entries(PLAYABLE)) {
  const feature = findFeature(name);
  const absPolygons = polygonRings(feature.geometry);
  const [cx, cz] = centroidOfLargestPolygon(absPolygons);
  const relPolygons = absPolygons.map((poly) => poly.map((ring) => ring.map(([x, z]) => [x - cx, z - cz])));
  const bbox = boundingBox(relPolygons);
  const halfW = (bbox.maxX - bbox.minX) / 2;
  const halfH = (bbox.maxZ - bbox.minZ) / 2;
  const buildingRadius = clamp(Math.min(halfW, halfH) * 0.35, 0.12, 1.1);

  playableOut[id] = {
    name,
    polygons: roundPolygons(relPolygons),
    centroid: [round(cx), round(cz)],
    buildingRadius: round(buildingRadius),
  };

  const absBbox = boundingBox(absPolygons);
  overallMinX = Math.min(overallMinX, absBbox.minX);
  overallMaxX = Math.max(overallMaxX, absBbox.maxX);
  overallMinZ = Math.min(overallMinZ, absBbox.minZ);
  overallMaxZ = Math.max(overallMaxZ, absBbox.maxZ);
}

const playableNames = new Set(Object.values(PLAYABLE));
const contextFeatures = geojson.features.filter(
  (f) => !playableNames.has(f.properties.name) && !EXCLUDED_CONTEXT_NAMES.has(f.properties.name)
);

const contextOut = contextFeatures.map((feature) => {
  const name = feature.properties.name;
  const absPolygons = polygonRings(feature.geometry);
  const absBbox = boundingBox(absPolygons);
  overallMinX = Math.min(overallMinX, absBbox.minX);
  overallMaxX = Math.max(overallMaxX, absBbox.maxX);
  overallMinZ = Math.min(overallMinZ, absBbox.minZ);
  overallMaxZ = Math.max(overallMaxZ, absBbox.maxZ);
  return { name, polygons: roundPolygons(absPolygons) };
});

const header = `// AUTO-GENERATED by scripts/extract-map.cjs — do not edit by hand.
// Real-world country borders for every country on Earth except Antarctica
// (Natural Earth 110m via the "world-atlas" npm package), projected to local
// map units with an equirectangular projection centered on Iran (lon
// ${LON_REF}, lat ${LAT_REF}, scale ${SCALE}), wrapped to the shortest path
// around the globe so far-side countries (e.g. the Americas) don't distort.
// Playable country polygons are stored relative to their own centroid;
// context (non-playable) country polygons are stored in absolute map units.
`;

const body = `
export interface CountryGeometry {
  name: string;
  polygons: [number, number][][][];
}

export interface PlayableCountryGeometry extends CountryGeometry {
  centroid: [number, number];
  buildingRadius: number;
}

export const PLAYABLE_GEOMETRY: Record<string, PlayableCountryGeometry> = ${JSON.stringify(playableOut)};

export const CONTEXT_GEOMETRY: CountryGeometry[] = ${JSON.stringify(contextOut)};

export const MAP_BOUNDS = ${JSON.stringify({ minX: overallMinX, maxX: overallMaxX, minZ: overallMinZ, maxZ: overallMaxZ })};
`;

fs.writeFileSync(
  path.join(__dirname, '..', 'src', 'data', 'worldGeo.ts'),
  header + body
);

console.log('Wrote src/data/worldGeo.ts');
for (const [id, v] of Object.entries(playableOut)) {
  console.log(id, v.name, 'centroid', v.centroid, 'buildingRadius', v.buildingRadius);
}
console.log('Context countries:', contextOut.length);
console.log('Overall bounds', { overallMinX, overallMaxX, overallMinZ, overallMaxZ });
