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
        color:white; padding:12px 24px; border-radius:6px;
        font-size:15px; font-family:'Netflix Sans',sans-serif; font-weight:600;
        z-index:9999; box-shadow:0 4px 20px rgba(0,0,0,0.5);
        opacity:0; transition:opacity 0.3s ease,transform 0.3s ease;
        white-space:normal; max-width:calc(100vw - 40px);
        text-align:center; word-break:break-word;
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

/* ════════════════════════════════
   LANGUAGE SWITCHER (EN / HI)
   ════════════════════════════════ */
(function initLanguageSwitcher() {

    const translations = {
        en: {
            signIn: 'Sign In',
            heroLine1: 'Unlimited movies,',
            heroLine2: 'shows, and more',
            heroSub: 'Starts at 149. Cancel at any time.',
            heroCta: 'Ready to watch? Enter your email to create or restart your membership.',
            emailPlaceholder: 'Email address',
            getStarted: 'Get Started',
            trendingTitle: 'Trending Now',
            optIndia: 'India', optGlobal: 'Global', optMovies: 'Movies', optTV: 'TV Shows',
            trendingNum: (n) => `Trending #${n}`,
            reasonsTitle: 'More reasons to join',
            r1Title: 'Enjoy on your TV',
            r1Desc: 'Watch on smart TVs, PlayStation, Xbox, Chromecast, Apple TV, Blu-ray players and more.',
            r2Title: 'Download your shows to watch offline',
            r2Desc: 'Save your favourites easily and always have something to watch.',
            r3Title: 'Watch everywhere',
            r3Desc: 'Stream unlimited movies and TV shows on your phone, tablet, laptop, and TV.',
            r4Title: 'Create profiles for kids',
            r4Desc: 'Send kids on adventures with their favourite characters in a space made just for them — free with your membership.',
            faqTitle: 'Frequently Asked Questions',
            faq1Q: 'What is Netflix?',
            faq1A1: 'Netflix is a streaming service that offers a wide variety of award-winning TV shows, movies, anime, documentaries and more on thousands of internet-connected devices.',
            faq1A2: "You can watch as much as you want, whenever you want, without a single ad - all for one low monthly price. There's always something new to discover, and new TV shows and movies are added every week!",
            faq2Q: 'How much does Netflix cost?',
            faq2A1: 'Watch Netflix on your smartphone, tablet, Smart TV, laptop, or streaming device, all for one fixed monthly fee. Plans range from Rs 149 to Rs 649 a month. No extra costs, no contracts.',
            faq3Q: 'Where can I watch?',
            faq3A1: 'Watch anywhere, anytime. Sign in with your Netflix account to watch instantly on the web at netflix.com from your personal computer or on any internet-connected device that offers the Netflix app, including smart TVs, smartphones, tablets, streaming media players and game consoles.',
            faq3A2: "You can also download your favourite shows with the iOS or Android app. Use downloads to watch while you're on the go and without an internet connection. Take Netflix with you anywhere.",
            faq4Q: 'How do I cancel?',
            faq4A1: 'Netflix is flexible. There are no annoying contracts and no commitments. You can easily cancel your account online in two clicks. There are no cancellation fees - start or stop your account anytime.',
            faq5Q: 'What can I watch on Netflix?',
            faq5A1: 'Netflix has an extensive library of feature films, documentaries, TV shows, anime, award-winning Netflix originals, and more. Watch as much as you want, anytime you want.',
            faq6Q: 'Is Netflix good for kids?',
            faq6A1: 'The Netflix Kids experience is included in your membership to give parents control while kids enjoy family-friendly TV shows and films in their own space.',
            faq6A2: "Kids profiles come with PIN-protected parental controls that let you restrict the maturity rating of content kids can watch and block specific titles you don't want kids to see.",
            footerPhone: 'Questions? Call <a href="tel:0008009191743" class="footer-phone-link">000-800-919-1743</a>',
            fFAQ: 'FAQ', fInvestor: 'Investor Relations', fPrivacy: 'Privacy', fSpeed: 'Speed Test',
            fHelp: 'Help Centre', fJobs: 'Jobs', fCookie: 'Cookie Preferences', fLegal: 'Legal Notices',
            fAccount: 'Account', fWatch: 'Ways to Watch', fCorp: 'Corporate Information', fOnly: 'Only on Netflix',
            fMedia: 'Media Centre', fTerms: 'Terms of Use', fContact: 'Contact Us',
            footerLocation: 'Netflix India',
        },
        hi: {
            signIn: 'साइन इन करें',
            heroLine1: 'असीमित फिल्में,',
            heroLine2: 'शोज़, और भी बहुत कुछ',
            heroSub: '149 से शुरू। कभी भी रद्द करें।',
            heroCta: 'देखना शुरू करें? मेंबरशिप बनाने या फिर शुरू करने के लिए अपना ईमेल दर्ज करें।',
            emailPlaceholder: 'ईमेल पता',
            getStarted: 'शुरू करें',
            trendingTitle: 'अभी ट्रेंडिंग',
            optIndia: 'भारत', optGlobal: 'विश्व', optMovies: 'फिल्में', optTV: 'टीवी शोज़',
            trendingNum: (n) => `ट्रेंडिंग #${n}`,
            reasonsTitle: 'जुड़ने के और कारण',
            r1Title: 'अपने टीवी पर आनंद लें',
            r1Desc: 'स्मार्ट टीवी, PlayStation, Xbox, Chromecast, Apple TV, Blu-ray प्लेयर और अन्य पर देखें।',
            r2Title: 'शोज़ डाउनलोड करें और ऑफलाइन देखें',
            r2Desc: 'अपने पसंदीदा को आसानी से सेव करें और हमेशा कुछ देखते रहें।',
            r3Title: 'कहीं भी देखें',
            r3Desc: 'अपने फोन, टैबलेट, लैपटॉप और टीवी पर असीमित फिल्में और शोज़ स्ट्रीम करें।',
            r4Title: 'बच्चों के लिए प्रोफाइल बनाएं',
            r4Desc: 'बच्चों को उनके पसंदीदा किरदारों के साथ रोमांच पर भेजें — उनके लिए बने एक खास स्थान में, आपकी मेंबरशिप के साथ मुफ्त।',
            faqTitle: 'अक्सर पूछे जाने वाले सवाल',
            faq1Q: 'Netflix क्या है?',
            faq1A1: 'Netflix एक स्ट्रीमिंग सेवा है जो हजारों इंटरनेट-कनेक्टेड डिवाइस पर पुरस्कार विजेता टीवी शोज़, फिल्में, एनीमे और डॉक्यूमेंट्री प्रदान करती है।',
            faq1A2: 'आप जितना चाहें, जब चाहें, बिना किसी विज्ञापन के देख सकते हैं — सिर्फ एक कम मासिक मूल्य पर। हर हफ्ते नए शोज़ और फिल्में जुड़ती रहती हैं!',
            faq2Q: 'Netflix की कीमत कितनी है?',
            faq2A1: 'अपने स्मार्टफोन, टैबलेट, स्मार्ट टीवी, लैपटॉप पर Netflix देखें — एक निश्चित मासिक शुल्क पर। प्लान 149 से 649 प्रति माह तक हैं।',
            faq3Q: 'मैं कहाँ देख सकता/सकती हूँ?',
            faq3A1: 'कहीं भी, कभी भी देखें। अपने Netflix खाते से साइन इन करें और netflix.com पर या Netflix ऐप वाले किसी भी डिवाइस — स्मार्ट टीवी, स्मार्टफोन, टैबलेट और गेम कंसोल सहित — पर तुरंत देखें।',
            faq3A2: 'iOS या Android ऐप से अपने पसंदीदा शोज़ डाउनलोड करें और इंटरनेट के बिना भी देखें। Netflix को अपने साथ कहीं भी ले जाएं।',
            faq4Q: 'मैं कैसे रद्द करूँ?',
            faq4A1: 'Netflix लचीला है। कोई झंझट भरे अनुबंध नहीं — अपना खाता ऑनलाइन दो क्लिक में आसानी से रद्द करें। कोई रद्दीकरण शुल्क नहीं।',
            faq5Q: 'Netflix पर मैं क्या देख सकता/सकती हूँ?',
            faq5A1: 'Netflix में फीचर फिल्मों, डॉक्यूमेंट्री, टीवी शोज़, एनीमे, Netflix ओरिजिनल्स और बहुत कुछ का विशाल संग्रह है।',
            faq6Q: 'क्या Netflix बच्चों के लिए अच्छा है?',
            faq6A1: 'Netflix Kids अनुभव आपकी मेंबरशिप में शामिल है, जिससे माता-पिता नियंत्रण रख सकते हैं जबकि बच्चे पारिवारिक फिल्में एन्जॉय करते हैं।',
            faq6A2: 'बच्चों की प्रोफाइल में PIN-सुरक्षित माता-पिता नियंत्रण हैं, जिससे आप सामग्री की परिपक्वता रेटिंग सीमित कर सकते हैं।',
            footerPhone: 'सवाल हैं? कॉल करें <a href="tel:0008009191743" class="footer-phone-link">000-800-919-1743</a>',
            fFAQ: 'सामान्य प्रश्न', fInvestor: 'निवेशक संबंध', fPrivacy: 'गोपनीयता', fSpeed: 'स्पीड टेस्ट',
            fHelp: 'सहायता केंद्र', fJobs: 'नौकरियाँ', fCookie: 'कुकी प्राथमिकताएँ', fLegal: 'कानूनी नोटिस',
            fAccount: 'खाता', fWatch: 'देखने के तरीके', fCorp: 'कॉर्पोरेट जानकारी', fOnly: 'केवल Netflix पर',
            fMedia: 'मीडिया केंद्र', fTerms: 'उपयोग की शर्तें', fContact: 'हमसे संपर्क करें',
            footerLocation: 'Netflix India',
        }
    };

    function applyLanguage(lang) {
        const t = translations[lang];
        if (!t) return;
        document.documentElement.lang = lang === 'hi' ? 'hi' : 'en';

        ['lang-select-nav', 'lang-select-footer'].forEach(id => {
            const sel = document.getElementById(id);
            if (sel) sel.value = lang;
        });

        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (key === 'trendingNum') {
                const num = el.getAttribute('data-i18n-num');
                const val = t[key];
                el.textContent = typeof val === 'function' ? val(num) : val;
            } else if (key === 'footerPhone') {
                el.innerHTML = t[key];
            } else if (t[key] !== undefined) {
                el.textContent = t[key];
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (t[key] !== undefined) el.placeholder = t[key];
        });

        document.querySelectorAll('option[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key] !== undefined) el.textContent = t[key];
        });
    }

    function onLangChange(e) {
        applyLanguage(e.target.value);
        showToast(
            e.target.value === 'hi' ? ' हिन्दी में बदल दिया गया' : ' Switched to English',
            'success'
        );
    }

    document.getElementById('lang-select-nav')?.addEventListener('change', onLangChange);
    document.getElementById('lang-select-footer')?.addEventListener('change', onLangChange);

    applyLanguage('en');
})();
