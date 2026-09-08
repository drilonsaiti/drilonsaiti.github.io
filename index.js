'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const body = document.body;
    const themeToggle = document.getElementById('themeToggle');
    const menuToggle = document.getElementById('menuToggle');
    const mobileMenu = document.getElementById('mobileMenu');
    const siteHeader = document.getElementById('siteHeader');
    const scrollProgress = document.getElementById('scrollProgress');
    const currentYear = document.getElementById('currentYear');
    const commandTrigger = document.getElementById('commandTrigger');
    const commandPalette = document.getElementById('commandPalette');
    const commandInput = document.getElementById('commandInput');
    const commandList = document.getElementById('commandList');
    const commandEmpty = document.getElementById('commandEmpty');

    if (currentYear) currentYear.textContent = new Date().getFullYear();

    function updateThemeMeta(theme) {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#07070A' : '#F4F4F7');
        if (themeToggle) {
            const next = theme === 'dark' ? 'light' : 'dark';
            themeToggle.setAttribute('aria-label', `Switch to ${next} mode`);
            themeToggle.setAttribute('title', `Switch to ${next} mode`);
        }
    }

    updateThemeMeta(root.dataset.theme || 'dark');

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = root.dataset.theme === 'light' ? 'light' : 'dark';
            const next = current === 'dark' ? 'light' : 'dark';
            root.dataset.theme = next;
            localStorage.setItem('ds-theme', next);
            updateThemeMeta(next);
        });
    }

    function updateScrollUI() {
        const scrollTop = window.scrollY;
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollable > 0 ? Math.min(100, (scrollTop / scrollable) * 100) : 0;
        if (scrollProgress) scrollProgress.style.width = `${progress}%`;
        if (siteHeader) siteHeader.classList.toggle('is-scrolled', scrollTop > 18);
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

        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', event => {
            const href = link.getAttribute('href');
            if (!href || href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            event.preventDefault();
            target.scrollIntoView({behavior: 'smooth', block: 'start'});
            history.replaceState(null, '', href);
        });
    });

    const revealItems = document.querySelectorAll('.reveal');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if ('IntersectionObserver' in window && !reducedMotion) {
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

    const navLinks = [...document.querySelectorAll('[data-nav]')];
    const navSections = navLinks
        .map(link => document.getElementById(link.dataset.nav))
        .filter(Boolean);

    if ('IntersectionObserver' in window && navLinks.length) {
        const sectionObserver = new IntersectionObserver(entries => {
            const visible = entries
                .filter(entry => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

            if (!visible) return;
            navLinks.forEach(link => {
                link.classList.toggle('is-active', link.dataset.nav === visible.target.id);
            });
        }, {rootMargin: '-28% 0px -58% 0px', threshold: [0, 0.08, 0.35]});

        navSections.forEach(section => sectionObserver.observe(section));
    }

    document.querySelectorAll('[data-project]').forEach(project => {
        const buttons = [...project.querySelectorAll('[data-mode-button]')];
        const panels = [...project.querySelectorAll('[data-mode-panel]')];

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
            textarea.style.pointerEvents = 'none';
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
            copyText(
                copyEmailButton.dataset.email,
                copyEmailButton.querySelector('.copy-feedback')
            );
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
        items.forEach((item, itemIndex) => {
            item.classList.toggle('is-selected', itemIndex === selectedCommandIndex);
        });
        items[selectedCommandIndex].scrollIntoView({block: 'nearest'});
    }

    function filterCommands(query) {
        if (!commandList) return;
        const normalized = query.trim().toLowerCase();
        const items = [...commandList.querySelectorAll('button, a')];

        items.forEach(item => {
            item.hidden = Boolean(normalized) && !item.textContent.toLowerCase().includes(normalized);
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
        window.setTimeout(() => commandInput.focus(), 20);
    }

    function closeCommandPalette() {
        if (!commandPalette) return;
        commandPalette.classList.remove('is-open');
        commandPalette.setAttribute('aria-hidden', 'true');
        commandPalette.inert = true;
        body.classList.remove('command-open');
        if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
            lastFocusedElement.focus();
        }
    }

    if (commandTrigger) commandTrigger.addEventListener('click', openCommandPalette);

    if (commandPalette) {
        commandPalette.querySelectorAll('[data-command-close]').forEach(element => {
            element.addEventListener('click', closeCommandPalette);
        });
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
                items[selectedCommandIndex]?.click();
            }
        });
    }

    if (commandList) {
        commandList.addEventListener('mousemove', event => {
            const item = event.target.closest('button, a');
            if (!item || item.hidden) return;
            const items = visibleCommandItems();
            const index = items.indexOf(item);
            if (index >= 0) setSelectedCommand(index);
        });

        commandList.addEventListener('click', event => {
            const targetButton = event.target.closest('[data-command-target]');
            const copyButton = event.target.closest('[data-copy-command]');
            const anchor = event.target.closest('a');

            if (targetButton) {
                const target = document.querySelector(targetButton.dataset.commandTarget);
                closeCommandPalette();
                if (target) {
                    window.setTimeout(() => target.scrollIntoView({behavior: 'smooth', block: 'start'}), 30);
                }
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

            if (anchor) closeCommandPalette();
        });
    }

    document.addEventListener('keydown', event => {
        const commandShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';
        if (commandShortcut) {
            event.preventDefault();
            const isOpen = commandPalette?.classList.contains('is-open');
            isOpen ? closeCommandPalette() : openCommandPalette();
            return;
        }

        if (event.key === 'Escape') {
            if (commandPalette?.classList.contains('is-open')) closeCommandPalette();
            else closeMobileMenu();
        }
    });

    if (!reducedMotion && window.matchMedia('(pointer: fine)').matches) {
        document.querySelectorAll('.project-visual').forEach(visual => {
            visual.addEventListener('pointermove', event => {
                const rect = visual.getBoundingClientRect();
                const x = (event.clientX - rect.left) / rect.width - 0.5;
                const y = (event.clientY - rect.top) / rect.height - 0.5;
                visual.style.transform = `perspective(1200px) rotateX(${(-y * 1.8).toFixed(2)}deg) rotateY(${(x * 2.2).toFixed(2)}deg)`;
            });
            visual.addEventListener('pointerleave', () => {
                visual.style.transform = '';
            });
        });
    }

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
            if (event.target.matches('input, textarea')) {
                event.target.removeAttribute('aria-invalid');
            }
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
                setFormStatus('Message sent. Thanks — I’ll get back to you soon.', 'success');
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
                contactForm.querySelectorAll('[aria-invalid]').forEach(field => {
                    field.removeAttribute('aria-invalid');
                });
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
