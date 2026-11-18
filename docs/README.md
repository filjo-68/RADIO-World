# Radio World — PWA

© 2026 Radio World. All rights reserved. See [`LICENSE.txt`](LICENSE.txt) and [`THIRD_PARTY_NOTICES.txt`](THIRD_PARTY_NOTICES.txt).

An installable web app with more than 51,000 live radio stations from 249 countries.

## Features
- **Hero section with an interactive 3D globe.** It is drawn as dots on a canvas. You can spin it, and tapping a country's signal opens its stations. Signal arcs travel from the station that is playing.
- **Buttons:** “Listen now”, “Surprise me” (a random popular station from a random country) and an install card.
- **Player:** keeps playing while you browse. It has a gradient frame while live and controls on the lock screen and on headphones (Media Session).
- **“Now playing” screen:** large artwork, visualiser, tags, share button and sleep timer (15–90 min, fades out at the end).
- **Themes:** light, dark and system, with an aurora background and a light film grain.
- **Language:** Bulgarian or English. Country names come from `Intl.DisplayNames`.
- **Search and sort:** for countries and stations. Favorites and recently played are stored on the device.
- **Install instructions** for iPhone/iPad, Android, Chrome/Edge, Safari for Mac and Firefox.
- **Offline:** the app, country list, flags, fonts, globe and favorites work without internet. Station lists of countries you have opened are cached, and a built-in snapshot from 2026-11-18 is the fallback. **The radio streams themselves are live and always need internet.**

## Run
**GitHub Pages:** Settings → Pages → Deploy from a branch → `main` and folder `/docs` → Save.

**Locally (Python 3):** from the `docs` folder run `python3 -m http.server 8080`, then open http://localhost:8080.

## Known limitation: HTTP-only stations over HTTPS
About 35% of stations stream only over `http://`. On an `https://` page (such as GitHub Pages), browsers upgrade those streams to `https://`, which works only if the station's server supports it.
Such stations are marked **HTTP** and can be hidden with *HTTPS only*. After 15 seconds without a connection the app tells you why.

## Build (`tools/pwa/`)
Run these from the repo root:
- `python3 tools/pwa/data.py <raw-dumps> docs` — station snapshot and `countries.json`.
- `node tools/pwa/globe.mjs <node_modules-dir> <raw-dumps> docs/data/globe.json` — globe land dots and country centres.
- `python3 tools/pwa/icon_svg.py <dir>` and `python3 tools/pwa/render_icons.py <dir> <dir>` — the app icon.
- `python3 tools/pwa/sw.py docs` — regenerates `sw.js`. **Run it after every change**, because its version comes from the file contents.
