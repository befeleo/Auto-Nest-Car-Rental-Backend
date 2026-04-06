(() => {
  'use strict';

  const FALLBACK_IMAGE = 'assets/images/placeholder-car.png';

  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const $ = (sel, root = document) => root.querySelector(sel);

  document.addEventListener('DOMContentLoaded', () => {
    const loading = document.getElementById('page-loading');
    if (loading) loading.hidden = true;
    initGallery();
  });

  function initGallery() {
    const main = document.getElementById('main-image');
    const thumbs = document.getElementById('thumbnail-gallery');
    const nav = $('.image-nav');
    const prev = $('.prev-btn');
    const next = $('.next-btn');

    if (!main || !thumbs) return;

    const buttons = $$('button.thumbnail', thumbs);
    if (buttons.length === 0) return;

    let idx = buttons.findIndex((b) => b.classList.contains('active'));
    if (idx < 0) idx = 0;

    const setActive = (i) => {
      idx = (i + buttons.length) % buttons.length;
      buttons.forEach((b, j) => b.classList.toggle('active', j === idx));
      const img = $('img', buttons[idx]);
      if (!img) return;
      main.src = img.getAttribute('src') || FALLBACK_IMAGE;
      main.alt = img.getAttribute('alt') || 'Car image';
    };

    buttons.forEach((b, i) => b.addEventListener('click', () => setActive(i)));
    if (prev) prev.addEventListener('click', () => setActive(idx - 1));
    if (next) next.addEventListener('click', () => setActive(idx + 1));

    const visible = buttons.length > 1;
    if (nav) nav.style.display = visible ? '' : 'none';
    thumbs.style.display = visible ? '' : 'none';

    main.onerror = () => (main.src = FALLBACK_IMAGE);
    setActive(idx);
  }
})();

