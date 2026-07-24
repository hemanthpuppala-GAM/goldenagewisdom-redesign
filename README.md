# Golden Age Wisdom — Website Redesign Concept

Redesigned experience for **goldenagewisdom.org** — a non-profit meditation platform.

## What's inside
| File | Purpose |
|---|---|
| `Home.dc.html` | Public homepage (golden cosmic + glassmorphism, chatbot, events, meditations) |
| `Intro Film.dc.html` + `intro-film.jsx` | 70s animated intro film (silence → breath → sahasrara → kundalini → oneness → 40-day challenge → Satya Yugam) |
| `Member Flow.dc.html` | OAuth sign-in → member dashboard (streaks, journal, gallery, events) |
| `Demo Video.dc.html` + `demo-video.jsx` | 62s product walkthrough video |
| `Golden Age Wisdom - Intro Film.html` | Standalone offline build of the intro film |
| `HANDOFF.md` | Engineering plan: Laravel Socialite OAuth, DB schema, full security checklist, GoDaddy/DNS |
| `assets/` | Images + generated audio |
| `animations-v2.jsx`, `support.js`, `tweaks-panel.jsx`, `deck-stage.js`, `image-slot.js` | Runtime/framework files |

## Viewing
The .dc.html pages are self-running — serve the folder with any static server (`npx serve .`) and open `Home.dc.html`.

## Implementation plan
See [HANDOFF.md](HANDOFF.md) for the production build plan (OAuth, database, security hardening, hosting).
