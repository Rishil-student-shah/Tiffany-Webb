/* ============================================================
   TIFFANY WEBB — MAIN JAVASCRIPT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================================
  // NAVBAR SCROLL BEHAVIOR
  // ============================================================
  const navbar = document.querySelector('.navbar');

  if (navbar) {
    const handleScroll = () => {
      if (window.scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // run on load
  }

  // ============================================================
  // MOBILE MENU
  // ============================================================
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-close');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (mobileClose) {
    mobileClose.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // Close mobile menu when clicking a link
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu) mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ============================================================
  // SCROLL REVEAL ANIMATIONS
  // ============================================================
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (revealEls.length) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach(el => revealObserver.observe(el));
  }

  // ============================================================
  // ANIMATED COUNTERS
  // ============================================================
  const counters = document.querySelectorAll('[data-counter]');

  if (counters.length) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
  }

  function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-counter'));
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';
    const duration = 2000;
    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutExpo(progress);
      const value = Math.round(eased * target);
      el.textContent = prefix + value.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = prefix + target.toLocaleString() + suffix;
      }
    };

    requestAnimationFrame(tick);
  }

  function easeOutExpo(t) {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }

  // ============================================================
  // NEWSLETTER FORM
  // ============================================================
  const newsletterForms = document.querySelectorAll('.newsletter-form-el');

  newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('.newsletter-input');
      const btn = form.querySelector('.newsletter-submit');

      if (input && input.value.includes('@')) {
        btn.textContent = '✓ Subscribed!';
        btn.style.background = '#0E6B54';
        input.value = '';
        setTimeout(() => {
          btn.textContent = 'Join';
          btn.style.background = '';
        }, 3000);
      }
    });
  });

  // ============================================================
  // BOOKING FORM
  // ============================================================
  const bookingForm = document.querySelector('#booking-form');

  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = bookingForm.querySelector('[type="submit"]');
      btn.textContent = '✓ Request Submitted!';
      btn.style.background = '#0E6B54';
      btn.disabled = true;

      setTimeout(() => {
        btn.textContent = 'Submit Speaking Request';
        btn.style.background = '';
        btn.disabled = false;
        bookingForm.reset();
      }, 5000);
    });
  }

  // ============================================================
  // EXPERTISE CARD STAGGER
  // ============================================================
  const expertiseCards = document.querySelectorAll('.expertise-card');
  expertiseCards.forEach((card, i) => {
    card.style.transitionDelay = (i * 80) + 'ms';
  });

  // ============================================================
  // ACTIVE NAV LINK HIGHLIGHTING
  // ============================================================
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.style.color = 'var(--emerald)';
    }
  });

  // ============================================================
  // SMOOTH HOVER: HERO PARALLAX (subtle)
  // ============================================================
  const heroBg = document.querySelector('.hero-bg img');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      heroBg.style.transform = `translateY(${scrolled * 0.25}px)`;
    }, { passive: true });
  }

});
