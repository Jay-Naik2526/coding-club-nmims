import { useRef, type RefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text3D, Center, MeshReflectorMaterial, Float, Environment, Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { DEPTS, type DeptId } from '@/lib/depts'

/** Scroll progress lives in a ref (0 = top, 1 = bottom), driven by Lenis. */
export type ScrollRef = RefObject<number>

const FONT = '/fonts/helvetiker_bold.typeface.json'

/** The hero centerpiece: a glossy, beveled, extruded code glyph "</>".
 *  Sweeps horizontally (left → right) and turns as the page scrolls. */
function Glyph({ activeDept, scroll }: { activeDept: DeptId; scroll: ScrollRef }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const groupRef = useRef<THREE.Group>(null)
  const target = new THREE.Color(DEPTS[activeDept].acc)

  useFrame(() => {
    if (matRef.current) {
      matRef.current.color.lerp(target, 0.08)
      matRef.current.emissive.lerp(target, 0.08)
    }
    if (groupRef.current) {
      const p = scroll.current ?? 0
      // travel from left (-3.4) to right (+3.4) across the full scroll
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, -3.4 + p * 6.8, 0.06)
      // and rotate as it crosses, for a sense of momentum
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, (p - 0.5) * 1.1, 0.06)
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.25} floatIntensity={0.6}>
      <group ref={groupRef}>
      <Center position={[0, 1.15, 0]}>
        <Text3D
          font={FONT}
          size={1.55}
          height={0.42}
          curveSegments={8}
          bevelEnabled
          bevelThickness={0.06}
          bevelSize={0.045}
          bevelSegments={6}
        >
          {'</>'}
          <meshStandardMaterial
            ref={matRef}
            metalness={0.85}
            roughness={0.18}
            emissiveIntensity={0.35}
          />
        </Text3D>
      </Center>
      </group>
    </Float>
  )
}

function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
      <planeGeometry args={[60, 60]} />
      <MeshReflectorMaterial
        blur={[300, 80]}
        resolution={1024}
        mixBlur={1}
        mixStrength={45}
        roughness={0.9}
        depthScale={1.1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.2}
        color="#0a0908"
        metalness={0.6}
        mirror={0}
      />
    </mesh>
  )
}

function Rig({ scroll }: { scroll: ScrollRef }) {
  useFrame((state) => {
    const p = scroll.current ?? 0
    const cam = state.camera
    // gentle journey: start framed on the glyph, pull up & back as you scroll
    const tx = state.pointer.x * 0.6
    const ty = 1.3 + p * 1.6 + state.pointer.y * 0.2
    const tz = 7 + p * 4
    cam.position.x = THREE.MathUtils.lerp(cam.position.x, tx, 0.05)
    cam.position.y = THREE.MathUtils.lerp(cam.position.y, ty, 0.05)
    cam.position.z = THREE.MathUtils.lerp(cam.position.z, tz, 0.05)
    cam.lookAt(0, 1 - p * 0.3, 0)
  })
  return null
}

export function LandingScene({
  scroll,
  activeDept,
  quality = 'high',
}: {
  scroll: ScrollRef
  activeDept: DeptId
  quality?: 'high' | 'low'
}) {
  const accent = DEPTS[activeDept].acc
  const high = quality === 'high'
  return (
    <Canvas
      camera={{ position: [0, 1.3, 7], fov: 45 }}
      dpr={high ? [1, 1.8] : 1}
      gl={{ antialias: high, alpha: false }}
    >
      <color attach="background" args={['#0b0a09']} />
      <fog attach="fog" args={['#0b0a09', 10, 26]} />

      <ambientLight intensity={0.25} />
      <spotLight position={[4, 8, 5]} angle={0.5} penumbra={0.8} intensity={180} color={accent} castShadow />
      <pointLight position={[-6, 2, -3]} intensity={50} color="#ffffff" />
      <pointLight position={[0, 1, 6]} intensity={30} color={accent} />

      <Glyph activeDept={activeDept} scroll={scroll} />
      <Floor />
      <Stars radius={40} depth={30} count={high ? 1600 : 500} factor={3} fade speed={0.6} />

      {high && <Environment preset="night" />}
      {high && (
        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={0.9} mipmapBlur />
        </EffectComposer>
      )}

      <Rig scroll={scroll} />
    </Canvas>
  )
}
