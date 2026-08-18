# Upload v3 to cPanel

Everything changed today is in this folder. Nothing else needs to be touched — the rest of
the live site (Member Flow, Privacy, gaw-config.js, telemetry.js, all other assets) is
unchanged and stays as it is on the server.

## What is in here

Upload every file below into `public_html/`, keeping the folder structure.

| File | Goes to | Why |
|---|---|---|
| `index.html` | `public_html/index.html` | The home page, taken from the version that is actually live. Sunday now carries the same schedule as every other day, the peace countdown no longer skips it, the centre chakra and the pill above the headline point at `/peace`, and the mandala solver no longer drops the wheel across Dr Hari's face. **Overwrites.** |
| `mass-meditation.html` | `public_html/mass-meditation.html` | Served at **`/peace`**. The 8:30 PM IST sit: Zoom primary, YouTube overflow, the film, the four panels. Runs every day now. |
| `circle.html` | `public_html/circle.html` | **New.** Served at **`/circle`** — the Unbroken Circle: the 24-hour wheel, the biggest-gap panel, who is sitting near you. It was built but never deployed, which is why it was missing from the live site. The home page now links to it from a third pill under the headline. |
| `volunteer.html` | `public_html/volunteer.html` | **New.** Served at **`/volunteer`** — seven teams to choose from, contact details, availability and a free-text note. Posts to `signup.php` with role `volunteer`. Linked from the home page footer. |
| `signup.php` | `public_html/signup.php` | **Overwrites.** Now accepts phone, teams, availability and a note, adds those columns to the existing database (nothing is lost), and includes them in the notification email. |
| `Member Flow.dc.html` | `public_html/Member Flow.dc.html` | The member area, served at `/join`. The schedule solver used to skip Sunday entirely — Saturday night jumped two days ahead and Sunday showed "No sessions on Sunday". All three sessions now run daily. Also adds a demo account on the sign-in screen. **Overwrites.** |
| `gaw-i18n.js` | `public_html/gaw-i18n.js` | Three keys in all five languages: `nPeace`, `nPeaceRing`, `watchIntro`. **Overwrites.** |
| `gaw-phrases.js` | `public_html/gaw-phrases.js` | The schedule caption now reads "Every day · including Sunday" in all five languages. **Overwrites.** |
| `sw.js` | `public_html/sw.js` | Cache version bumped to `gaw-v46`. **Upload this every time a page changes** — without it returning visitors keep being served the old cached page and none of your changes appear. **Overwrites.** |
| `htaccess.txt` | `public_html/.htaccess` (rename after upload) | Adds the `/peace` clean path, redirects old filenames to it, caches `.mp4` for a year, registers the video MIME type. **Overwrites.** |
| `support.js` | `public_html/support.js` | The page runtime. Overwrite only if the live copy is older; if the site works after uploading the pages, you can skip it. |
| `assets/film-poster.png` | `public_html/assets/` | New. Poster frame for the film. |
| `assets/peace-film.mp4` | `public_html/assets/` | New. ~15 MB — see the warning below. |

## Steps

1. **Back up first.** In cPanel File Manager select `index.html`, `Member Flow.dc.html`,
   `gaw-i18n.js`, `gaw-phrases.js`, `sw.js` and `.htaccess`, Compress → `backup-before-v3.zip`.
2. Upload `assets/film-poster.png` and `assets/peace-film.mp4` into `public_html/assets/`.
3. Upload `mass-meditation.html`, `circle.html`, `volunteer.html` and `signup.php`.
4. Upload `htaccess.txt`, then rename it to `.htaccess` (Settings → Show Hidden Files first).
   **Load the home page immediately afterwards** — a bad rules file 500s the whole domain,
   and the fix is restoring the backup from step 1. This is the riskiest file in the set.
5. Open `https://goldenagewisdom.org/peace`, `/circle` and `/volunteer` and check all three load. Send one test volunteer signup and confirm the email arrives at info@goldenagewisdom.org.
6. Upload `gaw-i18n.js`, `gaw-phrases.js`, `Member Flow.dc.html`, `sw.js`, then `index.html`.
7. **Load the site twice.** The first load installs the new service worker; the second is
   served by it. Then click the centre chakra — it should take you to `/peace`.

## Warnings

**The 15 MB film.** It loads as a background loop on desktop. On shared hosting that is
bandwidth every visitor pays for. Two safe choices: upload it and watch your bandwidth for
a week, or skip step 2's mp4, upload only the poster — the page falls back to the still
image and looks fine. The overlay player ("Watch the film") needs the mp4, so if you skip
it, that button will show a blank player.

**Service worker cache.** The site registers a service worker (`sw.js`) that serves the
last copy it saw. This is the usual reason an upload "does nothing". `sw.js` is now in
this folder with its version bumped — upload it alongside the pages, then load the site
twice (the first load installs the new worker, the second serves from it). If you are
still seeing the old page: DevTools → Application → Service Workers → Unregister, or open
the site in a private window to confirm the files on the server are actually the new ones.

**Not included on purpose:** `Device Preview.dc.html` (internal testing tool),
`REVIEW-v3.md`, and every `Peace v1`–`v4` draft. None of them belong on the live server.

## Still outstanding from the review

- `deploy/` and `export/cpanel-upload/` in the project are pre-v3 snapshots. They are now
  stale in a second way and should be regenerated or deleted so nobody uploads them by
  mistake.
- The pledge panel no longer quotes a participant count. If you want a real one later, it
  needs a backend endpoint.
