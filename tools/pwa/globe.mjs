// Build globe data: land dots (Fibonacci sphere ∩ Natural Earth land) + country centres.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const [, , modDir, rawDir, outFile] = process.argv;
const require = createRequire(path.join(modDir, 'x.js'));
const topo = require('topojson-client');
const d3 = await import(path.join(modDir, 'node_modules/d3-geo/dist/d3-geo.mjs'));
const landTopo = JSON.parse(fs.readFileSync(path.join(modDir, 'node_modules/world-atlas/land-110m.json')));
const countriesTopo = JSON.parse(fs.readFileSync(path.join(modDir, 'node_modules/world-atlas/countries-110m.json')));
const land = topo.feature(landTopo, landTopo.objects.land);

const N = 14000, dots = [];
const golden = Math.PI * (3 - Math.sqrt(5));
for (let i = 0; i < N; i++) {
  const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = golden * i;
  const lat = Math.asin(y) * 180 / Math.PI;
  let lon = Math.atan2(Math.sin(th) * r, Math.cos(th) * r) * 180 / Math.PI;
  if (lat < -60) continue; // skip Antarctica: cleaner look
  if (d3.geoContains(land, [lon, lat])) dots.push(Math.round(lat * 10), Math.round(lon * 10));
}

// Country centres: median of station coordinates, fallback to polygon centroid matched by English name.
const centres = {};
const med = a => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
for (const f of fs.readdirSync(rawDir)) {
  const cc = f.slice(0, 2).toUpperCase();
  const st = JSON.parse(fs.readFileSync(path.join(rawDir, f)));
  const la = [], lo = [];
  for (const s of st) if (typeof s.geo_lat === 'number' && typeof s.geo_long === 'number' && (s.geo_lat || s.geo_long)) { la.push(s.geo_lat); lo.push(s.geo_long); }
  if (la.length >= 2) centres[cc] = [+med(la).toFixed(2), +med(lo).toFixed(2)];
}
const names = new Intl.DisplayNames(['en'], { type: 'region' });
const polys = topo.feature(countriesTopo, countriesTopo.objects.countries).features;
const norm = s => String(s).toLowerCase().replace(/[^a-z]/g, '');
let fromPoly = 0;
for (const f of fs.readdirSync(rawDir)) {
  const cc = f.slice(0, 2).toUpperCase();
  if (centres[cc]) continue;
  const n = norm(names.of(cc));
  const hit = polys.find(p => norm(p.properties.name) === n || n.startsWith(norm(p.properties.name)) || norm(p.properties.name).startsWith(n));
  if (hit) { const [lo, la] = d3.geoCentroid(hit); centres[cc] = [+la.toFixed(2), +lo.toFixed(2)]; fromPoly++; }
}
fs.writeFileSync(outFile, JSON.stringify({ dots, centres }));
console.log('land dots', dots.length / 2, '| centres', Object.keys(centres).length, '(from polygons', fromPoly + ')', '| bytes', fs.statSync(outFile).size);
