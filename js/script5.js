/* ===== 햄버거 전체 메뉴 ===== */
(function () {
  const btn = document.getElementById('menuBtn');       // 헤더의 햄버거
  const x = document.getElementById('menuClose');     // 패널 위에 겹치는 X
  const gnb = document.getElementById('gnb');
  if (!btn || !x || !gnb) return;

  const MORPH_MS = 400;                                 // CSS의 .4s와 맞춤
  const isOpen = () => gnb.classList.contains('open');
  let timer;

  /* X 버튼을 헤더 햄버거와, 패널 로고를 헤더 로고와 똑같은 크기/위치에 놓음 */
  function place() {
    const r = btn.getBoundingClientRect();
    x.style.top = r.top + 'px';
    x.style.left = r.left + 'px';
    x.style.width = r.width + 'px';
    x.style.height = r.height + 'px';

    const hl = document.getElementById('hdLogo');
    const gl = document.getElementById('gnbLogo');
    if (hl && gl) {
      const l = hl.getBoundingClientRect();
      gl.style.left = l.left + 'px';
      gl.style.top = l.top + 'px';
      gl.style.width = l.width + 'px';
      gl.style.height = l.height + 'px';
    }
  }

  function open() {
    clearTimeout(timer);
    place();
    x.classList.add('show');                            // = 모양으로 먼저 나타남 (햄버거와 겹침)
    btn.style.visibility = 'hidden';
    x.tabIndex = 0;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      x.classList.add('is-x');                          // = → X
      gnb.classList.add('open');
    }));
    gnb.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
  }

  function close() {
    x.classList.remove('is-x');                         // X → =
    gnb.classList.remove('open');
    gnb.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    x.tabIndex = -1;
    clearTimeout(timer);
    timer = setTimeout(() => {                          // 모션이 끝나면 진짜 햄버거로 교체
      x.classList.remove('show');
      btn.style.visibility = '';
      btn.focus({ preventScroll: true });
    }, MORPH_MS);
  }

  btn.addEventListener('click', open);
  x.addEventListener('click', close);
  gnb.addEventListener('click', e => { if (e.target.closest('a')) close(); });
  addEventListener('resize', () => isOpen() && place());

  /* 메뉴가 열려 있는 동안: Esc로 닫기 + 뒤 화면 스크롤/키 입력 막기 */
  addEventListener('keydown', e => {
    if (!isOpen()) return;
    if (e.key === 'Escape') close();
    e.stopImmediatePropagation();                       // 뒤쪽 매거진이 같이 반응하지 않도록
  }, true);
  addEventListener('wheel', e => {
    if (!isOpen()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  }, { capture: true, passive: false });
  addEventListener('touchmove', e => {
    if (!isOpen()) return;
    e.preventDefault();
    e.stopImmediatePropagation();
  }, { capture: true, passive: false });
})();

// ============================================================
/* ===== 헤더 로고를 메뉴의 SHOP 글씨 왼쪽 끝에 맞춤 ===== */
(function () {
  const logo = document.getElementById('hdLogo') || document.querySelector('header img, header svg');
  const shop = document.querySelector('.gnb__col h2');
  if (!logo || !shop) return;

  function align() {
    logo.style.transform = 'none';                           // 원래 위치를 먼저 잼
    const shift = shop.getBoundingClientRect().left - logo.getBoundingClientRect().left;
    logo.style.transform = `translateX(${shift}px)`;         // SHOP과 같은 x로 이동
  }
  align();
  addEventListener('load', align);                           // 로고 이미지가 로드된 뒤 다시 계산
  addEventListener('resize', align);
})();

/* ===== 로그인/쇼핑백 아이콘을 X(햄버거) 버튼 밑에 오른쪽 정렬 ===== */
(function () {
  const btn   = document.getElementById('menuBtn');
  const inner = document.querySelector('.gnb__inner');
  const util  = document.querySelector('.gnb__util');
  if (!btn || !inner || !util) return;

  const GAP = 28;                                   // X 버튼과 아이콘 사이 세로 간격(px)

  function place() {
    const r = btn.getBoundingClientRect();          // 헤더 버튼의 화면상 위치
    const innerRight = inner.offsetLeft + inner.offsetWidth;   // 패널 콘텐츠 오른쪽 끝 (화면 기준)
    util.style.top   = (r.bottom + GAP) + 'px';
    util.style.right = (innerRight - r.right) + 'px';          // 버튼 오른쪽 끝과 맞춤
  }
  place();
  addEventListener('load', place);                  // 로고/폰트가 로드된 뒤 다시 계산
  addEventListener('resize', place);
  btn.addEventListener('click', place);             // 열 때마다 한 번 더
})();

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