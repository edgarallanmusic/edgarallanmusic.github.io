/* Passage between the house and the visualizer.
   Browsers that run cross-document view transitions keep the amber iris
   on the way home. The walk into the visualizer is the raven's eye,
   finished on the visualizer page so playback there is not held. */
(function () {
  var reduce = false;
  try {
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  function kind(url) {
    var path = new URL(url, window.location.href).pathname.replace(/\/index\.html$/, "");
    if (path.length > 1 && path.charAt(path.length - 1) === "/") path = path.slice(0, -1);
    if (path === "" || path === "/") return "home";
    if (path === "/visualizer") return "viz";
    return "";
  }

  window.addEventListener("pageswap", function (event) {
    if (!event.viewTransition) return;
    var dest = "";
    try {
      dest = (event.activation && event.activation.entry && event.activation.entry.url) || "";
    } catch (e) {}
    if (dest.indexOf("/visualizer") === -1) return;
    if (typeof event.viewTransition.skipTransition === "function") {
      event.viewTransition.skipTransition();
    }
  });

  document.addEventListener("click", function (event) {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var link = event.target && event.target.closest ? event.target.closest("a[href]") : null;
    if (!link || link.target === "_blank" || link.hasAttribute("download")) return;
    var dest;
    try { dest = new URL(link.href, window.location.href); }
    catch (e) { return; }
    if (dest.origin !== window.location.origin) return;
    var from = kind(window.location.href);
    var to = kind(dest.href);
    if (to === "viz" && from !== "viz") {
      event.preventDefault();
      try { sessionStorage.setItem("eam-viz-eye", "1"); }
      catch (e) {}
      window.location.href = dest.href;
      return;
    }
    if (typeof document.startViewTransition === "function") return;
    var pair = (from === "viz" && to === "home");
    if (!pair) return;
    event.preventDefault();
    var veil = document.createElement("div");
    veil.className = "vt-fallback" + (reduce ? " is-reduced" : "");
    veil.setAttribute("aria-hidden", "true");
    document.body.appendChild(veil);
    window.setTimeout(function () {
      window.location.href = dest.href;
    }, reduce ? 180 : 780);
  });
})();
