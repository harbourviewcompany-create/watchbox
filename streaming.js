// Curated feature-length films with authorized, publicly available streaming embeds.
// Streaming source and rights information verified against creators' official releases.
// To add licensed commercial movies, supply an authorized video source and the rights to use it.
const licensedMovies = [
  {
    id: 90001,
    title: "Sita Sings the Blues",
    type: "movie",
    genres: ["Animation", "Musical", "Comedy"],
    year: 2008,
    runtime: "82 min",
    trending: true,
    description: "Nina Paley's animated feature reimagines the Ramayana through vibrant storytelling, shadow puppets and 1920s jazz.",
    poster: "https://archive.org/services/img/Sita_Sings_the_Blues",
    backdrop: "https://archive.org/services/img/Sita_Sings_the_Blues",
    stream: { type: "archive", id: "Sita_Sings_the_Blues" },
    sourceUrl: "https://archive.org/details/Sita_Sings_the_Blues",
    rightsUrl: "https://www.sitasingstheblues.com/",
    rightsLabel: "Released by Nina Paley under CC0"
  },
  {
    id: 90002,
    title: "Seder-Masochism",
    type: "movie",
    genres: ["Animation", "Musical", "Comedy"],
    year: 2018,
    runtime: "78 min",
    trending: false,
    description: "An irreverent animated retelling of the Book of Exodus from filmmaker Nina Paley.",
    poster: "https://archive.org/services/img/sedermasochism",
    backdrop: "https://archive.org/services/img/sedermasochism",
    stream: { type: "archive", id: "sedermasochism" },
    sourceUrl: "https://archive.org/details/sedermasochism",
    rightsUrl: "https://sedermasochism.com/",
    rightsLabel: "Creator-released film; music has separate rights"
  }
];

// Keep catalog data in data.js intact. Avoid duplicate ids if a film is imported later.
if (typeof content !== "undefined") {
  licensedMovies.forEach(function (film) {
    if (!content.some(function (entry) { return entry.id === film.id; })) {
      content.push(film);
    }
  });
}

function hasFullMovie(item) {
  return !!(item && item.stream && (
    (item.stream.type === "archive" && /^[a-zA-Z0-9_-]+$/.test(item.stream.id)) ||
    (item.stream.type === "video" && isSecureVideoUrl(item.stream.url))
  ));
}

function isSecureVideoUrl(url) {
  try {
    var parsed = new URL(url);
    return parsed.protocol === "https:" && !!parsed.hostname &&
      !parsed.username && !parsed.password;
  } catch (error) {
    return false;
  }
}

function watchUrl(item) {
  return "watch.html?id=" + encodeURIComponent(item.id);
}
