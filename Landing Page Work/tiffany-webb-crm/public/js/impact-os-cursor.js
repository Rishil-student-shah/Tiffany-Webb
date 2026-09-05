/**
 * Tiffany Webb Impact OS™ — Bespoke Executive Reticle Cursor
 * Auto-mounts on DOM ready. Gracefully disables on touch devices.
 */
(function initImpactOsCursor() {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  function mountCursor() {
    if (document.getElementById('impactOsReticle')) return;

    // Create Reticle (Inner Precision Diamond)
    const reticle = document.createElement('div');
    reticle.id = 'impactOsReticle';
    reticle.className = 'impact-os-reticle';

    // Create Ring (Outer Executive Spring Frame)
    const ring = document.createElement('div');
    ring.id = 'impactOsRing';
    ring.className = 'impact-os-ring';

    document.body.appendChild(reticle);
    document.body.appendChild(ring);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let isHovered = false;
    let isClicked = false;

    function updateReticle() {
      const rot = isHovered ? 90 : 45;
      const sc = isHovered ? 1.4 : 1;
      reticle.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%) rotate(${rot}deg) scale(${sc})`;
    }

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      updateReticle();
    });

    function animate() {
      ringX += (mouseX - ringX) * 0.2;
      ringY += (mouseY - ringY) * 0.2;
      const ringScale = isClicked ? 0.85 : 1;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${ringScale})`;
      requestAnimationFrame(animate);
    }
    animate();

    // Hover Magnification over Actionable Targets
    const targets = 'button, a, input, select, textarea, .ledger-row, .status-tab-btn, .action-icon-btn, .stat-card, .cms-nav-item, [onclick]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(targets)) {
        isHovered = true;
        ring.classList.add('cursor-hover-active');
        reticle.classList.add('reticle-hover-active');
        updateReticle();
      }
    });

    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(targets)) {
        isHovered = false;
        ring.classList.remove('cursor-hover-active');
        reticle.classList.remove('reticle-hover-active');
        updateReticle();
      }
    });

    document.addEventListener('mousedown', () => {
      isClicked = true;
      ring.classList.add('cursor-click');
    });

    document.addEventListener('mouseup', () => {
      isClicked = false;
      ring.classList.remove('cursor-click');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountCursor);
  } else {
    mountCursor();
  }
})();

