import ParticleEngine from './particles/ParticleEngine'
import Structures from './Structures'
import Network from './Network'
import CameraRig from './CameraRig'
import Effects from './Effects'

export default function Scene({ started }: { started: boolean }) {
  return (
    <>
      <color attach="background" args={['#1c1c20']} />
      <fogExp2 attach="fog" args={['#121216', 0.024]} />
      <CameraRig started={started} />
      <Structures />
      <Network />
      <ParticleEngine />
      <Effects />
    </>
  )
}
