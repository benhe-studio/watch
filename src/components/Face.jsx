import { useMemo } from 'react'
import { getMaterialInstance } from '../config/helpers/materials'
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
      const { position, type, radius, width, height } = window
      
      // Extract position values
      const vector = position?.vector !== undefined ? position.vector : 6
      const offset = position?.offset !== undefined ? position.offset : 10
      
      // Convert vector (0-12) to angle
      // vector=0 or 12 -> 0 rad (top), vector=3 -> π/2 rad (right), etc.
      const hourValue = vector
      const angle = ((hourValue === 12 || hourValue === 0) ? 0 : hourValue) * Math.PI / 6
      const distance = offset

      // Calculate x, y coordinates for the window (in XY plane)
      const x = Math.sin(angle) * distance
      const y = Math.cos(angle) * distance

      // Create a hole for the complication window
      if (type === 'circle') {
        // Circular window
        const windowRadius = radius || 2.2
        const windowHole = new THREE.Path()
        windowHole.absarc(x, y, windowRadius, 0, Math.PI * 2, true)
        circleShape.holes.push(windowHole)
      } else if (type === 'moonphase') {
        // Moon phase window - using arc + five bezier curves approach
        // Added transitional bezier curves to smooth the corners
        const R = radius || 2.2
        
        const moonHole = new THREE.Path()
        
        // Start at (-R, 0) relative to center (x, y)
        moonHole.moveTo(x - R, y)
        
        // Arc from -R to R on the X axis (bottom semicircle)
        // This creates an arc centered at (x, y) from angle π to 0 (going downward)
        moonHole.absarc(x, y, R, Math.PI, 0, true)
        
        // Now we're at (x + R, y)
        // Five bezier curves to create the top shape with smooth transitions
        
        // First transitional bezier curve: from (R, 0) to (R*0.7, 0) curving inward
        // This curves in the opposite direction to smooth the transition from the arc
        const trans1_cp1x = x + R
        const trans1_cp1y = y - R * 0.04
        const trans1_cp2x = x + R * 0.97
        const trans1_cp2y = y - R * 0.04
        const trans1_endx = x + R * 0.95
        const trans1_endy = y
        moonHole.bezierCurveTo(trans1_cp1x, trans1_cp1y, trans1_cp2x, trans1_cp2y, trans1_endx, trans1_endy)
        
        // Second bezier curve: from (R*0.7, 0) to (R/5, R/8)
        const cp1x = x + R * 0.82
        const cp1y = y + R * 0.4
        const cp2x = x + R / 2.4
        const cp2y = y + R * 0.5
        const end1x = x + R / 6
        const end1y = y + R/8
        moonHole.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, end1x, end1y)
        
        // Third bezier curve: from (R/5, R/8) to (-R/5, R/8) (center top)
        const cp3x = x + R / 8
        const cp3y = y + R * 0.3
        const cp4x = x - R / 8
        const cp4y = y + R * 0.3
        const end2x = x - R / 6
        const end2y = y + R/8
        moonHole.bezierCurveTo(cp3x, cp3y, cp4x, cp4y, end2x, end2y)
        
        // Fourth bezier curve: from (-R/5, R/8) to (-R*0.7, 0)
        const cp5x = x - R / 2.4
        const cp5y = y + R * 0.5
        const cp6x = x - R * 0.82
        const cp6y = y + R * 0.4
        const end3x = x - R * 0.95
        const end3y = y
        moonHole.bezierCurveTo(cp5x, cp5y, cp6x, cp6y, end3x, end3y)
        
        // Fifth transitional bezier curve: from (-R*0.7, 0) back to (-R, 0)
        // This curves in the opposite direction to smooth the transition back to the arc
        const trans2_cp1x = x - R * 0.97
        const trans2_cp1y = y - R * 0.04
        const trans2_cp2x = x - R
        const trans2_cp2y = y - R * 0.04
        const trans2_endx = x - R
        const trans2_endy = y
        moonHole.bezierCurveTo(trans2_cp1x, trans2_cp1y, trans2_cp2x, trans2_cp2y, trans2_endx, trans2_endy)
        
        circleShape.holes.push(moonHole)
      } else {
        // Rectangular window
        const windowWidth = width || 4
        const windowHeight = height || 3
        const halfWidth = windowWidth / 2
        const halfHeight = windowHeight / 2
        
        const windowHole = new THREE.Path()
        windowHole.moveTo(x - halfWidth, y - halfHeight)
        windowHole.lineTo(x + halfWidth, y - halfHeight)
        windowHole.lineTo(x + halfWidth, y + halfHeight)
        windowHole.lineTo(x - halfWidth, y + halfHeight)
        windowHole.lineTo(x - halfWidth, y - halfHeight)
        circleShape.holes.push(windowHole)
      }
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