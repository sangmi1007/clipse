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

// brand ==================================
const images = document.querySelector('.brand-intro__images');

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);          // 한 번 실행하고 감시 종료
    }
  });
}, {
  threshold: 0.25,                               // 이미지 영역이 25% 보이면 시작
  rootMargin: '0px 0px -10% 0px',                // 화면 아래쪽 10%는 제외하고 판단
});

observer.observe(images);

// corevalue ============================================
(() => {
  const value = document.querySelector('.value');
  if (!value) return;                              // 이 페이지에 코어밸류가 없으면 종료

  const frame = value.querySelector('.scroll');
  if (!frame) return;

  const mq = window.matchMedia('(max-width: 768px)');
  let maxMove = 0;                                 // 틀 안에서 카드가 움직여야 하는 총 거리
  let ticking = false;

  function update() {
    if (mq.matches) return;
    const top = value.getBoundingClientRect().top;
    const scrolled = Math.min(Math.max(-top, 0), maxMove);
    frame.scrollTop = scrolled;                    // 스크롤한 만큼 틀 안의 카드를 이동
  }

  function setup() {
    if (mq.matches) {                              // 모바일은 세로로 쌓기
      value.style.height = '';
      frame.scrollTop = 0;
      return;
    }

    value.style.height = '';                       // 이전 계산값을 지우고 다시 측정
    maxMove = Math.max(frame.scrollHeight - frame.clientHeight, 0);

    const cs = getComputedStyle(value);
    const padding = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    value.style.height = `${padding + frame.offsetHeight + maxMove}px`;

    update();
  }

  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  }, { passive: true });

  window.addEventListener('resize', setup);
  window.addEventListener('load', setup);          // 이미지 로딩이 끝난 뒤 높이를 다시 계산
  setup();
})();


// best =================================================
(() => {
  const best = document.querySelector('.best');
  if (!best) return;

  const track = best.querySelector('.best__track');
  const prev = best.querySelector('.best__prev');
  const next = best.querySelector('.best__next');
  const items = Array.from(best.querySelectorAll('.best__item'));
  const total = items.length;
  if (!track || !prev || !next || total < 2) return;

  let index = 0;                                   // 지금 큰 자리에 있는 카드 번호
  let busy = false;                                // 이동 중에는 버튼을 잠금

  const OUT_LEFT = -2;                             // 화면 왼쪽 밖 자리
  const OUT_RIGHT = Math.max(total, 3);            // 화면 오른쪽 밖 자리

  function readDur() {                             // CSS의 --dur 값을 ms로 읽기
    const v = getComputedStyle(best).getPropertyValue('--dur').trim();
    const n = parseFloat(v);
    if (isNaN(n)) return 900;
    return v.indexOf('ms') > -1 ? n : n * 1000;
  }

  function posOf(el) {
    return (items.indexOf(el) - index + total) % total;
  }

  function place(el, p) {
    el.style.setProperty('--p', p);
    el.classList.toggle('is-active', p === 0);
  }

  function render() {
    items.forEach((el) => place(el, posOf(el)));
  }

  // dir: +1 = 다음, -1 = 이전
  function go(dir, done) {
    if (busy) return;
    busy = true;

    const dur = readDur();
    const oldIndex = index;
    index = (index + dir + total) % total;

    // 반대편으로 넘어가는 카드: 다음이면 맨 앞 카드, 이전이면 맨 뒤 카드
    const mover = dir > 0 ? items[oldIndex] : items[(oldIndex - 1 + total) % total];
    const finalP = posOf(mover);                   // 이 카드가 최종적으로 도착할 자리

    // 1) 나머지 카드는 한 칸씩 이동
    items.forEach((el) => {
      if (el !== mover) place(el, posOf(el));
    });

    // 2) 복제본을 반대편 화면 밖에 미리 준비 (움직임 없이)
    const clone = mover.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.classList.remove('is-active', 'is-out');
    clone.classList.add('is-teleport');
    clone.style.setProperty('--p', dir > 0 ? OUT_RIGHT : OUT_LEFT);
    track.appendChild(clone);
    void clone.offsetWidth;                        // 시작 위치를 먼저 확정

    // 3) 모두 같은 순간에 출발: 원본은 퇴장, 복제본은 입장
    mover.classList.remove('is-active');
    mover.classList.add('is-out');
    mover.style.setProperty('--p', dir > 0 ? OUT_LEFT : OUT_RIGHT);
    clone.classList.remove('is-teleport');
    place(clone, finalP);

    // 4) 전환이 끝나면 복제본을 지우고 원본이 그 자리를 이어받음
    setTimeout(() => {
      mover.classList.add('is-teleport');
      mover.classList.remove('is-out');
      place(mover, finalP);
      if (clone.parentNode) clone.parentNode.removeChild(clone);
      void mover.offsetWidth;
      mover.classList.remove('is-teleport');

      busy = false;
      if (typeof done === 'function') done();
    }, dur + 30);
  }

  prev.addEventListener('click', () => go(-1));
  next.addEventListener('click', () => go(1));

  // 작은 카드를 직접 눌러도 그 자리까지 한 칸씩 이동
  items.forEach((el) => {
    el.addEventListener('click', () => {
      const p = posOf(el);
      if (p === 0 || busy) return;
      let steps = p;
      const run = () => {
        steps -= 1;
        if (steps > 0) go(1, run);
      };
      go(1, steps > 1 ? run : undefined);
    });
  });
  // ===== 스와이프 / 드래그로 넘기기 =====
  const slider = best.querySelector('.best__slider');
  const SWIPE_MIN = 50;                            // 이 거리(px) 이상 밀어야 넘어감
  let startX = 0;
  let startY = 0;
  let tracking = false;
  let dragged = false;

  slider.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;   // 마우스는 왼쪽 버튼만
    tracking = true;
    dragged = false;
    startX = e.clientX;
    startY = e.clientY;
  });

  slider.addEventListener('pointermove', (e) => {
    if (tracking && Math.abs(e.clientX - startX) > 10) dragged = true;
  });

  window.addEventListener('pointerup', (e) => {
    if (!tracking) return;
    tracking = false;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) >= SWIPE_MIN && Math.abs(dx) > Math.abs(dy)) {
      go(dx < 0 ? 1 : -1);                         // 왼쪽으로 밀면 다음, 오른쪽으로 밀면 이전
    }
  });

  window.addEventListener('pointercancel', () => { tracking = false; });

  // 드래그한 뒤에는 카드 클릭으로 인식되지 않게 막음
  slider.addEventListener('click', (e) => {
    if (dragged) {
      e.stopPropagation();
      e.preventDefault();
      dragged = false;
    }
  }, true);
  render();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => best.classList.add('is-ready'));
  });
})();


// store_scroll =========================================
/* ===== 1) 세로 스크롤 → 가로 이동 ===== */
const section = document.querySelector('.stores-scroll');
const track = section.querySelector('.stores-scroll__track');
const mobile = window.matchMedia('(max-width: 768px)');
let ticking = false;

function updateTrack() {
  ticking = false;

  if (mobile.matches) {
    track.style.transform = '';
    return;
  }

  const rect = section.getBoundingClientRect();
  const distance = section.offsetHeight - window.innerHeight;      // 총 스크롤 거리
  const hold = window.innerHeight * 0.5;                           // 이동이 끝난 뒤 고정 유지 구간 (화면 높이의 50%)
  const moveDistance = Math.max(distance - hold, 1);               // 실제로 가로 이동에 쓰는 거리
  const progress = Math.min(Math.max(-rect.top / moveDistance, 0), 1);

  track.style.transform = `translate3d(${-progress * 50}%, 0, 0)`;   // 50% = 1화면
}

function requestUpdate() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(updateTrack);
  }
}

window.addEventListener('scroll', requestUpdate, { passive: true });
window.addEventListener('resize', requestUpdate);
updateTrack();


/* ===== 2) 리스트 클릭 → 왼쪽 내용 교체 (사진은 크로스페이드) ===== */
const items = document.querySelectorAll('.stores__item');
const view = document.querySelector('.stores__view');
const imgBox = view.querySelector('.stores__view-img');
const numEl = view.querySelector('.stores__num');
const nameEl = view.querySelector('.stores__name');
let token = 0;                                   // 빠르게 연속 클릭할 때 꼬이지 않게

items.forEach((item) => {
  item.addEventListener('click', () => {
    if (item.classList.contains('is-active')) return;

    // 활성 항목 교체
    items.forEach((el) => el.classList.remove('is-active'));
    item.classList.add('is-active');

    const { num, img, name } = item.dataset;

    // 글자는 바로 교체
    numEl.textContent = num;
    nameEl.textContent = name;

    // 사진은 크로스페이드
    const myToken = ++token;
    const newImg = new Image();
    newImg.alt = name;
    newImg.className = 'is-new';

    newImg.onload = () => {
      if (myToken !== token) return;             // 더 최근 클릭이 있으면 무시

      imgBox.appendChild(newImg);                // 기존 사진 위에 겹침
      newImg.getBoundingClientRect();            // 시작 상태 확정 (transition 작동용)
      newImg.classList.add('is-show');           // 서서히 나타남

      setTimeout(() => {                         // 전환이 끝나면 이전 사진 정리
        if (myToken !== token) return;
        imgBox.querySelectorAll('img').forEach((el) => {
          if (el !== newImg) el.remove();
        });
        newImg.classList.remove('is-new', 'is-show');
      }, 1400);                                   // CSS의 가장 긴 transition 시간(.8s)과 같게
    };

    newImg.src = img;
  });

});


// footer ==============================================================================================================
(() => {
  const images = document.querySelector('.brand-intro__images');
  const topBtn = document.querySelector('.footer__top-btn');

  // ===== 이미지 순차 등장 =====
  let observer = null;
  if (images) {
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);        // 한 번 실행하고 감시 종료
        }
      });
    }, {
      threshold: 0.25,
      rootMargin: '0px 0px -10% 0px',
    });
    observer.observe(images);
  }

  // ===== 맨 위로 버튼: 올라간 뒤 모션 초기화 =====
  if (topBtn) {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resetMotion() {
      if (!images) return;
      images.classList.remove('is-visible');       // 다시 재생 가능한 상태로 되돌림
      observer.observe(images);
    }

    function waitForTop(deadline) {
      if (window.scrollY <= 1) { resetMotion(); return; }
      if (performance.now() > deadline) return;
      requestAnimationFrame(() => waitForTop(deadline));
    }

    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      waitForTop(performance.now() + 5000);
    });
  }
})();

// ===================================================================================================================
(() => {
  document.querySelectorAll('.section_wrap').forEach((el) => {
    if (el.parentElement.classList.contains('hold')) return;   // 이미 감싸져 있으면 건너뜀
    const box = document.createElement('div');
    box.className = 'hold';
    el.parentNode.insertBefore(box, el);
    box.appendChild(el);
  });
})();

