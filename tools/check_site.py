#!/usr/bin/env python3
"""Pre-deploy sanity checks for the static goldenagewisdom.org site.

Run from the repo root:  python3 tools/check_site.py
Exits 1 on a problem that would break the live site, 0 otherwise.
"""
import os
import re
import subprocess
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

# Referenced by pages but only ever existed on the server (lost 8 Oct 2026).
# Upload them to public_html/goldenagewisdom.org/assets/ and commit them here,
# then remove them from this list.
KNOWN_MISSING = {
    "assets/hero-hari-day.png",
    "assets/peace-film.mp4",
    "assets/film-poster.png",
    "assets/narration-master-50s-v3.wav",
    "assets/ceremony-ambience.mp3",
    "assets/intro-video.mp4",
    "Demo.dc.html",
    "Demo Video.dc.html",
}

problems, warnings = [], []
sources = [f for f in os.listdir(".") if f.endswith((".html", ".js", ".jsx", ".css"))]

# 1. Every local asset a page references must exist.
asset_re = re.compile(r"assets/[A-Za-z0-9_ ().-]+\.[a-z0-9]{2,5}")
for src in sources:
    with open(src, encoding="utf-8", errors="ignore") as fh:
        for ref in sorted(set(asset_re.findall(fh.read()))):
            if os.path.exists(ref):
                continue
            (warnings if ref in KNOWN_MISSING else problems).append(f"{src}: missing {ref}")

# 2. Every clean-path rewrite in htaccess.txt must point at a real file.
with open("htaccess.txt", encoding="utf-8") as fh:
    for target in re.findall(r'^RewriteRule \^[^ ]+ "([^"]+)" \[L\]', fh.read(), re.M):
        if not os.path.exists(target):
            msg = f"htaccess.txt: rewrite target missing: {target}"
            (warnings if target in KNOWN_MISSING else problems).append(msg)

# 3. The service worker must carry a cache version (bump it on every page change).
with open("sw.js", encoding="utf-8") as fh:
    m = re.search(r"const V = '(gaw-v\d+)'", fh.read())
if not m:
    problems.append("sw.js: no cache version (const V = 'gaw-vNN') found")

# 4. Plain JS files must parse (needs node; skipped if unavailable).
try:
    for js in sorted(f for f in os.listdir(".") if f.endswith(".js")):
        r = subprocess.run(["node", "--check", js], capture_output=True, text=True)
        if r.returncode:
            problems.append(f"{js}: syntax error\n{r.stderr.strip()}")
except FileNotFoundError:
    warnings.append("node not installed: JS syntax check skipped")

for w in warnings:
    print(f"warn: {w}")
for p in problems:
    print(f"FAIL: {p}")
print(f"sw.js cache version: {m.group(1) if m else 'none'}")
print("OK" if not problems else f"{len(problems)} problem(s)")
sys.exit(1 if problems else 0)
