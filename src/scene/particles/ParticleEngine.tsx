import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { bakeCurveTexture, CURVE_COUNT, CURVE_SAMPLES } from './curves'
import { bakePcbTexture, TRACE_COUNT, TRACE_SAMPLES } from './pcb'
import { sampleSvgPoints } from './svgSampler'
import { createRandom } from '../../lib/random'
import { scrollState } from '../../lib/scroll'

const IS_MOBILE =
  typeof window !== 'undefined' &&
  (window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent))

const COUNT = IS_MOBILE ? 36000 : 110000

// ordered data-column field (act 2)
const COLS_X = 60
const COLS_Z = 14

const LOGO_CENTER_Y = 2.9

/**
 * Choreography is deliberately ORDERED — no uniform cross-dissolves that
 * scatter particles into a cloud. Each particle assembles through staggered,
 * per-particle snaps:
 *   telemetry flow → data columns → PCB paths (drawn in left→right) → logo
 * The PCB is STATIC (each particle fixed on a trace); only a brightness pulse
 * travels, so it reads as a crisp circuit board, not moving noise.
 */
const vertexShader = /* glsl */ `
uniform float uTime;
uniform float uProgress;
uniform float uPixelRatio;
uniform float uFocus;
uniform sampler2D uCurveTex;
uniform float uCurveCount;
uniform float uCurveSamples;
uniform sampler2D uPcbTex;
uniform float uPcbCount;
uniform float uPcbSamples;

attribute vec4 aRand;
attribute vec3 aFlow;    // curve index, offset, speed
attribute vec3 aColumn;  // x, height 0..1, z
attribute vec4 aPcb;     // trace index, t along trace, reveal order, pad flag
attribute vec3 aLogo;    // brand-mark target

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
  float pp = clamp(uProgress, 0.0, 1.0);

  // ── act 1: telemetry flowing along the farm curves (tight, ordered) ──
  float ct = fract(aFlow.y + uTime * 0.02 * aFlow.z);
  vec3 jitter = (aRand.xyz * 2.0 - 1.0);
  vec3 flowPos = sampleTex(uCurveTex, uCurveCount, uCurveSamples, aFlow.x, ct) + jitter * mix(0.14, 0.04, ct);

  // ── act 2: ordered data columns (structured data) ──
  float sway = 0.04 * sin(uTime * 1.1 + aColumn.x * 0.7);
  vec3 colPos = vec3(aColumn.x, 0.35 + aColumn.y * 3.1 + sway, aColumn.z);

  // ── act 3: PCB paths — STATIC position on a trace (crisp) ──
  vec3 pcbPos = sampleTex(uPcbTex, uPcbCount, uPcbSamples, aPcb.x, aPcb.y) + jitter * 0.01;

  // ── act 4: brand mark ──
  vec3 logoPos = aLogo;

  // ordered, staggered per-particle assembles (small snap windows → no cloud)
  float colT  = smoothstep(0.30 + aRand.x * 0.10, 0.40 + aRand.x * 0.10, pp);
  float pcbT  = smoothstep(0.52 + aPcb.z * 0.20, 0.59 + aPcb.z * 0.20, pp); // left→right draw-in
  float logoT = smoothstep(0.82 + aRand.y * 0.08, 0.89 + aRand.y * 0.08, pp);

  vec3 p1 = mix(flowPos, colPos, colT);
  vec3 p2 = mix(p1, pcbPos, pcbT);
  vec3 pos = mix(p2, logoPos, logoT);

  // state flags for shading
  float inPcb = pcbT * (1.0 - logoT);
  float inLogo = logoT;

  // travelling signal pulse along the trace (brightness only — position static)
  float pulse = pow(0.5 + 0.5 * sin((aPcb.y - uTime * 0.35) * 6.28318 * 3.0), 8.0) * inPcb;
  float padGlow = aPcb.w * inPcb; // pads stay lit

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float dist = max(0.001, -mv.z);

  float blur = clamp(abs(dist - uFocus) * 0.06, 0.0, 1.4);

  float size = (1.1 + aRand.y * 1.5) * (1.0 + inLogo * 0.4 - inPcb * 0.25 + pulse * 1.6 + padGlow * 1.0);
  gl_PointSize = size * uPixelRatio * (9.0 / dist) * (1.0 + blur * 0.7);

  vec3 deep   = vec3(0.42, 0.20, 0.07);
  vec3 copper = vec3(0.79, 0.49, 0.24);
  vec3 white  = vec3(1.0, 0.92, 0.78);
  float shimmer = 0.5 + 0.5 * sin(uTime * 0.9 + aRand.x * 6.28318);
  float m = clamp(aRand.y * 0.6 + shimmer * 0.3, 0.0, 1.0);
  vColor = mix(deep, copper, m);
  vColor = mix(vColor, white, clamp(pulse + padGlow * 0.6, 0.0, 1.0));
  vColor *= (1.0 + inLogo * 0.15);

  // per-state alpha — crisp where it matters, never a flat haze
  float density = 0.42 + colT * 0.05 + inPcb * 0.12 + inLogo * 0.0;
  vAlpha = (0.55 + 0.45 * aRand.z) * density * (1.0 + pulse * 1.2 + padGlow * 0.8);
  vAlpha *= smoothstep(0.7, 2.4, dist);
  vAlpha /= (1.0 + blur * blur * 1.5);
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

  const { geometry, pcbTex } = useMemo(() => {
    const random = createRandom(987654)
    const geo = new THREE.BufferGeometry()
    const { tex, order } = bakePcbTexture()

    const position = new Float32Array(COUNT * 3)
    const rand = new Float32Array(COUNT * 4)
    const flow = new Float32Array(COUNT * 3)
    const column = new Float32Array(COUNT * 3)
    const pcb = new Float32Array(COUNT * 4)
    const logo = new Float32Array(COUNT * 3)

    // last 18% of traces are pads (see pcb.ts roll thresholds)
    const padStart = Math.floor(TRACE_COUNT * 0.82)

    for (let i = 0; i < COUNT; i++) {
      rand[i * 4] = random()
      rand[i * 4 + 1] = random()
      rand[i * 4 + 2] = random()
      rand[i * 4 + 3] = random()

      flow[i * 3] = Math.floor(random() * CURVE_COUNT)
      flow[i * 3 + 1] = random()
      flow[i * 3 + 2] = 0.6 + random() * 0.9

      // ordered column field, ~16 world units wide
      const bi = i % (COLS_X * COLS_Z)
      column[i * 3] = -8 + (bi % COLS_X) * (16 / (COLS_X - 1))
      column[i * 3 + 1] = Math.pow(random(), 1.3)
      column[i * 3 + 2] = -3.2 + Math.floor(bi / COLS_X) * (6.4 / (COLS_Z - 1))

      const tIdx = Math.floor(random() * TRACE_COUNT)
      pcb[i * 4] = tIdx
      pcb[i * 4 + 1] = random() // fixed t along the trace (static)
      pcb[i * 4 + 2] = order[tIdx] // reveal order (left→right)
      pcb[i * 4 + 3] = tIdx >= padStart ? 1 : 0 // pad flag

      // placeholder until logo SVG samples in
      const a = random() * Math.PI * 2
      logo[i * 3] = Math.cos(a) * 1.6
      logo[i * 3 + 1] = LOGO_CENTER_Y + Math.sin(a) * 1.6
      logo[i * 3 + 2] = (random() - 0.5) * 0.1
    }

    geo.setAttribute('position', new THREE.BufferAttribute(position, 3))
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 4))
    geo.setAttribute('aFlow', new THREE.BufferAttribute(flow, 3))
    geo.setAttribute('aColumn', new THREE.BufferAttribute(column, 3))
    geo.setAttribute('aPcb', new THREE.BufferAttribute(pcb, 4))
    geo.setAttribute('aLogo', new THREE.BufferAttribute(logo, 3))
    return { geometry: geo, pcbTex: tex }
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
        uPcbTex: { value: pcbTex },
        uPcbCount: { value: TRACE_COUNT },
        uPcbSamples: { value: TRACE_SAMPLES },
      },
    })
  }, [pcbTex])

  useEffect(() => {
    let cancelled = false
    sampleSvgPoints('/logo.svg', COUNT, {
      worldHeight: 3.2,
      centerY: LOGO_CENTER_Y,
      rasterHeight: 820,
      step: 2,
      depth: 0.08,
      seed: 40427,
    }).then((points) => {
      if (cancelled) return
      const attr = geometry.getAttribute('aLogo') as THREE.BufferAttribute
      ;(attr.array as Float32Array).set(points)
      attr.needsUpdate = true
    })
    return () => {
      cancelled = true
    }
  }, [geometry])

  useEffect(() => {
    const curveTex = material.uniforms.uCurveTex.value as THREE.DataTexture
    return () => {
      geometry.dispose()
      material.dispose()
      curveTex.dispose()
      pcbTex.dispose()
    }
  }, [geometry, material, pcbTex])

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
