
// overview
(() => {
    const section = document.querySelector('.swap');
    if (!section) return;

    const stage = section.querySelector('.swap__stage');
    const text1 = section.querySelector('.swap__text--1');
    const text2 = section.querySelector('.swap__text--2');
    const img1 = section.querySelector('.swap__img--1');
    const img2 = section.querySelector('.swap__img--2');
    const mobile = window.matchMedia('(max-width: 768px)');
    const header = parseFloat(getComputedStyle(section).getPropertyValue('--header')) || 40;

    const clamp = (v) => Math.min(Math.max(v, 0), 1);
    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);   // 시작과 끝이 모두 부드러움

    let target = 0;        // 스크롤 위치에서 계산한 목표 진행도 (0 ~ 1)
    let current = 0;       // 화면에 실제 반영되는 진행도 (목표를 천천히 따라감)
    let raf = null;

    function render(p) {
        const e = easeInOut(p);

        img2.style.transform = `translate3d(0, ${(1 - e) * 100}%, 0)`;    // 새 사진: 아래에서 위로
        img1.style.transform = `translate3d(0, ${-e * 12}%, 0)`;          // 기존 사진: 살짝 위로 밀려서 깊이감

        const out = clamp(p / 0.45);                                      // 첫 문구: 앞쪽에서 위로 사라짐
        const inn = clamp((p - 0.4) / 0.45);                              // 두 번째 문구: 뒤쪽에서 아래에서 올라옴
        text1.style.opacity = 1 - out;
        text1.style.transform = `translate3d(0, ${-out * 24}px, 0)`;
        text2.style.opacity = inn;
        text2.style.transform = `translate3d(0, ${(1 - inn) * 24}px, 0)`;
    }

    const START = 0.3;    // 첫 화면이 그대로 머무는 구간 (전체 스크롤 거리의 30%)
    const END = 0.85;     // 이동을 끝내는 지점 (나머지 15%는 두 번째 화면이 머묾)

    function calc() {
        const scrolled = header - section.getBoundingClientRect().top;    // 고정된 뒤 스크롤한 양
        const distance = section.offsetHeight - stage.offsetHeight;       // 전체 스크롤 거리
        target = clamp((scrolled / distance - START) / (END - START));    // START까지는 0, END에서 1
    }

    function loop() {
        current += (target - current) * 0.1;                              // 목표를 10%씩 따라감 (관성)
        if (Math.abs(target - current) < 0.0005) current = target;
        render(current);
        raf = current !== target ? requestAnimationFrame(loop) : null;
    }

    function onScroll() {
        if (mobile.matches) return;
        calc();
        if (!raf) raf = requestAnimationFrame(loop);
    }

    function reset() {
        [text1, text2, img1, img2].forEach((el) => el.removeAttribute('style'));
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
        if (mobile.matches) { reset(); return; }
        calc();
        current = target;
        render(current);
    });

    if (mobile.matches) reset();
    else { calc(); current = target; render(current); }
})();

// brandstory
(() => {
    const values = document.querySelector('.vm__values');
    if (!values) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);          // 한 번 실행하고 감시 종료
            }
        });
    }, {
        threshold: 0.3,                                // 어두운 영역이 30% 보이면 시작
    });

    observer.observe(values);

    document.addEventListener('motion:reset', () => {
        values.classList.remove('is-visible');
        observer.observe(values);
    });
})();

// corevalue
(() => {
    const section = document.querySelector('.flow');
    if (!section) return;

    const stage = section.querySelector('.flow__stage');
    const items = Array.from(section.querySelectorAll('.flow__item'));
    const n = items.length;
    if (!stage || n < 2) return;

    section.style.setProperty('--count', n);
    section.classList.add('is-ready');

    const mobile = window.matchMedia('(max-width: 768px)');
    const header = parseFloat(getComputedStyle(section).getPropertyValue('--header')) || 40;
    const clamp = (v) => Math.min(Math.max(v, 0), 1);

    let current = -1;

    function setScene(i) {
        if (i === current) return;
        current = i;
        items.forEach((el, k) => {
            el.classList.toggle('is-on', k <= i);
            el.classList.toggle('is-current', k === i);
        });
    }

    function update() {
        if (mobile.matches) {
            items.forEach((el) => el.classList.remove('is-on', 'is-current'));
            current = -1;
            return;
        }
        const scrolled = header - section.getBoundingClientRect().top;
        const distance = section.offsetHeight - stage.offsetHeight;
        const p = clamp(scrolled / distance);
        setScene(Math.min(n - 1, Math.floor(p * n)));
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => { update(); ticking = false; });
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
})();

// information
(() => {
    const section = document.querySelector('.seq');
    if (!section) return;

    const stage = section.querySelector('.seq__stage');
    const frame = section.querySelector('.seq__frame');
    const layer2 = section.querySelector('.seq__layer--2');
    const box1 = section.querySelector('.seq__box--1');
    const box2 = section.querySelector('.seq__box--2');
    const header = parseFloat(getComputedStyle(section).getPropertyValue('--header')) || 40;

    const BOX_SPEED = 1;                 // 1 = 스크롤과 같은 속도, 1.5 = 더 빠르게, 0.7 = 더 느리게

    // 시작 지점 (전체 스크롤 거리 중 몇 %에서 시작할지)
    const START = { box1: 0.14, box2: 0.78 };
    const LAYER2 = [0.48, 0.68];         // 두 번째 배경이 올라오는 구간

    const clamp = (v) => Math.min(Math.max(v, 0), 1);
    const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    let distance = 1;                    // 전체 스크롤 거리(px)
    let travel1 = 0;                     // 박스가 올라와야 하는 거리(px)
    let travel2 = 0;
    let target = 0;                      // 두 번째 배경의 목표 진행도
    let current = 0;                     // 두 번째 배경의 실제 진행도 (부드럽게 따라감)
    let raf = null;

    function measure() {
        distance = Math.max(section.offsetHeight - stage.offsetHeight, 1);
        travel1 = (frame.clientHeight + box1.offsetHeight) / 2 + 8;     // 틀 밖에서 제자리까지의 거리 (8px 여유)
        travel2 = (frame.clientHeight + box2.offsetHeight) / 2 + 8;
    }

    const scrolled = () => header - section.getBoundingClientRect().top;   // 고정된 뒤 스크롤한 거리(px)

    // 흰 박스: 스크롤한 거리만큼 그대로 이동 (관성, 이징 없음)
    function renderBoxes(s) {
        const m1 = clamp(((s - START.box1 * distance) * BOX_SPEED) / travel1);
        const m2 = clamp(((s - START.box2 * distance) * BOX_SPEED) / travel2);
        box1.style.transform = `translate3d(0, ${(1 - m1) * travel1}px, 0)`;
        box2.style.transform = `translate3d(0, ${(1 - m2) * travel2}px, 0)`;
    }

    // 두 번째 배경: 부드럽게 따라가며 이동
    function renderLayer(p) {
        const t = easeInOut(clamp((p - LAYER2[0]) / (LAYER2[1] - LAYER2[0])));
        layer2.style.transform = `translate3d(0, calc(${(1 - t) * 100}% + ${(1 - t) * 2}px), 0)`;
    }

    function loop() {
        current += (target - current) * 0.1;
        if (Math.abs(target - current) < 0.0005) current = target;
        renderLayer(current);
        raf = current !== target ? requestAnimationFrame(loop) : null;
    }

    let ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const s = scrolled();
            renderBoxes(s);                  // 박스는 즉시 반영
            target = clamp(s / distance);
            if (!raf) raf = requestAnimationFrame(loop);
            ticking = false;
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', () => {
        measure();
        const s = scrolled();
        renderBoxes(s);
        target = current = clamp(s / distance);
        renderLayer(current);
    });
    window.addEventListener('load', () => {            // 영상, 이미지 로딩 후 크기를 다시 측정
        measure();
        renderBoxes(scrolled());
    });

    measure();
    const s0 = scrolled();
    renderBoxes(s0);
    target = current = clamp(s0 / distance);
    renderLayer(current);
})();

// color
(() => {
    const palette = document.querySelector('.palette');
    if (!palette) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);          // 한 번 실행하고 감시 종료
            }
        });
    }, {
        threshold: 0.3,                                // 영역이 30% 보이면 시작
    });

    observer.observe(palette);
    document.addEventListener('motion:reset', () => {
        palette.classList.remove('is-visible');
        observer.observe(palette);
    });
})();

// logo
(() => {
    const section = document.querySelector('.reveal');
    if (!section) return;

    const stage = section.querySelector('.reveal__stage');
    const grid = section.querySelector('.reveal__img--grid');
    const logo = section.querySelector('.reveal__img:not(.reveal__img--grid)');
    const header = parseFloat(getComputedStyle(section).getPropertyValue('--header')) || 40;

    const START = 0.12;    // 이 지점까지는 선 로고가 그대로 머뭄
    const END = 0.88;      // 이 지점부터는 채워진 로고가 그대로 머뭄
    const SHRINK = 0.71;   // 선 로고가 줄어드는 최종 크기 (채워진 로고 크기에 맞춘 비율)

    const clamp = (v) => Math.min(Math.max(v, 0), 1);
    const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    let target = 0;        // 스크롤에서 계산한 목표값
    let current = 0;       // 화면에 반영되는 값 (목표를 천천히 따라감)
    let raf = null;

    function render(p) {
        const e = easeInOut(p);

        // 선 로고: 작아지면서 점점 사라짐
        grid.style.transform = `scale(${(1 - (1 - SHRINK) * e).toFixed(4)})`;
        grid.style.opacity = (1 - clamp(e / 0.8)).toFixed(3);

        // 채워진 로고: 선 로고가 줄어든 뒤 그 자리에서 나타남
        logo.style.opacity = clamp((e - 0.35) / 0.5).toFixed(3);
    }

    function calc() {
        const scrolled = header - section.getBoundingClientRect().top;     // 고정된 뒤 스크롤한 양
        const distance = Math.max(section.offsetHeight - stage.offsetHeight, 1);
        target = clamp((scrolled / distance - START) / (END - START));
    }

    function loop() {
        current += (target - current) * 0.12;                              // 부드럽게 따라감
        if (Math.abs(target - current) < 0.0005) current = target;
        render(current);
        raf = current !== target ? requestAnimationFrame(loop) : null;
    }

    window.addEventListener('scroll', () => {
        calc();
        if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });

    window.addEventListener('resize', () => {
        calc();
        current = target;
        render(current);
    });

    calc();
    current = target;
    render(current);
})();

// nav
(() => {
    const bar = document.querySelector('.fbar');
    if (!bar) return;

    const items = Array.from(bar.querySelectorAll('a[href^="#"]'))
        .map((a) => ({ a, sec: document.querySelector(a.getAttribute('href')) }))
        .filter((o) => o.sec);

    const footer = document.querySelector('footer');

    const REF = 0.5;       // 화면 높이의 50% 지점을 기준선으로 삼아 진행도를 계산
    const GAP = 30;        // 푸터 윗면과 바 사이 간격(px)
    const clamp = (v) => Math.min(Math.max(v, 0), 1);

    let base = 56;         // 평소 bottom 값(px). CSS 값을 읽어옴
    function readBase() {
        bar.style.removeProperty('bottom');
        base = parseFloat(getComputedStyle(bar).bottom) || 56;
    }

    function update() {
        const vh = window.innerHeight;

        // 푸터가 올라오면 바를 푸터 윗면에서 GAP만큼 위에 고정
        if (footer) {
            const overlap = vh - footer.getBoundingClientRect().top;   // 푸터가 화면에 들어온 높이
            const bottom = Math.max(base, overlap + GAP);
            bar.style.setProperty('bottom', `${bottom}px`, 'important');
        }

        // 스크롤 진행도에 따라 바 채우기
        if (!items.length) return;
        const atEnd = window.scrollY + vh >= document.documentElement.scrollHeight - 2;
        let sum = 0;
        let currentIdx = -1;

        items.forEach(({ sec }, i) => {
            const r = sec.getBoundingClientRect();
            let p = clamp((vh * REF - r.top) / r.height);
            if (atEnd && i === items.length - 1) p = 1;
            sum += p;
            if (p > 0) currentIdx = i;
        });

        bar.style.setProperty('--total', (sum / items.length).toFixed(4));
        items.forEach(({ a }, i) => a.classList.toggle('is-active', i === currentIdx));
    }

    let ticking = false;
    window.addEventListener('scroll', () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => { update(); ticking = false; });
    }, { passive: true });
    window.addEventListener('resize', () => { readBase(); update(); });
    window.addEventListener('load', () => { readBase(); update(); });

    readBase();
    update();
})();

// footer
(() => {
    const topBtn = document.querySelector('.footer__top-btn');
    if (!topBtn) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function waitForTop(deadline) {
        if (window.scrollY <= 1) {
            document.dispatchEvent(new CustomEvent('motion:reset'));   // 맨 위에 도착하면 초기화 신호
            return;
        }
        if (performance.now() > deadline) return;
        requestAnimationFrame(() => waitForTop(deadline));
    }

    topBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        waitForTop(performance.now() + 5000);
    });
})();

// section hold
(() => {
    document.querySelectorAll('.section_wrap').forEach((el) => {
        if (el.parentElement.classList.contains('hold')) return;   // 이미 감싸져 있으면 건너뜀

        const box = document.createElement('div');
        box.className = 'hold';
        if (el.dataset.hold) box.style.setProperty('--hold', el.dataset.hold);   // 섹션별 머무는 거리
        el.parentNode.insertBefore(box, el);
        box.appendChild(el);
    });
})();