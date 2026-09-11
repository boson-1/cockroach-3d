import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { chromium } from "playwright";
import { speciesList } from "../src/species.js";
import { createAtlasData } from "../src/atlas-data.js";
import { canonicalUrl, renderSitemap } from "../src/seo.js";

// Exercise the actual deployable HTML with JavaScript disabled, at both URL bases.
const dist = resolve("dist");
const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml" };
const server = createServer(async (request, response) => {
  try {
    let pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    if (pathname.startsWith("/cockroach-atlas/")) pathname = pathname.slice("/cockroach-atlas".length);
    const file = resolve(dist, "." + (pathname.endsWith("/") ? pathname + "index.html" : pathname));
    if (!file.startsWith(dist + sep)) { response.writeHead(403).end(); return; }
    const body = await readFile(file);
    response.writeHead(200, { "content-type": mime[extname(file)] || "text/plain" }).end(body);
  } catch { response.writeHead(404).end(); }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
let browser;
try {
  assert.equal(await readFile(resolve(dist, "sitemap.xml"), "utf8"), renderSitemap(), "sitemap stays consistent with page URLs and content dates");
  const robots = await readFile(resolve(dist, "robots.txt"), "utf8");
  assert.match(robots, /Sitemap: https:\/\/maxxc\.jamesboson\.com\/sitemap\.xml/);
  assert.doesNotMatch(robots, /Disallow:\s*\//i);
  browser = await chromium.launch({ headless: true, ...(process.platform === "win32" ? { channel: "msedge" } : {}) });
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 1000 } });
  // Typography must remain readable if the optional font provider is unavailable.
  await context.route("https://fonts.**/*", (route) => route.abort());
  const page = await context.newPage();
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (const base of ["/", "/cockroach-atlas/"]) {
    const titles = new Set(), descriptions = new Set();
    for (const species of speciesList) {
      const route = species.id === "american" ? "" : species.page;
      const response = await page.goto(origin + base + route, { waitUntil: "load" });
      assert.equal(response.status(), 200);
      const html = await response.text();
      assert.doesNotMatch(html, /<!-- atlas:|\/src\/main\.js|\/src\/style\.css/);
      assert.equal(await page.locator("h1").count(), 1);
      assert.equal(await page.locator("main").count(), 1);
      assert.equal(await page.locator("html").getAttribute("lang"), "zh-Hant");
      assert.equal(await page.locator('link[rel="canonical"]').count(), 1);
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute("href"), canonicalUrl(species));
      assert.equal(await page.locator('meta[property="og:url"]').getAttribute("content"), canonicalUrl(species));
      assert.doesNotMatch(await page.locator('meta[name="robots"]').getAttribute("content"), /noindex|nosnippet/);
      const title = await page.title();
      const description = await page.locator('meta[name="description"]').getAttribute("content");
      assert.ok(!titles.has(title) && !descriptions.has(description), "each species has distinct metadata");
      titles.add(title); descriptions.add(description);
      const json = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
      const webpage = json["@graph"].find((item) => Array.isArray(item["@type"]) && item["@type"].includes("WebPage"));
      assert.equal(webpage.url, canonicalUrl(species));
      assert.equal(webpage.name, title);
      assert.equal(webpage.description, description);
      assert.equal(webpage.about.name, species.latin);
      assert.equal(webpage.dateModified, await page.locator(".reading-dates time").first().getAttribute("datetime"));
      for (const part of webpage.hasPart) assert.equal(await page.locator(new URL(part["@id"]).hash).count(), 1);
      const { organs } = createAtlasData(species);
      assert.equal(await page.locator(".anatomy-entry").count(), organs.length);
      assert.ok(await page.locator("#species-notes").isVisible());
      assert.ok(await page.locator("#reading-sources").isVisible());
      assert.ok((await page.locator("#species-notes").textContent()).includes(species.diagnostic));
      assert.equal(await page.locator(".species-nav a").count(), speciesList.length);
      const ids = await page.locator("[id]").evaluateAll((nodes) => nodes.map((node) => node.id));
      assert.equal(new Set(ids).size, ids.length, "HTML IDs are unique");
      for (const href of await page.locator('a[href^="#"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")))) {
        assert.ok(ids.includes(href.slice(1)), `fragment ${href} exists`);
      }
      for (const href of await page.locator('.species-nav a').evaluateAll((nodes) => nodes.map((node) => node.href))) {
        assert.equal((await context.request.get(href)).status(), 200);
      }
      for (const width of [390, 320]) {
        await page.setViewportSize({ width, height: 844 });
        await page.locator(".anatomy-entry > summary").first().click();
        assert.ok(await page.locator(".anatomy-entry-body").first().isVisible());
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        assert.equal(overflow, false, `${species.id}: no overflow at ${width}px without JS`);
        await page.locator(".anatomy-entry > summary").first().click();
      }
      await page.setViewportSize({ width: 1440, height: 1000 });
      console.log(`PASS ${base}${route}: static content, metadata, sources, links, mobile and no-JavaScript reading`);
    }
  }
  assert.equal((await context.request.get(origin + "/missing-species.html")).status(), 404);
} finally {
  await browser?.close();
  await new Promise((done) => server.close(done));
}
