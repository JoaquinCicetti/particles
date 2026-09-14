import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing'

/**
 * Bloom carries the holographic glow; vignette + noise add the cinematic
 * finish. True DepthOfField is intentionally omitted — additive particles
 * don't write depth, so the particle shader fakes bokeh instead (size and
 * alpha scale with distance from the camera's focus plane).
 */
export default function Effects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={0.6} luminanceThreshold={0.45} luminanceSmoothing={0.2} />
      <Noise premultiply opacity={0.35} />
      <Vignette offset={0.3} darkness={0.6} />
    </EffectComposer>
  )
}
