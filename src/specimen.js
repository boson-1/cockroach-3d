import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { buildExternal, buildCovers, cuticle, surface } from "./morphology.js";
import { organs, systems } from "./data.js";

const C = {
  ink: "#623d2b",
  edge: "#eddfbe",
  shell: "#74321f",
  gut: "#b8a587",
  air: "#d7d9cd",
  heart: "#c9bfa0",
  fat: "#ddd3af",
  nerve: "#d9d1ae",
  sex: "#d5c7a3",
  muscle: "#bcad8a",
};
const V = (x, y, z = 0) => new THREE.Vector3(x, y, z);
const flat = (color, extra = {}) =>
  new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.46,
    metalness: 0,
    side: THREE.DoubleSide,
    forceSinglePass: true,
    ...extra,
  });

export function createSpecimen() {
  const root = new THREE.Group(),
    parts = new Map(),
    flaps = [],
    animated = [],
    pickables = [];
  function register(id, parent = root) {
    const g = new THREE.Group();
    g.userData.organId = id;
    parent.add(g);
    if (!parts.has(id)) parts.set(id, []);
    parts.get(id).push(g);
    return g;
  }
  function mesh(parent, geometry, material) {
    const m = new THREE.Mesh(geometry, material);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  }
  function ell(parent, x, y, z, rx, ry, rz, color) {
    const small = Math.max(rx, ry, rz) < 0.026;
    const m = mesh(
      parent,
      new THREE.SphereGeometry(1, small ? 6 : 24, small ? 4 : 14),
      flat(color),
    );
    m.position.set(x, y, z);
    m.scale.set(rx, ry, rz);
    return m;
  }
  function tube(parent, pts, r, color, segments = 36) {
    return mesh(
      parent,
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(pts.map((p) => V(...p))),
        segments,
        r,
        7,
        false,
      ),
      flat(color),
    );
  }
  function line(parent, pts, color = C.ink, opacity = 0.6) {
    const g = new THREE.BufferGeometry().setFromPoints(pts.map((p) => V(...p)));
    const l = new THREE.Line(
      g,
      new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
    );
    parent.add(l);
    return l;
  }
  const exterior = buildExternal({ register, mesh, ell, tube, line });
  const hemi = register(30);
  const h = ell(hemi, 0, -0.45, 0.21, 0.92, 2.13, 0.075, "#e0c999");
  h.material.transparent = true;
  h.material.opacity = 0.26;
  h.material.depthWrite = false;
  const thorax = register(31);
  for (const s of [-1, 1])
    for (let i = 0; i < 3; i++) {
      const m = ell(
        thorax,
        s * 0.45,
        1.55 - i * 0.61,
        0.23,
        0.4,
        0.43,
        0.13,
        C.muscle,
      );
      m.rotation.z = s * -0.18;
      for (let j = 0; j < 6; j++)
        line(
          thorax,
          [
            [s * (0.18 + j * 0.065), 1.86 - i * 0.61, 0.3],
            [s * (0.3 + j * 0.06), 1.25 - i * 0.61, 0.35],
          ],
          "#dacdad",
          0.5,
        );
    }
  const fat = register(6);
  for (const s of [-1, 1])
    for (let i = 0; i < 30; i++) {
      const y = 1.4 - i * 0.14;
      const x = s * exterior.bodyWidth(y) * (0.64 + 0.09 * Math.sin(i * 1.6));
      ell(
        fat,
        x,
        y,
        0.31,
        0.095 + 0.018 * Math.sin(i),
        0.12,
        0.055,
        i % 2 ? C.fat : "#e9e1c3",
      );
    }
  const nerve = register(7);
  for (const s of [-1, 1])
    tube(
      nerve,
      [
        [s * 0.045, 2.1, 0.29],
        [s * 0.055, 1.4, 0.27],
        [s * 0.06, -0.2, 0.27],
        [s * 0.045, -2.75, 0.28],
      ],
      0.035,
      C.nerve,
    );
  const gang = register(8);
  for (let i = 0; i < 9; i++) {
    const y = [1.91, 1.21, 0.57, 0.12, -0.32, -0.78, -1.24, -1.72, -2.52][i];
    ell(gang, 0, y, 0.31, 0.13, i < 3 ? 0.125 : 0.1, 0.065, C.nerve);
    for (const s of [-1, 1])
      tube(
        gang,
        [
          [s * 0.08, y, 0.28],
          [s * 0.33, y - 0.05, 0.29],
          [s * 0.6, y + 0.08, 0.27],
        ],
        0.018,
        "#dcd5b6",
        12,
      );
  }
  const brain = register(29);
  for (const s of [-1, 1])
    ell(brain, s * 0.12, 2.65, 0.42, 0.15, 0.15, 0.08, "#d8d0b1");
  for (const side of [-1, 1])
    tube(
      brain,
      [
        [side * 0.1, 2.63, 0.42],
        [side * 0.23, 2.42, 0.34],
        [side * 0.15, 2.18, 0.26],
        [side * 0.045, 2.1, 0.29],
      ],
      0.034,
      C.nerve,
      32,
    );
  ell(brain, 0, 2.11, 0.27, 0.12, 0.1, 0.07, C.nerve);
  // Paired longitudinal trunks with repeated segmental branches and side openings.
  const air = register(4),
    spiracles = register(25);
  for (const s of [-1, 1]) {
    tube(
      air,
      [
        [s * 0.73, 2.02, 0.46],
        [s * 0.62, 1.1, 0.46],
        [s * 0.76, -0.5, 0.44],
        [s * 0.53, -2.67, 0.39],
      ],
      0.055,
      C.air,
    );
    for (let i = 0; i < 10; i++) {
      const y = [
          1.65, 0.92, 0.49, 0.06, -0.37, -0.8, -1.23, -1.66, -2.09, -2.48,
        ][i],
        x = exterior.bodyWidth(y) - 0.075;
      const sp = ell(
        spiracles,
        s * (x + 0.08),
        y,
        0.25,
        0.055,
        0.08,
        0.043,
        "#4f4431",
      );
      tube(
        air,
        [
          [s * (x + 0.08), y, 0.26],
          [s * 0.63, y - 0.1, 0.47],
          [s * 0.34, y + 0.07, 0.47],
          [s * 0.18, y + 0.17, 0.45],
        ],
        0.027,
        C.air,
        16,
      );
      for (let j = 0; j < 3; j++)
        line(
          air,
          [
            [s * (0.35 + j * 0.12), y, 0.47],
            [s * (0.24 + j * 0.14), y - 0.16, 0.47],
            [s * (0.17 + j * 0.14), y - 0.21, 0.48],
          ],
          "#b1d0bd",
          0.9,
        );
    }
  }
  for (const side of [-1, 1])
    for (const p of exterior.legPaths) {
      tube(
        air,
        p.slice(0, 5).map((q) => [side * q[0], q[1], q[2] + 0.025]),
        0.017,
        C.air,
        56,
      );
      ell(
        air,
        side * (p[0][0] + p[1][0]) * 0.5,
        (p[0][1] + p[1][1]) * 0.5,
        0.2,
        0.083,
        0.16,
        0.065,
        "#d3d5c6",
      );
    }
  const salivary = register(9);
  for (const s of [-1, 1]) {
    ell(salivary, s * 0.56, 1.53, 0.6, 0.135, 0.3, 0.09, "#ddd7ad");
    for (let i = 0; i < 18; i++) {
      const a = i * 2.39;
      ell(
        salivary,
        s * 0.43 + Math.cos(a) * (0.1 + i * 0.003),
        1.96 + Math.sin(a) * (0.13 + i * 0.003),
        0.57,
        0.05,
        0.06,
        0.055,
        "#e2d8ac",
      );
    }
    tube(
      salivary,
      [
        [s * 0.4, 1.75, 0.6],
        [s * 0.26, 2.08, 0.55],
        [0, 2.21, 0.51],
      ],
      0.025,
      "#d4c99e",
      16,
    );
  }
  const eso = register(10);
  tube(
    eso,
    [
      [0, 2.25, 0.48],
      [0.04, 1.84, 0.56],
      [0.12, 1.4, 0.61],
    ],
    0.09,
    C.gut,
  );

  const crop = register(11);
  const cropWall = ell(crop, 0.06, 0.2, 0.57, 0.53, 1.12, 0.245, "#b6a080");
  cropWall.material.roughness = 0.48;
  for (let i = 0; i < 20; i++) {
    const a = (i * Math.PI * 2) / 20;
    const points = [];
    for (let j = 0; j <= 24; j++) {
      const t = j / 24,
        r = Math.sin(t * Math.PI);
      points.push([
        0.06 + Math.cos(a) * 0.531 * r,
        1.31 - t * 2.23,
        0.57 + Math.sin(a) * 0.249 * r,
      ]);
    }
    line(crop, points, "#d6c6a5", 0.38);
  }
  const gizzard = register(26),
    teeth = register(57);
  ell(gizzard, 0.03, -1.04, 0.56, 0.22, 0.25, 0.19, "#9b8868");
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3,
      shape = new THREE.Shape();
    shape.moveTo(Math.cos(a - 0.24) * 0.18, Math.sin(a - 0.24) * 0.15);
    shape.lineTo(Math.cos(a) * 0.053, Math.sin(a) * 0.046);
    shape.lineTo(Math.cos(a + 0.24) * 0.18, Math.sin(a + 0.24) * 0.15);
    shape.quadraticCurveTo(
      Math.cos(a) * 0.2,
      Math.sin(a) * 0.17,
      Math.cos(a - 0.24) * 0.18,
      Math.sin(a - 0.24) * 0.15,
    );
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.31,
      steps: 1,
      bevelEnabled: true,
      bevelSize: 0.005,
      bevelThickness: 0.005,
      bevelSegments: 2,
    });
    const m = mesh(teeth, geo, cuticle("#78542b", { roughness: 0.42 }));
    m.rotation.x = Math.PI / 2;
    m.position.set(0.03, -0.885, 0.56);
    for (let j = 0; j < 4; j++)
      line(
        teeth,
        [
          [
            0.03 + Math.cos(a) * (0.06 + j * 0.026),
            -0.9,
            0.56 + Math.sin(a) * (0.053 + j * 0.022),
          ],
          [
            0.03 + Math.cos(a) * (0.062 + j * 0.026),
            -1.18,
            0.56 + Math.sin(a) * (0.054 + j * 0.022),
          ],
        ],
        "#a78447",
        0.5,
      );
  }
  const caeca = register(27);
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    tube(
      caeca,
      [
        [0.03, -1.28, 0.53],
        [0.03 + Math.cos(a) * 0.21, -1.23, 0.53 + Math.sin(a) * 0.13],
        [
          0.03 + Math.cos(a) * 0.39,
          -0.77 - (i % 2) * 0.1,
          0.53 + Math.sin(a) * 0.17,
        ],
      ],
      0.049,
      "#cbbc9c",
      24,
    );
  }
  const midgut = register(12);
  tube(
    midgut,
    [
      [0.03, -1.29, 0.53],
      [0.42, -1.47, 0.54],
      [0.63, -1.85, 0.48],
      [0.29, -2.1, 0.42],
      [-0.05, -1.86, 0.4],
      [-0.16, -1.61, 0.41],
      [0.0, -1.44, 0.44],
    ],
    0.114,
    C.gut,
    72,
  );
  const malp = register(13);
  // 150 blind-ending tubes in six insertion clusters; paths are approximate.
  for (let i = 0; i < 150; i++) {
    const s = i % 2 ? 1 : -1,
      a = i * 2.399,
      r = 0.27 + (i % 25) * 0.024;
    const points = [[0.012 * Math.cos(a), -1.44 + 0.014 * Math.sin(a), 0.47]];
    for (let j = 1; j <= 9; j++) {
      const t = j / 9;
      points.push([
        s * (0.13 + r * Math.sin(t * Math.PI * 0.82)) +
          0.045 * Math.sin(a + t * 11),
        -1.44 + Math.sin(a * 0.73) * 0.83 * t + 0.17 * Math.sin(t * 5 + a),
        0.43 + 0.12 * Math.sin(a + t * 2),
      ]);
    }
    tube(malp, points, 0.0065, "#d8ceb0", 36);
  }
  const colon = register(28);
  tube(
    colon,
    [
      [0, -1.44, 0.43],
      [-0.32, -1.77, 0.36],
      [-0.35, -2.13, 0.34],
      [0, -2.3, 0.4],
    ],
    0.1,
    "#a6987b",
    38,
  );
  const rectum = register(14),
    rectalPads = register(58);
  ell(rectum, 0, -2.48, 0.42, 0.2, 0.3, 0.16, "#b3a487");
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    ell(
      rectalPads,
      Math.cos(a) * 0.139,
      -2.49,
      0.42 + Math.sin(a) * 0.105,
      0.041,
      0.215,
      0.038,
      "#ded4b6",
    );
  }
  tube(
    rectum,
    [
      [0, -2.74, 0.4],
      [0, -2.99, 0.26],
    ],
    0.068,
    "#887150",
    18,
  );
  const pharynx = register(61);
  tube(
    pharynx,
    [
      [0, 2.04, 0.15],
      [0, 2.39, 0.26],
      [0, 2.44, 0.47],
      [0, 2.25, 0.48],
    ],
    0.07,
    "#b7aa8d",
    28,
  );
  const heart = register(5);
  tube(
    heart,
    [
      [0, -2.78, 0.83],
      [0, -1.8, 0.84],
      [0, -0.6, 0.84],
      [0, 0.8, 0.82],
      [0, 2.1, 0.75],
    ],
    0.043,
    C.heart,
  );
  for (let i = 0; i < 13; i++) {
    const y = -2.58 + i * 0.345;
    const m = ell(heart, 0, y, 0.84, 0.09, 0.18, 0.055, C.heart);
    animated.push(m);
    for (const s of [-1, 1])
      line(
        heart,
        [
          [s * 0.05, y, 0.82],
          [s * 0.25, y - 0.13, 0.76],
          [s * 0.45, y - 0.19, 0.72],
        ],
        "#c8bc99",
        0.8,
      );
  }
  // Female and male organ groups are mutually exclusive.
  const femaleGroup = new THREE.Group(),
    maleGroup = new THREE.Group();
  root.add(femaleGroup, maleGroup);
  maleGroup.visible = false;

  const ovary = register(15, femaleGroup),
    ovarioles = register(59, femaleGroup),
    oviduct = register(16, femaleGroup);
  for (const side of [-1, 1]) {
    for (let i = 0; i < 8; i++) {
      const x = side * (0.35 + i * 0.06),
        y = -1.12 - (i % 3) * 0.075,
        z = 0.45 + (i % 2) * 0.055;
      tube(
        ovary,
        [
          [x, y + 0.48, z],
          [x, y, z],
          [side * 0.46, -2.31, 0.39],
        ],
        0.013,
        "#c9bc9d",
        24,
      );
      for (let j = 0; j < 5; j++)
        ell(
          ovarioles,
          x + side * Math.sin(j * 0.65) * 0.035,
          y - j * 0.2,
          z,
          0.022 + j * 0.01,
          0.046 + j * 0.025,
          0.029 + j * 0.008,
          j === 4 ? "#dcca91" : "#e1d7b6",
        );
    }
    tube(
      oviduct,
      [
        [side * 0.48, -2.25, 0.41],
        [side * 0.33, -2.47, 0.38],
        [0, -2.67, 0.35],
      ],
      0.054,
      "#cab997",
      24,
    );
  }
  tube(
    oviduct,
    [
      [0, -2.67, 0.35],
      [0.06, -2.91, 0.25],
    ],
    0.069,
    C.sex,
    16,
  );
  const sperma = register(32, femaleGroup);
  ell(sperma, 0.31, -2.6, 0.59, 0.12, 0.14, 0.06, "#c5b799");
  tube(
    sperma,
    [
      [0.31, -2.66, 0.56],
      [0.1, -2.86, 0.45],
    ],
    0.03,
    C.sex,
    12,
  );
  const glands = register(33, femaleGroup);
  for (const s of [-1, 1])
    for (let i = 0; i < 6; i++)
      tube(
        glands,
        [
          [s * 0.09, -2.85, 0.43],
          [s * (0.24 + i * 0.03), -2.58, 0.56],
          [s * (0.35 + i * 0.032), -2.34 + i * 0.055, 0.53],
        ],
        0.024,
        "#dbd1b4",
        12,
      );
  const testes = register(34, maleGroup),
    vas = register(35, maleGroup),
    accessory = register(36, maleGroup),
    ejac = register(37, maleGroup),
    styli = register(62, maleGroup);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 7; i++)
      ell(
        testes,
        s * (0.37 + (i % 2) * 0.14),
        -1.38 - Math.floor(i / 2) * 0.14,
        0.59,
        0.1,
        0.12,
        0.07,
        C.sex,
      );
    tube(
      vas,
      [
        [s * 0.45, -1.87, 0.56],
        [s * 0.61, -2.18, 0.55],
        [s * 0.33, -2.51, 0.54],
        [0, -2.67, 0.53],
      ],
      0.042,
      "#c5b69a",
      24,
    );
    for (let i = 0; i < 7; i++)
      tube(
        accessory,
        [
          [0, -2.69, 0.54],
          [s * (0.14 + i * 0.04), -2.45, 0.6],
          [s * (0.08 + i * 0.055), -2.13 - i * 0.03, 0.56],
        ],
        0.024,
        "#d4c8ac",
        12,
      );
    // Male styli are separate from the ejaculatory duct.
    tube(
      styli,
      [
        [s * 0.18, -2.93, 0.22],
        [s * 0.22, -3.2, 0.18],
      ],
      0.035,
      "#9b753f",
      8,
    );
  }
  tube(
    ejac,
    [
      [0, -2.65, 0.55],
      [0, -2.99, 0.46],
    ],
    0.07,
    C.sex,
    14,
  );

  const alary = register(55);
  for (let i = 0; i < 9; i++)
    for (const side of [-1, 1]) {
      const y = 0.45 - i * 0.34;
      for (let j = 0; j < 7; j++)
        tube(
          alary,
          [
            [side * (0.08 + j * 0.008), y, 0.815],
            [side * 0.31, y - 0.05 - j * 0.012, 0.79],
            [side * (0.7 - i * 0.015), y - 0.13 - j * 0.025, 0.7],
          ],
          0.007,
          "#c7b99a",
          14,
        );
    }
  const taenidia = register(56);
  for (const side of [-1, 1]) {
    for (const [x, z] of [
      [0.3, 0.76],
      [0.46, 0.23],
    ])
      tube(
        air,
        [
          [side * x, 1.98, z],
          [side * x, 1.04, z],
          [side * (x + 0.1), -0.54, z],
          [side * x, -2.52, z],
        ],
        0.023,
        "#d6d6c7",
        60,
      );
    tube(
      air,
      [
        [side * 0.73, 1.85, 0.46],
        [side * 0.4, 2.17, 0.54],
        [side * 0.33, 2.5, 0.52],
        [side * 0.19, 2.74, 0.43],
      ],
      0.035,
      C.air,
      36,
    );
    const coil = [];
    for (let i = 0; i <= 650; i++) {
      const t = i / 650,
        a = t * Math.PI * 2 * 45;
      coil.push([
        side * 0.625 + Math.cos(a) * 0.059,
        0.94 - t * 0.8,
        0.46 + Math.sin(a) * 0.059,
      ]);
    }
    tube(taenidia, coil, 0.0045, "#bfc4b6", 650);
  }
  const jawMuscle = register(60);
  for (const side of [-1, 1])
    for (let j = 0; j < 14; j++) {
      const a = [side * (0.1 + j * 0.018), 2.72 - (j % 3) * 0.02, 0.42],
        b = [side * 0.17, 2.17, 0.24];
      tube(jawMuscle, [a, [side * 0.24, 2.42, 0.4], b], 0.01, "#c2b495", 24);
    }
  for (const side of [-1, 1])
    tube(
      jawMuscle,
      [
        [side * 0.34, 2.59, 0.34],
        [side * 0.36, 2.37, 0.3],
        [side * 0.27, 2.19, 0.24],
      ],
      0.033,
      "#b8a989",
      24,
    );
  const femalePlate = register(63, femaleGroup),
    malePlate = register(64, maleGroup);
  for (const side of [-1, 1])
    mesh(
      femalePlate,
      surface(
        (u, v) => [
          side * (0.025 + u * 0.6) * (1 - v * 0.43),
          -2.29 - v * 0.61,
          -0.04 - 0.035 * Math.sin(u * Math.PI),
        ],
        0.025,
        18,
        20,
      ),
      cuticle("#86502b"),
    );
  mesh(
    malePlate,
    surface(
      (u, v) => [
        (u * 2 - 1) * (0.45 - v * 0.1),
        -2.47 - v * 0.46,
        -0.043 - 0.024 * Math.sin(u * Math.PI),
      ],
      0.023,
      24,
      20,
    ),
    cuticle("#754023"),
  );
  buildCovers({ register, mesh, root, flaps });

  // Merge repeated follicles, branches, bristles and eye facets per organ and
  // material. Each organ remains selectable while avoiding hundreds of draws.
  for (const groups of parts.values())
    for (const g of groups) {
      const batches = new Map();
      for (const child of [...g.children]) {
        if (
          !child.isMesh ||
          Array.isArray(child.material) ||
          animated.includes(child)
        )
          continue;
        const mat = child.material;
        const key = [
          mat.color.getHex(),
          mat.map?.uuid || "",
          mat.opacity,
          mat.depthWrite,
          mat.roughness,
          mat.clearcoat,
          mat.bumpMap?.uuid || "",
          mat.bumpScale,
          mat.metalness,
        ].join(":");
        if (!batches.has(key)) batches.set(key, { material: mat, objects: [] });
        batches.get(key).objects.push(child);
      }
      for (const { material, objects } of batches.values()) {
        if (objects.length < 2) continue;
        const geometries = objects.map((o) => {
          o.updateMatrix();
          const geo = o.geometry.clone().applyMatrix4(o.matrix);
          if (geo.index) {
            const expanded = geo.toNonIndexed();
            geo.dispose();
            return expanded;
          }
          return geo;
        });
        const geometry = mergeGeometries(geometries);
        if (!geometry) continue;
        const merged = new THREE.Mesh(geometry, material);
        merged.castShadow = true;
        merged.receiveShadow = true;
        objects.forEach((o) => {
          g.remove(o);
          o.geometry.dispose();
          if (o.material !== material) o.material.dispose();
        });
        geometries.forEach((geo) => geo.dispose());
        g.add(merged);
      }
      const lines = g.children.filter((o) => o.isLine && !o.isLineSegments);
      if (lines.length > 1) {
        const lineBatches = new Map();
        for (const l of lines) {
          const key = l.material.color.getHex() + ":" + l.material.opacity;
          if (!lineBatches.has(key))
            lineBatches.set(key, {
              material: l.material,
              points: [],
              lines: [],
            });
          const b = lineBatches.get(key);
          const p = l.geometry.attributes.position;
          for (let i = 0; i < p.count - 1; i++) {
            b.points.push(
              p.getX(i),
              p.getY(i),
              p.getZ(i),
              p.getX(i + 1),
              p.getY(i + 1),
              p.getZ(i + 1),
            );
          }
          b.lines.push(l);
        }
        for (const b of lineBatches.values()) {
          const geo = new THREE.BufferGeometry();
          geo.setAttribute(
            "position",
            new THREE.Float32BufferAttribute(b.points, 3),
          );
          g.add(new THREE.LineSegments(geo, b.material));
          b.lines.forEach((l) => {
            g.remove(l);
            l.geometry.dispose();
            if (l.material !== b.material) l.material.dispose();
          });
        }
      }
    }
  root.traverse((o) => {
    if (o.isMesh) {
      let a = o;
      while (a && !a.userData.organId) a = a.parent;
      if (a) {
        o.userData.organId = a.userData.organId;
        pickables.push(o);
      }
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      for (const m of mats) {
        m.userData.baseOpacity = m.opacity;
        m.userData.baseMap = m.map;
        m.userData.originalColor = m.color?.clone();
      }
    }
  });
  const anchors = {
    1: [0.62, -0.5, 1.17],
    2: [-0.55, -1, 1.06],
    3: [0.75, -1.9, 0.97],
    4: [0.68, -0.58, 0.49],
    5: [0, -0.6, 0.92],
    6: [-0.75, -1.2, 0.4],
    7: [0, -1.3, 0.35],
    8: [0, 0.62, 0.42],
    9: [-0.52, 1.86, 0.66],
    10: [0.04, 1.91, 0.68],
    11: [0.06, 0.2, 0.82],
    12: [0.63, -1.85, 0.59],
    13: [-0.67, -1.4, 0.56],
    14: [0, -2.48, 0.65],
    15: [0.52, -1.84, 0.65],
    16: [-0.29, -2.5, 0.61],
    17: [-1.26, 4.1, 0.72],
    18: [0.44, 2.75, 0.6],
    19: [-0.19, 2.88, 0.53],
    20: [0.19, 2.18, 0.6],
    21: [-0.51, 2.15, 0.46],
    22: [-0.38, 2.17, 1.12],
    23: [2.09, 0.22, 0.2],
    24: [-0.64, -3.28, 0.25],
    25: [1.08, -0.65, 0.34],
    26: [0.03, -1.04, 0.76],
    27: [-0.29, -0.84, 0.67],
    28: [-0.43, -1.86, 0.64],
    29: [0, 2.65, 0.58],
    30: [-0.86, -1.7, 0.34],
    31: [-0.44, 0.93, 0.42],
    32: [0.32, -2.58, 0.69],
    33: [-0.49, -2.44, 0.64],
    34: [0.48, -1.65, 0.7],
    35: [-0.56, -2.18, 0.65],
    36: [0.27, -2.36, 0.69],
    37: [0, -2.84, 0.64],
    38: [0, 2.49, 0.14],
    39: [0, 2.15, 0.015],
    40: [0, 2.01, 0.145],
    41: [0.76, 1.03, 0.12],
    42: [1.1, 0.8, 0.22],
    43: [1.58, 0.55, 0.32],
    44: [2.27, 0.05, 0.17],
    45: [2.84, -0.41, -0.03],
    46: [3.08, -0.57, -0.05],
    47: [3.01, -0.53, -0.075],
    48: [0.73, -0.81, 0.67],
    49: [0.44, 1.28, 0.85],
    50: [0.54, -1.23, -0.05],
    51: [-0.36, 3.0, 0.59],
    52: [0, 1.99, 0.3],
    53: [0.68, 1.86, 0.06],
    54: [0.22, -2.98, 0.28],
    55: [-0.35, -0.6, 0.78],
    56: [-0.625, 0.5, 0.53],
    57: [0.03, -1.04, 0.56],
    58: [0, -2.49, 0.42],
    59: [0.67, -1.85, 0.52],
    60: [-0.23, 2.47, 0.39],
    61: [0, 2.4, 0.37],
    62: [0.2, -3.08, 0.21],
    63: [0.29, -2.64, -0.06],
    64: [0, -2.75, -0.06],
  };
  const state = {
    depth: 0,
    preview: null,
    focus: "external",
    selected: 1,
    sex: "female",
    reduced: false,
    palette: "natural",
    isolated: false,
  };
  function update(dt, time) {
    const smoothing = state.reduced ? 1 : 1 - Math.exp(-dt * 8);
    for (const f of flaps) {
      const desired =
        state.depth > f.index
          ? 1
          : state.preview === f && state.depth >= f.index
            ? 0.72
            : 0;
      f.open = THREE.MathUtils.lerp(f.open, desired, smoothing);
      f.hinge.rotation.y = f.side * f.open * [2.65, 2.38, 2.12][f.index];
    }
    for (let i = 0; i < animated.length; i++)
      animated[i].scale.x =
        0.09 * (state.reduced ? 1 : 1 + Math.sin(time * 2.8 - i * 0.35) * 0.04);
  }
  function style(system, selected, sex) {
    state.focus = system;
    state.selected = selected;
    state.sex = sex;
    femaleGroup.visible = sex === "female";
    maleGroup.visible = sex === "male";
    const focusIds = organs.filter((o) => o.system === system).map((o) => o.id);
    const family = {
      38: [38, 18, 19, 20, 21, 39, 40, 51, 52, 53],
      59: [15, 59],
      3: [3, 48, 49, 50],
      15: [15, 59],
      23: [23, 41, 42, 43, 44, 45, 46, 47],
      21: [21, 52, 53],
      31: [31],
      4: [4, 56],
      26: [26, 57],
      14: [14, 58],
    }[selected] || [selected];
    root.traverse((o) => {
      if (!o.isMesh) return;
      const id = o.userData.organId;
      const isFlap = flaps.some((f) => {
        let q = o;
        while (q) {
          if (q === f.group) return true;
          q = q.parent;
        }
        return false;
      });
      const internal = system !== "external";
      o.visible = !state.isolated || family.includes(id);
      const opacity =
        internal && !focusIds.includes(id) && !isFlap
          ? id === 3 || id === 22
            ? 0.025
            : 0.055
          : 1;
      // Inner structures become visible on direct selection, without painting
      // them on the outer wall of the gizzard or rectum.
      const localOpacity =
        (selected === 57 && id === 26) ||
        (selected === 58 && id === 14) ||
        (selected === 60 && [38, 22].includes(id))
          ? 0.055
          : opacity;
      o.castShadow = localOpacity > 0.5;
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
        const transparent = localOpacity < 1 || m.userData.baseOpacity < 1;
        if (m.transparent !== transparent) m.needsUpdate = true;
        m.transparent = transparent;
        m.opacity = m.userData.baseOpacity * localOpacity;
        m.depthWrite = localOpacity > 0.5 && m.userData.baseOpacity > 0.5;
        const entry = organs.find((o) => o.id === id),
          color = systems.find((s) => s.id === entry?.system)?.color;
        const nextMap = state.palette === "system" ? null : m.userData.baseMap;
        if (m.map !== nextMap) {
          m.map = nextMap;
          m.needsUpdate = true;
        }
        if (m.color)
          m.color.copy(
            state.palette === "system" && color
              ? new THREE.Color(color)
              : m.userData.originalColor,
          );
        if (m.emissive) {
          m.emissive.set(id === selected ? "#b2a997" : "#000000");
          m.emissiveIntensity = id === selected ? 0.025 : 0;
        }
      }
    });
    root.traverse((o) => {
      if (!o.isLine) return;
      let p = o.parent;
      while (p && !p.userData.organId) p = p.parent;
      const id = p?.userData.organId;
      o.visible = !state.isolated || family.includes(id);
      o.material.opacity =
        system !== "external" && !focusIds.includes(id) ? 0.07 : 0.45;
    });
  }

  function getAnchor(id) {
    const pos = V(...anchors[id]);
    if ([1, 2, 3, 48, 49].includes(id)) {
      const f = flaps.find(
        (f) =>
          f.id === ([48, 49].includes(id) ? 3 : id) &&
          f.side === (id === 2 ? -1 : 1),
      );
      if (f) {
        pos.x -= f.hinge.position.x;
        pos.z -= f.hinge.position.z;
        return f.hinge.localToWorld(pos);
      }
    }
    return root.localToWorld(pos);
  }
  function visibleMeshes() {
    return pickables.filter((o) => {
      let a = o;
      while (a) {
        if (!a.visible) return false;
        a = a.parent;
      }
      const mat = Array.isArray(o.material) ? o.material[0] : o.material;
      return (
        mat.opacity > 0.35 ||
        (o.userData.organId === state.selected && mat.opacity > 0.05)
      );
    });
  }
  return {
    root,
    parts,
    flaps,
    state,
    update,
    style,
    getAnchor,
    visibleMeshes,
    anchors,
    getFocus(id) {
      const broad = {
        1: 2.9,
        2: 2.8,
        3: 3.1,
        4: 2.9,
        5: 2.6,
        6: 2.4,
        7: 2.6,
        8: 2.6,
        9: 1.2,
        11: 1.35,
        12: 1,
        13: 1.7,
        15: 1.3,
        23: 3.5,
        31: 1.5,
        48: 2.2,
        49: 1.6,
        55: 1.8,
        59: 1.2,
      };
      const center =
        broad[id] && ![1, 2, 9, 11, 12, 15, 48, 49, 59].includes(id)
          ? root.localToWorld(V(0, -0.3, 0.4))
          : getAnchor(id);
      return {
        center,
        radius: broad[id] || ([45, 46, 47, 57, 58].includes(id) ? 0.42 : 0.67),
      };
    },
  };
}

export function createBook() {
  const stage = new THREE.Group();
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(180, 180),
    flat("#e7e5dc", { roughness: 1 }),
  );
  floor.position.z = -0.34;
  floor.receiveShadow = true;
  stage.add(floor);
  return stage;
}
