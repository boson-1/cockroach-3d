import { test } from "node:test";
import assert from "node:assert/strict";
import { organs, sources, systems, getOrgans } from "../src/data.js";
import { createSpecimen } from "../src/specimen.js";

test("every anatomical record has a selectable 3D part, anchor and valid bibliography", () => {
  const specimen = createSpecimen();
  assert.equal(organs.length, 64);
  assert.equal(new Set(organs.map((o) => o.id)).size, organs.length);
  for (const organ of organs) {
    assert.ok(specimen.parts.has(organ.id), `Missing geometry: ${organ.name}`);
    assert.ok(specimen.anchors[organ.id], `Missing anchor: ${organ.name}`);
    assert.ok(systems.some((s) => s.id === organ.system));
    assert.ok(organ.refs.length > 0);
    for (const ref of organ.refs)
      assert.ok(new URL(sources[ref].url).protocol === "https:");
    for (const component of specimen.getAnchor(organ.id).toArray())
      assert.ok(Number.isFinite(component));
  }
});

test("sex switching changes both anatomy and selectable geometry", () => {
  const specimen = createSpecimen();
  specimen.style("reproductive", 15, "female");
  let ids = new Set(specimen.visibleMeshes().map((m) => m.userData.organId));
  assert.ok(ids.has(15));
  assert.ok(!ids.has(34));
  specimen.style("reproductive", 34, "male");
  ids = new Set(specimen.visibleMeshes().map((m) => m.userData.organId));
  assert.ok(ids.has(34));
  assert.ok(!ids.has(15));
  assert.deepEqual(
    getOrgans("reproductive", "female").map((o) => o.id),
    [15, 16, 32, 33, 59, 63],
  );
  assert.deepEqual(
    getOrgans("reproductive", "male").map((o) => o.id),
    [34, 35, 36, 37, 62, 64],
  );
});

test("layers open in anatomical order and restore closed positions", () => {
  const specimen = createSpecimen();
  specimen.state.reduced = true;
  for (let depth = 0; depth <= 3; depth++) {
    specimen.state.depth = depth;
    specimen.update(1, 0);
    for (const flap of specimen.flaps)
      assert.equal(flap.open, flap.index < depth ? 1 : 0);
  }
  specimen.state.depth = 0;
  specimen.update(1, 0);
  assert.ok(specimen.flaps.every((f) => f.hinge.rotation.y === 0));
});

test("hover preview is temporary and cannot lift a deeper, covered layer", () => {
  const specimen = createSpecimen();
  specimen.state.reduced = true;
  specimen.state.preview = specimen.flaps.find((f) => f.index === 0);
  specimen.update(1, 0);
  assert.equal(specimen.state.preview.open, 0.72);
  specimen.state.preview = null;
  specimen.update(1, 0);
  assert.ok(specimen.flaps.every((f) => f.open === 0));
  specimen.state.preview = specimen.flaps.find((f) => f.index === 2);
  specimen.update(1, 0);
  assert.equal(specimen.state.preview.open, 0);
});

test("natural materials survive palette switching and internal isolation", () => {
  const specimen = createSpecimen();
  specimen.style("digestive", 57, "female");
  const tooth = specimen.visibleMeshes().find((m) => m.userData.organId === 57);
  const original = tooth.material.color.getHex();
  specimen.state.palette = "system";
  specimen.style("digestive", 57, "female");
  assert.notEqual(tooth.material.color.getHex(), original);
  specimen.state.palette = "natural";
  specimen.state.isolated = true;
  specimen.style("digestive", 57, "female");
  assert.equal(tooth.material.color.getHex(), original);
  assert.deepEqual(
    [...new Set(specimen.visibleMeshes().map((m) => m.userData.organId))],
    [57],
  );
  specimen.state.isolated = false;
  specimen.style("digestive", 57, "female");
  assert.ok(specimen.visibleMeshes().some((m) => m.userData.organId === 12));
});

test("curved surfaces have finite vertices and anatomy anchors survive opening", () => {
  const specimen = createSpecimen();
  specimen.state.reduced = true;
  specimen.state.depth = 3;
  specimen.update(1, 0);
  specimen.root.updateMatrixWorld(true);
  specimen.root.traverse((o) => {
    if (!o.isMesh) return;
    const a = o.geometry.attributes.position.array;
    for (const v of a) assert.ok(Number.isFinite(v));
  });
  for (const id of [1, 2, 3, 48, 49, 57, 58, 63, 64]) {
    assert.ok(specimen.getAnchor(id).toArray().every(Number.isFinite));
    assert.ok(specimen.getFocus(id).radius > 0);
  }
});
