// Progressive enhancement only: every link and video works without this script.
(() => {
  'use strict';

  // Demo clips: play while on screen, unless the visitor prefers reduced motion or paused one themselves.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clips = document.querySelectorAll('video.demo');
  if (!reduceMotion && 'IntersectionObserver' in window && clips.length) {
    const io = new IntersectionObserver((entries) => {
      for (const { target: v, isIntersecting } of entries) {
        if (isIntersecting && !v.dataset.userPaused) {
          v.preload = 'auto';
          v.play().catch(() => {});
        } else if (!isIntersecting && !v.paused) {
          v.dataset.autoPausing = '1';
          v.pause();
        }
      }
    }, { threshold: 0.5 });
    clips.forEach((v) => {
      v.addEventListener('pause', () => {
        if (v.dataset.autoPausing) delete v.dataset.autoPausing;
        else v.dataset.userPaused = '1';
      });
      v.addEventListener('play', () => delete v.dataset.userPaused);
      io.observe(v);
    });
  }

  // Download: point each button at its file in the latest release; fall back to the releases page.
  const dl = document.getElementById('download');
  if (dl) {
    const ua = navigator.userAgent;
    const os = /Windows/i.test(ua) ? 'windows'
      : /Macintosh|Mac OS X/i.test(ua) && !/iPhone|iPad/i.test(ua) ? 'mac'
      : /Linux/i.test(ua) && !/Android/i.test(ua) ? 'linux' : null;
    const card = os && dl.querySelector(`[data-os="${os}"]`);
    if (card) {
      card.classList.add('is-detected');
      const label = document.createElement('span');
      label.className = 'detected-label';
      label.textContent = 'Your system';
      card.querySelector('h3').append(label);
    }

    const patterns = {
      'win-setup': /^ReCut-Setup-.+\.exe$/i,
      'win-portable': /^ReCut-Portable-.+\.exe$/i,
      'mac-arm64': /-macos-arm64\.dmg$/i,
      'mac-x64': /-macos-x64\.dmg$/i,
      'linux-appimage': /-linux-x86_64\.AppImage$/i,
    };
    const mb = (bytes) => `${Math.round(bytes / 1048576)} MB`;

    if (dl.hasAttribute('data-live-lookup') && window.fetch) {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), 6000);
      fetch(`https://api.github.com/repos/${dl.dataset.repo}/releases/latest`, {
        headers: { Accept: 'application/vnd.github+json' }, signal: ctrl.signal, credentials: 'omit',
      })
        .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
        .then((rel) => {
          const assets = Array.isArray(rel.assets) ? rel.assets : [];
          for (const [key, re] of Object.entries(patterns)) {
            const a = assets.find((x) => re.test(x.name));
            if (!a || !/^https:\/\/github\.com\//.test(a.browser_download_url)) continue;
            dl.querySelectorAll(`[data-asset="${key}"]`).forEach((el) => { el.href = a.browser_download_url; });
            const name = dl.querySelector(`[data-asset-name="${key}"]`);
            if (name) name.textContent = `${a.name} · ${mb(a.size)}`;
          }
          const ver = dl.querySelector('[data-release-version]');
          if (ver && rel.tag_name) ver.textContent = String(rel.tag_name).replace(/^v/, '');
          const date = dl.querySelector('[data-release-date]');
          if (date && rel.published_at) {
            date.textContent = new Date(rel.published_at).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' });
          }
        })
        .catch(() => { /* keep the links to the releases page */ });
    }
  }

  // Demo video: load the YouTube player (privacy-enhanced mode) only after a click.
  document.querySelectorAll('.video-facade[data-youtube-id]').forEach((box) => {
    const btn = box.querySelector('.play');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const id = encodeURIComponent(box.dataset.youtubeId);
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
      f.title = 'ReCut demo video';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      f.allowFullscreen = true;
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      box.replaceChildren(f);
      f.focus();
    });
  });
})();
