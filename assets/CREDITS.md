# Media credits

Everything in `assets/img/`, `assets/video/`, `assets/og-image.png`, `assets/icons/` and `favicon.ico` is derived
from files in the ReCut repository, [jelloshooter848/ReCut](https://github.com/jelloshooter848/ReCut).
`tools/build-assets.sh` regenerates them from a checkout.

| Files here | Source in ReCut | What was done |
|---|---|---|
| `img/<name>.webp`, `img/<name>-800.webp` | `docs/screenshots/<name>.png` | WebP, quality 80, 1600 and 800 px wide |
| `video/demo-*.mp4` | `docs/screenshots/demo-*.gif` | silent H.264 MP4, 960 × 540, 15 fps |
| `img/demo-*-poster.webp` | `docs/screenshots/demo-*.gif` | the frame at 6 s, WebP |
| `og-image.png` | `docs/screenshots/project.png` | social preview card, 1200 × 630 (`tools/make-og.py`) |
| `icons/icon-*.png`, `../favicon.ico` | `build/icon.png` (the app icon) | resized |

## Footage

The screenshots and clips are captured from the ReCut app editing footage from two Blender Foundation open movies:

*Tears of Steel* and *Sintel* © Blender Foundation | [mango.blender.org](https://mango.blender.org) /
[durian.blender.org](https://durian.blender.org), licensed under
[CC BY 3.0](https://creativecommons.org/licenses/by/3.0/).

The credit "Tears of Steel and Sintel © Blender Foundation, CC BY 3.0" appears on every page that shows this footage
and in the site footer. The Sintel English subtitles visible in some shots are a transcript made by ReCut's bundled
speech-to-text engine (see ReCut's `docs/screenshots/README.md`).

## Licences

- Footage in the screenshots and clips: CC BY 3.0, Blender Foundation (above). It is not covered by this repository's
  MIT licence.
- ReCut's UI as shown in the screenshots, and the app icon: from ReCut, MIT License, © ReCut contributors.
- The social card's text is set in Inter (SIL Open Font License), rendered into the image; no font is served.

Never add screenshots or clips of copyrighted films or series to this site, only ReCut's own media made from open
movies.
