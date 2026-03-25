// ─── Footer year ──────────────────────────────────────────────
document.getElementById('year').textContent = new Date().getFullYear();

// ─── Navbar scroll effect ──────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ─── Hamburger / mobile nav ────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => navLinks.classList.remove('open'));
});

// ─── Scroll-reveal (IntersectionObserver) ─────────────────────
const revealEls = document.querySelectorAll('.fade-up');
const observer  = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      observer.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => observer.observe(el));

// ─── Contact form ──────────────────────────────────────────────
const form        = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const naam    = form.naam.value.trim();
  const email   = form.email.value.trim();
  const bericht = form.bericht.value.trim();

  // Simple validation — highlight empty required fields
  let valid = true;
  [{ field: form.naam, value: naam },
   { field: form.email, value: email },
   { field: form.bericht, value: bericht }
  ].forEach(({ field, value }) => {
    if (!value) {
      field.style.borderColor = '#ef4444';
      field.addEventListener('input', () => field.style.borderColor = '', { once: true });
      valid = false;
    }
  });

  if (!valid) return;

  // Simulate successful send
  form.style.display = 'none';
  formSuccess.style.display = 'block';
});

// ─── Active nav link highlight on scroll ──────────────────────
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const id = e.target.getAttribute('id');
      navItems.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${id}`
          ? 'var(--orange)'
          : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => sectionObserver.observe(s));

// ─── Portfolio Carousel ────────────────────────────────────────
(function () {
  const track      = document.getElementById('carouselTrack');
  const prevBtn    = document.getElementById('carouselPrev');
  const nextBtn    = document.getElementById('carouselNext');
  const dotsWrap   = document.getElementById('carouselDots');
  if (!track) return;

  const slides     = Array.from(track.querySelectorAll('.carousel-slide'));
  let   current    = 0;
  let   autoTimer  = null;
  const AUTO_DELAY = 4500;

  // How many slides visible at once (mirrors CSS --slides-visible)
  function slidesVisible() {
    const w = window.innerWidth;
    if (w <= 560) return 1;
    if (w <= 900) return 2;
    return 3;
  }

  function maxIndex() {
    return Math.max(0, slides.length - slidesVisible());
  }

  // Build dot buttons
  function buildDots() {
    dotsWrap.innerHTML = '';
    const count = maxIndex() + 1;
    for (let i = 0; i < count; i++) {
      const btn = document.createElement('button');
      btn.className = 'carousel-dot' + (i === current ? ' active' : '');
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-label', `Dia ${i + 1}`);
      btn.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(btn);
    }
  }

  function updateDots() {
    dotsWrap.querySelectorAll('.carousel-dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function goTo(index) {
    current = Math.min(Math.max(index, 0), maxIndex());

    // Calculate how wide one slide+gap unit is
    const slide    = slides[0];
    const style    = getComputedStyle(track);
    const gap      = parseFloat(style.gap) || 24;
    const padLeft  = parseFloat(style.paddingLeft) || 24;
    const offset   = current * (slide.offsetWidth + gap);

    track.style.transform = `translateX(-${offset}px)`;

    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= maxIndex();
    updateDots();
  }

  prevBtn.addEventListener('click', () => { resetAuto(); goTo(current - 1); });
  nextBtn.addEventListener('click', () => { resetAuto(); goTo(current + 1); });

  function startAuto() {
    autoTimer = setInterval(() => {
      goTo(current >= maxIndex() ? 0 : current + 1);
    }, AUTO_DELAY);
  }
  function resetAuto() {
    clearInterval(autoTimer);
    startAuto();
  }

  // Touch / swipe support
  let touchStartX = 0;
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      resetAuto();
      goTo(diff > 0 ? current + 1 : current - 1);
    }
  }, { passive: true });

  // Rebuild on resize (slide count changes)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      current = Math.min(current, maxIndex());
      buildDots();
      goTo(current);
    }, 200);
  }, { passive: true });

  // Init
  buildDots();
  goTo(0);
  startAuto();

  // Pause auto on hover
  const carouselEl = document.getElementById('carousel');
  carouselEl.addEventListener('mouseenter', () => clearInterval(autoTimer));
  carouselEl.addEventListener('mouseleave', startAuto);
})();

// ─── Lightbox ──────────────────────────────────────────────────
(function () {
  const lightbox    = document.getElementById('lightbox');
  const lbImg       = document.getElementById('lightboxImg');
  const lbCaption   = document.getElementById('lightboxCaption');
  const lbClose     = document.getElementById('lightboxClose');
  const lbPrev      = document.getElementById('lightboxPrev');
  const lbNext      = document.getElementById('lightboxNext');
  if (!lightbox) return;

  // Gather all carousel images
  const imgs = Array.from(
    document.querySelectorAll('.carousel-slide .carousel-img-wrap img')
  );
  let lbCurrent = 0;

  function openLightbox(index) {
    lbCurrent = index;
    const img = imgs[index];
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCaption.textContent = img.alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lbPrev.disabled = index === 0;
    lbNext.disabled = index === imgs.length - 1;
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  }

  function lbGoTo(index) {
    if (index < 0 || index >= imgs.length) return;
    lbImg.style.opacity = '0';
    setTimeout(() => {
      openLightbox(index);
      lbImg.style.opacity = '1';
    }, 200);
  }

  // Open on image click
  imgs.forEach((img, i) => {
    img.closest('.carousel-img-wrap').addEventListener('click', () => openLightbox(i));
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click',  () => lbGoTo(lbCurrent - 1));
  lbNext.addEventListener('click',  () => lbGoTo(lbCurrent + 1));

  // Close on backdrop click
  lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   lbGoTo(lbCurrent - 1);
    if (e.key === 'ArrowRight')  lbGoTo(lbCurrent + 1);
  });
})();
