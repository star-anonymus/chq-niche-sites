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
    // A Pakistani number like 03001234567 becomes 923001234567 for WhatsApp.
    const digits = site.phone.replace(/\D/g, '');
    site.whatsapp = digits.startsWith('0') ? '92' + digits.slice(1) : digits;
  }

  document.title = `${site.name} · ${site.city}`;
  document.querySelectorAll('[data-field]').forEach((el) => {
    const v = site[el.dataset.field];
    if (v != null) el.textContent = v; // textContent: link values can never inject HTML
  });

  const wa = (text) => `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;
  document.querySelectorAll('[data-link]').forEach((a) => {
    const kind = a.dataset.link;
    if (kind === 'whatsapp') a.href = wa(`Hello ${site.name}, I found you on your website.`);
    if (kind === 'call') a.href = `tel:${site.phone.replace(/\s/g, '')}`;
    if (kind === 'email') a.href = `mailto:${site.email}`;
  });

  const hours = document.getElementById('hours');
  if (hours) hours.innerHTML = '';
  if (hours) site.hours.forEach(([d, t]) => {
    const li = document.createElement('li');
    li.textContent = `${d}: ${t}`;
    hours.appendChild(li);
  });

  const root = document.documentElement.style;
  root.setProperty('--primary', site.colors.primary);
  root.setProperty('--dark', site.colors.dark);
  root.setProperty('--light', site.colors.light);

  // Forms with data-whatsapp send every filled field as one WhatsApp message.
  document.querySelectorAll('form[data-whatsapp]').forEach((form) => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const lines = [...new FormData(form)].filter(([, v]) => String(v).trim()).map(([k, v]) => `${k}: ${v}`);
      window.open(wa(`${form.dataset.whatsapp}\n${lines.join('\n')}`), '_blank', 'noopener');
    });
  });

  window.SITE_LIVE = site; // the final values, for your own niche code
})();
