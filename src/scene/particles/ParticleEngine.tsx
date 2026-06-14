import { useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { bakeCurveTexture, CURVE_COUNT, CURVE_SAMPLES, ELEVATOR } from './curves'
import { sampleSvgPoints } from './svgSampler'
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

/**
 * Final act follows one idea: the data converges into Growcast. Once particles
 * are sorted into the structured 3D rows, they gather onto vertical circuit
 * "lanes", flow UP through those PCB-style paths, and converge into the logo —
 * an ordered, staggered left→right sweep, never a disordered cloud.
 */
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

  // ── act 3: structured 3D rows (crisp, gently alive) ──
  float breathe = 0.04 * sin(uTime * 1.1 + aGrid.x * 0.7);
  vec3 gridPos = vec3(aGrid.x, 0.45 + aGrid.y * 3.0 + breathe, aGrid.z);

  // ── act 4: the brand mark (raised, the destination) ──
  vec3 logoPos = aLogo;

  // ── riser: the parallel planes flow into VERTICAL PCB paths (vertical
  //    copper traces with right-angle jogs) that climb and end on the logo.
  //    No wide stratified grid — just vertical routing converging to the mark. ──
  float laneStep = 0.9;
  float laneX = floor(aGrid.x / laneStep + 0.5) * laneStep;
  float panelZ = 0.0;
  // per-lane PCB character: a right-angle jog at a pseudo-random height, and a
  // sideways step that nudges the trace toward the logo column
  float laneHash = fract(sin(laneX * 12.9898) * 43758.5453);
  float jogY = 3.4 + laneHash * 3.2;                 // where this trace jogs
  float jogX = mix(laneX, aLogo.x, 0.45 + laneHash * 0.2); // step toward the logo

  float order = clamp((aGrid.x + 8.0) / 16.0, 0.0, 1.0); // left→right sweep
  float rstart = 0.58 + order * 0.08;
  float rp = smoothstep(rstart, rstart + 0.24, pp);
  float la = smoothstep(0.00, 0.22, rp);  // planes purge onto vertical lanes
  float lb = smoothstep(0.18, 0.46, rp);  // climb the vertical trace
  float lc = smoothstep(0.42, 0.58, rp);  // right-angle jog toward the logo
  float ld = smoothstep(0.54, 1.0, rp);   // climb on, ending on the logo

  vec3 P = gridPos;
  P = mix(P, vec3(laneX, gridPos.y, panelZ), la);
  P = mix(P, vec3(laneX, jogY, panelZ), lb);
  P = mix(P, vec3(jogX, jogY, panelZ), lc);
  P = mix(P, aLogo, ld);
  vec3 riserPos = P;

  vec3 pos = wFlow * flowPos + wTun * tunnelPos + base * riserPos;

  // bright signal pulse travelling up the vertical traces
  float rising = (lb + lc) * (1.0 - ld);
  float pulse = pow(0.5 + 0.5 * sin(P.y * 1.6 - uTime * 2.4 + laneX), 8.0) * rising;
  float inLogo = ld;

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;
  float dist = max(0.001, -mv.z);

  float blur = clamp(abs(dist - uFocus) * 0.07, 0.0, 1.6);

  float size = (1.2 + aRand.y * 1.6) * (1.0 - wFlow * 0.42 + inLogo * 0.35 + pulse * 1.4);
  gl_PointSize = size * uPixelRatio * (9.0 / dist) * (1.0 + blur * 0.8);

  vec3 deep   = vec3(0.42, 0.20, 0.07);
  vec3 bright = vec3(1.0, 0.74, 0.40);
  vec3 white  = vec3(1.0, 0.92, 0.78);
  float shimmer = 0.5 + 0.5 * sin(uTime * 0.9 + aRand.x * 6.28318);
  float m = clamp(aRand.y * 0.65 + shimmer * 0.35, 0.0, 1.0);
  vColor = mix(deep, bright, m) * (0.8 + wTun * (0.15 + core * 0.5) + rising * 0.25);
  vColor = mix(vColor, white, pulse * 0.85);

  float density = wFlow * 0.15 + wTun * 0.3 + base * 0.42;
  vAlpha = (0.5 + 0.5 * aRand.z) * density * (1.0 + pulse * 0.9);
  vAlpha *= smoothstep(0.8, 2.6, dist);
  vAlpha /= (1.0 + blur * blur * 1.6);
  // the vortex thins out as it rises into the sky (fading the amount)
  float skyFade = 1.0 - smoothstep(9.0, 15.5, pos.y);
  vAlpha *= mix(1.0, skyFade, wFlow);
}
`
  .replace(/LOGO_CENTER_Y_C/g, LOGO_CENTER_Y.toFixed(2))
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
      },
    })
  }, [])

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
