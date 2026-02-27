'use strict';

(function initIntro() {

    const splash = document.getElementById('splash');
    const nSolo = document.getElementById('splash-n-solo');
    const splWord = document.getElementById('splash-word');
    const splLine = document.getElementById('splash-line');
    if (!splash || !nSolo || !splWord) return;

    /* 1. Sound */
    const audio = document.getElementById('intro-sound');
    if (audio) {
        audio.volume = 1;
        const tryPlay = () => audio.play().catch(() => { });
        tryPlay();
        ['click', 'keydown', 'touchstart'].forEach(ev =>
            document.addEventListener(ev, tryPlay, { once: true })
        );
    }

    /* 2. Premium but skippable intro control */
    let introFinished = false;

    function endIntro() {
        if (introFinished) return;
        introFinished = true;

        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }

        splash.classList.add('splash-out');
        setTimeout(() => {
            splash.style.display = 'none';
        }, 900);

        window.removeEventListener('keydown', onSkipKey);
        window.removeEventListener('click', onSkipClick);
        window.removeEventListener('touchstart', onSkipTouch);
    }

    function onSkipKey(e) {
        if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
            endIntro();
        }
    }

    function onSkipClick() {
        endIntro();
    }

    function onSkipTouch() {
        endIntro();
    }

    // Allow user to skip the intro quickly if they want
    window.addEventListener('keydown', onSkipKey);
    window.addEventListener('click', onSkipClick);
    window.addEventListener('touchstart', onSkipTouch, { passive: true });

    // Hard safety timeout so intro never blocks visibility too long
    setTimeout(endIntro, 6500);

    /* ── PHASE 1: Solo N booms in via CSS `nBoomIn` animation (no JS needed).
       After a short hold we slide that N into the first position and then reveal “NETFLIX”. ── */

    setTimeout(() => {

        /* ── PHASE 2: Move solo N into “first position” ── */
        nSolo.style.opacity = '1';
        nSolo.style.transform = 'translateX(-150px) scale(0.8)';

        // After the N has slid into place, swap to full NETFLIX word
        setTimeout(() => {
            nSolo.style.display = 'none';

            // Reveal the full word with a smooth rise + fade
            splWord.style.opacity = '1';
            splWord.style.transform = 'translateY(0)';

            // Gently bring in each letter so "NETFLIX" is clearly visible and premium
            const letters = splWord.querySelectorAll('.sl');
            letters.forEach((el, i) => {
                el.style.opacity = '0';
                el.style.transform = 'translateY(18px)';
                el.style.transition = `opacity 0.5s cubic-bezier(.22,1,.36,1) ${i * 70}ms, transform 0.5s cubic-bezier(.22,1,.36,1) ${i * 70}ms`;
                setTimeout(() => {
                    el.style.opacity = '1';
                    el.style.transform = 'translateY(0)';
                }, 30);
            });

            // Underline sweeps in shortly after the word appears
            setTimeout(() => {
                if (splLine) splLine.style.width = '100%';

                // Subtle glow, then finish the intro
                setTimeout(() => {
                    splWord.style.animation = 'containerGlow 1.15s ease-in-out 2';
                    setTimeout(endIntro, 2200);
                }, 300);
            }, 250);

        }, 520);

    }, 1400); // wait for nBoomIn CSS animation + brief hold

})();

(function initScrollProgress() {
    const bar = document.getElementById('scroll-bar');
    if (!bar) return;
    window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const total = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
    }, { passive: true });
})();

(function initCardPlayBtns() {
    document.querySelectorAll('.card-play').forEach((btn, i) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showToast(`▶ Playing Trending #${i + 1}`, 'success');
        });
    });
})();



(function initNavScroll() {
    const nav = document.querySelector('nav');

    function onScroll() {
        nav.classList.toggle('nav-scrolled', window.scrollY > 60);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

(function initNavScrollCSS() {
    const style = document.createElement('style');
    style.textContent = `
        nav { transition: background-color 0.35s ease, box-shadow 0.35s ease; }
        nav.nav-scrolled { background-color: #141414 !important; box-shadow: 0 2px 12px rgba(0,0,0,0.8); }
    `;
    document.head.appendChild(style);
})();

(function initCarousel() {
    const list = document.getElementById('trand-list');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');

    if (!list || !prevBtn || !nextBtn) return;

    function getScrollAmount() {
        const card = list.querySelector('.img');
        return card ? (card.offsetWidth + 10) * 3 : 600;
    }

    window.slideRight = () => list.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
    window.slideLeft = () => list.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });

    function updateArrows() {
        const atStart = list.scrollLeft <= 10;
        const atEnd = list.scrollLeft + list.clientWidth >= list.scrollWidth - 10;
        prevBtn.style.opacity = atStart ? '0' : '1';
        prevBtn.style.pointerEvents = atStart ? 'none' : 'auto';
        nextBtn.style.opacity = atEnd ? '0' : '1';
        nextBtn.style.pointerEvents = atEnd ? 'none' : 'auto';
    }

    list.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    updateArrows();

    let isDown = false, startX, scrollLeft;
    list.addEventListener('mousedown', (e) => {
        isDown = true;
        list.style.cursor = 'grabbing';
        startX = e.pageX - list.offsetLeft;
        scrollLeft = list.scrollLeft;
    });
    list.addEventListener('mouseleave', () => { isDown = false; list.style.cursor = 'grab'; });
    list.addEventListener('mouseup', () => { isDown = false; list.style.cursor = 'grab'; });
    list.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        list.scrollLeft = scrollLeft - (e.pageX - list.offsetLeft - startX);
    });

    let touchStartX = 0;
    list.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
    list.addEventListener('touchend', (e) => {
        const delta = touchStartX - e.changedTouches[0].clientX;
        if (Math.abs(delta) > 50) delta > 0 ? slideRight() : slideLeft();
    });
})();

window.filterTrending = function () {
    const list = document.getElementById('trand-list');
    if (!list) return;
    const cards = list.querySelectorAll('.img');

    cards.forEach(card => {
        card.style.transition = 'opacity 0.3s, transform 0.3s';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.92)';
    });

    setTimeout(() => {
        cards.forEach((card, i) => setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = '';
        }, i * 40));
        list.scrollTo({ left: 0, behavior: 'smooth' });
    }, 320);
};

window.toggleFaq = function (id) {
    const item = document.getElementById(id);
    if (!item) return;
    const answer = item.querySelector('.faq-answer');
    const icon = item.querySelector('.faq-icon');
    const isOpen = item.classList.contains('faq-open');

    document.querySelectorAll('.faq-item').forEach(el => {
        el.classList.remove('faq-open');
        el.querySelector('.faq-answer').style.maxHeight = null;
        el.querySelector('.faq-icon').textContent = '+';
        el.querySelector('.faq-icon').style.transform = 'rotate(0deg)';
    });

    if (!isOpen) {
        item.classList.add('faq-open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        icon.textContent = '+';
        icon.style.transform = 'rotate(45deg)';
    }
};

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function showToast(message, type = 'success') {
    const existing = document.getElementById('nf-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'nf-toast';
    toast.textContent = message;
    toast.style.cssText = `
        position:fixed; bottom:32px; left:50%;
        transform:translateX(-50%) translateY(20px);
        background:${type === 'error' ? '#e50914' : '#2ecc71'};
        color:white; padding:14px 28px; border-radius:6px;
        font-size:15px; font-family:'Netflix Sans',sans-serif; font-weight:600;
        z-index:9999; box-shadow:0 4px 20px rgba(0,0,0,0.5);
        opacity:0; transition:opacity 0.3s ease,transform 0.3s ease;
        white-space:nowrap;
    `;
    document.body.appendChild(toast);

    requestAnimationFrame(() => requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    }));

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
        setTimeout(() => toast.remove(), 350);
    }, 3500);
}

window.handleGetStarted = function () {
    const inputs = document.querySelectorAll('.email');
    let email = '';
    inputs.forEach(i => { if (i.value.trim()) email = i.value.trim(); });

    if (!email) {
        inputs.forEach(i => { i.style.borderColor = '#e50914'; i.placeholder = 'Email address required'; });
        setTimeout(() => inputs.forEach(i => { i.style.borderColor = ''; i.placeholder = 'Email address'; }), 2500);
        inputs[0].focus();
        showToast('Please enter an email address.', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        inputs.forEach(i => { i.style.borderColor = '#e50914'; });
        setTimeout(() => inputs.forEach(i => { i.style.borderColor = ''; }), 2500);
        showToast('Please enter a valid email address.', 'error');
        return;
    }

    showToast(`🎉 Welcome! Setting up your account for ${email}`);
};

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.email').forEach(input => {
        input.addEventListener('input', () => {
            input.style.borderColor = isValidEmail(input.value) ? '#2ecc71' : '';
        });
    });
});

(function initScrollReveal() {
    const style = document.createElement('style');
    style.textContent = `
        .sr-hidden { opacity:0; transform:translateY(30px); transition:opacity 0.6s ease,transform 0.6s ease; }
        .sr-visible { opacity:1 !important; transform:translateY(0) !important; }
    `;
    document.head.appendChild(style);

    const allEls = [];
    ['.trand', '.reasons', '.reason-card', '.faq', '.faq-item', '.footer'].forEach(sel => {
        document.querySelectorAll(sel).forEach(el => { el.classList.add('sr-hidden'); allEls.push(el); });
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => { entry.target.classList.add('sr-visible'); observer.unobserve(entry.target); }, 60);
            }
        });
    }, { threshold: 0.08 });

    allEls.forEach(el => observer.observe(el));
})();

(function initBackToTop() {
    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.innerHTML = '&#8679;';
    btn.title = 'Back to top';
    btn.style.cssText = `
        position:fixed; bottom:90px; right:28px; width:46px; height:46px;
        border-radius:50%; background:#e50914; color:white; border:none;
        font-size:24px; cursor:pointer; z-index:9990; opacity:0;
        transform:scale(0.7); transition:opacity 0.3s,transform 0.3s;
        display:flex; align-items:center; justify-content:center;
        box-shadow:0 4px 16px rgba(229,9,20,0.5); line-height:1;
    `;
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        const show = window.scrollY > 400;
        btn.style.opacity = show ? '1' : '0';
        btn.style.transform = show ? 'scale(1)' : 'scale(0.7)';
    }, { passive: true });

    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

(function initCardGlow() {
    document.querySelectorAll('.reason-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.background = `radial-gradient(circle at ${x}% ${y}%, #2a1560 0%, #1b1033 40%, #1a1040 70%, #20153e 100%)`;
        });
        card.addEventListener('mouseleave', () => { card.style.background = ''; });
    });
})();

(function initCardRipple() {
    const style = document.createElement('style');
    style.textContent = `@keyframes ripple-anim { to { transform:scale(1.8); opacity:0; } }`;
    document.head.appendChild(style);

    document.querySelectorAll('.img').forEach(card => {
        card.addEventListener('click', function (e) {
            const ripple = document.createElement('span');
            const rect = card.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.cssText = `
                position:absolute; width:${size}px; height:${size}px;
                top:${e.clientY - rect.top - size / 2}px;
                left:${e.clientX - rect.left - size / 2}px;
                background:rgba(255,255,255,0.15); border-radius:50%;
                transform:scale(0); animation:ripple-anim 0.55s ease-out forwards;
                pointer-events:none; z-index:99;
            `;
            card.appendChild(ripple);
            setTimeout(() => ripple.remove(), 600);
        });
    });
})();

(function initSignIn() {
    const btn = document.querySelector('.btn-in');
    if (btn) btn.addEventListener('click', () => showToast('Sign In page coming soon!'));
})();
