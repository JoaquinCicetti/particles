import ParticleField from './particles/ParticleField'
import Effects from './Effects'

export default function Scene() {
  return (
    <>
      <color attach="background" args={['#04060a']} />
      <fog attach="fog" args={['#04060a', 8, 22]} />
      <ParticleField />
      <Effects />
    </>
  )
}
