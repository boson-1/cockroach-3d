import { test } from "node:test";
import assert from "node:assert/strict";
import {
  speciesList,
  speciesById,
  speciesFromPath,
  layersFor,
} from "../src/species.js";
import { createAtlasData } from "../src/atlas-data.js";
import { createSpecimen } from "../src/specimen.js";

test("static page routes resolve at the root and under a GitHub Pages project", () => {
  for (const s of speciesList)
    for (const prefix of ["/", "/cockroach-atlas/"])
      assert.equal(speciesFromPath(prefix + s.page).id, s.id);
  assert.equal(speciesFromPath("/cockroach-atlas/").id, "american");
  assert.equal(new Set(speciesList.map((s) => s.page)).size, 6);
  assert.equal(speciesById.get("brown").latin, "Validiblatta brunnea");
});
test("every species has geometry, valid references, and explicit comparator evidence", () => {
  for (const s of speciesList) {
    const a = createAtlasData(s),
      m = createSpecimen(s);
    assert.equal(a.organs.length, m.parts.size);
    for (const o of a.organs) {
      assert.ok(m.parts.has(o.id), s.id + ":" + o.id);
      assert.ok(m.getAnchor(o.id).toArray().every(Number.isFinite));
      for (const ref of o.refs) assert.ok(a.sources[ref], ref);
      if (s.id !== "american" && o.referenceDetail)
        assert.match(o.evidence, /美洲蟑螂/);
    }
    for (const sex of ["female", "male"]) {
      m.state.depth = 3;
      m.style("reproductive", sex === "female" ? 15 : 34, sex);
      const ids = new Set(m.visibleMeshes().map((o) => o.userData.organId));
      for (const part of a.organs.filter((o) => o.sex && o.sex !== sex))
        assert.ok(!ids.has(part.id), s.id + " wrong-sex " + part.id);
    }
  }
});
test("harlequin has reduced forewings and no hindwing layer, geometry, or record", () => {
  const s = speciesById.get("harlequin"),
    a = createAtlasData(s),
    m = createSpecimen(s);
  assert.equal(a.organById.has(2), false);
  assert.equal(m.parts.has(2), false);
  assert.deepEqual(
    layersFor(s).map((l) => l.depth),
    [0, 1, 3],
  );
  assert.deepEqual([...new Set(m.flaps.map((f) => f.id))].sort(), [1, 3]);
  m.state.reduced = true;
  m.state.depth = 1;
  m.state.preview = m.flaps.find((f) => f.id === 3);
  m.update(1, 0);
  assert.equal(m.state.preview.open, 0.72);
  m.state.preview = null;
  m.update(1, 0);
  assert.ok(m.flaps.filter((f) => f.id === 3).every((f) => f.open === 0));
});
test("brown-banded sex switching changes actual wing vertices and preserves them on round trip", () => {
  const m = createSpecimen(speciesById.get("brown-banded"));
  const extents = () => {
    const ys = [];
    for (const g of m.parts.get(1))
      g.traverse((o) => {
        if (o.isMesh) {
          const p = o.geometry.attributes.position;
          for (let i = 0; i < p.count; i++) ys.push(p.getY(i));
        }
      });
    return [Math.min(...ys), Math.max(...ys)];
  };
  m.style("external", 1, "female");
  const female = extents();
  m.style("external", 1, "male");
  const male = extents();
  assert.ok(
    male[0] < female[0] - 1,
    "male wing must extend farther down abdomen",
  );
  m.style("external", 1, "female");
  assert.deepEqual(extents(), female);
});
test("German ovaries have greater modeled ovariole structure and exclusive male gland", () => {
  const am = createSpecimen(),
    ge = createSpecimen(speciesById.get("german"));
  const count = (m) => {
    let n = 0;
    for (const g of m.parts.get(59))
      g.traverse((o) => {
        if (o.isMesh) n += o.geometry.attributes.position.count;
      });
    return n;
  };
  assert.equal(count(ge) / count(am), 20 / 8);
  ge.style("reproductive", 66, "male");
  assert.ok(ge.visibleMeshes().some((o) => o.userData.organId === 66));
  ge.style("reproductive", 15, "female");
  assert.ok(!ge.visibleMeshes().some((o) => o.userData.organId === 66));
});
test("intact short-winged specimens enclose the internal reference organs", () => {
  for (const id of ["brown-banded", "harlequin"]) {
    const m = createSpecimen(speciesById.get(id));
    m.state.reduced = true;
    m.style("external", 1, "female");
    m.update(1, 0);
    let ids = new Set(m.visibleMeshes().map((o) => o.userData.organId));
    for (const o of [5, 6, 7, 11, 13, 15]) assert.ok(!ids.has(o));
    for (const o of [17, 18, 24, 25, 40, 51, 53])
      assert.ok(ids.has(o), "Exposed structure must remain visible: " + o);
    m.state.depth = 3;
    m.update(1, 0);
    ids = new Set(m.visibleMeshes().map((o) => o.userData.organId));
    assert.ok(ids.has(5));
    assert.ok(ids.has(13));
  }
});
