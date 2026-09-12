import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { bakeCurveTexture, CURVE_COUNT, CURVE_SAMPLES, ELEVATOR } from './curves'
import { bakePcbTexture, TRACE_COUNT, TRACE_SAMPLES } from './pcb'
import { sampleSvgPoints } from './svgSampler'
import { createRandom } from '../../lib/random'
import { scrollState } from '../../lib/scroll'
import { ACTS_GLSL } from '../../lib/acts'

const IS_MOBILE =
  typeof window !== 'undefined' &&
  (window.innerWidth < 768 || /Mobi|Android/i.test(navigator.userAgent))

const COUNT = IS_MOBILE ? 36000 : 110000

// the brand mark sits high above the board so the data visibly flows UP into it
const LOGO_CENTER_Y = 6.2

/**
 * Final act follows one idea: the data converges into Growcast.
 *
 * The structured field is a real PCB — traces routed by pcb.ts (bus rows,
 * right-angle branches, pads snapped to a 0.3 grid) and baked into a
 * DataTexture. Each particle owns one point on one trace and HOLDS it: the
 * board is static copper, and only a brightness pulse travels along it. That
 * stillness is what makes it read as etched metal rather than moving noise.
 *
 * Then the hand-off. This board was built and deleted twice before because it
 * read as a flat wall and lost the "data rises into Growcast" metaphor. So once
 * it is lit, every trace lifts from ITS OWN PAD — the pad's baked position, not
 * a per-lane hash — climbs vertically, jogs at a right angle toward the mark's
 * column, and finishes the climb onto the logo. Board = substrate, logo =
 * destination above it, with visible upward flow in between.
 */
const vertexShader = /* glsl */ `
ACTS_DEFINES

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
attribute vec3 aFlow;   // offset, speed multiplier, curve index
attribute vec4 aPcb;    // trace index, t along trace, left→right order, pad flag
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

  // flow → elevator stream → PCB → (riser up into the logo)
  float toTun  = smoothstep(GC_STREAM_IN, GC_STREAM_FULL, pp);
  // the board draws in left→right: each trace waits its turn by its own order
  float bStart = GC_BOARD_IN + aPcb.z * 0.02;
  float toGrid = smoothstep(bStart, bStart + (GC_BOARD_FULL - GC_BOARD_IN), pp);
  float wFlow = 1.0 - toTun;
  float wTun  = toTun * (1.0 - toGrid);
  float base  = toGrid; // weight of the board→riser→logo branch

  // ── act 1: telemetry flowing along the farm curves (soft, tight) ──
  float ct = fract(aFlow.x + uTime * 0.02 * aFlow.y);
  vec3 jitter = (aRand.xyz * 2.0 - 1.0);
  vec3 flowPos = sampleTex(uCurveTex, uCurveCount, uCurveSamples, aFlow.z, ct) + jitter * mix(0.10, 0.05, ct);

  // ── act 2: calm upward stream inside the elevator (centred on the tower) ──
  float ang = aRand.x * 6.28318 + uTime * (0.15 + aRand.y * 0.28);
  float rad = 0.7 + aRand.y * 1.9;
  float ty = fract(aRand.z + uTime * (0.18 + aRand.w * 0.26));
  vec3 tunnelPos = vec3(TOWER_X_C + cos(ang) * rad, ty * 15.0 - 2.0, TOWER_Z_C + sin(ang) * rad);
  float core = max(0.0, 1.7 - rad * 0.6);

  // ── act 3: the board. STATIC copper — the particle holds its routed point ──
  vec3 boardPos = sampleTex(uPcbTex, uPcbCount, uPcbSamples, aPcb.x, aPcb.y);
  // this trace's pad: the end of its own routed path
  vec3 pad = sampleTex(uPcbTex, uPcbCount, uPcbSamples, aPcb.x, 1.0);

  // ── the hand-off: pad → straight up → right-angle jog → onto the mark ──
  float h = fract(sin(aPcb.x * 91.7317) * 43758.5453);
  // climb high enough to clear the board, but stop under this particle's own
  // landing point so the last move is always upward
  float jogY = max(pad.y + 0.55 + h * 0.5, aLogo.y - 0.45 - h * 0.5);

  float rStart = GC_RISE_AT + aPcb.z * GC_RISE_STAGGER;
  float rp = smoothstep(rStart, rStart + GC_RISE_SPAN, pp);
  float ra = smoothstep(0.00, 0.28, rp);  // gather down the trace onto the pad
  float rb = smoothstep(0.22, 0.55, rp);  // rise vertically off the pad
  float rc = smoothstep(0.50, 0.74, rp);  // right-angle jog into the logo column
  float rd = smoothstep(0.68, 1.0, rp);   // last climb, landing on the mark

  vec3 P = boardPos;
  P = mix(P, pad, ra);
  P = mix(P, vec3(pad.x, jogY, pad.z), rb);
  P = mix(P, vec3(aLogo.x, jogY, aLogo.z), rc);
  P = mix(P, aLogo, rd);
  vec3 riserPos = P;

  vec3 pos = wFlow * flowPos + wTun * tunnelPos + base * riserPos;

  // a bright head running along each trace toward its pad — the only thing
  // moving while the board is still
  float travel = fract(aPcb.y - uTime * 0.32 + h);
  float trace = pow(1.0 - travel, 16.0) * (1.0 - ra);
  // pads sit lit the whole time
  float padGlow = aPcb.w * 0.5;
  float rising = (rb + rc) * (1.0 - rd);
  float pulse = max(trace, rising * 0.35) * base;
  float inLogo = rd;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float dist = max(0.001, -mv.z);

  // Fake DOF. Real lenses defocus much harder in FRONT of the focal plane than
  // behind it; a symmetric |dist - uFocus| made near particles read as fog
  // rather than as out-of-focus foreground.
  float dz = dist - uFocus;
  float blur = clamp(-min(dz, 0.0) * 0.09 + max(dz, 0.0) * 0.035, 0.0, 1.6);

  float size = (1.2 + aRand.y * 1.6) * (1.0 - wFlow * 0.42 + inLogo * 0.35 + pulse * 1.4 + padGlow);
  // CLAMPED. Unbounded, the 9.0/dist term blew points up into huge overdrawn
  // quads every time the camera passed through the vortex — the single biggest
  // cost on a 110k-vertex draw, and what made the field read as smoke.
  gl_PointSize = clamp(size * uPixelRatio * (9.0 / dist) * (1.0 + blur * 0.4), 0.6, 26.0);

  vec3 deep   = vec3(0.42, 0.20, 0.07);
  vec3 bright = vec3(1.0, 0.74, 0.40);
  vec3 white  = vec3(1.0, 0.92, 0.78);
  float shimmer = 0.5 + 0.5 * sin(uTime * 0.9 + aRand.x * 6.28318);
  float m = clamp(aRand.y * 0.65 + shimmer * 0.35, 0.0, 1.0);
  vColor = mix(deep, bright, m) * (0.8 + wTun * (0.15 + core * 0.5) + rising * 0.25 + padGlow);
  vColor = mix(vColor, white, pulse * 0.85);

  // the stream used to be the densest of the three states (0.3) — from inside
  // or beside it that is an opaque curtain, not a column of data
  float density = wFlow * 0.15 + wTun * 0.17 + base * 0.42;
  vAlpha = (0.5 + 0.5 * aRand.z) * density * (1.0 + pulse * 0.9);
  vAlpha *= smoothstep(0.8, 2.6, dist);
  // inside the elevator the camera is IN the cloud, so the near wall used to
  // fill the frame edge to edge. Clear the near field while the stream is up:
  // the column reads as a column, and the copy over it stays legible.
  vAlpha *= mix(1.0, smoothstep(1.2, 6.5, dist), wTun);
  // a defocused point spreads its light over a bigger disc, so it must get
  // dimmer faster than it grows — otherwise near particles read as blobs
  vAlpha /= (1.0 + blur * blur * 3.2);
  // the vortex thins out as it rises into the sky (fading the amount)
  float skyFade = 1.0 - smoothstep(9.0, 15.5, pos.y);
  vAlpha *= mix(1.0, skyFade, wFlow);
}
`
  .replace(/ACTS_DEFINES/, ACTS_GLSL)
  .replace(/TOWER_X_C/g, ELEVATOR.pos.x.toFixed(2))
  .replace(/TOWER_Z_C/g, ELEVATOR.pos.z.toFixed(2))

const fragmentShader = /* glsl */ `
varying float vAlpha;
varying vec3 vColor;

void main() {
  float d = length(gl_PointCoord - 0.5);
  // a soft halo plus a sharp centre: the core is what bloom latches onto, and
  // what makes these read as points of light rather than flat discs of fog
  float halo = smoothstep(0.5, 0.08, d);
  float core = pow(max(0.0, 1.0 - d * 2.6), 6.0);
  float a = (halo * 0.62 + core * 0.85) * vAlpha;
  if (a < 0.003) discard;
  gl_FragColor = vec4(vColor * (1.0 + core * 0.45), a);
}
`

export default function ParticleEngine() {
  const dpr = useThree((s) => s.viewport.dpr)

  const pcb = useMemo(() => bakePcbTexture(), [])

  const geometry = useMemo(() => {
    const random = createRandom(987654)
    const geo = new THREE.BufferGeometry()

    const position = new Float32Array(COUNT * 3)
    const rand = new Float32Array(COUNT * 4)
    const flow = new Float32Array(COUNT * 3)
    const pcbAttr = new Float32Array(COUNT * 4)
    const logo = new Float32Array(COUNT * 3)

    for (let i = 0; i < COUNT; i++) {
      rand[i * 4] = random()
      rand[i * 4 + 1] = random()
      rand[i * 4 + 2] = random()
      rand[i * 4 + 3] = random()

      flow[i * 3] = random()
      flow[i * 3 + 1] = 0.6 + random() * 0.9
      flow[i * 3 + 2] = Math.floor(random() * CURVE_COUNT)

      // one routed point on one trace, held for the whole board act
      const ti = i % TRACE_COUNT
      pcbAttr[i * 4] = ti
      pcbAttr[i * 4 + 1] = random()
      pcbAttr[i * 4 + 2] = pcb.order[ti]
      pcbAttr[i * 4 + 3] = ti / TRACE_COUNT >= 0.82 ? 1 : 0 // pads / vias

      // placeholder until the logo SVG is sampled (async): a small halo
      const a = random() * Math.PI * 2
      logo[i * 3] = Math.cos(a) * 1.6
      logo[i * 3 + 1] = LOGO_CENTER_Y + Math.sin(a) * 1.6
      logo[i * 3 + 2] = (random() - 0.5) * 0.1
    }

    geo.setAttribute('position', new THREE.BufferAttribute(position, 3))
    geo.setAttribute('aRand', new THREE.BufferAttribute(rand, 4))
    geo.setAttribute('aFlow', new THREE.BufferAttribute(flow, 3))
    geo.setAttribute('aPcb', new THREE.BufferAttribute(pcbAttr, 4))
    geo.setAttribute('aLogo', new THREE.BufferAttribute(logo, 3))
    return geo
  }, [pcb])

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
        uPcbTex: { value: pcb.tex },
        uPcbCount: { value: TRACE_COUNT },
        uPcbSamples: { value: TRACE_SAMPLES },
      },
    })
  }, [pcb])

  // swap the halo placeholder for the sampled Growcast leaf mark (async)
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
      pcb.tex.dispose()
    }
  }, [geometry, material, pcb])

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
