(() => {
  'use strict';

  const DB_CARS_ENDPOINT = 'admin/get_cars.php';
  const FALLBACK_IMAGE = 'assets/images/logo.png';
  window.CAR_DETAILS_ENDPOINT = DB_CARS_ENDPOINT;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $id = (id) => document.getElementById(id);

  const state = {
    loading: $id('page-loading'),
    error: $id('page-error'),
    content: $id('page-content'),
    errorTitle: $id('error-title'),
    errorMsg: $id('error-message'),
  };
  if (!state.loading || !state.error || !state.content) return;

  document.addEventListener('DOMContentLoaded', () => {
    console.info('[car-details] loading from', DB_CARS_ENDPOINT);
    main().catch((e) => (console.error(e), showError('Error', 'Failed to load car.')));
  });

  async function main() {
    const carId = new URLSearchParams(location.search).get('id');
    if (!carId) return (location.href = 'services.html');
    showLoading();

    const cars = await getCars();
    const raw = cars.find((c) => String(c.id) === String(carId));
    if (!raw) return showError('Car Not Found', 'The requested car could not be found.');

    const car = norm(raw);
    window.currentCar = car;
    render(car);
    renderRelated(cars, raw);
    initBooking();
    showContent();
  }

  async function getCars() {
    const res = await fetch(DB_CARS_ENDPOINT, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Failed to load cars (${res.status})`);
    const data = await res.json();
    if (data && typeof data === 'object' && data.error) throw new Error(data.error);
    if (!Array.isArray(data)) throw new Error('Invalid cars response');
    return data;
  }

  function norm(raw) {
    return {
      _raw: raw,
      id: toInt(raw.id),
      brand: raw.brand ?? '',
      name: raw.name ?? '',
      price: toNumber(raw.price) ?? 0,
      isUsed: toBool(raw.isUsed),
      isPopular: toBool(raw.isPopular),
      isLuxury: toBool(raw.isLuxury),
      available: raw.available == null ? null : toBool(raw.available),
      features: parseFeatures(raw.features),
      images: collectImages(raw),
    };
  }

  function render(car) {
    const title = `${car.brand} ${car.name}`.trim() || 'Car';

    renderBreadcrumb(title);
    renderBadges(car);

    $id('daily-rate').textContent = formatNumber(car.price);
    $id('weekly-rate').textContent = formatNumber(car.price * 7 * 0.85);
    $id('display-daily-rate').textContent = formatNumber(car.price);

    const titleEl = $id('car-title');
    titleEl.textContent = title;
    if (car._raw.year != null && car._raw.year !== '') {
      const yearEl = document.createElement('span');
      yearEl.className = 'car-brand';
      yearEl.textContent = String(car._raw.year);
      titleEl.append(' ');
      titleEl.appendChild(yearEl);
    }
    const rating = toNumber(car._raw.rating) ?? 4.0;
    const reviews = toInt(car._raw.reviews) ?? 50;
    $id('car-stars').innerHTML = stars(rating);
    $id('car-rating-text').textContent = `${rating} (${reviews} reviews)`;

    const descWrap = $id('car-description-container');
    const desc = $id('car-description');
    if (car._raw.description) {
      descWrap.hidden = false;
      desc.textContent = String(car._raw.description);
    } else {
      descWrap.hidden = true;
      desc.textContent = '';
    }

    renderGallery(car.images);
    renderSpecs('#primary-specs-section', '#primary-specs', primarySpecs(car));
    renderFeatures(car.features);
    renderSpecs('#additional-specs-section', '#additional-specs', additionalSpecs(car));
    renderExtraFields(car);

    $id('car-id').value = String(car.id ?? '');
    $id('car-name').value = title;
    $id('daily-rate-input').value = String(car.price);
  }

  function renderBreadcrumb(title) {
    const bc = $id('breadcrumb');
    bc.innerHTML = '';
    bc.appendChild(link('index.html', 'Home'));
    bc.append(' > ');
    bc.appendChild(link('services.html', 'Car Service'));
    bc.append(' > ');
    const s = document.createElement('span');
    s.textContent = title;
    bc.appendChild(s);
  }

  function renderBadges(car) {
    const wrap = $id('status-badges');
    wrap.innerHTML = '';
    if (car.isPopular) wrap.appendChild(badge('popular', 'Popular'));
    if (car.isLuxury) wrap.appendChild(badge('luxury', 'Luxury'));
    if (car.isUsed === true) wrap.appendChild(badge('used', 'Used'));
    if (car.isUsed === false) wrap.appendChild(badge('new', 'New'));
    wrap.appendChild(car.available === false ? badge('used', 'Not Available') : badge('available', 'Available'));
  }

  function renderGallery(images) {
    const main = $id('main-image');
    const nav = $('.image-nav');
    const prev = $('.prev-btn');
    const next = $('.next-btn');
    const thumbs = $id('thumbnail-gallery');

    const imgs = images?.length ? images : [{ src: FALLBACK_IMAGE, label: 'Car Image' }];
    let idx = 0;

    const setMain = () => {
      main.src = imgs[idx]?.src || FALLBACK_IMAGE;
      main.alt = imgs[idx]?.label || 'Car image';
    };
    const sync = () => thumbs.querySelectorAll('.thumbnail').forEach((t, i) => t.classList.toggle('active', i === idx));

    thumbs.innerHTML = '';
    imgs.forEach((img, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = `thumbnail${i === 0 ? ' active' : ''}`;
      const im = document.createElement('img');
      im.src = img.src;
      im.alt = img.label;
      im.onerror = () => (im.src = FALLBACK_IMAGE);
      const lab = document.createElement('span');
      lab.className = 'thumbnail-label';
      lab.textContent = img.label;
      b.append(im, lab);
      b.addEventListener('click', () => (idx = i, setMain(), sync()));
      thumbs.appendChild(b);
    });

    const visible = imgs.length > 1;
    nav.style.display = visible ? '' : 'none';
    thumbs.style.display = visible ? '' : 'none';
    prev.onclick = visible ? () => (idx = (idx - 1 + imgs.length) % imgs.length, setMain(), sync()) : null;
    next.onclick = visible ? () => (idx = (idx + 1) % imgs.length, setMain(), sync()) : null;
    setMain();
  }

  function renderSpecs(sectionSel, gridSel, items) {
    const section = $(sectionSel);
    const grid = $(gridSel);
    grid.innerHTML = '';
    section.hidden = items.length === 0;
    items.forEach((it) => grid.appendChild(specItem(it)));
  }

  function renderFeatures(features) {
    const section = $id('features-section');
    const grid = $id('features-grid');
    grid.innerHTML = '';
    section.hidden = features.length === 0;
    if (!features.length) return;

    features.slice(0, 10).forEach((f) => grid.appendChild(featureItem('fa-check-circle', f)));
    const rem = features.length - 10;
    if (rem > 0) grid.appendChild(featureItem('fa-plus-circle', `+${rem} more`));
  }

  function renderExtraFields(car) {
    const section = $id('extra-fields-section');
    const grid = $id('extra-fields-grid');
    const excluded = new Set([
      'id', 'brand', 'name', 'price', 'bodyType', 'fuelType', 'transmission', 'isUsed', 'isPopular', 'isLuxury', 'features',
      'image', 'image_path', 'imagePath', 'detailImage', 'detail_image', 'description', 'rating', 'reviews', 'available',
      'seats', 'engine', 'color', 'mileage', 'year', 'fuelEfficiency', 'power', 'torque',
    ]);

    const extras = Object.entries(car._raw || {}).filter(([k, v]) => !excluded.has(k) && v != null && v !== '');
    grid.innerHTML = '';
    section.hidden = extras.length === 0;
    extras.forEach(([k, v]) => grid.appendChild(kvItem(humanizeKey(k), formatAny(v))));
  }

  function renderRelated(cars, currentRaw) {
    const section = $id('related-cars');
    const grid = $id('related-cars-grid');
    const current = norm(currentRaw);

    const related = cars
      .filter((c) => String(c.id) !== String(currentRaw.id))
      .map(norm)
      .sort((a, b) => relScore(b, current) - relScore(a, current))
      .slice(0, 4);

    grid.innerHTML = '';
    section.hidden = related.length === 0;
    related.forEach((c) => grid.appendChild(relatedCard(c)));
  }

  function initBooking() {
    const form = $id('booking-form');
    const success = $id('success-message');
    const details = $id('success-details');
    if (!form || !window.currentCar) return;

    form.style.display = '';
    success.style.display = 'none';

    const pickup = $id('pickup-date');
    const dropoff = $id('dropoff-date');
    const driver = $id('driver-type');
    const totalDays = $id('total-days');
    const discount = $id('discount-amount');
    const driverFee = $id('driver-fee');
    const total = $id('total-price');

    const setMinDates = () => {
      const t = new Date();
      t.setDate(t.getDate() + 1);
      const min = toInputDate(t);
      pickup.min = min; dropoff.min = min;
      if (!pickup.value) pickup.value = min;
      if (!dropoff.value) { const a = new Date(t); a.setDate(a.getDate() + 2); dropoff.value = toInputDate(a); }
    };

    const reset = () => (totalDays.textContent = '0', discount.textContent = '0 birr', driverFee.textContent = '0 birr', total.textContent = '0 birr');

    const recalc = () => {
      const d1 = new Date(pickup.value), d2 = new Date(dropoff.value);
      const days = Math.ceil((d2 - d1) / (1000 * 3600 * 24));
      if (!Number.isFinite(days) || days <= 0) return reset();
      totalDays.textContent = String(days);
      const base = days * window.currentCar.price;
      const weeks = Math.floor(days / 7);
      const disc = weeks > 0 ? weeks * 7 * window.currentCar.price * 0.15 : 0;
      const drv = driver.value === 'with_driver' ? days * 2000 : 0;
      discount.textContent = `${formatNumber(disc)} birr`;
      driverFee.textContent = `${formatNumber(drv)} birr`;
      total.textContent = `${formatNumber(base - disc + drv)} birr`;
    };

    const validate = () => {
      let ok = true;
      form.querySelectorAll('.error-message').forEach((n) => (n.style.display = 'none'));
      form.querySelectorAll('.error').forEach((n) => n.classList.remove('error'));
      form.querySelectorAll('[required]').forEach((field) => {
        const v = String(field.value || '').trim();
        if (!v) return mark(field, 'This field is required');
        if (field.type === 'email' && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v)) return mark(field, 'Invalid email');
        if (field.type === 'tel' && !/^(\\+251|0)[0-9]{9}$/.test(v.replace(/\\s+/g, ''))) return mark(field, 'Format: +251XXXXXXXXX or 0XXXXXXXXX');
      });
      if (new Date(dropoff.value) <= new Date(pickup.value)) {
        mark(pickup, 'Drop-off date must be after pick-up date');
        mark(dropoff, 'Drop-off date must be after pick-up date');
      }
      return ok;
      function mark(field, msg) {
        ok = false; field.classList.add('error');
        const e = $id(`${field.id}-error`); if (e) (e.textContent = msg, (e.style.display = 'block'));
      }
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate()) return;
      const booking = saveBooking({
        fullName: $id('full-name').value,
        email: $id('email').value,
        phone: $id('phone').value,
        pickupDate: pickup.value,
        dropoffDate: dropoff.value,
        pickupLocation: $id('pickup-location').value,
        driverType: driver.value,
        specialRequests: $id('special-requests').value,
        totalDays: totalDays.textContent,
        totalPrice: total.textContent,
        discount: discount.textContent,
        driverFee: driverFee.textContent,
      });
      form.style.display = 'none';
      success.style.display = 'block';
      details.innerHTML = '';
      details.append(successRow('Booking ID', `#${booking.id}`), successRow('Vehicle', booking.carName), successRow('Pick-up Date', prettyDate(booking.pickupDate)), successRow('Duration', `${booking.totalDays} days`), successRow('Total Price', booking.totalPrice));
      success.scrollIntoView({ behavior: 'smooth' });
    });

    setMinDates();
    recalc();
    pickup.addEventListener('change', recalc);
    dropoff.addEventListener('change', recalc);
    driver.addEventListener('change', recalc);
  }

  function primarySpecs(car) {
    const r = car._raw;
    return [
      sp('Fuel Type', r.fuelType, 'fa-gas-pump'),
      sp('Transmission', r.transmission, 'fa-cogs'),
      sp('Seating Capacity', r.seats, 'fa-user-friends', (v) => `${v} Persons`),
      sp('Body Type', r.bodyType, 'fa-car'),
      sp('Engine', r.engine, 'fa-tachometer-alt'),
      sp('Color', r.color, 'fa-palette'),
      sp('Mileage', r.mileage, 'fa-road'),
      sp('Year', r.year, 'fa-calendar'),
      sp('Fuel Efficiency', r.fuelEfficiency, 'fa-gas-pump'),
      sp('Power', r.power, 'fa-bolt'),
    ].filter(Boolean);
  }

  function additionalSpecs(car) {
    const r = car._raw;
    const items = [
      sp('Location', r.location, 'fa-map-marker-alt'),
      sp('Insurance', r.insurance, 'fa-shield-alt'),
      sp('Battery Range', r.batteryRange, 'fa-car-battery'),
      sp('Charging Time', r.chargingTime, 'fa-charging-station'),
      sp('Torque', r.torque, 'fa-cog'),
    ].filter(Boolean);
    if (car.available === true || car.available === false) items.unshift(sp('Availability', car.available ? 'Available Now' : 'Not Available', car.available ? 'fa-check-circle' : 'fa-times-circle'));
    return items;
  }

  function sp(label, value, icon, fmt) {
    if (value == null || value === '') return null;
    return { label, value: fmt ? fmt(value) : value, icon };
  }

  function specItem(it) {
    const d = document.createElement('div');
    d.className = 'spec-item';
    d.innerHTML = `<i class="fas ${it.icon}"></i><div class="spec-content"><span class="spec-label"></span><span class="spec-value"></span></div>`;
    d.querySelector('.spec-label').textContent = it.label;
    d.querySelector('.spec-value').textContent = String(it.value);
    return d;
  }

  function featureItem(icon, text) {
    const d = document.createElement('div');
    d.className = 'feature-item';
    d.innerHTML = `<i class="fas ${icon}"></i><span></span>`;
    d.querySelector('span').textContent = text;
    return d;
  }

  function kvItem(k, v) {
    const d = document.createElement('div');
    d.className = 'kv-item';
    d.innerHTML = `<div class="kv-key"></div><div class="kv-val"></div>`;
    d.querySelector('.kv-key').textContent = k;
    d.querySelector('.kv-val').textContent = v;
    return d;
  }

  function relatedCard(car) {
    const title = `${car.brand} ${car.name}`.trim() || 'Car';
    const href = `car-details.html?id=${encodeURIComponent(String(car.id))}`;
    const img = car.images[0]?.src || FALLBACK_IMAGE;
    const a = document.createElement('a');
    a.className = 'related-car-card';
    a.href = href;
    a.innerHTML = `<img alt=""><div class="card-content"><h3></h3><p class="price"></p><div class="specs"></div><div class="related-badges"></div></div>`;
    const imgEl = $('img', a);
    imgEl.src = img; imgEl.alt = title; imgEl.onerror = () => (imgEl.src = FALLBACK_IMAGE);
    $('h3', a).textContent = title;
    $('.price', a).textContent = `${formatNumber(car.price)} birr / day`;
    $('.specs', a).textContent = [car._raw.bodyType, car._raw.fuelType, car._raw.transmission].filter(Boolean).join(' • ');
    const b = $('.related-badges', a);
    if (car.isLuxury) b.appendChild(badge('luxury', 'Luxury'));
    if (car.isPopular) b.appendChild(badge('popular', 'Popular'));
    return a;
  }

  function relScore(c, cur) {
    let s = 0;
    if (c.brand && c.brand === cur.brand) s += 10;
    if (c._raw.bodyType && c._raw.bodyType === cur._raw.bodyType) s += 6;
    if (c.isPopular) s += 2;
    if (c.isLuxury) s += 1;
    return s;
  }

  function parseFeatures(v) {
    if (Array.isArray(v)) return v.map(String).map((s) => s.trim()).filter(Boolean);
    if (typeof v !== 'string') return [];
    return v.split(/,|\\n|;|\\|/).map((s) => s.trim()).filter(Boolean);
  }

  function collectImages(raw) {
    const imgs = [];
    const main = firstString(raw.image, raw.image_path, raw.imagePath, raw.mainImage);
    if (main) imgs.push({ src: main, label: 'Main View' });
    const detail = raw.detailImage || raw.detail_image;
    if (detail && typeof detail === 'object') {
      if (detail.side) imgs.push({ src: detail.side, label: 'Side View' });
      if (detail.dashboard) imgs.push({ src: detail.dashboard, label: 'Dashboard' });
    }
    Object.entries(raw || {}).forEach(([k, val]) => {
      if (!/image/i.test(k) || typeof val !== 'string' || !val.trim()) return;
      if (imgs.some((i) => i.src === val)) return;
      if (k === 'image' || k === 'image_path' || k === 'imagePath') return;
      imgs.push({ src: val, label: humanizeKey(k) });
    });
    return imgs.length ? imgs : [{ src: FALLBACK_IMAGE, label: 'Car Image' }];
  }

  function badge(kind, text) {
    const d = document.createElement('div');
    d.className = `status-badge ${kind}`;
    d.textContent = text;
    return d;
  }

  function link(href, text) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = text;
    return a;
  }

  function successRow(k, v) {
    const row = document.createElement('div');
    row.className = 'detail-row';
    row.innerHTML = `<span></span><span></span>`;
    row.children[0].textContent = `${k}:`;
    row.children[1].textContent = v;
    return row;
  }

  function saveBooking(data) {
    const bookings = JSON.parse(localStorage.getItem('carBookings') || '[]');
    const b = {
      id: Date.now(),
      carId: window.currentCar.id,
      carName: `${window.currentCar.brand} ${window.currentCar.name}`.trim(),
      carImage: window.currentCar.images?.[0]?.src || '',
      ...data,
      submittedAt: new Date().toISOString(),
      status: 'pending',
    };
    bookings.push(b);
    localStorage.setItem('carBookings', JSON.stringify(bookings));
    return b;
  }

  function showLoading() {
    state.loading.hidden = false;
    state.error.hidden = true;
    state.content.hidden = true;
  }

  function showContent() {
    state.loading.hidden = true;
    state.error.hidden = true;
    state.content.hidden = false;
  }

  function showError(title, msg) {
    state.loading.hidden = true;
    state.content.hidden = true;
    state.error.hidden = false;
    if (state.errorTitle) state.errorTitle.textContent = title;
    if (state.errorMsg) state.errorMsg.textContent = msg;
  }

  function stars(r) {
    const n = Math.max(0, Math.min(5, toNumber(r) ?? 0));
    const full = Math.floor(n), half = n % 1 >= 0.5 ? 1 : 0, empty = 5 - full - half;
    return '<i class="fas fa-star"></i>'.repeat(full) + (half ? '<i class="fas fa-star-half-alt"></i>' : '') + '<i class="far fa-star"></i>'.repeat(empty);
  }

  function formatAny(v) {
    if (Array.isArray(v)) return v.map(formatAny).join(', ');
    if (v && typeof v === 'object') return JSON.stringify(v);
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    return String(v);
  }

  function formatNumber(n) {
    return new Intl.NumberFormat('en-US').format(toNumber(n) ?? 0);
  }

  function toNumber(v) {
    if (typeof v === 'number') return Number.isFinite(v) ? v : null;
    if (typeof v !== 'string') return null;
    const c = v.replace(/,/g, '').trim();
    if (!c) return null;
    const n = Number(c);
    return Number.isFinite(n) ? n : null;
  }

  function toInt(v) {
    const n = toNumber(v);
    return n == null ? null : Math.trunc(n);
  }

  function toBool(v) {
    if (v === true || v === false) return v;
    if (v === 1 || v === '1') return true;
    if (v === 0 || v === '0') return false;
    return Boolean(v);
  }

  function toInputDate(d) {
    return d.toISOString().slice(0, 10);
  }

  function firstString(...vals) {
    for (const v of vals) if (typeof v === 'string' && v.trim()) return v.trim();
    return null;
  }

  function humanizeKey(k) {
    return String(k).replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\\s+/g, ' ').trim().replace(/^./, (c) => c.toUpperCase());
  }

  function prettyDate(yyyyMmDd) {
    const d = new Date(yyyyMmDd);
    return Number.isNaN(d.getTime()) ? yyyyMmDd : d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

})();
