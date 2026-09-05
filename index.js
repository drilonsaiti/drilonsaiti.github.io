'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const body = document.body;
    const header = document.getElementById('siteHeader');
    const progress = document.getElementById('scrollProgress');
    const themeToggle = document.getElementById('themeToggle');
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const commandTrigger = document.getElementById('commandTrigger');
    const commandPalette = document.getElementById('commandPalette');
    const commandInput = document.getElementById('commandInput');
    const commandList = document.getElementById('commandList');
    const commandEmpty = document.getElementById('commandEmpty');
    const currentYear = document.getElementById('currentYear');

    if (currentYear) currentYear.textContent = new Date().getFullYear();

    function updateThemeColor(theme) {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#0F0E0D' : '#F7F5F0');
    }

    updateThemeColor(root.dataset.theme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
            root.dataset.theme = next;
            localStorage.setItem('ds-theme', next);
            updateThemeColor(next);
        });
    }

    function updateScrollUI() {
        const scrollTop = window.scrollY;
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const pct = scrollable > 0 ? (scrollTop / scrollable) * 100 : 0;
        if (progress) progress.style.width = `${pct}%`;
        if (header) header.classList.toggle('is-scrolled', scrollTop > 12);
    }

    window.addEventListener('scroll', updateScrollUI, {passive: true});
    updateScrollUI();

    function closeMobileMenu() {
        if (!menuToggle || !mobileMenu) return;
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation');
        mobileMenu.classList.remove('is-open');
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileMenu.inert = true;
        body.classList.remove('menu-open');
    }

    function openMobileMenu() {
        if (!menuToggle || !mobileMenu) return;
        menuToggle.setAttribute('aria-expanded', 'true');
        menuToggle.setAttribute('aria-label', 'Close navigation');
        mobileMenu.classList.add('is-open');
        mobileMenu.setAttribute('aria-hidden', 'false');
        mobileMenu.inert = false;
        body.classList.add('menu-open');
    }

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            const open = menuToggle.getAttribute('aria-expanded') === 'true';
            open ? closeMobileMenu() : openMobileMenu();
        });

        mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMobileMenu));
    }

    const revealItems = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const revealObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            });
        }, {rootMargin: '0px 0px -70px 0px', threshold: 0.05});
        revealItems.forEach(item => revealObserver.observe(item));
    } else {
        revealItems.forEach(item => item.classList.add('is-visible'));
    }

    const navTargets = [...document.querySelectorAll('[data-nav]')];
    const trackedSections = navTargets
        .map(link => document.getElementById(link.dataset.nav))
        .filter(Boolean);

    if ('IntersectionObserver' in window && navTargets.length) {
        const sectionObserver = new IntersectionObserver(entries => {
            const visible = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (!visible) return;
            navTargets.forEach(link => link.classList.toggle('is-active', link.dataset.nav === visible.target.id));
        }, {rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.1, 0.5]});
        trackedSections.forEach(section => sectionObserver.observe(section));
    }

    document.querySelectorAll('.case-study').forEach(caseStudy => {
        const buttons = [...caseStudy.querySelectorAll('[data-mode-button]')];
        const panels = [...caseStudy.querySelectorAll('[data-mode-panel]')];

        buttons.forEach(button => {
            button.addEventListener('click', () => {
                const mode = button.dataset.modeButton;
                buttons.forEach(item => {
                    const active = item === button;
                    item.classList.toggle('is-active', active);
                    item.setAttribute('aria-pressed', String(active));
                });
                panels.forEach(panel => {
                    const active = panel.dataset.modePanel === mode;
                    panel.classList.toggle('is-active', active);
                    panel.hidden = !active;
                });
            });
        });
    });

    async function copyText(value, feedbackTarget) {
        try {
            await navigator.clipboard.writeText(value);
        } catch (_) {
            const textarea = document.createElement('textarea');
            textarea.value = value;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            textarea.remove();
        }

        if (feedbackTarget) {
            const previous = feedbackTarget.textContent;
            feedbackTarget.textContent = 'Copied';
            window.setTimeout(() => {
                feedbackTarget.textContent = previous;
            }, 1600);
        }
    }

    const copyEmailButton = document.getElementById('copyEmailBtn');
    if (copyEmailButton) {
        copyEmailButton.addEventListener('click', () => {
            copyText(copyEmailButton.dataset.email, copyEmailButton.querySelector('.copy-feedback'));
        });
    }

    let selectedCommandIndex = 0;
    let lastFocusedElement = null;

    function visibleCommandItems() {
        if (!commandList) return [];
        return [...commandList.querySelectorAll('button, a')].filter(item => !item.hidden);
    }

    function setSelectedCommand(index) {
        const items = visibleCommandItems();
        if (!items.length) return;
        selectedCommandIndex = (index + items.length) % items.length;
        items.forEach((item, idx) => item.classList.toggle('is-selected', idx === selectedCommandIndex));
        items[selectedCommandIndex].scrollIntoView({block: 'nearest'});
    }

    function filterCommands(query) {
        if (!commandList) return;
        const normalized = query.trim().toLowerCase();
        const allItems = [...commandList.querySelectorAll('button, a')];
        allItems.forEach(item => {
            const matches = !normalized || item.textContent.toLowerCase().includes(normalized);
            item.hidden = !matches;
        });
        const visible = visibleCommandItems();
        if (commandEmpty) commandEmpty.hidden = visible.length > 0;
        selectedCommandIndex = 0;
        setSelectedCommand(0);
    }

    function openCommandPalette() {
        if (!commandPalette || !commandInput) return;
        lastFocusedElement = document.activeElement;
        commandPalette.inert = false;
        commandPalette.classList.add('is-open');
        commandPalette.setAttribute('aria-hidden', 'false');
        body.classList.add('command-open');
        commandInput.value = '';
        filterCommands('');
        window.setTimeout(() => commandInput.focus(), 10);
    }

    function closeCommandPalette() {
        if (!commandPalette) return;
        commandPalette.classList.remove('is-open');
        commandPalette.setAttribute('aria-hidden', 'true');
        commandPalette.inert = true;
        body.classList.remove('command-open');
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') lastFocusedElement.focus();
    }

    if (commandTrigger) commandTrigger.addEventListener('click', openCommandPalette);
    if (commandPalette) {
        commandPalette.querySelectorAll('[data-command-close]').forEach(el => el.addEventListener('click', closeCommandPalette));
    }

    if (commandInput) {
        commandInput.addEventListener('input', () => filterCommands(commandInput.value));
        commandInput.addEventListener('keydown', event => {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setSelectedCommand(selectedCommandIndex + 1);
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setSelectedCommand(selectedCommandIndex - 1);
            } else if (event.key === 'Enter') {
                event.preventDefault();
                const items = visibleCommandItems();
                if (items[selectedCommandIndex]) items[selectedCommandIndex].click();
            }
        });
    }

    if (commandList) {
        commandList.addEventListener('mousemove', event => {
            const item = event.target.closest('button, a');
            if (!item || item.hidden) return;
            const items = visibleCommandItems();
            setSelectedCommand(items.indexOf(item));
        });

        commandList.addEventListener('click', event => {
            const targetButton = event.target.closest('[data-command-target]');
            const copyButton = event.target.closest('[data-copy-command]');

            if (targetButton) {
                const target = document.querySelector(targetButton.dataset.commandTarget);
                closeCommandPalette();
                if (target) window.setTimeout(() => target.scrollIntoView({behavior: 'smooth', block: 'start'}), 30);
            }

            if (copyButton) {
                copyText(copyButton.dataset.copyCommand);
                const small = copyButton.querySelector('small');
                if (small) {
                    const original = small.textContent;
                    small.textContent = 'Copied to clipboard';
                    window.setTimeout(() => {
                        small.textContent = original;
                    }, 1400);
                }
            }

            if (event.target.closest('a')) closeCommandPalette();
        });
    }

    document.addEventListener('keydown', event => {
        const commandShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
        if (commandShortcut) {
            event.preventDefault();
            commandPalette && commandPalette.classList.contains('is-open') ? closeCommandPalette() : openCommandPalette();
            return;
        }

        if (event.key === 'Escape') {
            if (commandPalette && commandPalette.classList.contains('is-open')) closeCommandPalette();
            else closeMobileMenu();
        }
    });

    const contactForm = document.getElementById('contactForm');
    const contactFormStatus = document.getElementById('contactFormStatus');

    if (contactForm) {
        const submitButton = contactForm.querySelector('button[type="submit"]');
        const submitLabel = contactForm.querySelector('.contact-form__button-label');
        const defaultLabel = submitLabel ? submitLabel.textContent : 'Send message';

        const setFormStatus = (message = '', type = '') => {
            if (!contactFormStatus) return;
            contactFormStatus.textContent = message;
            contactFormStatus.classList.toggle('is-success', type === 'success');
            contactFormStatus.classList.toggle('is-error', type === 'error');
        };

        const setSubmitting = submitting => {
            if (submitButton) submitButton.disabled = submitting;
            if (submitLabel) submitLabel.textContent = submitting ? 'Sending…' : defaultLabel;
            contactForm.setAttribute('aria-busy', String(submitting));
        };

        contactForm.addEventListener('input', event => {
            if (event.target.matches('input, textarea')) event.target.removeAttribute('aria-invalid');
            if (contactFormStatus?.classList.contains('is-error')) setFormStatus();
        });

        contactForm.addEventListener('submit', async event => {
            event.preventDefault();
            setFormStatus();

            const accessKey = contactForm.elements.access_key?.value?.trim();
            if (!accessKey || accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY') {
                setFormStatus('Contact form is not configured yet. Add the Web3Forms access key.', 'error');
                return;
            }

            if (!contactForm.checkValidity()) {
                const invalidFields = [...contactForm.querySelectorAll(':invalid')];
                invalidFields.forEach(field => field.setAttribute('aria-invalid', 'true'));
                invalidFields[0]?.focus();
                setFormStatus('Please complete the required fields.', 'error');
                return;
            }

            const botcheck = contactForm.elements.botcheck;

            if (botcheck?.checked) {
                contactForm.reset();
                setFormStatus(
                    'Message sent. Thanks — I’ll get back to you soon.',
                    'success'
                );
                return;
            }
            setSubmitting(true);
            setFormStatus('Sending your message…');

            try {
                const formData = new FormData(contactForm);
                const payload = Object.fromEntries(formData.entries());

                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                const result = await response.json();
                if (!response.ok || !result.success) {
                    throw new Error(result.message || 'Unable to send your message.');
                }

                contactForm.reset();
                contactForm.querySelectorAll('[aria-invalid]').forEach(field => field.removeAttribute('aria-invalid'));
                setFormStatus('Message sent. Thanks — I’ll get back to you soon.', 'success');
            } catch (error) {
                console.error('Contact form submission failed:', error);
                setFormStatus('Something went wrong. Please email me directly instead.', 'error');
            } finally {
                setSubmitting(false);
            }
        });
    }
});
