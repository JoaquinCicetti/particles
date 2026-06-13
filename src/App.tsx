import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './scene/Scene'
import Overlay from './ui/Overlay'
import { bindScroll } from './lib/scroll'

function App() {
  useEffect(() => bindScroll(), [])

  return (
    <div className="app">
      <div className="canvas-layer">
        <Canvas
          camera={{ position: [0, 4.8, 23], fov: 50, near: 0.1, far: 90 }}
          dpr={[1, 1.75]}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
        >
          <Scene />
        </Canvas>
      </div>
      <Overlay />
      <div className="scroll-track" aria-hidden />
    </div>
  )
}

export default App
