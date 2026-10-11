import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { Script, createContext, runInContext } from "node:vm";

const read = path => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const pages = ["index.html","movies.html","tv.html","search.html","detail.html","full-movies.html","watch.html","new-free.html"];
for (const file of ["common.js","streaming.js","free-movies.js"]) new Script(read(file), {filename:file});
for (const page of pages) {
  const html = read(page);
  for (const library of ["data.js","streaming.js","common.js"]) {
    assert(html.includes('<script src="' + library + '"></script>'), page + " missing " + library);
  }
  assert(html.includes('href="new-free.html"'), page + " missing New & Free navigation");
  for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) {
    if (match[1].trim()) new Script(match[1], { filename:page + "#inline" });
  }
  for (const match of html.matchAll(/(?:href|src)="([^"]+\.(?:css|js|html)(?:\?[^"]*)?)"/g)) {
    const filename = match[1].split("?")[0];
    assert(existsSync(new URL("../" + filename, import.meta.url)), "Missing " + filename + " in " + page);
  }
}
const context = createContext({ window: {}, URL });
runInContext(read("data.js"), context);
runInContext(read("streaming.js"), context);
const count = runInContext("content.length", context);
const ids = runInContext("content.map(item => item.id)", context);
const playable = runInContext("content.filter(hasFullMovie).map(item => ({id:item.id,source:item.sourceUrl}))", context);
assert.equal(ids.length, new Set(ids).size, "Catalog ids must be unique");
assert(count >= 50, "Base catalog and curated full movies must load");
assert(playable.length >= 2, "Two or more authorized full movies required");
for (const movie of playable) assert.match(movie.source, /^https:\/\/archive\.org\/details\//);
assert.match(read("index.html"), /watch\.html\?id=90001/);
assert.match(read("index.html"), /id="row-new-free"/);
assert.match(read("index.html"), /src="free-movies\.js"/);
assert.match(read("detail.html"), /hasFullMovie\(item\)/);
assert.doesNotMatch(read("search.html"), /grid\.innerHTML\s*=\s*\x60.*\$\{q\}/);
assert.match(read("new-free.html"), /src="free-movies\.js"/);

const curated = JSON.parse(read("data/featured-free-movies.json"));
const snapshot = JSON.parse(read("data/free-movies.json"));
assert.equal(snapshot.region, "CA");
assert(Array.isArray(snapshot.items) && snapshot.items.length >= 7);
assert.equal(new Set(snapshot.items.map(movie=>movie.id)).size, snapshot.items.length, "Duplicate free movie IDs");
assert.equal(snapshot.count, snapshot.items.length);
for (const seed of curated.items) assert(snapshot.items.some(m=>m.id===seed.id), "Missing curated official film: " + seed.id);
for (const movie of snapshot.items) {
  assert(Number.isInteger(movie.year) && movie.year >= 1900 && movie.year <= 2100, "Invalid year");
  assert(["ads","free"].includes(movie.monetization), "Non-free monetization in catalog");
  const u = new URL(movie.link);
  assert.equal(u.protocol, "https:");
  assert(["tubitv.com","www.tubitv.com","www.themoviedb.org"].includes(u.hostname), "Untrusted watch URL");
  assert(["availability","direct"].includes(movie.linkType), "Missing link type");
  assert.equal(typeof movie.title, "string");
}
assert.match(read(".github/workflows/refresh-free-movies.yml"), /schedule:/);
assert.match(read(".github/workflows/refresh-free-movies.yml"), /TMDB_READ_ACCESS_TOKEN/);
console.log("WatchBox smoke passed: " + count + " existing catalog titles, " +
  playable.length + " embedded full films, " + snapshot.items.length +
  " legal external movie links and " + pages.length + " valid pages.");
