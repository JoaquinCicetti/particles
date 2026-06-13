import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { bakeCurveTexture, CURVE_COUNT, CURVE_SAMPLES } from './curves'
import { sampleLogoPoints } from './logoSampler'
import { createRandom } from '../../lib/random'
import { scrollState } from '../../lib/scroll'

const IS_MOBILE =
  typeof window !== 'undefined' &&
  (window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent))

const COUNT = IS_MOBILE ? 36000 : 110000

// data-bar field dimensions (phase 3)
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
attribute vec3 aSphere; // direction * radius (sphere centered at y=2.5)
attribute vec3 aLogo;   // world-space wordmark target

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

void main() {
  // per-particle stagger so formations dissolve organically, not in lockstep
  float pp = clamp(uProgress + (aRand.w - 0.5) * 0.06, 0.0, 1.0);

  // telescoping phase weights — always sum to 1
  float toTun  = smoothstep(0.26, 0.42, pp);
  float toGrid = smoothstep(0.54, 0.64, pp);
  float toSph  = smoothstep(0.72, 0.80, pp);
  float toLogo = smoothstep(0.885, 0.955, pp);

  float wFlow = 1.0 - toTun;
  float wTun  = toTun  * (1.0 - toGrid);
  float wGrid = toGrid * (1.0 - toSph);
  float wSph  = toSph  * (1.0 - toLogo);
  float wLogo = toLogo;

  // ── phase 1: telemetry flowing along site curves ──
  float ct = fract(aFlow.x + uTime * 0.02 * aFlow.y);
  vec3 jitter = (aRand.xyz * 2.0 - 1.0);
  vec3 flowPos = sampleCurve(aFlow.z, ct) + jitter * mix(0.32, 0.08, ct);

  // ── phase 2: high-speed upward stream inside the elevator ──
  float ang = aRand.x * 6.28318 + uTime * (0.25 + aRand.y * 0.5);
  float rad = 0.7 + aRand.y * 1.9;
  float ty = fract(aRand.z + uTime * (0.32 + aRand.w * 0.45));
  vec3 tunnelPos = vec3(cos(ang) * rad, ty * 15.0 - 2.0, sin(ang) * rad);
  float core = max(0.0, 1.7 - rad * 0.6);          // luminous central column
  float spark = step(0.92, aRand.w);               // fast bright tracers

  // ── phase 3: structured data field (breathing bars) ──
  float bar = 0.55 + 0.45 * sin(uTime * 1.4 + aGrid.x * 0.9 + aGrid.z * 1.3);
  vec3 gridPos = vec3(aGrid.x, 0.4 + aGrid.y * bar, aGrid.z);

  // ── phase 4: convergence sphere (slow spin + breath) ──
  float ra = uTime * 0.18;
  float cs = cos(ra), sn = sin(ra);
  vec3 sd = aSphere * (1.0 + 0.04 * sin(uTime * 1.8 + aRand.x * 6.28318));
  vec3 spherePos = vec3(cs * sd.x + sn * sd.z, sd.y + 2.5, -sn * sd.x + cs * sd.z);

  // ── phase 5: the wordmark ──
  vec3 logoPos = aLogo + vec3(0.0, 0.012 * sin(uTime * 2.0 + aRand.y * 6.28318), 0.0);

  vec3 pos = wFlow * flowPos + wTun * tunnelPos + wGrid * gridPos + wSph * spherePos + wLogo * logoPos;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float dist = max(0.001, -mv.z);

  // fake depth of field: defocus by distance from the camera's focus plane
  float blur = clamp(abs(dist - uFocus) * 0.07, 0.0, 1.6);

  float size = (1.2 + aRand.y * 1.6) * (1.0 + wLogo * 0.35 + wTun * spark * 1.1);
  gl_PointSize = size * uPixelRatio * (9.0 / dist) * (1.0 + blur * 0.8);

  vec3 deep   = vec3(0.42, 0.20, 0.07); // dark copper
  vec3 bright = vec3(1.0, 0.74, 0.40);  // luminous copper-gold
  float shimmer = 0.5 + 0.5 * sin(uTime * 0.9 + aRand.x * 6.28318);
  float m = clamp(aRand.y * 0.65 + shimmer * 0.35, 0.0, 1.0);
  // grid bars glow toward their tips so the field reads as a graph
  float gridGlow = wGrid * clamp(pos.y / 2.6, 0.0, 1.0) * 0.7;
  vColor = mix(deep, bright, m) * (0.8 + wTun * (0.15 + core * 0.5 + spark * 0.9) + gridGlow);

  // normalize additive energy per formation: same particle count occupies
  // wildly different screen areas in each phase
  float density = wFlow * 0.5 + wTun * 0.3 + wGrid * 0.45 + wSph * 0.12 + wLogo * 0.2;
  vAlpha = (0.5 + 0.5 * aRand.z) * density;
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
    const sphere = new Float32Array(COUNT * 3)
    const logo = new Float32Array(COUNT * 3)

    const golden = Math.PI * (3 - Math.sqrt(5))

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

      // fibonacci sphere shell, radius ~2.3
      const fy = 1 - 2 * ((i + 0.5) / COUNT)
      const fr = Math.sqrt(Math.max(0, 1 - fy * fy))
      const phi = i * golden
      const R = 2.3 * (0.88 + random() * 0.12)
      sphere[i * 3] = Math.cos(phi) * fr * R
      sphere[i * 3 + 1] = fy * R
      sphere[i * 3 + 2] = Math.sin(phi) * fr * R

      // placeholder until the wordmark is sampled: an elliptical halo
      const a = random() * Math.PI * 2
      logo[i * 3] = Math.cos(a) * 3.4
      logo[i * 3 + 1] = 2.5 + Math.sin(a) * 1.1
      logo[i * 3 + 2] = (random() - 0.5) * 0.1
    }

    geo.setAttribute('position', new THREE.BufferAttribute(position, 3))
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 4))
    geo.setAttribute('aFlow', new THREE.BufferAttribute(flow, 3))
    geo.setAttribute('aGrid', new THREE.BufferAttribute(grid, 3))
    geo.setAttribute('aSphere', new THREE.BufferAttribute(sphere, 3))
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
      },
    })
  }, [])

  // swap the halo placeholder for the sampled GROWCAST wordmark
  useEffect(() => {
    let cancelled = false
    sampleLogoPoints(COUNT).then((points) => {
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
