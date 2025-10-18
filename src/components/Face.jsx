import { useMemo } from 'react'
import { getMaterialInstance } from '../config/materials'
import { FACE_THICKNESS } from '../config/constants'
import * as THREE from 'three'

function Face({ config, complicationWindows }) {
  const material = useMemo(() => getMaterialInstance(config.material), [config.material])
  
  // Calculate window positions for all complication windows
  const faceGeometry = useMemo(() => {
    const faceThickness = FACE_THICKNESS
    
    if (!complicationWindows || complicationWindows.length === 0) {
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

    // Create holes for each complication window
    complicationWindows.forEach((window) => {
      const { vector, offset, type, radius, width, height } = window
      
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
      
      if (type === 'circle') {
        // Circular window
        const windowRadius = radius || 2.2
        windowHole.absarc(x, y, windowRadius, 0, Math.PI * 2, true)
      } else {
        // Rectangular window
        const windowWidth = width || 4
        const windowHeight = height || 3
        const halfWidth = windowWidth / 2
        const halfHeight = windowHeight / 2
        
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
  }, [complicationWindows])

  return (
    <mesh castShadow receiveShadow material={material}>
      <primitive object={faceGeometry} attach="geometry" />
    </mesh>
  )
}

export default Face