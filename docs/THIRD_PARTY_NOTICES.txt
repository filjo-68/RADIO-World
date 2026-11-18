# Third-party notices

Radio World (© 2026 Radio World, all rights reserved; see `LICENSE`) includes or uses the third-party components and data listed below.
They are **not** covered by the Radio World notice and remain under their own licenses.

## Distributed with the app (`docs/`)

| Component | Version | Used for | License | Files |
|---|---|---|---|---|
| [hls.js](https://github.com/video-dev/hls.js) | 1.7.4 | Playback of HLS (`.m3u8`) streams | Apache License 2.0 | `docs/vendor/hls.light.min.js`; license: `docs/vendor/hls.js-LICENSE.txt` |
| [Unbounded](https://github.com/googlefonts/unbounded) (via Fontsource) | 5.3.0 package | Display typeface | SIL Open Font License 1.1 | `docs/fonts/unbounded-*.woff2`; license: `docs/fonts/Unbounded-OFL.txt` |
| [Manrope](https://github.com/sharanda/manrope) (via Fontsource) | 5.3.0 package | Text typeface | SIL Open Font License 1.1 | `docs/fonts/manrope-*.woff2`; license: `docs/fonts/Manrope-OFL.txt` |
| [Natural Earth](https://www.naturalearthdata.com/) land data via [world-atlas](https://github.com/topojson/world-atlas) | world-atlas 2.0.2 | Land dots of the globe (derived points in `docs/data/globe.json`) | Natural Earth: public domain; world-atlas: ISC | world-atlas license: `docs/vendor/world-atlas-LICENSE.txt` |
| Country flags from [flagcdn.com / Flagpedia](https://flagpedia.net/) | downloaded 2026-11-18 | Flag images | Public domain (per Flagpedia) | `docs/flags/*.png` |
| Station directory from [radio-browser.info](https://www.radio-browser.info/) | snapshot 2026-11-18 | Station lists (`docs/data/stations/*.json`, live API at runtime) | Public domain (per radio-browser.info) | `docs/data/` |

Hls.js is licensed under the Apache License, Version 2.0. You may obtain a copy at
<https://www.apache.org/licenses/LICENSE-2.0>. A copy is in `docs/vendor/hls.js-LICENSE.txt`. The file is distributed unmodified.

Unbounded and Manrope are licensed under the SIL Open Font License, Version 1.1. Full texts are in `docs/fonts/`. The font files are distributed unmodified.

## Not distributed, used at build time only (`tools/pwa/`)

- [topojson-client](https://github.com/topojson/topojson-client) 3.1.0, ISC.
- [d3-geo](https://github.com/d3/d3-geo) 3.1.2, ISC.

## Content that belongs to others
Radio streams, station names and station logos are loaded at runtime from the stations' own servers. They belong to their respective owners. Radio World does not host them and is not affiliated with the stations or with radio-browser.info.
