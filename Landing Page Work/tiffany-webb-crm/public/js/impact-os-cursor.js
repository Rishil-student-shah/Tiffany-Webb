/**
 * Tiffany Webb Impact OS™ — Option C: Solid Luxury Magnetic Pill Cursor
 * Smooth velocity stretching & magnetic element absorption.
 */
(function initLuxuryPillCursor() {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  function mountCursor() {
    // Remove old cursor elements if present
    const oldReticle = document.getElementById('impactOsReticle');
    const oldRing = document.getElementById('impactOsRing');
    if (oldReticle) oldReticle.remove();
    if (oldRing) oldRing.remove();

    if (document.getElementById('impactOsPillCursor')) return;

    // Create Luxury Pill Element
    const pill = document.createElement('div');
    pill.id = 'impactOsPillCursor';
    pill.className = 'impact-os-pill-cursor';

    // Create Inner Precision Gold Dot
    const dot = document.createElement('div');
    dot.className = 'impact-os-pill-dot';
    pill.appendChild(dot);

    document.body.appendChild(pill);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let pillX = mouseX;
    let pillY = mouseY;
    let prevX = mouseX;
    let prevY = mouseY;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animate() {
      // Calculate velocity for natural capsule stretching
      const vx = mouseX - prevX;
      const vy = mouseY - prevY;
      const speed = Math.min(Math.sqrt(vx * vx + vy * vy) * 0.15, 0.6);
      const angle = Math.atan2(vy, vx) * (180 / Math.PI);

      pillX += (mouseX - pillX) * 0.22;
      pillY += (mouseY - pillY) * 0.22;
      prevX = mouseX;
      prevY = mouseY;

      if (!pill.classList.contains('pill-hover-active')) {
        pill.style.transform = `translate3d(${pillX}px, ${pillY}px, 0) rotate(${angle}deg) scale(${1 + speed}, ${1 - speed * 0.4})`;
      } else {
        pill.style.transform = `translate3d(${pillX}px, ${pillY}px, 0) scale(1)`;
      }

      requestAnimationFrame(animate);
    }
    animate();

    // Magnetic Absorption on Interactive Targets
    const targets = 'button, a, input, select, textarea, .ledger-row, .status-tab-btn, .action-icon-btn, .stat-card, .cms-nav-item, .nav-link, [onclick]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(targets)) {
        pill.classList.add('pill-hover-active');
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(targets)) {
        pill.classList.remove('pill-hover-active');
      }
    });

    document.addEventListener('mousedown', () => pill.classList.add('pill-click'));
    document.addEventListener('mouseup', () => pill.classList.remove('pill-click'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountCursor);
  } else {
    mountCursor();
  }
})();
