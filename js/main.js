// 온담 메인 시안 v1
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // GNB: 스크롤 시 배경
  var gnb = document.getElementById("gnb");
  function onScroll() {
    gnb.classList.toggle("is-solid", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // 히어로 슬라이드: 자동 전환(5초) + 좌우 스와이프/마우스 드래그 + 점 클릭 (온담 수정요청 10/2 ①④)
  var hero = document.getElementById("hero");
  var slides = document.querySelectorAll(".hero-slide");
  var dots = document.querySelectorAll(".hero-dots i");
  var cur = 0;
  if (hero && slides.length > 1) {
    var INTERVAL = 5000;
    var timer = null;

    function show(n) {
      n = (n + slides.length) % slides.length;
      if (n === cur) return;
      slides[cur].classList.remove("is-on");
      dots[cur].classList.remove("is-on");
      cur = n;
      slides[cur].classList.add("is-on");
      dots[cur].classList.add("is-on");
    }
    function play() {
      stop();
      timer = setInterval(function () { show(cur + 1); }, INTERVAL);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    // 점 클릭으로 해당 슬라이드 이동
    dots.forEach(function (d, i) {
      d.addEventListener("click", function () { show(i); play(); });
    });

    // 스와이프/드래그: 가로 이동 40px 이상이면 이전·다음 (세로 스크롤은 그대로 통과)
    var startX = 0, startY = 0, dragging = false, moved = false;
    function onDown(e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true; moved = false;
      startX = e.clientX; startY = e.clientY;
      stop();
    }
    function onMove(e) {
      if (!dragging) return;
      var dx = e.clientX - startX, dy = e.clientY - startY;
      if (!moved && Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        moved = true;
        hero.classList.add("is-dragging");
      }
    }
    function onUp(e) {
      if (!dragging) return;
      dragging = false;
      var dx = e.clientX - startX;
      if (moved && Math.abs(dx) >= 40) show(dx < 0 ? cur + 1 : cur - 1);
      hero.classList.remove("is-dragging");
      play();
    }
    hero.addEventListener("pointerdown", onDown);
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerup", onUp);
    hero.addEventListener("pointercancel", onUp);
    hero.addEventListener("pointerleave", function (e) { if (dragging) onUp(e); });
    // 드래그 중에는 링크 클릭이 따라오지 않도록
    hero.addEventListener("click", function (e) { if (hero.classList.contains("is-dragging") || moved) { e.preventDefault(); moved = false; } }, true);

    // 키보드: 히어로에 포커스된 상태에서 ←/→
    hero.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { show(cur + 1); play(); }
      if (e.key === "ArrowLeft") { show(cur - 1); play(); }
    });

    // 탭이 보이지 않을 때는 멈춤
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : play(); });
    play();
  }

  // 스크롤 리빌
  if (!reduced && "IntersectionObserver" in window) {
    // 화면에 들어오면 재생, 완전히 벗어나면 초기화(재진입 시 다시 재생)
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.intersectionRatio >= 0.12) {
          e.target.classList.add("is-in");
        } else if (!e.isIntersecting) {
          e.target.classList.remove("is-in");
        }
      });
    }, { threshold: [0, 0.12] });
    document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

})();

// 활동 사진 라이트박스
(function () {
  var box = document.getElementById("lightbox");
  if (!box) return;
  var img = document.getElementById("lightboxImg");
  var closeBtn = box.querySelector(".lightbox-close");
  var lastFocus = null;

  function open(src, label) {
    img.src = src;
    img.alt = label || "활동 사진 크게 보기";
    box.hidden = false;
    lastFocus = document.activeElement;
    closeBtn.focus();
    document.body.style.overflow = "hidden";
  }
  function close() {
    box.hidden = true;
    img.src = "";
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll(".moment").forEach(function (el) {
    el.addEventListener("click", function () { open(el.getAttribute("data-full"), el.getAttribute("aria-label")); });
    el.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(el.getAttribute("data-full"), el.getAttribute("aria-label")); }
    });
  });
  closeBtn.addEventListener("click", close);
  box.addEventListener("click", function (e) { if (e.target === box) close(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !box.hidden) close(); });
})();


// 모바일 햄버거 메뉴
(function () {
  var btn = document.getElementById("menuToggle");
  var drawer = document.getElementById("gnbDrawer");
  if (!btn || !drawer) return;
  btn.addEventListener("click", function () {
    var open = drawer.hidden;
    drawer.hidden = !open;
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    btn.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
  });
})();

// 교구·프로그램 분류 필터
(function () {
  var chips = document.querySelectorAll(".cat-chip");
  if (!chips.length) return;
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (cc) { cc.classList.remove("on"); });
      chip.classList.add("on");
      var cat = chip.getAttribute("data-cat");
      document.querySelectorAll(".pl-card").forEach(function (card) {
        card.hidden = (cat !== "전체" && card.getAttribute("data-cat") !== cat);
      });
    });
  });
})();

// 기관 문의: URL 파라미터로 문의 유형 미리 선택
(function () {
  var sel = document.getElementById("contactType");
  if (!sel) return;
  var t = new URLSearchParams(location.search).get("type");
  if (t && sel.querySelector('option[value="' + t + '"]')) sel.value = t;
  var form = document.getElementById("contactForm");
  form.addEventListener("submit", function (e) { e.preventDefault(); });
})();

// 온담 이야기: 서클 안 슬라이드 (4.5초 간격, 좌로 밀기)
(function () {
  var box = document.getElementById("storySlides");
  if (!box) return;
  var slides = [].slice.call(box.querySelectorAll(".story-slide"));
  if (slides.length < 2) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var i = 0;
  setInterval(function () {
    var cur = slides[i];
    var next = slides[(i + 1) % slides.length];
    // 다음 슬라이드를 오른쪽에 스냅(무전환)해 둔 뒤 함께 밀어 넣기
    next.style.transition = "none";
    next.style.transform = "translateX(100%)";
    next.getBoundingClientRect();
    next.style.transition = "";
    cur.classList.remove("is-cur");
    cur.style.transform = "translateX(-100%)";
    next.classList.add("is-cur");
    next.style.transform = "translateX(0)";
    i = (i + 1) % slides.length;
  }, 4500);
})();
