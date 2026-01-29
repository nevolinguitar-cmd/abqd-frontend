#!/usr/bin/env bash
set -euo pipefail

echo "== SYMLINK CHECK =="
ls -la /opt/abqd/static || true
echo "REALPATH: $(readlink -f /opt/abqd/static)"

echo ""
echo "== PROD ASSETS: NO BAK =="
if ls -1 /opt/abqd/static/assets 2>/dev/null | egrep -qi 'bak'; then
  echo "FOUND BAK FILES IN /opt/abqd/static/assets (bad)"
  ls -1 /opt/abqd/static/assets | egrep -i 'bak' || true
  exit 2
else
  echo "OK: no bak in /opt/abqd/static/assets"
fi

echo ""
echo "== HTTP HEADERS QUICK =="
for p in auth constructor dashboard tariffs u; do
  echo "--- /$p/ ---"
  curl -sI "https://app.abqd.ru/$p/" | egrep -i 'HTTP/|content-length|last-modified|etag|cache-control' || true
done

echo ""
echo "OK"
