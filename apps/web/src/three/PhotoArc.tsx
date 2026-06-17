import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Image } from '@react-three/drei'
import * as THREE from 'three'

/** Photos arranged on a shallow 3D arc, gently auto-rotating with pointer parallax. */
function Arc({ photos, accent }: { photos: string[]; accent: string }) {
  const group = useRef<THREE.Group>(null)
  const n = photos.length
  const radius = 4.2
  const spread = 0.42 // radians between photos

  useFrame((state, dt) => {
    if (!group.current) return
    group.current.rotation.y += dt * 0.12
    // subtle tilt toward pointer
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, state.pointer.y * 0.15, 0.05)
  })

  return (
    <group ref={group}>
      {photos.map((url, i) => {
        const angle = (i - (n - 1) / 2) * spread
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius - radius
        return (
          <Image
            key={url}
            url={url}
            position={[x, 0, z]}
            rotation={[0, angle, 0]}
            scale={[2.7, 1.8]}
            transparent
            radius={0.06}
            side={THREE.DoubleSide}
          >
            {/* subtle accent border via slightly larger backing plane */}
          </Image>
        )
      })}
      {/* accent glow plane behind */}
      <mesh position={[0, 0, -radius - 0.4]}>
        <planeGeometry args={[14, 6]} />
        <meshBasicMaterial color={accent} transparent opacity={0.06} />
      </mesh>
    </group>
  )
}

export function PhotoArc({ photos, accent }: { photos: string[]; accent: string }) {
  return (
    <Canvas camera={{ position: [0, 0.4, 6.2], fov: 42 }} dpr={[1, 1.8]} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={1.1} />
      <Suspense fallback={null}>
        <Arc photos={photos} accent={accent} />
      </Suspense>
    </Canvas>
  )
}
