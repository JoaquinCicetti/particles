import { EffectComposer, Bloom } from '@react-three/postprocessing'

export default function Effects() {
  return (
    <EffectComposer>
      <Bloom
        mipmapBlur
        intensity={1.3}
        luminanceThreshold={0.15}
        luminanceSmoothing={0.4}
      />
    </EffectComposer>
  )
}
