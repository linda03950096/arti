/* =========================================================
   media 폴더의 1, 2, 3 … 번호 파일을 자동으로 찾아 순서대로 배치
   - 이미지: png jpg jpeg webp gif / 영상: mp4 webm mov
   - 01, 02 처럼 앞에 0을 붙여도 됨, 번호가 3개 연속 비면 끝으로 판단
   - 코드를 고칠 필요 없이 파일만 넣으면 됨
   ========================================================= */
(function () {
  const DIR = "media/";
  const IMG = ["png", "jpg", "jpeg", "webp", "gif"];
  const VID = ["mp4", "webm", "mov"];
  const EXTS = [...IMG, ...VID].flatMap((e) => [e, e.toUpperCase()]);
  const MAX_GAP = 3;

  const feed = document.getElementById("feed");
  const empty = document.getElementById("empty");
  const toTop = document.getElementById("toTop");

  // 파일 하나가 열리는지 확인 (이미지/영상)
  function probe(url) {
    return new Promise((resolve, reject) => {
      const isVid = /\.(mp4|webm|mov)$/i.test(url);
      const el = document.createElement(isVid ? "video" : "img");
      const done = (ok) => { el.onload = el.onerror = el.onloadedmetadata = null; ok ? resolve({ url, isVid }) : reject(); };
      if (isVid) { el.preload = "metadata"; el.muted = true; el.onloadedmetadata = () => done(true); }
      else el.onload = () => done(true);
      el.onerror = () => done(false);
      el.src = url;
    });
  }

  // 번호 n 에 해당하는 파일 찾기 (1.png, 01.jpg … 중 먼저 열리는 것)
  function find(n) {
    const names = [...new Set([String(n), String(n).padStart(2, "0")])];
    const urls = names.flatMap((b) => EXTS.map((e) => DIR + b + "." + e));
    return Promise.any(urls.map(probe)).catch(() => null);
  }

  function add(found) {
    const wrap = document.createElement("div");
    wrap.className = "item";
    let el;
    if (found.isVid) {
      el = document.createElement("video");
      el.muted = true;
      el.loop = true;
      el.playsInline = true;
      el.setAttribute("muted", "");
      el.setAttribute("playsinline", "");
      el.preload = "metadata";
    } else {
      el = document.createElement("img");
      el.alt = "";
      el.decoding = "async";
    }
    el.src = found.url;
    wrap.appendChild(el);
    feed.appendChild(wrap);
    io.observe(wrap);
  }

  // 화면에 들어오면 등장 + 영상 재생, 나가면 영상 정지
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target.querySelector("video");
      if (e.isIntersecting) {
        e.target.classList.add("in");
        if (v) v.play().catch(() => {});
      } else if (v) v.pause();
    });
  }, { threshold: 0.15 });

  // 1번부터 차례로 찾기
  (async () => {
    let n = 1, gap = 0, count = 0;
    while (gap < MAX_GAP) {
      const found = await find(n);
      if (found) { add(found); count++; gap = 0; } else gap++;
      n++;
    }
    empty.hidden = count > 0;
  })();

  // 맨 위로 버튼
  toTop.hidden = false;
  addEventListener("scroll", () => toTop.classList.toggle("show", scrollY > innerHeight * 0.8), { passive: true });
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
})();
