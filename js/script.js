var mainDiv = document.getElementById('main-button');
mainDiv.addEventListener('click', function () {
    this.children.item(0).classList.toggle('fa-times');
    this.classList.toggle('open');
});

document.querySelectorAll('.acc-header').forEach(header => {
    header.addEventListener('click', () => {
        const item = header.parentElement;
        const allItems = document.querySelectorAll('.acc-item');
        allItems.forEach(i => {
            if (i !== item) i.classList.remove('active');
        });
        item.classList.toggle('active');
    });
});

$(document).ready(function () {
    window.addEventListener("scroll", function () {
        const header = document.querySelector("header");
        header.classList.toggle("sticky", window.scrollY > 80);
    });

    $(".mobile_btn").on("click", function () {
        $("nav").toggleClass("navOpen");
        $("html, body").toggleClass("locked");
        $(".mobile_btn").toggleClass("opened");
    });

    var swiper2 = new Swiper(".swiper.feedback", {
        slidesPerView: 3.5,
        spaceBetween: 30,
    });
});


(function () {
    const container = document.getElementById('advCards');
    if (!container) return;

    const desktopPattern = [4, 3]; // 4 sonra 3 təkrarlanır
    const mobilePattern = [2];      // mobil üçün (isteğe bağlı)
    const mobileBreakpoint = 480;   // px - buranı dəyişə bilərsən

    // debounce funksiyası (resize üçün)
    function debounce(fn, wait = 120) {
        let t;
        return function (...args) {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    function buildRows(pattern) {
        // mövcud kartları götürürük (node ref-lər saxlanır)
        const cards = Array.from(container.querySelectorAll('.adv'));
        // container-i təmizləyirik
        container.innerHTML = '';

        let i = 0;
        let patternIndex = 0;

        while (i < cards.length) {
            const cols = pattern[patternIndex % pattern.length];
            const realCols = Math.min(cols, cards.length - i);

            const row = document.createElement('div');
            row.className = 'adv-row';

            // həmin row-a realCols qədər card əlavə et
            for (let c = 0; c < realCols; c++, i++) {
                row.appendChild(cards[i]); // mövcud node-u köçürürük — event listener-lar qalır
            }
            container.appendChild(row);
            patternIndex++;
        }
    }

    function choosePattern() {
        return window.innerWidth <= mobileBreakpoint ? mobilePattern : desktopPattern;
    }

    // ilkin quruluş
    buildRows(choosePattern());

    // responsiv olduqda yenidən qur (debounce ilə)
    window.addEventListener('resize', debounce(() => buildRows(choosePattern()), 120));

    // xaricdən lazım olsa çağırmaq üçün funksiya qoyuram:
    // məsələn: window.rebuildAdvRows() -> yeni əlavə etdiyin .adv elementlərini də qruplayar
    window.rebuildAdvRows = () => buildRows(choosePattern());
})();


/* GSAP animations for your page */
/* Make sure gsap and ScrollTrigger are loaded (CDN above) */
gsap.registerPlugin(ScrollTrigger);

(function () {
    // Respect reduced motion
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
        document.documentElement.classList.add('reduced-motion');
    }

    // small helper: get all svg paths we want to "draw"
    function prepareSVGDraw(selector) {
        document.querySelectorAll(selector).forEach(path => {
            try {
                const len = path.getTotalLength();
                path.style.strokeDasharray = len;
                path.style.strokeDashoffset = len;
                path.dataset.length = len;
            } catch (e) { }
        });
    }

    /* 1) Header intro: logo, nav, socials */
    gsap.from(".logo img", {
        x: -30, opacity: 0, duration: 0.7, ease: "power2.out",
        delay: 0.15, attr: { "data-animated": "true" }
    });

    gsap.from("nav ul li", {
        y: -12, opacity: 0, duration: 0.6, stagger: 0.08, ease: "power2.out",
        delay: 0.25
    });

    gsap.from(".header_right .socials ul li", {
        x: 20, opacity: 0, duration: 0.6, stagger: 0.06, ease: "power2.out",
        delay: 0.35
    });
    /* 2) Hero / slider animations */
    // Prepare SVGs for draw animation
    prepareSVGDraw("#slider svg path"); // will set dasharray/dashoffset for each path

    // draw hero strokes when hero enters
    ScrollTrigger.batch("#slider svg path", {
        onEnter: batch => {
            batch.forEach(p => {
                const len = +p.dataset.length || 200;
                gsap.to(p, { strokeDashoffset: 0, duration: 1.2, ease: "power1.out" });
            });
        },
        start: "top 80%",
        once: true
    });

    // Slider left content appear
    gsap.from(".slider_left h2, .slider_left p", {
        y: 24, opacity: 0, stagger: 0.12, duration: 0.7, ease: "power2.out",
        scrollTrigger: { trigger: "#slider", start: "top 85%", once: true }
    });

    // slider_cards pop in
    gsap.from(".slider_card", {
        y: 20, opacity: 0, scale: 0.96, stagger: 0.12, duration: 0.6, ease: "power2.out",
        scrollTrigger: { trigger: ".slider_cards", start: "top 90%", once: true }
    });

    /* 3) Advantages - notes overlap animation (rows) */
    // initial tiny rotation/offset for overlapping feel
    gsap.set(".notes .row .note", { y: 20, opacity: 0, scale: 0.98 });

    // animate row by row with stagger inside each row
    document.querySelectorAll(".notes .row").forEach((row, i) => {
        gsap.to(row.querySelectorAll(".note"), {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: "power2.out",
            stagger: 0.08,
            scrollTrigger: {
                trigger: row,
                start: "top 85%",
                toggleActions: "play none none none"
            }
        });
    });

    // hover micro interactions for notes
    document.querySelectorAll(".note").forEach(el => {
        el.addEventListener("mouseenter", () => {
            if (reduced) return;
            gsap.to(el, { scale: 1.03, y: -6, boxShadow: "0 12px 30px rgba(7,94,84,0.12)", duration: 0.25, ease: "power2.out" });
        });
        el.addEventListener("mouseleave", () => {
            if (reduced) return;
            gsap.to(el, { scale: 1, y: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.06)", duration: 0.28, ease: "power2.out" });
        });
    });

    /* 4) Agent / stats counters animation */
    // simple count-up for numbers inside .parent (looks for h3)
    document.querySelectorAll(".parent h3 span").forEach((node) => {
        const startVal = 0;
        const endVal = parseInt(node.textContent.replace(/[^\d]/g, '')) || 0;
        const obj = { val: startVal };
        ScrollTrigger.create({
            trigger: node,
            start: "top 85%",
            onEnter: () => {
                gsap.to(obj, {
                    val: endVal,
                    duration: Math.min(1.8, 0.02 * endVal + 0.8),
                    ease: "power1.out",
                    onUpdate() { node.textContent = Math.floor(obj.val).toLocaleString(); }
                });
            },
            once: true
        });
    });

    document.querySelectorAll(".slider_card span.slider_num").forEach((node) => {
        const startVal = 0;
        const endVal = parseInt(node.textContent.replace(/[^\d]/g, '')) || 0;
        const obj = { val: startVal };
        ScrollTrigger.create({
            trigger: node,
            start: "top 85%",
            onEnter: () => {
                gsap.to(obj, {
                    val: endVal,
                    duration: Math.min(1.8, 0.02 * endVal + 0.8),
                    ease: "power1.out",
                    onUpdate() { node.textContent = Math.floor(obj.val).toLocaleString(); }
                });
            },
            once: true
        });
    });

    /* 5) Section reveal global (nice for any new sections later) */
    gsap.utils.toArray("main section").forEach(section => {
        gsap.from(section, {
            y: 18, opacity: 0, duration: 0.7, ease: "power2.out",
            scrollTrigger: { trigger: section, start: "top 88%", once: true }
        });
    });

    /* 6) Small parallax for SVG big stroke in right slider */
    const bigPath = document.querySelector(".slider_right svg path");
    if (bigPath) {
        gsap.to(bigPath, {
            y: -30,
            ease: "none",
            scrollTrigger: {
                trigger: "#slider",
                start: "top center",
                end: "bottom top",
                scrub: 0.6
            }
        });
    }

    /* 7) Accessibility: stop animations on focus keyboard navigation for certain elements */
    document.addEventListener('focusin', e => {
        const target = e.target;
        if (target.matches('a, button, input, textarea')) {
            gsap.to(target, { scale: 1.01, duration: 0.18, ease: "power1.out" });
        }
    });
    document.addEventListener('focusout', e => {
        const target = e.target;
        if (target.matches('a, button, input, textarea')) {
            gsap.to(target, { scale: 1, duration: 0.18, ease: "power1.out" });
        }
    });

    /* Optional: tiny entrance when page loads (if user didn't prefer reduced motion) */
    if (!reduced) {
        gsap.from("body", { opacity: 0, duration: 0.45, ease: "power1.out" });
    }

    /* ✨ 8) Contact Us Section Animation */
    prepareSVGDraw("#contactus svg path"); // SVG-ləri hazırlayır

    // Başlıq yuxarıdan aşağıya yumşaq düşür
    gsap.from("#contactus h2", {
        y: -30,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#contactus h2",
            start: "top 85%",
            once: true
        }
    });

    // Mətni soldan gətiririk
    gsap.from("#contactus p", {
        x: -40,
        opacity: 0,
        duration: 0.9,
        delay: 0.2,
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#contactus p",
            start: "top 85%",
            once: true
        }
    });

    // SVG yollarının çəkilmə effekti
    ScrollTrigger.batch("#contactus svg path", {
        onEnter: (batch) => {
            batch.forEach((p, i) => {
                const len = +p.dataset.length || 250;
                gsap.fromTo(p,
                    { strokeDashoffset: len },
                    {
                        strokeDashoffset: 0,
                        duration: 1.4,
                        delay: i * 0.15,
                        ease: "power1.out"
                    }
                );
            });
        },
        start: "top 80%",
        once: true
    });

    // Düymə aşağıdan çıxır
    gsap.from("#contactus .themebtn", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        delay: 0.4,
        ease: "back.out(1.6)",
        scrollTrigger: {
            trigger: "#contactus .themebtn",
            start: "top 90%",
            once: true
        }
    });

    /* ✨ 9) Investion Section Animation ✨ */
    gsap.registerPlugin(ScrollTrigger);

    // Başlıq (yuxarıdan aşağıya çıxır)
    gsap.from("#investion h2.new_sec", {
        y: -30,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#investion h2.new_sec",
            start: "top 85%",
            once: true
        }
    });

    // Kartların ardıcıl və yumşaq çıxışı
    gsap.from("#investion .invcard", {
        y: 40,
        opacity: 0,
        scale: 0.96,
        stagger: 0.15,
        duration: 0.8,
        ease: "back.out(1.6)",
        scrollTrigger: {
            trigger: "#investion .parentinv",
            start: "top 85%",
            once: true
        }
    });

    // Hover effekti — kartın üzərinə gələndə bir az qalxır
    document.querySelectorAll("#investion .invcard").forEach(card => {
        card.addEventListener("mouseenter", () => {
            gsap.to(card, { scale: 1.03, y: -6, boxShadow: "0 12px 30px rgba(7,94,84,0.15)", duration: 0.25, ease: "power2.out" });
        });
        card.addEventListener("mouseleave", () => {
            gsap.to(card, { scale: 1, y: 0, boxShadow: "0 4px 12px rgba(0,0,0,0.06)", duration: 0.3, ease: "power2.out" });
        });
    });

    /* --- RESULTS Bölməsi --- */
    (function () {
        const resultCards = gsap.utils.toArray("#results .result_card");
        resultCards.forEach((card) => {
            const circleSpans = card.querySelectorAll(".circle span");
            if (circleSpans.length) {
                circleSpans.forEach((span, i) => {
                    gsap.fromTo(
                        span,
                        { scale: 0, opacity: 0 },
                        {
                            scale: 1,
                            opacity: 1,
                            delay: i * 0.1,
                            duration: 0.5,
                            ease: "back.out(1.7)",
                            scrollTrigger: {
                                trigger: card,
                                start: "top 85%",
                                toggleActions: "play none none reverse",
                            },
                        }
                    );
                });
            }

            gsap.from(card.querySelector(".result_content"), {
                x: 50,
                opacity: 0,
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    toggleActions: "play none none reverse",
                },
            });

            const svg = card.querySelector("svg");
            if (svg) {
                gsap.from(svg, {
                    y: 20,
                    opacity: 0,
                    duration: 0.6,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: card,
                        start: "top 85%",
                        toggleActions: "play none none reverse",
                    },
                });
            }
        });
    })();

    /* ✨ 11) Feedback / Reviews Section Animation ✨ */
    // Animate title with color span
    gsap.from("#feedback h2", {
        y: -20,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#feedback h2",
            start: "top 85%",
            once: true
        }
    });

    // Set initial state for feedback cards
    gsap.set(".feedback_card", { opacity: 0, y: 30, scale: 0.95 });

    // Stagger feedback cards (since it's a swiper, animate on container enter)
    gsap.to(".feedback_card", {
        y: 0,
        opacity: 1,
        scale: 1,
        stagger: 0.15,
        duration: 0.7,
        ease: "back.out(1.6)",
        scrollTrigger: {
            trigger: "#feedback .swiper-wrapper",
            start: "top 85%",
            once: true
        }
    });

    // Animate stars image and text inside cards
    gsap.from(".feedback_card img, .feedback_card p", {
        x: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".feedback_card",
            start: "top 90%",
            once: true
        }
    });

    // Hover lift for feedback cards
    document.querySelectorAll(".feedback_card").forEach(card => {
        card.addEventListener("mouseenter", () => {
            if (reduced) return;
            gsap.to(card, { y: -8, scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.1)", duration: 0.25, ease: "power2.out" });
        });
        card.addEventListener("mouseleave", () => {
            gsap.to(card, { y: 0, scale: 1, boxShadow: "0 4px 12px rgba(0,0,0,0.06)", duration: 0.25, ease: "power2.out" });
        });
    });

    /* ✨ 12) Team Section Animation ✨ */
    // Animate title
    gsap.from("#team h2", {
        y: -20,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#team h2",
            start: "top 85%",
            once: true
        }
    });

    // Set initial state for team cards
    gsap.set("#team .team_card", { opacity: 0, x: -40, scale: 0.92 });

    // Stagger team cards with profile pic focus
    gsap.to("#team .team_card", {
        x: 0,
        opacity: 1,
        scale: 1,
        stagger: 0.18,
        duration: 0.8,
        ease: "back.out(1.7)",
        scrollTrigger: {
            trigger: "#team .team_cards",
            start: "top 85%",
            once: true
        }
    });

    // Animate profile pics inside cards
    gsap.from(".profile-pic img", {
        scale: 1.2,
        rotation: 5,
        duration: 1,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".profile-pic",
            start: "top 90%",
            once: true
        }
    });

    // Stagger social icons and button
    gsap.from(".social-links-container svg, .button", {
        y: 15,
        opacity: 0,
        stagger: 0.08,
        duration: 0.5,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".bottom-bottom",
            start: "top 85%",
            once: true
        }
    });

    // Hover effects for team cards and socials
    document.querySelectorAll("#team .team_card").forEach(card => {
        card.addEventListener("mouseenter", () => {
            if (reduced) return;
            gsap.to(card, { scale: 1.02, y: -5, duration: 0.3, ease: "power2.out" });
        });
        card.addEventListener("mouseleave", () => {
            gsap.to(card, { scale: 1, y: 0, duration: 0.3, ease: "power2.out" });
        });
    });

    document.querySelectorAll(".social-links-container svg").forEach(icon => {
        icon.addEventListener("mouseenter", () => {
            if (reduced) return;
            gsap.to(icon, { scale: 1.2, rotation: 360, duration: 0.4, ease: "back.out(1.7)" });
        });
        icon.addEventListener("mouseleave", () => {
            gsap.to(icon, { scale: 1, rotation: 0, duration: 0.3, ease: "power2.out" });
        });
    });

    // Button hover
    document.querySelectorAll(".button").forEach(btn => {
        btn.addEventListener("mouseenter", () => {
            if (reduced) return;
            gsap.to(btn, { scale: 1.05, backgroundColor: "#A52A2A", duration: 0.2, ease: "power2.out" });
        });
        btn.addEventListener("mouseleave", () => {
            gsap.to(btn, { scale: 1, backgroundColor: "initial", duration: 0.2, ease: "power2.out" });
        });
    });

    /* ✨ 13) CTA Section Animation ✨ */
    // Animate left side title and p
    gsap.from("#cta .cta_left h2, #cta .cta_left p", {
        y: 25,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#cta .cta_left",
            start: "top 85%",
            once: true
        }
    });

    // Animate form inputs and textarea stagger
    gsap.from("#cta input, #cta textarea", {
        y: 20,
        opacity: 0,
        stagger: 0.12,
        duration: 0.6,
        ease: "back.out(1.6)",
        scrollTrigger: {
            trigger: "#cta .cta_right",
            start: "top 85%",
            once: true
        }
    });

    // Submit button pop
    gsap.from("#cta .themebtn", {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.7)",
        delay: 0.3,
        scrollTrigger: {
            trigger: "#cta .themebtn",
            start: "top 90%",
            once: true
        }
    });

    /* ✨ 14) Accordion / FAQ Section Animation ✨ */
    // Animate title
    gsap.from("#accordion h2", {
        y: -20,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
            trigger: "#accordion h2",
            start: "top 85%",
            once: true
        }
    });

    // Stagger accordion items entrance
    gsap.from(".acc-item", {
        y: 20,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".custom-accordion",
            start: "top 85%",
            once: true
        }
    });

    // Animate accordion open/close with GSAP (assuming custom accordion JS handles toggle class)
    document.querySelectorAll(".acc-header").forEach(header => {
        header.addEventListener("click", () => {
            const body = header.nextElementSibling;
            const icon = header.querySelector(".acc-icon svg");
            if (body.style.display === "block") {
                gsap.to(body, { height: 0, opacity: 0, duration: 0.4, ease: "power2.in" });
                gsap.to(icon, { rotation: 0, duration: 0.3, ease: "power2.out" });
                body.style.display = "none";
            } else {
                body.style.display = "block";
                gsap.fromTo(body,
                    { height: 0, opacity: 0 },
                    { height: "auto", opacity: 1, duration: 0.4, ease: "power2.out" }
                );
                gsap.to(icon, { rotation: 180, duration: 0.3, ease: "power2.out" });
            }
        });
    });

    // Initial icon rotations if needed
    gsap.set(".acc-icon svg", { rotation: 0 });

    /* ✨ 15) Footer Animation ✨ */
    // Subtle stagger for footer sections
    gsap.from(".footer-section", {
        y: 15,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".footer_grids",
            start: "top 95%",
            once: true
        }
    });

    // Set initial state for social icons
    gsap.set(".social-media .social-icon", { opacity: 0, x: 10 });

    // Animate social icons in footer
    gsap.to(".social-media .social-icon", {
        x: 0,
        opacity: 1,
        stagger: 0.05,
        duration: 0.4,
        ease: "power2.out",
        scrollTrigger: {
            trigger: ".footer-section:last-child",
            start: "top 90%",
            once: true
        }
    });

    // Hover for footer links - use specific default color instead of initial
    document.querySelectorAll(".footer-nav a").forEach(link => {
        link.addEventListener("mouseenter", () => {
            if (reduced) return;
            gsap.to(link, { scale: 1.05, color: "#A52A2A", duration: 0.2, ease: "power2.out" });
        });
        link.addEventListener("mouseleave", () => {
            gsap.to(link, { scale: 1, color: "#ccc", duration: 0.2, ease: "power2.out" }); // Assuming default is dark gray
        });
    });

    document.querySelectorAll(".social-icon").forEach(link => {
        link.addEventListener("mouseenter", () => {
            if (reduced) return;
            gsap.to(link, { scale: 1.1, duration: 0.2, ease: "power2.out" });
        });
        link.addEventListener("mouseleave", () => {
            gsap.to(link, { scale: 1, duration: 0.2, ease: "power2.out" });
        });
    });

    // Consultation button in footer
    gsap.from(".consultation-btn", {
        scale: 0.9,
        opacity: 0,
        duration: 0.5,
        ease: "back.out(1.7)",
        scrollTrigger: {
            trigger: ".consultation-btn",
            start: "top 90%",
            once: true
        }
    });

})(); // end IIFE

// Make ScrollTrigger available for use in GSAP animations
gsap.registerPlugin(ScrollTrigger);

// Select the HTML elements needed for the animation
const scrollSection = document.querySelectorAll(".scroll-section");

scrollSection.forEach((section) => {
    const wrapper = section.querySelector(".wrapper");
    const items = wrapper.querySelectorAll(".item");

    // Initialize
    let direction = null;

    if (section.classList.contains("vertical-section")) {
        direction = "vertical";
    } else if (section.classList.contains("horizontal-section")) {
        direction = "horizontal";
    }

    initScroll(section, items, direction);
});

function initScroll(section, items, direction) {
    // Initial states
    items.forEach((item, index) => {
        if (index !== 0) {
            direction == "horizontal"
                ? gsap.set(item, { xPercent: 100 })
                : gsap.set(item, { yPercent: 100 });
        }
    });

    const timeline = gsap.timeline({
        scrollTrigger: {
            trigger: section,
            pin: true,
            start: "top top",
            end: () => `+=${items.length * 100}%`,
            scrub: 1,
            invalidateOnRefresh: true
            // markers: true,
        },
        defaults: { ease: "none" }
    });
    items.forEach((item, index) => {
        timeline.to(item, {
            scale: 0.9,
            borderRadius: "10px"
        });

        direction == "horizontal"
            ? timeline.to(
                items[index + 1],
                {
                    xPercent: 0
                },
                "<"
            )
            : timeline.to(
                items[index + 1],
                {
                    yPercent: 0
                },
                "<"
            );
    });
}

// Safety: feature detect
if (typeof gsap === 'undefined') {
    console.error('GSAP не загружен.');
} else {
    gsap.registerPlugin(ScrollTrigger);

    // Intro animation: badge & title
    const introTl = gsap.timeline();
    introTl.from('.brand-badge', { duration: 0.6, y: -12, opacity: 0, scale: 0.96, ease: 'power3.out' });
    introTl.from('.section-wrap .title', { duration: 0.6, y: 6, opacity: 0, ease: 'power3.out' }, '-=0.45');
    introTl.from('.subtitle', { duration: 0.5, y: 6, opacity: 0, ease: 'power3.out' }, '-=0.4');

    // Cards reveal on scroll with stagger
    gsap.utils.toArray('.case-card').forEach((card, i) => {
        // basic entrance
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
                end: 'bottom 20%',
                toggleActions: 'play none none reverse',
            },
            opacity: 0,
            y: 20,
            scale: 0.995,
            duration: 0.7,
            ease: 'power3.out',
            delay: i * 0.12
        });

        // stagger list items inside
        const items = card.querySelectorAll('.list li, .subsection ul li, .result-item');
        gsap.from(items, {
            scrollTrigger: {
                trigger: card,
                start: 'top 85%',
            },
            opacity: 0,
            y: 8,
            stagger: 0.08,
            duration: 0.45,
            ease: 'power2.out'
        });

        // subtle float effect on hover using pointer events
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const mx = (e.clientX - rect.left) / rect.width - 0.5;
            const my = (e.clientY - rect.top) / rect.height - 0.5;
            gsap.to(card, { duration: 0.6, rotationX: my * 4, rotationY: mx * -6, transformPerspective: 800, ease: 'power3.out' });
        });
        card.addEventListener('mouseleave', () => {
            gsap.to(card, { duration: 0.6, rotationX: 0, rotationY: 0, ease: 'power3.out' });
        });
    });

    // Make buttons micro-animated on hover
    gsap.utils.toArray('.section-wrap .btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => gsap.to(btn, { scale: 1.03, boxShadow: '0 10px 30px rgba(165,42,42,0.18)', duration: 0.18 }));
        btn.addEventListener('mouseleave', () => gsap.to(btn, { scale: 1, boxShadow: 'none', duration: 0.18 }));
    });

    // Reduce motion respect (prefers-reduced-motion)
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
        ScrollTrigger.getAll().forEach(st => st.disable());
        gsap.globalTimeline.timeScale(0.8);
    }
}

const feedbackCards = document.querySelectorAll('.feedback_card p');
const popup = document.getElementById('feedback_popup');
const popupText = document.getElementById('popup_text');
const closeBtn = document.querySelector('.popup_content .close');

feedbackCards.forEach(card => {
    card.addEventListener('click', () => {
        popupText.textContent = card.textContent;
        popup.style.display = 'flex';
    });
});

closeBtn.addEventListener('click', () => {
    popup.style.display = 'none';
});

popup.addEventListener('click', (e) => {
    if (e.target === popup) popup.style.display = 'none';
});

(function () {
    const buttons = document.querySelectorAll('.randevu');
    const modal = document.getElementById('appointmentModal');
    const close = modal.querySelector('.eye-modal__close');
    const backdrop = modal.querySelector('.eye-modal__backdrop');
    const firstInput = modal.querySelector('input, textarea, button');

    function openModal() {
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');
        // задержка для доступности: после рендера — фокус
        setTimeout(() => firstInput && firstInput.focus(), 50);
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // Bütün .randevu düymələrinə event listener əlavə et
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openModal();
        });
    });

    close.addEventListener('click', closeModal);
    backdrop.addEventListener('click', closeModal);
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });

    // Formun göndərilməsinin imitasiya hissəsi
    document.getElementById('eyeForm').addEventListener('submit', function (e) {
        e.preventDefault();
        const button = this.querySelector('.eye-btn');
        const oldText = button.textContent;
        button.disabled = true;
        button.textContent = 'Отправка...';
        setTimeout(() => {
            button.textContent = 'Заявка отправлена ✓';
            setTimeout(() => {
                button.disabled = false;
                button.textContent = oldText;
                closeModal();
            }, 1200);
        }, 900);
    });
})();