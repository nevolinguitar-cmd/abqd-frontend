#!/usr/bin/env bash
set -euo pipefail

echo "== SYMLINK CHECK =="
ls -la /opt/abqd/static
echo "REALPATH: $(readlink -f /opt/abqd/static)"

echo ""
echo "== PROD ASSETS: NO BAK =="
if find /opt/abqd/static/assets -maxdepth 1 -type f \( -name '*.bak*' -o -name '*.repo.bak*' \) | grep -q .; then
  echo "ERROR: bak files found in /opt/abqd/static/assets"
  find /opt/abqd/static/assets -maxdepth 1 -type f \( -name '*.bak*' -o -name '*.repo.bak*' \) | head -n 80
  exit 1
else
  echo "OK: no bak in /opt/abqd/static/assets"
fi

echo ""
echo "== PROD: extracted scripts present =="
need_ok=1
for f in /opt/abqd/static/assets/auth.js /opt/abqd/static/assets/constructor.js /opt/abqd/static/assets/u-inline.js; do
  if [ ! -f "$f" ]; then
    echo "ERROR: missing $f"
    need_ok=0
  fi
done
if [ "$need_ok" -ne 1 ]; then
  ls -la /opt/abqd/static/assets | head -n 120
  exit 1
else
  echo "OK: auth.js + constructor.js + u-inline.js exist in prod assets"
fi

echo ""
echo "== PROD: no huge inline scripts (auth/constructor/u) =="
python3 - <<'PY'
from pathlib import Path
import re
checks = [
  ("/opt/abqd/static/auth/index.html", 1000),
  ("/opt/abqd/static/constructor/index.html", 1000),
  ("/opt/abqd/static/u/index.html", 3000),
]
bad = False
for f, limit in checks:
    s = Path(f).read_text("utf-8", errors="ignore")
    inline = re.findall(r'<script(?![^>]+src=)[^>]*>(.*?)</script>', s, flags=re.S|re.I)
    mx = max([len(x) for x in inline], default=0)
    print(f, "max_inline_len:", mx)
    if mx > limit:
        bad = True
if bad:
    raise SystemExit("ERROR: huge inline scripts still present in prod HTML")
print("OK: no huge inline scripts")
PY

echo ""
echo "== PROD: script tags reference extracted assets (auth/constructor/u) =="
grep -nE 'src="/assets/(auth|constructor|u-inline)\.js' \
  /opt/abqd/static/auth/index.html \
  /opt/abqd/static/constructor/index.html \
  /opt/abqd/static/u/index.html || { echo "ERROR: script src not found in prod HTML"; exit 1; }
echo "OK: script src tags found"

echo ""
echo "== HTTP HEADERS QUICK =="
for p in auth constructor dashboard tariffs u; do
  echo "--- /$p/ ---"
  curl -sI "https://app.abqd.ru/$p/" | egrep -i 'HTTP/|content-length|last-modified|etag|cache-control' || true
done

echo ""
echo "OK"
