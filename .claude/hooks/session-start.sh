#!/bin/bash
# Cloud sessions: confirm the tools this static site needs are present and
# print the pre-deploy check so Claude starts with the site's current state.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"
command -v python3 >/dev/null || { echo "python3 missing"; exit 0; }

echo "== goldenagewisdom.org site check =="
python3 tools/check_site.py || echo "(site check reported problems — see above)"
echo "Preview locally: python3 -m http.server 8000  →  http://localhost:8000/"
