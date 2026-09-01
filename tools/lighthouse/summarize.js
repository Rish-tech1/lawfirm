const path = require('path');
const r = require(path.resolve(process.argv[2]));

console.log('=== ' + r.finalDisplayedUrl + ' (' + r.configSettings.formFactor + ') ===');
for (const [k, v] of Object.entries(r.categories)) {
  console.log('  ' + k.padEnd(16), v.score === null ? 'n/a' : Math.round(v.score * 100));
}

console.log('--- metrics ---');
for (const k of [
  'first-contentful-paint',
  'largest-contentful-paint',
  'total-blocking-time',
  'cumulative-layout-shift',
  'speed-index',
]) {
  const a = r.audits[k];
  if (a) console.log('  ' + k.padEnd(26), (a.displayValue || '').padEnd(10), 'score', a.score);
}

console.log('--- opportunities / diagnostics (score < 1) ---');
const rows = [];
for (const [id, a] of Object.entries(r.audits)) {
  if (a.score === null || a.score >= 1) continue;
  if (a.scoreDisplayMode === 'informative' || a.scoreDisplayMode === 'notApplicable') continue;
  const savings = a.details && a.details.overallSavingsMs ? Math.round(a.details.overallSavingsMs) : 0;
  const bytes = a.details && a.details.overallSavingsBytes ? Math.round(a.details.overallSavingsBytes / 1024) : 0;
  rows.push({ id, score: a.score, title: a.title, dv: a.displayValue || '', savings, bytes });
}
rows.sort((a, b) => b.savings - a.savings || a.score - b.score);
for (const x of rows) {
  console.log(
    '  ' + (x.score === 0 ? 'FAIL' : 'WARN'),
    x.id.padEnd(38),
    (x.savings ? x.savings + 'ms' : '').padEnd(8),
    (x.bytes ? x.bytes + 'KiB' : '').padEnd(8),
    x.dv
  );
}

// LCP element + long chains, the two that usually explain a low perf score
const lcpEl = r.audits['largest-contentful-paint-element'];
if (lcpEl && lcpEl.details && lcpEl.details.items) {
  console.log('--- LCP element ---');
  console.log(JSON.stringify(lcpEl.details.items, null, 1).slice(0, 2000));
}
