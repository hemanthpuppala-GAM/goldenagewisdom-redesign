# Golden Age Wisdom — Developer Handoff
Redesign concept + hardening plan for the Laravel 11 / Vue 3 (Inertia) app in `Goldenagewebsite-master`. Domain: **goldenagewisdom.org** (GoDaddy).

## 1. What the design delivers
- `Home.dc.html` — redesigned public homepage (glassmorphism, golden cosmic theme, chatbot, language switcher stub)
- `Intro Film.dc.html` — 88s animated intro video (exportable), covering silence → breath/prana gap → sahasrara → kundalini awakening/oneness
- `Member Flow.dc.html` — OAuth sign-in screen → member dashboard (streaks, journal, gallery uploads, event registration, meditation session overlay)

Map these to Vue pages: `Welcome.vue`, a new `IntroFilm.vue` (or embed exported MP4), `Auth/Login.vue`, `Dashboard.vue`, `Journal/*`, new `Gallery.vue`.

## 2. OAuth (Google / Facebook / Apple) — Laravel Socialite
```bash
composer require laravel/socialite socialiteproviders/apple
```
- Routes: `GET /auth/{provider}/redirect`, `GET /auth/{provider}/callback` (whitelist `provider in ['google','facebook','apple']` — never interpolate freely).
- On callback: `firstOrCreate` by `provider + provider_id` (NOT by email alone — prevents account takeover via unverified email). Store `email_verified_at` only if provider reports verified.
- Use `->stateless()` never; keep OAuth `state` CSRF check ON (default).
- Keep secrets in `.env` only; never commit. Rotate if the repo was ever public.
- Apple requires a Services ID + private key (p8) and a registered return URL on `https://goldenagewisdom.org`.

## 3. Database schema (MySQL 8 / MariaDB)
```
users            id, name, email (unique, nullable for Apple private relay), avatar_url,
                 email_verified_at, remember_token, timestamps
social_accounts  id, user_id FK, provider, provider_id, UNIQUE(provider, provider_id)
sessions_log     id, user_id, started_at, duration_sec, meditation_id nullable  -- streaks derive from this
meditations      id, title, description, duration_sec, media_path, media_type, is_published
journal_entries  id, user_id FK, body_encrypted TEXT, created_at   -- encrypt with Laravel Crypt (casts: 'encrypted')
events           id, title, starts_at, ends_at, location, description, capacity nullable
event_registrations id, user_id FK, event_id FK, UNIQUE(user_id, event_id)
media_uploads    id, user_id FK, disk_path, mime, width, height, sha256, status(pending|approved|rejected)
donations        id, user_id nullable, amount, currency, provider_ref, status
```
Streak = consecutive days with a `sessions_log` row (compute in a query or nightly job; don't trust a client-sent counter).

## 4. Security checklist (the "no leaks / no hacks" list)
**Transport & headers**
- Force HTTPS (`URL::forceScheme('https')` in prod) + HSTS.
- Middleware headers: `Content-Security-Policy` (no `unsafe-inline` for scripts; Vite nonce), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` minimal.

**Auth & session**
- Session cookies: `secure`, `http_only`, `same_site=lax` (config/session.php).
- Rate-limit auth + callback routes: `RateLimiter` (e.g. 10/min/IP) and throttle chatbot/contact endpoints.
- Regenerate session on login (`$request->session()->regenerate()`), invalidate on logout.
- No passwords stored at all if OAuth-only; if you keep email+password later, bcrypt/argon2id via Laravel defaults + Have-I-Been-Pwned check.

**Uploads (member gallery)**
- Validate server-side: `image` rule + explicit mime whitelist (jpeg/png/webp), max size (e.g. 8 MB), max dimensions.
- Re-encode every image with Intervention/Image (strips EXIF/GPS + kills polyglot payloads); never serve the original bytes.
- Random storage names (`Str::uuid()`), store OUTSIDE web root or on S3-compatible storage; serve via signed URLs.
- Reject SVG uploads entirely (XSS vector).
- Optional moderation queue (`status=pending`) before photos appear publicly.

**Data**
- Journal entries: Eloquent `casts = ['body' => 'encrypted']` — encrypted at rest, key = `APP_KEY` (back it up securely; losing it loses journals).
- Mass-assignment: `$fillable` everywhere; FormRequest validation on every write.
- SQL: Eloquent/parameter binding only — no raw string queries.
- XSS: Vue escapes by default; never `v-html` user content.
- CSRF: Inertia/axios already sends the token; keep `VerifyCsrfToken` on all web routes.
- Backups: nightly `mysqldump` + offsite copy; test restores.

**Ops**
- `APP_DEBUG=false` in prod (debug pages leak env/secrets).
- Dependabot/`composer audit` + `npm audit` in CI.
- Admin routes behind a `role` gate + 2FA for admins.
- Log auth events (logins, failed callbacks) — Laravel's `Illuminate\Auth\Events`.

## 5. Replace localStorage content store
`resources/js/content.js` currently keeps events/meditations/knowledge in localStorage. Swap `loadContent/saveContent` for API calls backed by the tables above (schema was kept compatible on purpose). Same for `journalEntries.js`, `donation.js`, `qrHistory.js`.

## 6. Chatbot
The design ships a rule-based "Wisdom Guide". For production keep it server-side (POST /api/chat, rate-limited) so any LLM key never reaches the browser.

## 7. GoDaddy / hosting notes — matched to the purchased bundle (receipt 7/21/2026)
Owned: .ORG domain (2 yrs) · Full Domain Protection · **Web Hosting Deluxe (1 yr)** · Microsoft 365 Email Essentials (1 yr trial) · Website Security Standard (1 yr).

**Phase 1 — launch the static site now (uses Web Hosting Deluxe as-is):**
- cPanel → File Manager → upload the design files to `public_html/`; rename `Home.dc.html` → keep, and add an `index.html` redirect (or set Home as index). Site is live at goldenagewisdom.org immediately.
- Enable the included SSL in cPanel (or via Website Security) and force HTTPS.
- Set up `info@goldenagewisdom.org` in Microsoft 365 Email Essentials (GoDaddy walks through MX records) — use it for OAuth provider consoles, chatbot contact, and donation receipts.
- Website Security Standard: turn on malware scanning + monitoring for the domain.

**Phase 2 — member system (Laravel):**
- Web Hosting Deluxe is shared cPanel PHP hosting: it CAN run Laravel (PHP 8.x selector, MySQL DBs included, deploy via cPanel Git or upload) but has no SSH on some plans and limited process control — acceptable for a small NPO launch; the DB schema in §3 uses its bundled MySQL.
- If it becomes limiting, keep the domain + email at GoDaddy and point an A record at a small VPS (Hetzner/DO) — nothing else changes.
- Renewal watch: hosting + security + email all lapse in 1 year; domain in 2. Diarize renewals (prices roughly double off-promo).

**DNS:** A record → hosting IP (auto-set since hosting is GoDaddy), `www` CNAME → apex; OAuth redirect URIs on `https://goldenagewisdom.org/auth/{provider}/callback`.

## 8. Suggested repo plan (for the team pitch)
Branch `redesign-2026`: commit these design files + this doc under `/design`, open a PR titled "World-class redesign concept — homepage, intro film, member area, security plan" so the team can review the concept before implementation.
