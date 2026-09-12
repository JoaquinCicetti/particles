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
      {/* 0.18 was low enough that the whole field bloomed and the scene washed
          out — only the hot cores should glow now, so the threshold goes up and
          the intensity with it to keep the highlights from going flat */}
      <Bloom mipmapBlur intensity={1.05} luminanceThreshold={0.32} luminanceSmoothing={0.3} />
      <Noise premultiply opacity={0.42} />
      <Vignette offset={0.22} darkness={0.82} />
    </EffectComposer>
  )
}
