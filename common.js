function createCard(item) {
  const card = document.createElement("a");
  card.className = "card";
  card.href = (typeof hasFullMovie === "function" && hasFullMovie(item))
    ? watchUrl(item)
    : "detail.html?id=" + encodeURIComponent(item.id);
  card.setAttribute("aria-label", (typeof hasFullMovie === "function" && hasFullMovie(item) ? "Watch full movie: " : "See details: ") + item.title);

  const art = document.createElement("div");
  art.className = "card-art";
  const image = document.createElement("img");
  image.src = item.poster;
  image.alt = item.title + " poster";
  image.loading = "lazy";
  image.decoding = "async";
  image.addEventListener("error", function () {
    image.remove();
    art.classList.add("no-image");
  });
  const fallback = document.createElement("span");
  fallback.className = "poster-fallback";
  fallback.textContent = item.title;
  art.append(fallback, image);

  if (typeof hasFullMovie === "function" && hasFullMovie(item)) {
    const label = document.createElement("span");
    label.className = "watch-pill";
    label.textContent = "▶ FULL MOVIE";
    art.appendChild(label);
  }
  const title = document.createElement("div");
  title.className = "card-title";
  title.textContent = item.title;
  const meta = document.createElement("div");
  meta.className = "card-meta";
  meta.textContent = [item.year, item.runtime || (typeof item.rating === "number" ? "★ " + item.rating : "")].filter(Boolean).join(" · ");
  card.append(art, title, meta);
  return card;
}

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
  });
}

function setupHeader() {
  const header = document.getElementById("header");
  if (!header) return;
  const updateHeader = function () { header.classList.toggle("scrolled", window.scrollY > 40); };
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  const search = document.getElementById("search");
  if (search) {
    search.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        const query = search.value.trim();
        if (query) window.location.href = "search.html?q=" + encodeURIComponent(query);
      }
    });
  }
  const current = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (link) {
    if (link.getAttribute("href") === current || (current === "watch.html" && link.getAttribute("href") === "full-movies.html")) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
}

function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

document.addEventListener("DOMContentLoaded", setupHeader);
