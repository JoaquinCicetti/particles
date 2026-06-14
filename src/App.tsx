import { useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './scene/Scene'
import Overlay from './ui/Overlay'
import Loader from './ui/Loader'
import LangPicker from './ui/LangPicker'
import { bindScroll } from './lib/scroll'

function App() {
  const [glReady, setGlReady] = useState(false)
  const [started, setStarted] = useState(false)

  useEffect(() => bindScroll(), [])

  // hold the page still until the intro reveal hands off
  useEffect(() => {
    document.body.style.overflow = started ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [started])

  return (
    <div className={`app${started ? ' is-started' : ''}`}>
      <div className="canvas-layer">
        <Canvas
          camera={{ position: [0, 4.8, 23], fov: 50, near: 0.1, far: 90 }}
          dpr={[1, 1.75]}
          gl={{ antialias: false, powerPreference: 'high-performance' }}
          onCreated={() => setGlReady(true)}
        >
          <Scene started={started} />
        </Canvas>
      </div>
      <Overlay />
      <LangPicker />
      <div className="scroll-track" aria-hidden />
      <Loader ready={glReady} onDone={() => setStarted(true)} />
    </div>
  )
}

export default App
