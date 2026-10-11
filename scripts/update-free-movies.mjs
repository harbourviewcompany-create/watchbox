/**
 * Snapshot free/ad-supported movies currently reported for Canada by TMDB's
 * JustWatch-powered watch-provider data. Requires TMDB_READ_ACCESS_TOKEN.
 * Does NOT download, proxy, or embed movies. TMDB returns availability pages.
 */
import { readFile, writeFile, rename } from "node:fs/promises";

const TOKEN = String(process.env.TMDB_READ_ACCESS_TOKEN || "").trim();
if (!TOKEN) {
  console.error("Missing TMDB_READ_ACCESS_TOKEN: add a TMDB API Read Access Token as a GitHub Actions repository secret to enable the daily refresh.");
  process.exit(1);
}
const ROOT = new URL("../", import.meta.url);
const TODAY = new Date();
const today = TODAY.toISOString().slice(0, 10);
const earliest = String(TODAY.getUTCFullYear() - 2) + "-01-01";
const apiRoot = "https://api.themoviedb.org/3/";
const headers = { Authorization: "Bearer " + TOKEN, Accept: "application/json" };
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

async function tmdb(path, query = {}, retries = 2) {
  const url = new URL(path, apiRoot);
  for (const [key,value] of Object.entries(query)) url.searchParams.set(key, String(value));
  for (let attempt=0; attempt<=retries; attempt++) {
    let response;
    try {
      response = await fetch(url, { headers, signal: AbortSignal.timeout(16000) });
    } catch (error) {
      if (attempt < retries) { await sleep(1000 * (attempt+1)); continue; }
      throw error;
    }
    if (response.ok) return response.json();
    if ((response.status === 429 || response.status >= 500) && attempt < retries) {
      await sleep(Number(response.headers.get("retry-after") || 1) * 1100);
      continue;
    }
    throw new Error("TMDB "+ response.status + " while reading " + url.pathname);
  }
}

function safeTmdbLink(value, id) {
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" || u.hostname !== "www.themoviedb.org" ||
        !u.pathname.startsWith("/movie/" + id + "/watch") || u.username || u.password) return null;
    return u.href;
  } catch { return null; }
}

function posterUrl(path) {
  if (typeof path !== "string" || !/^\/[a-zA-Z0-9_-]+\.(?:jpg|jpeg|png|webp)$/.test(path)) return "";
  return "https://image.tmdb.org/t/p/w500" + path;
}

function uniqueProviders(entries) {
  return [...new Set(entries.map(p => String(p.provider_name || "").trim()).filter(Boolean))].slice(0,5);
}

function yearOf(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return 0;
  return Number(value.slice(0,4));
}

async function main() {
  const curated = JSON.parse(await readFile(new URL("data/featured-free-movies.json", ROOT), "utf8")).items;
  if (!Array.isArray(curated) || curated.length === 0) throw new Error("Curated catalog missing");
  const candidates = new Map();
  for (const sort of ["primary_release_date.desc", "popularity.desc"]) {
    for (let page=1; page<=4; page++) {
      const search = await tmdb("discover/movie", {
        include_adult: false,
        include_video: false,
        language: "en-CA",
        watch_region: "CA",
        with_watch_monetization_types: "free|ads",
        "primary_release_date.gte": earliest,
        "primary_release_date.lte": today,
        sort_by: sort,
        page
      });
      if (!Array.isArray(search.results)) throw new Error("Unexpected TMDB discovery response");
      for (const m of search.results) {
        if (Number.isInteger(m.id) && typeof m.title === "string" &&
            yearOf(m.release_date) >= TODAY.getUTCFullYear()-2 &&
            yearOf(m.release_date) <= TODAY.getUTCFullYear()) {
          candidates.set(m.id, m);
        }
      }
      if (!search.results.length || page >= (search.total_pages || 1)) break;
      await sleep(130);
    }
  }
  if (candidates.size === 0) throw new Error("No candidate movies; preserving previous snapshot");
  const entries = [...candidates.values()].slice(0,100);
  const found = [];
  let errors = 0;
  for (let i=0; i<entries.length; i+=4) {
    await Promise.all(entries.slice(i,i+4).map(async m => {
      try {
        const payload = await tmdb("movie/" + m.id + "/watch/providers");
        const ca = payload && payload.results && payload.results.CA;
        if (!ca) return;
        const free = Array.isArray(ca.free) ? ca.free : [];
        const ads = Array.isArray(ca.ads) ? ca.ads : [];
        const providers = uniqueProviders([...free,...ads]);
        if (!providers.length) return;
        const link = safeTmdbLink(ca.link, m.id) ||
          "https://www.themoviedb.org/movie/" + m.id + "/watch?locale=CA";
        found.push({
          id: "tmdb-" + m.id,
          tmdbId: m.id,
          title: m.title.trim().slice(0,180),
          year: yearOf(m.release_date),
          releaseDate: m.release_date,
          genre: "Movie",
          description: String(m.overview || "").slice(0,360),
          provider: providers.join(", "),
          monetization: ads.length ? "ads" : "free",
          link,
          linkType: "availability",
          poster: posterUrl(m.poster_path),
          checkedAt: today
        });
      } catch (error) {
        errors++;
        console.warn("Provider lookup failed for movie " + m.id + ": " + error.message);
      }
    }));
    await sleep(170);
  }
  if (errors > Math.max(6, Math.floor(entries.length/3))) {
    throw new Error("Provider lookups failed too often (" + errors + "); preserving previous snapshot");
  }
  if (!found.length) throw new Error("No verified Canadian free/ad-supported availability; preserving snapshot");
  found.sort((a,b)=>b.releaseDate.localeCompare(a.releaseDate) || a.title.localeCompare(b.title));
  const seen = new Set(curated.map(item => (item.title || "").toLowerCase().replace(/[^a-z0-9]+/g, "") + "-" + item.year));
  const items = [...curated];
  for (const item of found) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9]+/g, "") + "-" + item.year;
    if (seen.has(key)) continue;
    seen.add(key);
    items.push(item);
  }
  const snapshot = {
    region: "CA",
    generatedAt: TODAY.toISOString(),
    source: "official-curated-and-TMDB-JustWatch",
    count: items.length,
    items
  };
  const outfile = new URL("data/free-movies.json", ROOT);
  const temp = new URL("data/free-movies.json.tmp", ROOT);
  await writeFile(temp, JSON.stringify(snapshot,null,2) + "\n", "utf8");
  await rename(temp, outfile);
  console.log("Updated free-movie catalog: " + curated.length + " curated, " +
    found.length + " TMDB titles, " + items.length + " unique listings; Canada (free/ads only).");
}
await main();
