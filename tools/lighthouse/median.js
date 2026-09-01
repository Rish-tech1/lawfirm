// Prints the median run for one route. Median, not mean: a single contended
// run skews a mean badly, and Lighthouse's own guidance is to take the median.
const fs = require('fs');
const path = require('path');

const [dir, name, route, runsRaw] = process.argv.slice(2);
const runs = Number(runsRaw);

const load = [];
for (let i = 1; i <= runs; i++) {
  const f = path.resolve(dir, `${name}-${i}.json`);
  if (!fs.existsSync(f)) continue;
  try {
    load.push(JSON.parse(fs.readFileSync(f, 'utf8')));
  } catch {
    /* a crashed run writes no/partial JSON — skip it */
  }
}

const ok = load.filter((r) => r.categories?.performance?.score != null);
if (ok.length === 0) {
  console.log(`${route.padEnd(32)}  no valid runs`);
  process.exit(0);
}

const pct = (r, c) => Math.round((r.categories[c]?.score ?? 0) * 100);
ok.sort((a, b) => pct(a, 'performance') - pct(b, 'performance'));
const m = ok[Math.floor(ok.length / 2)];
const dv = (id) => m.audits[id]?.displayValue ?? '-';

console.log(
  route.padEnd(32) +
    String(pct(m, 'performance')).padStart(5) +
    String(pct(m, 'seo')).padStart(6) +
    String(pct(m, 'accessibility')).padStart(6) +
    String(pct(m, 'best-practices')).padStart(6) +
    '   ' +
    dv('first-contentful-paint').padEnd(8) +
    dv('largest-contentful-paint').padEnd(8) +
    dv('total-blocking-time').padEnd(8) +
    dv('cumulative-layout-shift').padEnd(8) +
    `  (n=${ok.length}, spread ${pct(ok[0], 'performance')}-${pct(ok[ok.length - 1], 'performance')})`
);
