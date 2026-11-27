// Applies config.js and URL overrides (?name=&city=&phone=) across the page.
// Handles US (10/11-digit -> "Text us" sms:) and Pakistani/other numbers (WhatsApp wa.me).
(function () {
  const base = window.SITE || {};
  const site = Object.assign({}, base);
  const q = new URLSearchParams(location.search);

  for (const key of ['name', 'city', 'phone']) {
    const v = (q.get(key) || '').trim().slice(0, 80);
    if (v) site[key] = v;
  }

  const phoneOverride = Boolean((q.get('phone') || '').trim());

  function parsePhoneProfile(rawPhone, explicitWa) {
    const raw = String(rawPhone || '').trim();
    const digits = raw.replace(/\D/g, '');
    // US NANP: 10 digits not starting with 0, OR 11 digits starting with 1
    const isUS =
      (digits.length === 10 && !digits.startsWith('0')) ||
      (digits.length === 11 && digits.startsWith('1'));

    if (isUS) {
      const us10 = digits.length === 11 ? digits.slice(1) : digits;
      const formatted = `(${us10.slice(0, 3)}) ${us10.slice(3, 6)}-${us10.slice(6)}`;
      return {
        isUS: true,
        display: formatted,
        telHref: `tel:+1${us10}`,
        smsNumber: `+1${us10}`,
        whatsapp: `1${us10}`,
      };
    }

    let waDigits = digits;
    if (explicitWa) {
      waDigits = String(explicitWa).replace(/\D/g, '');
    } else if (digits.startsWith('00')) {
      waDigits = digits.slice(2);
    } else if (digits.startsWith('0')) {
      waDigits = '92' + digits.slice(1);
    }

    const telClean = raw.startsWith('+') ? `+${digits}` : digits;
    return {
      isUS: false,
      display: raw || digits,
      telHref: `tel:${telClean}`,
      smsNumber: null,
      whatsapp: waDigits,
    };
  }

  const phoneInfo = parsePhoneProfile(site.phone, phoneOverride ? '' : site.whatsapp);
  site.phone = phoneInfo.display;
  site.whatsapp = phoneInfo.whatsapp;

  // Apply theme palette from config.js only if overridden to avoid redundant root recalc
  if (site.colors) {
    const root = document.documentElement.style;
    const defaults = {
      primary: '#0b3d91',
      primaryDark: '#082f70',
      accent: '#facc15',
      accentDark: '#eab308',
      dark: '#091834',
      light: '#f3f6fb',
      surface: '#ffffff',
      ink: '#0f172a',
      muted: '#475569',
      border: '#dbe4f0',
    };
    const map = {
      primary: '--primary',
      primaryDark: '--primary-dark',
      accent: '--accent',
      accentDark: '--accent-dark',
      dark: '--dark',
      light: '--light',
      surface: '--surface',
      ink: '--ink',
      muted: '--muted',
      border: '--border',
    };
    Object.entries(map).forEach(([k, cssVar]) => {
      if (site.colors[k] && site.colors[k] !== defaults[k]) {
        root.setProperty(cssVar, site.colors[k]);
      }
    });
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
    metaDesc.setAttribute(
      'content',
      `${site.tagline} in ${site.city}. Plumbing & electrical repairs, service area check, sample prices, and photo quotes from ${site.name}.`
    );
  }

  const msgUrl = (text) =>
    phoneInfo.isUS
      ? `sms:${phoneInfo.smsNumber}?body=${encodeURIComponent(text)}`
      : `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

  // Fill data-field text nodes
  document.querySelectorAll('[data-field]').forEach((el) => {
    const v = site[el.dataset.field];
    if (v != null) el.textContent = fillTokens(v);
  });

  // Configure call, messaging (SMS for US / WhatsApp for PK), and email links
  const cleanEmail = (site.email || '').trim();
  const emailRow = document.getElementById('email-row');
  if (emailRow) emailRow.hidden = !cleanEmail;

  const defaultGreeting = `Hello ${site.name}, I need plumbing or electrical help in ${site.city}.`;
  document.querySelectorAll('[data-link]').forEach((a) => {
    const kind = a.dataset.link;
    if (kind === 'call') {
      a.href = phoneInfo.telHref;
    } else if (kind === 'whatsapp') {
      a.href = msgUrl(defaultGreeting);
      const label = phoneInfo.isUS ? a.dataset.labelUs : a.dataset.labelPk;
      const floatSpan = a.querySelector('.wa-float-label');
      if (floatSpan && label) {
        floatSpan.textContent = label;
      } else if (label) {
        a.textContent = label;
      }
      if (phoneInfo.isUS) {
        a.classList.add('is-us');
        a.removeAttribute('target');
        a.removeAttribute('rel');
      } else {
        a.classList.remove('is-us');
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
      }
      const floatIcon = a.querySelector('#wa-float-icon');
      if (floatIcon) {
        floatIcon.innerHTML = phoneInfo.isUS
          ? '<path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2z"/>'
          : '<path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm5.8 14.1c-.2.7-1.4 1.3-1.9 1.4-.5.1-1.1.1-1.8-.1-.4-.1-1-.3-1.7-.6-3-1.3-5-4.3-5.1-4.5-.2-.2-1.2-1.6-1.2-3.1s.8-2.2 1-2.5c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .6.5.2.6.8 2 .9 2.1.1.1.1.3 0 .5-.1.2-.2.3-.3.5l-.4.5c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1.1 2.2 1.4 2.5 1.5.3.1.5.1.7-.1.2-.2.8-.9 1-1.2.2-.3.4-.3.7-.2.3.1 1.8.8 2.1 1 .3.2.5.3.6.4.1.2.1.8-.1 1.5z"/>';
      }
    } else if (kind === 'email') {
      if (cleanEmail) {
        a.href = `mailto:${cleanEmail}`;
      } else {
        a.removeAttribute('href');
      }
    }
  });

  // Render optional verified claims ONLY if config.js explicitly enables them
  const activeClaims = [];
  if (site.claims && site.claims.licensedAndInsured === true && site.claims.licensedLabel) {
    activeClaims.push(site.claims.licensedLabel);
  }
  if (site.claims && site.claims.emergency247 === true && site.claims.emergency247Label) {
    activeClaims.push(site.claims.emergency247Label);
  }

  function renderClaimsRow(el, filterFn) {
    if (!el) return;
    const list = filterFn ? activeClaims.filter(filterFn) : activeClaims;
    el.innerHTML = '';
    if (!list.length) {
      el.hidden = true;
      return;
    }
    list.forEach((label) => {
      const span = document.createElement('span');
      span.className = 'claim-pill';
      span.textContent = label;
      el.appendChild(span);
    });
    el.hidden = false;
  }

  renderClaimsRow(document.getElementById('hero-claims'));
  renderClaimsRow(
    document.getElementById('emergency-claims'),
    (txt) => site.claims && txt === site.claims.emergency247Label
  );

  // Hero media, eyebrow & highlights
  const heroImg = document.getElementById('hero-img');
  const heroEyebrow = document.getElementById('hero-eyebrow');
  const heroHighlights = document.getElementById('hero-highlights');
  if (heroImg && site.hero) {
    heroImg.src = site.hero.image;
    heroImg.width = site.hero.width;
    heroImg.height = site.hero.height;
    heroImg.alt = site.hero.alt;
  }
  if (heroEyebrow && site.hero && site.hero.eyebrow) {
    heroEyebrow.textContent = fillTokens(site.hero.eyebrow);
  }
  if (heroHighlights && site.hero && Array.isArray(site.hero.highlights)) {
    heroHighlights.innerHTML = '';
    site.hero.highlights.forEach((txt) => {
      const li = document.createElement('li');
      li.textContent = fillTokens(txt);
      heroHighlights.appendChild(li);
    });
  }

  // SVG icon helper (caches parsed template nodes to avoid repeated innerHTML parsing)
  const iconPaths = {
    pipe: '<path d="M4 10h12a4 4 0 0 1 4 4v6"/><path d="M4 6h12a8 8 0 0 1 8 8v6"/><path d="M2 5v6M2 8h2"/>',
    drop: '<path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>',
    flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.07-2.14-.22-4.05 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.15.43-2.29 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
    wrench: '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    panel: '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 7h6M9 12h6M9 17h6"/>',
    bolt: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
    bulb: '<path d="M9 18h6M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/>',
    gauge: '<path d="M12 14l4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
    truck: '<rect x="1" y="3" width="15" height="13" rx="1"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    tag: '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  };
  const iconCache = {};
  function createIconSvg(name) {
    const key = iconPaths[name] ? name : 'wrench';
    if (!iconCache[key]) {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '20');
      svg.setAttribute('height', '20');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('stroke', 'currentColor');
      svg.setAttribute('stroke-width', '2');
      svg.setAttribute('stroke-linecap', 'round');
      svg.setAttribute('stroke-linejoin', 'round');
      svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML = iconPaths[key];
      iconCache[key] = svg;
    }
    return iconCache[key].cloneNode(true);
  }

  // Helper to hydrate below-the-fold sections across small browser tasks
  function scheduleTask(fn, delay) {
    setTimeout(fn, delay || 0);
  }

  // Services + Trade Filter
  const servicesGrid = document.getElementById('services-grid');
  const serviceFilterBtns = document.querySelectorAll('#service-filters .filter-btn');
  const quoteSelect = document.getElementById('quote-service');
  let activeTrade = 'all';

  function jumpToQuoteWithService(serviceName) {
    if (quoteSelect && serviceName) {
      const match = [...quoteSelect.options].find((o) => o.value === serviceName);
      if (match) quoteSelect.value = serviceName;
    }
    const quoteSec = document.getElementById('quote');
    if (quoteSec) quoteSec.scrollIntoView({ behavior: 'smooth' });
    const areaField = document.getElementById('quote-area');
    if (areaField) areaField.focus({ preventScroll: true });
  }

  function renderServices() {
    if (!servicesGrid || !Array.isArray(site.services)) return;
    const list =
      activeTrade === 'all'
        ? site.services
        : site.services.filter((s) => s.trade === activeTrade);
    const frag = document.createDocumentFragment();
    list.forEach((item) => {
      const card = document.createElement('article');
      card.className = `service-card trade-${item.trade}`;

      const top = document.createElement('div');
      top.className = 'service-card-top';

      const row = document.createElement('div');
      row.className = 'service-head-row';
      const iconBox = document.createElement('span');
      iconBox.className = 'service-icon';
      iconBox.appendChild(createIconSvg(item.icon));
      const tag = document.createElement('span');
      tag.className = 'trade-tag';
      tag.textContent = item.trade === 'electrical' ? 'Electrical' : 'Plumbing';
      row.append(iconBox, tag);

      const h3 = document.createElement('h3');
      h3.textContent = fillTokens(item.title);
      const p = document.createElement('p');
      p.textContent = fillTokens(item.summary);
      top.append(row, h3, p);

      const foot = document.createElement('div');
      foot.className = 'service-card-foot';
      const scope = document.createElement('span');
      scope.className = 'service-scope';
      scope.textContent = item.scope;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn-inline';
      btn.textContent = 'Get quote';
      btn.addEventListener('click', () => jumpToQuoteWithService(item.title));
      foot.append(scope, btn);

      card.append(top, foot);
      frag.appendChild(card);
    });
    servicesGrid.replaceChildren(frag);
  }

  serviceFilterBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTrade = btn.dataset.trade || 'all';
      serviceFilterBtns.forEach((b) =>
        b.setAttribute('aria-pressed', b === btn ? 'true' : 'false')
      );
      renderServices();
    });
  });

  function hydrateServices() {
    if (quoteSelect && site.quoteForm && Array.isArray(site.quoteForm.services)) {
      const frag = document.createDocumentFragment();
      site.quoteForm.services.forEach((svc) => {
        const opt = document.createElement('option');
        opt.value = svc;
        opt.textContent = svc;
        frag.appendChild(opt);
      });
      quoteSelect.replaceChildren(frag);
    }
    renderServices();
  }
  window.SITE_LIVE = site;

  function hydrateMidSections() {
    // Emergency Section
    if (site.emergency) {
      const kicker = document.getElementById('emergency-kicker');
      const headline = document.getElementById('emergency-headline');
      const lead = document.getElementById('emergency-lead');
      const emGrid = document.getElementById('emergency-grid');
      if (kicker && site.emergency.kicker) kicker.textContent = fillTokens(site.emergency.kicker);
      if (headline && site.emergency.headline) headline.textContent = fillTokens(site.emergency.headline);
      if (lead && site.emergency.lead) lead.textContent = fillTokens(site.emergency.lead);
      if (emGrid && Array.isArray(site.emergency.scenarios)) {
        const frag = document.createDocumentFragment();
        site.emergency.scenarios.forEach((sc) => {
          const card = document.createElement('article');
          card.className = 'emergency-card';
          const tag = document.createElement('span');
          tag.className = 'emergency-tag';
          tag.textContent = sc.tag;
          const h3 = document.createElement('h3');
          h3.textContent = fillTokens(sc.title);
          const p = document.createElement('p');
          p.textContent = fillTokens(sc.tip);
          card.append(tag, h3, p);
          frag.appendChild(card);
        });
        emGrid.replaceChildren(frag);
      }
    }

    // Special Feature 2: Service Areas List + "Do you cover my area?" Check
    const areasHeading = document.getElementById('areas-heading');
    const areasNote = document.getElementById('areas-note');
    const areasListEl = document.getElementById('areas-list');
    const areaForm = document.getElementById('area-form');
    const areaInput = document.getElementById('area-input');
    const areaResult = document.getElementById('area-result');

    const areaItems =
      site.areas && Array.isArray(site.areas.list)
        ? site.areas.list.map((a) => ({
            name: fillTokens(a.name),
            zip: String(a.zip || '').trim(),
          }))
        : [];

    if (areasHeading && site.areas && site.areas.heading) {
      areasHeading.textContent = fillTokens(site.areas.heading);
    }
    if (areasNote && site.areas && site.areas.note) {
      areasNote.textContent = fillTokens(site.areas.note);
    }

    function evaluateCoverage(rawQuery) {
      const query = String(rawQuery || '').trim();
      if (!query || !areaResult) return;

      const norm = query.toLowerCase();
      const cityNorm = site.city.toLowerCase();
      const cityBase = cityNorm.split(',')[0].trim();

      const matches = areaItems.filter((item) => {
        const n = item.name.toLowerCase();
        const z = item.zip.toLowerCase();
        return (
          n === norm ||
          z === norm ||
          (norm.length >= 3 && (n.includes(norm) || norm.includes(n))) ||
          (z && norm.includes(z))
        );
      });

      const isCityMatch =
        norm === cityNorm ||
        norm === cityBase ||
        (norm.length >= 3 && cityBase.includes(norm));

      areaResult.innerHTML = '';
      areaResult.className = 'area-result';

      const title = document.createElement('p');
      title.className = 'area-result-title';
      const desc = document.createElement('p');
      desc.className = 'area-result-text';
      const actions = document.createElement('div');
      actions.className = 'area-result-actions';

      const callLink = document.createElement('a');
      callLink.className = 'btn btn-primary';
      callLink.href = phoneInfo.telHref;
      callLink.textContent = `Call ${site.phone}`;

      const chatLink = document.createElement('a');
      chatLink.className = 'btn btn-accent';

      if (matches.length > 0 || isCityMatch) {
        areaResult.classList.add('covered');
        const matchedLabel =
          matches.length > 0
            ? matches
                .slice(0, 3)
                .map((m) => (m.zip ? `${m.name} (${m.zip})` : m.name))
                .join(', ')
            : site.city;

        title.textContent = `Yes! We cover ${matchedLabel}.`;
        desc.textContent = `${site.name} serves ${matchedLabel}. Call now for dispatch or message us to schedule your visit.`;

        const inquiryMsg = `Hello ${site.name}, I need service in ${matchedLabel} (${site.city}).`;
        chatLink.href = msgUrl(inquiryMsg);
        chatLink.textContent = phoneInfo.isUS
          ? `Text us for ${matches[0] ? matches[0].name : site.city}`
          : `WhatsApp us for ${matches[0] ? matches[0].name : site.city}`;
      } else {
        areaResult.classList.add('verify');
        title.textContent = `Let's confirm dispatch to "${query}"`;
        desc.textContent = `"${query}" isn't listed in our primary ${site.city} zones, but nearby suburbs are often covered. Send us your address to confirm right away.`;

        const verifyMsg = `Hello ${site.name}, do you cover ${query} near ${site.city}?`;
        chatLink.href = msgUrl(verifyMsg);
        chatLink.textContent = phoneInfo.isUS
          ? `Text "${query}" to ${site.phone}`
          : `Ask on WhatsApp about ${query}`;
      }

      if (!phoneInfo.isUS) {
        chatLink.target = '_blank';
        chatLink.rel = 'noopener noreferrer';
      }

      actions.append(callLink, chatLink);
      areaResult.append(title, desc, actions);
      areaResult.hidden = false;
    }

    if (areasListEl) {
      const frag = document.createDocumentFragment();
      areaItems.forEach((item) => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'area-chip';
        const nameSpan = document.createElement('span');
        nameSpan.textContent = item.name;
        btn.appendChild(nameSpan);
        if (item.zip) {
          const zipSpan = document.createElement('span');
          zipSpan.className = 'area-zip';
          zipSpan.textContent = item.zip;
          btn.appendChild(zipSpan);
        }
        btn.addEventListener('click', () => {
          if (areaInput) areaInput.value = item.zip || item.name;
          evaluateCoverage(item.zip || item.name);
        });
        li.appendChild(btn);
        frag.appendChild(li);
      });
      areasListEl.replaceChildren(frag);
    }

    if (areaForm && areaInput) {
      areaForm.addEventListener('submit', (e) => {
        e.preventDefault();
        evaluateCoverage(areaInput.value);
      });
    }

    scheduleTask(hydratePricesAndWhy, 16);
  }

  function hydratePricesAndWhy() {
    // Sample Prices (in $ from config.js, explicitly marked "Sample prices")
    const pricesBadge = document.getElementById('prices-badge');
    const pricesNote = document.getElementById('prices-note');
    const pricesGrid = document.getElementById('prices-grid');
    if (site.prices) {
      if (pricesBadge && site.prices.badge) pricesBadge.textContent = site.prices.badge;
      if (pricesNote && site.prices.note) pricesNote.textContent = fillTokens(site.prices.note);
      if (pricesGrid && Array.isArray(site.prices.items)) {
        const frag = document.createDocumentFragment();
        site.prices.items.forEach((item) => {
          const card = document.createElement('article');
          card.className = 'price-card';

          const top = document.createElement('div');
          const badge = document.createElement('span');
          badge.className = 'price-label';
          badge.textContent = 'Sample price';
          const h3 = document.createElement('h3');
          h3.textContent = fillTokens(item.service);

          const row = document.createElement('div');
          row.className = 'price-amount-row';
          const amt = document.createElement('span');
          amt.className = 'price-amount';
          amt.textContent = item.price;
          const unit = document.createElement('span');
          unit.className = 'price-unit';
          unit.textContent = item.unit || 'Sample rate';
          row.append(amt, unit);

          const p = document.createElement('p');
          p.className = 'price-summary';
          p.textContent = fillTokens(item.summary);
          top.append(badge, h3, row, p);

          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'btn btn-outline-dark btn-full';
          btn.textContent = `Request ${item.service} Quote`;
          btn.addEventListener('click', () =>
            jumpToQuoteWithService(item.serviceOption || item.service)
          );

          card.append(top, btn);
          frag.appendChild(card);
        });
        pricesGrid.replaceChildren(frag);
      }
    }

    // Why Choose Us (plus optional verified claims only if enabled in config.js)
    const whyGrid = document.getElementById('why-grid');
    if (whyGrid && Array.isArray(site.whyChooseUs)) {
      const frag = document.createDocumentFragment();
      const points = [...site.whyChooseUs];
      if (site.claims && site.claims.licensedAndInsured === true && site.claims.licensedLabel) {
        points.push({
          icon: 'shield',
          title: site.claims.licensedLabel,
          text: `Verified trade credentials for residential & commercial work in ${site.city}.`,
        });
      }
      points.forEach((pt) => {
        const card = document.createElement('article');
        card.className = 'why-card';
        const iconBox = document.createElement('div');
        iconBox.className = 'why-icon';
        iconBox.appendChild(createIconSvg(pt.icon));
        const h3 = document.createElement('h3');
        h3.textContent = fillTokens(pt.title);
        const p = document.createElement('p');
        p.textContent = fillTokens(pt.text);
        card.append(iconBox, h3, p);
        frag.appendChild(card);
      });
      whyGrid.replaceChildren(frag);
    }

    scheduleTask(hydrateLowerSections, 16);
  }

  function hydrateLowerSections() {
    // Lightbox Controller
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

      function renderLightboxFrame() {
        if (!lbItems.length) return;
        const item = lbItems[lbIndex];
        lbImg.src = item.src;
        lbImg.alt = item.alt || item.title;
        lbImg.width = item.width || 960;
        lbImg.height = item.height || 640;
        lbTag.textContent = item.tag || '';
        lbTitle.textContent = item.title || '';
        lbCounter.textContent = `${lbIndex + 1} / ${lbItems.length}`;
      }

      function openLightbox(items, index, trigger) {
        if (!lightbox || !items.length) return;
        lbItems = items;
        lbIndex = ((index % items.length) + items.length) % items.length;
        lastTrigger = trigger || document.activeElement;
        renderLightboxFrame();
        lightbox.hidden = false;
        document.body.classList.add('lb-open');
        lbClose.focus();
      }

      function closeLightbox() {
        if (!lightbox || lightbox.hidden) return;
        lightbox.hidden = true;
        document.body.classList.remove('lb-open');
        if (lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
      }

      function stepLightbox(delta) {
        if (!lbItems.length) return;
        lbIndex = (lbIndex + delta + lbItems.length) % lbItems.length;
        renderLightboxFrame();
      }

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
        lightbox.addEventListener(
          'touchstart',
          (e) => {
            touchStartX = e.changedTouches[0].clientX;
          },
          { passive: true }
        );
        lightbox.addEventListener(
          'touchend',
          (e) => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 42) stepLightbox(dx < 0 ? 1 : -1);
          },
          { passive: true }
        );
      }

      // Gallery (6+ photos with bigger view)
      const galleryGrid = document.getElementById('gallery-grid');
      if (galleryGrid && Array.isArray(site.gallery)) {
        const frag = document.createDocumentFragment();
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

          const caption = document.createElement('span');
          caption.className = 'gallery-caption';

          const meta = document.createElement('span');
          const tag = document.createElement('span');
          tag.className = 'gallery-tag';
          tag.textContent = item.tag;
          const title = document.createElement('span');
          title.className = 'gallery-title';
          title.textContent = item.title;
          meta.append(tag, title);

          const zoom = document.createElement('span');
          zoom.className = 'gallery-zoom';
          zoom.textContent = 'View';

          caption.append(meta, zoom);
          btn.append(img, caption);
          btn.addEventListener('click', () => openLightbox(site.gallery, idx, btn));
          frag.appendChild(btn);
        });
        galleryGrid.replaceChildren(frag);
      }

      // Special Feature 3: Photo Quote Request (Preview -> Send on Text / WhatsApp)
      const quoteForm = document.getElementById('quote-form');
      const photoInput = document.getElementById('quote-photo');
      const previewWrap = document.getElementById('photo-preview-wrap');
      const previewImg = document.getElementById('photo-preview-img');
      const previewName = document.getElementById('photo-preview-name');
      const removePhotoBtn = document.getElementById('photo-remove-btn');
      const uploadBtnText = document.getElementById('upload-btn-text');
      const quoteSubmitBtn = document.getElementById('quote-submit-btn');
      const quoteStep3 = document.getElementById('quote-step-3');
      const quoteResult = document.getElementById('quote-result');
      const quoteResultThumb = document.getElementById('quote-result-thumb');
      const quoteResultImg = document.getElementById('quote-result-img');
      const quoteResultTitle = document.getElementById('quote-result-title');
      const quoteResultDesc = document.getElementById('quote-result-desc');
      const quoteSendLink = document.getElementById('quote-send-link');

      if (quoteSubmitBtn) {
        quoteSubmitBtn.textContent = phoneInfo.isUS
          ? 'Preview & Prepare Text Quote'
          : 'Preview & Send Quote on WhatsApp';
      }
      if (quoteStep3) {
        quoteStep3.textContent = phoneInfo.isUS
          ? `Text the photo and summary straight to ${site.phone}.`
          : `Send the photo and summary on WhatsApp to ${site.phone}.`;
      }

      let selectedPhotoUrl = '';
      let selectedPhotoName = '';

      function clearSelectedPhoto() {
        if (selectedPhotoUrl) {
          URL.revokeObjectURL(selectedPhotoUrl);
          selectedPhotoUrl = '';
        }
        selectedPhotoName = '';
        if (photoInput) photoInput.value = '';
        if (previewWrap) previewWrap.hidden = true;
        if (uploadBtnText) uploadBtnText.textContent = 'Choose or Take Photo';
      }

      if (photoInput) {
        photoInput.addEventListener('change', () => {
          const file = photoInput.files && photoInput.files[0];
          if (!file) {
            clearSelectedPhoto();
            return;
          }
          if (selectedPhotoUrl) URL.revokeObjectURL(selectedPhotoUrl);
          selectedPhotoUrl = URL.createObjectURL(file);
          selectedPhotoName = file.name;
          const kb = Math.max(1, Math.round(file.size / 1024));
          if (previewImg) {
            previewImg.src = selectedPhotoUrl;
            previewImg.alt = `Preview of ${file.name}`;
          }
          if (previewName) {
            previewName.textContent = `${file.name} (${kb} KB)`;
          }
          if (previewWrap) previewWrap.hidden = false;
          if (uploadBtnText) uploadBtnText.textContent = 'Change Photo';
        });
      }

      if (removePhotoBtn) {
        removePhotoBtn.addEventListener('click', clearSelectedPhoto);
      }

      if (quoteForm && quoteResult && quoteSendLink) {
        quoteForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const lines = [...new FormData(quoteForm)]
            .filter(([, v]) => String(v).trim())
            .map(([k, v]) => `${k}: ${String(v).trim()}`);

          if (selectedPhotoName) {
            lines.push(`Photo: ${selectedPhotoName} (attached separately in chat)`);
          }

          const header =
            (site.quoteForm && site.quoteForm.messageHeader) || 'Photo quote request';
          const msg = `${header} for ${site.name} (${site.city}):\n${lines.join('\n')}`;
          const href = msgUrl(msg);

          if (selectedPhotoUrl && quoteResultThumb && quoteResultImg) {
            quoteResultImg.src = selectedPhotoUrl;
            quoteResultImg.alt = `Problem photo preview: ${selectedPhotoName}`;
            quoteResultThumb.hidden = false;
          } else if (quoteResultThumb) {
            quoteResultThumb.hidden = true;
          }

          if (phoneInfo.isUS) {
            quoteResultTitle.textContent = selectedPhotoName
              ? `Photo preview ready — Text this photo to ${site.phone}`
              : `Quote message ready — Text ${site.phone}`;
            quoteResultDesc.textContent = selectedPhotoName
              ? `Your quote text is prepared. Tap below to open Messages for ${site.phone}, then attach "${selectedPhotoName}" to send.`
              : `Your quote text is prepared. Tap below to send it via SMS to ${site.phone}.`;
            quoteSendLink.textContent = selectedPhotoName
              ? `Text this photo to ${site.phone}`
              : `Text quote to ${site.phone}`;
            quoteSendLink.removeAttribute('target');
            quoteSendLink.removeAttribute('rel');
          } else {
            quoteResultTitle.textContent = selectedPhotoName
              ? 'Photo preview ready — Send it on WhatsApp'
              : 'Quote message ready — Send on WhatsApp';
            quoteResultDesc.textContent = selectedPhotoName
              ? `Your quote message is ready. Tap below to open WhatsApp with ${site.phone}, then attach "${selectedPhotoName}" in the chat.`
              : `Tap below to send your quote request on WhatsApp to ${site.phone}.`;
            quoteSendLink.textContent = selectedPhotoName
              ? 'Send this photo on WhatsApp'
              : 'Send Quote on WhatsApp';
            quoteSendLink.target = '_blank';
            quoteSendLink.rel = 'noopener noreferrer';
          }

          quoteSendLink.href = href;
          quoteResult.hidden = false;
          quoteResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

          if (phoneInfo.isUS) {
            window.location.assign(href);
          } else {
            window.open(href, '_blank', 'noopener,noreferrer');
          }
        });
      }

      // Sample Reviews
      const reviewsGrid = document.getElementById('reviews-grid');
      if (reviewsGrid && Array.isArray(site.reviews)) {
        const frag = document.createDocumentFragment();
        site.reviews.forEach((rev) => {
          const card = document.createElement('article');
          card.className = 'review-card';

          const note = document.createElement('span');
          note.className = 'sample-tag';
          note.textContent = rev.note || 'Sample review: replace with a real one';

          const quote = document.createElement('p');
          quote.className = 'review-text';
          quote.textContent = `"${fillTokens(rev.text)}"`;

          const author = document.createElement('p');
          author.className = 'review-author';
          const strong = document.createElement('strong');
          strong.textContent = rev.author;
          const ctx = document.createElement('span');
          ctx.textContent = fillTokens(rev.context);
          author.append(strong, ctx);

          card.append(note, quote, author);
          frag.appendChild(card);
        });
        reviewsGrid.replaceChildren(frag);
      }

      // Hours
      const hoursList = document.getElementById('hours');
      if (hoursList && Array.isArray(site.hours)) {
        const frag = document.createDocumentFragment();
        site.hours.forEach(([day, time]) => {
          const li = document.createElement('li');
          li.textContent = `${day}: ${time}`;
          frag.appendChild(li);
        });
        hoursList.replaceChildren(frag);
      }

      // Google Maps embed synced to resolved address/city (lazy-loaded near viewport)
      const mapFrame = document.getElementById('map-embed');
      if (mapFrame) {
        const mapQuery = site.address || site.city;
        const mapUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
        mapFrame.title = `${site.name} service area map in ${site.city}`;
        const loadMap = () => {
          if (mapFrame.dataset.loaded) return;
          mapFrame.dataset.loaded = '1';
          mapFrame.src = mapUrl;
        };
        if ('IntersectionObserver' in window) {
          const obs = new IntersectionObserver(
            (entries) => {
              if (entries.some((e) => e.isIntersecting)) {
                loadMap();
                obs.disconnect();
              }
            },
            { rootMargin: '350px' }
          );
          obs.observe(mapFrame);
        } else {
          loadMap();
        }
      }

      // Social Links
      const socialList = document.getElementById('social-links');
      if (socialList && Array.isArray(site.social)) {
        const frag = document.createDocumentFragment();
        site.social.forEach((item) => {
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = item.url;
          a.textContent = item.label;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          li.appendChild(a);
          frag.appendChild(li);
        });
        socialList.replaceChildren(frag);
      }
  }

  scheduleTask(hydrateServices, 0);
  scheduleTask(hydrateMidSections, 16);
})();
