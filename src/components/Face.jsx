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
      const { vector, offset, windowShape, windowRadius, windowWidth, windowHeight } = complication
      
      // Convert vector (0-12) to angle
      // vector=0 or 12 -> 0 rad (top), vector=3 -> π/2 rad (right), etc.
      const hourValue = vector !== undefined ? vector : 3
      const angle = ((hourValue === 12 || hourValue === 0) ? 0 : hourValue) * Math.PI / 6
      const distance = offset || 15

      // Calculate x, y coordinates for the window (in XY plane)
      const x = Math.sin(angle) * distance
      const y = Math.cos(angle) * distance

      // Create a hole for the complication window
      const windowHole = new THREE.Path()
      
      if (windowShape === 'circle') {
        // Circular window
        const radius = windowRadius || 2.2
        windowHole.absarc(x, y, radius, 0, Math.PI * 2, true)
      } else {
        // Rectangular window
        const width = windowWidth || 4
        const height = windowHeight || 3
        const halfWidth = width / 2
        const halfHeight = height / 2
        
        windowHole.moveTo(x - halfWidth, y - halfHeight)
        windowHole.lineTo(x + halfWidth, y - halfHeight)
        windowHole.lineTo(x + halfWidth, y + halfHeight)
        windowHole.lineTo(x - halfWidth, y + halfHeight)
        windowHole.lineTo(x - halfWidth, y - halfHeight)
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
        emissive={material.emissive || '#000000'}
        emissiveIntensity={material.emissiveIntensity || 0}
        toneMapped={false}
      />
    </mesh>
  )
}

export default Face