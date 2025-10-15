import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Dauphine hand geometry - two triangles meeting in the middle with a seam
function DauphineHand({ length, width, color, yOffset }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    
    // First triangle (from center to tip)
    const halfLength = length / 2
    
    // Top triangle vertices
    shape.moveTo(0, 0) // Center point
    shape.lineTo(-width / 2, 0) // Left base
    shape.lineTo(0, -halfLength) // Tip
    shape.lineTo(0, 0) // Back to center
    
    const topGeometry = new THREE.ShapeGeometry(shape)
    
    // Bottom triangle (from center to base)
    const shape2 = new THREE.Shape()
    shape2.moveTo(0, 0) // Center point
    shape2.lineTo(width / 2, 0) // Right base
    shape2.lineTo(0, -halfLength) // Tip
    shape2.lineTo(0, 0) // Back to center
    
    const bottomGeometry = new THREE.ShapeGeometry(shape2)
    
    // Merge geometries to create the seam effect
    const mergedGeometry = new THREE.BufferGeometry()
    const positions = []
    const indices = []
    
    // Add top triangle
    const topPositions = topGeometry.attributes.position.array
    for (let i = 0; i < topPositions.length; i += 3) {
      positions.push(topPositions[i], topPositions[i + 1], topPositions[i + 2])
    }
    
    // Add bottom triangle
    const bottomPositions = bottomGeometry.attributes.position.array
    const offset = topPositions.length / 3
    for (let i = 0; i < bottomPositions.length; i += 3) {
      positions.push(bottomPositions[i], bottomPositions[i + 1], bottomPositions[i + 2])
    }
    
    // Add indices
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
  }, [length, width])
  
  return (
    <mesh position={[0, yOffset, -length / 2]} rotation={[-Math.PI / 2, 0, 0]} geometry={geometry}>
      <meshStandardMaterial color={color} side={THREE.DoubleSide} />
    </mesh>
  )
}

// Classic box hand geometry
function ClassicHand({ length, width, color, yOffset }) {
  return (
    <mesh position={[0, yOffset, -length / 2]}>
      <boxGeometry args={[width, 0.05, length]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function Hands({ profile }) {
  const hourRef = useRef()
  const minuteRef = useRef()
  const secondRef = useRef()

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    
    // Start at 10:09:00
    const startHour = 10
    const startMinute = 9
    const startSecond = 0
    
    // Calculate total seconds from start time
    const startTimeInSeconds = startHour * 3600 + startMinute * 60 + startSecond
    const currentTimeInSeconds = startTimeInSeconds + time
    
    // Calculate angles for each hand
    // Since 12 is at negative Z (top), we start from 0 and rotate clockwise (negative rotation)
    // Each position is: (position / total_positions) * 2π, negated for clockwise
    const secondAngle = -((currentTimeInSeconds % 60) * (Math.PI * 2) / 60)
    const minuteAngle = -(((currentTimeInSeconds / 60) % 60) * (Math.PI * 2) / 60)
    const hourAngle = -(((currentTimeInSeconds / 3600) % 12) * (Math.PI * 2) / 12)
    
    // Apply rotations
    // Negative rotation for clockwise movement when looking down at the watch
    if (secondRef.current) {
      secondRef.current.rotation.y = secondAngle
    }
    if (minuteRef.current) {
      minuteRef.current.rotation.y = minuteAngle
    }
    if (hourRef.current) {
      hourRef.current.rotation.y = hourAngle
    }
  })

  const profiles = {
    classic: {
      type: 'classic',
      hour: { length: 1.0, width: 0.08, color: '#000000' },
      minute: { length: 1.4, width: 0.06, color: '#000000' },
      second: { length: 1.6, width: 0.02, color: '#ff0000' }
    },
    modern: {
      type: 'classic',
      hour: { length: 0.9, width: 0.1, color: '#333333' },
      minute: { length: 1.3, width: 0.08, color: '#333333' },
      second: { length: 1.5, width: 0.03, color: '#0066ff' }
    },
    minimal: {
      type: 'classic',
      hour: { length: 0.8, width: 0.05, color: '#000000' },
      minute: { length: 1.2, width: 0.04, color: '#000000' },
      second: { length: 1.4, width: 0.015, color: '#666666' }
    },
    dauphine: {
      type: 'dauphine',
      hour: { length: 1.0, width: 0.12, color: '#1a1a1a' },
      minute: { length: 1.5, width: 0.10, color: '#1a1a1a' },
      second: { length: 1.6, width: 0.02, color: '#ff0000' }
    }
  }

  const currentProfile = profiles[profile] || profiles.classic
  
  // Select the appropriate hand component based on profile type
  const HandComponent = currentProfile.type === 'dauphine' ? DauphineHand : ClassicHand

  return (
    <group>
      {/* Hour hand */}
      <group ref={hourRef} rotation={[0, 0, 0]}>
        <HandComponent
          length={currentProfile.hour.length}
          width={currentProfile.hour.width}
          color={currentProfile.hour.color}
          yOffset={0.02}
        />
      </group>

      {/* Minute hand */}
      <group ref={minuteRef} rotation={[0, 0, 0]}>
        <HandComponent
          length={currentProfile.minute.length}
          width={currentProfile.minute.width}
          color={currentProfile.minute.color}
          yOffset={0.03}
        />
      </group>

      {/* Second hand - always use classic style for second hand */}
      <group ref={secondRef} rotation={[0, 0, 0]}>
        <ClassicHand
          length={currentProfile.second.length}
          width={currentProfile.second.width}
          color={currentProfile.second.color}
          yOffset={0.04}
        />
      </group>

      {/* Center cap */}
      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.1, 32]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  )
}

export default Hands