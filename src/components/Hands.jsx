import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getMaterialInstance } from '../config/helpers/materials'
import { geometryGenerators, HAND_DEPTH, HAND_EXTRUDE_SETTINGS } from './helpers/handGeometryGenerators'

// Hub radius configurations based on movement type
const hubRadiusConfig = {
  hours: 1.2,    // Largest hub for hour hand
  minutes: 0.9,  // Medium hub for minute hand
  seconds: 0.6,  // Smaller hub for second hand
  fixed: 0.5     // Smallest hub for fixed hand
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
function Hand({ type, movement, width, material, length: customLength, offset, points, cutout, cutoutPoints, zOffset, radius, spread, lumeCutout, hub, isTimeStopped, hidden }) {
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
  
  // Create hub geometry if enabled
  const hubGeometry = useMemo(() => {
    if (!hub) return null
    
    const hubRadius = hubRadiusConfig[movement] || hubRadiusConfig.fixed
    const segments = 64
    
    // Create circular shape for hub
    const hubShape = new THREE.Shape()
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const x = Math.cos(angle) * hubRadius
      const y = Math.sin(angle) * hubRadius
      if (i === 0) {
        hubShape.moveTo(x, y)
      } else {
        hubShape.lineTo(x, y)
      }
    }
    
    const hubGeo = new THREE.ExtrudeGeometry(hubShape, HAND_EXTRUDE_SETTINGS)
    // Center the geometry on the z-axis
    hubGeo.translate(0, 0, -HAND_DEPTH / 2)
    
    return hubGeo
  }, [hub, movement])
  
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
  
  if (isParametricFlat) {
    // For parametric flat hands, Y=0 in the points represents the pivot point
    // No offset calculation needed - the geometry is positioned directly at origin
    
    // Create lume fill mesh if enabled and cutout exists
    const lumeMaterial = useMemo(() => getMaterialInstance('lume'), [])
    const lumeFillMesh = lumeCutout && geometryData?.cutoutPoints && geometryData.cutoutPoints.length >= 2 ? (() => {
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
        {hubGeometry && (
          <mesh
            position={[0, 0, finalZOffset]}
            geometry={hubGeometry}
            material={materialInstance}
            castShadow
            receiveShadow
          />
        )}
      </group>
    )
  }
  
  if (isParametricFaceted) {
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
          hub={handConfig.hub}
          isTimeStopped={isTimeStopped}
          hidden={handConfig.hidden}
        />
        )
      })}
    </group>
  )
}

export default Hands