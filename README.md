# WatchBox

A static movie/TV discovery site with **Full Movies** for creator-authorized embedded films and **New & Free** for external links to recent free/ad-supported movies.

## Local development

Run a static server (for example, python3 -m http.server 8080) and open http://localhost:8080. This repository requires no frontend build step or dependency installation.

Run node tests/smoke.mjs (Node 22+) to validate pages, links, JavaScript, and both catalogs.

## Pages

- index.html — home including a latest-free-movies preview
- new-free.html — newly released movies discoverable through legal free streaming providers in Canada
- full-movies.html — in-site films for which full-length embedded playback is authorized
- watch.html?id=90001 — full movie player with Archive and licensed MP4 support
- movies.html, tv.html, detail.html, search.html — discovery

## Free movie catalog: sources, limitations and refresh

The site renders data/free-movies.json in the browser. No API keys are sent to clients.

- data/featured-free-movies.json contains **manually verified official Tubi title-page links** (2026-10-10). These entries have linkType=direct. Verified pages do **not** guarantee that a title plays on every Canadian device; Tubi determines actual geographic availability.
- scripts/update-free-movies.mjs calls TMDB's discover API with watch_region=CA, with_watch_monetization_types=free|ads, and recent release years. It **rechecks each film's Canadian free/ads watch-provider list**, discards titles without free/ad-supported options, and merges the results with curated official links. These entries have linkType=availability and point to the **TMDB "where to watch" page**, because TMDB does not supply direct provider play URLs.
- .github/workflows/refresh-free-movies.yml schedules a daily refresh at 09:37 UTC and supports manual dispatch. If new data passes smoke checks it commits data/free-movies.json to main.
- If the API fails or responds with no valid free titles, the script refuses to overwrite the previous snapshot. The page shows the snapshot date rather than pretending real-time availability.
- To start automatic refresh, obtain a TMDB API Read Access Token from https://www.themoviedb.org/settings/api and add a GitHub Actions repository secret named **TMDB_READ_ACCESS_TOKEN** in **Settings → Secrets and variables → Actions**. Verify Actions are enabled and that workflow GITHUB_TOKEN can write repository contents. Never commit the token to the repository or expose it in browser code. Once configured, use **Actions → Refresh Canadian Free Movies → Run workflow** and check its result.
- TMDB's standard API is free only for eligible **noncommercial** use; commercial use requires an agreement. Read https://developer.themoviedb.org/docs/faq and applicable API terms before enabling monetization.
- TMDB data must be attributed to TMDB and **JustWatch** (the provider availability source). See the footer of new-free.html. Approved TMDB logos and required attribution details: https://www.themoviedb.org/about/logos-attribution.

**The free-discovery page never streams, downloads or re-hosts commercial titles.** All the new free links open the external streaming service or a TMDB provider-availability page. A film being free on Tubi does not grant embedding, distribution, or retransmission rights for WatchBox.

## Full movie rights and playback

Only creator-authorized full films play in WatchBox: streaming.js initially includes *Sita Sings the Blues* and *Seder-Masochism*, linked to Nina Paley's Internet Archive releases. See https://www.sitasingstheblues.com and https://sedermasochism.com. *Seder-Masochism*'s music carries separate rights, so WatchBox embeds the director's release and does not redistribute the video file.

For additional authorized movies, add unique numeric film IDs and licensed Archive embed identifiers or HTTPS video URLs to streaming.js. Never replace trailers with unauthorized commercial movies.

No commercial streaming catalog license, video DRM, payment processing, account system or production deployment is included.
