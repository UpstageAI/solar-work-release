// 다운로드 링크: 방문자 OS 감지 + 최신 릴리스 자산 연결
(function () {
  var REPO = "UpstageAI/solar-work-release";
  var ua = navigator.userAgent;
  var os = /Mac/i.test(ua) && !/iPhone|iPad/i.test(ua) ? "mac" : /Win/i.test(ua) ? "win" : /Linux|X11/i.test(ua) && !/Android/i.test(ua) ? "linux" : null;
  var names = { mac: "macOS", win: "Windows", linux: "Linux" };

  if (os) {
    var card = document.querySelector('.dl[data-os="' + os + '"]');
    if (card) card.classList.add("me");
    var lbl = document.getElementById("hero-dl-label");
    if (lbl) lbl.textContent = names[os] + "용 다운로드";
  }

  if (!document.querySelector("[data-asset]")) return;

  // 모든 릴리스가 prerelease(rc)일 수 있어 /releases/latest 대신 목록의 첫 항목(최신)을 쓴다.
  fetch("https://api.github.com/repos/" + REPO + "/releases?per_page=10")
    .then(function (r) { return r.ok ? r.json() : []; })
    .then(function (list) {
      var rel = (list || []).filter(function (x) { return !x.draft && x.assets && x.assets.length; })[0];
      if (!rel) return;
      var ver = rel.tag_name.replace(/^v/, "");
      document.querySelectorAll(".ver-label").forEach(function (el) { el.textContent = "v" + ver; });
      var d = new Date(rel.published_at);
      var dateEl = document.getElementById("rel-date");
      if (dateEl && !isNaN(d)) dateEl.textContent = d.toLocaleDateString("ko-KR") + " 배포";

      function find(suffix) {
        return rel.assets.filter(function (a) { return a.name.slice(-suffix.length) === suffix; })[0];
      }
      document.querySelectorAll("[data-asset]").forEach(function (a) {
        var asset = find(a.getAttribute("data-asset"));
        if (!asset) return;
        a.href = asset.browser_download_url;
        var mb = (asset.size / 1048576).toFixed(0);
        var s = a.querySelector("small");
        if (s) s.textContent += " · " + mb + " MB";
      });
      var sums = find("SHA256SUMS");
      if (sums) document.getElementById("sums").href = sums.browser_download_url;

      if (os && document.getElementById("hero-dl")) {
        var primary = document.querySelector('.dl[data-os="' + os + '"] [data-asset]');
        if (primary && primary.href.indexOf("/download/") > -1) {
          document.getElementById("hero-dl").href = primary.href;
          document.getElementById("hero-meta").textContent = names[os] + " · v" + ver;
        }
      }
    })
    .catch(function () {});
})();

// 모션: 스크롤 등장 + 앱 화면 예시 재생
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // 스크롤하면 카드가 차례로 나타난다
  if ("IntersectionObserver" in window) {
    var els = document.querySelectorAll(".card, .step, .dl, .need, .scene, .ctl, .ad, .biz");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -60px 0px" });
    els.forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = (i % 3) * 90 + "ms";
      io.observe(el);
    });
  }

  // 앱 화면 예시: 작업 시나리오를 순서대로 재생한다
  var SCENES = window.SW_SCENES || [];
  var main = document.getElementById("win-main");
  var side = document.getElementById("win-side");
  if (!main || !side || !SCENES.length) return;
  var tabs = side.querySelectorAll("span");

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text) n.textContent = text;
    return n;
  }
  async function type(node, text, speed) {
    node.classList.add("caret");
    for (var i = 1; i <= text.length; i++) {
      node.textContent = text.slice(0, i);
      await wait(speed);
    }
    node.classList.remove("caret");
  }

  async function play(scene, idx) {
    tabs.forEach(function (t, i) { t.classList.toggle("on", i === idx); });
    main.innerHTML = "";
    main.classList.remove("fade");

    var user = el("div", "msg-user fadein");
    main.appendChild(user);
    await type(user, scene.ask, 38);
    await wait(500);

    var ai = el("div", "msg-ai");
    main.appendChild(ai);
    for (var i = 0; i < scene.tools.length; i++) {
      var t = el("span", "tool run fadein", scene.tools[i]);
      ai.appendChild(t);
      await wait(1100);
      t.classList.remove("run");
    }
    var p = el("p");
    p.style.margin = "10px 0 0";
    ai.appendChild(p);
    await type(p, scene.answer, 16);
    await wait(300);

    if (scene.out) {
      var card = el("div", "artifact pop");
      card.appendChild(el("div", "ic"));
      var txt = el("div");
      txt.appendChild(el("b", "", scene.out[0]));
      txt.appendChild(el("small", "", scene.out[1]));
      card.appendChild(txt);
      main.appendChild(card);
    }

    if (scene.approve) {
      await wait(900);
      var ap = el("div", "approve pop");
      var label = el("span");
      label.appendChild(el("b", "", scene.approve));
      var state = document.createTextNode(" · 담당자 승인 대기");
      label.appendChild(state);
      var btns = el("span", "ap-btns");
      btns.appendChild(el("i", "", "거절"));
      var ok = el("i", "ok", "승인");
      btns.appendChild(ok);
      ap.appendChild(label); ap.appendChild(btns);
      main.appendChild(ap);
      await wait(1800);
      ok.classList.add("pressed");
      await wait(300);
      ap.classList.add("done");
      state.textContent = " · 담당자가 승인함";
      btns.remove();
    }

    await wait(3800);
    main.classList.add("fade");
    await wait(400);
  }

  var started = false;
  async function loop() {
    for (var i = 0; ; i = (i + 1) % SCENES.length) {
      while (document.hidden) await wait(500);
      await play(SCENES[i], i);
    }
  }
  var hero = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !started) { started = true; hero.disconnect(); loop(); }
  });
  hero.observe(main);
})();
