#!/usr/bin/env bash
# Usage: scripts/new-tool.sh NAME DOMAIN   e.g. scripts/new-tool.sh demo-ruler demoruler.com
set -euo pipefail
NAME="${1:?name needed, e.g. demo-ruler}"; DOMAIN="${2:?domain needed, e.g. demoruler.com}"
HERE="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$(dirname "$HERE")/sites/$NAME"
[ -e "$DEST" ] && { echo "Already exists: $DEST"; exit 1; }
mkdir -p "$DEST"
tar -C "$HERE" --exclude=node_modules --exclude=dist --exclude=.astro --exclude=screenshots --exclude=.wrangler -cf - . | tar -C "$DEST" -xf -
TITLE=$(echo "$NAME" | sed -E 's/-/ /g' | awk '{for(i=1;i<=NF;i++)$i=toupper(substr($i,1,1)) substr($i,2)}1')
CFG="$DEST/src/site.config.ts"
sed -i.bak -E \
  -e "s|^(  name: )'[^']*'|\1'$TITLE'|" \
  -e "s|^(  domain: )'[^']*'|\1'$DOMAIN'|" \
  -e "s|^(  cloudflareProject: )'[^']*'|\1'$NAME'|" \
  -e "s|^(  email: )'[^']*'|\1'hello@$DOMAIN'|" \
  -e "s|^(  owner: )'[^']*'|\1'$TITLE'|" "$CFG"
rm -f "$CFG.bak"
sed -i.bak "s/\"name\": \"microtool-template\"/\"name\": \"$NAME\"/" "$DEST/package.json"; rm -f "$DEST/package.json.bak"
cd "$DEST" && npm install --no-audit --no-fund
echo; echo "Created $DEST"
echo "Next: edit src/site.config.ts (keyword, description, brand), replace src/components/Tool.astro, Article.astro, src/data/faq.ts."
