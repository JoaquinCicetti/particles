import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './scene/Scene'
import Overlay from './ui/Overlay'
import Loader from './ui/Loader'
import LangPicker from './ui/LangPicker'
import Solutions from './ui/Solutions'
import ContactDialog from './ui/ContactDialog'
import MenuSheet from './ui/MenuSheet'
import { isSectionId } from './ui/nav'
import { bindScroll } from './lib/scroll'

function App() {
  const [glReady, setGlReady] = useState(false)
  const [started, setStarted] = useState(false)
  const [contactOpen, setContactOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => bindScroll(track.current), [])

  // hold the page still until the intro reveal hands off
  useEffect(() => {
    document.body.style.overflow = started ? '' : 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [started])

  // deep link (/#silos): the loader pins the page to the top, so jump once
  // the reveal has started
  useEffect(() => {
    if (!started) return
    const id = location.hash.slice(1)
    if (!isSectionId(id)) return
    document.getElementById(id)?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, [started])

  const openContact = useCallback(() => setContactOpen(true), [])
  const closeContact = useCallback(() => setContactOpen(false), [])
  const openMenu = useCallback(() => setMenuOpen(true), [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])

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
      <Overlay onContact={openContact} onMenu={openMenu} />
      <LangPicker />
      <div className="scroll-track" ref={track} aria-hidden />
      <Solutions onContact={openContact} />
      <ContactDialog open={contactOpen} onClose={closeContact} />
      <MenuSheet open={menuOpen} onClose={closeMenu} />
      <Loader ready={glReady} onDone={() => setStarted(true)} />
    </div>
  )
}

export default App
