import { useMemo } from 'react'
import { getMaterial } from '../config/materials'
import * as THREE from 'three'

function Face({ config, complications }) {
  const material = getMaterial(config.material)
  
  // Calculate window positions for all complications
  const faceGeometry = useMemo(() => {
    const faceThickness = 1
    
    if (!complications || complications.length === 0) {
      // No complications - return simple cylinder
      return new THREE.CylinderGeometry(20, 20, faceThickness, 128)
    }
    
    // Create a shape for the main circle
    const circleShape = new THREE.Shape()
    circleShape.absarc(0, 0, 20, 0, Math.PI * 2, false)

    // Create holes for each complication
    complications.forEach((complication) => {
      const { position, distance } = complication
      const angle = {
        12: 0,
        3: Math.PI / 2,
        6: Math.PI,
        9: (3 * Math.PI) / 2
      }[position] || 0

      // Calculate x, z coordinates for the window
      const x = Math.sin(angle) * distance
      const z = -Math.cos(angle) * distance

      // Create a hole for the date window
      const windowHole = new THREE.Path()
      windowHole.absarc(x, z, 2.2, 0, Math.PI * 2, true)
      circleShape.holes.push(windowHole)
    })

    // Extrude the shape to create thickness
    const extrudeSettings = {
      depth: faceThickness,
      bevelEnabled: false
    }
    
    const geometry = new THREE.ExtrudeGeometry(circleShape, extrudeSettings)
    
    // Rotate geometry to align properly (extrude goes along Z, we want it along Y)
    geometry.rotateX(Math.PI / 2)
    geometry.translate(0, 0, -faceThickness / 2)
    
    return geometry
  }, [complications])

  return (
    <group>
      {/* Watch face base with optional window cutout */}
      <mesh castShadow receiveShadow>
        <primitive object={faceGeometry} attach="geometry" />
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
      <mesh position={[0, 1, -23]} castShadow receiveShadow>
        <sphereGeometry args={[0.8, 16, 16]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      
    </group>
  )
}

export default Face