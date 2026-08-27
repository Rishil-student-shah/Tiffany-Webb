/* ============================================================
   TIFFANY WEBB — PRO-LEVEL INTERACTIVE ENGINE (USA TRENDS 2026)
   Steven Kotler Intro Curtain · Secfi Video Modal · Cursor Lerp
   Dr Shemeka Scrollytelling · Magnetic Buttons · Glass Navbar
   Location: Landing Page Work/coding by antigravity/main.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Respect prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Add observer class to document element to activate smooth reveals
  if (!prefersReducedMotion) {
    document.documentElement.classList.add('js-observer');
  }

  // Instantly reveal body so the preloader is visible!
  requestAnimationFrame(() => document.body.classList.add('page-loaded'));


  // 2. Scroll Progress Bar
  let progressBar = document.getElementById('scroll-progress');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    document.body.appendChild(progressBar);
  }

  // 3. Navbar Scroll Shrink & Deep Blur (Dynamic Island)
  const navbar = document.getElementById('navbar');
  let lastScrollY = window.scrollY;

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // Scroll progress width
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0 && progressBar) {
      const progress = (scrollY / totalHeight) * 100;
      progressBar.style.width = `${progress}%`;
    }

    // Update navbar on scroll
    if (navbar) {
      if (scrollY > 60) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
    
    lastScrollY = scrollY;
  }, { passive: true });

  // 4. Premium Sliding Navigation Highlight
  const navLinksContainer = document.querySelector('.nav-links-container');
  const navHighlight = document.querySelector('.nav-highlight');
  const navLinks = document.querySelectorAll('.nav-link');
  
  if (navLinksContainer && navHighlight && navLinks.length > 0) {
    // Set initial position based on active link
    const activeLink = document.querySelector('.nav-link.active');
    if (activeLink) {
      navHighlight.style.width = `${activeLink.offsetWidth}px`;
      navHighlight.style.transform = `translateX(${activeLink.offsetLeft}px)`;
    }

    navLinks.forEach(link => {
      link.addEventListener('mouseenter', (e) => {
        navHighlight.style.opacity = '1';
        navHighlight.style.width = `${e.target.offsetWidth}px`;
        navHighlight.style.transform = `translateX(${e.target.offsetLeft}px)`;
      });
    });

    navLinksContainer.addEventListener('mouseleave', () => {
      navHighlight.style.opacity = '0';
      // Reset to active link position in background
      if (activeLink) {
        setTimeout(() => {
          navHighlight.style.width = `${activeLink.offsetWidth}px`;
          navHighlight.style.transform = `translateX(${activeLink.offsetLeft}px)`;
        }, 300); // Wait for fade out
      }
    });
  }
    // 4b. EDITORIAL LIVING PORTRAIT - ENTRANCE ANIMATION
    function initEditorialHero() {
      // Hide old overlays just in case
      const introOverlay = document.getElementById('intro-overlay');
      if (introOverlay) introOverlay.style.display = 'none';
      document.body.classList.remove('no-scroll');

      if (prefersReducedMotion) return;

      const headline = document.querySelector('.hero-headline');
      const eyebrow = document.querySelector('.hero-eyebrow');
      const positioning = document.querySelector('.hero-positioning');
      const desc = document.querySelector('.hero-desc');
      const imgFrame = document.querySelector('.hero-image-frame');
      const ctas = document.querySelectorAll('.hero-ctas .btn');

      const heroTl = gsap.timeline();

      // 0.00–0.55s Image Frame Reveals
      if (imgFrame) {
        heroTl.fromTo(imgFrame, 
          { clipPath: 'inset(0 18% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 0.55, ease: 'power3.out' },
          0
        );
      }

      // 0.20–0.75s Eyebrow reveals
      if (eyebrow) {
        heroTl.fromTo(eyebrow, 
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 0.55, ease: 'power2.out' },
          0.20
        );
      }

      // 0.35–1.05s Headline reveals upward
      if (headline) {
        heroTl.fromTo(headline, 
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.70, ease: 'power3.out' },
          0.35
        );
      }

      // 0.65–1.20s Positioning reveals
      if (positioning) {
        heroTl.fromTo(positioning, 
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 0.55, ease: 'power2.out' },
          0.65
        );
      }

      // 0.85–1.40s Description reveals
      if (desc) {
        heroTl.fromTo(desc, 
          { clipPath: 'inset(0 100% 0 0)' },
          { clipPath: 'inset(0 0% 0 0)', duration: 0.55, ease: 'power2.out' },
          0.85
        );
      }

      // 1.05–1.65s CTA group reveals
      if (ctas.length) {
        heroTl.fromTo(ctas, 
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.60, ease: 'power3.out', stagger: 0.1 },
          1.05
        );
      }
    }
    initEditorialHero();

    // 4c. EDITORIAL HERO SCROLL CHOREOGRAPHY
    function initEditorialHeroScroll() {
      if (prefersReducedMotion || window.innerWidth < 900) return;
      
      const hero = document.getElementById('hero');
      const imgMain = document.querySelector('.hero-image-main');
      const textBlock = document.querySelector('.hero-content');

      if (!hero) return;

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: hero,
          start: 'top top',
          end: 'bottom top',
          scrub: 1
        }
      });

      // Subtle Image Depth
      if (imgMain) {
        scrollTl.to(imgMain, { scale: 1.04, xPercent: -2, ease: 'none' }, 0);
      }

      // Subtle Text Depth
      if (textBlock) {
        scrollTl.to(textBlock, { y: -20, opacity: 0.92, ease: 'none' }, 0);
      }
    }
    setTimeout(initEditorialHeroScroll, 500); // init after layout settles

  // 6. Mobile Menu Drawer
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const mobileClose = document.querySelector('.mobile-close');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  if (mobileClose && mobileMenu) {
    mobileClose.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu) mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // 7. Active Nav Link Highlighting
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // 8. Scroll Reveal Engine (Dr Shemeka / GSAP style triggers)
  const revealElements = document.querySelectorAll('[data-reveal]');
  if (revealElements.length && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
      rootMargin: '0px 0px -20px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // Safety Fallback: Reveal all elements guaranteed after 500ms
  setTimeout(() => {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('revealed'));
  }, 500);

  // 9. Animated Number Counter
  const counters = document.querySelectorAll('[data-counter]');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    counters.forEach(counter => counterObserver.observe(counter));
  }

  function runCounter(counterEl) {
    const target = parseInt(counterEl.getAttribute('data-counter'), 10);
    const suffix = counterEl.getAttribute('data-suffix') || '';
    if (isNaN(target)) return;

    let current = 0;
    const duration = 2000;
    const stepTime = 30;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        counterEl.textContent = target + suffix;
        clearInterval(timer);
      } else {
        counterEl.textContent = Math.floor(current) + suffix;
      }
    }, stepTime);
  }

  // 10. Secfi Video Modal Logic
  const reelContainers = document.querySelectorAll('.reel-container');
  const reelModal = document.querySelector('.reel-modal');
  const reelClose = document.querySelector('.reel-modal-close');

  if (reelContainers.length && reelModal) {
    reelContainers.forEach(container => {
      container.addEventListener('click', () => {
        reelModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    });
  }

  if (reelClose && reelModal) {
    reelClose.addEventListener('click', () => {
      reelModal.classList.remove('active');
      document.body.style.overflow = '';
    });
    reelModal.addEventListener('click', (e) => {
      if (e.target === reelModal) {
        reelModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // 11. Hero Background Parallax on Scroll
  const heroBgImg = document.querySelector('.hero-bg-img');
  if (heroBgImg) {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      // Move background at 30% of scroll speed for subtle depth
      heroBgImg.style.transform = `scale(1.04) translateY(${scrollY * 0.18}px)`;
    }, { passive: true });
  }

  // 12. 3D Glass Card Tilt on Mouse Move (Sevora-level interaction)
  const glassCards = document.querySelectorAll('.glass-card');
  glassCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      card.style.transform = `translateY(-6px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s var(--ease-expo), box-shadow 0.5s var(--ease-expo), border-color 0.4s';
    });
  });

  // 13. Booking Form Success Toast
  const bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const toast = document.createElement('div');
      toast.style.cssText = `
        position: fixed; bottom: 2rem; right: 2rem; z-index: 100000;
        background: var(--emerald); color: var(--ivory);
        padding: 1.2rem 2rem; border-radius: 999px;
        font-family: var(--font-mono); font-size: 0.85rem;
        letter-spacing: 0.08em; font-weight: 700;
        box-shadow: 0 12px 40px rgba(14, 107, 84, 0.45);
        transform: translateY(100px); opacity: 0;
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      `;
      toast.textContent = '✓ Thank you! We will be in touch within 48 hours.';
      document.body.appendChild(toast);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          toast.style.transform = 'translateY(0)';
          toast.style.opacity = '1';
        });
      });
      setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
      }, 4000);
      bookingForm.reset();
    });
  }

  // 14. Newsletter Form Handling
  const newsletterForms = document.querySelectorAll('.newsletter-form-el');
  newsletterForms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = form.querySelector('.newsletter-submit');
      if (btn) {
        btn.textContent = '✓ You\'re in!';
        btn.style.background = 'var(--emerald)';
        setTimeout(() => { btn.textContent = 'Join the community'; btn.style.background = ''; }, 3000);
      }
      form.reset();
    });
  });

  // 15. Accordion Toggle (Speaking Tracks)
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      header.closest('.accordion-track').classList.toggle('open');
    });
  });

  // 16. Copy-to-Clipboard (Media Page Bios)
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-copy');
      const el = document.getElementById(targetId);
      if (el) {
        navigator.clipboard.writeText(el.textContent.trim()).then(() => {
          const original = btn.textContent;
          btn.textContent = '✓ Copied';
          setTimeout(() => { btn.textContent = original; }, 2000);
        });
      }
    });
  });

  // 17. Booking Form — honeypot + time-trap
  const bookingFormEl = document.getElementById('booking-form');
  if (bookingFormEl) {
    const formLoadTime = Date.now();
    bookingFormEl.addEventListener('submit', (e) => {
      e.preventDefault();
      // Honeypot check
      const hp = bookingFormEl.querySelector('.form-hp input');
      if (hp && hp.value) return; // bot detected
      // Time-trap: reject submissions under 3 seconds
      if (Date.now() - formLoadTime < 3000) return;
      // Show success toast
      const toast = document.createElement('div');
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      toast.style.cssText = `
        position: fixed; bottom: 2rem; right: 2rem; z-index: 100000;
        background: var(--emerald); color: var(--ivory);
        padding: 1.2rem 2rem; border-radius: 999px;
        font-family: var(--font-mono); font-size: 0.85rem;
        letter-spacing: 0.08em; font-weight: 700;
        box-shadow: 0 12px 40px rgba(14, 107, 84, 0.45);
        transform: translateY(100px); opacity: 0;
        transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      `;
      toast.textContent = '✓ Thank you — Tiffany will respond within two business days.';
      document.body.appendChild(toast);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          toast.style.transform = 'translateY(0)';
          toast.style.opacity = '1';
        });
      });
      setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
      }, 5000);
      bookingFormEl.reset();
    });
  }

});
