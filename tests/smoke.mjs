import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { Script, createContext, runInContext } from "node:vm";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const pages = ["index.html","movies.html","tv.html","search.html","detail.html","full-movies.html","watch.html"];
for (const file of ["common.js","streaming.js"]) new Script(read(file), {filename:file});
for (const page of pages) {
  const html = read(page);
  assert.match(html, /<script src="data\.js"><\/script>/);
  assert.match(html, /<script src="streaming\.js"><\/script>/);
  assert.match(html, /<script src="common\.js"><\/script>/);
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
assert(playable.length >= 2, "Full movie collection should contain two or more films");
for (const movie of playable) {
  assert.match(movie.source, /^https:\/\/archive\.org\/details\//);
  assert.match(read("streaming.js"), new RegExp(String(movie.id)));
}
assert.match(read("index.html"), /watch\.html\?id=90001/);
assert.match(read("detail.html"), /hasFullMovie\(item\)/);
assert.doesNotMatch(read("search.html"), /grid\.innerHTML\s*=\s*\x60.*\$\{q\}/);
console.log("WatchBox smoke passed: " + count + " catalog titles, " + playable.length + " playable full films, " + pages.length + " working page references.");
