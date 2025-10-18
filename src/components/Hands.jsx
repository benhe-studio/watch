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
  
  circle: ({ radius, circleShape }) => {
    // For circle profile, we return null and handle geometry in the component
    // This is because we need to render different geometries (cylinder vs sphere)
    return null
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
    // Helper function to ensure points start and end at x=0
    const ensurePointsAtCenterLine = (pointsList) => {
      if (!pointsList || pointsList.length === 0) return pointsList
      
      const processed = [...pointsList]
      
      // Check first point - if x is not 0, add a point at x=0 with same y
      if (processed[0][0] !== 0) {
        processed.unshift([0, processed[0][1]])
      }
      
      // Check last point - if x is not 0, add a point at x=0 with same y
      const lastIdx = processed.length - 1
      if (processed[lastIdx][0] !== 0) {
        processed.push([0, processed[lastIdx][1]])
      }
      
      return processed
    }
    
    // Default points if none provided
    const defaultPoints = [
      [0.3, -2],   // Tail end (below pivot)
      [0.5, 0],    // Widen at pivot point
      [0.3, 14],   // Taper towards tip
      [0, 18]      // End at tip
    ]
    
    const shapePoints = points || defaultPoints
    
    // Process shape points to ensure they start and end at x=0
    const processedShapePoints = ensurePointsAtCenterLine(shapePoints)
    
    // Extrusion depth - reduced by factor of 4 for minimal thickness
    const extrudeDepth = (width || 0.3) / 4
    
    // Rotation angle for tilting the outer edges down (in radians)
    const tiltAngle = Math.PI / 12 // 15 degrees
    
    // Check if we have cutout points to process
    const hasCutout = cutoutPoints && cutoutPoints.length >= 2
    
    // Process cutout points if they exist
    const processedCutoutPoints = hasCutout ? ensurePointsAtCenterLine(cutoutPoints) : null
    
    // Create the right half shape
    const rightShape = new THREE.Shape()
    
    if (hasCutout) {
      // Trace the shape: start at first shape point, go through all shape points,
      // then back through cutout points in reverse
      rightShape.moveTo(processedShapePoints[0][0], processedShapePoints[0][1])
      
      // Draw through all shape points
      for (let i = 1; i < processedShapePoints.length; i++) {
        rightShape.lineTo(processedShapePoints[i][0], processedShapePoints[i][1])
      }
      
      // Now trace back through cutout points in reverse
      for (let i = processedCutoutPoints.length - 1; i >= 0; i--) {
        rightShape.lineTo(processedCutoutPoints[i][0], processedCutoutPoints[i][1])
      }
      
      // Close the shape
      rightShape.closePath()
    } else {
      // No cutout - trace through shape points
      rightShape.moveTo(processedShapePoints[0][0], processedShapePoints[0][1])
      
      // Draw through all shape points
      for (let i = 1; i < processedShapePoints.length; i++) {
        rightShape.lineTo(processedShapePoints[i][0], processedShapePoints[i][1])
      }
      
      // Close the shape
      rightShape.closePath()
    }
    
    // Create the left half shape (mirrored)
    const leftShape = new THREE.Shape()
    
    if (hasCutout) {
      // Trace the shape: start at first shape point (mirrored), go through all shape points,
      // then back through cutout points in reverse
      leftShape.moveTo(-processedShapePoints[0][0], processedShapePoints[0][1])
      
      // Draw through all mirrored shape points
      for (let i = 1; i < processedShapePoints.length; i++) {
        leftShape.lineTo(-processedShapePoints[i][0], processedShapePoints[i][1])
      }
      
      // Now trace back through mirrored cutout points in reverse
      for (let i = processedCutoutPoints.length - 1; i >= 0; i--) {
        leftShape.lineTo(-processedCutoutPoints[i][0], processedCutoutPoints[i][1])
      }
      
      // Close the shape
      leftShape.closePath()
    } else {
      // No cutout - trace through mirrored shape points
      leftShape.moveTo(-processedShapePoints[0][0], processedShapePoints[0][1])
      
      // Draw through all mirrored shape points
      for (let i = 1; i < processedShapePoints.length; i++) {
        leftShape.lineTo(-processedShapePoints[i][0], processedShapePoints[i][1])
      }
      
      // Close the shape
      leftShape.closePath()
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
function Hand({ type, profile, width, material, length: customLength, offset, points, bevelEnabled, bevelThickness, bevelSize, bevelSegments, cutout, cutoutPoints, zOffset, radius, spread, circleShape }) {
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
    return generator({ length, width, points, bevelEnabled, bevelThickness, bevelSize, bevelSegments, cutout, cutoutPoints, radius, spread, circleShape })
  }, [profile, length, width, points, bevelEnabled, bevelThickness, bevelSize, bevelSegments, cutout, cutoutPoints, radius, spread, circleShape])
  
  // Calculate final Z position with optional offset
  const finalZOffset = typeConfig.zOffset + (zOffset || 0)
  
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
  const isCircle = profile === 'circle'
  
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
          position={[0, 0, finalZOffset]}
          rotation={[0, 0, 0]}
          geometry={geometry}
          material={materialInstance}
          castShadow
          receiveShadow
        />
      </group>
    )
  }
  
  // Circle profile - positioned at spread distance from center
  if (isCircle) {
    const shape = circleShape || 'flat'
    
    if (shape === 'dome') {
      // Render a sphere
      return (
        <group ref={handRef} rotation={[0, 0, 0]}>
          <mesh
            position={[0, spread || 0, finalZOffset]}
            material={materialInstance}
            castShadow
            receiveShadow
          >
            <sphereGeometry args={[radius || 1, 32, 32]} />
          </mesh>
        </group>
      )
    } else {
      // Render a flat cylinder with bevel
      const depth = (radius || 1) * 0.3
      return (
        <group ref={handRef} rotation={[0, 0, 0]}>
          <mesh
            position={[0, spread || 0, finalZOffset]}
            rotation={[Math.PI / 2, 0, 0]}
            material={materialInstance}
            castShadow
            receiveShadow
          >
            <cylinderGeometry args={[radius || 1, radius || 1, depth, 32]} />
          </mesh>
        </group>
      )
    }
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
          zOffset={handConfig.zOffset}
          radius={handConfig.radius}
          spread={handConfig.spread}
          circleShape={handConfig.circleShape}
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