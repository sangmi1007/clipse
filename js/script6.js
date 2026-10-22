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

// 
const $ = id => document.getElementById(id);
const car = $('car'), track = $('track'), wrap = $('wrap'), stick = $('stick');
const ov = $('ov'), ovTrack = $('ovTrack'), B = document.body;

/* ---------- 매거진 데이터는 HTML(#mags)에서 읽어옴 ---------- */
const mags = [...$('mags').children];
const M = mags.length;
const N = M * Math.ceil(5 / M);      // 슬라이드는 최소 5칸 이상이 되도록 반복
const coverSrc = m => m.querySelector('.cover img').getAttribute('src');

/* ---------- 설정 ---------- */
const OFFSET    = 48;                // 슬라이드 양옆 이미지 위치(vw) — 클수록 더 많이 잘림
const SCALE     = [1, .5, .3];       // 가운데 / 바로 옆 / 그 바깥 크기
const STOP_R    = .94;               // 멈췄을 때 Next Magazine 글씨 오른쪽 끝 위치 (화면 너비 비율)
const GATE_PX   = 450;               // 걸린 상태에서 넘어가려면 더 굴려야 하는 양 (클수록 단단하게 걸림)
const GATE_WAIT = 600;               // 도착 직후 이 시간(ms) 동안은 스크롤을 무시 (관성으로 지나치는 것 방지)
const PUSH_MAX  = 40;                // 굴릴 때 글씨가 왼쪽으로 밀리는 최대 거리(px)
const BACK_PX   = 300;               // 맨 앞에서 위로 이만큼 스크롤하면 이전 매거진
const NEXT_MS   = 900;               // 다음 매거진으로 넘어가는 시간(ms)

let cur = 0, mi = 0, sx = null, moved = false;
let x = 0, S1 = 0, coverLeft = 0, anim = false, clk = false;
let gate = 'free', heldAt = 0, push = 0, pushShown = 0, lastWheel = 0, nxTxt = null;
const prev = new Array(N).fill(null);

/* ---------- 1) 슬라이드 ---------- */
const items = Array.from({ length: N }, (_, i) => {
  const el = document.createElement('div');
  el.className = 'item';
  el.innerHTML = `<img src="${coverSrc(mags[i % M])}" alt="">`;
  el.onclick = () => {
    if (moved || B.classList.contains('opening')) return;
    const p = pos(i);
    p === 0 ? openDetail(el) : go(p);      // 가운데면 상세로, 옆이면 가운데로
  };
  car.appendChild(el);
  return el;
});

function pos(i) {                          // 현재 기준 상대 위치 (순환)
  let p = (i - cur) % N;
  if (p > N / 2)  p -= N;
  if (p < -N / 2) p += N;
  return p;
}

function render() {
  items.forEach((el, i) => {
    const p = pos(i), a = Math.abs(p);
    // 맨 왼쪽 → 맨 오른쪽으로 갈 때는 투명한 상태에서 순간이동
    const jump = prev[i] !== null && Math.abs(p - prev[i]) > 2;
    if (jump) el.style.transition = 'none';

    el.style.transform = `translate(calc(-50% + ${p * OFFSET}vw), -50%) scale(${SCALE[Math.min(a, 2)]})`;
    el.style.opacity = a > 1 ? 0 : 1;
    el.style.zIndex = 10 - a;
    el.classList.toggle('center', p === 0);

    if (jump) { void el.offsetWidth; el.style.transition = ''; }
    prev[i] = p;
  });
}

function go(d) {
  if (B.classList.contains('opening')) return;
  cur = ((cur + d) % N + N) % N;
  render();
}
render();

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
  if (dx < -50) go(1);          // 오른쪽 → 왼쪽으로 밀기
  else if (dx > 50) go(-1);
  setTimeout(() => (moved = false), 0);
});

/* 키보드 */
addEventListener('keydown', e => {
  if (B.classList.contains('detail')) {
    if (e.key === 'Escape') closeDetail();
    return;
  }
  if (e.key === 'ArrowRight') go(1);
  if (e.key === 'ArrowLeft')  go(-1);
});

/* ---------- 2) 매거진 상세 ---------- */
const jumpTo = top => scrollTo({ top, left: 0, behavior: 'instant' });  // 사이트에 smooth scroll이 있어도 즉시 이동
const ease = c => c < .5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;   // 천천히 → 빠르게 → 천천히

/* 트랙 = 이 매거진 내용 + Next Magazine 글씨 + 다음 매거진 내용(썸네일부터 이어서) */
function magHTML(idx) {
  const nxt = mags[(idx + 1) % M];
  const html = m => [...m.children].map(c => c.outerHTML).join('');
  return html(mags[idx]) +
    `<section class="nx">
       <div class="nx-txt">
         <small>Next Magazine</small>
         <b>${nxt.dataset.title}</b>
       </div>
     </section>` +
    html(nxt);
}

/* 'Next Magazine' 글씨가 화면 오른쪽에 멈추는 위치 (트랙 기준 x) */
function stopX(root) {
  const nx = root.querySelector('.nx');
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
  nxTxt = track.querySelector('.nx-txt');
}

function measure() {
  S1 = stopX(track);                                                      // 여기서 걸림
  coverLeft = track.querySelector('.nx').nextElementSibling.offsetLeft;   // 다음 매거진 썸네일이 왼쪽 끝에 오는 위치
  wrap.style.height = (coverLeft + innerHeight + 2) + 'px';
}
addEventListener('resize', () => B.classList.contains('detail') && measure());

function openDetail(el) {
  B.classList.add('opening');                      // 옆 이미지 사라지고 가운데가 커버 자리로 이동
  el.style.transform = 'translate(0,0) scale(1)';
  setTimeout(() => {
    B.classList.add('detail');                     // 화면을 먼저 보이게 한 뒤
    build(cur % M);                                // 내용을 만들어야 길이가 정확히 계산됨
    measure();
    jumpTo(0);
    x = 0;
    resetGate('free');
  }, 850);                                         // CSS 애니메이션(.8s)이 끝난 뒤 교체
}

function closeDetail() {
  anim = false;
  resetGate('free');
  ov.style.clipPath = '';
  ovTrack.innerHTML = '';
  B.classList.remove('detail');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    B.classList.remove('opening');
    render();
  }));
}
$('close').onclick = closeDetail;

/* ---------- 다음 매거진 ---------- */
/* 걸린 곳에서 썸네일이 왼쪽 끝에 올 때까지 자동으로 스크롤 */
function advance() {
  if (clk || anim) return;
  clk = true;
  gate = 'go';
  const s0 = scrollY, s1 = coverLeft, t0 = performance.now();
  (function f(now) {
    if (!clk) return;                              // 도중에 매거진이 바뀌면 중단
    const c = Math.min((now - t0) / NEXT_MS, 1);
    jumpTo(s0 + (s1 - s0) * ease(c));
    if (c < 1) requestAnimationFrame(f); else clk = false;
  })(t0);
}
/* Next Magazine 글씨나 다음 썸네일을 클릭해도 넘어감 */
track.addEventListener('click', e => { if (e.target.closest('.nx, .nx + .cover')) advance(); });

/* 썸네일이 왼쪽 끝에 도착하면, 그 매거진을 기준으로 트랙을 다시 구성 (화면은 그대로) */
function rebase() {
  const nx = x - coverLeft;
  cur = (cur + 1) % N;                             // 닫았을 때 슬라이드도 다음 매거진이 가운데 오도록
  build((mi + 1) % M);
  measure();
  resetGate('free');
  x = nx;
  jumpTo(Math.max(nx, 0));
  track.style.transform = `translateX(${-x}px)`;
}

/* ---------- 이전 매거진 (맨 앞에서 위로 스크롤) ----------
   이전 매거진이 오른쪽 → 왼쪽으로 펼쳐지며 덮음 */
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

    // 덮개와 똑같은 화면을 실제 트랙으로 교체 (끊김 없음)
    cur = ((cur - 1) % N + N) % N;
    build(to);
    measure();
    x = S1;
    jumpTo(S1);
    resetGate('held');                             // 이전 매거진은 걸린 위치에서 시작
    track.style.transform = `translateX(${-x}px)`;
    ov.style.clipPath = 'inset(0 100% 0 0)';
    ovTrack.innerHTML = '';
    anim = false;
  })(t0);
}

let pulled = 0, pullT;
function pull(d) {
  if (anim || !B.classList.contains('detail') || scrollY > 0) { pulled = 0; return; }
  pulled += d;
  clearTimeout(pullT);
  pullT = setTimeout(() => (pulled = 0), 400);
  if (pulled >= BACK_PX) { pulled = 0; turnBack(); }
}

/* ---------- 걸린 상태에서 스크롤 입력 모으기 ---------- */
function gather(d) {
  const now = performance.now();
  lastWheel = now;
  if (now - heldAt < GATE_WAIT) return;            // 도착 직후엔 무시
  push = Math.max(push + d, 0);
  if (push >= GATE_PX) advance();
}

addEventListener('wheel', e => {
  if (!B.classList.contains('detail') || anim) return;
  if (gate === 'held' && e.deltaY > 0) {           // 걸린 상태: 화면은 멈추고 입력만 모음
    e.preventDefault();
    gather(e.deltaY);
    return;
  }
  if (e.deltaY < 0) {
    if (gate === 'held') push = Math.max(push + e.deltaY, 0);   // 위로 굴리면 되돌아감
    pull(-e.deltaY);
  } else {
    pulled = 0;
  }
}, { passive: false });

let ty = null;                                     // 터치(모바일)
addEventListener('touchstart', e => { ty = e.touches[0].clientY; }, { passive: true });
addEventListener('touchmove', e => {
  const y = e.touches[0].clientY;
  if (gate === 'held' && B.classList.contains('detail') && y < ty) {
    e.preventDefault();
    gather(ty - y);
  } else if (y > ty) {
    pull(y - ty);
  }
  ty = y;
}, { passive: false });

/* ---------- 세로 스크롤 → 가로 이동 ---------- */
(function tick(now) {
  if (B.classList.contains('detail') && !anim) {
    const sy = scrollY;

    // 걸림 상태 관리
    if (gate === 'free') {
      if (S1 > 0 && sy >= S1 - .5) { jumpTo(S1); resetGate('held'); }       // 도착 → 걸림
    } else if (gate === 'held') {
      if (sy > S1 + .5) jumpTo(S1);                                          // 스크롤바/키보드로 넘기는 것도 막음
      else if (sy < S1 - 40) resetGate('free');                              // 위로 되돌아가면 해제
      if (now - lastWheel > 700) push *= .9;                                 // 멈추면 글씨가 제자리로
    } else if (gate === 'go' && !clk && sy < S1 - 40) {
      resetGate('free');
    }

    x += (Math.min(scrollY, coverLeft) - x) * .12;  // 부드럽게 따라옴 (숫자가 작을수록 느긋)
    track.style.transform = `translateX(${-x}px)`;

    // 글씨가 왼쪽으로 밀리는 효과 (걸려 있을 때만, 넘어가는 중에는 유지)
    const target = gate === 'held' ? Math.min(push / GATE_PX, 1) : gate === 'go' ? 1 : 0;
    pushShown += (target - pushShown) * .2;
    if (nxTxt) nxTxt.style.transform = `translateX(${-pushShown * PUSH_MAX}px)`;

    if (coverLeft > 0 && x >= coverLeft - .5) rebase();
  }
  requestAnimationFrame(tick);
})(0);