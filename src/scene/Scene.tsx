import ParticleEngine from './particles/ParticleEngine'
import Structures from './Structures'
import Network from './Network'
import CameraRig from './CameraRig'
import Effects from './Effects'

export default function Scene() {
  return (
    <>
      <color attach="background" args={['#050302']} />
      <fogExp2 attach="fog" args={['#050302', 0.042]} />
      <CameraRig />
      <Structures />
      <Network />
      <ParticleEngine />
      <Effects />
    </>
  )
}
