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
