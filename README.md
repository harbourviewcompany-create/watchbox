# WatchBox

A static movie and TV discovery site with a dedicated **Full Movies** collection and in-page playback for films whose creators authorize online streaming.

## Run locally

Serve the repository as a static site (e.g. python3 -m http.server 8080) and open http://localhost:8080. GitHub Pages also works. No API keys or build step are required.

## Pages

- index.html — home, highlighted playable film, curated rows
- full-movies.html — films that have complete authorized video sources
- watch.html?id=90001 — full-length player
- movies.html and tv.html — full discovery catalog
- detail.html?id=… — film/series details and trailers
- search.html?q=… — title, description and genre search

## Sources and rights

Full-length videos are **not** automatically available for the commercial titles in the discovery catalog. Obtain distribution/streaming permission or use properly licensed content before adding a full film. Never replace trailers with unauthorized copies.

The initial curated sources in streaming.js are the creator-released films *Sita Sings the Blues* and *Seder-Masochism*, embedded from the Internet Archive. Their release and provenance can be checked at https://www.sitasingstheblues.com/ and https://sedermasochism.com/. Note that **the music in Seder-Masochism has separate rights**; this project embeds the director's existing Internet Archive release rather than republishing its video.

To add a permitted title, add a film object to the licensedMovies array in streaming.js (with a unique numeric id, title, type, genres, year, poster and description). Choose either:

- stream: { type: "archive", id: "AN_OFFICIALLY_AUTHORIZED_ARCHIVE_ITEM" } for an authorized archive.org film.
- stream: { type: "video", url: "https://your-licensed-media-host/movie.mp4" } for your own HTTPS MP4 file. Safari may also play supported HLS (.m3u8) sources natively; desktop HLS support varies.

Include sourceUrl and rightsUrl showing distribution authorization. A video tag supports fullscreen, playback controls and local resume; the Archive embed uses Archive's playback controls. Avoid distributing videos you are not licensed to stream.

No subscription service, user accounts, DRM, payment processing or commercial film licenses are included.
