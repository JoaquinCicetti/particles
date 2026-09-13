import { Canvas } from '@react-three/fiber'
import { useActiveDesign, useDesigner } from '../store'
import CameraRig from './CameraRig'
import ItemNode from './ItemNode'
import RoomShell from './RoomShell'

/** 3D view — renders on demand only (no idle GPU work), no postprocessing. */
export default function DesignerCanvas() {
  const design = useActiveDesign()
  const select = useDesigner((s) => s.select)
  const { room } = design
  const span = Math.max(room.width, room.length)

  return (
    <Canvas
      frameloop="demand"
      dpr={[1, 2]}
      camera={{ fov: 40, near: 0.05, far: 3000, position: [6, 6, 8] }}
      gl={{ antialias: true }}
      onPointerMissed={(e) => {
        if (e.button === 0) select(null)
      }}
    >
      <color attach="background" args={['#17171b']} />
      <fog attach="fog" args={['#17171b', span * 3, span * 9]} />
      <hemisphereLight args={['#f2f2f4', '#212126', 1.2]} />
      <directionalLight position={[4, 10, 6]} intensity={1.5} color="#f7f8f2" />
      <directionalLight position={[-6, 4, -5]} intensity={0.45} color="#cad86e" />
      <RoomShell room={room} />
      {design.items.map((it) => (
        <ItemNode key={it.id} item={it} room={room} />
      ))}
      <CameraRig room={room} />
    </Canvas>
  )
}
