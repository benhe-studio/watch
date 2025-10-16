import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Geometry generator functions - return THREE.BufferGeometry
const geometryGenerators = {
  classic: ({ length, width }) => {
    return new THREE.BoxGeometry(width, 0.5, length)
  },
  
  dauphine: ({ length, width }) => {
    const shape = new THREE.Shape()
    const halfLength = length / 2
    
    // First triangle (from center to tip)
    shape.moveTo(0, 0)
    shape.lineTo(-width / 2, 0)
    shape.lineTo(0, -halfLength)
    shape.lineTo(0, 0)
    
    const topGeometry = new THREE.ShapeGeometry(shape)
    
    // Second triangle (from center to tip, other side)
    const shape2 = new THREE.Shape()
    shape2.moveTo(0, 0)
    shape2.lineTo(width / 2, 0)
    shape2.lineTo(0, -halfLength)
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
    return new THREE.CylinderGeometry(radiusTop, radiusBottom, length, 16, 1)
  }
}

// Hand type configurations
const handTypeConfig = {
  hours: {
    defaultLength: 10,
    yOffset: 0.15,
    angleCalculation: (time) => {
      const startHour = 10
      const startMinute = 9
      const startSecond = 0
      const startTimeInSeconds = startHour * 3600 + startMinute * 60 + startSecond
      const currentTimeInSeconds = startTimeInSeconds + time
      return -(((currentTimeInSeconds / 3600) % 12) * (Math.PI * 2) / 12)
    }
  },
  minutes: {
    defaultLength: 14,
    yOffset: 0.2,
    angleCalculation: (time) => {
      const startHour = 10
      const startMinute = 9
      const startSecond = 0
      const startTimeInSeconds = startHour * 3600 + startMinute * 60 + startSecond
      const currentTimeInSeconds = startTimeInSeconds + time
      return -(((currentTimeInSeconds / 60) % 60) * (Math.PI * 2) / 60)
    }
  },
  seconds: {
    defaultLength: 16,
    yOffset: 0.25,
    angleCalculation: (time) => {
      const startHour = 10
      const startMinute = 9
      const startSecond = 0
      const startTimeInSeconds = startHour * 3600 + startMinute * 60 + startSecond
      const currentTimeInSeconds = startTimeInSeconds + time
      return -((currentTimeInSeconds % 60) * (Math.PI * 2) / 60)
    }
  }
}

// Single hand component
function Hand({ type, profile, width, color, length: customLength, offset }) {
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
    return generator({ length, width })
  }, [profile, length, width])
  
  useFrame(({ clock }) => {
    if (handRef.current) {
      const time = clock.getElapsedTime()
      handRef.current.rotation.y = typeConfig.angleCalculation(time)
    }
  })
  
  // Determine if this profile needs special rendering (like tapered cylinder with spheres)
  const isTaperedCylinder = profile === 'taperedCylinder'
  const isDauphine = profile === 'dauphine'
  
  if (isTaperedCylinder) {
    const radiusTop = width * 0.3
    const radiusBottom = width
    
    return (
      <group ref={handRef} rotation={[0, 0, 0]}>
        <group position={[0, typeConfig.yOffset * 10, -length / 2 + pivotOffset]} rotation={[-Math.PI / 2, 0, 0]}>
          {/* Tapered cylinder body */}
          <mesh geometry={geometry} castShadow receiveShadow>
            <meshStandardMaterial color={color} />
          </mesh>
          
          {/* Sphere cap at the large end (base) */}
          <mesh position={[0, -length / 2, 0]} castShadow receiveShadow>
            <sphereGeometry args={[radiusBottom, 16, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
          
          {/* Sphere cap at the narrow end (tip) */}
          <mesh position={[0, length / 2, 0]} castShadow receiveShadow>
            <sphereGeometry args={[radiusTop, 16, 16]} />
            <meshStandardMaterial color={color} />
          </mesh>
        </group>
        
        {/* Pivot point cylinder */}
        <mesh position={[0, typeConfig.yOffset * 10, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[width * 1.5, width * 1.5, 0.5, 32]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    )
  }
  
  if (isDauphine) {
    return (
      <group ref={handRef} rotation={[0, 0, 0]}>
        <mesh
          position={[0, typeConfig.yOffset * 10, -length / 2 + pivotOffset]}
          rotation={[-Math.PI / 2, 0, 0]}
          geometry={geometry}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial color={color} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Pivot point cylinder */}
        <mesh position={[0, typeConfig.yOffset * 10, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[width * 1.5, width * 1.5, 0.5, 32]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    )
  }
  
  // Classic and other profiles
  return (
    <group ref={handRef} rotation={[0, 0, 0]}>
      <mesh
        position={[0, typeConfig.yOffset * 10, -length / 2 + pivotOffset]}
        geometry={geometry}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Pivot point cylinder */}
      <mesh position={[0, typeConfig.yOffset * 10, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[width * 1.5, width * 1.5, 0.5, 32]} />
        <meshStandardMaterial color={color} />
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
          color={handConfig.color}
          length={handConfig.length}
          offset={handConfig.offset}
        />
      ))}
      
      {/* Center cap */}
      <mesh position={[0, 0.5, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <circleGeometry args={[1, 32]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  )
}

export default Hands