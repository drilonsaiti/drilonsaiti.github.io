'use strict';

/* ─── THEME (runs before DOMContentLoaded to avoid flash) ── */
(function initTheme() {
    const saved = localStorage.getItem('ds-theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
})();

document.addEventListener('DOMContentLoaded', function () {

    /* ════════════════════════════════════════════════════
       1. THEME TOGGLE
       ════════════════════════════════════════════════════ */
    const themeBtn = document.getElementById('themeToggle');
    if (themeBtn) {
        themeBtn.addEventListener('click', function () {
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('ds-theme', next);
        });
    }

    /* ════════════════════════════════════════════════════
       2. SCROLL PROGRESS BAR + BACK-TO-TOP
       ════════════════════════════════════════════════════ */
    const progressBar = document.getElementById('scrollProgress');
    const backToTopBtn = document.getElementById('backToTop');
    const nav = document.getElementById('nav');

    function onScroll() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        if (progressBar) progressBar.style.width = pct + '%';
        if (backToTopBtn) backToTopBtn.classList.toggle('visible', scrollTop > window.innerHeight * 0.4);
        if (nav) nav.classList.toggle('scrolled', scrollTop > 20);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ─── CUSTOM SMOOTH SCROLL (easeInOutCubic) ─────── */
    function smoothScrollTo(targetY, duration) {
        const startY = window.scrollY;
        const distance = targetY - startY;
        let startTime = null;

        function easeInOutCubic(t) {
            return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        }

        function step(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            window.scrollTo(0, startY + distance * easeInOutCubic(progress));
            if (progress < 1) requestAnimationFrame(step);
        }

        requestAnimationFrame(step);
    }

    /* ─── BACK TO TOP CLICK ──────────────────────────── */
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function () {
            smoothScrollTo(0, 700);
        });
    }

    /* ════════════════════════════════════════════════════
       3. SMOOTH SCROLL — all anchor links
       ════════════════════════════════════════════════════ */
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href').slice(1);
            const target = document.getElementById(targetId);
            if (!target) return;
            e.preventDefault();
            const top = target.getBoundingClientRect().top + window.scrollY - 72;
            smoothScrollTo(top, 700);
        });
    });

    /* ════════════════════════════════════════════════════
       4. ACTIVE NAV LINK
       ════════════════════════════════════════════════════ */
    const sections = document.querySelectorAll('section[id], header[id]');
    const navLinks = document.querySelectorAll('.nav__link');

    const sectionObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.id;
                    navLinks.forEach(link => {
                        link.classList.toggle('active', link.getAttribute('href') === '#' + id);
                    });
                }
            });
        },
        { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach(s => sectionObserver.observe(s));

    /* ════════════════════════════════════════════════════
       5. HAMBURGER + MOBILE MENU
          - full-screen slide-in from right
          - staggered link entrance (CSS handles timing)
          - close on outside click + Escape key
       ════════════════════════════════════════════════════ */
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobileMenu');

    function openMenu() {
        mobileMenu.classList.add('open');
        hamburger.classList.add('open');
        hamburger.setAttribute('aria-expanded', 'true');
        mobileMenu.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        mobileMenu.querySelectorAll('.nav__link').forEach(l => l.setAttribute('tabindex', '0'));
    }

    function closeMenu() {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        mobileMenu.querySelectorAll('.nav__link').forEach(l => l.setAttribute('tabindex', '-1'));
    }

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', function () {
            mobileMenu.classList.contains('open') ? closeMenu() : openMenu();
        });

        mobileMenu.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close on outside click
        document.addEventListener('click', function (e) {
            if (
                mobileMenu.classList.contains('open') &&
                !mobileMenu.contains(e.target) &&
                !hamburger.contains(e.target)
            ) closeMenu();
        });

        // Close on Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
                closeMenu();
                hamburger.focus();
            }
        });
    }

    /* ════════════════════════════════════════════════════
       6. REVEAL ON SCROLL
       ════════════════════════════════════════════════════ */
    const revealEls = document.querySelectorAll('.reveal');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0, rootMargin: '0px 0px -60px 0px' }
        );
        revealEls.forEach(el => revealObserver.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('is-visible'));
    }

    /* ════════════════════════════════════════════════════
       7. HERO ENTRANCE
       ════════════════════════════════════════════════════ */
    const heroContent = document.querySelector('.hero__content');
    const heroImage = document.querySelector('.hero__image-frame');

    if (heroContent) {
        heroContent.style.cssText = 'opacity:0;transform:translateY(24px)';
        requestAnimationFrame(() => {
            setTimeout(() => {
                heroContent.style.transition = 'opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1)';
                heroContent.style.opacity = '1';
                heroContent.style.transform = 'none';
            }, 80);
        });
    }
    if (heroImage) {
        heroImage.style.cssText = 'opacity:0;transform:translateY(20px) scale(.97)';
        setTimeout(() => {
            heroImage.style.transition = 'opacity .8s cubic-bezier(.16,1,.3,1) .18s, transform .8s cubic-bezier(.16,1,.3,1) .18s';
            heroImage.style.opacity = '1';
            heroImage.style.transform = 'none';
        }, 100);
    }

    /* ════════════════════════════════════════════════════
       8. COUNTER ANIMATION
       ════════════════════════════════════════════════════ */
    function animateCounter(el, target, duration) {
        duration = duration || 1400;
        let start = null;
        function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }
        const step = function(ts) {
            if (!start) start = ts;
            const progress = Math.min((ts - start) / duration, 1);
            const value = easeOutQuart(progress) * target;
            el.textContent = target % 1 !== 0 ? value.toFixed(1) : Math.floor(value);
            if (progress < 1) requestAnimationFrame(step);
            else el.textContent = target;
        };
        requestAnimationFrame(step);
    }

    const statNums = document.querySelectorAll('.stats__num');
    const statsObserver = new IntersectionObserver(
        entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const raw = el.textContent.replace(/[^0-9.]/g, '');
                const target = parseFloat(raw);
                const suffix = el.querySelector('span') ? el.querySelector('span').textContent : '';
                if (!isNaN(target) && target > 0) {
                    el.innerHTML = '0<span>' + suffix + '</span>';
                    animateCounter(el.childNodes[0], target);
                }
                statsObserver.unobserve(el);
            });
        },
        { threshold: 0.5 }
    );
    statNums.forEach(el => statsObserver.observe(el));

    /* ════════════════════════════════════════════════════
       9. CONTACT FORM VALIDATION
       ════════════════════════════════════════════════════ */
    const form = document.getElementById('contactForm');
    if (form) {
        const submitBtn = form.querySelector('[type="submit"]');

        form.addEventListener('submit', function (e) {
            const required = [
                form.querySelector('#fullName'),
                form.querySelector('#email'),
                form.querySelector('#message'),
            ].filter(Boolean);
            let valid = true;

            required.forEach(field => {
                const ok = field.value.trim().length > 0;
                field.style.borderColor = ok ? '' : '#e05252';
                field.setAttribute('aria-invalid', String(!ok));
                if (!ok) valid = false;
            });

            if (!valid) {
                e.preventDefault();
                const first = form.querySelector('[aria-invalid="true"]');
                if (first) first.focus();
                return;
            }
            if (submitBtn) {
                submitBtn.innerHTML = 'Sending\u2026 <i class="fa-solid fa-circle-notch fa-spin"></i>';
                submitBtn.disabled = true;
            }
        });

        form.querySelectorAll('input, textarea').forEach(field => {
            field.addEventListener('input', function () {
                if (this.value.trim()) {
                    this.style.borderColor = '';
                    this.setAttribute('aria-invalid', 'false');
                }
            });
        });
    }

    /* ════════════════════════════════════════════════════
       10. DYNAMIC FOOTER YEAR
       ════════════════════════════════════════════════════ */
    const footerCopy = document.querySelector('.footer__copy');
    if (footerCopy) {
        footerCopy.textContent = '\u00A9 ' + new Date().getFullYear() + ' Drilon Saiti \u2014 Built with care.';
    }

});