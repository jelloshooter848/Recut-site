#!/usr/bin/env node
// Builds the static site from src/ into _site/. No dependencies: Node 18+ only.
//
//   node tools/build.mjs           build for siteUrl in site.config.json (what the Pages workflow runs)
//   node tools/build.mjs --local   build with base path "/" for previewing at http://localhost:8080/
//
// Template syntax (src/*.html and src/partials/*.html):
//   {{> name}}                     include src/partials/name.html
//   {{key}}                        config value, HTML-escaped; "TODO: x" placeholders are shown outlined
//   {{text:key}}                   config value as plain text (for attributes), "TODO: " prefix removed
//   {{#if key}}...{{else}}...{{/if}}, {{#unless key}}...{{/unless}}   (not nested)
import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, '_site');
const local = process.argv.includes('--local');
const config = JSON.parse(readFileSync(join(root, 'site.config.json'), 'utf8'));

const siteUrl = config.siteUrl.replace(/\/+$/, '');
const base = local ? '/' : new URL(siteUrl + '/').pathname;
const repoUrl = `https://github.com/${config.repo}`;

const pages = [
  {
    src: 'index.html', path: '',
    title: 'ReCut: the free video editor made for fan edits',
    description: 'ReCut is a free, open-source video editor for fan edits of films and TV. Find any line across a franchise, build alternate cuts and compare them. Windows, macOS and Linux.',
  },
  {
    src: 'features.html', path: 'features.html',
    title: 'Features | ReCut',
    description: 'Everything ReCut does: a frame-exact editing core, transcript search, Whisper and OCR, story tagging and what-if cuts, compare, proxies, 5.1 audio and export to MP4, MKV, MOV, WAV and FLAC.',
  },
  {
    src: '404.html', path: '404.html', noindex: true,
    title: 'Page not found | ReCut',
    description: 'This page does not exist.',
  },
];

const isTodo = (v) => typeof v === 'string' && v.startsWith('TODO:');
const strip = (v) => (isTodo(v) ? v.slice(5).trim() : v);
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const truthy = (v) => (isTodo(v) ? false : Boolean(v));

const todos = new Set();

function render(tpl, vars) {
  tpl = tpl.replace(/\{\{>\s*([\w-]+)\s*\}\}/g, (_, name) =>
    render(readFileSync(join(root, 'src/partials', `${name}.html`), 'utf8'), vars));
  tpl = tpl.replace(/\{\{#(if|unless)\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\/\1\}\}/g, (_, kind, key, body) => {
    const [yes, no = ''] = body.split('{{else}}');
    if (!(key in vars)) throw new Error(`unknown key in #${kind}: ${key}`);
    return truthy(vars[key]) === (kind === 'if') ? yes : no;
  });
  return tpl.replace(/\{\{(text:)?([\w.]+)\}\}/g, (_, text, key) => {
    if (!(key in vars)) throw new Error(`unknown key: ${key}`);
    const v = vars[key];
    if (isTodo(v)) todos.add(`${key}: ${v}`);
    if (text) return esc(strip(v));
    return isTodo(v)
      ? `<span class="todo" title="Placeholder: set in site.config.json">${esc(strip(v))}</span>`
      : esc(v);
  });
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

for (const page of pages) {
  const vars = {
    ...config,
    base, siteUrl, repoUrl,
    releasesUrl: `${repoUrl}/releases/latest`,
    docsUrl: `${repoUrl}/blob/main/docs`,
    issuesUrl: `${repoUrl}/issues`,
    year: String(new Date().getFullYear()),
    pageTitle: page.title,
    pageDescription: page.description,
    canonical: `${siteUrl}/${page.path}`,
    robots: page.noindex ? 'noindex' : 'index, follow',
    ogImage: `${siteUrl}/assets/og-image.png`,
  };
  // The demo section: a YouTube video if demoVideoId is set, else the self-hosted file, else a placeholder.
  vars.demoYoutube = truthy(config.demoVideoId);
  vars.demoLocal = !vars.demoYoutube && truthy(config.demoVideoFile);
  vars.demoNone = !vars.demoYoutube && !vars.demoLocal;
  const html = render(readFileSync(join(root, 'src', page.src), 'utf8'), vars);
  writeFileSync(join(out, page.src), html);
}

for (const f of ['assets', 'favicon.ico']) cpSync(join(root, f), join(out, f), { recursive: true });
rmSync(join(out, 'assets/CREDITS.md'), { force: true });
writeFileSync(join(out, '.nojekyll'), '');
writeFileSync(join(out, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
writeFileSync(join(out, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  pages.filter((p) => !p.noindex).map((p) => `  <url><loc>${siteUrl}/${p.path}</loc></url>\n`).join('') +
  '</urlset>\n');

if (!existsSync(join(out, 'assets/og-image.png'))) throw new Error('assets missing: run tools/build-assets.sh');
console.log(`Built ${pages.length} pages into _site/ (base ${base})`);
if (todos.size) {
  console.log('\nPlaceholders still to fill in site.config.json:');
  for (const t of todos) console.log(`  - ${t}`);
}
