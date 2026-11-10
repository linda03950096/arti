/* =========================================================
   - 화면에 들어오면 글·이미지가 아래에서 부드럽게 올라옴
   - 그래프는 화면에 들어오면 축 → 곡선 → 영역 → 글자 순서로 그려짐
   - 숫자(4,600 / 29)는 0부터 올라가며 카운트
   - 위쪽 메뉴와 아래 가운데 표시가 지금 보고 있는 섹션을 알려줌
   - 영상은 화면에 보일 때만 재생, 벗어나면 멈춤
   ========================================================= */
(function () {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 숫자 카운트업
  function countUp(el) {
    const end = +el.dataset.count;
    if (reduce) return;
    const dur = 1600, t0 = performance.now();
    const fmt = (n) => n.toLocaleString("en-US");
    const tick = (t) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 4);
      el.textContent = fmt(Math.round(end * e));
      if (k < 1) requestAnimationFrame(tick);
    };
    el.textContent = "0";
    requestAnimationFrame(tick);
  }

  // 등장 애니메이션
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      e.target.querySelectorAll("[data-count]").forEach(countUp);
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
