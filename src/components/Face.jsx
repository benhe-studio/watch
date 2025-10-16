import { useMemo } from 'react'
import { getMaterial } from '../config/materials'
import { FACE_THICKNESS } from '../config/constants'
import * as THREE from 'three'

function Face({ config, complications }) {
  const material = getMaterial(config.material)
  
  // Calculate window positions for all complications
  const faceGeometry = useMemo(() => {
    const faceThickness = FACE_THICKNESS
    
    if (!complications || complications.length === 0) {
      // No complications - return simple cylinder
      return new THREE.CylinderGeometry(20, 20, faceThickness, 128)
    }
    
    // Create a shape for the main circle
    const circleShape = new THREE.Shape()
    circleShape.absarc(0, 0, 20, 0, Math.PI * 2, false)

    // Create holes for each complication
    complications.forEach((complication) => {
      const { position, distance, windowShape, windowRadius, windowWidth, windowHeight } = complication
      const angle = {
        12: 0,
        3: Math.PI / 2,
        6: Math.PI,
        9: (3 * Math.PI) / 2
      }[position] || 0

      // Calculate x, z coordinates for the window
      const x = Math.sin(angle) * distance
      const z = -Math.cos(angle) * distance

      // Create a hole for the complication window
      const windowHole = new THREE.Path()
      
      if (windowShape === 'circle') {
        // Circular window
        const radius = windowRadius || 2.2
        windowHole.absarc(x, z, radius, 0, Math.PI * 2, true)
      } else {
        // Rectangular window
        const width = windowWidth || 4
        const height = windowHeight || 3
        const halfWidth = width / 2
        const halfHeight = height / 2
        
        windowHole.moveTo(x - halfWidth, z - halfHeight)
        windowHole.lineTo(x + halfWidth, z - halfHeight)
        windowHole.lineTo(x + halfWidth, z + halfHeight)
        windowHole.lineTo(x - halfWidth, z + halfHeight)
        windowHole.lineTo(x - halfWidth, z - halfHeight)
      }
      
      circleShape.holes.push(windowHole)
    })

    // Extrude the shape to create thickness
    const extrudeSettings = {
      depth: faceThickness,
      bevelEnabled: false,
      curveSegments: 128
    }
    
    const geometry = new THREE.ExtrudeGeometry(circleShape, extrudeSettings)
    
    // Rotate geometry to align properly (extrude goes along Z, we want it along Y)
    geometry.rotateX(Math.PI / 2)
    // After rotation, translate along Y to center the thickness
    geometry.translate(0, faceThickness / 2, 0)
    
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