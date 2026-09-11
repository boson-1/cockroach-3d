import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import {
  createIcons,
  BookOpen,
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Plus,
  Minus,
  Layers,
  Scan,
  Route,
  Wind,
  HeartPulse,
  Activity,
  Sprout,
  Move,
  MousePointer2,
  X,
  List,
  Info,
  Maximize,
  Check,
  Eye,
} from "lucide";
import { createAtlasData, systems, systemById } from "./atlas-data.js";
import { speciesList, speciesFromPath, layersFor } from "./species.js";
const species = speciesFromPath(location.pathname);
const { organs, organById, sources, getOrgans, requiredDepth } =
  createAtlasData(species);
const layerOptions = layersFor(species);
document.documentElement.dataset.species = species.id;
import { createSpecimen, createBook } from "./specimen.js";

const icons = {
  BookOpen,
  ArrowUpRight,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Plus,
  Minus,
  Layers,
  Scan,
  Route,
  Wind,
  HeartPulse,
  Activity,
  Sprout,
  Move,
  MousePointer2,
  X,
  List,
  Info,
  Maximize,
  Check,
  Eye,
};
const icon = (name) => `<i data-lucide="${name}" aria-hidden="true"></i>`;
const paintIcons = () => createIcons({ icons, attrs: { "stroke-width": 1.5 } });
const pad = (id) => String(id).padStart(2, "0");
const state = {
  system: "external",
  selected: 1,
  depth: 0,
  sex: "female",
  labels: true,
  palette: "natural",
  isolated: false,
  view: "book",
  seen: new Set([1]),
};

// The initial page is static HTML; enhance it without replacing readable content.


let specimen = null,
  scene = null,
  camera = null,
  renderer = null;
const detail = document.querySelector("#organ-detail");

function renderList() {
  const list = getOrgans(state.system, state.sex);
  document.querySelector("#list-count").textContent = `${list.length} 部位`;
  document.querySelector("#organ-list").innerHTML = list
    .map(
      (o) =>
        `<button class="organ-row ${state.selected === o.id ? "selected" : ""}" data-organ="${o.id}" aria-pressed="${state.selected === o.id}"><span>${pad(o.id)}</span><span>${o.name}</span>${state.seen.has(o.id) ? '<span class="seen-dot" aria-label="已讀"></span>' : ""}</button>`,
    )
    .join("");
}
function renderDetail() {
  const o = organById.get(state.selected),
    s = systemById.get(o.system);
  detail.innerHTML = `<div class="detail-kicker"><span>部位觀察</span><span style="color:${s.color}">${s.name}</span></div><div class="detail-title"><span class="big-number" style="color:${s.color}">${pad(o.id)}</span><span class="specimen-stamp">ANATOMY<br>FIELD NOTES</span></div><h2>${o.name}</h2><p class="latin">${o.en}</p><div class="location">${icon("scan")}<span>${o.location}</span></div><button id="inspect-part" class="inspect-part ${state.isolated ? "active" : ""}" aria-pressed="${state.isolated}">${icon("maximize")} ${state.isolated ? "返回完整標本" : "局部放大觀察"}</button><div class="evidence-badge ${o.referenceDetail ? "comparator" : ""}">${o.evidence}</div><p class="organ-summary">${o.description}</p><p class="organ-body">${o.detail}</p><div class="did-you-know"><span>${icon("eye")} 觀察筆記</span><p>${o.note}</p></div>${o.referenceDetail ? `<details class="reference-detail"><summary>比較來源的詳細解說</summary><p><strong>參考物種：美洲蟑螂</strong></p><p>${o.referenceDetail}</p></details>` : ""}<div class="source-links"><span>資料依據</span>${o.refs.map((ref) => `<a href="${sources[ref].url}" target="_blank" rel="noopener noreferrer" title="${sources[ref].title}">${sources[ref].label ?? sources[ref].author}${icon("arrow-up-right")}</a>`).join("")}</div>`;
  const list = getOrgans(state.system, state.sex);
  document.querySelector("#detail-position").textContent =
    `${pad(list.findIndex((x) => x.id === o.id) + 1)} / ${pad(list.length)}`;
  document.querySelector("#seen-count").textContent = state.seen.size;
  paintIcons();
}
function setDepth(depth) {
  state.depth = Math.max(0, Math.min(3, depth));
  if (species.reducedWings && state.depth === 2) state.depth = 3;
  if (specimen) {
    specimen.state.depth = state.depth;
    specimen.state.preview = null;
  }
  document.querySelectorAll("[data-depth]").forEach((b) => {
    b.classList.toggle("active", Number(b.dataset.depth) === state.depth);
    b.classList.toggle("passed", Number(b.dataset.depth) < state.depth);
    b.setAttribute(
      "aria-pressed",
      String(Number(b.dataset.depth) === state.depth),
    );
  });
  document.querySelector("#open-all span").textContent =
    state.depth === 3 ? "闔上所有翻片" : "逐層展開";
  document.querySelector("#depth-caption").textContent = [
    "外觀 · 尚未掀頁",
    species.reducedWings
      ? "退化前翅已掀開 · 本種無後翅"
      : "第一層 · 前翅已掀開",
    "第二層 · 後翅已展開",
    "第三層 · 內部器官",
  ][state.depth];
  document
    .querySelector("#hover-cue")
    .classList.toggle("subtle", state.depth === 3);
  document.querySelector("#hover-cue span").textContent =
    state.depth === 3 ? "點選編號，閱讀器官筆記" : "移到翻片上，掀開下一層";
  buildMarkers();
}
function selectOrgan(id, { open = true } = {}) {
  const o = organById.get(Number(id));
  if (!o) return;
  state.selected = o.id;
  state.seen.add(o.id);
  state.system = o.system;
  if (o.sex && o.sex !== state.sex) setSex(o.sex, false);
  if (open && requiredDepth(o) > state.depth) setDepth(requiredDepth(o));
  document.querySelectorAll("[data-system]").forEach((b) => {
    const active = b.dataset.system === state.system;
    b.classList.toggle("active", active);
    b.setAttribute("aria-pressed", String(active));
  });
  document.querySelector("#plate-title").textContent = systemById.get(
    state.system,
  ).name;
  specimen?.style(state.system, state.selected, state.sex);
  renderList();
  renderDetail();
  buildMarkers();
}
function setSystem(system) {
  state.system = system;
  const first = getOrgans(system, state.sex)[0];
  if (system === "external") setDepth(0);
  else setDepth(3);
  selectOrgan(first.id);
}
function setSex(sex, select = true) {
  state.sex = sex;
  document.querySelectorAll("[data-sex]").forEach((b) => {
    const a = b.dataset.sex === sex;
    b.classList.toggle("active", a);
    b.setAttribute("aria-pressed", String(a));
  });
  if (select && organById.get(state.selected).sex)
    selectOrgan(getOrgans("reproductive", sex)[0].id);
  else {
    specimen?.style(state.system, state.selected, state.sex);
    renderList();
    renderDetail();
    buildMarkers();
  }
}
function navigateOrgan(delta) {
  const list = getOrgans(state.system, state.sex);
  const i = list.findIndex((o) => o.id === state.selected);
  selectOrgan(list[(i + delta + list.length) % list.length].id);
}

let markerIds = [];
function buildMarkers() {
  if (!specimen) return;
  const preferred = {
    external:
      state.depth === 0
        ? [17, 22, 1, 23, 24]
        : state.depth === 1
          ? [1, 2, 22, 23]
          : state.depth === 2
            ? [2, 3, 23]
            : [3, 31, 23],
    digestive: [9, 11, 26, 12, 13, 14],
    respiratory: [4, 25],
    circulatory: [5, 6, 30],
    nervous: [17, 18, 29, 8, 7, 24],
    reproductive: state.sex === "female" ? [15, 16, 32, 33] : [34, 35, 36, 37],
  };
  markerIds = [
    ...new Set([
      state.selected,
      ...(state.isolated ? [] : preferred[state.system]),
    ]),
  ].filter((id) => {
    const o = organById.get(id);
    return o && (!o.sex || o.sex === state.sex);
  });
  document.querySelector("#markers").innerHTML =
    '<svg class="marker-leaders" aria-hidden="true"></svg>' +
    markerIds
      .map((id) => {
        const o = organById.get(id);
        return `<button class="marker ${id === state.selected ? "selected" : ""}" data-organ="${id}" data-marker="${id}" style="--marker-color:${systemById.get(o.system).color}" aria-label="${pad(id)} ${o.name}"><span class="marker-dot">${pad(id)}</span><span class="marker-label">${o.name}</span></button>`;
      })
      .join("");
  document.querySelector("#markers").hidden = !state.labels;
  document.querySelector("#hover-cue").hidden = state.isolated;
}

const stage = document.querySelector("#stage"),
  canvas = document.querySelector("#specimen-canvas");
let lastPointerHit = null;
let zoom = 1,
  zoomTarget = 1,
  rotationX = 0,
  rotationY = 0,
  drag = null,
  hoverFlap = null,
  hoverLocked = false;
const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
let available = true;
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6));
  renderer.setClearColor(0xf4f0e4, 0);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.91;
  scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer),
    studio = new RoomEnvironment();
  const environment = pmrem.fromScene(studio, 0.04);
  scene.environment = environment.texture;
  scene.environmentIntensity = 0.68;
  studio.dispose();
  pmrem.dispose();
  camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
  camera.position.set(1.25, -2.8, 14.9);
  camera.lookAt(0, 0.5, 0);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x756d60, 0.65));
  const sun = new THREE.DirectionalLight(0xffffff, 2.35);
  sun.position.set(-5, 5, 9);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -7;
  sun.shadow.camera.right = 7;
  sun.shadow.camera.top = 7;
  sun.shadow.camera.bottom = -7;
  sun.shadow.normalBias = 0.022;
  sun.shadow.bias = -0.0002;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xffffff, 0.6);
  fill.position.set(4, -2, 7);
  scene.add(fill);
  const group = new THREE.Group();
  group.name = "book-and-specimen";
  scene.add(group);
  const specimenFloor = createBook();
  group.add(specimenFloor);
  specimen = createSpecimen(species);
  group.add(specimen.root);
  specimen.state.reduced = reduced.matches;
  specimen.style(state.system, state.selected, state.sex);
  function resize() {
    const { width, height } = stage.getBoundingClientRect();
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);
  resize();
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  let prev = performance.now(),
    running = true,
    frameId = 0,
    lastMarker = 0;
  const views = {
    book: [1.25, -2.8, 14.9],
    top: [0, 0.52, 15.4],
    side: [12.8, 0.6, 4.9],
    ventral: [0, 0.5, -15.4],
  };
  const lookTarget = new THREE.Vector3(0, 0.5, 0);
  function frame(now) {
    if (!running) return;
    frameId = requestAnimationFrame(frame);
    const dt = Math.min((now - prev) / 1000, 0.08);
    prev = now;
    const t = reduced.matches ? 1 : 1 - Math.exp(-dt * 7);
    const target = new THREE.Vector3(...views[state.view]);
    const look = new THREE.Vector3(0, 0.5, 0);
    if (state.isolated) {
      group.updateMatrixWorld(true);
      const focus = specimen.getFocus(state.selected);
      look.copy(focus.center);
      const distance =
        (focus.radius / Math.tan(THREE.MathUtils.degToRad(18))) * 1.55;
      target
        .sub(new THREE.Vector3(0, 0.5, 0))
        .normalize()
        .multiplyScalar(distance)
        .add(look);
    }
    lookTarget.lerp(look, t);
    camera.position.lerp(target, t);
    camera.lookAt(lookTarget);
    specimenFloor.visible =
      state.view !== "ventral" &&
      !state.isolated &&
      Math.abs(rotationX) < 0.5 &&
      Math.abs(rotationY) < 0.8;
    zoom = THREE.MathUtils.lerp(zoom, zoomTarget, t);
    camera.zoom = zoom * Math.min(0.93, camera.aspect / 0.9);
    camera.updateProjectionMatrix();
    group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, rotationX, t);
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, rotationY, t);
    specimen.state.reduced = reduced.matches;
    specimen.update(dt, now / 1000);
    renderer.render(scene, camera);
    if (now - lastMarker > 32) {
      const w = stage.clientWidth,
        h = stage.clientHeight;
      const projected = [];
      for (const id of markerIds) {
        const el = document.querySelector(`[data-marker="${id}"]`);
        if (!el) continue;
        const p = specimen.getAnchor(id).project(camera);
        const x = (p.x * 0.5 + 0.5) * w,
          y = (-p.y * 0.5 + 0.5) * h;
        el.style.left = `${x}px`;
        el.style.top = `${y}px`;
        const visible = x >= 24 && x <= w - 24 && y >= 65 && y <= h - 65;
        el.style.visibility = visible ? "visible" : "hidden";
        if (visible)
          projected.push({
            el,
            id,
            x,
            y,
            side: id % 2 ? -1 : 1,
            labelY: Math.max(85, Math.min(h - 112, y)),
          });
      }
      const paths = [];
      for (const side of [-1, 1]) {
        const list = projected
          .filter((p) => p.side === side)
          .sort((a, b) => a.labelY - b.labelY);
        for (let i = 1; i < list.length; i++)
          list[i].labelY = Math.max(list[i].labelY, list[i - 1].labelY + 32);
        for (let i = list.length - 1; i >= 0; i--) {
          const limit =
            i === list.length - 1 ? h - 106 : list[i + 1].labelY - 32;
          list[i].labelY = Math.min(list[i].labelY, limit);
        }
        for (const p of list) {
          const label = p.el.querySelector(".marker-label");
          const labelW = label.offsetWidth;
          const labelX = side === -1 ? 27 : w - labelW - 21;
          label.style.left = `${labelX - p.x + 13}px`;
          label.style.top = `${p.labelY - p.y + 13}px`;
          const endX = side === -1 ? labelX + labelW + 5 : labelX - 5;
          const endY = p.labelY;
          const startX = p.x + side * 13;
          paths.push(
            `<path d="M ${startX} ${p.y} L ${endX - side * 9} ${endY} L ${endX} ${endY}"/>`,
          );
        }
      }
      document.querySelector(".marker-leaders").innerHTML = paths.join("");
      lastMarker = now;
    }
  }
  frameId = requestAnimationFrame(frame);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      running = false;
      cancelAnimationFrame(frameId);
    } else if (!running) {
      running = true;
      prev = performance.now();
      frameId = requestAnimationFrame(frame);
    }
  });
  function hit(event) {
    const b = canvas.getBoundingClientRect();
    pointer.set(
      ((event.clientX - b.left) / b.width) * 2 - 1,
      (-(event.clientY - b.top) / b.height) * 2 + 1,
    );
    raycaster.setFromCamera(pointer, camera);
    const result = raycaster.intersectObjects(
      specimen.visibleMeshes(),
      false,
    )[0];
    lastPointerHit = result?.object.userData.organId ?? null;
    return result;
  }
  function findFlap(object) {
    return specimen.flaps.find((f) => {
      let a = object;
      while (a) {
        if (a === f.group) return true;
        a = a.parent;
      }
      return false;
    });
  }
  canvas.addEventListener("pointerdown", (e) => {
    drag = {
      x: e.clientX,
      y: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      moved: false,
    };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (drag) {
      const dx = e.clientX - drag.lastX,
        dy = e.clientY - drag.lastY;
      if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) > 5)
        drag.moved = true;
      if (drag.moved) {
        rotationY = THREE.MathUtils.clamp(
          rotationY + dx * 0.006,
          -Math.PI,
          Math.PI,
        );
        rotationX = THREE.MathUtils.clamp(
          rotationX + dy * 0.006,
          -Math.PI,
          Math.PI,
        );
        specimen.state.preview = null;
        canvas.style.cursor = "grabbing";
      }
      drag.lastX = e.clientX;
      drag.lastY = e.clientY;
      return;
    }
    if (e.pointerType === "touch") return;
    const result = hit(e);
    const f = result ? findFlap(result.object) : null;
    // Keep a lifted flap open until leaving the specimen. Re-raycasting only the
    // moving flap would oscillate as it leaves the pointer's original position.
    if (!hoverLocked && f && f.previewDepth === state.depth) {
      hoverFlap = f;
      specimen.state.preview = f;
      hoverLocked = true;
    }
    if (hoverLocked && !result) {
      specimen.state.preview = null;
      hoverFlap = null;
      hoverLocked = false;
    }
    canvas.style.cursor = result ? "pointer" : "grab";
  });
  canvas.addEventListener("pointerleave", () => {
    if (!drag) {
      specimen.state.preview = null;
      hoverFlap = null;
      hoverLocked = false;
      canvas.style.cursor = "grab";
    }
  });
  canvas.addEventListener("pointerup", (e) => {
    if (drag && !drag.moved) {
      const result = hit(e);
      const f = hoverFlap || (result ? findFlap(result.object) : null);
      if (f) {
        setDepth(state.depth > f.index ? f.previewDepth : f.index + 1);
        selectOrgan(f.id, { open: false });
      } else if (result?.object.userData.organId)
        selectOrgan(result.object.userData.organId);
    }
    drag = null;
    hoverFlap = null;
    hoverLocked = false;
    canvas.style.cursor = "grab";
  });
  canvas.addEventListener("pointercancel", () => {
    drag = null;
    hoverFlap = null;
    hoverLocked = false;
    specimen.state.preview = null;
  });
  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      zoomTarget = THREE.MathUtils.clamp(
        zoomTarget - e.deltaY * 0.001,
        0.72,
        2.4,
      );
    },
    { passive: false },
  );
  canvas.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const index = layerOptions.findIndex((l) => l.depth === state.depth);
      setDepth(
        layerOptions[
          Math.max(
            0,
            Math.min(
              layerOptions.length - 1,
              index + (e.key === "ArrowRight" ? 1 : -1),
            ),
          )
        ].depth,
      );
    } else if (e.key === "Escape") {
      setDepth(0);
    } else if (e.key === "+" || e.key === "=")
      zoomTarget = Math.min(2.4, zoomTarget + 0.12);
    else if (e.key === "-") zoomTarget = Math.max(0.72, zoomTarget - 0.12);
  });
  canvas.addEventListener("webglcontextlost", (e) => {
    e.preventDefault();
    document.querySelector("#model-fallback").hidden = false;
    document.querySelector("#markers").hidden = true;
  });
  canvas.addEventListener("webglcontextrestored", () => {
    document.querySelector("#model-fallback").hidden = true;
    buildMarkers();
  });
} catch (error) {
  available = false;
  document.querySelector("#model-fallback").hidden = false;
  canvas.hidden = true;
  document.querySelector("#hover-cue").hidden = true;
  console.error("3D initialization failed", error);
}

document.addEventListener("click", (e) => {
  const system = e.target.closest("[data-system]");
  if (system) setSystem(system.dataset.system);
  const depth = e.target.closest("[data-depth]");
  if (depth) {
    setDepth(Number(depth.dataset.depth));
    if (state.depth < 3 && state.system !== "external")
      selectOrgan(
        species.reducedWings
          ? state.depth === 0
            ? 1
            : 3
          : [1, 2, 3][Math.min(state.depth, 2)],
        { open: false },
      );
  }
  const palette = e.target.closest("[data-palette]");
  if (palette) {
    state.palette = palette.dataset.palette;
    if (specimen) {
      specimen.state.palette = state.palette;
      specimen.style(state.system, state.selected, state.sex);
    }
    document.querySelectorAll("[data-palette]").forEach((b) => {
      const active = b.dataset.palette === state.palette;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    document.querySelector("#render-mode-note").textContent =
      state.palette === "natural" ? "外觀近似原色" : "顏色用於辨識系統";
  }
  if (e.target.closest("#inspect-part")) {
    state.isolated = !state.isolated;
    zoomTarget = 1;
    rotationX = rotationY = 0;
    if (specimen) {
      specimen.state.isolated = state.isolated;
      specimen.state.preview = null;
      specimen.style(state.system, state.selected, state.sex);
    }
    renderDetail();
    buildMarkers();
  }
  const organ = e.target.closest("[data-organ]");
  if (organ) selectOrgan(Number(organ.dataset.organ));
  const sex = e.target.closest("[data-sex]");
  if (sex) setSex(sex.dataset.sex);
  const view = e.target.closest("[data-view]");
  if (view) setView(view.dataset.view);
});
function setView(view) {
  state.view = view;
  rotationX = 0;
  rotationY = 0;
  document.querySelectorAll("[data-view]").forEach((b) => {
    const a = b.dataset.view === view;
    b.classList.toggle("active", a);
    b.setAttribute("aria-pressed", String(a));
  });
}
document.querySelector("#open-all").addEventListener("click", () => {
  setDepth(state.depth === 3 ? 0 : 3);
  if (state.depth === 0) selectOrgan(1, { open: false });
});
document
  .querySelector("#prev-organ")
  .addEventListener("click", () => navigateOrgan(-1));
document
  .querySelector("#next-organ")
  .addEventListener("click", () => navigateOrgan(1));
document
  .querySelector("#zoom-in")
  .addEventListener(
    "click",
    () => (zoomTarget = Math.min(1.65, zoomTarget + 0.15)),
  );
document
  .querySelector("#zoom-out")
  .addEventListener(
    "click",
    () => (zoomTarget = Math.max(0.72, zoomTarget - 0.15)),
  );
document.querySelector("#labels-toggle").addEventListener("click", (e) => {
  state.labels = !state.labels;
  document.querySelector("#markers").hidden = !state.labels;
  e.currentTarget.setAttribute("aria-pressed", String(state.labels));
});
document.querySelector("#reset-view").addEventListener("click", () => {
  state.isolated = false;
  if (specimen) specimen.state.isolated = false;
  zoomTarget = 1;
  rotationX = rotationY = 0;
  setView("book");
  setDepth(0);
  selectOrgan(1, { open: false });
});

const dialog = document.querySelector("#notes-dialog");
function showNotes(kind) {
  document.querySelector("#dialog-title").textContent =
    kind === "help" ? "像翻書一樣，開始探索。" : "每一個標註，都有來處。";
  document.querySelector("#dialog-content").innerHTML =
    kind === "help"
      ? `
    <div class="help-grid"><article><span>01</span><h3>滑過與掀開</h3><p>把滑鼠移到前翅、後翅或背板上，翻片會抬起。移到標本之外，暫時掀起的翻片會闔上。</p></article><article><span>02</span><h3>點按與固定</h3><p>點一下翻片，固定展開到該層。也可直接使用左側「翻閱層次」或「逐層展開」。手機使用相同的點按方式。</p></article><article><span>03</span><h3>探索每個部位</h3><p>點編號或器官目錄，右頁會顯示位置、功能與來源。切換系統會自動打開外層，並淡化其他器官。按「局部放大觀察」可獨立檢視所選構造；腹面視角可查看口器、跗墊與末端腹板。</p></article><article><span>04</span><h3>轉動與鍵盤</h3><p>拖曳標本可轉動；滾輪或 ＋／－ 可縮放。聚焦模型後，左右方向鍵控制層次，Esc 闔上。Tab 可巡覽所有操作，Enter 或空白鍵啟動按鈕。</p></article></div>
    <p class="method-note">系統會尊重「減少動態效果」偏好。若瀏覽器無法使用 WebGL 2，仍可由器官目錄閱讀所有文字與來源。</p>`
      : `
    <div class="method-note"><h3>從立體書出發，重新建構。</h3><p>互動架構參考使用者提供的五張立體書照片：成對翅片、可掀背板、編號索引及旁頁解說。01–16 延續照片中的部位編號，17–64 補充口器、足節、體壁、感官、內部細部構造與雌雄差異。這本立體書的書名、作者與版次無法僅由照片確認，因此不臆造書目。</p><p>外觀另參考使用者提供的《台灣常見室內節肢動物圖鑑》美洲家蠊節錄，以及後續補充的澳洲、棕色、家屋、德國與棕帶蟑螂頁面，並依出版社資料核對李鍾旻、詹美鈴與 2021 年出版資訊。紅褐色翅面、背板斑紋、腎形複眼、觸角與棘刺已納入模型。斑紋有個體差異；家屋斑蠊以黑底、淡黃側斑為主，棕帶蟑螂按雌雄成蟲分別繪製翅面。節錄中的若蟲照片與成蟲模型分開解讀。</p><p><strong>本頁：${species.name}（${species.latin}）。</strong>${species.evidence} ${species.taxonomyNote || ""} 新增物種的內臟參考條目會直接標明比較來源，不能把美洲蟑螂的數量與實驗結果換名套用。家屋斑蠊的後翅完全移除；棕帶蟑螂雌雄切換會改變翅長與翅面色斑。澳洲家蠊加入前翅基部外側黃縱紋及本種腹端性別資料。德國蟑螂卵巢管、雄性背腺與棕帶蟑螂雌性背板腺依本種研究補入。</p><p>本站文字重新整理，3D 模型與紋理以程式原創繪製，未嵌入原書照片或掃描圖。資料以美洲蟑螂成蟲為主；一般昆蟲生理知識標示為大學教學來源，物種研究標示為同儕審查研究。</p><p><strong>閱讀界線：</strong>這是依照片與文獻製作的形態重建。外骨骼、翅與背板以曲面呈現，預設自然配色；內臟顏色參考可辨識的組織外觀，會受光線、保存方式與個體狀態影響。系統配色是另外提供的辨識工具。掀開路徑是展示操作，不代表活體關節；尚未導入原始 CT 分割或逐一校準尺寸，不能宣稱為可量測的解剖標本。背血管位於背側、神經索位於腹側；選擇系統會讓其他構造淡化，便於觀察重疊器官。</p><p>摘要與公開全文依可取得範圍核對。部分歷史文獻只有書目可讀，已在資料範圍註明，未把未讀內容當作實驗結論。形態增修核對日期：2026-09-09。</p></div>
    <div class="bibliography">${Object.entries(sources)
      .map(
        ([id, s], i) =>
          `<article id="ref-${id}"><span class="reference-number">${pad(i + 1)}</span><div><span class="reference-type">${s.type}</span><h3><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.title} ↗</a></h3><p>${s.author}</p><p class="reference-scope">${s.scope}</p></div></article>`,
      )
      .join("")}</div>`;
  dialog.showModal();
  document.querySelector("#dialog-content").scrollTop = 0;
}
document
  .querySelector("#sources-open")
  .addEventListener("click", () => showNotes("sources"));
document
  .querySelector("#sources-footer")
  .addEventListener("click", () => showNotes("sources"));
document
  .querySelector("#help-open")
  .addEventListener("click", () => showNotes("help"));
document
  .querySelector("#dialog-close")
  .addEventListener("click", () => dialog.close());
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) {
    const r = dialog.getBoundingClientRect();
    if (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    )
      dialog.close();
  }
});
renderList();
renderDetail();
buildMarkers();
paintIcons();

// Read-only diagnostics make geometry/state regressions reproducible in browser tests.
window.atlasDiagnostics = () => ({
  webgl: available,
  species: species.id,
  wingFactor: species.wing[state.sex],
  ovariolesPerSide: species.ovarioles,
  comparativeAnatomy: species.id !== "american",
  system: state.system,
  sex: state.sex,
  depth: state.depth,
  selected: state.selected,
  view: state.view,
  labels: state.labels,
  pointerHit: lastPointerHit,
  palette: state.palette,
  isolated: state.isolated,
  organs: specimen?.parts.size ?? 0,
  flaps:
    specimen?.flaps.map((f) => ({
      layer: f.index,
      angle: f.hinge.rotation.y,
    })) ?? [],
  pickableIds: [
    ...new Set(specimen?.visibleMeshes().map((m) => m.userData.organId) ?? []),
  ],
  drawCalls: renderer?.info.render.calls,
  triangles: renderer?.info.render.triangles,
});
