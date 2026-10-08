# recut-site

The public website for [ReCut](https://github.com/jelloshooter848/ReCut), a free, open-source video editor made
for fan edits. It is a small static site (plain HTML, CSS and a little JavaScript) built by a zero-dependency Node
script and served by GitHub Pages.

- `index.html`: the home page (hero, highlights, features, download, demo video, get involved, FAQ)
- `features.html`: fuller feature descriptions and the screenshot grid
- `404.html`, `sitemap.xml`, `robots.txt`

No analytics, cookies, trackers, third-party fonts or third-party scripts. A Content Security Policy only allows this
site's own files, plus `api.github.com` (latest-release lookup) and `youtube-nocookie.com` (only used if a YouTube demo id is set,
and then only after a click). The demo tour is self-hosted.

## Layout

| Path | What |
|---|---|
| `site.config.json` | **The one place to update at launch** (version, date, links, flags) |
| `src/*.html` | Page templates; `src/partials/` holds the shared head, header and footer |
| `assets/css/site.css`, `assets/js/site.js` | Styles (light and dark) and progressive enhancement |
| `assets/img`, `assets/video`, `assets/icons` | Media made from ReCut's own screenshots; see [assets/CREDITS.md](assets/CREDITS.md) |
| `tools/build.mjs` | Builds `src/` into `_site/` |
| `tools/build-assets.sh`, `tools/make-og.py`, `tools/make-tour.sh` | Regenerate the media and the demo tour from a ReCut checkout (needs ffmpeg and Pillow) |
| `.github/workflows/pages.yml` | Builds on every push and PR; deploys `main` to Pages once Pages is enabled |

## Preview locally

Needs Node 18 or newer.

```bash
node tools/build.mjs --local     # builds into _site/ with base path "/"
npx http-server _site -p 8080    # or: cd _site && python3 -m http.server 8080
```

Open <http://localhost:8080/>. Without `--local`, links use the path from `siteUrl` (for example `/Recut-site/`),
which is what Pages serves.

Template syntax is described at the top of `tools/build.mjs`: `{{key}}` inserts a value from `site.config.json`,
`{{#if key}}…{{else}}…{{/if}}` switches on it, `{{> name}}` includes a partial.

## Launch checklist

All of these are in `site.config.json`. Values starting with `TODO:` are placeholders: the build lists them, and the
page shows them with a dashed outline.

| Key | Set it to |
|---|---|
| `version` | `"1.0.0"` |
| `releaseDate` | the release date as it should read, for example `"14 November 2026"` |
| `windowsSigned` | `true` once the Windows builds are code-signed (hides the SmartScreen note) |
| `interchangeReleased` | `true` once 0.9.0 is out (the badge changes from "Coming in 0.9.0" to "New in 0.9.0") |
| `demoVideoId` | a YouTube video id, if a narrated demo is made later (it replaces the self-hosted tour, behind a click-to-load facade) |
| `demoVideoFile` | the self-hosted demo, `assets/video/tour.mp4` (made by `tools/make-tour.sh`); empty both to show a placeholder |
| `discussionsUrl` | set to ReCut's GitHub Discussions; **Discussions must be enabled in the ReCut repo** before launch, or the link 404s |
| `contributingUrl` | link to CONTRIBUTING.md once it exists (empty shows a placeholder) |
| `siteUrl` | the final address, if it is a custom domain (see below) |
| `featuresAsOf` | the ReCut version the feature text was last checked against |
| `liveReleaseLookup` | `false` to stop the download buttons asking GitHub's API for the latest files |

Also re-check the feature text against ReCut's README, CHANGELOG and docs/LIMITATIONS at 1.0, since the site describes
ReCut 0.8.0 plus the 0.9.0 interchange work.

The download buttons always work: they link to `releases/latest`, and when JavaScript is on they are pointed at the
exact files of the latest release (matched by ReCut's file names: `ReCut-Setup-*.exe`, `ReCut-Portable-*.exe`,
`*-macos-arm64.dmg`, `*-macos-x64.dmg`, `*-linux-x86_64.AppImage`). If ReCut's release file names change, update
the patterns in `assets/js/site.js`.

## Turn on GitHub Pages

1. Merge this branch into `main`.
2. In the repository: **Settings › Pages › Build and deployment › Source: GitHub Actions**.
3. Re-run the latest **Deploy site to GitHub Pages** workflow on `main` (Actions tab › the run › Re-run all jobs), or
   push any commit. The site appears at `https://jelloshooter848.github.io/Recut-site/`.

Until step 2, the workflow only builds the site (a check that it still builds) and skips the deploy job.

**Custom domain:** set it under Settings › Pages (with a GitHub Actions deploy no `CNAME` file is needed) and change
`siteUrl` in `site.config.json` to `https://<domain>`. The build then uses `/` as the base path, and the canonical
links, social card URL, sitemap and robots.txt follow.

## Updating media

```bash
git clone --depth 1 https://github.com/jelloshooter848/ReCut /tmp/ReCut
tools/build-assets.sh /tmp/ReCut
tools/make-tour.sh /tmp/ReCut
```

Only ever use ReCut's own screenshots and clips, which are made from Blender Foundation open movies (CC BY 3.0).
Keep the credit on any page that shows them.

## Licence

Site code and text: [MIT](LICENSE), the same licence as ReCut. Third-party media keeps its own licence; see
[assets/CREDITS.md](assets/CREDITS.md).
