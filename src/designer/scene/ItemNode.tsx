import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useThree, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { ITEM_SPECS } from '../model/catalog'
import { bodyHeight, footprint, snap } from '../model/geometry'
import type { Item, Room } from '../model/schema'
import { useDesigner } from '../store'
import { EDGE, LINE, MAT, PLANE_GEO, noRaycast, type Tone } from './materials'
import ItemModel from './models'
import { Lines } from './parts'

const UP = new THREE.Vector3(0, 1, 0)
const HIT = new THREE.Vector3()

type Drag = { plane: THREE.Plane; ox: number; oz: number; moved: boolean }

/**
 * One placed item: its model plus selection chrome, draggable on a
 * horizontal plane at the grab height (snapped to 0.1 m, clamped by the store).
 */
function ItemNode({ item, room }: { item: Item; room: Room }) {
  const selected = useDesigner((s) => s.selectedId === item.id)
  const [hover, setHover] = useState(false)
  const controls = useThree((s) => s.controls) as unknown as { enabled: boolean } | null
  const gl = useThree((s) => s.gl)
  const drag = useRef<Drag | null>(null)

  const tone: Tone = selected ? 'selected' : hover ? 'hover' : 'idle'
  const mounted = ITEM_SPECS[item.type].mount === 'mounted'
  const baseY = mounted ? (item.y ?? 0) : 0
  const { w, d } = footprint(item)

  const cursor = (c: string) => {
    gl.domElement.style.cursor = c
  }
  useEffect(() => () => void (gl.domElement.style.cursor = ''), [gl])

  const onDown = (e: ThreeEvent<PointerEvent>) => {
    if (e.button !== 0) return
    e.stopPropagation()
    useDesigner.getState().select(item.id)
    const plane = new THREE.Plane(UP, -e.point.y)
    const hit = e.ray.intersectPlane(plane, HIT)
    if (!hit) return
    drag.current = { plane, ox: item.x - hit.x, oz: item.z - hit.z, moved: false }
    if (controls) controls.enabled = false
    ;(e.target as unknown as Element).setPointerCapture(e.pointerId)
    cursor('grabbing')
  }

  const onMove = (e: ThreeEvent<PointerEvent>) => {
    const g = drag.current
    if (!g) return
    e.stopPropagation()
    const hit = e.ray.intersectPlane(g.plane, HIT)
    if (!hit) return
    const x = snap(hit.x + g.ox)
    const z = snap(hit.z + g.oz)
    if (x === item.x && z === item.z) return
    const s = useDesigner.getState()
    if (!g.moved) {
      s.checkpoint()
      g.moved = true
    }
    s.updateItem(item.id, { x, z }, false)
  }

  const end = (e: ThreeEvent<PointerEvent>) => {
    if (!drag.current) return
    drag.current = null
    if (controls) controls.enabled = true
    ;(e.target as unknown as Element).releasePointerCapture?.(e.pointerId)
    cursor(hover ? 'grab' : '')
  }

  return (
    <>
      <group
        position={[item.x, baseY, item.z]}
        rotation-y={(-item.rotation * Math.PI) / 2}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={end}
        onPointerCancel={end}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHover(true)
          if (!drag.current) cursor('grab')
        }}
        onPointerOut={() => {
          setHover(false)
          if (!drag.current) cursor('')
        }}
      >
        <ItemModel item={item} room={room} tone={tone} />
      </group>
      <Footprint x={item.x} z={item.z} w={w} d={d} y={baseY} mounted={mounted} selected={selected} />
      {selected && (
        <Html
          position={[item.x, baseY + bodyHeight(item, room) + 0.18, item.z]}
          center
          zIndexRange={[4, 0]}
          pointerEvents="none"
          className="dz-chip3d"
        >
          {w.toFixed(2)} × {d.toFixed(2)} m{mounted ? ` · ↑ ${baseY.toFixed(2)} m` : ''}
        </Html>
      )}
    </>
  )
}

/** Floor outline (selected), plus a plumb line for hung items. */
function Footprint({
  x,
  z,
  w,
  d,
  y,
  mounted,
  selected,
}: {
  x: number
  z: number
  w: number
  d: number
  y: number
  mounted: boolean
  selected: boolean
}) {
  const pts = useMemo(() => {
    const hx = w / 2
    const hz = d / 2
    const e = 0.004
    const p = [-hx, e, -hz, hx, e, -hz, hx, e, -hz, hx, e, hz, hx, e, hz, -hx, e, hz, -hx, e, hz, -hx, e, -hz]
    if (mounted && y > 0.05) p.push(0, e, 0, 0, y, 0)
    return p
  }, [w, d, y, mounted])
  if (!selected && !mounted) return null
  return (
    <group position={[x, 0, z]}>
      <Lines points={pts} material={selected ? EDGE.selected : LINE.dim} />
      {selected && (
        <mesh
          geometry={PLANE_GEO}
          material={MAT.footprint}
          rotation-x={-Math.PI / 2}
          position-y={0.003}
          scale={[w, d, 1]}
          raycast={noRaycast}
        />
      )}
    </group>
  )
}

export default memo(ItemNode)
