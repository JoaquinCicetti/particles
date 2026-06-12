import { Canvas } from '@react-three/fiber'
import Scene from './scene/Scene'
import Overlay from './ui/Overlay'

function App() {
  return (
    <div className="app">
      <div className="canvas-layer">
        <Canvas camera={{ position: [0, 2.5, 9], fov: 50 }} dpr={[1, 2]}>
          <Scene />
        </Canvas>
      </div>
      <Overlay />
    </div>
  )
}

export default App
