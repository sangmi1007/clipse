/* 모바일 판별 (CSS의 768px과 같은 값) */
const isMob = () => matchMedia('(max-width: 768px)').matches;

/* ===== 햄버거 전체 메뉴 ===== */
(function () {
  const btn = document.getElementById('menuBtn');
  const x = document.getElementById('menuClose');
  const gnb = document.getElementById('gnb');
  if (!btn || !x || !gnb) return;

  const MORPH_MS = 400;
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
    x.classList.add('show');
    btn.style.visibility = 'hidden';
    x.tabIndex = 0;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      x.classList.add('is-x');
      gnb.classList.add('open');
    }));
    gnb.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
  }

  function close() {
    x.classList.remove('is-x');
    gnb.classList.remove('open');
    gnb.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    x.tabIndex = -1;
    clearTimeout(timer);
    timer = setTimeout(() => {
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
    e.stopImmediatePropagation();
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

/* ===== 헤더 로고를 메뉴의 SHOP 글씨 왼쪽 끝에 맞춤 (PC 전용) ===== */
(function () {
  const logo = document.getElementById('hdLogo') || document.querySelector('header img, header svg');
  const shop = document.querySelector('.gnb__col h2');
  if (!logo || !shop) return;

  function align() {
    logo.style.transform = 'none';
    if (isMob()) return;                                     // 모바일: 로고는 가운데 고정
    const shift = shop.getBoundingClientRect().left - logo.getBoundingClientRect().left;
    logo.style.transform = `translateX(${shift}px)`;
  }
  align();
  addEventListener('load', align);
  addEventListener('resize', align);
})();

/* ===== 로그인/쇼핑백 아이콘을 X(햄버거) 버튼 밑에 오른쪽 정렬 ===== */
(function () {
  const btn = document.getElementById('menuBtn');
  const inner = document.querySelector('.gnb__inner');
  const util = document.querySelector('.gnb__util');
  if (!btn || !inner || !util) return;

  const GAP = 28;

  function place() {
    const r = btn.getBoundingClientRect();
    const innerRight = inner.offsetLeft + inner.offsetWidth;
    util.style.top = (r.bottom + GAP) + 'px';
    util.style.right = (innerRight - r.right) + 'px';
  }
  place();
  addEventListener('load', place);
  addEventListener('resize', place);
  btn.addEventListener('click', place);
})();

// =============================================================================================

const $ = id => document.getElementById(id);
const R = document.documentElement;                    // 상태 클래스는 html에 붙임
const has = c => R.classList.contains(c);
R.classList.add('mg-page');

function syncHd() {
  const h = document.querySelector('header');
  if (h) R.style.setProperty('--hd', h.getBoundingClientRect().bottom + 'px');
}
syncHd();
addEventListener('load', syncHd);

const car = $('mgCar'), track = $('mgTrack'), wrap = $('mgWrap'), stick = $('mgStick');
const ov = $('mgOv'), ovTrack = $('mgOvTrack');

/* ---------- 매거진 데이터는 HTML(#mgData)에서 읽어옴 ---------- */
const mags = [...$('mgData').children];
const M = mags.length;
const N = M * Math.ceil(5 / M);
const coverSrc = m => m.querySelector('.mg-cover img').getAttribute('src');

/* ---------- 설정 ---------- */
const OFFSET_PC = 48, OFFSET_MO = 56;          // 슬라이드 양옆 이미지 위치(vw)
const SCALE_PC = [1, .5, .3];                  // 가운데 / 바로 옆 / 그 바깥 크기
const SCALE_MO = [1, .62, .3];
const STOP_R    = .94;
const GATE_PX   = 450;
const GATE_WAIT = 600;
const PUSH_MAX  = 40;
const BACK_PX   = 300;
const NEXT_MS   = 900;

let cur = 0, mi = 0, sx = null, moved = false;
let x = 0, S1 = 0, coverLeft = 0, anim = false, clk = false;
let gate = 'free', heldAt = 0, push = 0, pushShown = 0, lastWheel = 0, nxTxt = null;
const prev = new Array(N).fill(null);

/* ---------- 1) 슬라이드 ---------- */
const items = Array.from({ length: N }, (_, i) => {
  const el = document.createElement('div');
  el.className = 'mg-item';
  el.innerHTML = `<img src="${coverSrc(mags[i % M])}" alt="">`;
  el.onclick = () => {
    if (moved || has('mg-opening')) return;
    const p = pos(i);
    p === 0 ? openDetail(el) : go(p);
  };
  car.appendChild(el);
  return el;
});

function pos(i) {
  let p = (i - cur) % N;
  if (p > N / 2)  p -= N;
  if (p < -N / 2) p += N;
  return p;
}

function render() {
  const off = isMob() ? OFFSET_MO : OFFSET_PC;
  const sc = isMob() ? SCALE_MO : SCALE_PC;
  items.forEach((el, i) => {
    const p = pos(i), a = Math.abs(p);
    const jump = prev[i] !== null && Math.abs(p - prev[i]) > 2;
    if (jump) el.style.transition = 'none';

    el.style.transform = `translate(calc(-50% + ${p * off}vw), -50%) scale(${sc[Math.min(a, 2)]})`;
    el.style.opacity = a > 1 ? 0 : 1;
    el.style.zIndex = 10 - a;
    el.classList.toggle('is-center', p === 0);

    if (jump) { void el.offsetWidth; el.style.transition = ''; }
    prev[i] = p;
  });
}

function go(d) {
  if (has('mg-opening')) return;
  cur = ((cur + d) % N + N) % N;
  render();
}
render();
addEventListener('resize', render);

/* 드래그 / 스와이프 */
car.addEventListener('pointerdown', e => {
  sx = e.clientX;
  moved = false;
  car.style.cursor = 'grabbing';
});
addEventListener('pointermove', e => {
  if (sx !== null && Math.abs(e.clientX - sx) > 8) moved = true;
});
addEventListener('pointerup', e => {
  if (sx === null) return;
  const dx = e.clientX - sx;
  sx = null;
  car.style.cursor = '';
  if (dx < -50) go(1);
  else if (dx > 50) go(-1);
  setTimeout(() => (moved = false), 0);
});

/* 키보드 */
addEventListener('keydown', e => {
  if (has('mg-detail')) {
    if (e.key === 'Escape') closeDetail();
    return;
  }
  if (e.key === 'ArrowRight') go(1);
  if (e.key === 'ArrowLeft')  go(-1);
});

/* ---------- 2) 매거진 상세 ---------- */
const jumpTo = top => scrollTo({ top, left: 0, behavior: 'instant' });
const ease = c => c < .5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;

/* ===== 모바일: 세로 목록 ===== */
let mv = null;

function buildMobile(start) {
  if (!mv) {
    mv = document.createElement('div');
    mv.className = 'mv';
    mv.id = 'mgMob';
    $('mg').appendChild(mv);
    mv.addEventListener('click', e => {
      if (e.target.closest('.mv-top')) scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  mv.innerHTML = mags.map((_, k) => {
    const m = mags[(start + k) % M];
    const title = m.querySelector('.mg-head h2').textContent;
    const ps = [...m.querySelectorAll('.mg-head p')].map(p => p.innerHTML);
    const imgs = [...m.querySelectorAll('.mg-panels img')].map(i => i.getAttribute('src'));

    // 제목+첫 문단 → 이미지 → 다음 문단 → 이미지 … 순서로 쌓음
    let body = '';
    imgs.forEach((src, j) => {
      const t = (j === 0 ? `<h2>${title}</h2>` : '') + (ps[j] ? `<p>${ps[j]}</p>` : '');
      if (t) body += `<div class="mv-txt">${t}</div>`;
      body += `<img src="${src}" alt="" loading="lazy">`;
    });

    return `<section class="mv-mag">
      <div class="mv-label">
        <small>${k === 0 ? 'First Magazine' : 'Next Magazine'}</small>
        <b>${m.dataset.title}</b>
      </div>
      <div class="mv-cover"><img src="${coverSrc(m)}" alt=""></div>
      ${body}
    </section>`;
  }).join('') +
  `<div class="mv-up">
     <button type="button" class="mv-top" aria-label="맨 위로 이동"><img src="./images/footer/up.svg" alt="up"></button>
   </div>`;
}

/* ===== PC: 가로 스크롤 트랙 ===== */
function magHTML(idx) {
  const nxt = mags[(idx + 1) % M];
  const html = m => [...m.children].map(c => c.outerHTML).join('');
  return html(mags[idx]) +
    `<section class="mg-nx">
       <div class="mg-nx-txt">
         <small>Next Magazine</small>
         <b>${nxt.dataset.title}</b>
       </div>
     </section>` +
    html(nxt);
}

function stopX(root) {
  const nx = root.querySelector('.mg-nx');
  return Math.max(nx.offsetLeft + nx.offsetWidth - innerWidth * STOP_R, 0);
}

function resetGate(state) {
  gate = state;
  heldAt = performance.now();
  push = 0;
  pushShown = 0;
  clk = false;
}

function build(idx) {
  mi = idx;
  track.innerHTML = magHTML(idx);
  nxTxt = track.querySelector('.mg-nx-txt');
}

function measure() {
  syncHd();
  S1 = stopX(track);
  coverLeft = track.querySelector('.mg-nx').nextElementSibling.offsetLeft;
  const top = wrap.getBoundingClientRect().top + scrollY;
  wrap.style.height = Math.max(coverLeft + innerHeight + 2 - top, innerHeight) + 'px';
}
addEventListener('resize', () => {
  if (has('mg-detail') && !isMob() && track.querySelector('.mg-nx')) measure();
});

function openDetail(el) {
  if (isMob()) {                                   // 모바일: 바로 세로 목록으로
    R.classList.add('mg-detail');
    buildMobile(cur % M);
    jumpTo(0);
    return;
  }
  R.classList.add('mg-opening');
  el.style.transform = 'translate(0,0) scale(1)';
  setTimeout(() => {
    R.classList.add('mg-detail');
    build(cur % M);
    measure();
    jumpTo(0);
    x = 0;
    resetGate('free');
  }, 850);
}

function closeDetail() {
  anim = false;
  resetGate('free');
  ov.style.clipPath = '';
  ovTrack.innerHTML = '';
  R.classList.remove('mg-detail');
  jumpTo(0);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    R.classList.remove('mg-opening');
    render();
  }));
}
$('mgClose').onclick = closeDetail;

/* ---------- 다음 매거진 (PC) ---------- */
function advance() {
  if (clk || anim) return;
  clk = true;
  gate = 'go';
  const s0 = scrollY, s1 = coverLeft, t0 = performance.now();
  (function f(now) {
    if (!clk) return;
    const c = Math.min((now - t0) / NEXT_MS, 1);
    jumpTo(s0 + (s1 - s0) * ease(c));
    if (c < 1) requestAnimationFrame(f); else clk = false;
  })(t0);
}
track.addEventListener('click', e => { if (e.target.closest('.mg-nx, .mg-nx + .mg-cover')) advance(); });

function rebase() {
  const nx = x - coverLeft;
  cur = (cur + 1) % N;
  build((mi + 1) % M);
  measure();
  resetGate('free');
  x = nx;
  jumpTo(Math.max(nx, 0));
  track.style.transform = `translateX(${-x}px)`;
}

/* ---------- 이전 매거진 (PC: 맨 앞에서 위로 스크롤) ---------- */
function turnBack() {
  if (anim) return;
  anim = true;
  const to = (mi - 1 + M) % M;

  ovTrack.innerHTML = magHTML(to);
  ovTrack.style.transform = `translateX(${-stopX(ovTrack)}px)`;

  const t0 = performance.now();
  (function frame(now) {
    const c = Math.min((now - t0) / NEXT_MS, 1);
    ov.style.clipPath = `inset(0 0 0 ${(1 - ease(c)) * 100}%)`;
    if (c < 1) { requestAnimationFrame(frame); return; }

    cur = ((cur - 1) % N + N) % N;
    build(to);
    measure();
    x = S1;
    jumpTo(S1);
    resetGate('held');
    track.style.transform = `translateX(${-x}px)`;
    ov.style.clipPath = 'inset(0 100% 0 0)';
    ovTrack.innerHTML = '';
    anim = false;
  })(t0);
}

let pulled = 0, pullT;
function pull(d) {
  if (isMob() || anim || !has('mg-detail') || scrollY > 0) { pulled = 0; return; }
  pulled += d;
  clearTimeout(pullT);
  pullT = setTimeout(() => (pulled = 0), 400);
  if (pulled >= BACK_PX) { pulled = 0; turnBack(); }
}

function gather(d) {
  const now = performance.now();
  lastWheel = now;
  if (now - heldAt < GATE_WAIT) return;
  push = Math.max(push + d, 0);
  if (push >= GATE_PX) advance();
}

addEventListener('wheel', e => {
  if (isMob() || !has('mg-detail') || anim) return;
  if (gate === 'held' && e.deltaY > 0) {
    e.preventDefault();
    gather(e.deltaY);
    return;
  }
  if (e.deltaY < 0) {
    if (gate === 'held') push = Math.max(push + e.deltaY, 0);
    pull(-e.deltaY);
  } else {
    pulled = 0;
  }
}, { passive: false });

let ty = null;
addEventListener('touchstart', e => { ty = e.touches[0].clientY; }, { passive: true });
addEventListener('touchmove', e => {
  if (isMob()) return;                             // 모바일은 일반 세로 스크롤
  const y = e.touches[0].clientY;
  if (gate === 'held' && has('mg-detail') && y < ty) {
    e.preventDefault();
    gather(ty - y);
  } else if (y > ty) {
    pull(y - ty);
  }
  ty = y;
}, { passive: false });

/* ---------- 세로 스크롤 → 가로 이동 (PC) ---------- */
(function tick(now) {
  if (!isMob() && has('mg-detail') && !anim) {
    const sy = scrollY;

    if (gate === 'free') {
      if (S1 > 0 && sy >= S1 - .5) { jumpTo(S1); resetGate('held'); }
    } else if (gate === 'held') {
      if (sy > S1 + .5) jumpTo(S1);
      else if (sy < S1 - 40) resetGate('free');
      if (now - lastWheel > 700) push *= .9;
    } else if (gate === 'go' && !clk && sy < S1 - 40) {
      resetGate('free');
    }

    x += (Math.min(scrollY, coverLeft) - x) * .12;
    track.style.transform = `translateX(${-x}px)`;

    const target = gate === 'held' ? Math.min(push / GATE_PX, 1) : gate === 'go' ? 1 : 0;
    pushShown += (target - pushShown) * .2;
    if (nxTxt) nxTxt.style.transform = `translateX(${-pushShown * PUSH_MAX}px)`;

    if (coverLeft > 0 && x >= coverLeft - .5) rebase();
  }
  requestAnimationFrame(tick);
})(0);