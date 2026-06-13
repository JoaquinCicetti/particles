import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { bakeCurveTexture, CURVE_COUNT, CURVE_SAMPLES } from './curves'
import { sampleSvgPoints } from './svgSampler'
import { BOARD } from './board'
import { createRandom } from '../../lib/random'
import { scrollState } from '../../lib/scroll'

const IS_MOBILE =
  typeof window !== 'undefined' &&
  (window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent))

const COUNT = IS_MOBILE ? 36000 : 110000

// data-bar field dimensions (phase 4)
const BARS_X = 46
const BARS_Z = 22

const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uPixelRatio;
uniform float uFocus;
uniform sampler2D uCurveTex;
uniform float uCurveCount;
uniform float uCurveSamples;

attribute vec4 aRand;
attribute vec3 aFlow;   // offset, speed multiplier, curve index
attribute vec3 aGrid;   // x, unit height, z
attribute vec3 aBoard;  // world-space industrial-board target

varying float vAlpha;
varying vec3 vColor;

vec3 sampleCurve(float curveIdx, float t) {
  float row = (curveIdx + 0.5) / uCurveCount;
  float f = t * (uCurveSamples - 1.0);
  float i0 = floor(f);
  vec3 p0 = texture2D(uCurveTex, vec2((i0 + 0.5) / uCurveSamples, row)).xyz;
  vec3 p1 = texture2D(uCurveTex, vec2((min(i0 + 1.0, uCurveSamples - 1.0) + 0.5) / uCurveSamples, row)).xyz;
  return mix(p0, p1, f - i0);
}

// PCB-style routing from S to E: travel x+z first, then y (right angles)
vec3 manhattanRoute(vec3 S, vec3 E, float s) {
  float sa = smoothstep(0.0, 0.55, s); // lateral leg (x, z)
  float sb = smoothstep(0.45, 1.0, s); // vertical leg (y)
  return vec3(mix(S.x, E.x, sa), mix(S.y, E.y, sb), mix(S.z, E.z, sa));
}

void main() {
  // per-particle stagger so formations dissolve organically, not in lockstep
  float pp = clamp(uProgress + (aRand.w - 0.5) * 0.05, 0.0, 1.0);

  // ── pre-formations: flow → elevator stream → data field (telescoping) ──
  float toTun  = smoothstep(0.22, 0.36, pp);
  float toGrid = smoothstep(0.46, 0.55, pp);

  float wFlow = 1.0 - toTun;
  float wTun  = toTun * (1.0 - toGrid);
  float wGrid = toGrid;

  // phase 1: telemetry flowing along the site curves
  float ct = fract(aFlow.x + uTime * 0.02 * aFlow.y);
  vec3 jitter = (aRand.xyz * 2.0 - 1.0);
  vec3 flowPos = sampleCurve(aFlow.z, ct) + jitter * mix(0.32, 0.08, ct);

  // phase 2: upward stream inside the elevator (calm flux behind the cards)
  float ang = aRand.x * 6.28318 + uTime * (0.15 + aRand.y * 0.28);
  float rad = 0.7 + aRand.y * 1.9;
  float ty = fract(aRand.z + uTime * (0.18 + aRand.w * 0.26));
  vec3 tunnelPos = vec3(cos(ang) * rad, ty * 15.0 - 2.0, sin(ang) * rad);
  float core = max(0.0, 1.7 - rad * 0.6);

  // phase 3: structured data field (breathing bars)
  float bar = 0.55 + 0.45 * sin(uTime * 1.4 + aGrid.x * 0.9 + aGrid.z * 1.3);
  vec3 gridPos = vec3(aGrid.x, 0.4 + aGrid.y * bar, aGrid.z);

  vec3 pre = wFlow * flowPos + wTun * tunnelPos + wGrid * gridPos;

  // ── phases 5–6: circuit routing that converges into the board ──
  // staggered so particles stream like signals through the traces
  float settleRaw = smoothstep(0.58, 0.84, pp);
  float lead = (aRand.x * 0.6 + aRand.z * 0.4) * 0.32; // per-particle head start
  float settle = clamp(settleRaw * (1.0 + lead) - lead * 0.5, 0.0, 1.0);
  vec3 routed = manhattanRoute(pre, aBoard, settle);
  // gentle data-flicker once resting on the board
  routed.y += settle * 0.01 * sin(uTime * 1.6 + aRand.x * 6.28318);

  vec3 pos = routed;

  // moving "signal head": bright while a particle is mid-route, calm at rest
  float transit = settle * (1.0 - settle) * 4.0;          // 0 at ends, 1 mid
  float routing = step(0.001, settle) * step(settle, 0.999);
  float head = transit * routing;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float dist = max(0.001, -mv.z);

  // fake depth of field: defocus by distance from the camera's focus plane
  float blur = clamp(abs(dist - uFocus) * 0.07, 0.0, 1.6);

  // board particles small & crisp so traces stay legible; heads pop
  float settled = settle * (1.0 - head);
  float size = (1.2 + aRand.y * 1.6) * (1.0 - settled * 0.5 + head * 1.1);
  gl_PointSize = size * uPixelRatio * (9.0 / dist) * (1.0 + blur * 0.8);

  vec3 deep   = vec3(0.42, 0.20, 0.07); // dark copper
  vec3 bright = vec3(1.0, 0.74, 0.40);  // luminous copper-gold
  vec3 white  = vec3(1.0, 0.92, 0.78);  // hot signal head
  float shimmer = 0.5 + 0.5 * sin(uTime * 0.9 + aRand.x * 6.28318);
  float m = clamp(aRand.y * 0.65 + shimmer * 0.35, 0.0, 1.0);
  vColor = mix(deep, bright, m) * (0.8 + wTun * (0.15 + core * 0.5));
  vColor = mix(vColor, white, head * 0.85);

  // normalize additive energy per formation: same particle count occupies
  // wildly different screen areas in each phase
  float density = wFlow * 0.5 + wTun * 0.3 + wGrid * 0.45;
  density = mix(density, 0.5, settle); // board reads denser/crisper
  vAlpha = (0.5 + 0.5 * aRand.z) * density * (1.0 + head * 0.6);
  vAlpha *= smoothstep(0.8, 2.6, dist);          // don't bloom out near camera
  vAlpha /= (1.0 + blur * blur * 1.6);           // defocused = dimmer
}
`

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

    const position = new Float32Array(COUNT * 3) // computed in shader
    const rand = new Float32Array(COUNT * 4)
    const flow = new Float32Array(COUNT * 3)
    const grid = new Float32Array(COUNT * 3)
    const board = new Float32Array(COUNT * 3)

    for (let i = 0; i < COUNT; i++) {
      rand[i * 4] = random()
      rand[i * 4 + 1] = random()
      rand[i * 4 + 2] = random()
      rand[i * 4 + 3] = random()

      flow[i * 3] = random()
      flow[i * 3 + 1] = 0.6 + random() * 0.9
      flow[i * 3 + 2] = Math.floor(random() * CURVE_COUNT)

      // breathing bar field, 14×6.4 world units
      const bi = i % (BARS_X * BARS_Z)
      grid[i * 3] = -7 + (bi % BARS_X) * (14 / (BARS_X - 1)) + (random() - 0.5) * 0.04
      grid[i * 3 + 1] = Math.pow(random(), 1.4) * 2.6
      grid[i * 3 + 2] = -3.2 + Math.floor(bi / BARS_X) * (6.4 / (BARS_Z - 1)) + (random() - 0.5) * 0.04

      // placeholder until the board SVG is sampled (async): a vertical halo
      const ab = random() * Math.PI * 2
      board[i * 3] = Math.cos(ab) * 2.7
      board[i * 3 + 1] = BOARD.centerY + Math.sin(ab) * 3.2
      board[i * 3 + 2] = (random() - 0.5) * 0.1
    }

    geo.setAttribute('position', new THREE.BufferAttribute(position, 3))
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 4))
    geo.setAttribute('aFlow', new THREE.BufferAttribute(flow, 3))
    geo.setAttribute('aGrid', new THREE.BufferAttribute(grid, 3))
    geo.setAttribute('aBoard', new THREE.BufferAttribute(board, 3))
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
      },
    })
  }, [])

  // swap the halo placeholder for the sampled industrial board (async)
  useEffect(() => {
    let cancelled = false
    sampleSvgPoints('/industrial-board.svg', COUNT, {
      worldHeight: BOARD.worldHeight,
      centerY: BOARD.centerY,
      rasterHeight: 1100,
      step: 2,
      depth: 0.12,
      seed: 13371,
    }).then((points) => {
      if (cancelled) return
      const attr = geometry.getAttribute('aBoard') as THREE.BufferAttribute
      ;(attr.array as Float32Array).set(points)
      attr.needsUpdate = true
    })
    return () => {
      cancelled = true
    }
  }, [geometry])

  useEffect(() => {
    const tex = material.uniforms.uCurveTex.value as THREE.DataTexture
    return () => {
      geometry.dispose()
      material.dispose()
      tex.dispose()
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
