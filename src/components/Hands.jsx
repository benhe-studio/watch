import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getMaterial } from '../config/materials'

// Geometry generator functions - return THREE.BufferGeometry
const geometryGenerators = {
  classic: ({ length, width }) => {
    // Create box extending along Y-axis, then rotate to lie flat in XY plane
    const geometry = new THREE.BoxGeometry(width, length, 0.5)
    return geometry
  },
  
  dauphine: ({ length, width }) => {
    const shape = new THREE.Shape()
    const halfLength = length / 2
    
    // First triangle (from center to tip) - pointing up in Y (will be rotated to Z)
    shape.moveTo(0, 0)
    shape.lineTo(-width / 2, 0)
    shape.lineTo(0, halfLength)
    shape.lineTo(0, 0)
    
    const topGeometry = new THREE.ShapeGeometry(shape)
    
    // Second triangle (from center to tip, other side)
    const shape2 = new THREE.Shape()
    shape2.moveTo(0, 0)
    shape2.lineTo(width / 2, 0)
    shape2.lineTo(0, halfLength)
    shape2.lineTo(0, 0)
    
    const bottomGeometry = new THREE.ShapeGeometry(shape2)
    
    // Merge geometries
    const mergedGeometry = new THREE.BufferGeometry()
    const positions = []
    const indices = []
    
    const topPositions = topGeometry.attributes.position.array
    for (let i = 0; i < topPositions.length; i += 3) {
      positions.push(topPositions[i], topPositions[i + 1], topPositions[i + 2])
    }
    
    const bottomPositions = bottomGeometry.attributes.position.array
    const offset = topPositions.length / 3
    for (let i = 0; i < bottomPositions.length; i += 3) {
      positions.push(bottomPositions[i], bottomPositions[i + 1], bottomPositions[i + 2])
    }
    
    for (let i = 0; i < topPositions.length / 3; i++) {
      indices.push(i)
    }
    for (let i = 0; i < bottomPositions.length / 3; i++) {
      indices.push(offset + i)
    }
    
    mergedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    mergedGeometry.setIndex(indices)
    mergedGeometry.computeVertexNormals()
    
    return mergedGeometry
  },
  
  taperedCylinder: ({ length, width }) => {
    const radiusTop = width * 0.3
    const radiusBottom = width
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, length, 16, 1)
    // Cylinder is already along Y-axis by default, no rotation needed
    return geometry
  },
  
  parametric: ({ length, width, points, bevelEnabled, bevelThickness, bevelSize, bevelSegments, cutout }) => {
    // Default points if none provided - creates a simple tapered hand
    // Y=0 represents the pivot point, negative Y extends towards the tail
    const defaultPoints = [
      [0.3, -2],   // Tail end (below pivot)
      [0.5, 0],    // Widen at pivot point
      [0.3, 14],   // Taper towards tip
      [0, 18]      // End at tip
    ]
    
    const shapePoints = points || defaultPoints
    
    // Calculate the actual length from the points
    const actualLength = shapePoints[shapePoints.length - 1][1]
    
    // Create the shape by mirroring points across the center line
    // Create shape pointing up in positive Y (will be rotated to Z)
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
    
    // Add cutout hole if cutout > 0
    if (cutout > 0) {
      const hole = new THREE.Path()
      
      // Create inset points by removing a percentage of the width
      // cutout is a value between 0 and 1 representing the percentage of width to remove
      // 0 = no cutout (full width), 0.9 = 90% removed (10% remaining width)
      const innerPoints = []
      
      for (let i = 0; i < shapePoints.length; i++) {
        const [x, y] = shapePoints[i]
        
        // Keep (1 - cutout) percentage of the original width
        // So cutout=0.1 keeps 90%, cutout=0.9 keeps 10%
        const insetX = x * cutout
        const insetY = y
        
        innerPoints.push([insetX, insetY])
      }
      
      // Draw the hole path - start at the first inner point
      hole.moveTo(innerPoints[0][0], innerPoints[0][1])
      
      // Draw the right side of the hole (positive x)
      for (let i = 1; i < innerPoints.length; i++) {
        hole.lineTo(innerPoints[i][0], innerPoints[i][1])
      }
      
      // Mirror back down the left side (negative x)
      for (let i = innerPoints.length - 1; i >= 0; i--) {
        hole.lineTo(-innerPoints[i][0], innerPoints[i][1])
      }
      
      // Close the hole path
      hole.closePath()
      
      shape.holes.push(hole)
    }
    
    // Extrude settings for depth
    const depth = width || 0.5
    const shouldBevel = bevelEnabled !== undefined ? bevelEnabled : true
    const extrudeSettings = {
      depth: depth,
      bevelEnabled: shouldBevel,
      bevelThickness: shouldBevel ? (bevelThickness !== undefined ? bevelThickness : depth * 0.1) : 0,
      bevelSize: shouldBevel ? (bevelSize !== undefined ? bevelSize : depth * 0.1) : 0,
      bevelSegments: shouldBevel ? (bevelSegments !== undefined ? Math.round(bevelSegments) : 3) : 1
    }
    
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
    
    // Center the geometry on the z-axis (depth axis)
    geometry.translate(0, 0, -depth / 2)
    
    return geometry
  }
}

// Hand type configurations
const handTypeConfig = {
  hours: {
    defaultLength: 10,
    zOffset: 0.5,
    angleCalculation: (time) => {
      const startHour = 10
      const startMinute = 9
      const startSecond = 0
      const startTimeInSeconds = startHour * 3600 + startMinute * 60 + startSecond
      const currentTimeInSeconds = startTimeInSeconds + time
      // Negative rotation for clockwise (when looking down at face from +Z)
      // Hand starts at 12 o'clock (positive Y), rotates clockwise
      return -(((currentTimeInSeconds / 3600) % 12) * (Math.PI * 2) / 12)
    }
  },
  minutes: {
    defaultLength: 14,
    zOffset: 1.0,
    angleCalculation: (time) => {
      const startHour = 10
      const startMinute = 9
      const startSecond = 0
      const startTimeInSeconds = startHour * 3600 + startMinute * 60 + startSecond
      const currentTimeInSeconds = startTimeInSeconds + time
      // Negative rotation for clockwise (when looking down at face from +Z)
      // Hand starts at 12 o'clock (positive Y), rotates clockwise
      return -(((currentTimeInSeconds / 60) % 60) * (Math.PI * 2) / 60)
    }
  },
  seconds: {
    defaultLength: 16,
    zOffset: 1.5,
    angleCalculation: (time) => {
      const startHour = 10
      const startMinute = 9
      const startSecond = 0
      const startTimeInSeconds = startHour * 3600 + startMinute * 60 + startSecond
      const currentTimeInSeconds = startTimeInSeconds + time
      // Negative rotation for clockwise (when looking down at face from +Z)
      // Hand starts at 12 o'clock (positive Y), rotates clockwise
      return -((currentTimeInSeconds % 60) * (Math.PI * 2) / 60)
    }
  }
}

// Single hand component
function Hand({ type, profile, width, material, length: customLength, offset, points, bevelEnabled, bevelThickness, bevelSize, bevelSegments, cutout }) {
  const handRef = useRef()
  const typeConfig = handTypeConfig[type]
  const length = customLength || typeConfig.defaultLength
  
  // Calculate the pivot offset position
  // offset of 0 means pivot at the end (default behavior)
  // offset of 1 means pivot at the start (opposite end)
  // Default to 0 if offset is undefined or null
  const pivotOffset = length * (offset ?? 0)
  
  const geometry = useMemo(() => {
    const generator = geometryGenerators[profile] || geometryGenerators.classic
    return generator({ length, width, points, bevelEnabled, bevelThickness, bevelSize, bevelSegments, cutout })
  }, [profile, length, width, points, bevelEnabled, bevelThickness, bevelSize, bevelSegments, cutout])
  
  // Get material properties
  const materialProps = getMaterial(material)
  
  useFrame(({ clock }) => {
    if (handRef.current) {
      const time = clock.getElapsedTime()
      handRef.current.rotation.z = typeConfig.angleCalculation(time)
    }
  })
  
  // Determine if this profile needs special rendering (like tapered cylinder with spheres)
  const isTaperedCylinder = profile === 'taperedCylinder'
  const isDauphine = profile === 'dauphine'
  const isParametric = profile === 'parametric'
  
  if (isTaperedCylinder) {
    const radiusTop = width * 0.3
    const radiusBottom = width
    
    return (
      <group ref={handRef} rotation={[0, 0, 0]}>
        <group position={[0, length / 2 - pivotOffset, typeConfig.zOffset]} rotation={[0, 0, 0]}>
          {/* Tapered cylinder body */}
          <mesh geometry={geometry} castShadow receiveShadow>
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          
          {/* Sphere cap at the large end (base) */}
          <mesh position={[0, length / 2, 0]} castShadow receiveShadow>
            <sphereGeometry args={[radiusBottom, 16, 16]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
          
          {/* Sphere cap at the narrow end (tip) */}
          <mesh position={[0, -length / 2, 0]} castShadow receiveShadow>
            <sphereGeometry args={[radiusTop, 16, 16]} />
            <meshPhysicalMaterial {...materialProps} />
          </mesh>
        </group>
        
        {/* Pivot point cylinder */}
        <mesh position={[0, 0, typeConfig.zOffset]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[width * 1.5, width * 1.5, 0.5, 32]} />
          <meshPhysicalMaterial {...materialProps} />
        </mesh>
      </group>
    )
  }
  
  if (isDauphine) {
    return (
      <group ref={handRef} rotation={[0, 0, 0]}>
        <mesh
          position={[0, length / 2 - pivotOffset, typeConfig.zOffset]}
          rotation={[0, 0, 0]}
          geometry={geometry}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial {...materialProps} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Pivot point cylinder */}
        <mesh position={[0, 0, typeConfig.zOffset]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[width * 1.5, width * 1.5, 0.5, 32]} />
          <meshPhysicalMaterial {...materialProps} />
        </mesh>
      </group>
    )
  }
  
  if (isParametric) {
    // For parametric hands, Y=0 in the points represents the pivot point
    // No offset calculation needed - the geometry is positioned directly at origin
    return (
      <group ref={handRef} rotation={[0, 0, 0]}>
        <mesh
          position={[0, 0, typeConfig.zOffset]}
          rotation={[0, 0, 0]}
          geometry={geometry}
          castShadow
          receiveShadow
        >
          <meshPhysicalMaterial {...materialProps} />
        </mesh>
        
        {/* Pivot point cylinder */}
        <mesh position={[0, 0, typeConfig.zOffset]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.75, 0.75, 0.5, 32]} />
          <meshPhysicalMaterial {...materialProps} />
        </mesh>
      </group>
    )
  }
  
  // Classic and other profiles
  return (
    <group ref={handRef} rotation={[0, 0, 0]}>
      <mesh
        position={[0, length / 2 - pivotOffset, typeConfig.zOffset]}
        geometry={geometry}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
      
      {/* Pivot point cylinder */}
      <mesh position={[0, 0, typeConfig.zOffset]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[width * 1.5, width * 1.5, 0.5, 32]} />
        <meshPhysicalMaterial {...materialProps} />
      </mesh>
    </group>
  )
}

function Hands({ hands = [] }) {
  return (
    <group>
      {/* Render each hand from the configuration */}
      {hands.map((handConfig, index) => (
        <Hand
          key={`${handConfig.type}-${index}`}
          type={handConfig.type}
          profile={handConfig.profile}
          width={handConfig.width}
          material={handConfig.material}
          length={handConfig.length}
          offset={handConfig.offset}
          points={handConfig.points}
          bevelEnabled={handConfig.bevelEnabled}
          bevelThickness={handConfig.bevelThickness}
          bevelSize={handConfig.bevelSize}
          bevelSegments={handConfig.bevelSegments}
          cutout={handConfig.cutout}
        />
      ))}
      
      {/* Center cap */}
      <mesh position={[0, 0, 0.5]} rotation={[0, 0, 0]} castShadow receiveShadow>
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  )
}

export default Hands