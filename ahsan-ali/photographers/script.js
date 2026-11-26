// Applies config.js and the link (?name=&city=&phone=) to the page.
// data-field="name|tagline|city|address|phone|email" fills text; data-link="whatsapp|call|email" sets links.
(function () {
  const site = Object.assign({}, window.SITE);
  const q = new URLSearchParams(location.search);

  for (const key of ['name', 'city', 'phone']) {
    const v = (q.get(key) || '').trim().slice(0, 80);
    if (v) site[key] = v;
  }

  if (q.get('phone')) {
    const digits = site.phone.replace(/\D/g, '');
    if (digits.startsWith('00')) {
      site.whatsapp = digits.slice(2);
    } else if (digits.startsWith('0')) {
      site.whatsapp = '92' + digits.slice(1);
    } else {
      site.whatsapp = digits;
    }
  }

  const fillTokens = (str) =>
    String(str ?? '')
      .replace(/\{name\}/g, site.name)
      .replace(/\{city\}/g, site.city)
      .replace(/\{phone\}/g, site.phone);

  site.address = fillTokens(site.address);
  document.title = `${site.name} · ${site.city}`;

  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) {
    metaDesc.setAttribute('content', `${site.tagline} in ${site.city}. Book weddings, portraits, product shoots, and events with ${site.name}.`);
  }

  document.querySelectorAll('[data-field]').forEach((el) => {
    const v = site[el.dataset.field];
    if (v != null) el.textContent = fillTokens(v);
  });

  const wa = (text) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
  const telHref = `tel:${site.phone.replace(/[^\d+]/g, '')}`;

  document.querySelectorAll('[data-link]').forEach((a) => {
    const kind = a.dataset.link;
    if (kind === 'whatsapp') a.href = wa(`Hello ${site.name}, I found you on your website (${site.city}).`);
    if (kind === 'call') a.href = telHref;
    if (kind === 'email') a.href = `mailto:${site.email}`;
  });

  // Theme colors from config.js
  if (site.colors) {
    const root = document.documentElement.style;
    if (site.colors.primary) root.setProperty('--primary', site.colors.primary);
    if (site.colors.dark) root.setProperty('--dark', site.colors.dark);
    if (site.colors.light) root.setProperty('--light', site.colors.light);
    if (site.colors.surface) root.setProperty('--surface', site.colors.surface);
    if (site.colors.muted) root.setProperty('--muted', site.colors.muted);
    if (site.colors.border) root.setProperty('--border', site.colors.border);
  }

  // Hero media & eyebrow
  const heroImg = document.getElementById('hero-img');
  const heroEyebrow = document.getElementById('hero-eyebrow');
  if (heroImg && site.hero) {
    heroImg.src = site.hero.image;
    heroImg.width = site.hero.width;
    heroImg.height = site.hero.height;
    heroImg.alt = site.hero.alt;
  }
  if (heroEyebrow && site.hero && site.hero.eyebrow) {
    heroEyebrow.textContent = fillTokens(site.hero.eyebrow);
  }

  // Hours
  const hoursList = document.getElementById('hours');
  if (hoursList && Array.isArray(site.hours)) {
    hoursList.innerHTML = '';
    site.hours.forEach(([day, time]) => {
      const li = document.createElement('li');
      li.textContent = `${day}: ${time}`;
      hoursList.appendChild(li);
    });
  }

  // Google Maps embed synced to resolved address/city
  const mapFrame = document.getElementById('map-embed');
  if (mapFrame) {
    const mapQuery = site.address || site.city;
    mapFrame.src = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
    mapFrame.title = `${site.name} location map in ${site.city}`;
  }

  // Social links
  const socialList = document.getElementById('social-links');
  if (socialList && Array.isArray(site.social)) {
    socialList.innerHTML = '';
    site.social.forEach((item) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = item.url;
      a.textContent = item.label;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      li.appendChild(a);
      socialList.appendChild(li);
    });
  }

  // SVG icon helper for Why Choose Us & Packages
  const createIconSvg = (name) => {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.6');
    svg.setAttribute('aria-hidden', 'true');

    const paths = {
      aperture: '<circle cx="12" cy="12" r="9"/><path d="M14.3 8l5.7 10M9.7 8h11.4M7.4 12L13 2M9.7 16L4 6M14.3 16H2.9M16.6 12L11 22"/>',
      clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
      frame: '<rect x="3" y="5" width="18" height="14" rx="1"/><circle cx="12" cy="12" r="3"/>',
      print: '<path d="M4 19V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v14"/><path d="M8 10h8M8 14h5M3 19h18"/>',
      check: '<path d="M5 13l4 4L19 7"/>',
    };
    svg.innerHTML = paths[name] || paths.aperture;
    return svg;
  };

  // Why Choose Us
  const whyGrid = document.getElementById('why-grid');
  if (whyGrid && Array.isArray(site.whyChooseUs)) {
    whyGrid.innerHTML = '';
    site.whyChooseUs.forEach((point) => {
      const card = document.createElement('article');
      card.className = 'why-card';

      const iconBox = document.createElement('div');
      iconBox.className = 'why-icon';
      iconBox.appendChild(createIconSvg(point.icon));

      const h3 = document.createElement('h3');
      h3.textContent = fillTokens(point.title);

      const p = document.createElement('p');
      p.textContent = fillTokens(point.text);

      card.append(iconBox, h3, p);
      whyGrid.appendChild(card);
    });
  }

  // Lightbox controller (shared by Portfolio & Gallery)
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lb-img');
  const lbTag = document.getElementById('lb-tag');
  const lbTitle = document.getElementById('lightbox-title');
  const lbCounter = document.getElementById('lightbox-counter');
  const lbClose = document.getElementById('lb-close');
  const lbPrev = document.getElementById('lb-prev');
  const lbNext = document.getElementById('lb-next');

  let lbItems = [];
  let lbIndex = 0;
  let lastTrigger = null;

  const renderLightboxFrame = () => {
    if (!lbItems.length) return;
    const item = lbItems[lbIndex];
    lbImg.src = item.src;
    lbImg.alt = item.alt || item.title;
    lbImg.width = item.width || 1000;
    lbImg.height = item.height || 1000;
    lbTag.textContent = item.tag || item.category || '';
    lbTitle.textContent = item.title || '';
    lbCounter.textContent = `${lbIndex + 1} / ${lbItems.length}`;
  };

  const openLightbox = (items, index, trigger) => {
    if (!lightbox || !items.length) return;
    lbItems = items;
    lbIndex = ((index % items.length) + items.length) % items.length;
    lastTrigger = trigger || document.activeElement;
    renderLightboxFrame();
    lightbox.hidden = false;
    document.body.classList.add('lb-open');
    lbClose.focus();
  };

  const closeLightbox = () => {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.classList.remove('lb-open');
    if (lastTrigger && typeof lastTrigger.focus === 'function') {
      lastTrigger.focus();
    }
  };

  const stepLightbox = (delta) => {
    if (!lbItems.length) return;
    lbIndex = (lbIndex + delta + lbItems.length) % lbItems.length;
    renderLightboxFrame();
  };

  if (lightbox) {
    lbClose.addEventListener('click', closeLightbox);
    lbPrev.addEventListener('click', () => stepLightbox(-1));
    lbNext.addEventListener('click', () => stepLightbox(1));
    lightbox.querySelectorAll('[data-lb-close]').forEach((el) => {
      el.addEventListener('click', closeLightbox);
    });

    document.addEventListener('keydown', (e) => {
      if (lightbox.hidden) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') stepLightbox(-1);
      if (e.key === 'ArrowRight') stepLightbox(1);
    });

    let touchStartX = 0;
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
    }, { passive: true });
    lightbox.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) > 42) stepLightbox(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  // Special Feature 1: Portfolio by Category + Full-Screen Lightbox
  const filterWrap = document.getElementById('portfolio-filters');
  const portfolioGrid = document.getElementById('portfolio-grid');
  let activeCategory = 'all';

  const getFilteredPortfolio = () => {
    const items = Array.isArray(site.portfolio) ? site.portfolio : [];
    return activeCategory === 'all' ? items : items.filter((p) => p.category === activeCategory);
  };

  const renderPortfolioGrid = () => {
    if (!portfolioGrid) return;
    const filtered = getFilteredPortfolio();
    portfolioGrid.innerHTML = '';
    filtered.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'photo-card';

      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt;
      img.width = item.width;
      img.height = item.height;
      img.loading = 'lazy';
      img.decoding = 'async';

      const meta = document.createElement('span');
      meta.className = 'photo-meta';

      const left = document.createElement('span');
      const cat = document.createElement('span');
      cat.className = 'photo-cat';
      cat.textContent = item.category;
      const title = document.createElement('span');
      title.className = 'photo-title';
      title.textContent = item.title;
      left.append(cat, title);

      const expand = document.createElement('span');
      expand.className = 'photo-expand';
      expand.textContent = 'View';

      meta.append(left, expand);
      btn.append(img, meta);
      btn.addEventListener('click', () => openLightbox(filtered, idx, btn));
      portfolioGrid.appendChild(btn);
    });
  };

  if (filterWrap && Array.isArray(site.portfolioCategories)) {
    filterWrap.innerHTML = '';
    site.portfolioCategories.forEach((cat) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'filter-btn';
      btn.textContent = cat.label;
      btn.setAttribute('aria-pressed', cat.id === activeCategory ? 'true' : 'false');
      btn.addEventListener('click', () => {
        activeCategory = cat.id;
        filterWrap.querySelectorAll('.filter-btn').forEach((b) => {
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        renderPortfolioGrid();
      });
      filterWrap.appendChild(btn);
    });
    renderPortfolioGrid();
  }

  // Special Feature 2: Packages with What Is Included
  const packagesGrid = document.getElementById('packages-grid');
  const bookEventSelect = document.getElementById('book-event');
  const bookDateInput = document.getElementById('book-date');

  if (bookEventSelect && site.booking && Array.isArray(site.booking.events)) {
    bookEventSelect.innerHTML = '';
    site.booking.events.forEach((ev) => {
      const opt = document.createElement('option');
      opt.value = ev;
      opt.textContent = ev;
      bookEventSelect.appendChild(opt);
    });
  }

  if (bookDateInput) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    bookDateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  if (packagesGrid && Array.isArray(site.packages)) {
    packagesGrid.innerHTML = '';
    site.packages.forEach((pkg) => {
      const card = document.createElement('article');
      card.className = pkg.featured ? 'pkg-card featured' : 'pkg-card';

      const top = document.createElement('div');
      if (pkg.featured) {
        const badge = document.createElement('span');
        badge.className = 'pkg-badge';
        badge.textContent = 'Most Booked';
        top.appendChild(badge);
      }

      const h3 = document.createElement('h3');
      h3.textContent = pkg.name;

      const summary = document.createElement('p');
      summary.className = 'pkg-summary';
      summary.textContent = fillTokens(pkg.summary);

      const price = document.createElement('p');
      price.className = 'pkg-price';
      price.textContent = pkg.price;

      const ul = document.createElement('ul');
      ul.className = 'pkg-list';
      pkg.included.forEach((line) => {
        const li = document.createElement('li');
        const check = createIconSvg('check');
        check.setAttribute('width', '16');
        check.setAttribute('height', '16');
        const span = document.createElement('span');
        span.textContent = fillTokens(line);
        li.append(check, span);
        ul.appendChild(li);
      });

      top.append(h3, summary, price, ul);

      const actions = document.createElement('div');
      actions.className = 'pkg-actions';

      const selectBtn = document.createElement('button');
      selectBtn.type = 'button';
      selectBtn.className = pkg.featured ? 'btn btn-light btn-full' : 'btn btn-outline btn-full';
      selectBtn.textContent = `Book ${pkg.name}`;
      selectBtn.addEventListener('click', () => {
        if (bookEventSelect && pkg.eventType) {
          bookEventSelect.value = pkg.eventType;
        }
        const bookSec = document.getElementById('book');
        if (bookSec) bookSec.scrollIntoView({ behavior: 'smooth' });
        if (bookDateInput) bookDateInput.focus({ preventScroll: true });
      });

      const waLink = document.createElement('a');
      waLink.className = 'pkg-wa-link';
      waLink.href = wa(`Hello ${site.name} (${site.city}), I'm interested in the ${pkg.name} package (${pkg.price}).`);
      waLink.textContent = 'Ask on WhatsApp';

      actions.append(selectBtn, waLink);
      card.append(top, actions);
      packagesGrid.appendChild(card);
    });
  }

  // Gallery (6+ photos with bigger full-screen view)
  const galleryGrid = document.getElementById('gallery-grid');
  if (galleryGrid && Array.isArray(site.gallery)) {
    galleryGrid.innerHTML = '';
    site.gallery.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gallery-item';

      const img = document.createElement('img');
      img.src = item.src;
      img.alt = item.alt;
      img.width = item.width;
      img.height = item.height;
      img.loading = 'lazy';
      img.decoding = 'async';

      const tag = document.createElement('span');
      tag.className = 'gallery-label';
      tag.textContent = item.tag;

      btn.append(img, tag);
      btn.addEventListener('click', () => openLightbox(site.gallery, idx, btn));
      galleryGrid.appendChild(btn);
    });
  }

  // Reviews (marked "Sample review: replace with a real one")
  const reviewsGrid = document.getElementById('reviews-grid');
  if (reviewsGrid && Array.isArray(site.reviews)) {
    reviewsGrid.innerHTML = '';
    site.reviews.forEach((rev) => {
      const card = document.createElement('article');
      card.className = 'review-card';

      const note = document.createElement('span');
      note.className = 'sample-tag';
      note.textContent = rev.note || 'Sample review: replace with a real one';

      const quote = document.createElement('p');
      quote.className = 'review-text';
      quote.textContent = `"${fillTokens(rev.text)}"`;

      const authorWrap = document.createElement('p');
      authorWrap.className = 'review-author';
      const strong = document.createElement('strong');
      strong.textContent = rev.author;
      const ctx = document.createElement('span');
      ctx.textContent = fillTokens(rev.context);
      authorWrap.append(strong, ctx);

      card.append(note, quote, authorWrap);
      reviewsGrid.appendChild(card);
    });
  }

  // Special Feature 3: Booking Form -> WhatsApp
  const bookingStatus = document.getElementById('booking-status');
  document.querySelectorAll('form[data-whatsapp]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const lines = [...new FormData(form)]
        .filter(([, v]) => String(v).trim())
        .map(([k, v]) => `${k}: ${String(v).trim()}`);
      const header = (site.booking && site.booking.whatsappHeader) || form.dataset.whatsapp;
      const msg = `${header} for ${site.name} (${site.city}):\n${lines.join('\n')}`;
      const url = wa(msg);

      if (bookingStatus) {
        bookingStatus.textContent = '';
        const text = document.createTextNode('Opening WhatsApp with your request — ');
        const fallback = document.createElement('a');
        fallback.href = url;
        fallback.target = '_blank';
        fallback.rel = 'noopener noreferrer';
        fallback.textContent = 'click here if it did not open';
        bookingStatus.append(text, fallback, document.createTextNode('.'));
      }
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  });

  window.SITE_LIVE = site;
})();
