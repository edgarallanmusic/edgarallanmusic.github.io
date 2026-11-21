/* Renders the discography and podcast from data/releases.json. */
(function () {
  var catalogRoot = document.getElementById("catalog-root");
  var featuredRoot = document.getElementById("featured-root");
  var podcastRoot = document.getElementById("podcast-root");
  var statusNode = document.getElementById("catalog-status");

  var navToggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      var label = navToggle.querySelector(".sr-only");
      if (label) label.textContent = open ? "Close menu" : "Open menu";
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        var label = navToggle.querySelector(".sr-only");
        if (label) label.textContent = "Open menu";
      });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        nav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.focus();
      }
    });
  }

  if (!catalogRoot) return;

  fetch("data/releases.json")
    .then(function (response) {
      if (!response.ok) throw new Error("Catalog request failed");
      return response.json();
    })
    .then(function (data) {
      renderFeatured(data);
      renderCatalog(data);
      renderPodcast(data);
      if (statusNode) statusNode.hidden = true;
    })
    .catch(function () {
      if (statusNode) statusNode.hidden = true;
      catalogRoot.appendChild(
        el("p", { class: "catalog-error", text: "The catalog could not be opened. The artist page on Spotify is still lit." })
      );
    });

  function renderFeatured(data) {
    if (!featuredRoot || !data.featured) return;
    var release = findRelease(data, data.featured.releaseId);
    var link = release && findSpotify(release, data.featured.spotifyId);
    if (!release || !link || !link.url) return;
    var copy = el("div", {}, [
      el("p", { class: "kicker", text: data.featured.kicker || "On the stand" }),
      el("h3", { text: link.title || release.title }),
      el("p", { text: data.featured.text || release.summary || "" })
    ]);
    var frame = spotifyEmbed(link.url, link.title || release.title, false);
    var player = el("div", { class: "embed-panel" });
    if (frame) player.appendChild(frame);
    featuredRoot.appendChild(el("div", { class: "featured" }, [copy, player]));
  }

  function renderCatalog(data) {
    var releases = Array.isArray(data.releases) ? data.releases : [];
    var episodes = (data.podcast && data.podcast.episodes) || [];
    var upcoming = releases.filter(function (release) { return release.status === "upcoming"; });
    var rest = releases.filter(function (release) { return release.status !== "upcoming"; });
    if (upcoming.length) {
      catalogRoot.appendChild(el("p", { class: "group-label", text: "Coming soon" }));
      var soon = el("ul", { class: "cards" });
      upcoming.forEach(function (release) {
        soon.appendChild(renderCard(release, episodes));
      });
      catalogRoot.appendChild(soon);
    }
    var groups = [
      { id: "ep", label: "EPs" },
      { id: "single", label: "Singles" }
    ];
    var known = {};
    groups.forEach(function (group) { known[group.id] = true; });
    var extra = rest.some(function (release) { return !known[release.format]; });
    if (extra) groups.push({ id: "other", label: "Also" });

    groups.forEach(function (group) {
      var items = rest.filter(function (release) {
        if (group.id === "other") return !known[release.format];
        return release.format === group.id;
      });
      if (!items.length) return;
      catalogRoot.appendChild(el("p", { class: "group-label", text: group.label }));
      var list = el("ul", { class: "cards" });
      items.forEach(function (release) {
        list.appendChild(renderCard(release, episodes));
      });
      catalogRoot.appendChild(list);
    });
  }

  function renderCard(release, episodes) {
    var upcoming = release.status === "upcoming";
    var top = el("p", { class: "card-top" }, [
      el("span", { class: "format", text: formatLabel(release.format) }),
      upcoming
        ? el("span", { class: "coming", text: "Coming soon" })
        : (release.year ? el("span", { class: "year", text: String(release.year) }) : null)
    ]);
    var cover = upcoming ? localImage(release.cover) : null;
    var body = [
      cover ? el("img", {
        class: "release-cover",
        src: cover,
        alt: "",
        width: "1200",
        height: "1200"
      }) : null,
      top,
      el("h3", { text: release.title || "Untitled" })
    ];
    if (release.work) {
      body.push(originLine("From", release.work));
    }
    if (release.author) {
      body.push(originLine("By", release.author));
    }
    if (release.genre) {
      body.push(el("p", { class: "genre", text: release.genre }));
    }
    if (release.summary) {
      body.push(el("p", { class: "summary", text: release.summary }));
    }
    if (upcoming) {
      body.push(el("p", { class: "fine", text: "Date TBA." }));
      body.push(renderPreviewPlayer(release));
    }

    var links = Array.isArray(release.spotify) ? release.spotify : [];
    var playable = links.filter(function (item) { return safeHttps(item.url); });
    var primary = playable.find(function (item) { return item.role === "primary"; }) || playable[0];
    var editions = playable.filter(function (item) { return item !== primary; });
    if (editions.length) {
      var editionList = el("ul", { class: "editions" });
      editions.forEach(function (item) {
        var label = (item.note ? item.note + ": " : "Also on Spotify: ") + (item.title || "Spotify");
        editionList.appendChild(el("li", {}, [
          externalLink(item.url, label, null, label + ", opens in a new tab")
        ]));
      });
      body.push(editionList);
    }

    var episode = episodes.find(function (item) {
      return item.releaseId === release.id && safeHttps(item.url);
    });
    if (episode) {
      body.push(el("p", { class: "editions" }, [
        externalLink(episode.url, "Making-of: " + episode.title, null, "Podcast episode " + episode.title + " on Spotify")
      ]));
    }

    if (primary) {
      var actions = el("div", { class: "actions" });
      actions.appendChild(externalLink(
        primary.url,
        "Listen on Spotify",
        "btn btn-amber",
        "Listen to " + (primary.title || release.title) + " on Spotify"
      ));
      var panelId = "player-" + (release.id || primary.id || "release");
      var panel = el("div", { class: "embed-panel", id: panelId });
      panel.hidden = true;
      var toggle = el("button", {
        class: "btn btn-ghost",
        type: "button",
        "aria-expanded": "false",
        "aria-controls": panelId
      });
      toggle.textContent = "Play on this page";
      toggle.setAttribute("aria-label", "Play " + (release.title || "this release") + " on this page");
      toggle.addEventListener("click", function () {
        var willOpen = panel.hidden;
        panel.hidden = !willOpen;
        toggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
        toggle.textContent = willOpen ? "Hide player" : "Play on this page";
        toggle.setAttribute("aria-label", (willOpen ? "Hide the player for " : "Play ") + (release.title || "this release") + (willOpen ? "" : " on this page"));
        if (willOpen && !panel.querySelector("iframe")) {
          var frame = spotifyEmbed(primary.url, primary.title || release.title, false);
          if (frame) panel.appendChild(frame);
        }
      });
      actions.appendChild(toggle);
      body.push(actions);
      body.push(panel);
    }

    return el("li", {}, [el("article", { class: upcoming ? "card card-upcoming" : "card" }, body)]);
  }

  var previewAudios = [];

  function renderPreviewPlayer(release) {
    var previews = (release.previews || []).filter(function (item) {
      return item && localPreview(item.src);
    });
    var wrap = el("div", { class: "preview-player" });
    if (!previews.length) return wrap;
    var index = 0;
    var audio = el("audio", { preload: "none" });
    previewAudios.push(audio);
    var title = el("p", { class: "preview-title", text: previewLabel(previews[0]) });
    var play = el("button", { class: "btn btn-amber", type: "button" });
    play.textContent = "Play preview";
    function paint() {
      title.textContent = previewLabel(previews[index]);
      play.textContent = audio.paused ? "Play preview" : "Pause";
      play.setAttribute("aria-label", (audio.paused ? "Play preview " : "Pause preview ") + previews[index].title);
    }
    function loadCurrent() {
      var src = localPreview(previews[index].src);
      if (audio.getAttribute("data-src") !== src) {
        audio.src = src;
        audio.setAttribute("data-src", src);
      }
    }
    play.addEventListener("click", function () {
      if (!audio.paused) {
        audio.pause();
        paint();
        return;
      }
      previewAudios.forEach(function (other) {
        if (other !== audio) other.pause();
      });
      loadCurrent();
      audio.play().then(paint).catch(paint);
    });
    audio.addEventListener("play", paint);
    audio.addEventListener("pause", paint);
    audio.addEventListener("ended", function () {
      index = (index + 1) % previews.length;
      loadCurrent();
      audio.play().catch(paint);
    });
    var link = el("a", {
      class: "btn btn-ghost",
      href: "visualizer/#previews"
    });
    link.textContent = "Listen to previews";
    wrap.appendChild(title);
    wrap.appendChild(el("div", { class: "actions" }, [play, link]));
    wrap.appendChild(audio);
    paint();
    return wrap;
  }

  function previewLabel(item) {
    var side = item.side ? "Side " + item.side + " · " : "";
    return side + (item.title || "Preview");
  }

  function localPreview(src) {
    if (!src || typeof src !== "string") return null;
    if (src.indexOf("..") !== -1 || src.indexOf("://") !== -1 || src.charAt(0) === "/") return null;
    if (src.indexOf("visualizer/audio/") !== 0 || !/\.mp3$/i.test(src)) return null;
    return src;
  }

  function localImage(src) {
    if (!src || typeof src !== "string") return null;
    if (src.indexOf("..") !== -1 || src.indexOf("://") !== -1 || src.charAt(0) === "/") return null;
    if (!/\.(jpe?g|png|webp)$/i.test(src)) return null;
    return src;
  }

  function renderPodcast(data) {
    if (!podcastRoot || !data.podcast) return;
    var show = data.podcast;
    if (!safeHttps(show.url)) {
      podcastRoot.appendChild(el("p", { class: "placeholder" }, [
        el("strong", { text: "Placeholder" }),
        document.createTextNode(" Podcast link not confirmed yet.")
      ]));
      return;
    }
    var copy = el("div", {}, [
      el("h3", { text: show.title || "Podcast" }),
      show.summary ? el("p", { class: "summary", text: show.summary }) : null,
      el("div", { class: "actions" }, [
        externalLink(show.url, "Open the show", "btn btn-amber", "Open " + (show.title || "the podcast") + " on Spotify")
      ])
    ]);
    var episodes = el("ul", { class: "episode-list" });
    (show.episodes || []).forEach(function (episode) {
      if (!safeHttps(episode.url)) return;
      var link = externalLink(episode.url, "", null, "Play " + episode.title + " on Spotify");
      link.appendChild(el("span", { text: episode.title }));
      link.appendChild(el("small", { text: "Episode" }));
      episodes.appendChild(el("li", {}, [link]));
    });
    if (episodes.childNodes.length) copy.appendChild(episodes);
    var player = el("div", { class: "embed-panel" });
    var frame = spotifyEmbed(show.url, show.title || "Podcast", false);
    if (frame) player.appendChild(frame);
    podcastRoot.appendChild(el("div", { class: "podcast-layout" }, [copy, player]));
  }

  function originLine(label, value) {
    var line = el("p", { class: "origin" });
    line.appendChild(document.createTextNode(label + " "));
    line.appendChild(el("strong", { text: value }));
    return line;
  }

  function formatLabel(format) {
    if (format === "ep") return "EP";
    if (format === "single") return "Single";
    if (!format) return "Release";
    return format.charAt(0).toUpperCase() + format.slice(1);
  }

  function findRelease(data, id) {
    return (data.releases || []).find(function (release) { return release.id === id; });
  }

  function findSpotify(release, id) {
    return (release.spotify || []).find(function (item) { return item.id === id; });
  }

  function safeHttps(url) {
    if (!url || typeof url !== "string") return null;
    try {
      var parsed = new URL(url);
      if (parsed.protocol !== "https:") return null;
      return parsed.href;
    } catch (error) {
      return null;
    }
  }

  function spotifyEmbed(url, title, compact) {
    var href = safeHttps(url);
    if (!href) return null;
    var parsed = new URL(href);
    if (parsed.hostname !== "open.spotify.com") return null;
    var match = parsed.pathname.match(/^\/(album|track|episode|show|playlist)\/([A-Za-z0-9]+)/);
    if (!match) return null;
    var iframe = document.createElement("iframe");
    iframe.src = "https://open.spotify.com/embed/" + match[1] + "/" + match[2] + "?utm_source=generator&theme=0";
    iframe.title = "Spotify embed: " + title;
    iframe.loading = "lazy";
    iframe.width = "100%";
    iframe.height = compact ? "152" : "352";
    iframe.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
    iframe.setAttribute("allowfullscreen", "");
    return iframe;
  }

  function externalLink(url, text, className, label) {
    var href = safeHttps(url);
    var link = el("a", {
      href: href || "#",
      class: className || null,
      target: "_blank",
      rel: "noopener noreferrer"
    });
    if (label) link.setAttribute("aria-label", label);
    if (text) link.appendChild(document.createTextNode(text));
    link.appendChild(el("span", { class: "sr-only", text: " (opens in a new tab)" }));
    return link;
  }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (key) {
      var value = attrs[key];
      if (value == null || value === false) return;
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else node.setAttribute(key, value);
    });
    (children || []).forEach(function (child) {
      if (child) node.appendChild(child);
    });
    return node;
  }
})();
