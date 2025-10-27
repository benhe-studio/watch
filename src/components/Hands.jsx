import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { getMaterialInstance } from '../config/helpers/materials'

// Static extrude settings shared by parametric flat and circle hand types
const HAND_DEPTH = 0.2
const HAND_BEVEL_SETTINGS = {
  enabled: true,
  thickness: 0.05,
  size: 0.05,
  segments: 4
}
const HAND_EXTRUDE_SETTINGS = {
  depth: HAND_DEPTH,
  bevelEnabled: HAND_BEVEL_SETTINGS.enabled,
  bevelThickness: HAND_BEVEL_SETTINGS.thickness,
  bevelSize: HAND_BEVEL_SETTINGS.size,
  bevelSegments: HAND_BEVEL_SETTINGS.segments
}

// Geometry generator functions - return THREE.BufferGeometry
const geometryGenerators = {
  parametricFlat: ({ points, cutout, cutoutPoints, lumeCutout }) => {
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
    
    // Default points if none provided - creates a simple tapered hand
    // Y=0 represents the pivot point, negative Y extends towards the tail
    const defaultPoints = [
      [0, -4],   // Tail end (below pivot)
      [1.2, 0],    // Widen
      [0, 14],   // End at tip
    ]
    
    const shapePoints = points || defaultPoints
    
    // Process shape points to ensure they start and end at x=0
    const processedShapePoints = ensurePointsAtCenterLine(shapePoints)
    
    // Check if we have cutout points to process (need at least 2 points for a valid cutout)
    const hasCutout = cutoutPoints && cutoutPoints.length >= 2
    
    // Process cutout points only if we have a valid cutout
    const processedCutoutPoints = hasCutout ? ensurePointsAtCenterLine(cutoutPoints) : null
    
    // Create the shape by mirroring points across the center line
    // Create shape pointing up in positive Y (will be rotated to Z)
    const shape = new THREE.Shape()
    
    if (hasCutout) {
      // Trace the shape: start at first shape point, go through all shape points,
      // then back through cutout points in reverse
      shape.moveTo(processedShapePoints[0][0], processedShapePoints[0][1])
      
      // Draw through all shape points
      for (let i = 1; i < processedShapePoints.length; i++) {
        shape.lineTo(processedShapePoints[i][0], processedShapePoints[i][1])
      }
      
      // Mirror back down the left side (negative x)
      for (let i = processedShapePoints.length - 1; i >= 0; i--) {
        shape.lineTo(-processedShapePoints[i][0], processedShapePoints[i][1])
      }
      
      // Close the outer shape
      shape.closePath()
      
      // Now create the cutout hole
      const hole = new THREE.Path()
      
      // Start at first cutout point
      hole.moveTo(processedCutoutPoints[0][0], processedCutoutPoints[0][1])
      
      // Draw through all cutout points
      for (let i = 1; i < processedCutoutPoints.length; i++) {
        hole.lineTo(processedCutoutPoints[i][0], processedCutoutPoints[i][1])
      }
      
      // Mirror back down the left side (negative x)
      for (let i = processedCutoutPoints.length - 1; i >= 0; i--) {
        hole.lineTo(-processedCutoutPoints[i][0], processedCutoutPoints[i][1])
      }
      
      // Close the hole path
      hole.closePath()
      
      shape.holes.push(hole)
    } else {
      // No cutout - use simple mirrored shape
      // Start at the first point
      shape.moveTo(processedShapePoints[0][0], processedShapePoints[0][1])
      
      // Draw the right side (positive x, positive y)
      for (let i = 1; i < processedShapePoints.length; i++) {
        shape.lineTo(processedShapePoints[i][0], processedShapePoints[i][1])
      }
      
      // Mirror back down the left side (negative x), including the last point
      for (let i = processedShapePoints.length - 1; i >= 0; i--) {
        shape.lineTo(-processedShapePoints[i][0], processedShapePoints[i][1])
      }
    }
    
    const geometry = new THREE.ExtrudeGeometry(shape, HAND_EXTRUDE_SETTINGS)
    
    // Center the geometry on the z-axis (depth axis)
    geometry.translate(0, 0, -HAND_DEPTH / 2)
    
    // Return both the main geometry and lume geometry if needed
    return { geometry, lumeCutout, cutoutPoints: hasCutout ? processedCutoutPoints : null }
  },
  
  parametricFaceted: ({ points, cutout, cutoutPoints, lumeCutout }) => {
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
    
    // Extrusion depth - fixed at 0.1 for parametric faceted hands
    const extrudeDepth = 0.1
    
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
    
    // Return both the main geometry and lume geometry if needed
    return { geometry: mergedGeometry, lumeCutout, cutoutPoints: hasCutout ? processedCutoutPoints : null, shapePoints: processedShapePoints }
  }
}

// Hand movement configurations
const handMovementConfig = {
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
  },
  fixed: {
    defaultLength: 12,
    zOffset: 0.75,
    angleCalculation: (time) => {
      // Fixed hand doesn't move
      return 0
    }
  }
}

// Single hand component
function Hand({ type, movement, width, material, length: customLength, offset, points, cutout, cutoutPoints, zOffset, radius, spread, lumeCutout, isTimeStopped, hidden }) {
  const handRef = useRef()
  const timeOffsetRef = useRef(null)
  const wasStoppedRef = useRef(isTimeStopped)
  const movementConfig = handMovementConfig[movement] || handMovementConfig.seconds
  const length = customLength || movementConfig.defaultLength
  
  // Calculate the pivot offset position
  // offset of 0 means pivot at the end (default behavior)
  // offset of 1 means pivot at the start (opposite end)
  // Default to 0 if offset is undefined or null
  const pivotOffset = length * (offset ?? 0)
  
  const geometryData = useMemo(() => {
    const generator = geometryGenerators[type] || geometryGenerators.parametricFlat
    return generator({ points, cutout, cutoutPoints, radius, spread, lumeCutout })
  }, [type, points, cutout, cutoutPoints, radius, spread, lumeCutout])
  
  // Extract geometry from the returned data
  const geometry = geometryData?.geometry || geometryData
  
  // Calculate final Z position with optional offset
  const finalZOffset = movementConfig.zOffset + (zOffset || 0)
  
  // Get material instance
  const materialInstance = useMemo(() => getMaterialInstance(material), [material])
  
  useFrame(({ clock }) => {
    if (handRef.current) {
      // Detect transition from stopped to running
      if (wasStoppedRef.current && !isTimeStopped) {
        // Reset time offset when starting
        timeOffsetRef.current = clock.getElapsedTime()
      }
      wasStoppedRef.current = isTimeStopped
      
      let time
      if (isTimeStopped) {
        // When stopped, pass 0 so angleCalculation uses only the start time (10:09:00)
        time = 0
      } else {
        // Use elapsed time relative to when we started
        if (timeOffsetRef.current === null) {
          timeOffsetRef.current = clock.getElapsedTime()
        }
        time = clock.getElapsedTime() - timeOffsetRef.current
      }
      handRef.current.rotation.z = movementConfig.angleCalculation(time)
    }
  })
  
  // Determine if this type needs special rendering
  const isParametricFlat = type === 'parametricFlat'
  const isParametricFaceted = type === 'parametricFaceted'
  const isCircle = type === 'circle'
  
  if (isParametricFlat || isParametricFaceted) {
    // For parametric hands, Y=0 in the points represents the pivot point
    // No offset calculation needed - the geometry is positioned directly at origin
    
    // Create lume fill mesh if enabled and cutout exists
    const lumeMaterial = useMemo(() => getMaterialInstance('lume'), [])
    const lumeFillMesh = lumeCutout && geometryData?.cutoutPoints && geometryData.cutoutPoints.length >= 2 ? (() => {
      if (isParametricFlat) {
        // For parametric flat, create a filled shape from cutout points
        const lumeShape = new THREE.Shape()
        const cutoutPts = geometryData.cutoutPoints
        
        // Start at the first point
        lumeShape.moveTo(cutoutPts[0][0], cutoutPts[0][1])
        
        // Draw the right side (positive x)
        for (let i = 1; i < cutoutPts.length; i++) {
          lumeShape.lineTo(cutoutPts[i][0], cutoutPts[i][1])
        }
        
        // Mirror back down the left side (negative x)
        for (let i = cutoutPts.length - 1; i >= 0; i--) {
          lumeShape.lineTo(-cutoutPts[i][0], cutoutPts[i][1])
        }
        
        const lumeExtrudeSettings = {
          depth: HAND_DEPTH * 0.95,
          bevelEnabled: false
        }
        
        const lumeGeometry = new THREE.ExtrudeGeometry(lumeShape, lumeExtrudeSettings)
        lumeGeometry.translate(0, 0, -HAND_DEPTH * 0.95 / 2)
        
        return (
          <mesh
            position={[0, 0, finalZOffset]}
            geometry={lumeGeometry}
            material={lumeMaterial}
            castShadow
            receiveShadow
          />
        )
      } else if (isParametricFaceted) {
        // For parametric faceted, create a single flat piece from cutout points
        const lumeShape = new THREE.Shape()
        const cutoutPts = geometryData.cutoutPoints
        
        // Start at the first point
        lumeShape.moveTo(cutoutPts[0][0], cutoutPts[0][1])
        
        // Draw the right side (positive x)
        for (let i = 1; i < cutoutPts.length; i++) {
          lumeShape.lineTo(cutoutPts[i][0], cutoutPts[i][1])
        }
        
        // Mirror back down the left side (negative x)
        for (let i = cutoutPts.length - 1; i >= 0; i--) {
          lumeShape.lineTo(-cutoutPts[i][0], cutoutPts[i][1])
        }
        
        const lumeDepth = 0.1
        const lumeExtrudeSettings = {
          depth: lumeDepth,
          bevelEnabled: false
        }
        
        const lumeGeometry = new THREE.ExtrudeGeometry(lumeShape, lumeExtrudeSettings)
        // Position lume lower on z-axis so it sits at the bottom of the faceted hand
        lumeGeometry.translate(0, 0, -lumeDepth)
        
        return (
          <mesh
            position={[0, 0, finalZOffset]}
            geometry={lumeGeometry}
            material={lumeMaterial}
            castShadow
            receiveShadow
          />
        )
      }
    })() : null
    
    return (
      <group ref={handRef} rotation={[0, 0, 0]} visible={!hidden}>
        <mesh
          position={[0, 0, finalZOffset]}
          rotation={[0, 0, 0]}
          geometry={geometry}
          material={materialInstance}
          castShadow
          receiveShadow
        />
        {lumeFillMesh}
      </group>
    )
  }
  
  // Circle profile - positioned at spread distance from center
  // All circles are rendered as flat extruded shapes
  if (isCircle) {
    const outerRadius = radius || 1
    const depth = outerRadius * 0.3
    const cutoutValue = cutout || 0
    const segments = 128 // High segment count for smooth circle
    
    // Create circular shape
    const shape = new THREE.Shape()
    
    // Outer circle
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const x = Math.cos(angle) * outerRadius
      const y = Math.sin(angle) * outerRadius
      if (i === 0) {
        shape.moveTo(x, y)
      } else {
        shape.lineTo(x, y)
      }
    }
    
    // Inner circle (hole) if cutout > 0
    if (cutoutValue > 0) {
      const innerRadius = outerRadius * cutoutValue
      const hole = new THREE.Path()
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2
        const x = Math.cos(angle) * innerRadius
        const y = Math.sin(angle) * innerRadius
        if (i === 0) {
          hole.moveTo(x, y)
        } else {
          hole.lineTo(x, y)
        }
      }
      shape.holes.push(hole)
    }
    
    const circleGeometry = new THREE.ExtrudeGeometry(shape, HAND_EXTRUDE_SETTINGS)
    // Center the geometry on the z-axis (depth axis)
    circleGeometry.translate(0, 0, -HAND_DEPTH / 2)
    
    // Create lume fill mesh if enabled and cutout exists
    const lumeMaterial = useMemo(() => getMaterialInstance('lume'), [])
    const lumeFillMesh = lumeCutout && cutoutValue > 0 ? (() => {
      const innerRadius = outerRadius * cutoutValue
      const lumeShape = new THREE.Shape()
      
      // Create filled circle for lume
      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2
        const x = Math.cos(angle) * innerRadius
        const y = Math.sin(angle) * innerRadius
        if (i === 0) {
          lumeShape.moveTo(x, y)
        } else {
          lumeShape.lineTo(x, y)
        }
      }
      
      const lumeExtrudeSettings = {
        depth: HAND_DEPTH * 0.95,
        bevelEnabled: false
      }
      
      const lumeGeometry = new THREE.ExtrudeGeometry(lumeShape, lumeExtrudeSettings)
      lumeGeometry.translate(0, 0, -HAND_DEPTH * 0.95 / 2)
      
      return (
        <mesh
          position={[0, spread || 0, finalZOffset]}
          geometry={lumeGeometry}
          material={lumeMaterial}
          castShadow
          receiveShadow
        />
      )
    })() : null
    
    return (
      <group ref={handRef} rotation={[0, 0, 0]} visible={!hidden}>
        <mesh
          position={[0, spread || 0, finalZOffset]}
          geometry={circleGeometry}
          material={materialInstance}
          castShadow
          receiveShadow
        />
        {lumeFillMesh}
      </group>
    )
  }
  
  // Fallback for any other profiles
  return (
    <group ref={handRef} rotation={[0, 0, 0]} visible={!hidden}>
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

function Hands({ hands = [], isTimeStopped }) {
  return (
    <group>
      {/* Render each hand from the configuration */}
      {hands.map((handConfig, index) => {
        return (
          <Hand
          key={`${handConfig.type}-${handConfig.movement}-${index}`}
          type={handConfig.type}
          movement={handConfig.movement}
          width={handConfig.width}
          material={handConfig.material}
          length={handConfig.length}
          offset={handConfig.offset}
          points={handConfig.points}
          cutout={handConfig.cutout}
          cutoutPoints={handConfig.cutoutPoints}
          zOffset={handConfig.zOffset}
          radius={handConfig.radius}
          spread={handConfig.spread}
          lumeCutout={handConfig.lumeCutout}
          isTimeStopped={isTimeStopped}
          hidden={handConfig.hidden}
        />
        )
      })}
    </group>
  )
}

export default Hands