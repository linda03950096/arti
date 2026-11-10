/* =========================================================
   - 화면에 들어오면 글·이미지가 아래에서 부드럽게 올라옴
   - 그래프는 화면에 들어오면 축 → 곡선 → 영역 → 글자 순서로 그려짐
   - 숫자(4,600 / 29)는 화면에 들어오면 1부터 올라가며 카운트
   - 위쪽 메뉴와 아래 가운데 표시가 지금 보고 있는 섹션을 알려줌
   - 영상은 화면에 보일 때만 재생, 벗어나면 멈춤
   ========================================================= */
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 숫자 카운트업: 화면에 충분히 들어오면 1부터 목표 숫자까지 올라감
  const fmt = (n) => n.toLocaleString("en-US");
  function countUp(el) {
    const end = +el.dataset.count, start = 1, dur = 2200;
    let t0 = 0;
    const tick = (t) => {
      if (!t0) t0 = t;
      const k = Math.min(1, (t - t0) / dur);
      const e = k === 1 ? 1 : 1 - Math.pow(2, -10 * k); // 처음엔 빠르게, 끝에서 천천히 멈춤
      el.textContent = fmt(Math.round(start + (end - start) * e));
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  const counters = document.querySelectorAll("[data-count]");
  if (!reduce) {
    // 최종 숫자 너비를 미리 잡아둬서 옆의 '건+', '곳'이 흔들리지 않게 함
    const lock = () => counters.forEach((el) => {
      const now = el.textContent; el.style.minWidth = ""; el.textContent = fmt(+el.dataset.count);
      el.style.minWidth = el.getBoundingClientRect().width + "px"; el.textContent = now;
    });
    lock();
    addEventListener("resize", lock);
    if (document.fonts) document.fonts.ready.then(lock);
    counters.forEach((el) => { el.textContent = "1"; });
    const countIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        countIO.unobserve(e.target);
        setTimeout(() => countUp(e.target), 250);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => countIO.observe(el));
  }

  // 등장 애니메이션
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      reveal.unobserve(e.target);
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".reveal, .text, .label, .stat, .heading, .rise, .full, .graph").forEach((el) => reveal.observe(el));

  // 영상: 보일 때만 재생
  const videos = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
  }, { threshold: 0.25 });
  document.querySelectorAll("video").forEach((v) => { v.muted = true; videos.observe(v); });

  // 지금 보고 있는 섹션 (위쪽 메뉴 + 아래 가운데 표시)
  const marks = [...document.querySelectorAll("[data-section]")];
  const navLinks = [...document.querySelectorAll(".nav a")];
  const chapter = document.getElementById("chapter");
  const chapterBox = chapter.parentElement;
  const header = document.querySelector(".site-header");
  const toTop = document.getElementById("toTop");
  let current = "", lastY = scrollY, ticking = false;

  function update() {
    ticking = false;
    const y = scrollY, mid = innerHeight * 0.5;
    let name = marks[0].dataset.section, id = "";
    for (const m of marks) {
      if (m.getBoundingClientRect().top <= mid) { name = m.dataset.section; id = m.id; } else break;
    }
    if (name !== current) {
      current = name;
      chapter.classList.add("swap");
      setTimeout(() => { chapter.textContent = name; chapter.classList.remove("swap"); }, 200);
      navLinks.forEach((a) => a.classList.toggle("on", id !== "" && a.getAttribute("href") === "#" + id));
    }
    // 페이지 끝에 닿으면 아래 표시 숨김
    chapterBox.classList.toggle("hide", y + innerHeight > document.documentElement.scrollHeight - 40);
    // 아래로 내릴 땐 상단 바 숨기고, 위로 올리면 다시 보임
    header.classList.toggle("hide", y > lastY && y > 200);
    lastY = y;
    toTop.classList.toggle("show", y > innerHeight * 0.8);
  }
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener("resize", update);
  update();

  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));
})();
