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
      const geometry = new THREE.CylinderGeometry(20, 20, faceThickness, 128)
      // Rotate to align with XY plane (cylinder is along Y by default, we want it along Z)
      geometry.rotateX(Math.PI / 2)
      // Translate so top is at z=0
      geometry.translate(0, 0, -faceThickness / 2)
      return geometry
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

    // Extrude the shape to create thickness (extrudes along Z-axis)
    const extrudeSettings = {
      depth: faceThickness,
      bevelEnabled: false,
      curveSegments: 128
    }
    
    const geometry = new THREE.ExtrudeGeometry(circleShape, extrudeSettings)
    
    // Translate so top of face is at z=0, extends down to z=-faceThickness
    geometry.translate(0, 0, -faceThickness)
    
    return geometry
  }, [complications])

  return (
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
  )
}

export default Face