/* Lists the catalog on the licensing page from data/releases.json. */
(function () {
  var root = document.getElementById("license-catalog");
  if (!root) return;

  fetch("../data/releases.json")
    .then(function (response) {
      if (!response.ok) throw new Error("Catalog request failed");
      return response.json();
    })
    .then(function (data) {
      var releases = Array.isArray(data.releases) ? data.releases : [];
      var list = document.createElement("ul");
      list.className = "license-list";
      releases.forEach(function (release) {
        var links = Array.isArray(release.spotify) ? release.spotify : [];
        var primary = null;
        for (var i = 0; i < links.length; i++) {
          var item = links[i];
          if (!item || !item.url || item.url.indexOf("https://open.spotify.com/") !== 0) continue;
          if (!primary || item.role === "primary") primary = item;
          if (item.role === "primary") break;
        }
        if (!primary) return;
        var link = document.createElement("a");
        link.href = primary.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.appendChild(document.createTextNode(release.title || primary.title || "Release"));
        var kind = document.createElement("small");
        kind.textContent = release.format === "ep" ? "EP" : release.format === "single" ? "Single" : "Release";
        link.appendChild(kind);
        var hidden = document.createElement("span");
        hidden.className = "sr-only";
        hidden.textContent = " (opens in a new tab)";
        link.appendChild(hidden);
        var itemNode = document.createElement("li");
        itemNode.appendChild(link);
        list.appendChild(itemNode);
      });
      root.textContent = "";
      root.appendChild(list);
    })
    .catch(function () {
      root.textContent = "";
      var note = document.createElement("p");
      note.className = "catalog-error";
      note.textContent = "The catalog could not be opened.";
      root.appendChild(note);
    });
})();
