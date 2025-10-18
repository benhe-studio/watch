import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { getMaterialInstance } from '../config/materials'

// Geometry generator functions - return THREE.BufferGeometry
const geometryGenerators = {
  taperedCylinder: ({ length, width }) => {
    const radiusTop = width * 0.3
    const radiusBottom = width
    const geometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, length, 16, 1)
    // Cylinder is already along Y-axis by default, no rotation needed
    return geometry
  },
  
  parametricFlat: ({ length, width, points, bevelEnabled, bevelThickness, bevelSize, bevelSegments, cutout }) => {
    // Default points if none provided - creates a simple tapered hand
    // Y=0 represents the pivot point, negative Y extends towards the tail
    const defaultPoints = [
      [0, -4],   // Tail end (below pivot)
      [1.2, 0],    // Widen
      [0, 14],   // End at tip
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
  },
  
  parametricFaceted: ({ length, width, points, cutout, cutoutPoints }) => {
    // Default points if none provided
    const defaultPoints = [
      [0.3, -2],   // Tail end (below pivot)
      [0.5, 0],    // Widen at pivot point
      [0.3, 14],   // Taper towards tip
      [0, 18]      // End at tip
    ]
    
    const shapePoints = points || defaultPoints
    
    // Extrusion depth - reduced by factor of 4 for minimal thickness
    const extrudeDepth = (width || 0.3) / 4
    
    // Rotation angle for tilting the outer edges down (in radians)
    const tiltAngle = Math.PI / 12 // 15 degrees
    
    // Create the right half shape
    const rightShape = new THREE.Shape()
    
    // Start at the center line (x=0) at the first point's y position
    rightShape.moveTo(0, shapePoints[0][1])
    
    // Draw to each point on the right side
    for (let i = 0; i < shapePoints.length; i++) {
      rightShape.lineTo(shapePoints[i][0], shapePoints[i][1])
    }
    
    // Close back to the center line at the last point
    rightShape.lineTo(0, shapePoints[shapePoints.length - 1][1])
    
    // Add cutout hole to right shape if cutoutPoints are provided
    // Need at least 2 points to create a valid cutout shape
    if (cutoutPoints && cutoutPoints.length >= 2) {
      const rightHole = new THREE.Path()
      
      // Start at the center line
      rightHole.moveTo(0, cutoutPoints[0][1])
      
      // Draw to each cutout point on the right side
      for (let i = 0; i < cutoutPoints.length; i++) {
        rightHole.lineTo(cutoutPoints[i][0], cutoutPoints[i][1])
      }
      
      // Close back to the center line
      rightHole.lineTo(0, cutoutPoints[cutoutPoints.length - 1][1])
      rightHole.closePath()
      
      rightShape.holes.push(rightHole)
    }
    
    // Create the left half shape (mirrored)
    const leftShape = new THREE.Shape()
    
    // Start at the center line at the first point's y position
    leftShape.moveTo(0, shapePoints[0][1])
    
    // Draw to each mirrored point on the left side
    for (let i = 0; i < shapePoints.length; i++) {
      leftShape.lineTo(-shapePoints[i][0], shapePoints[i][1])
    }
    
    // Close back to the center line at the last point
    leftShape.lineTo(0, shapePoints[shapePoints.length - 1][1])
    
    // Add cutout hole to left shape if cutoutPoints are provided
    // Need at least 2 points to create a valid cutout shape
    if (cutoutPoints && cutoutPoints.length >= 2) {
      const leftHole = new THREE.Path()
      
      // Start at the center line
      leftHole.moveTo(0, cutoutPoints[0][1])
      
      // Draw to each mirrored cutout point on the left side
      for (let i = 0; i < cutoutPoints.length; i++) {
        leftHole.lineTo(-cutoutPoints[i][0], cutoutPoints[i][1])
      }
      
      // Close back to the center line
      leftHole.lineTo(0, cutoutPoints[cutoutPoints.length - 1][1])
      leftHole.closePath()
      
      leftShape.holes.push(leftHole)
    }
    
    // Extrude settings
    const extrudeSettings = {
      depth: extrudeDepth,
      bevelEnabled: false
    }
    
    // Create extruded geometries for both halves
    const rightGeometry = new THREE.ExtrudeGeometry(rightShape, extrudeSettings)
    const leftGeometry = new THREE.ExtrudeGeometry(leftShape, extrudeSettings)
    
    // Center both on the z-axis initially
    rightGeometry.translate(0, 0, -extrudeDepth / 2)
    leftGeometry.translate(0, 0, -extrudeDepth / 2)
    
    // Now rotate each half about the top edge (at z = extrudeDepth/2)
    // We need to: translate to move rotation axis to origin, rotate, translate back
    
    // For right half: rotate counter-clockwise (positive) around Y-axis
    // Move top edge to origin (the top surface is at -extrudeDepth/2 after centering)
    rightGeometry.translate(0, 0, -extrudeDepth / 2)
    // Rotate around Y-axis (tilts outer edge down)
    const rightMatrix = new THREE.Matrix4()
    rightMatrix.makeRotationY(tiltAngle)
    rightGeometry.applyMatrix4(rightMatrix)
    // Move back
    rightGeometry.translate(0, 0, extrudeDepth / 2)
    
    // For left half: rotate clockwise (negative) around Y-axis
    // Move top edge to origin (the top surface is at -extrudeDepth/2 after centering)
    leftGeometry.translate(0, 0, -extrudeDepth / 2)
    // Rotate around Y-axis (tilts outer edge down)
    const leftMatrix = new THREE.Matrix4()
    leftMatrix.makeRotationY(-tiltAngle)
    leftGeometry.applyMatrix4(leftMatrix)
    // Move back
    leftGeometry.translate(0, 0, extrudeDepth / 2)
    
    // Merge both geometries using THREE.js utility
    const mergedGeometry = mergeGeometries([rightGeometry, leftGeometry])
    
    return mergedGeometry
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
function Hand({ type, profile, width, material, length: customLength, offset, points, bevelEnabled, bevelThickness, bevelSize, bevelSegments, cutout, cutoutPoints }) {
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
    return generator({ length, width, points, bevelEnabled, bevelThickness, bevelSize, bevelSegments, cutout, cutoutPoints })
  }, [profile, length, width, points, bevelEnabled, bevelThickness, bevelSize, bevelSegments, cutout, cutoutPoints])
  
  // Get material instance
  const materialInstance = useMemo(() => getMaterialInstance(material), [material])
  
  useFrame(({ clock }) => {
    if (handRef.current) {
      const time = clock.getElapsedTime()
      handRef.current.rotation.z = typeConfig.angleCalculation(time)
    }
  })
  
  // Determine if this profile needs special rendering
  const isTaperedCylinder = profile === 'taperedCylinder'
  const isParametricFlat = profile === 'parametricFlat'
  const isParametricFaceted = profile === 'parametricFaceted'
  
  if (isTaperedCylinder) {
    const radiusTop = width * 0.3
    const radiusBottom = width
    
    return (
      <group ref={handRef} rotation={[0, 0, 0]}>
        <group position={[0, length / 2 - pivotOffset, typeConfig.zOffset]} rotation={[0, 0, 0]}>
          {/* Tapered cylinder body */}
          <mesh geometry={geometry} material={materialInstance} castShadow receiveShadow />
          
          {/* Sphere cap at the large end (base) */}
          <mesh position={[0, length / 2, 0]} material={materialInstance} castShadow receiveShadow>
            <sphereGeometry args={[radiusBottom, 16, 16]} />
          </mesh>
          
          {/* Sphere cap at the narrow end (tip) */}
          <mesh position={[0, -length / 2, 0]} material={materialInstance} castShadow receiveShadow>
            <sphereGeometry args={[radiusTop, 16, 16]} />
          </mesh>
        </group>
        
        {/* Pivot point cylinder */}
        <mesh position={[0, 0, typeConfig.zOffset]} rotation={[Math.PI / 2, 0, 0]} material={materialInstance} castShadow receiveShadow>
          <cylinderGeometry args={[width * 1.5, width * 1.5, 0.5, 32]} />
        </mesh>
      </group>
    )
  }
  
  if (isParametricFlat || isParametricFaceted) {
    // For parametric hands, Y=0 in the points represents the pivot point
    // No offset calculation needed - the geometry is positioned directly at origin
    return (
      <group ref={handRef} rotation={[0, 0, 0]}>
        <mesh
          position={[0, 0, typeConfig.zOffset]}
          rotation={[0, 0, 0]}
          geometry={geometry}
          material={materialInstance}
          castShadow
          receiveShadow
        />
        
        {/* Pivot point cylinder */}
        <mesh position={[0, 0, typeConfig.zOffset]} rotation={[Math.PI / 2, 0, 0]} material={materialInstance} castShadow receiveShadow>
          <cylinderGeometry args={[0.75, 0.75, 0.5, 32]} />
        </mesh>
      </group>
    )
  }
  
  // Fallback for any other profiles
  return (
    <group ref={handRef} rotation={[0, 0, 0]}>
      <mesh
        position={[0, length / 2 - pivotOffset, typeConfig.zOffset]}
        geometry={geometry}
        material={materialInstance}
        castShadow
        receiveShadow
      />
      
      {/* Pivot point cylinder */}
      <mesh position={[0, 0, typeConfig.zOffset]} rotation={[Math.PI / 2, 0, 0]} material={materialInstance} castShadow receiveShadow>
        <cylinderGeometry args={[width * 1.5, width * 1.5, 0.5, 32]} />
      </mesh>
    </group>
  )
}

function Hands({ hands = [] }) {
  return (
    <group>
      {/* Render each hand from the configuration */}
      {hands.map((handConfig, index) => {
        // Skip rendering if hand is hidden
        if (handConfig.hidden) {
          return null
        }
        
        return (
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
          cutoutPoints={handConfig.cutoutPoints}
        />
        )
      })}
      
      {/* Center cap */}
      <mesh position={[0, 0, 0.5]} rotation={[0, 0, 0]} castShadow receiveShadow>
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  )
}

export default Hands