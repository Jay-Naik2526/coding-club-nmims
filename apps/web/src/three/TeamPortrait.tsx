import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Image, Float } from '@react-three/drei'
import * as THREE from 'three'

/**
 * A 3-photo fan for co-heads — arranged in a shallow horizontal arc.
 */
function CoHeadFan({ photos, accent }: { photos: string[]; accent: string }) {
  const group = useRef<THREE.Group>(null)
  const n = photos.length
  const spread = 0.52

  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      state.pointer.x * 0.18,
      0.06
    )
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      state.pointer.y * 0.1,
      0.06
    )
  })

  return (
    <group ref={group}>
      {photos.map((url, i) => {
        const angle = (i - (n - 1) / 2) * spread
        const radius = 3.6
        const x = Math.sin(angle) * radius
        const z = Math.cos(angle) * radius - radius
        return (
          <Float key={url} speed={1.2} rotationIntensity={0.04} floatIntensity={0.15}>
            <Image
              url={url}
              position={[x, 0, z]}
              rotation={[0, angle, 0]}
              scale={[2.2, 2.9]}
              transparent
              radius={0.08}
              side={THREE.DoubleSide}
              toneMapped={false}
            />
          </Float>
        )
      })}
      <mesh position={[0, 0, -3.8]}>
        <planeGeometry args={[18, 7]} />
        <meshBasicMaterial color={accent} transparent opacity={0.05} />
      </mesh>
    </group>
  )
}

/** Single centred portrait for the main head. */
function SinglePortrait({ url }: { url: string; accent: string }) {
  return (
    <Float speed={1.2} rotationIntensity={0.04} floatIntensity={0.15}>
      {/* Main photo card with rounded corners, completely borderless & clean */}
      <Image
        url={url}
        position={[0, 0, 0]}
        scale={[2.6, 3.4]}
        transparent
        radius={0.08}
        toneMapped={false}
      />
    </Float>
  )
}

export function HeadPortrait({ url, accent }: { url: string; accent: string }) {
  return (
    <Canvas camera={{ position: [0, 0, 5.5], fov: 38 }} dpr={[1, 1.8]} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={1.2} />
      <Suspense fallback={null}>
        <SinglePortrait url={url} accent={accent} />
      </Suspense>
    </Canvas>
  )
}

export function CoHeadCanvas({ photos, accent }: { photos: string[]; accent: string }) {
  return (
    <Canvas camera={{ position: [0, 0.2, 7.5], fov: 44 }} dpr={[1, 1.8]} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={1.2} />
      <Suspense fallback={null}>
        <CoHeadFan photos={photos} accent={accent} />
      </Suspense>
    </Canvas>
  )
}
