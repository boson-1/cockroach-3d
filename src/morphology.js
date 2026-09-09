import * as THREE from "three";

const V = (...v) => new THREE.Vector3(...v);
const mix = THREE.MathUtils.lerp;

function compoundEyeMaps() {
  if (typeof document === "undefined") return {};
  const colour = document.createElement("canvas"),
    relief = document.createElement("canvas");
  colour.width = relief.width = 512;
  colour.height = relief.height = 512;
  const c = colour.getContext("2d"),
    b = relief.getContext("2d");
  c.fillStyle = "#15120e";
  c.fillRect(0, 0, 512, 512);
  b.fillStyle = "#505050";
  b.fillRect(0, 0, 512, 512);
  // Tightly adjoining corneal facets follow the eye UVs on both hemispheres.
  // A surface map avoids bead-like objects protruding from the eye silhouette.
  const radius = 5.4;
  for (let row = -1; row < 60; row++)
    for (let col = -1; col < 60; col++) {
      const x = col * radius * 1.732 + (row % 2) * radius * 0.866,
        y = row * radius * 1.5;
      for (const ctx of [c, b]) {
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (Math.PI / 3) * k + Math.PI / 6;
          const xx = x + Math.cos(a) * radius,
            yy = y + Math.sin(a) * radius;
          k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
        }
        ctx.closePath();
        const g = ctx.createRadialGradient(x - 1, y - 1, 0.2, x, y, radius);
        g.addColorStop(0, ctx === c ? "#302a20" : "#aaaaaa");
        g.addColorStop(1, ctx === c ? "#191611" : "#595959");
        ctx.fillStyle = g;
        ctx.fill();
        ctx.strokeStyle = ctx === c ? "#0e0c09" : "#484848";
        ctx.lineWidth = 0.45;
        ctx.stroke();
      }
    }
  const map = new THREE.CanvasTexture(colour),
    bumpMap = new THREE.CanvasTexture(relief);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = bumpMap.anisotropy = 8;
  return { map, bumpMap };
}

// Original procedural surfaces. These are morphological reconstructions, not
// segmented CT meshes. Their topology and visibility are independent of the UI.
export function cuticleMaps(kind) {
  if (typeof document === "undefined") return {};
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 2048;
  const c = canvas.getContext("2d");
  const bump = document.createElement("canvas");
  bump.width = 1024;
  bump.height = 2048;
  const b = bump.getContext("2d");
  b.fillStyle = "#777";
  b.fillRect(0, 0, 1024, 2048);
  const gradient = c.createLinearGradient(0, 0, 700, 2048);
  const colors =
    kind === "pronotum"
      ? ["#c39948", "#deb668", "#bd853d"]
      : kind === "membrane"
        ? ["#b6a782", "#d2c6a5", "#a49168"]
        : ["#4c1b16", "#67251a", "#884724"];
  colors.forEach((v, i) => gradient.addColorStop(i / 2, v));
  c.fillStyle = gradient;
  c.fillRect(0, 0, 1024, 2048);
  let seed = 41;
  const random = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  if (kind === "pronotum") {
    // Pale peripheral field with two darker lobes connected across the front.
    // Asymmetry and diffuse boundaries reproduce one adult colour variant.
    c.save();
    c.scale(2, 2);
    c.fillStyle = "#67261b";
    c.shadowColor = "#87431e";
    c.shadowBlur = 20;
    c.beginPath();
    c.moveTo(95, 228);
    c.bezierCurveTo(125, 105, 355, 95, 419, 226);
    c.bezierCurveTo(465, 326, 395, 460, 380, 535);
    c.bezierCurveTo(391, 655, 416, 816, 332, 872);
    c.bezierCurveTo(278, 904, 268, 778, 253, 649);
    c.bezierCurveTo(232, 776, 235, 914, 159, 870);
    c.bezierCurveTo(84, 826, 130, 620, 139, 526);
    c.bezierCurveTo(118, 428, 48, 355, 95, 228);
    c.fill();
    c.restore();
  } else {
    const vein = (points, width, opacity = 0.5) => {
      for (const ctx of [c, b]) {
        ctx.beginPath();
        ctx.moveTo(...points[0]);
        for (let i = 1; i < points.length; i++) ctx.lineTo(...points[i]);
        ctx.strokeStyle =
          ctx === b
            ? `rgba(226,226,226,${opacity})`
            : `rgba(175,114,65,${opacity * 0.7})`;
        ctx.lineWidth = width;
        ctx.stroke();
        if (ctx === c) {
          ctx.translate(2, 1);
          ctx.strokeStyle = `rgba(24,9,7,${opacity * 0.6})`;
          ctx.lineWidth = width * 0.55;
          ctx.stroke();
          ctx.translate(-2, -1);
        }
      }
    };
    // Main longitudinal veins branch toward the costal / distal margin.
    // Cross-vein paths are schematic; no unsupported individual vein names.
    for (let i = 0; i < 15; i++) {
      const points = [];
      for (let j = 0; j <= 44; j++) {
        const t = j / 44;
        const x = 60 + i * 20 + (i * 41 + 28) * Math.pow(t, 0.68);
        points.push([Math.min(1018, x), t * 2048]);
      }
      vein(points, i % 3 === 0 ? 4 : 2.2, 0.55);
      for (let j = 7; j < 42; j += 3) {
        const [x, y] = points[j];
        vein(
          [
            [x, y],
            [Math.min(1022, x + 38 + j * 0.4), y + 20 + random() * 17],
          ],
          1,
          0.24,
        );
      }
    }
    for (let i = 0; i < 9; i++)
      vein(
        [
          [35 + i * 8, 20],
          [60 + i * 19, 530],
          [90 + i * 22, 1120],
          [120 + i * 25, 2000],
        ],
        1.8,
        0.4,
      );
    if (kind === "membrane") {
      for (let i = 0; i < 21; i++)
        vein(
          [
            [40, 20],
            [40 + i * 26, 850],
            [35 + i * 48, 2048],
          ],
          2.5,
          0.8,
        );
    }
  }
  // Micropunctures and low-amplitude microrelief avoid the smooth plastic look.
  for (let i = 0; i < 58000; i++) {
    const x = random() * 1024,
      y = random() * 2048,
      r = 0.4 + random() * 1.2;
    c.fillStyle =
      random() > 0.5 ? "rgba(20,8,4,.08)" : "rgba(255,220,165,.045)";
    c.fillRect(x, y, r, r);
    b.fillStyle = random() > 0.5 ? "#838383" : "#6c6c6c";
    b.fillRect(x, y, r, r);
  }
  const map = new THREE.CanvasTexture(canvas),
    bumpMap = new THREE.CanvasTexture(bump);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  bumpMap.anisotropy = 8;
  return { map, bumpMap };
}

export function cuticle(color, options = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: 0.32,
    metalness: 0,
    clearcoat: 0.65,
    clearcoatRoughness: 0.23,
    ior: 1.48,
    side: THREE.DoubleSide,
    ...options,
  });
}

// Closed, curved thin shell with a real dorsal and ventral surface. Thickness
// and curvature replace the former extruded paper outline.
export function surface(fn, thickness = 0.018, nu = 28, nv = 64) {
  const p = [],
    uv = [],
    idx = [];
  for (let side = 0; side < 2; side++)
    for (let j = 0; j <= nv; j++)
      for (let i = 0; i <= nu; i++) {
        const q = fn(i / nu, j / nv);
        p.push(q[0], q[1], q[2] - side * thickness);
        uv.push(i / nu, 1 - j / nv);
      }
  const offset = (nu + 1) * (nv + 1);
  for (let side = 0; side < 2; side++)
    for (let j = 0; j < nv; j++)
      for (let i = 0; i < nu; i++) {
        const a = side * offset + j * (nu + 1) + i,
          d = a + nu + 1;
        if (side) idx.push(a, d, a + 1, a + 1, d, d + 1);
        else idx.push(a, a + 1, d, a + 1, d + 1, d);
      }
  const edge = [];
  for (let i = 0; i <= nu; i++) edge.push(i);
  for (let j = 1; j <= nv; j++) edge.push(j * (nu + 1) + nu);
  for (let i = nu - 1; i >= 0; i--) edge.push(nv * (nu + 1) + i);
  for (let j = nv - 1; j > 0; j--) edge.push(j * (nu + 1));
  for (let i = 0; i < edge.length; i++) {
    const a = edge[i],
      b = edge[(i + 1) % edge.length];
    idx.push(a, b, a + offset, b, b + offset, a + offset);
  }
  const origin = V(...fn(0.4, 0.4)),
    du = V(...fn(0.401, 0.4)).sub(origin),
    dv = V(...fn(0.4, 0.401)).sub(origin);
  if (du.cross(dv).z < 0)
    for (let i = 0; i < idx.length; i += 3)
      [idx[i + 1], idx[i + 2]] = [idx[i + 2], idx[i + 1]];
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function profile(t, points) {
  for (let i = 1; i < points.length; i++)
    if (t <= points[i][0]) {
      const [a, x] = points[i - 1],
        [b, y] = points[i];
      return mix(x, y, THREE.MathUtils.smoothstep(t, a, b));
    }
  return points.at(-1)[1];
}

export function buildExternal(ctx) {
  const { register, mesh, ell, tube, line } = ctx;
  const shell = cuticle("#773821"),
    joint = "#3e2118";
  const segment = (parent, a, b, r1, r2, color = "#854322") => {
    const av = V(...a),
      bv = V(...b),
      d = bv.clone().sub(av);
    const m = mesh(
      parent,
      new THREE.CylinderGeometry(r2, r1, d.length(), 14, 5),
      cuticle(color),
    );
    m.position.copy(av.add(bv).multiplyScalar(0.5));
    m.quaternion.setFromUnitVectors(V(0, 1, 0), d.normalize());
    return m;
  };
  const bristle = (parent, a, b, r = 0.012) =>
    segment(parent, a, b, r, 0.001, "#382016");
  const abdomen = register(3),
    sterna = register(50);
  const bodyWidth = (y) =>
    profile(THREE.MathUtils.clamp((1.83 - y) / 4.85, 0, 1), [
      [0, 0.65],
      [0.2, 0.82],
      [0.37, 1.06],
      [0.59, 1.08],
      [0.79, 0.88],
      [1, 0.34],
    ]);
  // Seven main visible ventral plates; genital plates are sex-specific below.
  for (let i = 0; i < 7; i++) {
    const y = 0.48 - i * 0.43,
      w = bodyWidth(y);
    mesh(
      i === 0 ? abdomen : sterna,
      surface(
        (u, v) => {
          const yy = y - v * 0.47 + 0.025 * Math.sin(u * Math.PI),
            x = (u * 2 - 1) * bodyWidth(yy) * 0.98;
          return [
            x,
            yy,
            0.07 - 0.16 * Math.sin(u * Math.PI) + 0.015 * Math.sin(v * Math.PI),
          ];
        },
        0.035,
        24,
        12,
      ),
      cuticle(i % 2 ? "#8a4828" : "#74341e"),
    );
  }
  // Continuous pleural cuticle closes the body laterally; it does not expose
  // fat body through artificial gaps between decorative segment spheres.
  for (const side of [-1, 1])
    mesh(
      abdomen,
      surface(
        (u, t) => {
          const w = profile(t, [
            [0, 0.65],
            [0.2, 0.82],
            [0.37, 1.06],
            [0.59, 1.08],
            [0.79, 0.88],
            [1, 0.34],
          ]);
          return [
            side * (w + 0.035 * Math.sin(u * Math.PI)),
            1.83 - t * 4.85,
            0.1 + u * 0.64,
          ];
        },
        0.022,
        12,
        80,
      ),
      cuticle("#764021", { roughness: 0.39 }),
    );
  const thoracic = register(49);
  for (let i = 0; i < 3; i++) {
    const y = 1.99 - i * 0.61;
    const m = ell(thoracic, 0, y, 0.2, 0.67 + i * 0.08, 0.42, 0.25, "#5f2d1c");
    m.material = shell.clone();
    for (const s of [-1, 1])
      line(
        thoracic,
        [
          [s * 0.08, y + 0.3, -0.045],
          [s * 0.4, y + 0.04, -0.06],
          [s * 0.49, y - 0.22, 0.01],
        ],
        "#b78a4d",
        0.55,
      );
  }
  const legs = register(23),
    coxa = register(41),
    trochanter = register(42),
    femur = register(43),
    tibia = register(44),
    tarsus = register(45),
    claws = register(46),
    pads = register(47);
  // The three coxae originate in T1, T2 and T3; jointed legs splay in 3D.
  const paths = [
    [
      [0.43, 1.96, 0.18],
      [0.87, 1.69, 0.16],
      [1.01, 1.89, 0.28],
      [1.7, 2.35, 0.32],
      [2.27, 1.94, 0.02],
      [2.57, 2.15, -0.06],
    ],
    [
      [0.49, 1.23, 0.13],
      [0.98, 0.83, 0.12],
      [1.17, 0.75, 0.23],
      [1.94, 0.42, 0.33],
      [2.65, -0.28, 0.02],
      [2.99, -0.5, -0.06],
    ],
    [
      [0.5, 0.64, 0.14],
      [1.02, 0.12, 0.11],
      [1.16, -0.1, 0.22],
      [1.69, -0.94, 0.37],
      [2.47, -2.03, 0.01],
      [2.85, -2.35, -0.06],
    ],
  ];
  for (const side of [-1, 1])
    for (let leg = 0; leg < 3; leg++) {
      const p = paths[leg].map((a) => [a[0] * side, a[1], a[2]]);
      const socket = ell(legs, ...p[0], 0.2, 0.23, 0.15, joint);
      socket.material.roughness = 0.35;
      segment(coxa, p[0], p[1], 0.21, 0.16, "#995124");
      segment(trochanter, p[1], p[2], 0.12, 0.1, "#7a351c");
      segment(femur, p[2], p[3], 0.135, 0.083, "#91431e");
      segment(tibia, p[3], p[4], 0.067, 0.032, "#8e3f1d");
      for (let j = 1; j < 5; j++)
        ell(legs, ...p[j], j === 3 ? 0.095 : 0.072, 0.075, 0.065, joint);
      const a = V(...p[4]),
        b = V(...p[5]),
        dir = b.clone().sub(a).normalize();
      let prev = a.clone();
      const lengths = [0.36, 0.2, 0.16, 0.13, 0.15];
      let tt = 0;
      for (let k = 0; k < 5; k++) {
        tt += lengths[k];
        const end = a.clone().lerp(b, tt);
        segment(
          tarsus,
          prev.toArray(),
          end.toArray(),
          0.04 - k * 0.004,
          0.027 - k * 0.003,
          "#63301d",
        );
        if (k < 4) {
          const mid = prev.clone().lerp(end, 0.55);
          ell(
            pads,
            mid.x,
            mid.y,
            mid.z - 0.026,
            0.033,
            0.046,
            0.013,
            "#ba9c66",
          );
        }
        prev = end;
      }
      const n = V(-dir.y, dir.x, 0);
      for (const s of [-1, 1]) {
        const a = b.clone().addScaledVector(n, s * 0.035),
          mid = b
            .clone()
            .addScaledVector(dir, 0.1)
            .addScaledVector(n, s * 0.076),
          end = b
            .clone()
            .addScaledVector(dir, 0.16)
            .addScaledVector(n, s * 0.027);
        end.z -= 0.04;
        tube(
          claws,
          [a.toArray(), mid.toArray(), end.toArray()],
          0.012,
          "#2f1d15",
          14,
        );
      }
      ell(
        pads,
        b.x + dir.x * 0.04,
        b.y + dir.y * 0.04,
        b.z - 0.014,
        0.039,
        0.051,
        0.014,
        "#c6b188",
      );
      for (const j of [2, 3]) {
        const a = V(...p[j]),
          b = V(...p[j + 1]),
          d = b.clone().sub(a),
          n = V(-d.y, d.x, 0.15).normalize();
        for (let k = 1; k <= 9; k++)
          for (const row of [-1, 1]) {
            const t = k / 11,
              start = a
                .clone()
                .addScaledVector(d, t)
                .addScaledVector(n, row * (j === 2 ? 0.095 : 0.045));
            const end = start
              .clone()
              .addScaledVector(n, row * (j === 2 ? 0.1 : 0.19))
              .addScaledVector(d, -0.045);
            end.z += 0.035;
            bristle(
              j === 2 ? femur : tibia,
              start.toArray(),
              end.toArray(),
              j === 2 ? 0.014 : 0.019,
            );
          }
        for (let k = 1; k < 20; k++) {
          const start = a.clone().lerp(b, k / 20);
          start.z += 0.065;
          const end = start.clone().add(V(side * 0.025, -0.035, 0.085));
          bristle(
            j === 2 ? femur : tibia,
            start.toArray(),
            end.toArray(),
            0.003,
          );
        }
      }
    }
  const head = register(38);
  const headMesh = ell(head, 0, 2.47, 0.39, 0.43, 0.53, 0.32, "#79321b");
  headMesh.material = cuticle("#79321b");
  const hp = headMesh.geometry.attributes.position;
  for (let i = 0; i < hp.count; i++)
    hp.setX(i, hp.getX(i) * (0.82 + 0.18 * hp.getY(i)));
  headMesh.geometry.computeVertexNormals();
  // Facial sutures remain on the ventral-facing head capsule, under pronotum.
  for (const s of [-1, 1])
    line(
      head,
      [
        [0, 2.57, 0.069],
        [s * 0.17, 2.73, 0.09],
        [s * 0.28, 2.82, 0.16],
      ],
      "#412216",
      0.8,
    );
  const eye = register(18),
    eyeMaps = compoundEyeMaps();
  for (const s of [-1, 1]) {
    const e = ell(eye, s * 0.355, 2.66, 0.45, 0.156, 0.276, 0.197, "#140f0b");
    e.rotation.z = s * -0.22;
    e.material = cuticle(eyeMaps.map ? "#ffffff" : "#191611", {
      ...eyeMaps,
      bumpScale: 0.0014,
      roughness: 0.38,
      clearcoat: 0.28,
    });
    const ep = e.geometry.attributes.position;
    for (let i = 0; i < ep.count; i++) {
      const x = ep.getX(i),
        y = ep.getY(i);
      if (x * s < 0)
        ep.setX(i, x + s * 0.38 * Math.exp(-y * y * 9) * Math.abs(x));
    }
    e.geometry.computeVertexNormals();
  }
  const ocelli = register(19);
  for (const s of [-1, 1])
    ell(ocelli, s * 0.21, 2.7, 0.19, 0.042, 0.048, 0.021, "#cbb477");
  const antenna = register(17),
    scape = register(51);
  for (const s of [-1, 1]) {
    const points =
      s === -1
        ? [
            [-0.28, 2.78, 0.51],
            [-0.45, 3.22, 0.64],
            [-1.26, 4.1, 0.7],
            [-2.3, 4.53, 0.58],
            [-3.39, 4.15, 0.39],
            [-4.1, 3.28, 0.2],
            [-4.53, 2.15, 0.1],
          ]
        : [
            [0.28, 2.78, 0.51],
            [0.52, 3.21, 0.69],
            [1.2, 4.15, 0.81],
            [2.16, 4.72, 0.57],
            [3.18, 4.69, 0.37],
            [4.07, 4.1, 0.18],
            [4.55, 3.15, 0.07],
          ];
    segment(scape, points[0], points[1], 0.059, 0.037, "#8e4d23");
    const curve = new THREE.CatmullRomCurve3(
      points.slice(1).map((a) => V(...a)),
    );
    for (let i = 0; i < 130; i++) {
      const a = curve.getPoint(i / 130),
        b = curve.getPoint((i + 0.94) / 130),
        r = 0.027 * Math.pow(1 - i / 145, 1.25);
      segment(
        antenna,
        a.toArray(),
        b.toArray(),
        r,
        r * 0.94,
        i % 3 ? "#4b2919" : "#6e4327",
      );
      if (i % 2 === 0)
        bristle(
          antenna,
          a.toArray(),
          a
            .clone()
            .add(V(s * 0.015, -0.018, 0.036 * (1 - i / 150)))
            .toArray(),
          0.0015,
        );
    }
  }
  const mand = register(20),
    maxilla = register(21),
    labrum = register(39),
    hypo = register(40),
    labium = register(52),
    palps = register(53);
  const lip = ell(labrum, 0, 2.15, 0.085, 0.21, 0.18, 0.075, "#aa672e");
  lip.material = cuticle("#aa672e");
  ell(hypo, 0, 2.01, 0.145, 0.082, 0.19, 0.055, "#d6bd8b");
  ell(labium, 0, 1.99, 0.26, 0.17, 0.18, 0.07, "#8c5932");
  for (const s of [-1, 1]) {
    const m = ell(mand, s * 0.17, 2.12, 0.155, 0.145, 0.22, 0.1, "#3e2016");
    m.rotation.z = s * 0.4;
    m.material = cuticle("#48251a");
    for (let j = 0; j < (s < 0 ? 4 : 3); j++)
      bristle(
        mand,
        [s * 0.095, 2.01 + j * 0.07, 0.12],
        [s * -0.015, 1.99 + j * 0.07, 0.11],
        0.042 - j * 0.005,
      );
    ell(maxilla, s * 0.3, 2.06, 0.23, 0.095, 0.24, 0.07, "#a5723e");
    ell(maxilla, s * 0.22, 1.88, 0.2, 0.064, 0.13, 0.05, "#c4a66f");
    for (let j = 0; j < 5; j++)
      bristle(
        maxilla,
        [s * 0.18, 1.82 + j * 0.035, 0.19],
        [s * 0.12, 1.81 + j * 0.035, 0.17],
        0.008,
      );
    const paths = [
      [
        [s * 0.34, 2.0, 0.22],
        [s * 0.46, 1.84, 0.16],
        [s * 0.58, 1.8, 0.12],
        [s * 0.72, 1.88, 0.06],
        [s * 0.82, 2.02, 0.0],
        [s * 0.88, 2.1, -0.03],
      ],
      [
        [s * 0.13, 1.96, 0.24],
        [s * 0.24, 1.76, 0.18],
        [s * 0.33, 1.7, 0.12],
        [s * 0.39, 1.78, 0.04],
      ],
    ];
    for (const path of paths)
      for (let i = 0; i < path.length - 1; i++)
        segment(palps, path[i], path[i + 1], 0.032, 0.025, "#ac8551");
  }
  const cerci = register(24);
  for (const s of [-1, 1]) {
    for (let i = 0; i < 17; i++) {
      const t = i / 17,
        r = 0.072 * (1 - t * 0.87),
        a = [s * (0.38 + t * 0.43), -2.87 - t * 0.75, 0.22 - t * 0.11],
        b = [
          s * (0.38 + (t + 1 / 17) * 0.43),
          -2.87 - (t + 0.052) * 0.75,
          0.22 - (t + 0.052) * 0.11,
        ];
      segment(cerci, a, b, r, r * 0.91, "#684020");
      for (let j = 0; j < 4; j++)
        bristle(
          cerci,
          [a[0] + Math.cos(j * 1.57) * r, a[1], a[2] + Math.sin(j * 1.57) * r],
          [
            a[0] + Math.cos(j * 1.57) * (0.1 + r),
            a[1] - 0.06,
            a[2] + Math.sin(j * 1.57) * (0.08 + r),
          ],
          0.0025,
        );
    }
  }
  const terminal = register(54);
  for (const s of [-1, 1])
    mesh(
      terminal,
      surface(
        (u, v) => [
          s * (0.04 + u * 0.38) * (1 - v * 0.52),
          -2.76 - v * 0.39,
          0.25 + 0.1 * Math.sin(u * Math.PI) - v * 0.1,
        ],
        0.025,
        12,
        14,
      ),
      cuticle("#5b2a1a"),
    );
  return { bodyWidth, segment, bristle, legPaths: paths };
}

export function buildCovers(ctx) {
  const { register, mesh, root, flaps } = ctx;
  const maps = {
    wing: cuticleMaps("wing"),
    membrane: cuticleMaps("membrane"),
    pronotum: cuticleMaps("pronotum"),
  };
  const createFlap = (id, index, side, z) => {
    const hinge = new THREE.Group();
    hinge.position.set(side * 1.11, 0, z);
    root.add(hinge);
    const group = register(id, hinge);
    group.position.set(-side * 1.11, 0, -z);
    flaps.push({ hinge, group, index, side, id, open: 0 });
    return group;
  };
  for (const side of [-1, 1]) {
    const wall = createFlap(3, 2, side, 0.65),
      tergites = register(48, wall),
      nota = register(49, wall);
    for (let i = 0; i < 10; i++) {
      const y = 0.69 - i * 0.365,
        w = profile(i / 9, [
          [0, 0.83],
          [0.25, 1.1],
          [0.55, 1.1],
          [0.75, 0.91],
          [1, 0.34],
        ]);
      mesh(
        tergites,
        surface(
          (u, v) => [
            side * u * w,
            y - v * 0.37,
            0.42 +
              0.44 * Math.cos((u * Math.PI) / 2) +
              0.032 * Math.sin(v * Math.PI),
          ],
          0.025,
          18,
          10,
        ),
        cuticle(i % 2 ? "#77351e" : "#854324"),
      );
    }
    // A small piece of body wall belongs to index 03, so the overall shell is
    // selectable independently of its more detailed tergite entry.
    mesh(
      wall,
      surface(
        (u, v) => [side * (0.9 + u * 0.16), 0.48 - v * 2.56, 0.4 - u * 0.15],
        0.02,
        6,
        24,
      ),
      cuticle("#6b321f"),
    );
    for (let i = 0; i < 2; i++)
      mesh(
        nota,
        surface(
          (u, v) => [
            side * u * (0.76 + i * 0.08),
            1.8 - i * 0.55 - v * 0.56,
            0.51 +
              0.4 * Math.cos((u * Math.PI) / 2) +
              0.025 * Math.sin(v * Math.PI),
          ],
          0.03,
          18,
          14,
        ),
        cuticle("#70331e"),
      );
    const hind = createFlap(2, 1, side, 0.72);
    mesh(
      hind,
      surface(
        (u, t) => {
          const width = profile(t, [
            [0, 0.13],
            [0.16, 0.74],
            [0.4, 1.05],
            [0.7, 0.98],
            [0.91, 0.7],
            [1, 0.06],
          ]);
          return [
            side * (0.14 + u * width),
            1.25 - t * 4.05,
            0.83 +
              0.08 * Math.cos(u * Math.PI) +
              Math.sin(u * Math.PI * 24) * 0.014 * Math.sin(t * Math.PI),
          ];
        },
        0.006,
        64,
        64,
      ),
      cuticle("#ffffff", {
        ...maps.membrane,
        roughness: 0.42,
        clearcoat: 0.22,
        bumpScale: 0.006,
        transparent: true,
        opacity: 0.83,
      }),
    );
    const wing = createFlap(1, 0, side, 0.88);
    mesh(
      wing,
      surface(
        (u, t) => {
          const outside = profile(t, [
            [0, 0.66],
            [0.1, 1.0],
            [0.34, 1.17],
            [0.6, 1.08],
            [0.83, 0.82],
            [0.96, 0.37],
            [1, 0.07],
          ]);
          const inside = profile(t, [
            [0, -0.18],
            [0.35, -0.16],
            [0.7, -0.15],
            [0.93, -0.11],
            [1, 0.035],
          ]);
          const x = mix(inside, outside, u),
            y = 1.94 - t * 5.14;
          const arch =
            0.35 *
            Math.cos(((Math.max(0, x) / 1.23) * Math.PI) / 2) *
            Math.pow(Math.sin(Math.PI * (0.08 + t * 0.83)), 0.22);
          return [
            side * x,
            y,
            0.77 + arch - 0.46 * Math.pow(t, 9) + (side < 0 ? 0.021 : 0),
          ];
        },
        0.018,
        40,
        110,
      ),
      cuticle("#ffffff", {
        ...maps.wing,
        bumpScale: 0.009,
        roughness: 0.3,
        clearcoat: 0.72,
        clearcoatRoughness: 0.23,
      }),
    );
  }
  const pronotum = register(22);
  mesh(
    pronotum,
    surface(
      (u, t) => {
        const width = profile(t, [
          [0, 0.12],
          [0.08, 0.43],
          [0.28, 0.7],
          [0.58, 0.81],
          [0.86, 0.77],
          [1, 0.62],
        ]);
        return [
          (u * 2 - 1) * width,
          3.03 - t * 1.32,
          0.53 +
            0.64 *
              Math.pow(Math.sin(Math.PI * (0.035 + t * 0.91)), 0.4) *
              Math.pow(Math.sin(u * Math.PI), 0.55),
        ];
      },
      0.026,
      48,
      56,
    ),
    cuticle("#ffffff", {
      ...maps.pronotum,
      bumpScale: 0.004,
      roughness: 0.26,
      clearcoat: 0.8,
    }),
  );
}
