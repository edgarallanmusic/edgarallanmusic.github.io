/* A few fading embers behind the pointer. CSS animation only: no animation frame,
   so it does not share a clock with the visualizer. Skipped on touch, when motion
   is reduced, and on any page that sets data-cursor-trail="off". */
(function () {
  if (!document.body || document.body.getAttribute("data-cursor-trail") === "off") return;
  var reduce = false;
  var coarseOnly = false;
  try {
    reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    coarseOnly = window.matchMedia("(pointer: coarse)").matches
      && !window.matchMedia("(any-pointer: fine)").matches;
  } catch (e) {}
  if (reduce || coarseOnly) return;

  var lastX = 0;
  var lastY = 0;
  var primed = false;
  var alive = 0;
  var maxEmbers = 7;

  document.addEventListener("pointermove", function (event) {
    if (event.pointerType && event.pointerType !== "mouse") return;
    if (!primed) {
      primed = true;
      lastX = event.clientX;
      lastY = event.clientY;
      return;
    }
    var dx = event.clientX - lastX;
    var dy = event.clientY - lastY;
    if (dx * dx + dy * dy < 196) return;
    lastX = event.clientX;
    lastY = event.clientY;
    if (alive >= maxEmbers) return;
    var dot = document.createElement("span");
    dot.className = "ember";
    dot.style.left = event.clientX + "px";
    dot.style.top = event.clientY + "px";
    alive++;
    dot.addEventListener("animationend", function () {
      alive--;
      dot.remove();
    });
    document.body.appendChild(dot);
  }, { passive: true });
})();
