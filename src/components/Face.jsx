import { getMaterial } from '../config/materials'

function Face({ config }) {
  const material = getMaterial(config.material)
  
  return (
    <group>
      {/* Watch face base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2, 128]} />
        <meshPhysicalMaterial
          color={material.color}
          roughness={material.roughness}
          metalness={material.metalness}
          clearcoat={material.clearcoat || 0}
          clearcoatRoughness={material.clearcoatRoughness || 0}
          reflectivity={material.reflectivity || 0.5}
          ior={material.ior || 1.5}
        />
      </mesh>
      
      {/* North indicator - small sphere at 12 o'clock position */}
      <mesh position={[0, 0.1, -2.3]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
    </group>
  )
}

export default Face