/* ============================================================
   TIFFANY WEBB — PRO-LEVEL INTERACTIVE ENGINE (USA TRENDS 2026)
   Custom Interactive Cursor · Magnetic Buttons · Video Modal
   Scrollytelling Engine · Scroll Progress · Glass Navbar
   Location: Landing Page Work/coding by antigravity/main.js
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // Add observer class to document element to activate smooth reveals
  document.documentElement.classList.add('js-observer');

  // 1. Scroll Progress Bar
  let progressBar = document.getElementById('scroll-progress');
  if (!progressBar) {
    progressBar = document.createElement('div');
    progressBar.id = 'scroll-progress';
    document.body.appendChild(progressBar);
  }

  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const progress = (window.scrollY / totalHeight) * 100;
      progressBar.style.width = `${progress}%`;
    }
  }, { passive: true });

  // 2. Custom Interactive Cursor
  if (window.matchMedia('(pointer: fine)').matches) {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor';
    const follower = document.createElement('div');
    follower.className = 'cursor-follower';

    document.body.appendChild(cursor);
    document.body.appendChild(follower);

    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
    }, { passive: true });

    function renderCursor() {
      followerX += (mouseX - followerX) * 0.15;
      followerY += (mouseY - followerY) * 0.15;
      follower.style.left = `${followerX}px`;
      follower.style.top = `${followerY}px`;
      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Hover detection
    const interactiveElements = document.querySelectorAll('a, button, .glass-card, .glass-card-dark, .topic-track-card, .reel-container');
    interactiveElements.forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // 3. Pro-Level Magnetic Button Effect
  const magneticButtons = document.querySelectorAll('.btn');
  magneticButtons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px) scale(1.02)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0px, 0px) scale(1)';
    });
  });

  // 4. Mobile Menu Handling
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

  // 5. Active Nav Link Highlighting
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // 6. Scroll Reveal Engine
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

  // Safety Fallback: Ensure all elements are revealed after 500ms
  setTimeout(() => {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('revealed'));
  }, 500);

  // 7. Animated Number Counter
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

  // 8. Reel Video Modal Logic
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
});
