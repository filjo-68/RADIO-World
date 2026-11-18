# Radio World — PWA

Installable web app for listening to live radio from 249 countries.
Station lists come from the public [radio-browser.info](https://www.radio-browser.info/) API.

## Features
- Installs as an app (Android, iOS, Windows, macOS, Linux) and opens offline.
- Light, dark and system theme (button in the top bar).
- Bulgarian / English interface.
- Search and sort for countries and stations. Favorites and recently played are stored on the device.
- Player keeps playing while you browse. Lock-screen and headset controls via Media Session.
- HLS streams (`.m3u8`) via bundled hls.js.

## What works offline
- The app itself, the country list, flags, favorites and recently played.
- Station lists of countries you have opened before. A built-in snapshot from 2026-11-18 is used as a fallback.
- **The radio streams themselves are live and always need internet.**

## Run
**On GitHub Pages** (repo must be public, or a paid plan):
Settings → Pages → Build and deployment → Source: *Deploy from a branch* → Branch `main`, folder `/docs` → Save.
The address will be `https://<user>.github.io/<repo>/`.

**On your computer** (Python 3):
```
cd docs
python3 -m http.server 8080
```
Then open http://localhost:8080. Over `http://localhost` all stations can play, including HTTP-only ones.

**Install:**
- Chrome/Edge: the *Install* button in the app, or the install icon in the address bar.
- Android: menu → *Install app*.
- iPhone/iPad (Safari): Share → *Add to Home Screen*.

## Known limitation: HTTP-only stations over HTTPS
About 35% of the stations stream only over `http://`. On an `https://` page (such as GitHub Pages), browsers upgrade those streams to `https://`.
That works only when the station's server supports HTTPS. Stations without HTTPS are marked **HTTP** in the list and can be hidden with the *HTTPS only* filter.

## Files
- `index.html`, `styles.css`, `app.js` — the app.
- `sw.js` — service worker. Regenerate it after any change with `python3 tools/pwa/sw.py docs` (from the repo root); the version changes with every content change.
- `manifest.webmanifest`, `icons/` — install metadata.
- `flags/` — country flags (flagcdn.com).
- `data/` — station snapshot.
- `vendor/hls.light.min.js` — hls.js 1.7.4, Apache-2.0 (see `vendor/hls.js-LICENSE.txt`).
