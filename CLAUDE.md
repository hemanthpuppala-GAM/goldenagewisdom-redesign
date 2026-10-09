# goldenagewisdom.org — live site (working agreements for Claude Code)

This repo **is** the live website at https://goldenagewisdom.org. It is a static site — plain HTML,
JS/JSX run in the browser, and three small PHP helpers. There is no build step: the files here are
uploaded as-is to `public_html/goldenagewisdom.org/` on GoDaddy cPanel.

> 8 Oct 2026: the whole server folder was deleted and rebuilt from this repo. Anything that lives
> only on the server can be lost. **If it matters, it must be committed here.**

## What is served
| URL | File |
|---|---|
| `/` | `index.html` (homepage; mandala hero) |
| `/join` | `Member Flow.dc.html` (member area, Google sign-in) |
| `/peace` | `mass-meditation.html` |
| `/circle` | `circle.html` |
| `/volunteer` | `volunteer.html` → posts to `signup.php` |
| `/desk` | `Support Desk.dc.html` (core-team call log, see `SUPPORT-DESK.md`) |
| `/film`, `/launch`, `/privacy` | `Intro Film.dc.html`, `Launch.dc.html`, `Privacy.dc.html` |

Routing lives in `htaccess.txt` — it is uploaded and **renamed to `.htaccess`** on the server. Keep it
identical to the server copy (CRLF line endings). Any new page needs a rewrite rule here.

Runtime shared by pages: `support.js` (the `.dc.html` page runtime), `gaw-config.js` (roles, admin
emails, Google client ID — edit only this file for roles), `gaw-backend.js` (Supabase RPCs),
`gaw-i18n.js` / `gaw-phrases.js` (EN + 4 Indian languages), `sw.js` + `pwa.js` (offline cache).

Not served / drafts: `Home.dc.html`, `Home Dark.dc.html`, `Home One-Page.dc.html`,
`Home Mandala.dc.html` (superseded by `index.html`), `Admin Panel.dc.html`, `* (1).*`, `index (3).html`.

## Rules
- **Bump the service-worker version in `sw.js` (`const V = 'gaw-vNN'`) whenever any page or asset
  changes.** Returning visitors otherwise keep the old cached page. After deploying, load the site twice.
- **Data lives in Supabase** (project `aicjclttdubvaslootfz`): members, practice history, support desk.
  `gaw-backend.js` holds only the public anon key; tables are reachable only through RPCs. Schema/SQL
  changes are run by a human in the Supabase SQL editor — commit the `.sql` file alongside the change.
- **Never commit secrets.** `gaw-secrets.php` (Anthropic key for `chat.php`, mail config for
  `signup.php`) lives *outside* the web root on the server; `data/` (Stripe key, signup fallback log)
  is server-only. Both are gitignored. The repo is **public**.
- `.htaccess` sets a strict Content-Security-Policy. A new third-party script, image host, iframe or
  API must be added to the CSP or it will be blocked in production.
- Do not touch `public_html/goldenagewisdom.org/staging/` — that is the MemberDashboard staging app
  (separate repo: `hemanthpuppala-GAM/MemberDashboard`).

## Check, preview, deploy
- `python3 tools/check_site.py` — fails on missing assets, broken rewrite targets, JS syntax errors,
  or a missing `sw.js` version. Known server-only gaps are listed in `KNOWN_MISSING` there; when one is
  found, commit the file and remove it from the list. Runs automatically at session start.
- Preview: `python3 -m http.server 8000` → http://localhost:8000/ (clean paths like `/join` need Apache;
  open the `.dc.html` file directly instead).
- Deploy: GitHub → Actions → **Deploy live site** → Run workflow. `dry-run` (default) lists changes;
  `deploy` uploads over FTPS. It never deletes files it didn't upload. Needs repo secrets
  `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD` (cPanel FTP account rooted at the site folder).
- Backup: **Backup live site** runs nightly and keeps an AES-256 encrypted copy of the server folder for
  30 days (needs secret `BACKUP_PASSPHRASE`). Restore: `gpg -d goldenagewisdom-*.tar.gz.gpg | tar -xz`.
  It cannot reach `gaw-secrets.php` (outside the FTP root) — keep that backed up separately.

## Design source
Designs come from Claude Design (`*.dc.html` are its exported pages). `github.md` records the last
design↔repo sync. When a page changes in code, note it in the PR so the design project can mirror it.
