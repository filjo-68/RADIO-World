# Radio World — PWA

© 2026 Radio World. All rights reserved. See [`LICENSE.txt`](LICENSE.txt) and [`THIRD_PARTY_NOTICES.txt`](THIRD_PARTY_NOTICES.txt).

An installable web app with more than 51,000 live radio stations from 249 countries.

## Features
- **Hero section with an interactive 3D globe.** It is drawn as dots on a canvas. You can spin it, and tapping a country's signal opens its stations. Signal arcs travel from the station that is playing.
- **Buttons:** “Listen now”, “Surprise me” (a random popular station from a random country) and an install card.
- **Player:** keeps playing while you browse. It has a gradient frame while live and controls on the lock screen and on headphones (Media Session).
- **“Now playing” screen:** large artwork, visualiser, tags, share button and sleep timer (15–90 min, fades out at the end).
- **Colour schemes (palette button in the top bar):**
  - 14 palettes, each with a light and a dark version: Aurora, Synthwave, Sunset, Ocean, Forest, Mocha, Lavender, Citrus, Sakura, Fjord, Gold, Graphite, Tropical and Lava.
  - 5 animated backgrounds: floating lights, soft mesh gradient, starfield, retro synthwave grid and minimal.
  - 3 effects you can switch on and off: film grain, neon glow and frosted glass.
  - 10 ready-made combinations (Northern Lights, Synthwave ’84, Deep Sea, Night Sky, Golden Hour, Tokyo Night, Midnight Gold, Café, Jungle, Zen), plus “Random combination” and “Reset”.
  - In every palette, accent text has at least 4.5:1 WCAG contrast and button text is picked automatically for contrast. Palettes are defined in `themes.js`.
- **15 interface languages:** Bulgarian, English, Norwegian Bokmål, German, Spanish, French, Italian, Portuguese (Brazil), Russian, Turkish, Arabic (right to left), Hindi, Chinese (Simplified), Japanese and Korean. The app follows the browser's language and has a picker in the top bar. Plurals come from `Intl.PluralRules`, and country names, numbers and dates are localized with `Intl`. Translations are in `i18n.js`.
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
