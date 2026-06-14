import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './scene/Scene'
import Overlay from './ui/Overlay'
import { bindScroll, scrollState } from './lib/scroll'

function App() {
  const [freeCam, setFreeCam] = useState(false)

  useEffect(() => bindScroll(), [])
  useEffect(() => {
    scrollState.freeCam = freeCam
  }, [freeCam])

  return (
    <div className="app">
      <div className="canvas-layer">
        <Canvas
          camera={{ position: [0, 4.8, 23], fov: 50, near: 0.1, far: 90 }}
          dpr={[1, 1.75]}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
        >
          <Scene freeCam={freeCam} />
        </Canvas>
      </div>
      <Overlay freeCam={freeCam} onToggleFreeCam={() => setFreeCam((v) => !v)} />
      <div className="scroll-track" aria-hidden />
    </div>
  )
}

export default App
