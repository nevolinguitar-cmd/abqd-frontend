#!/usr/bin/env bash
set -euo pipefail

echo "== SYMLINK CHECK =="
ls -la /opt/abqd/static || true
echo "REALPATH: $(readlink -f /opt/abqd/static)"

echo ""
echo "== PROD ASSETS: NO BAK ==
echo ""
echo "== PROD: extracted scripts present =="
ls -la /opt/abqd/static/assets | egrep -q "constructor\.js|u-inline\.js" \
  && echo "OK: constructor.js & u-inline.js exist in prod assets" \
  || { echo "ERROR: extracted js missing in prod assets"; exit 1; }

echo ""
echo "== PROD: no huge inline scripts (auth/constructor/u) =="
python3 - <<'PY2'
from pathlib import Path
import re
checks = [
  ("/opt/abqd/static/auth/index.html", 1000),
  ("/opt/abqd/static/constructor/index.html", 1000),
  ("/opt/abqd/static/u/index.html", 3000),
]
bad=False
for f,limit in checks:
    s=Path(f).read_text("utf-8",errors="ignore")
    inline=re.findall(r'<script(?![^>]+src=)[^>]*>(.*?)</script>', s, flags=re.S|re.I)
    mx=max([len(x) for x in inline], default=0)
    print(f, "max_inline_len:", mx)
    if mx > limit:
        bad=True
if bad:
    raise SystemExit("ERROR: huge inline scripts still present in prod HTML")
print("OK: no huge inline scripts")
PY2
"
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
