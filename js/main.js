/* =============================================
   XWIFTY NETWORKS — main.js
   ============================================= */

// ===== CONFIGURACIÓN CENTRALIZADA =====
const XWIFTY_CONFIG = Object.freeze({
  WA_NUMBER: '51958195467',
  WA_BASE: 'https://wa.me/',
  PORTAL_URL: 'https://clientes.portalinternet.app/saldo/new-xwifty-networks/',
  INSTALL_URL: 'https://wisphub.app/solicitar-instalacion/new-xwifty-networks/',
  ALLOWED_IMG_HOSTS: ['images.unsplash.com', 'images.xwifty.pe']
});

// ===== UTILIDADES DE SEGURIDAD =====
function sanitizeText(str) {
  const d = document.createElement('div');
  d.textContent = String(str);
  return d.innerHTML;
}
function isSafeUrl(url) {
  try {
    const u = new URL(url, location.origin);
    return ['https:', 'http:'].includes(u.protocol);
  } catch { return false; }
}

// ===== HERO SLIDER =====
(function () {
  const slides = document.querySelectorAll('.hero-slide');
  const dots   = document.querySelectorAll('.hero-dot');
  const prev   = document.querySelector('.hero-arrow--prev');
  const next   = document.querySelector('.hero-arrow--next');
  const bar    = document.querySelector('.hero-progress__bar');
  const DURATION = 6000;
  let current = 0;
  let timer;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
    // Reset progress bar
    if (bar) {
      bar.style.transition = 'none';
      bar.style.width = '0%';
      requestAnimationFrame(() => requestAnimationFrame(() => {
        bar.style.transition = `width ${DURATION}ms linear`;
        bar.style.width = '100%';
      }));
    }
  }

  function start() { timer = setInterval(() => goTo(current + 1), DURATION); }
  function reset() { clearInterval(timer); start(); }

  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); reset(); }));
  if (prev) prev.addEventListener('click', () => { goTo(current - 1); reset(); });
  if (next) next.addEventListener('click', () => { goTo(current + 1); reset(); });

  // Pausar al pasar el mouse
  const slider = document.querySelector('.hero-slider');
  if (slider) {
    slider.addEventListener('mouseenter', () => clearInterval(timer));
    slider.addEventListener('mouseleave', () => { clearInterval(timer); start(); });
  }

  // Swipe táctil
  let touchStartX = 0;
  if (slider) {
    slider.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { goTo(diff > 0 ? current + 1 : current - 1); reset(); }
    }, { passive: true });
  }

  // Iniciar
  goTo(0);
  start();
})();

// ===== STICKY HEADER =====
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

// ===== MOBILE MENU =====
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

hamburger.addEventListener('click', () => {
  const open = hamburger.classList.toggle('open');
  nav.classList.toggle('open', open);
  hamburger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
});

// Close menu on nav link click
document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    nav.classList.remove('open');
  });
});

// Close menu on outside click
document.addEventListener('click', e => {
  if (!header.contains(e.target)) {
    hamburger.classList.remove('open');
    nav.classList.remove('open');
  }
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const offset = header.offsetHeight + 16;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ===== PLAN TABS =====
const tabBtns = document.querySelectorAll('.tab-btn');
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('tab-btn--active'));
    btn.classList.add('tab-btn--active');
    const tab = btn.dataset.tab;
    document.querySelectorAll('.planes__grid').forEach(grid => {
      grid.classList.add('hidden');
    });
    const target = document.getElementById(`tab-${tab}`);
    if (target) {
      target.classList.remove('hidden');
      // Reset slider to first card
      const track = target.querySelector('.planes__track');
      if (track) track.style.transform = 'translateX(0)';
      target.querySelectorAll('.planes-dot').forEach((d, i) => d.classList.toggle('planes-dot--active', i === 0));
      // Re-trigger reveal for newly shown cards
      target.querySelectorAll('.reveal').forEach(el => {
        el.classList.remove('visible');
        setTimeout(() => el.classList.add('visible'), 50);
      });
    }
  });
});

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, i * 80);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== FAQ ACCORDION =====
document.querySelectorAll('.faq__question').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    // Close all
    document.querySelectorAll('.faq__question').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.classList.remove('open');
    });
    // Open clicked if it was closed
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.classList.add('open');
    }
  });
});

// ===== CONTACT FORM — WhatsApp redirect =====
const form = document.getElementById('contactForm');
if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    let valid = true;

    const nombre = form.nombre.value.trim();
    const telefono = form.telefono.value.trim();
    const email = form.email.value.trim();
    const servicio = form.servicio.value;

    // Clear previous errors
    ['nombre', 'telefono', 'email', 'servicio'].forEach(field => {
      const el = form[field];
      el.classList.remove('error');
      const err = document.getElementById(`error-${field}`);
      if (err) err.textContent = '';
    });

    // Validate nombre
    if (nombre.length < 3) {
      showError('nombre', 'Por favor ingresa tu nombre completo.');
      valid = false;
    }

    // Validate telefono
    if (!/^\d{9,15}$/.test(telefono.replace(/\s/g, ''))) {
      showError('telefono', 'Ingresa un número de teléfono válido (9 dígitos).');
      valid = false;
    }

    // Validate email (optional but if filled must be valid)
    if (email && !/^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/.test(email)) {
      showError('email', 'Ingresa un correo electrónico válido.');
      valid = false;
    }

    // Validate servicio
    if (!servicio) {
      showError('servicio', 'Por favor selecciona un servicio.');
      valid = false;
    }

    if (!valid) return;

    const mensaje = form.mensaje.value.trim();
    const texto = encodeURIComponent(
      `Hola, soy *${nombre}*.\n` +
      `Teléfono: ${telefono}\n` +
      (email ? `Email: ${email}\n` : '') +
      `Servicio de interés: *${servicio}*\n` +
      (mensaje ? `Mensaje: ${mensaje}` : '')
    );

    window.open(`https://wa.me/51958195467?text=${texto}`, '_blank', 'noopener,noreferrer');

    const successEl = document.getElementById('formSuccess');
    if (successEl) {
      form.style.display = 'none';
      successEl.classList.add('show');
      setTimeout(() => {
        successEl.classList.remove('show');
        form.style.display = 'flex';
        form.reset();
      }, 4000);
    } else {
      form.reset();
    }
  });
}

function showError(field, msg) {
  const el = document.getElementById(`error-${field}`);
  const input = document.getElementById(field) || document.querySelector(`[name="${field}"]`);
  if (el) el.textContent = msg;
  if (input) input.classList.add('error');
}

// ===== SPEED BAR ANIMATION =====
const speedBarObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fill = entry.target.querySelector('.plan-speed-bar__fill');
      if (fill) {
        const target = fill.style.getPropertyValue('--target-fill') || '0%';
        requestAnimationFrame(() => { fill.style.width = target; });
      }
      speedBarObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.plan-speed-bar').forEach(bar => speedBarObserver.observe(bar));

// ===== COUNTER ANIMATION =====
function animateCounter(el, target, duration = 1600) {
  const isPlus = el.dataset.suffix === '+';
  const isPercent = el.dataset.suffix === '%';
  const isH = el.dataset.suffix === 'h';
  const start = 0;
  const startTime = performance.now();

  function update(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(start + (target - start) * ease);
    el.textContent = (value >= 1000 ? value.toLocaleString() : value)
      + (isPlus ? '+' : isPercent ? '%' : isH ? 'h' : '');
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target,
        parseInt(entry.target.dataset.target),
        parseInt(entry.target.dataset.duration || 1600));
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-counter]').forEach(el => counterObserver.observe(el));

// ===== ACTIVE NAV LINK ON SCROLL =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav__link');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => link.classList.remove('nav__link--active'));
      const active = document.querySelector(`.nav__link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('nav__link--active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(sec => sectionObserver.observe(sec));

// ===== DYNAMIC COPYRIGHT YEAR =====
const copyrightEl = document.querySelector('.footer__bottom-inner p');
if (copyrightEl) {
  copyrightEl.innerHTML = `&copy; ${new Date().getFullYear()} Xwifty Networks. Todos los derechos reservados.`;
}

// ===== SCROLL TO TOP =====
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =============================================
   PROYECTOS — GALERÍA MODAL
   ============================================= */

const PROJECTS = [
  {
    id: 1,
    cat: 'Fibra Óptica',
    title: 'Instalación FTTH Residencial',
    desc: 'Diseño e implementación de red FTTH para conjunto residencial de 120 unidades en Pilcomayo, Huancayo. Incluye tendido de cable ADSS aéreo, fusión de fibra óptica, instalación de cajas NAP y configuración de ONTs Huawei para servicio simétrico 200Mbps por unidad.',
    meta: [
      { label: 'Cliente', value: 'Residencial Los Jardines' },
      { label: 'Ubicación', value: 'Pilcomayo, Huancayo' },
      { label: 'Alcance', value: '120 unidades habitacionales' },
      { label: 'Año', value: '2023' },
    ],
    imgs: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
      'https://images.unsplash.com/photo-1545987796-200677ee1011?w=800&q=80',
      'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    ],
  },
  {
    id: 2,
    cat: 'Red Empresarial',
    title: 'Red Corporativa Data Center',
    desc: 'Diseño y despliegue de red de datos estructurada Cat6A para oficinas corporativas. 80 puntos de red Gigabit, rack de comunicaciones con patch panel, switches MikroTik administrables y sistema WiFi 6 Ubiquiti con cobertura total en 3 pisos.',
    meta: [
      { label: 'Cliente', value: 'Empresa comercial' },
      { label: 'Ubicación', value: 'El Tambo, Huancayo' },
      { label: 'Alcance', value: '80 puntos · 3 pisos' },
      { label: 'Año', value: '2024' },
    ],
    imgs: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
      'https://images.unsplash.com/photo-1545987796-200677ee1011?w=800&q=80',
      'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&q=80',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    ],
  },
  {
    id: 3,
    cat: 'Videovigilancia',
    title: 'Sistema de Videovigilancia',
    desc: 'Instalación de sistema CCTV de 32 canales IP con cámaras HikVision 4MP en perímetro e interior de local comercial. NVR con almacenamiento 30 días en HDD 4TB, acceso remoto desde app móvil y alertas de movimiento en tiempo real.',
    meta: [
      { label: 'Cliente', value: 'Local comercial' },
      { label: 'Ubicación', value: 'Huancayo Centro' },
      { label: 'Alcance', value: '32 cámaras IP 4MP' },
      { label: 'Año', value: '2023' },
    ],
    imgs: [
      'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
      'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
    ],
  },
  {
    id: 4,
    cat: 'Internet Satelital',
    title: 'Internet Satelital Zona Rural',
    desc: 'Despliegue de conectividad satelital de alta velocidad para 5 comunidades rurales en la sierra de Junín. Antenas VSAT, equipos de distribución local WiFi y capacitación a usuarios. Conectando zonas sin cobertura de fibra ni cable.',
    meta: [
      { label: 'Cliente', value: 'Comunidades rurales Junín' },
      { label: 'Ubicación', value: 'Sierra central, Junín' },
      { label: 'Alcance', value: '5 comunidades · ~200 familias' },
      { label: 'Año', value: '2022' },
    ],
    imgs: [
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
      'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&q=80',
      'https://images.unsplash.com/photo-1545987796-200677ee1011?w=800&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    ],
  },
  {
    id: 5,
    cat: 'CATV',
    title: 'Diseño de Red CATV',
    desc: 'Implementación de sistema CATV con cabecera digital y distribución en árbol para operador local. Más de 1000 canales en HD 1080p, distribución por coaxial RG-6, splitters, amplificadores de línea y decodificadores instalados en puntos de suscriptor.',
    meta: [
      { label: 'Cliente', value: 'Operador local de TV' },
      { label: 'Ubicación', value: 'Pilcomayo, Huancayo' },
      { label: 'Alcance', value: '+1000 canales HD · 300 suscrip.' },
      { label: 'Año', value: '2023' },
    ],
    imgs: [
      'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=800&q=80',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
      'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&q=80',
      'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
    ],
  },
  {
    id: 6,
    cat: 'Redes Locales',
    title: 'Cableado Estructurado LAN',
    desc: 'Diseño y ejecución de cableado estructurado Cat6A para empresa de servicios. Data Center con rack 24U, patch panels, switches administrables, UPS de respaldo y certificación de cada tramo con tester Fluke. Red estable con uptime 99.9%.',
    meta: [
      { label: 'Cliente', value: 'Empresa de servicios' },
      { label: 'Ubicación', value: 'Huancayo Centro' },
      { label: 'Alcance', value: '60 nodos · 1 Data Center' },
      { label: 'Año', value: '2024' },
    ],
    imgs: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80',
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80',
      'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&q=80',
    ],
  },
];

/* ── PROJECT MODAL ── */
function openProjectModal(id) {
  const p = PROJECTS.find(x => x.id === id);
  if (!p) return;

  const mainImg = document.getElementById('projectModalMainImg');
  const thumbs  = document.getElementById('projectModalThumbs');

  const safeImgs = p.imgs.filter(isSafeUrl);
  mainImg.style.backgroundImage = safeImgs[0] ? `url('${safeImgs[0]}')` : '';

  thumbs.innerHTML = safeImgs.map((url, i) => `
    <div class="project-modal__thumb${i === 0 ? ' active' : ''}" style="background-image:url('${url}')" data-img="${url}" title="Foto ${i+1}"></div>
  `).join('');

  thumbs.querySelectorAll('.project-modal__thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      mainImg.style.backgroundImage = `url('${thumb.dataset.img}')`;
      thumbs.querySelectorAll('.project-modal__thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });

  document.getElementById('projectModalCat').textContent   = p.cat;
  document.getElementById('projectModalTitle').textContent = p.title;
  document.getElementById('projectModalDesc').textContent  = p.desc;
  document.getElementById('projectModalMeta').innerHTML    = p.meta.map(m => `
    <div class="project-modal__meta-item"><dt>${sanitizeText(m.label)}</dt><dd>${sanitizeText(m.value)}</dd></div>
  `).join('');

  const cta = document.getElementById('projectModalCta');
  if (cta) {
    cta.href = `https://wa.me/51958195467?text=${encodeURIComponent(`Hola, vi el proyecto "${p.title}" en su web y quisiera algo similar para mi negocio.`)}`;
  }

  document.getElementById('projectModalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
  document.getElementById('projectModalOverlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

// Open modal when clicking a project card
document.querySelectorAll('.trabajo-item[data-project]').forEach(item => {
  item.addEventListener('click', () => openProjectModal(parseInt(item.dataset.project)));
});

// Close modal
document.getElementById('projectModalClose')?.addEventListener('click', closeProjectModal);
document.getElementById('projectModalOverlay')?.addEventListener('click', e => {
  if (e.target === e.currentTarget) closeProjectModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeProjectModal();
});

/* =============================================
   TIENDA VIRTUAL — XWIFTY NETWORKS
   Edita los precios en el array PRODUCTS
   ============================================= */

const PRODUCTS = [
  // ── REDES ──────────────────────────────────
  { id:1,  cat:'redes',      brand:'Tenda',    type:'Router',        name:'Router WiFi 6 AX1800 Tenda RX3',       short:'Dual band · 4 antenas · hasta 180 m²',        price:185,  imgs:['https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500&q=80','https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80'], stock:true  },
  { id:2,  cat:'redes',      brand:'MikroTik', type:'Router',        name:'Router MikroTik hAP ax²',               short:'WiFi 6 · 5 puertos Gigabit · RouterOS',        price:395,  imgs:['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80','https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500&q=80'], stock:true  },
  { id:3,  cat:'redes',      brand:'TP-Link',  type:'Access Point',  name:'Access Point WiFi 6 TP-Link EAP670',    short:'AX3000 · PoE · hasta 250 m²',                 price:285,  imgs:['https://images.unsplash.com/photo-1545987796-200677ee1011?w=500&q=80','https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500&q=80'], stock:true  },
  { id:4,  cat:'redes',      brand:'TP-Link',  type:'Switch',        name:'Switch Gigabit 8 puertos TP-Link',      short:'8× RJ45 Gigabit · Plug & Play · QoS',         price:89,   imgs:['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80','https://images.unsplash.com/photo-1545987796-200677ee1011?w=500&q=80'], stock:true  },
  { id:5,  cat:'redes',      brand:'Huawei',   type:'Router',        name:'Router Huawei AX3 Pro WiFi 6+',         short:'WiFi 6+ · 3000Mbps · 4 antenas externas',     price:259,  imgs:['https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=500&q=80','https://images.unsplash.com/photo-1545987796-200677ee1011?w=500&q=80'], stock:true  },
  // ── SEGURIDAD ──────────────────────────────
  { id:6,  cat:'seguridad',  brand:'Dahua',    type:'Cámara IP',     name:'Cámara IP Dome 2MP Full HD Dahua',      short:'1080p · IR 30m · IP67 · interior/exterior',   price:175,  originalPrice:220, imgs:['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&q=80','https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=80'], stock:true  },
  { id:7,  cat:'seguridad',  brand:'HikVision',type:'Cámara IP',     name:'Cámara Bala 4MP HikVision',             short:'4MP Ultra HD · IR 60m · solo exterior',        price:235,  imgs:['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&q=80','https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80'], stock:true  },
  { id:8,  cat:'seguridad',  brand:'Dahua',    type:'Kit CCTV',      name:'Kit 4 Cámaras HD + DVR Dahua',          short:'4 cámaras 2MP · DVR 8ch · cables incluidos',  price:759,  originalPrice:899, imgs:['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&q=80','https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=80','https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80'], stock:true  },
  { id:9,  cat:'seguridad',  brand:'Dahua',    type:'NVR / DVR',     name:'NVR 8 canales IP + HDD 1TB',            short:'NVR 8ch · HDD 1TB · PoE · app móvil',         price:950,  imgs:['https://images.unsplash.com/photo-1557804506-669a67965ba0?w=500&q=80','https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80'], stock:false },
  // ── CÓMPUTO ────────────────────────────────
  { id:10, cat:'computo',    brand:'Lenovo',   type:'Laptop',        name:'Laptop Intel Core i5 12th Gen',         short:'8GB RAM · 512GB SSD · 15.6" FHD · Win 11',    price:1899, originalPrice:2299, imgs:['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80','https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=500&q=80'], stock:true,  badge:'OFERTA' },
  { id:11, cat:'computo',    brand:'HP',       type:'Laptop',        name:'Laptop HP Core i3 8GB/256GB',           short:'8GB DDR4 · 256GB SSD · 14" · Win 11',         price:1299, imgs:['https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=500&q=80','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80'], stock:true  },
  { id:28, cat:'computo',    brand:'Asus',     type:'Laptop',        name:'Laptop Asus VivoBook Intel i5',         short:'8GB DDR4 · 512GB SSD · 15.6" · Win 11 Home', price:1650, imgs:['https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=500&q=80','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80'], stock:true  },
  { id:12, cat:'computo',    brand:'AMD',      type:'PC Escritorio', name:'PC Escritorio AMD Ryzen 5',             short:'16GB DDR4 · 512GB SSD · sin monitor',         price:1490, imgs:['https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=500&q=80','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80'], stock:true  },
  { id:13, cat:'computo',    brand:'LG',       type:'Monitor',       name:'Monitor 24" IPS Full HD 75Hz',          short:'24" · 1080p · IPS · 75Hz · HDMI/VGA',        price:595,  imgs:['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80'], stock:true  },
  { id:14, cat:'computo',    brand:'Samsung',  type:'Monitor',       name:'Monitor 27" IPS QHD 144Hz',             short:'27" · 2K QHD · 144Hz · gaming',              price:950,  imgs:['https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80','https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=500&q=80'], stock:false },
  // ── MULTIMEDIA ─────────────────────────────
  { id:15, cat:'multimedia', brand:'Samsung',  type:'Smart TV',      name:'Smart TV 43" 4K Android TV',           short:'43" · 4K UHD · Android TV · WiFi',           price:1190, originalPrice:1390, imgs:['https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=500&q=80','https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80'], stock:true  },
  { id:16, cat:'multimedia', brand:'LG',       type:'Smart TV',      name:'Smart TV 55" 4K QLED',                 short:'55" · QLED · HDR10+ · Smart TV',             price:2490, imgs:['https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=500&q=80','https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80'], stock:false },
  { id:17, cat:'multimedia', brand:'Xiaomi',   type:'TV Box',        name:'Android TV Box 4K Ultra HD',           short:'4K · Android 11 · WiFi · HDMI',              price:165,  originalPrice:199, imgs:['https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=500&q=80','https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80'], stock:true  },
  { id:18, cat:'multimedia', brand:'Epson',    type:'Proyector',     name:'Proyector HD 3000 lúmenes',            short:'1080p · 3000lm · HDMI/USB · portátil',       price:490,  imgs:['https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&q=80','https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=500&q=80'], stock:true  },
  // ── SUMINISTROS ────────────────────────────
  { id:19, cat:'suministros',brand:'YOFC',     type:'Cable FO',      name:'Cable Fibra Óptica YOFC ADSS 305m',    short:'Monomodo · ADSS aéreo · bobina 305m',        price:280,  imgs:['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=80','https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80'], stock:true  },
  { id:20, cat:'suministros',brand:'Huawei',   type:'ONT / ONU',     name:'ONU/ONT GPON Huawei HG8310M',          short:'GPON · 1× Gigabit · SC/APC',                price:148,  imgs:['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80','https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=80'], stock:true  },
  { id:21, cat:'suministros',brand:'Genérico', type:'Conector FO',   name:'Patch Cord SC/APC – SC/APC 3m',        short:'Monomodo · G.657A · baja pérdida',           price:22,   imgs:['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=80','https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80'], stock:true  },
  { id:22, cat:'suministros',brand:'Genérico', type:'Caja NAP',      name:'Caja NAP 8 puertos SC/APC',            short:'8 puertos · IP65 · apta para exterior',     price:98,   imgs:['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80','https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=80'], stock:true  },
  { id:23, cat:'suministros',brand:'Genérico', type:'Conector FO',   name:'Conectores SC/APC – Pack ×10',         short:'SC/APC monomodo · para fusión en campo',    price:38,   imgs:['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=80','https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80'], stock:true  },
  // ── PERIFÉRICOS ────────────────────────────
  { id:24, cat:'perifericos',brand:'Epson',    type:'Impresora',     name:'Impresora Multifuncional Epson L3250',  short:'WiFi · Copia · Escáner · tinta continua',   price:699,  originalPrice:849, imgs:['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&q=80','https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=80'], stock:true  },
  { id:26, cat:'perifericos',brand:'Canon',    type:'Impresora',     name:'Impresora Canon PIXMA G3160',           short:'WiFi · Tinta continua · Copia · Escáner',   price:549,  imgs:['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&q=80','https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80'], stock:true  },
  { id:27, cat:'perifericos',brand:'HP',       type:'Impresora',     name:'Impresora HP DeskJet 2775 WiFi',        short:'WiFi · Imprime · Copia · Escanea · A4',    price:299,  imgs:['https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500&q=80','https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=80'], stock:true  },
  { id:25, cat:'perifericos',brand:'APC',      type:'UPS',           name:'UPS 700VA APC Back-UPS ES',            short:'700VA · 405W · 6 tomas · USB',              price:299,  imgs:['https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=500&q=80','https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500&q=80'], stock:true  },
];

const CAT_LABELS = { redes:'Redes', seguridad:'Seguridad', computo:'Cómputo', multimedia:'Multimedia', suministros:'Suministros', perifericos:'Periféricos' };

/* ── CART STATE ── */
let cart = (() => {
  try {
    const raw = JSON.parse(sessionStorage.getItem('xwifty_cart')) || [];
    return raw.filter(item =>
      typeof item.id === 'number' &&
      typeof item.qty === 'number' && item.qty > 0 &&
      PRODUCTS.some(p => p.id === item.id)
    ).map(item => {
      const p = PRODUCTS.find(pr => pr.id === item.id);
      return { id: p.id, name: p.name, price: p.price, qty: Math.min(item.qty, 99) };
    });
  } catch(e) { return []; }
})();

function addToCart(productId) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;
  const existing = cart.find(x => x.id === productId);
  if (existing) { existing.qty++; }
  else { cart.push({ id:p.id, name:p.name, price:p.price, qty:1 }); }
  saveCart();
  updateCartUI();
  showToast('✓ Agregado: ' + p.name.split(' ').slice(0,4).join(' '));
  openCart();
}

function removeFromCart(productId) {
  cart = cart.filter(x => x.id !== productId);
  saveCart();
  updateCartUI();
}

function updateQty(productId, delta) {
  const item = cart.find(x => x.id === productId);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart();
  updateCartUI();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
}

function saveCart() {
  try { sessionStorage.setItem('xwifty_cart', JSON.stringify(cart)); } catch(e) {}
}

function formatPrice(n) {
  return 'S/. ' + n.toLocaleString('es-PE', { minimumFractionDigits: 2 });
}

function updateCartUI() {
  const count = cart.reduce((s,i) => s + i.qty, 0);
  const total = cart.reduce((s,i) => s + i.price * i.qty, 0);

  // Count badges
  const countEl = document.getElementById('cartCount');
  if (countEl) {
    countEl.textContent = count;
    countEl.style.display = count > 0 ? 'inline-flex' : 'none';
  }

  // Drawer subtitle
  const subtitleEl = document.getElementById('cartDrawerCount');
  if (subtitleEl) subtitleEl.textContent = count === 0 ? 'vacío' : `${count} producto${count !== 1 ? 's' : ''}`;

  // Total
  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = formatPrice(total);

  // Footer / empty toggle
  const footer = document.getElementById('cartFooter');
  const emptyEl = document.getElementById('cartEmpty');
  const itemsEl = document.getElementById('cartItems');
  if (footer && emptyEl) {
    footer.style.display = cart.length > 0 ? 'flex' : 'none';
    emptyEl.style.display = cart.length === 0 ? 'flex' : 'none';
  }

  // Render items
  if (itemsEl) {
    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item__info">
          <div class="cart-item__name">${item.name}</div>
          <div class="cart-item__unit">${formatPrice(item.price)} c/u</div>
          <div class="cart-item__price">${formatPrice(item.price * item.qty)}</div>
        </div>
        <div class="cart-item__controls">
          <button class="cart-item__qty-btn" onclick="updateQty(${item.id},-1)">−</button>
          <span class="cart-item__qty">${item.qty}</span>
          <button class="cart-item__qty-btn" onclick="updateQty(${item.id},1)">+</button>
          <button class="cart-item__remove" onclick="removeFromCart(${item.id})" aria-label="Eliminar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>`).join('');
  }

  // Delivery progress bar
  const DELIVERY_THRESHOLD = 500;
  const deliveryFill = document.getElementById('cartDeliveryFill');
  const deliveryMsg  = document.getElementById('cartDeliveryMsg');
  const deliveryBar  = document.getElementById('cartDeliveryBar');
  if (deliveryFill && deliveryMsg && deliveryBar) {
    const pct = Math.min(100, (total / DELIVERY_THRESHOLD) * 100);
    deliveryFill.style.width = pct + '%';
    if (total >= DELIVERY_THRESHOLD) {
      deliveryMsg.innerHTML = '🎉 ¡Delivery gratis en Huancayo incluido!';
      deliveryBar.classList.add('cart-delivery-bar--reached');
    } else {
      const rem = (DELIVERY_THRESHOLD - total).toFixed(0);
      deliveryMsg.innerHTML = `Agrega <strong>S/. ${rem}</strong> más para <strong>delivery gratis</strong> en Huancayo`;
      deliveryBar.classList.remove('cart-delivery-bar--reached');
    }
  }

  // WhatsApp link
  const waBtn = document.getElementById('cartWhatsappBtn');
  if (waBtn && cart.length > 0) {
    const lines = cart.map(i => `• ${i.name} × ${i.qty} — ${formatPrice(i.price * i.qty)}`).join('\n');
    const msg = `🛒 *Cotización Xwifty Networks*\n\n${lines}\n\n*Total referencial: ${formatPrice(total)}*\n\nQuisiera más información y confirmar disponibilidad.`;
    waBtn.href = `https://wa.me/51958195467?text=${encodeURIComponent(msg)}`;
  }
}

function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function showToast(msg) {
  const t = document.getElementById('cartToast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 2800);
}

/* ── CART EVENT LISTENERS ── */
document.getElementById('cartBtn')?.addEventListener('click', openCart);
document.getElementById('cartClose')?.addEventListener('click', closeCart);
document.getElementById('cartOverlay')?.addEventListener('click', closeCart);
document.getElementById('cartClear')?.addEventListener('click', clearCart);

/* ── RENDER PRODUCTS ── */
function renderProducts(list) {
  const grid  = document.getElementById('tiendaGrid');
  const empty = document.getElementById('tiendaEmpty');
  const countEl = document.getElementById('tiendaCount');
  if (!grid) return;

  if (countEl) countEl.textContent = `${list.length} producto${list.length !== 1 ? 's' : ''}`;

  if (list.length === 0) {
    grid.innerHTML = '';
    empty?.classList.remove('hidden');
    return;
  }
  empty?.classList.add('hidden');

  grid.innerHTML = list.map(p => {
    const discPct = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
    const safeImg = isSafeUrl(p.imgs[0]) ? p.imgs[0] : '';
    const dotsHtml = p.imgs.length > 1
      ? `<div class="product-card__img-dots">${p.imgs.filter(isSafeUrl).map((u, i) =>
          `<button class="product-card__img-dot${i === 0 ? ' active' : ''}" data-img="${u}" type="button" aria-label="Foto ${i+1}"></button>`
        ).join('')}</div>`
      : '';
    return `
    <div class="product-card reveal" data-cat="${sanitizeText(p.cat)}">
      <div class="product-card__img" style="background-image:url('${safeImg}')">
        ${p.badge ? `<span class="product-card__badge">${sanitizeText(p.badge)}</span>` : (discPct ? `<span class="product-card__badge product-card__badge--disc">${discPct}% OFF</span>` : '')}
        <span class="product-card__stock ${p.stock ? 'product-card__stock--in' : 'product-card__stock--order'}">
          ${p.stock ? '● En stock' : '○ Por pedido'}
        </span>
        ${dotsHtml}
      </div>
      <div class="product-card__body">
        <span class="product-card__cat cat-${sanitizeText(p.cat)}">${sanitizeText(CAT_LABELS[p.cat])}</span>
        <p class="product-card__brand-tag"><strong>${sanitizeText(p.brand)}</strong> · ${sanitizeText(p.type)}</p>
        <h3 class="product-card__name">${sanitizeText(p.name)}</h3>
        <p class="product-card__short">${sanitizeText(p.short)}</p>
        <div class="product-card__price">
          ${p.originalPrice ? `<span class="product-card__price-old">S/. ${p.originalPrice.toLocaleString('es-PE')}</span>` : ''}
          <span class="product-card__price-main">S/. ${p.price.toLocaleString('es-PE')}</span>
          ${!p.originalPrice ? '<span class="product-card__price-note">ref.</span>' : ''}
        </div>
        ${discPct ? `<p class="product-card__savings">Ahorras S/. ${(p.originalPrice - p.price).toLocaleString('es-PE')}</p>` : ''}
        <div class="product-card__actions">
          <button class="btn btn--primary btn--sm" data-add-to-cart="${p.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            Cotizar
          </button>
          <a href="https://wa.me/51958195467?text=${encodeURIComponent(`Hola, quiero información sobre: ${p.name} (S/. ${p.price.toLocaleString('es-PE')})`
          )}" class="btn--wa-outline" target="_blank" rel="noopener" aria-label="Consultar por WhatsApp">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
        </div>
      </div>
    </div>`;
  }).join('');

  grid.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}

/* ── SORT + FILTER STATE ── */
let currentFilter = 'all';
let currentSort   = 'default';
let currentBrand  = 'all';
let currentType   = 'all';
let currentSearch = '';

function applySort(list) {
  const sorted = [...list];
  if (currentSort === 'price-asc')  sorted.sort((a, b) => a.price - b.price);
  if (currentSort === 'price-desc') sorted.sort((a, b) => b.price - a.price);
  if (currentSort === 'name')       sorted.sort((a, b) => a.name.localeCompare(b.name, 'es'));
  return sorted;
}

function getFiltered() {
  let list = PRODUCTS;
  if (currentFilter !== 'all') list = list.filter(p => p.cat === currentFilter);
  if (currentBrand  !== 'all') list = list.filter(p => p.brand === currentBrand);
  if (currentType   !== 'all') list = list.filter(p => p.type === currentType);
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.short.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)
    );
  }
  return applySort(list);
}

function updateDropdowns() {
  const base   = currentFilter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.cat === currentFilter);
  const brands = [...new Set(base.map(p => p.brand))].sort();
  const types  = [...new Set(base.map(p => p.type))].sort();
  const bSel = document.getElementById('brandFilter');
  const tSel = document.getElementById('typeFilter');
  if (bSel) {
    bSel.innerHTML = `<option value="all">Todas las marcas</option>` +
      brands.map(b => `<option value="${b}">${b}</option>`).join('');
    if (!brands.includes(currentBrand)) { currentBrand = 'all'; }
    bSel.value = currentBrand;
  }
  if (tSel) {
    tSel.innerHTML = `<option value="all">Todos los tipos</option>` +
      types.map(t => `<option value="${t}">${t}</option>`).join('');
    if (!types.includes(currentType)) { currentType = 'all'; }
    tSel.value = currentType;
  }
}

/* ── TIENDA TABS ── */
document.querySelectorAll('.tienda-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tienda-tab').forEach(t => t.classList.remove('tienda-tab--active'));
    tab.classList.add('tienda-tab--active');
    currentFilter = tab.dataset.tabCat;
    currentBrand  = 'all';
    currentType   = 'all';
    updateDropdowns();
    renderProducts(getFiltered());
  });
});

/* ── SORT DROPDOWN ── */
const sortEl = document.getElementById('tiendaSort');
if (sortEl) {
  sortEl.addEventListener('change', () => {
    currentSort = sortEl.value;
    renderProducts(getFiltered());
  });
}

/* ── BRAND / TYPE DROPDOWNS ── */
document.getElementById('brandFilter')?.addEventListener('change', e => {
  currentBrand = e.target.value;
  renderProducts(getFiltered());
});
document.getElementById('typeFilter')?.addEventListener('change', e => {
  currentType = e.target.value;
  renderProducts(getFiltered());
});

/* ── SEARCH ── */
const searchInput = document.getElementById('tiendaSearch');
const searchClear = document.getElementById('tiendaSearchClear');
if (searchInput) {
  let searchTimer;
  searchInput.addEventListener('input', () => {
    const val = searchInput.value.trim();
    searchClear?.classList.toggle('visible', val.length > 0);
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      currentSearch = val;
      renderProducts(getFiltered());
    }, 220);
  });
}
if (searchClear) {
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.classList.remove('visible');
    currentSearch = '';
    renderProducts(getFiltered());
    searchInput.focus();
  });
}

/* ── GALLERY DOTS (event delegation) ── */
document.getElementById('tiendaGrid')?.addEventListener('click', e => {
  const dot = e.target.closest('.product-card__img-dot');
  if (!dot) return;
  e.stopPropagation();
  const card  = dot.closest('.product-card');
  const imgEl = card?.querySelector('.product-card__img');
  if (!imgEl) return;
  imgEl.style.backgroundImage = `url('${dot.dataset.img}')`;
  card.querySelectorAll('.product-card__img-dot').forEach(d => d.classList.remove('active'));
  dot.classList.add('active');
});

/* ── SPA VIEW SYSTEM (Nosotros, Servicios, Trabajos, Tienda, Soporte) ── */
const SPA_SECTIONS = ['nosotros', 'servicios', 'trabajos', 'tienda', 'soporte', 'pagos'];

function openSpaView(id) {
  SPA_SECTIONS.forEach(s => document.getElementById(s)?.classList.remove('spa-active'));
  document.getElementById(id)?.classList.add('spa-active');
  document.body.classList.add('spa-mode');
  window.scrollTo({ top: 0, behavior: 'instant' });
  history.pushState({ spaSection: id }, '', `#${id}`);
}

function closeSpaView() {
  SPA_SECTIONS.forEach(s => document.getElementById(s)?.classList.remove('spa-active'));
  document.body.classList.remove('spa-mode');
  window.scrollTo({ top: 0, behavior: 'instant' });
  history.pushState(null, '', location.pathname);
}

// Links to SPA sections open their view (nav, footer, anywhere on the page)
SPA_SECTIONS.forEach(id => {
  document.querySelectorAll(`a[href="#${id}"]`).forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      openSpaView(id);
    });
  });
});

// Other header links close any active SPA view and let the href navigate normally
document.querySelectorAll('.header a').forEach(link => {
  const href = link.getAttribute('href') || '';
  if (!SPA_SECTIONS.some(id => href === `#${id}`)) {
    link.addEventListener('click', () => {
      if (document.body.classList.contains('spa-mode')) {
        SPA_SECTIONS.forEach(s => document.getElementById(s)?.classList.remove('spa-active'));
        document.body.classList.remove('spa-mode');
      }
    });
  }
});

// Back buttons inside every SPA section
document.querySelectorAll('.spa-view-back').forEach(btn => {
  btn.addEventListener('click', closeSpaView);
});

// Browser back / forward support
window.addEventListener('popstate', e => {
  const sec = e.state?.spaSection;
  if (sec && SPA_SECTIONS.includes(sec)) {
    SPA_SECTIONS.forEach(s => document.getElementById(s)?.classList.remove('spa-active'));
    document.getElementById(sec)?.classList.add('spa-active');
    document.body.classList.add('spa-mode');
    window.scrollTo({ top: 0, behavior: 'instant' });
  } else if (document.body.classList.contains('spa-mode')) {
    SPA_SECTIONS.forEach(s => document.getElementById(s)?.classList.remove('spa-active'));
    document.body.classList.remove('spa-mode');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }
});

// Auto-open if page loaded with a SPA section hash
const initHash = window.location.hash.replace('#', '');
if (SPA_SECTIONS.includes(initHash)) {
  openSpaView(initHash);
}

/* ── BENEFICIOS SLIDER ── */
function initBenefSlider() {
  const track = document.getElementById('benefTrack');
  if (!track) return;
  const items = track.querySelectorAll('.benefit-item');
  let current = 0;

  function getVisible() {
    if (window.innerWidth <= 480) return 1;
    if (window.innerWidth <= 768) return 2;
    return 4;
  }

  function move() {
    const visible = getVisible();
    const maxIdx = items.length - visible;
    current = Math.min(current, Math.max(0, maxIdx));
    const w = track.parentElement.offsetWidth;
    const gap = 16;
    const itemW = (w - gap * (visible - 1)) / visible;
    items.forEach(item => { item.style.flex = `0 0 ${itemW}px`; });
    track.style.transform = `translateX(-${current * (itemW + gap)}px)`;
  }

  document.getElementById('benefPrev')?.addEventListener('click', () => {
    current = Math.max(0, current - 1); move();
  });
  document.getElementById('benefNext')?.addEventListener('click', () => {
    const maxIdx = items.length - getVisible();
    current = Math.min(maxIdx, current + 1); move();
  });

  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    const maxIdx = items.length - getVisible();
    if (Math.abs(dx) > 50) { current = dx < 0 ? Math.min(maxIdx, current + 1) : Math.max(0, current - 1); move(); }
  }, { passive: true });

  window.addEventListener('resize', move);
}

/* ── FEATURED SLIDER ── */
function initFeaturedSlider() {
  const slider = document.getElementById('featuredSlider');
  if (!slider) return;
  const slides = slider.querySelectorAll('[data-featured-slide]');
  const dots   = slider.querySelectorAll('[data-featured-dot]');
  const prevBtn = document.getElementById('featuredPrev');
  const nextBtn = document.getElementById('featuredNext');
  const progressBar = document.getElementById('featuredProgress');
  const DURATION = 10000;
  let current = 0, timer;

  function goTo(idx) {
    slides[current].classList.remove('tienda__featured--active');
    dots[current].classList.remove('tienda__featured-dot--active');
    current = ((idx % slides.length) + slides.length) % slides.length;
    slides[current].classList.add('tienda__featured--active');
    dots[current].classList.add('tienda__featured-dot--active');
    startProgress();
  }
  function startProgress() {
    if (!progressBar) return;
    progressBar.style.transition = 'none';
    progressBar.style.width = '0%';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      progressBar.style.transition = `width ${DURATION}ms linear`;
      progressBar.style.width = '100%';
    }));
  }
  function startAuto() { clearInterval(timer); timer = setInterval(() => goTo(current + 1), DURATION); startProgress(); }
  function stopAuto()  { clearInterval(timer); if (progressBar) { progressBar.style.transition = 'none'; } }

  dots.forEach((dot, i) => dot.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); }));
  prevBtn?.addEventListener('click', () => { stopAuto(); goTo(current - 1); startAuto(); });
  nextBtn?.addEventListener('click', () => { stopAuto(); goTo(current + 1); startAuto(); });

  let touchX = 0;
  slider.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  slider.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) { stopAuto(); goTo(current + (dx < 0 ? 1 : -1)); startAuto(); }
  }, { passive: true });
  slider.addEventListener('mouseenter', stopAuto);
  slider.addEventListener('mouseleave', startAuto);

  startAuto();
}

/* ── LIGHTBOX ── */
function initLightbox() {
  const lb      = document.getElementById('lightbox');
  const lbImg   = document.getElementById('lightboxImg');
  const lbClose = document.getElementById('lightboxClose');
  const lbPrev  = document.getElementById('lightboxPrev');
  const lbNext  = document.getElementById('lightboxNext');
  const lbCount = document.getElementById('lightboxCounter');

  let imgs = [], cur = 0;

  function open(list, index) {
    imgs = list; cur = index;
    show();
    lb.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('active');
    document.body.style.overflow = '';
  }

  function show() {
    lbImg.classList.add('fading');
    setTimeout(() => {
      lbImg.src = imgs[cur];
      lbImg.classList.remove('fading');
    }, 200);
    lbCount.textContent = (cur + 1) + ' / ' + imgs.length;
    lbPrev.hidden = imgs.length <= 1;
    lbNext.hidden = imgs.length <= 1;
  }

  function prev() { cur = (cur - 1 + imgs.length) % imgs.length; show(); }
  function next() { cur = (cur + 1) % imgs.length; show(); }

  document.querySelectorAll('.svc').forEach(card => {
    const heroImg     = card.querySelector('.svc__hero-img');
    const galleryImgs = Array.from(card.querySelectorAll('.svc__gallery-img'));
    const allImgs     = [heroImg, ...galleryImgs].filter(Boolean).map(i => i.src);

    if (heroImg) heroImg.addEventListener('click', () => open(allImgs, 0));
    galleryImgs.forEach((img, i) => img.addEventListener('click', () => open(allImgs, i + 1)));
  });

  lbClose.addEventListener('click', close);
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  lbPrev.addEventListener('click', e => { e.stopPropagation(); prev(); });
  lbNext.addEventListener('click', e => { e.stopPropagation(); next(); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('active')) return;
    if (e.key === 'Escape')     close();
    if (e.key === 'ArrowLeft')  prev();
    if (e.key === 'ArrowRight') next();
  });
}

/* ── PLANES SLIDER (móvil) ── */
function initPlanesSlider() {
  const tracks = ['hogar','duo','empresa'];

  tracks.forEach(id => {
    const track = document.getElementById(`planes-track-${id}`);
    const dotsWrap = document.getElementById(`planes-dots-${id}`);
    if (!track || !dotsWrap) return;

    const cards = track.querySelectorAll('.plan-card');
    const dots  = dotsWrap.querySelectorAll('.planes-dot');
    const total = cards.length;
    let cur = 0;

    function isMobile() { return window.innerWidth <= 768; }

    function goTo(idx) {
      if (!isMobile()) return;
      cur = (idx + total) % total;
      track.style.transform = `translateX(-${cur * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('planes-dot--active', i === cur));
    }

    function reset() {
      cur = 0;
      track.style.transform = 'translateX(0)';
      dots.forEach((d, i) => d.classList.toggle('planes-dot--active', i === 0));
    }

    // Flechas via data attributes
    document.querySelectorAll(`.planes-arrow[data-track="planes-track-${id}"]`).forEach(btn => {
      btn.addEventListener('click', () => {
        if (!isMobile()) return;
        const isPrev = btn.classList.contains('planes-arrow--prev');
        goTo(isPrev ? cur - 1 : cur + 1);
      });
    });

    dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

    let tx = 0;
    track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      if (!isMobile()) return;
      const dx = e.changedTouches[0].clientX - tx;
      if (Math.abs(dx) > 40) goTo(dx < 0 ? cur + 1 : cur - 1);
    }, { passive: true });

    window.addEventListener('resize', () => { if (!isMobile()) reset(); });
  });
}

/* ── TESTIMONIOS SLIDER ── */
function initTestimoniosSlider() {
  const track = document.getElementById('testTrack');
  if (!track) return;
  const cards = track.querySelectorAll('.testimonio-card');
  const dots  = document.querySelectorAll('.test-dot');
  const total = cards.length;
  let cur = 0, timer;

  function goTo(idx) {
    cur = (idx + total) % total;
    track.style.transform = `translateX(-${cur * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('test-dot--active', i === cur));
  }

  function startAuto() { timer = setInterval(() => goTo(cur + 1), 5000); }
  function stopAuto()  { clearInterval(timer); }

  document.getElementById('testPrev')?.addEventListener('click', () => { stopAuto(); goTo(cur - 1); startAuto(); });
  document.getElementById('testNext')?.addEventListener('click', () => { stopAuto(); goTo(cur + 1); startAuto(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { stopAuto(); goTo(i); startAuto(); }));

  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; stopAuto(); }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - tx;
    if (Math.abs(dx) > 40) goTo(dx < 0 ? cur + 1 : cur - 1);
    startAuto();
  }, { passive: true });

  track.parentElement.addEventListener('mouseenter', stopAuto);
  track.parentElement.addEventListener('mouseleave', startAuto);

  startAuto();
}

/* ── INIT ── */
updateDropdowns();
renderProducts(PRODUCTS);
updateCartUI();
initFeaturedSlider();
initBenefSlider();
initLightbox();
initTestimoniosSlider();
initPlanesSlider();

// ===== EVENT DELEGATION PARA data-add-to-cart =====
document.addEventListener('click', e => {
  const btn = e.target.closest('[data-add-to-cart]');
  if (btn) {
    const id = parseInt(btn.dataset.addToCart, 10);
    if (!isNaN(id)) addToCart(id);
  }
});
