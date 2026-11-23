/* Corvin visits the margins.
   The caw is synthesized here with the Web Audio API.
   It is original to this site: no recording and no third-party sample. */
(function () {
  "use strict";

  var script = document.currentScript;
  if (!script || !document.body || document.getElementById("corvin")) return;
  var rootUrl = new URL("../", script.src);

  function asset(name) {
    return new URL("assets/corvin/" + name, rootUrl).href;
  }

  var reduce = false;
  try {
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  var enabled = true;
  try {
    if (localStorage.getItem("eam-corvin") === "0") enabled = false;
  } catch (e) {}

  var poses = {
    profile: asset("profile.webp"),
    front: asset("front.webp"),
    caw: asset("caw.webp"),
    wings: asset("wings.webp")
  };

  Object.keys(poses).forEach(function (key) {
    var preload = new Image();
    preload.src = poses[key];
  });

  var host = document.createElement("div");
  host.id = "corvin";
  host.className = "corvin";
  host.hidden = true;
  host.innerHTML =
    '<button type="button" class="corvin-bird" aria-label="Corvin">' +
      '<img alt="" aria-hidden="true" width="240" height="160">' +
    "</button>" +
    '<button type="button" class="corvin-close" aria-label="Send Corvin away">×</button>';
  document.body.appendChild(host);

  var bird = host.querySelector(".corvin-bird");
  var img = host.querySelector("img");
  var closeBtn = host.querySelector(".corvin-close");

  var restore = document.createElement("button");
  restore.type = "button";
  restore.className = "corvin-restore";
  restore.setAttribute("aria-label", "Call Corvin back");
  restore.innerHTML = '<img alt="" aria-hidden="true" width="28" height="28" src="' + poses.profile + '">';
  var footer = document.querySelector(".site-footer");
  if (footer) footer.appendChild(restore);
  else {
    restore.classList.add("is-fixed");
    document.body.appendChild(restore);
  }

  var state = "away";
  var clicks = [];
  var leaveTimer = 0;
  var awayTimer = 0;
  var cawTimer = 0;
  var turnTimer = 0;
  var audioCtx = null;
  var noiseBuffer = null;

  function remember(value) {
    try { localStorage.setItem("eam-corvin", value); } catch (e) {}
  }

  function setPose(name) {
    if (img.getAttribute("data-pose") === name) return;
    img.setAttribute("data-pose", name);
    img.src = poses[name];
  }

  function showRestore(on) {
    restore.hidden = !on;
  }

  function modalOpen() {
    var list = document.getElementById("tracklist");
    return !!(list && !list.hidden);
  }

  function place() {
    var viz = document.getElementById("c");
    var spots = [];
    var header = document.querySelector(".site-header");
    if (header && !viz) {
      var under = Math.max(4, header.getBoundingClientRect().bottom - 8);
      spots.push({ top: under, x: 0.06 });
      spots.push({ top: under, x: 0.7 });
    }
    if (viz) {
      spots.push({ top: 58, x: 0.0 });
      spots.push({ top: Math.min(window.innerHeight * 0.36, 240), x: 0.72 });
    } else {
      var cards = [];
      var nodes = document.querySelectorAll(".card");
      for (var i = 0; i < nodes.length; i++) {
        var rect = nodes[i].getBoundingClientRect();
        if (rect.top > 80 && rect.bottom < window.innerHeight - 20 && rect.width > 100) cards.push(rect);
      }
      if (cards.length) {
        var card = cards[Math.floor(Math.random() * cards.length)];
        spots.push({ top: Math.max(8, card.top - 6), x: card.left / window.innerWidth });
      }
      spots.push({ bottom: 16, x: 0.04 });
      spots.push({ bottom: 16, x: 0.76 });
    }
    var spot = spots[Math.floor(Math.random() * spots.length)];
    host.style.top = spot.top != null ? Math.round(spot.top) + "px" : "auto";
    host.style.bottom = spot.bottom != null ? Math.round(spot.bottom) + "px" : "auto";
    var width = window.innerWidth || 360;
    var birdW = reduce ? 90 : (width < 700 ? 90 : 160);
    var left = Math.round(spot.x * (width - birdW));
    if (left < 6) left = 6;
    if (left > width - birdW - 6) left = Math.max(6, width - birdW - 6);
    host.style.left = left + "px";
  }

  function appear() {
    if (!enabled || modalOpen()) {
      scheduleAppear(4000);
      return;
    }
    place();
    setPose("profile");
    host.hidden = false;
    host.classList.remove("is-out");
    host.classList.add("is-in");
    if (!reduce) host.classList.add("is-idle");
    state = "perched";
    showRestore(false);
    clearTimeout(leaveTimer);
    leaveTimer = setTimeout(leave, 14000 + Math.random() * 8000);
  }

  function leave() {
    if (state !== "perched" && state !== "caw") return;
    state = "leaving";
    clearTimeout(cawTimer);
    host.classList.remove("is-idle", "is-in", "is-hop");
    setPose("wings");
    if (reduce) {
      host.hidden = true;
      state = "away";
      scheduleAppear(22000 + Math.random() * 12000);
      return;
    }
    var dir = host.classList.contains("is-flip") ? 1 : -1;
    host.style.setProperty("--fly", (dir * 110) + "px");
    host.classList.add("is-out");
    setTimeout(function () {
      if (state !== "leaving") return;
      host.hidden = true;
      host.classList.remove("is-out");
      state = "away";
      scheduleAppear(18000 + Math.random() * 14000);
    }, 680);
  }

  function look(clientX, clientY) {
    if (state !== "perched") return;
    var rect = host.getBoundingClientRect();
    var dx = clientX - (rect.left + rect.width / 2);
    var dist = Math.abs(dx);
    host.classList.toggle("is-flip", dx > 30);
    setPose(dist < 170 ? "front" : "profile");
  }

  function cawSound() {
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === "suspended") audioCtx.resume();
    var rate = audioCtx.sampleRate;
    if (!noiseBuffer) {
      noiseBuffer = audioCtx.createBuffer(1, Math.floor(rate * 0.3), rate);
      var data = noiseBuffer.getChannelData(0);
      for (var i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    }
    var t = audioCtx.currentTime;
    var filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 7;
    filter.frequency.setValueAtTime(1500, t);
    filter.frequency.exponentialRampToValueAtTime(480, t + 0.22);
    var osc = audioCtx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(720, t);
    osc.frequency.exponentialRampToValueAtTime(260, t + 0.2);
    var oscGain = audioCtx.createGain();
    oscGain.gain.value = 0.22;
    var noise = audioCtx.createBufferSource();
    noise.buffer = noiseBuffer;
    var noiseGain = audioCtx.createGain();
    noiseGain.gain.value = 0.55;
    var out = audioCtx.createGain();
    out.gain.setValueAtTime(0.0001, t);
    out.gain.exponentialRampToValueAtTime(0.4, t + 0.018);
    out.gain.exponentialRampToValueAtTime(0.0001, t + 0.26);
    osc.connect(oscGain);
    oscGain.connect(filter);
    noise.connect(noiseGain);
    noiseGain.connect(filter);
    filter.connect(out);
    out.connect(audioCtx.destination);
    osc.start(t);
    noise.start(t);
    osc.stop(t + 0.28);
    noise.stop(t + 0.28);
  }

  bird.addEventListener("click", function (event) {
    event.stopPropagation();
    if (state !== "perched" && state !== "caw") return;
    var now = Date.now();
    clicks = clicks.filter(function (stamp) { return now - stamp < 2600; });
    clicks.push(now);
    cawSound();
    if (clicks.length >= 3) {
      clicks = [];
      leave();
      return;
    }
    state = "caw";
    setPose("caw");
    clearTimeout(leaveTimer);
    clearTimeout(cawTimer);
    cawTimer = setTimeout(function () {
      if (state !== "caw") return;
      state = "perched";
      setPose("profile");
      if (!reduce) host.classList.add("is-idle");
      leaveTimer = setTimeout(leave, 8000 + Math.random() * 7000);
    }, 680);
  });

  closeBtn.addEventListener("click", function (event) {
    event.preventDefault();
    event.stopPropagation();
    enabled = false;
    remember("0");
    clearTimeout(leaveTimer);
    clearTimeout(awayTimer);
    clearTimeout(cawTimer);
    host.hidden = true;
    host.classList.remove("is-in", "is-out", "is-idle", "is-hop");
    state = "gone";
    showRestore(true);
  });

  restore.addEventListener("click", function () {
    enabled = true;
    remember("1");
    showRestore(false);
    state = "away";
    scheduleAppear(500);
  });

  window.addEventListener("pointermove", function (event) {
    look(event.clientX, event.clientY);
  }, { passive: true });

  var lastY = window.scrollY || 0;
  var lastT = performance.now();
  window.addEventListener("scroll", function () {
    var now = performance.now();
    var speed = Math.abs((window.scrollY || 0) - lastY) / Math.max(16, now - lastT);
    lastY = window.scrollY || 0;
    lastT = now;
    if (reduce || state !== "perched" || speed < 1.5) return;
    host.classList.remove("is-hop");
    void host.offsetWidth;
    host.classList.add("is-hop");
  }, { passive: true });

  var track = document.getElementById("track");
  if (track) {
    track.addEventListener("play", function () {
      if (state === "perched") {
        setPose("front");
        host.classList.remove("is-flip");
      }
    });
  }

  var shelf = document.getElementById("tracklist");
  if (shelf && window.MutationObserver) {
    new MutationObserver(function () {
      host.classList.toggle("is-aside", modalOpen());
    }).observe(shelf, { attributes: true, attributeFilter: ["hidden"] });
  }

  turnTimer = setInterval(function () {
    if (reduce || state !== "perched") return;
    if (Math.random() > 0.45) return;
    var current = img.getAttribute("data-pose") || "profile";
    if (current === "caw" || current === "wings") return;
    var next = current === "front" ? "profile" : "front";
    setPose(next);
    setTimeout(function () {
      if (state === "perched" && img.getAttribute("data-pose") === next) setPose(current);
    }, 1100);
  }, 8000);

  function scheduleAppear(delay) {
    clearTimeout(awayTimer);
    if (!enabled) return;
    awayTimer = setTimeout(appear, delay);
  }

  showRestore(!enabled);
  if (enabled) scheduleAppear(3400);
})();
