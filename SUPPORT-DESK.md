# Support Desk — deploy steps

## 1. Supabase (once)
Supabase dashboard → SQL Editor → New query → paste ALL of
`RUN-IN-SUPABASE-support-desk.sql` → Run.

Allowed sign-ins (already in the script):
- 7396112111 · Raman Kumar
- 7396119111 · Aruna K
- 9000000001 · Test User (dummy — disable after testing:
  `update support_agents set active = false where phone = '9000000001';`)

## 2. cPanel → public_html (live site root, next to index.html)
Upload, overwriting the existing file where it exists:
- `Support Desk.dc.html`  (new)
- `gaw-backend.js`        (replaces — adds the support RPCs, nothing else changed)

## 3. Test
Open https://goldenagewisdom.org/Support%20Desk.dc.html
- Enter 9000000001 → Continue → choose a password → signed in.
- Log a call, refresh, confirm it's still there; sign in as another number on
  a second device and confirm the same call appears.

## Admin one-liners (Supabase SQL Editor)
- Add a person:      `insert into support_agents (phone, name) values ('98xxxxxxxx', 'Name');`
- Reset a password:  `update support_agents set pass_hash = null where phone = '98xxxxxxxx';`
- Revoke access:     `update support_agents set active = false where phone = '98xxxxxxxx';`
- Export all calls:  Table Editor → support_calls → Export CSV (or the ↓ CSV button on the desk).
