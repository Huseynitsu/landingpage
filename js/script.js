var mainDiv = document.getElementById('main-button');
mainDiv.addEventListener('click', function () {
    this.children.item(0).classList.toggle('fa-times');
    this.classList.toggle('open');
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
