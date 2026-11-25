/**
 * ClientoraHQ - Niche 38: Gyms & Fitness (IronCore Fitness)
 * script.js - Core interactive logic, BMI calculator, timetable switcher, lightbox, and instant personalization
 */

(function () {
  'use strict';

  // 1. Resolve Configuration & URL Overrides ("Personal in one minute")
  const config = window.SITE_CONFIG || {};
  const business = Object.assign({}, config.business || {});
  const hours = config.hours || {};
  const colors = config.colors || {};

  // Extract URL parameters (?name=...&city=...&phone=...)
  const urlParams = new URLSearchParams(window.location.search);

  if (urlParams.has('name') && urlParams.get('name').trim() !== '') {
    business.name = urlParams.get('name').trim();
    if (!urlParams.has('email') && business.email) {
      const slug = business.name.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'gym';
      business.email = `info@${slug}.pk`;
    }
  }
  if (urlParams.has('city') && urlParams.get('city').trim() !== '') {
    business.city = urlParams.get('city').trim();
  }
  if (urlParams.has('phone') && urlParams.get('phone').trim() !== '') {
    const rawPhone = urlParams.get('phone').trim();
    business.phone = rawPhone;
    business.phoneFormatted = rawPhone;
    business.whatsapp = rawPhone;
    business.whatsappFormatted = rawPhone;
  }
  if (urlParams.has('email') && urlParams.get('email').trim() !== '') {
    business.email = urlParams.get('email').trim();
  }
  if (urlParams.has('address') && urlParams.get('address').trim() !== '') {
    business.address = urlParams.get('address').trim();
  }

  // Format phone for WhatsApp wa.me links
  function getCleanWhatsAppNumber(phoneStr) {
    if (!phoneStr) return '923001234567';
    let clean = phoneStr.replace(/[^0-9]/g, '');
    // If it starts with 0 (e.g. 03001234567 in Pakistan), change leading 0 to 92
    if (clean.startsWith('0') && clean.length === 11) {
      clean = '92' + clean.slice(1);
    }
    return clean;
  }

  const cleanWaNumber = getCleanWhatsAppNumber(business.whatsapp || business.phone);

  function createWhatsAppUrl(text) {
    const encoded = encodeURIComponent(text);
    return `https://wa.me/${cleanWaNumber}?text=${encoded}`;
  }

  function createTelUrl() {
    return `tel:${business.phone}`;
  }

  // Dynamic token replacement helper: replaces {name}, {city}, etc.
  function interpolate(str) {
    if (!str) return '';
    return str
      .replace(/{name}/g, business.name)
      .replace(/{city}/g, business.city)
      .replace(/{phone}/g, business.phoneFormatted || business.phone);
  }

  // Apply Theme Colors only if changed from default CSS tokens (prevents full-page style invalidation)
  if (colors.primary && colors.primary !== '#ff1e42') {
    document.documentElement.style.setProperty('--color-primary', colors.primary);
  }
  if (colors.primaryHover && colors.primaryHover !== '#e0002b') {
    document.documentElement.style.setProperty('--color-primary-hover', colors.primaryHover);
  }
  if (colors.primaryGlow && colors.primaryGlow !== 'rgba(255, 30, 66, 0.4)' && colors.primaryGlow !== 'rgba(255, 30, 66, 0.45)') {
    document.documentElement.style.setProperty('--color-primary-glow', colors.primaryGlow);
  }

  function hashConfig(obj) {
    const s = JSON.stringify(obj || {});
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(36);
  }

  // 2. Personalize Page Text and Elements
  function applyPersonalization() {
    // Page Title & Meta
    document.title = `${business.name} - Premier Gym & Athletic Training in ${business.city}`;
    const metaDesc = document.getElementById('meta-description');
    if (metaDesc) {
      metaDesc.setAttribute('content', `Join ${business.name} in ${business.city}. High-performance strength training, certified trainers, and group fitness. Claim your free 1-day pass.`);
    }

    // Replace all .dynamic-* only when text actually differs from initial HTML (zero redundant hero relayout)
    const setIfChanged = (el, val) => { if (el && el.textContent !== val) el.textContent = val; };
    document.querySelectorAll('.dynamic-name').forEach(el => setIfChanged(el, business.name));
    const heroTitleEl = document.querySelector('.hero-title');
    if (heroTitleEl && heroTitleEl.getAttribute('aria-label') !== business.name) {
      heroTitleEl.setAttribute('aria-label', business.name);
    }

    document.querySelectorAll('.dynamic-city').forEach(el => setIfChanged(el, business.city));
    const newTagline = interpolate(business.tagline);
    document.querySelectorAll('.dynamic-tagline').forEach(el => setIfChanged(el, newTagline));
    const newDesc = interpolate(business.description);
    document.querySelectorAll('.dynamic-desc').forEach(el => setIfChanged(el, newDesc));
    const newAddress = interpolate(business.address);
    document.querySelectorAll('.dynamic-address').forEach(el => setIfChanged(el, newAddress));
    const phoneDisplay = business.phoneFormatted || business.phone;
    document.querySelectorAll('.dynamic-phone-text').forEach(el => setIfChanged(el, phoneDisplay));
    const waDisplay = business.whatsappFormatted || business.whatsapp;
    document.querySelectorAll('.dynamic-whatsapp-text').forEach(el => setIfChanged(el, waDisplay));

    // Update Email
    const emailEl = document.getElementById('dynamic-email');
    if (emailEl) {
      emailEl.textContent = business.email;
      emailEl.href = `mailto:${business.email}`;
    }

    // Update Call Buttons
    document.querySelectorAll('.dynamic-call-btn').forEach(btn => {
      btn.href = createTelUrl();
    });

    // Update Default WhatsApp Buttons
    const defaultWaMessage = `Hi ${business.name}! I am contacting you from your website regarding gym membership in ${business.city}.`;
    document.querySelectorAll('.dynamic-whatsapp-btn').forEach(btn => {
      // If it doesn't already have a custom handler
      if (!btn.hasAttribute('data-custom-wa')) {
        btn.href = createWhatsAppUrl(defaultWaMessage);
      }
    });

    // Set Map Iframe lazy data-src dynamically (loaded on scroll via IntersectionObserver for 90+ mobile speed)
    const mapIframe = document.getElementById('google-maps-iframe');
    if (mapIframe) {
      const query = encodeURIComponent(`${business.name} ${business.city} Pakistan`);
      mapIframe.setAttribute('data-src', `https://maps.google.com/maps?q=${query}&t=&z=14&ie=UTF8&iwloc=&output=embed`);
    }

    // Update Hours list only when needed (preserves pre-rendered defaults with zero layout shift)
    const hoursListEl = document.getElementById('hours-list');
    if (hoursListEl && hours) {
      const wd = hours.weekdays || '06:00 AM - 11:00 PM';
      const sat = hours.saturday || '07:00 AM - 10:00 PM';
      const sun = hours.sunday || '08:00 AM - 08:00 PM';
      const sum = hours.summary || 'Open 7 Days a Week • Ladies & Gents Dedicated Slots Available';
      const isDefault = hoursListEl.children.length === 4 &&
        wd === '06:00 AM - 11:00 PM' &&
        sat === '07:00 AM - 10:00 PM' &&
        sun === '08:00 AM - 08:00 PM' &&
        sum === 'Open 7 Days a Week • Ladies & Gents Dedicated Slots Available';
      if (!isDefault) {
        hoursListEl.innerHTML = `
        <li><strong>Weekdays:</strong> ${wd}</li>
        <li><strong>Saturday:</strong> ${sat}</li>
        <li><strong>Sunday:</strong> ${sun}</li>
        <li style="margin-top: 0.5rem; color: var(--color-primary-text, #ff7088); font-size: 0.8125rem;">${sum}</li>
      `;
      }
    }

    // Set current year
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  // 3. Render Why Choose Us
  function renderWhyChooseUs() {
    const grid = document.getElementById('why-choose-us-grid');
    if (!grid || !config.whyChooseUs) return;

    const iconMap = {
      dumbbell: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M6.5 5h11a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5H16v6h1.5a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 17.5v-1A1.5 1.5 0 0 1 6.5 15H8V9H6.5A1.5 1.5 0 0 1 5 7.5v-1A1.5 1.5 0 0 1 6.5 5zM10 9v6h4V9h-4zM3 8h1v8H3a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1zm18 0a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-1V8h1z"/></svg>',
      certificate: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>',
      'chart-line': '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>',
      'shield-check': '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
    };

    grid.innerHTML = config.whyChooseUs.map(item => `
      <div class="feature-card">
        <div class="feature-icon-box" aria-hidden="true">
          ${iconMap[item.icon] || iconMap.dumbbell}
        </div>
        <h3 class="feature-title">${item.title}</h3>
        <p class="feature-desc">${interpolate(item.description)}</p>
      </div>
    `).join('');
  }

  // 4. Render Special Feature 1: Membership Plans
  function renderMembershipPlans() {
    const grid = document.getElementById('membership-plans-grid');
    if (!grid || !config.membershipPlans) return;

    grid.innerHTML = config.membershipPlans.map(plan => {
      const isBest = plan.isBestValue;
      const prefill = interpolate(plan.whatsappPrefill || `Hi {name}! I want to join the ${plan.name} (${plan.price}).`).replace('{price}', plan.price);
      const waLink = createWhatsAppUrl(prefill);

      return `
        <article class="plan-card ${isBest ? 'best-value' : ''}">
          ${plan.badge ? `<div class="plan-badge">${plan.badge}</div>` : ''}
          <div class="plan-header">
            <h3 class="plan-name">${plan.name}</h3>
            <span class="plan-duration">${plan.duration} Commitment</span>
            <div class="plan-price-box">
              <span class="plan-price">${plan.price}</span>
              <span class="plan-period">${plan.period}</span>
              ${plan.effectivePrice ? `<span class="plan-effective">${plan.effectivePrice}</span>` : ''}
            </div>
          </div>

          <ul class="plan-features">
            ${plan.features.map(f => `
              <li class="plan-feature-item">
                <span class="plan-check-icon" aria-hidden="true">&#10003;</span>
                <span>${f}</span>
              </li>
            `).join('')}
          </ul>

          <a href="${waLink}" class="btn ${isBest ? 'btn-primary' : 'btn-outline'} btn-block" target="_blank" rel="noopener noreferrer">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 18.06c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.19 8.19 0 0 1-1.26-4.29c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.01 4.54-3.68 8.24-8.22 8.24zm4.51-6.17c-.25-.12-1.47-.72-1.7-.8-.23-.08-.39-.12-.56.12-.17.25-.64.8-.79.97-.14.17-.29.19-.54.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.43.53.6.19 1.15.16 1.58.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.11-.23-.17-.48-.3z"/></svg>
            <span>Choose ${plan.name}</span>
          </a>
        </article>
      `;
    }).join('');
  }

  // 5. Render Special Feature 2: Class Timetable by Day (Tabs Switchable)
  let activeDay = 'mon';
  function setupClassTimetable(skipInitialRender) {
    const tabsContainer = document.getElementById('timetable-tabs');
    const contentContainer = document.getElementById('timetable-content');
    if (!tabsContainer || !contentContainer || !config.classTimetable) return;

    const days = config.classTimetable.days || [];
    const schedule = config.classTimetable.schedule || {};

    if (!skipInitialRender || tabsContainer.children.length === 0) {
      tabsContainer.innerHTML = days.map(d => `
        <button type="button" class="tab-btn ${d.id === activeDay ? 'active' : ''}" data-day="${d.id}" role="tab" aria-selected="${d.id === activeDay}">
          ${d.label}
        </button>
      `).join('');
    }

    // Function to render active day's classes
    function renderClassesForDay(dayId) {
      const classes = schedule[dayId] || [];
      const dayObj = days.find(d => d.id === dayId);
      const dayName = dayObj ? dayObj.label : dayId;

      if (classes.length === 0) {
        contentContainer.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--color-text-muted);">
            No group classes scheduled for ${dayName}. Open gym floor and personal training available!
          </div>
        `;
        return;
      }

      contentContainer.innerHTML = classes.map(c => {
        const isExtreme = c.intensity.toLowerCase().includes('extreme') || c.intensity.toLowerCase().includes('very');
        const bookingPrefill = `Hi ${business.name}! I would like to book a spot in the "${c.name}" class on ${dayName} (${c.time}) with coach ${c.trainer}.`;
        const waLink = createWhatsAppUrl(bookingPrefill);

        return `
          <div class="class-card">
            <div class="class-header">
              <span class="class-time">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/></svg>
                ${c.time}
              </span>
              <span class="intensity-badge ${isExtreme ? 'extreme' : ''}">${c.intensity} Intensity</span>
            </div>
            <h3 class="class-title">${c.name}</h3>
            <div class="class-details">
              <div class="class-detail-item">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                <span>Coach ${c.trainer}</span>
              </div>
              <div class="class-detail-item">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
                <span>${c.room}</span>
              </div>
            </div>
            <div class="class-actions">
              <a href="${waLink}" class="btn btn-sm btn-outline btn-block" target="_blank" rel="noopener noreferrer">
                <span>Book Spot on WhatsApp</span>
              </a>
            </div>
          </div>
        `;
      }).join('');
    }

    if (!skipInitialRender || contentContainer.children.length === 0) {
      renderClassesForDay(activeDay);
    }

    // Event listener on tabs
    tabsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      activeDay = btn.getAttribute('data-day');

      tabsContainer.querySelectorAll('.tab-btn').forEach(b => {
        const isCurrent = b.getAttribute('data-day') === activeDay;
        b.classList.toggle('active', isCurrent);
        b.setAttribute('aria-selected', isCurrent);
      });

      renderClassesForDay(activeDay);
    });
  }

  // 6. Render Trainers
  function renderTrainers() {
    const grid = document.getElementById('trainers-grid');
    if (!grid || !config.trainers) return;

    grid.innerHTML = config.trainers.map(t => {
      const waMsg = `Hi ${business.name}! I would like to schedule a personal training consultation with coach ${t.name}.`;
      return `
        <article class="trainer-card">
          <div class="trainer-image-box">
            <img src="${t.image}" alt="${t.name} - ${t.role}" class="trainer-image" loading="lazy" width="600" height="400">
            <div class="trainer-overlay"></div>
          </div>
          <div class="trainer-info">
            <h3 class="trainer-name">${t.name}</h3>
            <span class="trainer-role">${t.role}</span>
            <div class="trainer-badges">
              <span><strong>Exp:</strong> ${t.experience}</span>
              <span><strong>Certs:</strong> ${t.certs}</span>
            </div>
            <blockquote class="trainer-quote">“${t.quote}”</blockquote>
            <a href="${createWhatsAppUrl(waMsg)}" class="btn btn-sm btn-outline" target="_blank" rel="noopener noreferrer">
              <span>Book Coach ${t.name.split(' ')[0]}</span>
            </a>
          </div>
        </article>
      `;
    }).join('');
  }

  // 7. Special Feature 3: BMI Calculator (Height and weight with result explained)
  function setupBmiCalculator() {
    const unitMetricBtn = document.getElementById('unit-metric');
    const unitImperialBtn = document.getElementById('unit-imperial');
    const groupMetric = document.getElementById('group-metric');
    const groupImperial = document.getElementById('group-imperial');
    const calcBtn = document.getElementById('calculate-bmi-btn');

    const scoreValEl = document.getElementById('bmi-score-val');
    const catValEl = document.getElementById('bmi-category-val');
    const markerEl = document.getElementById('bmi-meter-marker');
    const explanationEl = document.getElementById('bmi-explanation-text');
    const waCtaEl = document.getElementById('bmi-whatsapp-cta');

    if (!calcBtn || !scoreValEl) return;

    let currentUnit = 'metric';

    unitMetricBtn.addEventListener('click', () => {
      currentUnit = 'metric';
      unitMetricBtn.classList.add('active');
      unitImperialBtn.classList.remove('active');
      groupMetric.classList.remove('hidden');
      groupImperial.classList.add('hidden');
    });

    unitImperialBtn.addEventListener('click', () => {
      currentUnit = 'imperial';
      unitImperialBtn.classList.add('active');
      unitMetricBtn.classList.remove('active');
      groupImperial.classList.remove('hidden');
      groupMetric.classList.add('hidden');
    });

    function calculateBmi() {
      let heightMeters = 0;
      let weightKg = 0;

      if (currentUnit === 'metric') {
        const cm = parseFloat(document.getElementById('bmi-height-cm').value);
        const kg = parseFloat(document.getElementById('bmi-weight-kg').value);
        if (!cm || !kg || cm <= 0 || kg <= 0) {
          alert('Please enter valid height in cm and weight in kg.');
          return;
        }
        heightMeters = cm / 100;
        weightKg = kg;
      } else {
        const ft = parseFloat(document.getElementById('bmi-height-ft').value) || 0;
        const inc = parseFloat(document.getElementById('bmi-height-in').value) || 0;
        const lbs = parseFloat(document.getElementById('bmi-weight-lbs').value) || 0;
        const totalInches = (ft * 12) + inc;
        if (!totalInches || !lbs || totalInches <= 0 || lbs <= 0) {
          alert('Please enter valid feet, inches, and pounds.');
          return;
        }
        // BMI formula for imperial: (lbs * 703) / (inches^2)
        const imperialBmi = (lbs * 703) / (totalInches * totalInches);
        displayBmiResult(imperialBmi);
        return;
      }

      const bmi = weightKg / (heightMeters * heightMeters);
      displayBmiResult(bmi);
    }

    function displayBmiResult(rawBmi) {
      const bmi = Math.round(rawBmi * 10) / 10;
      scoreValEl.textContent = bmi.toFixed(1);

      let category = '';
      let markerPercent = 50;
      let explanation = '';
      let categoryColor = '#10b981';

      if (bmi < 18.5) {
        category = 'Underweight';
        categoryColor = '#60a5fa';
        // 0 to 18.5 maps to 5% - 25%
        markerPercent = Math.max(5, Math.min(24, (bmi / 18.5) * 25));
        explanation = `<strong>Underweight (BMI &lt; 18.5):</strong> Your score indicates you may be below the optimal weight benchmark. At <em>${business.name}</em>, we recommend our structured hypertrophy resistance program paired with high-calorie nutrition to build lean muscular tissue safely.`;
      } else if (bmi >= 18.5 && bmi <= 24.9) {
        category = 'Normal & Healthy Weight';
        categoryColor = '#34d399';
        // 18.5 to 25 maps to 26% - 50%
        markerPercent = 25 + ((bmi - 18.5) / 6.4) * 25;
        explanation = `<strong>Optimal Health (BMI 18.5 - 24.9):</strong> Outstanding! You are in the healthy standard weight zone. You have an ideal foundation to focus on body recomposition, boosting cardiovascular stamina, and hitting new strength PRs with our certified trainers.`;
      } else if (bmi >= 25 && bmi <= 29.9) {
        category = 'Overweight';
        categoryColor = '#fbbf24';
        // 25 to 30 maps to 51% - 75%
        markerPercent = 50 + ((bmi - 25) / 5) * 25;
        explanation = `<strong>Overweight (BMI 25 - 29.9):</strong> Your calculated ratio is slightly elevated above the standard range. Our dynamic HIIT classes, barbell circuits, and metabolic conditioning can help you shed fat quickly while safeguarding your muscle mass.`;
      } else {
        category = 'Obese Range';
        categoryColor = '#f87171';
        // 30 to 40+ maps to 76% - 95%
        markerPercent = Math.min(96, 75 + ((bmi - 30) / 15) * 20);
        explanation = `<strong>Obesity Category (BMI 30+):</strong> Carrying excess weight places unnecessary strain on your joints and cardiovascular system. Our coaches specialize in joint-friendly, low-impact strength training combined with sustainable dietary adjustments to produce safe, lasting transformation.`;
      }

      catValEl.textContent = category;
      catValEl.style.color = categoryColor;
      scoreValEl.style.color = categoryColor;
      markerEl.style.left = `${markerPercent}%`;
      explanationEl.innerHTML = `<p>${explanation}</p>`;

      // Update CTA
      const waMessage = `Hi ${business.name}! I calculated my BMI as ${bmi} (${category}) on your website and would like a consultation on the best training plan for me in ${business.city}.`;
      waCtaEl.href = createWhatsAppUrl(waMessage);
    }

    calcBtn.addEventListener('click', calculateBmi);
    // Sync initial WhatsApp link without redundant layout write (default 23.5 is already rendered)
    if (waCtaEl) {
      const initWaMsg = `Hi ${business.name}! I calculated my BMI as 23.5 (Normal & Healthy Weight) on your website and would like a consultation on the best training plan for me in ${business.city}.`;
      waCtaEl.href = createWhatsAppUrl(initWaMsg);
    }
  }

  // 8. Render Gallery with Lightbox ("gallery of 6 or more photos with a bigger view")
  let currentLightboxIndex = 0;
  const galleryItems = config.gallery || [];

  function setupGallery(skipInitialRender) {
    const galleryGrid = document.getElementById('gallery-grid');
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxBackdrop = document.getElementById('lightbox-backdrop');

    if (lightboxModal) {
      lightboxModal.classList.remove('active');
      lightboxModal.setAttribute('hidden', '');
      lightboxModal.style.display = 'none';
    }

    if (!galleryGrid || galleryItems.length === 0) return;

    if (!skipInitialRender || galleryGrid.children.length === 0) {
      galleryGrid.innerHTML = galleryItems.map((item, index) => `
        <div class="gallery-item" data-index="${index}" tabindex="0" role="button" aria-label="View photo: ${item.caption}">
          <img src="${item.image}" alt="${item.caption}" loading="lazy" width="800" height="600">
          <div class="gallery-item-overlay">
            <span class="gallery-item-caption">${item.caption}</span>
            <span class="gallery-zoom-badge">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/></svg>
              Click to expand
            </span>
          </div>
        </div>
      `).join('');
    }

    function openLightbox(index) {
      currentLightboxIndex = index;
      const item = galleryItems[currentLightboxIndex];
      lightboxImg.src = item.image;
      lightboxImg.alt = item.caption;
      lightboxCaption.textContent = `${item.caption} (${currentLightboxIndex + 1} of ${galleryItems.length})`;
      lightboxModal.removeAttribute('hidden');
      lightboxModal.classList.add('active');
      lightboxModal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      lightboxClose.focus();
    }

    function closeLightbox() {
      lightboxModal.setAttribute('hidden', '');
      lightboxModal.classList.remove('active');
      lightboxModal.style.display = 'none';
      document.body.style.overflow = '';
    }

    function showNext() {
      currentLightboxIndex = (currentLightboxIndex + 1) % galleryItems.length;
      openLightbox(currentLightboxIndex);
    }

    function showPrev() {
      currentLightboxIndex = (currentLightboxIndex - 1 + galleryItems.length) % galleryItems.length;
      openLightbox(currentLightboxIndex);
    }

    // Grid item click / keydown
    galleryGrid.addEventListener('click', (e) => {
      const item = e.target.closest('.gallery-item');
      if (!item) return;
      const idx = parseInt(item.getAttribute('data-index'), 10);
      openLightbox(idx);
    });

    galleryGrid.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const item = e.target.closest('.gallery-item');
        if (item) {
          e.preventDefault();
          const idx = parseInt(item.getAttribute('data-index'), 10);
          openLightbox(idx);
        }
      }
    });

    // Lightbox Controls
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxBackdrop.addEventListener('click', closeLightbox);
    lightboxNext.addEventListener('click', showNext);
    lightboxPrev.addEventListener('click', showPrev);

    // Keyboard support (Escape, Left, Right)
    document.addEventListener('keydown', (e) => {
      if (lightboxModal.hasAttribute('hidden')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    });
  }

  // 9. Free Trial Form ("Forms need no server: they open WhatsApp (wa.me) with the message written")
  function setupFreeTrialForm() {
    const form = document.getElementById('free-trial-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('trial-name').value.trim();
      const phone = document.getElementById('trial-phone').value.trim();
      const slot = document.getElementById('trial-slot').value;
      const goal = document.getElementById('trial-goal').value;

      if (!name || !phone) {
        alert('Please fill out your name and phone number.');
        return;
      }

      const messageText = `*NEW FREE TRIAL INQUIRY*\n` +
        `--------------------------\n` +
        `*Business:* ${business.name} (${business.city})\n` +
        `*Name:* ${name}\n` +
        `*Phone:* ${phone}\n` +
        `*Preferred Slot:* ${slot}\n` +
        `*Fitness Goal:* ${goal}\n` +
        `--------------------------\n` +
        `Hello! I would like to book my 1-Day Free Trial VIP Pass. Please confirm my reservation.`;

      const targetUrl = createWhatsAppUrl(messageText);
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    });
  }

  // 10. Render Reviews (Mandatory: reviews marked "Sample review: replace with a real one")
  function renderReviews() {
    const grid = document.getElementById('reviews-grid');
    if (!grid || !config.reviews) return;

    grid.innerHTML = config.reviews.map(r => `
      <article class="review-card">
        <!-- Mandatory notice from document requirements -->
        <div class="review-sample-badge">
          <span aria-hidden="true">&#9432;</span>
          <span>${r.note || 'Sample review: replace with a real one'}</span>
        </div>

        <div class="review-stars" role="img" aria-label="${r.rating} out of 5 stars">
          <span aria-hidden="true">${'&#9733;'.repeat(r.rating || 5)}</span>
        </div>

        <p class="review-text">“${interpolate(r.text)}”</p>

        <div class="review-author-box">
          <div class="review-avatar" aria-hidden="true">${r.author.charAt(0)}</div>
          <div>
            <div class="review-author-name">${r.author}</div>
            <div class="review-author-tenure">${r.tag}</div>
          </div>
        </div>
      </article>
    `).join('');
  }

  // 11. Setup Mobile Navigation Toggle
  function setupMobileNav() {
    const toggleBtn = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    if (!toggleBtn || !navMenu) return;

    toggleBtn.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      toggleBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close menu when clicking nav links
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 12. Setup News Bar Ticker Animation
  function setupNewsTicker() {
    const track = document.getElementById('news-marquee-track');
    if (!track) return;
    const tickerItems = config.newsTicker || [
      "★ SPECIAL ADMISSIONS: 20% OFF ON 3-MONTH PRO TRANSFORMATION PLAN",
      "• 1-DAY FREE VIP GUEST PASS AVAILABLE NOW FOR NEW MEMBERS",
      "★ CERTIFIED COACHING & OLYMPIC EQUIPMENT IN {city}",
      "• EXTENDED HOURS: OPEN 7 DAYS A WEEK (MON-FRI 6 AM - 11 PM)"
    ];

    const formatted = tickerItems.map(item => `
      <span class="news-ticker-item">${interpolate(item)}</span>
    `).join(' • ');

    // Two identical halves so CSS translate3d(-50%) loops seamlessly
    track.innerHTML = `<span class="news-ticker-group">${formatted} • </span><span class="news-ticker-group" aria-hidden="true">${formatted} • </span>`;
  }

  // 13. Setup Hero Typewriter Animation
  function initTypewriter() {
    const el = document.getElementById('hero-typewriter');
    if (!el) return;

    // Set initial text only if personalized name differs
    if (el.textContent !== business.name) el.textContent = business.name;

    const phrases = [
      business.name,
      "FORGE ELITE STRENGTH",
      business.name,
      `PREMIER GYM IN ${business.city.toUpperCase()}`,
      business.name
    ];

    let phraseIndex = 0;
    let charIndex = business.name.length;
    let isDeleting = true; // start after initial display
    let typingSpeed = 80;

    function typeLoop() {
      const currentPhrase = phrases[phraseIndex];

      if (isDeleting) {
        charIndex--;
        typingSpeed = 35;
      } else {
        charIndex++;
        typingSpeed = 75;
      }

      el.textContent = currentPhrase.substring(0, charIndex);

      if (!isDeleting && charIndex === currentPhrase.length) {
        // Pause longer on business name
        typingSpeed = phraseIndex % 2 === 0 ? 3200 : 1600;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 350;
      }

      setTimeout(typeLoop, typingSpeed);
    }

    // Delay first backspace so initial title & LCP remain rock-solid on load
    setTimeout(typeLoop, 4500);
  }

  // Lazy load embedded Google Map when Contact section approaches viewport
  function setupLazyMap() {
    const mapEl = document.getElementById('google-maps-iframe');
    const contactSec = document.getElementById('contact');
    if (!mapEl) return;

    function loadMap() {
      const target = mapEl.getAttribute('data-src');
      if (!target) return;
      if (mapEl.tagName === 'IFRAME') {
        if (!mapEl.getAttribute('src')) mapEl.setAttribute('src', target);
        return;
      }
      const iframe = document.createElement('iframe');
      iframe.id = 'google-maps-iframe';
      iframe.title = 'Gym Location Map';
      iframe.className = 'google-map';
      iframe.src = target;
      iframe.loading = 'lazy';
      iframe.referrerPolicy = 'no-referrer-when-downgrade';
      iframe.allowFullscreen = true;
      mapEl.replaceWith(iframe);
    }

    if ('IntersectionObserver' in window && contactSec) {
      const observer = new IntersectionObserver((entries) => {
        if (entries.some(e => e.isIntersecting)) {
          loadMap();
          observer.disconnect();
        }
      }, { rootMargin: '400px 0px' });
      observer.observe(contactSec);
    } else {
      loadMap();
    }
  }

  // Initialize fast while always staying 100% reactive to config.js edits and ?name=&city=&phone= overrides
  function initSite() {
    applyPersonalization();
    initTypewriter();
    setupMobileNav();
    setupBmiCalculator();
    setupFreeTrialForm();
    setupLazyMap();

    // Yield each section independently across macrotasks so no task blocks mobile input (> 50ms)
    const renderBatches = [
      () => setupNewsTicker(),
      () => renderWhyChooseUs(),
      () => renderMembershipPlans(),
      () => setupClassTimetable(false),
      () => renderTrainers(),
      () => setupGallery(false),
      () => renderReviews()
    ];

    let batchIdx = 0;
    function runNextBatch() {
      if (batchIdx >= renderBatches.length) return;
      renderBatches[batchIdx++]();
      if (batchIdx < renderBatches.length) {
        setTimeout(runNextBatch, 4);
      }
    }

    requestAnimationFrame(() => setTimeout(runNextBatch, 4));
  }

  if (document.readyState !== 'loading') {
    initSite();
  } else {
    document.addEventListener('DOMContentLoaded', initSite);
  }
})();
