import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { bakeCurveTexture, CURVE_COUNT, CURVE_SAMPLES, ELEVATOR, FEED_COUNT } from './curves'
import { fillFromPads, LANE_COUNT, LANE_HALF, LANE_STEP, logoPads, squarePads } from './logoPads'
import { rasterizeSvg, rasterSilhouette, sampleRasterPoints } from './svgSampler'
import { createRandom } from '../../lib/random'
import { scrollState } from '../../lib/scroll'

const IS_MOBILE =
  typeof window !== 'undefined' &&
  (window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent))

const COUNT = IS_MOBILE ? 36000 : 110000

// structured data field — sorted into 3D rows (act 4)
const BARS_X = 48
const BARS_Z = 22

// the brand mark sits high above the rows so the data visibly flows UP into it
const LOGO_CENTER_Y = 6.2
const LOGO_HEIGHT = 3.2

/**
 * Final act follows one idea: the data converges into Growcast. Once particles
 * are sorted into the structured 3D rows they gather onto circuit lanes and
 * route UP through them the way copper on a real board does — a run climbs,
 * turns once, carries on, and never forks into three directions at a point —
 * until every lane lands on a connector on the brand mark's own outline, and
 * floods from there into the mark. An ordered, staggered left→right sweep,
 * never a disordered cloud.
 */
const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uPixelRatio;
uniform float uFocus;
uniform sampler2D uCurveTex;
uniform float uCurveCount;
uniform float uCurveSamples;
uniform vec4 uPads[LANE_COUNT_I]; // per-lane connector, see logoPads.ts

attribute vec4 aRand;
attribute vec3 aFlow;   // offset, speed multiplier, curve index
attribute vec3 aGrid;   // x, unit height, z
attribute vec3 aLogo;   // world-space brand-mark target

varying float vAlpha;
varying vec3 vColor;

vec3 sampleTex(sampler2D tex, float count, float samples, float idx, float t) {
  float row = (idx + 0.5) / count;
  float f = t * (samples - 1.0);
  float i0 = floor(f);
  vec3 p0 = texture2D(tex, vec2((i0 + 0.5) / samples, row)).xyz;
  vec3 p1 = texture2D(tex, vec2((min(i0 + 1.0, samples - 1.0) + 0.5) / samples, row)).xyz;
  return mix(p0, p1, f - i0);
}

void main() {
  float pp = clamp(uProgress + (aRand.w - 0.5) * 0.04, 0.0, 1.0);

  // flow → elevator stream → structured rows → (riser up into the logo)
  float toTun  = smoothstep(0.30, 0.42, pp);
  float toGrid = smoothstep(0.50, 0.58, pp);
  float wFlow = 1.0 - toTun;
  float wTun  = toTun * (1.0 - toGrid);
  float base  = toGrid; // weight of the rows→riser→logo branch

  // ── act 1: telemetry drifting off the farm and into the enclosure ──
  // the curve is only a guide: the scatter around it starts very wide, so out
  // by the sensors this is a cloud floating in the air rather than a line, and
  // collapses to nothing as it reaches the box — read as being absorbed.
  float ct = fract(aFlow.x + uTime * 0.02 * aFlow.y);
  vec3 jitter = (aRand.xyz * 2.0 - 1.0);
  // the two kinds of curve want opposite profiles: a sensor drift is a wide
  // cloud at its source that collapses into the box, while the uplink leaves
  // the box tight and only opens as it disperses into the sky
  float isUp = step(FEED_COUNT_C - 0.5, aFlow.z);
  float spreadFeed = mix(1.15, 0.04, pow(ct, 0.7));
  float spreadUp   = mix(0.05, 0.45, pow(ct, 2.0));
  float spread = mix(spreadFeed, spreadUp, isUp);
  vec3 flowPos = sampleTex(uCurveTex, uCurveCount, uCurveSamples, aFlow.z, ct) + jitter * spread;

  // ── act 2: calm upward stream inside the elevator (centred on the tower) ──
  float ang = aRand.x * 6.28318 + uTime * (0.15 + aRand.y * 0.28);
  float rad = 0.7 + aRand.y * 1.9;
  float ty = fract(aRand.z + uTime * (0.18 + aRand.w * 0.26));
  vec3 tunnelPos = vec3(TOWER_X_C + cos(ang) * rad, ty * 15.0 - 2.0, TOWER_Z_C + sin(ang) * rad);
  float core = max(0.0, 1.7 - rad * 0.6);

  // ── act 3: structured 3D rows (crisp, gently alive) ──
  float breathe = 0.04 * sin(uTime * 1.1 + aGrid.x * 0.7);
  vec3 gridPos = vec3(aGrid.x, 0.45 + aGrid.y * 3.0 + breathe, aGrid.z);

  // ── act 4: the brand mark (raised, the destination) ──
  vec3 logoPos = aLogo;

  // ── riser: the rows route up into the mark. Copper on a real board only
  //    ever runs vertical, horizontal or at 45, and a run never forks into
  //    three directions at a point — it turns once and carries on. So a lane
  //    is one polyline, every particle on that lane rides that same polyline,
  //    strung out along its length so the lane reads as a trace being drawn.
  //    Every trace ends on a connector on the mark's own outline: inner lanes
  //    come up into its underside, outer lanes climb alongside and turn in
  //    horizontally onto its flank, the outermost landing highest so no two
  //    traces cross. Where each connector sits is worked out on the CPU from
  //    the rasterized mark (logoPads.ts). ──
  float laneStep = LANE_STEP_C;
  float laneK = clamp(floor(aGrid.x / laneStep + 0.5), -LANE_HALF_C, LANE_HALF_C);
  float laneX = laneK * laneStep;
  float h1 = fract(sin(laneX * 12.9898) * 43758.5453);
  float h3 = fract(sin(laneX * 45.1640 + 9.1) * 13758.5453);

  vec4 pad = uPads[int(laneK + LANE_HALF_C)];
  float side = laneX < 0.0 ? -1.0 : 1.0;

  vec2 n0 = vec2(laneX, 0.5 + h3 * 0.3); // the lane's foot on the board
  vec2 n1, n2;
  vec2 n3 = pad.xy;

  if (pad.w < 0.5) {
    // bottom entry: a vertical run, one 45 jog onto the connector's column,
    // then vertical up into the underside of the mark
    float jog = pad.x - laneX;
    float y1 = min(1.15 + h1 * 1.25, pad.z);
    n1 = vec2(laneX, y1);
    n2 = vec2(pad.x, y1 + abs(jog)); // dy matches |dx| exactly: a true 45
  } else {
    // side entry: climb alongside the mark, one 45 turn inwards, then a
    // horizontal run onto a connector on its flank
    float turn = pad.z;
    n1 = vec2(laneX, pad.y - turn);
    n2 = vec2(laneX - side * turn, pad.y);
  }

  float l1 = distance(n0, n1);
  float l2 = distance(n1, n2);
  float l3 = distance(n2, n3);

  float order = clamp((aGrid.x + 8.0) / 16.0, 0.0, 1.0); // left→right sweep
  float rstart = 0.58 + order * 0.08;
  float rp = smoothstep(rstart, rstart + 0.24, pp);

  // every particle rides its lane a little ahead of or behind its neighbours,
  // so the trace draws itself in instead of travelling as one clump
  float lead = aRand.z * 0.30;
  float run = clamp((rp - lead) / 0.42, 0.0, 1.0) * (l1 + l2 + l3);
  vec2 q;
  if (run < l1) q = mix(n0, n1, run / max(l1, 0.001));
  else if (run < l1 + l2) q = mix(n1, n2, (run - l1) / max(l2, 0.001));
  else q = mix(n2, n3, (run - l1 - l2) / max(l3, 0.001));
  q += (aRand.xy - 0.5) * 0.05; // a hair of width on the trace

  // a hair of layer separation, so crossing routes read as a stack of layers
  float panelZ = (h3 - 0.5) * 0.4;

  float la = smoothstep(0.00, 0.10, rp); // the rows purge onto the lane foot
  float lg = smoothstep(0.76, 1.00, rp); // flood from the connector into the mark

  vec3 P = mix(gridPos, vec3(q, panelZ), la);
  P = mix(P, aLogo, lg);
  vec3 riserPos = P;

  vec3 pos = wFlow * flowPos + wTun * tunnelPos + base * riserPos;

  // bright signal pulse travelling along the traces, over the whole routed run
  float rising = la * (1.0 - lg);
  float pulse = pow(0.5 + 0.5 * sin(P.y * 1.6 - uTime * 2.4 + laneX), 8.0) * rising;
  float inLogo = lg;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float dist = max(0.001, -mv.z);

  float blur = clamp(abs(dist - uFocus) * 0.07, 0.0, 1.6);

  float size = (1.2 + aRand.y * 1.6) * (1.0 - wFlow * 0.42 + inLogo * 0.35 + pulse * 1.4);
  gl_PointSize = size * uPixelRatio * (9.0 / dist) * (1.0 + blur * 0.8);

  vec3 deep   = vec3(0.26, 0.31, 0.11);
  vec3 bright = vec3(0.79, 0.85, 0.43);
  vec3 white  = vec3(0.96, 1.0, 0.86);
  float shimmer = 0.5 + 0.5 * sin(uTime * 0.9 + aRand.x * 6.28318);
  float m = clamp(aRand.y * 0.65 + shimmer * 0.35, 0.0, 1.0);
  vColor = mix(deep, bright, m) * (0.8 + wTun * (0.15 + core * 0.5) + rising * 0.25);
  vColor = mix(vColor, white, pulse * 0.85);

  // the farm flow is deliberately the sparsest act: drifting motes gathered
  // into the enclosure and one condensed uplink out of it, not a haze
  float density = wFlow * 0.095 + wTun * 0.3 + base * 0.42;
  vAlpha = (0.5 + 0.5 * aRand.z) * density * (1.0 + pulse * 0.9);
  vAlpha *= smoothstep(0.8, 2.6, dist);
  vAlpha /= (1.0 + blur * blur * 1.6);
  // the uplink dissolves as it leaves — the data going out to the platform.
  // starts high enough that the wire out of the board still reads as solid.
  float skyFade = 1.0 - smoothstep(12.0, 17.8, pos.y);
  vAlpha *= mix(1.0, skyFade, wFlow);
}
`
  .replace(/LANE_COUNT_I/g, String(LANE_COUNT))
  .replace(/LANE_HALF_C/g, LANE_HALF.toFixed(1))
  .replace(/LANE_STEP_C/g, LANE_STEP.toFixed(3))
  .replace(/FEED_COUNT_C/g, FEED_COUNT.toFixed(1))
  .replace(/TOWER_X_C/g, ELEVATOR.pos.x.toFixed(2))
  .replace(/TOWER_Z_C/g, ELEVATOR.pos.z.toFixed(2))

const fragmentShader = /* glsl */ `
varying float vAlpha;
varying vec3 vColor;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float a = smoothstep(0.5, 0.08, d) * vAlpha;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vColor, a);
}
`

export default function ParticleEngine() {
  const dpr = useThree((s) => s.viewport.dpr)

  const geometry = useMemo(() => {
    const random = createRandom(987654)
    const geo = new THREE.BufferGeometry()

    const position = new Float32Array(COUNT * 3)
    const rand = new Float32Array(COUNT * 4)
    const flow = new Float32Array(COUNT * 3)
    const grid = new Float32Array(COUNT * 3)
    const logo = new Float32Array(COUNT * 3)

    for (let i = 0; i < COUNT; i++) {
      rand[i * 4] = random()
      rand[i * 4 + 1] = random()
      rand[i * 4 + 2] = random()
      rand[i * 4 + 3] = random()

      flow[i * 3] = random()
      flow[i * 3 + 1] = 0.6 + random() * 0.9
      flow[i * 3 + 2] = Math.floor(random() * CURVE_COUNT)

      // structured rows, 16×6.4 world units
      const bi = i % (BARS_X * BARS_Z)
      grid[i * 3] = -8 + (bi % BARS_X) * (16 / (BARS_X - 1)) + (random() - 0.5) * 0.03
      grid[i * 3 + 1] = Math.pow(random(), 1.4) * 2.6
      grid[i * 3 + 2] = -3.2 + Math.floor(bi / BARS_X) * (6.4 / (BARS_Z - 1)) + (random() - 0.5) * 0.03

      // placeholder until the logo SVG is sampled (async): a small halo
      const a = random() * Math.PI * 2
      logo[i * 3] = Math.cos(a) * 1.6
      logo[i * 3 + 1] = LOGO_CENTER_Y + Math.sin(a) * 1.6
      logo[i * 3 + 2] = (random() - 0.5) * 0.1
    }

    geo.setAttribute('position', new THREE.BufferAttribute(position, 3))
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 4))
    geo.setAttribute('aFlow', new THREE.BufferAttribute(flow, 3))
    geo.setAttribute('aGrid', new THREE.BufferAttribute(grid, 3))
    geo.setAttribute('aLogo', new THREE.BufferAttribute(logo, 3))
    return geo
  }, [])

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uPixelRatio: { value: 1 },
        uFocus: { value: 10 },
        uCurveTex: { value: bakeCurveTexture() },
        uCurveCount: { value: CURVE_COUNT },
        uCurveSamples: { value: CURVE_SAMPLES },
        // square package until the mark is rasterized, then its own outline
        uPads: { value: squarePads(LOGO_CENTER_Y, LOGO_HEIGHT) },
      },
    })
  }, [])

  // swap the halo placeholder for the sampled Growcast leaf mark, and the
  // square package for connectors on its outline (async)
  useEffect(() => {
    let cancelled = false
    const placement = { worldHeight: LOGO_HEIGHT, centerY: LOGO_CENTER_Y }
    rasterizeSvg('/logo.svg', 820)
      .catch(() => null)
      .then((raster) => {
        if (cancelled) return
        const points = sampleRasterPoints(raster, COUNT, {
          ...placement,
          step: 2,
          depth: 0.08,
          seed: 40427,
        })
        const silhouette = raster && rasterSilhouette(raster, placement)
        if (silhouette) {
          const pads = logoPads(silhouette)
          material.uniforms.uPads.value = pads
          const grid = geometry.getAttribute('aGrid').array as Float32Array
          fillFromPads(points, (i) => grid[i * 3], pads)
        }
        const attr = geometry.getAttribute('aLogo') as THREE.BufferAttribute
        ;(attr.array as Float32Array).set(points)
        attr.needsUpdate = true
      })
    return () => {
      cancelled = true
    }
  }, [geometry, material])

  useEffect(() => {
    const curveTex = material.uniforms.uCurveTex.value as THREE.DataTexture
    return () => {
      geometry.dispose()
      material.dispose()
      curveTex.dispose()
    }
  }, [geometry, material])

  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime
    material.uniforms.uProgress.value = scrollState.smooth
    material.uniforms.uFocus.value = scrollState.focusDist
    material.uniforms.uPixelRatio.value = dpr
  })

  return (
    <points frustumCulled={false} geometry={geometry}>
      <primitive object={material} attach="material" />
    </points>
  )
}
