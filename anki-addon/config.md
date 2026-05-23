# VESTRIPPN Anki Sync

Pushes your Anki stats to the VESTRIPPN dashboard automatically while Anki is open.

- **endpoint** — your dashboard API. Default: `https://vestrippn.vercel.app/api/anki`
- **secret** — must match `ANKI_SYNC_SECRET` set in your Vercel environment variables. **Required.**
- **interval_minutes** — how often to push while Anki is running (default `15`).
- **notify** — show a small tooltip on each sync (default `false`).

It also syncs on launch and after every AnkiWeb sync.
Manual push: **Tools → Sync to VESTRIPPN now**.
