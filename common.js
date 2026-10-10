function createCard(item) {
  const div = document.createElement("div");
  div.className = "card";
  div.innerHTML = `
    <img src="${item.poster}" alt="${item.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x450/1a1a1a/888?text=${encodeURIComponent(item.title)}'">
    <div class="card-title">${item.title}</div>
    <div class="card-meta">${item.year} · ★ ${item.rating}</div>
  `;
  div.onclick = () => { window.location.href = `detail.html?id=${item.id}`; };
  return div;
}

function setupHeader() {
  const header = document.getElementById("header");
  if (!header) return;
  window.addEventListener("scroll", () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
  });

  const search = document.getElementById("search");
  if (search) {
    search.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const q = search.value.trim();
        if (q) window.location.href = `search.html?q=${encodeURIComponent(q)}`;
      }
    });
  }

  // Highlight active nav
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(a => {
    if (a.getAttribute("href") === path || (path === "" && a.getAttribute("href") === "index.html")) {
      a.classList.add("active");
    }
  });
}

function getParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

document.addEventListener("DOMContentLoaded", setupHeader);
