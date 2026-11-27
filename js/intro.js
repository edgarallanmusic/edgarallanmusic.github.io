/* Home-page raven intro, once per tab session.
   The eye is the amber center measured on intro-last.jpg:
   landscape 1280×720 at (683, 243). The square film is that frame
   center-cropped to 720×720, so its eye is (403, 243). */
(function () {
  var root = document.documentElement;
  if (!root.classList.contains("intro-pending")) return;

  var EYE_WIDE = { x: 683 / 1280, y: 243 / 720, w: 1280, h: 720 };
  var EYE_SQUARE = { x: 403 / 720, y: 243 / 720, w: 720, h: 720 };
  var overlay = document.getElementById("intro");
  var poster = document.getElementById("intro-poster");
  var video = document.getElementById("intro-video");
  var enter = document.getElementById("intro-enter");
  var skip = document.getElementById("intro-skip");
  if (!overlay || !poster || !video || !enter || !skip) return;

  var reduce = false;
  try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
  catch (e) {}

  var leaving = false;
  var portrait = false;
  var warmed = new Image();
  warmed.src = "assets/intro/intro-last.jpg";

  poster.src = "assets/intro/intro-poster.jpg";
  function reveal() { root.classList.add("intro-live"); }
  if (poster.complete && poster.naturalWidth) reveal();
  else poster.addEventListener("load", reveal, { once: true });

  enter.addEventListener("click", play);
  skip.addEventListener("click", function () { finish(true); });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && root.classList.contains("intro-pending")) finish(true);
  });
  video.addEventListener("ended", function () { finish(false); });
  video.addEventListener("playing", onPlaying);

  function webmOrMp4() {
    var support = "";
    try { support = video.canPlayType('video/webm; codecs="vp9, opus"'); }
    catch (e) {}
    if (support === "probably") return "assets/intro/intro.webm";
    return "assets/intro/intro.mp4";
  }

  function play() {
    if (leaving || video.getAttribute("src")) return;
    try { portrait = window.matchMedia("(orientation: portrait)").matches; }
    catch (e) { portrait = window.innerHeight > window.innerWidth; }
    video.playsInline = true;
    video.muted = false;
    video.volume = 1;
    video.preload = "auto";
    video.src = portrait ? "assets/intro/intro-square.mp4" : webmOrMp4();
    enter.hidden = true;
    var started = video.play();
    if (started && typeof started.catch === "function") {
      started.catch(function () {
        if (leaving) return;
        enter.hidden = false;
        video.removeAttribute("src");
        try { video.load(); } catch (err) {}
      });
    }
  }

  function onPlaying() {
    video.classList.add("is-on");
    tick();
  }

  function tick() {
    if (leaving) return;
    if (video.currentTime >= 6.2 || video.ended) {
      finish(false);
      return;
    }
    window.requestAnimationFrame(tick);
  }

  function coverOrigin(el, eye) {
    var rect = el.getBoundingClientRect();
    var fit = Math.max(rect.width / eye.w, rect.height / eye.h);
    var drawnW = eye.w * fit;
    var drawnH = eye.h * fit;
    return {
      x: (rect.width - drawnW) / 2 + eye.x * drawnW,
      y: (rect.height - drawnH) / 2 + eye.y * drawnH
    };
  }

  function runZoom(el, eye, quick) {
    var origin = coverOrigin(el, eye);
    var ms = quick ? 340 : 920;
    var scale = quick ? 6 : 9;
    el.style.transformOrigin = origin.x + "px " + origin.y + "px";
    el.style.transition = "transform " + ms + "ms cubic-bezier(0.22, 0.61, 0.36, 1)";
    overlay.style.transition = "opacity " + ms + "ms ease";
    window.requestAnimationFrame(function () {
      el.style.transform = "scale(" + scale + ")";
      overlay.style.opacity = "0";
    });
    window.setTimeout(done, ms + 50);
  }

  function finish(quick) {
    if (leaving) return;
    leaving = true;
    enter.hidden = true;
    skip.hidden = true;
    if (quick || reduce) {
      try { video.pause(); } catch (e) {}
    }
    if (reduce) {
      overlay.style.transition = "opacity 280ms linear";
      overlay.style.opacity = "0";
      window.setTimeout(done, 320);
      return;
    }
    if (!quick && video.readyState >= 2 && video.currentTime >= 5.5) {
      video.classList.add("is-on");
      runZoom(video, portrait ? EYE_SQUARE : EYE_WIDE, false);
      return;
    }
    poster.hidden = false;
    video.classList.remove("is-on");
    var start = function () { runZoom(poster, EYE_WIDE, true); };
    if (poster.getAttribute("src") === "assets/intro/intro-last.jpg" && poster.complete && poster.naturalWidth) {
      start();
      return;
    }
    poster.addEventListener("load", start, { once: true });
    poster.src = "assets/intro/intro-last.jpg";
  }

  function done() {
    try { sessionStorage.setItem("eam-intro", "1"); }
    catch (e) {}
    try { video.pause(); } catch (e) {}
    video.removeAttribute("src");
    try { video.load(); } catch (e) {}
    root.classList.remove("intro-pending", "intro-live");
    if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
  }
})();
