#!/usr/bin/env bash
# Seed the feed with SYNTHETIC sample posts via the public API. Usage: B=http://localhost:3100 scripts/seed-feed.sh
B=${B:-http://localhost:3100}
run() { # look selfie caption
  local look=$1 selfie=$2 cap=$3 id st
  id=$(curl -s -X POST $B/api/session/sample -H 'content-type: application/json' -d "{\"sampleId\":\"$look\"}" | python3 -c "import json,sys;print(json.load(sys.stdin)['id'])") || return
  curl -s -X POST $B/api/session/$id/selfie -F "selfie=@public/samples/$selfie.jpg;type=image/jpeg" -o /dev/null
  for i in $(seq 1 60); do st=$(curl -s $B/api/session/$id | python3 -c "import json,sys;print(json.load(sys.stdin)['applyOriginal']['status'])"); [ "$st" = pending ] && sleep 4 || break; done
  [ "$st" = done ] || { echo "$look/$selfie ② $st"; return; }
  curl -s -X POST $B/api/session/$id/translate -o /dev/null
  for i in $(seq 1 60); do st=$(curl -s $B/api/session/$id | python3 -c "import json,sys;d=json.load(sys.stdin);print(d['applyTranslated']['status'],(d.get('styled') or {}).get('status','idle'),(d.get('mannequin') or {}).get('status','idle'),(d.get('products') or {}).get('status'))"); case "$st" in *pending*|*idle*) sleep 4;; *) break;; esac; done
  local code=$(curl -s -X POST $B/api/posts -H 'content-type: application/json' -d "{\"sessionId\":\"$id\",\"caption\":\"$cap\",\"includeLook\":true}" -o /dev/null -w "%{http_code}")
  echo "$look/$selfie → $st post $code"
}
pairs=(
  "burgundy-fall|me-deep-warm|Burgundy lips for fall, deep warm edition"
  "maple-latte|me-medium-olive|Maple latte eyes on olive skin"
  "toasted-beige|me-tan-golden|Toasted beige, tan and golden"
  "cocoa-ribbon|me-medium-deep-red|Cocoa baked look, red undertones"
  "rosewood-chic|me-light-neutral|Rosewood, but make it soft"
  "cashmere-muse|me-fair-cool|Cashmere neutrals for fair cool skin"
  "frost-silver|me-deep-cool|Frost silver that actually shows on deep skin"
  "lavender-snow|me-light-medium-warm|Lavender snow without the wash-out"
  "dew-bob|me-tan-golden|Dewy bob day"
  "honey-braids|me-deep-warm|Honey glow, braids and gold"
  "scarlet-edge|me-medium-olive|Scarlet edge, concert-ready"
  "noir-wing|me-deep-cool|Noir wing, same drama"
  "pure-peach|me-light-neutral|Pure peach, pure comfort"
  "milky-ribbon|me-fair-cool|Milky ribbon, fair and cool"
)
N=${N:-4}; k=0
ONLY=${ONLY:-}
for p in "${pairs[@]}"; do IFS='|' read -r a b c <<<"$p"; [ -n "$ONLY" ] && [[ ",$ONLY," != *",$a,"* ]] && continue; run "$a" "$b" "$c" & k=$((k+1)); [ $((k % N)) -eq 0 ] && wait; done; wait
