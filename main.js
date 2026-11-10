/* =========================================================
   - 화면에 들어오면 글이 부드럽게 나타남
   - 영상은 화면에 보일 때만 재생, 벗어나면 멈춤
   - 영상 파일이 아직 없으면 미리보기 이미지(poster)가 그대로 보임
   ========================================================= */
(function () {
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); reveal.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal, .text, .label, .stat").forEach((el) => reveal.observe(el));

  const videos = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target;
      if (e.isIntersecting) v.play().catch(() => {});
      else v.pause();
    });
  }, { threshold: 0.25 });
  document.querySelectorAll("video").forEach((v) => { v.muted = true; videos.observe(v); });

  const toTop = document.getElementById("toTop");
  addEventListener("scroll", () => toTop.classList.toggle("show", scrollY > innerHeight * 0.8), { passive: true });
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
})();
