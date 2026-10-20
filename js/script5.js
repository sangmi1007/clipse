// subnav
(() => {
    const links = Array.from(document.querySelectorAll('.subnav__list a'));
    if (!links.length) return;

    // 현재 페이지 파일명 (확장자와 폴더를 뺀 이름). 주소가 폴더로 끝나면 index로 처리
    const pageName = (path) => {
        const last = path.split('?')[0].split('#')[0].split('/').filter(Boolean).pop() || 'index';
        return last.replace(/\.html?$/i, '').toLowerCase();
    };

    const current = pageName(location.pathname);

    links.forEach((a) => {
        const on = pageName(new URL(a.getAttribute('href'), location.href).pathname) === current;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'page');
        else a.removeAttribute('aria-current');
    });
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