import { useMemo } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { getMaterialInstance } from '../config/helpers/materials'

// Helper function to create beveled cylinder geometry
function createBeveledCylinder(radius, height) {
  const shape = new THREE.Shape()
  shape.absarc(0, 0, radius, 0, Math.PI * 2, false)
  
  const extrudeSettings = {
    depth: height,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.02,
    bevelSegments: 2,
    curveSegments: 16
  }
  
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  // Center on Z-axis
  geometry.translate(0, 0, -height / 2)
  
  return geometry
}

// Helper function to create hand geometry
function createHandGeometry(points) {
  // Default points if none provided - creates a simple tapered hand
  const defaultPoints = [
    [0.3, -2],   // Tail end (below pivot)
    [0.5, 0],    // Widen at pivot point
    [0.3, 14],   // Taper towards tip
    [0, 18]      // End at tip
  ]
  
  const shapePoints = points || defaultPoints
  
  // Create the shape by mirroring points across the center line
  const shape = new THREE.Shape()
  
  // Start at the first point
  shape.moveTo(shapePoints[0][0], shapePoints[0][1])
  
  // Draw the right side (positive x, positive y)
  for (let i = 1; i < shapePoints.length; i++) {
    shape.lineTo(shapePoints[i][0], shapePoints[i][1])
  }
  
  // Mirror back down the left side (negative x), including the last point
  for (let i = shapePoints.length - 1; i >= 0; i--) {
    shape.lineTo(-shapePoints[i][0], shapePoints[i][1])
  }
  
  // Extrude settings for depth (fixed at 0.1, with small bevel)
  const depth = 0.1
  const extrudeSettings = {
    depth: depth,
    bevelEnabled: true,
    bevelThickness: 0.1,
    bevelSize: 0.1,
    bevelSegments: 8
  }
  
  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  
  // Center the geometry on the z-axis (depth axis)
  geometry.translate(0, 0, -depth / 2)
  
  // No rotation needed - keep it flat on XY plane
  
  return geometry
}

function Primitive({ primitiveConfig }) {
  const { position, zOffset, rotation, type, fontSize, text, color, material, points, labels, spread, radialAlignment, markerCount, markerSkip, markerLength, markerWidth } = primitiveConfig
  
  // Extract position values
  const vector = position?.vector !== undefined ? position.vector : 6
  const offset = position?.offset !== undefined ? position.offset : 10
  
  // Convert vector (0-12) to angle
  const hourValue = vector
  const angle = ((hourValue === 12 || hourValue === 0) ? 0 : hourValue) * Math.PI / 6

  // Calculate x, y coordinates
  const distance = offset
  const x = Math.sin(angle) * distance
  const y = Math.cos(angle) * distance
  const z = zOffset !== undefined ? zOffset : 0
  
  const primitivePosition = [x, y, z]
  
  // Convert rotation from degrees to radians for Z-axis rotation
  // Negate to make positive rotation clockwise (Three.js default is counter-clockwise)
  const rotationZ = rotation !== undefined ? (-rotation * Math.PI / 180) : 0

  // Process labels for circular label type
  const labelArray = useMemo(() => {
    if (type !== 'circularLabel') return []
    const labelsString = labels || '12,1,2,3,4,5,6,7,8,9,10,11'
    return labelsString.split(',').map(label => label.trim()).filter(label => label.length > 0)
  }, [type, labels])

  // Always call hooks in the same order
  const handGeometry = useMemo(() => {
    if (type !== 'hand') return null
    return createHandGeometry(points)
  }, [type, points])

  const cylinderGeometry = useMemo(() => {
    if (type !== 'hand') return null
    return createBeveledCylinder(0.4, 0.3)
  }, [type])

  const handMaterial = useMemo(() => {
    if (type !== 'hand') return null
    return getMaterialInstance(material || 'polishedSilver')
  }, [type, material])

  return (
    <group position={primitivePosition} rotation={[0, 0, rotationZ]}>
      {/* Label primitive */}
      {type === 'label' && (
        <Text
          fontSize={fontSize || 2}
          color={color || '#000000'}
          anchorX="center"
          anchorY="middle"
        >
          {text !== undefined ? text : '12'}
        </Text>
      )}

      {/* Circular Label primitive */}
      {type === 'circularLabel' && labelArray.map((label, index) => {
        const radius = spread !== undefined ? spread : 5
        const labelCount = labelArray.length
        // Start at 12 o'clock (0 radians) and distribute evenly
        const labelAngle = (index / labelCount) * Math.PI * 2
        const labelX = Math.sin(labelAngle) * radius
        const labelY = Math.cos(labelAngle) * radius
        
        // Calculate rotation for radial alignment
        let textRotation = 0
        if (radialAlignment) {
          // Rotate text to align radially (perpendicular to the circle)
          // The text should point toward the center
          textRotation = -labelAngle
          
          // For labels below the midline (between 3 and 9 o'clock), flip them
          // This is when labelAngle is between π/2 and 3π/2 (90° to 270°)
          const normalizedAngle = labelAngle % (Math.PI * 2)
          if (normalizedAngle > Math.PI / 2 && normalizedAngle < (3 * Math.PI) / 2) {
            textRotation += Math.PI // Flip 180 degrees
          }
        }
        
        return (
          <Text
            key={index}
            position={[labelX, labelY, 0]}
            rotation={[0, 0, textRotation]}
            fontSize={fontSize || 2}
            color={color || '#000000'}
            anchorX="center"
            anchorY="middle"
          >
            {label}
          </Text>
        )
      })}

      {/* Circular Markers primitive */}
      {type === 'circularMarkers' && (() => {
        const radius = spread !== undefined ? spread : 5
        const count = markerCount !== undefined ? markerCount : 12
        const skip = markerSkip !== undefined ? markerSkip : 0
        const length = markerLength !== undefined ? markerLength : 1
        const width = markerWidth !== undefined ? markerWidth : 0.1
        const markerColor = color || '#000000'
        
        const markers = []
        for (let i = 0; i < count; i++) {
          // Skip pattern: if skip is 1, skip every other (i % 2 === 1)
          // if skip is 2, skip every second (i % 3 === 1 or i % 3 === 2)
          // if skip is N, skip when i % (N+1) !== 0
          if (skip > 0 && i % (skip + 1) !== 0) {
            continue
          }
          
          const markerAngle = (i / count) * Math.PI * 2
          const markerX = Math.sin(markerAngle) * radius
          const markerY = Math.cos(markerAngle) * radius
          
          markers.push(
            <mesh
              key={i}
              position={[markerX, markerY, 0]}
              rotation={[0, 0, -markerAngle]}
            >
              <boxGeometry args={[width, length, 0.1]} />
              <meshStandardMaterial color={markerColor} />
            </mesh>
          )
        }
        
        return markers
      })()}

      {/* Hand primitive */}
      {type === 'hand' && handGeometry && (
        <>
          <mesh material={handMaterial} castShadow>
            <primitive object={handGeometry} attach="geometry" />
          </mesh>
          
          {/* Pivot cylinder and sphere at origin */}
          <mesh position={[0, 0, 0.15]} material={handMaterial} castShadow>
            <primitive object={cylinderGeometry} attach="geometry" />
          </mesh>
          <mesh position={[0, 0, 0.25]} material={handMaterial} castShadow>
            <sphereGeometry args={[0.25, 16, 16]} />
          </mesh>
        </>
      )}
    </group>
  )
}

function Primitives({ primitives }) {
  if (!primitives || primitives.length === 0) {
    return null
  }

  return (
    <>
      {primitives.map((primitiveConfig, index) => {
        // Skip rendering if primitive is hidden
        if (primitiveConfig.hidden) {
          return null
        }
        
        return <Primitive key={index} primitiveConfig={primitiveConfig} />
      })}
    </>
  )
}

export default Primitives