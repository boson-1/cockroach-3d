import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import assert from "node:assert/strict";
import { organs, systems, sources } from "../src/data.js";
import { speciesList } from "../src/species.js";
import { createAtlasData } from "../src/atlas-data.js";

// CI gives each species its own runner; the default still checks the entire atlas.
const requestedSpecies = process.env.ATLAS_SPECIES;
const selectedSpecies = speciesList.filter(
  (species) => !requestedSpecies || species.id === requestedSpecies,
);
assert.ok(selectedSpecies.length, `Unknown ATLAS_SPECIES: ${requestedSpecies}`);

// Test the production build at a project subpath, exactly as Pages serves it.
const dist = resolve("dist");
const base = "/cockroach-atlas/";
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
};
const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  if (!url.pathname.startsWith(base)) {
    res.writeHead(404);
    res.end();
    return;
  }
  const relative =
    decodeURIComponent(url.pathname.slice(base.length)) || "index.html";
  const path = resolve(dist, relative);
  if (
    !path.startsWith(
      dist + String.fromCharCode(process.platform === "win32" ? 92 : 47),
    )
  ) {
    res.writeHead(403);
    res.end();
    return;
  }
  try {
    const body = await readFile(path);
    res.writeHead(200, {
      "content-type": mime[extname(path)] || "application/octet-stream",
    });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end();
  }
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const url = `http://127.0.0.1:${server.address().port}${base}`;
let browser;
try {
  browser = await chromium.launch({
    headless: true,
    ...(process.platform === "win32" ? { channel: "msedge" } : {}),
    args: [
      "--enable-webgl",
      "--ignore-gpu-blocklist",
      "--use-gl=angle",
      "--use-angle=swiftshader",
    ],
  });
  const errors = [],
    failedAssets = [];
  if (selectedSpecies.some((species) => species.id === "american")) {
    console.log("START american: full interaction suite");
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1050 },
    });
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("response", (r) => {
      if (r.url().startsWith(url) && r.status() >= 400)
        failedAssets.push(r.url());
    });
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => window.atlasDiagnostics?.().webgl === true);
    assert.equal(
      (await page.evaluate(() => window.atlasDiagnostics())).organs,
      organs.length,
    );
    console.log("PASS production assets at a GitHub Pages subpath");

    await page.waitForTimeout(1200);
    const marker = await page.locator('[data-marker="1"]').boundingBox();
    const point = { x: marker.x + marker.width / 2 + 14, y: marker.y - 30 };
    await page.mouse.move(point.x, point.y);
    await page.waitForFunction(
      () =>
        window.atlasDiagnostics().depth === 0 &&
        window
          .atlasDiagnostics()
          .flaps.some((f) => f.layer === 0 && Math.abs(f.angle) > 0.5),
    );
    await page.mouse.move(45, 100);
    await page.waitForFunction(() =>
      window.atlasDiagnostics().flaps.every((f) => Math.abs(f.angle) < 0.02),
    );
    await page.mouse.move(point.x, point.y);
    await page.waitForTimeout(300);
    await page.mouse.click(point.x, point.y);
    await page.waitForFunction(() => window.atlasDiagnostics().depth === 1);
    await page.mouse.move(45, 100);
    await page.waitForTimeout(500);
    assert.equal((await page.evaluate(() => window.atlasDiagnostics())).depth, 1);
    console.log("PASS actual mesh hover, auto-close, click-to-pin");

    for (const s of systems) {
      await page.locator(`[data-system="${s.id}"]`).click();
      for (const o of organs.filter((o) => o.system === s.id)) {
        if (o.sex) await page.locator(`[data-sex="${o.sex}"]`).click();
        await page.locator(`.organ-row[data-organ="${o.id}"]`).click();
        assert.equal(
          await page.locator("#organ-detail h2").textContent(),
          o.name,
        );
        const d = await page.evaluate(() => window.atlasDiagnostics());
        assert.equal(d.selected, o.id);
        assert.ok(d.pickableIds.includes(o.id), `${o.name} is selectable`);
        if (o.sex === "male") assert.ok(!d.pickableIds.includes(15));
        if (o.sex === "female") assert.ok(!d.pickableIds.includes(34));
      }
    }
    console.log("PASS all 64 organ entries and sex-specific geometry");

    await page.locator('[data-palette="system"]').click();
    assert.equal(
      (await page.evaluate(() => window.atlasDiagnostics())).palette,
      "system",
    );
    await page.locator('[data-palette="natural"]').click();
    assert.equal(
      (await page.evaluate(() => window.atlasDiagnostics())).palette,
      "natural",
    );
    await page.locator('[data-system="digestive"]').click();
    await page.locator('.organ-row[data-organ="57"]').click();
    await page.locator("#inspect-part").click();
    let closeup = await page.evaluate(() => window.atlasDiagnostics());
    assert.equal(closeup.isolated, true);
    assert.deepEqual(closeup.pickableIds, [57]);
    await page.locator('[data-view="ventral"]').click();
    assert.equal(
      (await page.evaluate(() => window.atlasDiagnostics())).view,
      "ventral",
    );
    await page.locator("#inspect-part").click();
    assert.equal(
      (await page.evaluate(() => window.atlasDiagnostics())).isolated,
      false,
    );
    console.log(
      "PASS natural/system palette, isolated internal detail and ventral view",
    );
    await page.locator("#specimen-canvas").focus();
    await page.keyboard.press("ArrowLeft");
    assert.equal((await page.evaluate(() => window.atlasDiagnostics())).depth, 2);
    await page.keyboard.press("ArrowRight");
    assert.equal((await page.evaluate(() => window.atlasDiagnostics())).depth, 3);
    await page.locator('[data-view="side"]').click();
    assert.equal(
      (await page.evaluate(() => window.atlasDiagnostics())).view,
      "side",
    );
    await page.locator("#labels-toggle").click();
    assert.equal(await page.locator("#markers").isVisible(), false);
    await page.locator("#labels-toggle").click();
    await page.locator("#sources-open").click();
    assert.equal(
      await page.locator(".bibliography article").count(),
      Object.keys(sources).length,
    );
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("#notes-dialog").isVisible(), false);
    await page.locator("#reset-view").click();
    assert.equal((await page.evaluate(() => window.atlasDiagnostics())).depth, 0);
    console.log("PASS keyboard, views, labels, source dialog and reset");
    await page.setViewportSize({ width: 390, height: 844 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    await page.locator('[data-system="reproductive"]').click();
    await page.locator('[data-sex="male"]').click();
    assert.equal(
      (await page.evaluate(() => window.atlasDiagnostics())).sex,
      "male",
    );
    await page.setViewportSize({ width: 320, height: 740 });
    assert.ok(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    );
    console.log("PASS responsive layout at 390px and 320px");
    await page.close(); // Release the first WebGL context before mobile shader warmup.
  }
  for (const species of selectedSpecies.filter((s) => s.id !== "american")) {
    console.log("START " + species.id + ": full interaction suite");
    const p = await browser.newPage({
      viewport: { width: 1440, height: 1080 },
      reducedMotion: "reduce",
    });
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("response", (r) => {
      if (r.url().startsWith(url) && r.status() >= 400)
        failedAssets.push(r.url());
    });
    const atlas = createAtlasData(species);
    await p.goto(url + species.page, { waitUntil: "domcontentloaded" });
    await p.waitForFunction(() => window.atlasDiagnostics?.().webgl);
    let d = await p.evaluate(() => atlasDiagnostics());
    assert.equal(d.species, species.id);
    assert.equal(d.organs, atlas.organs.length);
    assert.equal(
      await p.locator('.species-link[aria-current="page"]').count(),
      1,
    );
    assert.equal(await p.locator(".species-link").count(), speciesList.length);
    for (const system of systems) {
      await p.locator('[data-system="' + system.id + '"]').click();
      for (const o of atlas.organs.filter((o) => o.system === system.id)) {
        if (o.sex) await p.locator('[data-sex="' + o.sex + '"]').click();
        await p.locator('.organ-row[data-organ="' + o.id + '"]').click();
        const d = await p.evaluate(() => atlasDiagnostics());
        assert.equal(d.selected, o.id);
        assert.ok(d.pickableIds.includes(o.id), species.id + ":" + o.id);
      }
    }
    if (species.id === "brown-banded") {
      await p.locator('[data-sex="female"]').click();
      assert.equal(
        (await p.evaluate(() => atlasDiagnostics())).wingFactor,
        0.7,
      );
      await p.locator('.organ-row[data-organ="65"]').click();
      await p.locator("#inspect-part").click();
      assert.deepEqual(
        (await p.evaluate(() => atlasDiagnostics())).pickableIds,
        [65],
      );
      await p.locator("#inspect-part").click();
      await p.locator('[data-sex="male"]').click();
      assert.equal(
        (await p.evaluate(() => atlasDiagnostics())).wingFactor,
        1.02,
      );
    }
    await p.locator("#reset-view").click();
    if (species.id === "brown-banded") {
      await p.locator('[data-view="top"]').click();
      await p.locator('[data-sex="male"]').click();
      await p.mouse.move(0, 0);
      const before = await p.locator("#stage").screenshot();
      await p.locator('[data-palette="system"]').click();
      await p.locator('[data-sex="female"]').click();
      await p.locator('[data-palette="natural"]').click();
      await p.locator('[data-sex="male"]').click();
      await p.mouse.move(0, 0);
      assert.ok(
        before.equals(await p.locator("#stage").screenshot()),
        "sex-specific wing texture survives palette and sex round trip",
      );
    }
    if (species.reducedWings) {
      assert.equal(await p.locator('[data-depth="2"]').count(), 0);
      assert.ok(
        !(await p.evaluate(() => atlasDiagnostics())).pickableIds.includes(2),
      );
      await p.locator("#specimen-canvas").focus();
      for (const [key, depth] of [
        ["ArrowRight", 1],
        ["ArrowRight", 3],
        ["ArrowLeft", 1],
        ["ArrowLeft", 0],
      ]) {
        await p.keyboard.press(key);
        assert.equal((await p.evaluate(() => atlasDiagnostics())).depth, depth);
      }
    }
    await p.locator('[data-system="digestive"]').click();
    await p.locator('.organ-row[data-organ="13"]').click();
    assert.match(await p.locator(".evidence-badge").textContent(), /比較解剖/);
    await p.locator(".reference-detail summary").click();
    assert.match(
      await p.locator(".reference-detail").textContent(),
      /美洲蟑螂/,
    );
    await p.locator("#sources-open").click();
    assert.equal(
      await p.locator(".bibliography article").count(),
      Object.keys(atlas.sources).length,
    );
    await p.keyboard.press("Escape");
    await p.locator(".species-comparison summary").click();
    assert.equal(
      await p.locator(".species-comparison tbody tr").count(),
      speciesList.length,
    );
    for (const width of [390, 320]) {
      await p.setViewportSize({ width, height: 844 });
      assert.ok(
        await p.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        species.id + " overflow " + width,
      );
    }
    console.log(
      "PASS " +
        species.id +
        ": all organ entries, variants, citations, routes and mobile layout",
    );
    await p.close();
  }
  const touch = await browser.newPage({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  await touch.goto(url + selectedSpecies[0].page, { waitUntil: "domcontentloaded" });
  await touch.waitForFunction(() => window.atlasDiagnostics?.().webgl);
  await touch.locator('[data-depth="3"]').tap();
  assert.equal(
    (await touch.evaluate(() => window.atlasDiagnostics())).depth,
    3,
  );
  await touch.locator('[data-system="digestive"]').tap();
  await touch.locator('.organ-row[data-organ="13"]').tap();
  assert.equal(await touch.locator("#organ-detail h2").textContent(), "馬氏管");
  console.log("PASS touch interaction");
  await touch.close();
  const fallback = await browser.newPage();
  await fallback.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type.startsWith("webgl")
        ? null
        : original.call(this, type, ...args);
    };
  });
  await fallback.goto(url + selectedSpecies[0].page, { waitUntil: "domcontentloaded" });
  await fallback.waitForSelector("#model-fallback", { state: "visible" });
  await fallback.locator('[data-system="digestive"]').click();
  await fallback.locator('.organ-row[data-organ="12"]').click();
  assert.equal(
    await fallback.locator("#organ-detail h2").textContent(),
    "中腸",
  );
  console.log("PASS readable WebGL fallback");
  assert.deepEqual(errors, []);
  assert.deepEqual(failedAssets, []);
  console.log("PASS no runtime errors or failed local assets");
} finally {
  await browser?.close();
  await new Promise((r) => server.close(r));
}
