/* WatchBox free-film discovery: external links only; no movie streams are proxied. */
(function () {
  "use strict";
  const DATA_URL = "data/free-movies.json";
  const dataGrid = document.getElementById("free-grid");
  const homeRow = document.getElementById("row-new-free");
  if (!dataGrid && !homeRow) return;

  function textElement(tag, className, value) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = value == null ? "" : String(value);
    return element;
  }

  function safeExternalLink(value) {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:" || url.username || url.password) return null;
      const allowedHosts = ["tubitv.com", "www.tubitv.com", "www.themoviedb.org"];
      return allowedHosts.includes(url.hostname) ? url.href : null;
    } catch (_error) { return null; }
  }

  function safePoster(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" &&
        url.hostname === "image.tmdb.org" &&
        url.pathname.startsWith("/t/p/") ? url.href : null;
    } catch (_error) { return null; }
  }

  function isMovie(item) {
    return item && typeof item.title === "string" &&
      Number.isInteger(item.year) && item.year >= 1900 && item.year <= 2100 &&
      safeExternalLink(item.link) &&
      ["ads", "free"].includes(item.monetization);
  }

  function makeCard(item, compact) {
    const card = document.createElement("article");
    card.className = "free-card" + (compact ? " free-card-compact" : "");
    const art = document.createElement("div");
    art.className = "free-card-art";
    const imageUrl = safePoster(item.poster);
    if (imageUrl) {
      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = item.title + " poster";
      image.loading = "lazy";
      image.decoding = "async";
      image.addEventListener("error", function () { image.remove(); });
      art.appendChild(image);
    }
    art.appendChild(textElement("span", "free-art-title", item.title));
    art.appendChild(textElement("span", "free-year", String(item.year)));
    card.appendChild(art);

    const content = document.createElement("div");
    content.className = "free-card-content";
    content.appendChild(textElement("span", "free-source", item.provider || "Free service"));
    content.appendChild(textElement("h3", "free-card-title", item.title));
    content.appendChild(textElement("p", "free-card-meta",
      [item.year, item.genre || "Movie", item.monetization === "ads" ? "Free with ads" : "Free"].join(" · ")));
    if (!compact && item.description) {
      content.appendChild(textElement("p", "free-card-description", item.description));
    }

    const link = document.createElement("a");
    link.href = safeExternalLink(item.link);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.className = "free-watch-link";
    const direct = item.linkType === "direct" && new URL(link.href).hostname.endsWith("tubitv.com");
    link.textContent = direct ? "Watch on " + item.provider + " ↗" : "Find free viewing options ↗";
    link.setAttribute("aria-label", link.textContent + " for " + item.title);
    content.appendChild(link);
    card.appendChild(content);
    return card;
  }

  function readCatalog(data) {
    if (!data || data.region !== "CA" || !Array.isArray(data.items)) throw new Error("Invalid movie catalog");
    const unique = new Set();
    return data.items.filter(function (item) {
      if (!isMovie(item) || unique.has(String(item.id))) return false;
      unique.add(String(item.id));
      return true;
    });
  }

  function dateSort(a, b) {
    const aDate = /^\d{4}-\d{2}-\d{2}$/.test(a.releaseDate || "") ? a.releaseDate : String(a.year);
    const bDate = /^\d{4}-\d{2}-\d{2}$/.test(b.releaseDate || "") ? b.releaseDate : String(b.year);
    return bDate.localeCompare(aDate) || a.title.localeCompare(b.title);
  }

  function renderList(list, parent, compact) {
    parent.replaceChildren();
    if (!list.length) {
      parent.appendChild(textElement("p", "free-empty", "No titles match those filters."));
      return;
    }
    const fragment = document.createDocumentFragment();
    list.forEach(function (movie) { fragment.appendChild(makeCard(movie, compact)); });
    parent.appendChild(fragment);
  }

  fetch(DATA_URL, { cache: "no-store" }).then(function (response) {
    if (!response.ok) throw new Error("Failed to retrieve free movie catalog");
    return response.json();
  }).then(function (snapshot) {
    const movies = readCatalog(snapshot).sort(dateSort);
    if (!movies.length) throw new Error("No free movies available in the catalog");
    if (homeRow) renderList(movies.slice(0, 6), homeRow, true);
    if (!dataGrid) return;

    const search = document.getElementById("free-query");
    const provider = document.getElementById("free-provider");
    const sort = document.getElementById("free-sort");
    document.getElementById("free-count").textContent = movies.length + " titles found";
    if (snapshot.generatedAt && !Number.isNaN(Date.parse(snapshot.generatedAt))) {
      document.getElementById("free-updated").textContent = "Catalog refreshed " +
        new Date(snapshot.generatedAt).toLocaleDateString("en-CA", { year:"numeric", month:"short", day:"numeric" });
    }
    const providers = [...new Set(movies.flatMap(function (m) { return String(m.provider || "").split(",").map(x=>x.trim()).filter(Boolean); }))].sort();
    providers.forEach(function (name) {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      provider.appendChild(option);
    });
    function update() {
      const needle = search.value.trim().toLocaleLowerCase();
      let matched = movies.filter(function (item) {
        return (!needle || [item.title, item.genre, item.description, item.provider].some(function (field) {
          return String(field || "").toLocaleLowerCase().includes(needle);
        })) && (!provider.value || String(item.provider || "").split(",").map(s=>s.trim()).includes(provider.value));
      });
      if (sort.value === "title") matched = matched.slice().sort((a,b)=>a.title.localeCompare(b.title));
      document.getElementById("free-count").textContent = matched.length + " of " + movies.length + " titles";
      renderList(matched, dataGrid, false);
    }
    search.addEventListener("input", update);
    provider.addEventListener("change", update);
    sort.addEventListener("change", update);
    update();
  }).catch(function () {
    const error = "The movie list is temporarily unavailable. Try refreshing the page.";
    if (homeRow) homeRow.appendChild(textElement("p", "free-empty", error));
    if (dataGrid) {
      const label = document.getElementById("free-error");
      label.hidden = false;
      label.textContent = error;
      document.getElementById("free-count").textContent = "Unavailable";
    }
  });
})();
