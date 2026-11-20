/* Fallback for browsers that do not run cross-document view transitions.
   Only the walk between the house and the visualizer is held. Back and
   forward are left to the browser. */
(function () {
  if (typeof document.startViewTransition === "function") return;

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
    var pair = (from === "home" && to === "viz") || (from === "viz" && to === "home");
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
