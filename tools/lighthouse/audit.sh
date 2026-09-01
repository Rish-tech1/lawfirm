#!/usr/bin/env bash
#
# Median-of-N Lighthouse audit over every route that matters.
#
# ALWAYS AUDIT A PRODUCTION BUILD. Lighthouse against `next dev` is meaningless —
# unminified bundles, no caching, dev-only React — and will report a performance
# score 20-40 points below the real one. Run:
#
#   npm run build --workspace client
#   npx next start -p 4123 --prefix client   # or: cd client && npx next start -p 4123
#   bash tools/lighthouse/audit.sh baseline 5
#
# Runs are sequential with a settle gap. Overlapping Chrome instances on Windows
# contend for temp dirs and produce garbage: a first pass here reported /about at
# 73 when five clean runs put it at 93. For the same reason, treat any single run
# as noise — the script prints the median and the full spread, and if the spread
# is wider than ~8 points the machine was too busy to trust the number at all.
# Close other browsers before caring about the result.
#
# Usage: bash tools/lighthouse/audit.sh <label> [runs]
set -u

LABEL="${1:-run}"
RUNS="${2:-5}"
PORT="${PORT:-4123}"
HERE="$(cd "$(dirname "$0")" && pwd)"
OUT="$HERE/reports/$LABEL"
export CHROME_PATH="${CHROME_PATH:-C:/Program Files/Google/Chrome/Application/chrome.exe}"

PAGES="/ /about /contact /services /team /faq /testimonials /practice-areas /practice-areas/corporate-law"

if ! curl -s -o /dev/null "http://localhost:$PORT/"; then
  echo "Nothing answering on http://localhost:$PORT — start a production server first." >&2
  exit 1
fi

mkdir -p "$OUT"
printf '%-32s %5s %5s %5s %5s   %-8s %-8s %-8s %-8s\n' ROUTE PERF SEO A11Y BP FCP LCP TBT CLS

for p in $PAGES; do
  name=$(echo "$p" | sed 's#^/$#home#; s#^/##; s#/#-#g')
  for i in $(seq 1 "$RUNS"); do
    npx lighthouse "http://localhost:$PORT$p" \
      --only-categories=performance,seo,accessibility,best-practices \
      --output=json --output-path="$OUT/$name-$i.json" \
      --chrome-flags="--headless=new" --quiet >/dev/null 2>&1
    sleep 1
  done
  # MSYS_NO_PATHCONV stops Git Bash rewriting a leading-slash argv entry into a
  # Windows path ("/" arrives at node as "C:/Program Files/Git/").
  MSYS_NO_PATHCONV=1 node "$HERE/median.js" "$OUT" "$name" "$p" "$RUNS"
done
