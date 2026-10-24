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
  "cherry-blossom|selfie-medium-olive|Cherry blossom, olive edition 🌸"
  "smoky-plum|selfie-fair-cool|Girl crush plum but softer for fair skin"
  "coral-summer|selfie-deep-cool|Coral summer that actually shows up on me"
  "mlbb-nude|selfie-tan-warm|My everyday MLBB, tan version"
  "red-velvet|selfie-medium-deep-warm|Red velvet lip, warmed up"
  "icy-lilac|selfie-light-neutral|Icy lilac without looking washed out"
  "golden-hour|selfie-deep-cool|Golden hour on deep cool skin ✨"
  "strawberry-milk|selfie-tan-warm|Strawberry milk blush but make it tan"
  "bold-fuchsia|selfie-medium-olive|Concert-ready fuchsia"
  "mauve-cool|selfie-medium-deep-warm|Mauve that doesn't go gray on me"
  "brick-sunset|selfie-fair-cool|Brick sunset, toned for fair cool"
  "peach-glass|selfie-light-neutral|Peach glass skin day"
)
N=${N:-4}; k=0
ONLY=${ONLY:-}
for p in "${pairs[@]}"; do IFS='|' read -r a b c <<<"$p"; [ -n "$ONLY" ] && [[ ",$ONLY," != *",$a,"* ]] && continue; run "$a" "$b" "$c" & k=$((k+1)); [ $((k % N)) -eq 0 ] && wait; done; wait
