/**
 * Tiffany Webb - Interactive JavaScript Engine
 * Reliable, fast, smooth reveal animations & micro-interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. PAGE LOADER ---
    const loader = document.getElementById('pageLoader');
    if (loader) {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 600);
        }, 500); // Quick load transition
    }

    // --- 2. CUSTOM CURSOR ---
    const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const cursor = id('customCursor');
    if (cursor && !isTouchDevice()) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let cursorX = mouseX, cursorY = mouseY;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const updateCursor = () => {
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
            requestAnimationFrame(updateCursor);
        };
        updateCursor();

        document.querySelectorAll('a, button, input, select, textarea').forEach(el => {
            el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
            el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
        });
    }

    // --- 3. SCROLL PROGRESS BAR ---
    const progressBar = id('scroll-progress');
    window.addEventListener('scroll', () => {
        if (progressBar) {
            const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
            const progress = totalScroll > 0 ? (window.scrollY / totalScroll) * 100 : 0;
            progressBar.style.width = `${progress}%`;
        }
    }, { passive: true });

    // --- 4. MOBILE MENU & HAMBURGER ---
    const hamburger = id('hamburger');
    const mobileMenu = id('mobileMenu');
    const mobileClose = id('mobileClose');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => mobileMenu.classList.add('active'));
    }
    if (mobileClose && mobileMenu) {
        mobileClose.addEventListener('click', () => mobileMenu.classList.remove('active'));
    }

    // --- 5. INTERSECTION OBSERVER REVEALS ---
    const revealElements = document.querySelectorAll('[data-reveal]');
    
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.05,
            rootMargin: '0px 0px 50px 0px'
        };

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const delay = el.getAttribute('data-delay');
                    if (delay) {
                        const ms = parseFloat(delay) < 10 ? parseFloat(delay) * 1000 : parseFloat(delay);
                        el.style.transitionDelay = `${ms}ms`;
                    }
                    el.classList.add('revealed');

                    if (el.hasAttribute('data-counter')) {
                        animateCounter(el);
                    }
                    observer.unobserve(el);
                }
            });
        }, observerOptions);

        revealElements.forEach(el => revealObserver.observe(el));
    } else {
        // Fallback for older browsers
        revealElements.forEach(el => el.classList.add('revealed'));
    }

    // Safety fallback: Ensure all reveal elements become visible after 800ms
    setTimeout(() => {
        revealElements.forEach(el => {
            el.classList.add('revealed');
            if (el.hasAttribute('data-counter') && (el.textContent === '0' || el.textContent === '')) {
                animateCounter(el);
            }
        });
    }, 800);

    // --- 6. COUNTER ANIMATION ---
    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-counter'), 10);
        if (isNaN(target)) return;
        const duration = 1800;
        const startTime = performance.now();

        function updateNumber(currentTime) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            const currentVal = Math.floor(easeProgress * target);
            
            el.textContent = currentVal;
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                el.textContent = target;
            }
        }
        requestAnimationFrame(updateNumber);
    }

    // --- 7. VIDEO REEL MODAL ---
    const openReelBtn = id('openReelBtn');
    const videoModal = id('videoModal');
    const modalClose = id('modalClose');
    const modalOverlay = id('modalOverlay');

    if (openReelBtn && videoModal) {
        openReelBtn.addEventListener('click', () => videoModal.classList.add('active'));
    }
    if (modalClose && videoModal) {
        modalClose.addEventListener('click', () => videoModal.classList.remove('active'));
    }
    if (modalOverlay && videoModal) {
        modalOverlay.addEventListener('click', () => videoModal.classList.remove('active'));
    }

    // Utility helper
    function id(name) {
        return document.getElementById(name);
    }
});
