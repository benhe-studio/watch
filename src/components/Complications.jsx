import { Text } from '@react-three/drei'
import { FACE_THICKNESS } from '../config/constants'
import * as THREE from 'three'

function Complications({ complications }) {
  if (!complications || complications.length === 0) {
    return null
  }

  return (
    <>
      {complications.map((complicationConfig, index) => {
        // Calculate position based on vector (0-12 like clock hours) and offset
        const { vector, offset, type, dateValue, windowShape, windowRadius, windowWidth, windowHeight } = complicationConfig
        
        // Convert vector (0-12) to angle
        // vector=0 or 12 -> 0 rad (top), vector=3 -> π/2 rad (right), etc.
        // Each hour is π/6 radians (30 degrees)
        const hourValue = vector !== undefined ? vector : 3
        const angle = ((hourValue === 12 || hourValue === 0) ? 0 : hourValue) * Math.PI / 6

        // Calculate x, y coordinates (z is height above face)
        const distance = offset || 15
        const x = Math.sin(angle) * distance
        const y = Math.cos(angle) * distance
        // Position complication underneath the face (visible through window)
        const datePosition = [x, y, -FACE_THICKNESS / 2]

        return (
          <group key={index}>
            {/* Date complication */}
            {type === 'date' && (
              <group position={datePosition} rotation={[0, 0, 0]}>
                {/* Background plane for date - matches window shape */}
                <mesh>
                  {windowShape === 'circle' ? (
                    <circleGeometry args={[windowRadius || 2.2, 32]} />
                  ) : (
                    <planeGeometry args={[windowWidth || 4, windowHeight || 3]} />
                  )}
                  <meshStandardMaterial
                    color="#ffffff"
                    side={THREE.DoubleSide}
                  />
                </mesh>
                
                {/* Date text */}
                <Text
                  position={[0, 0, 0.01]}
                  fontSize={1.8}
                  color="#000000"
                  anchorX="center"
                  anchorY="middle"
                >
                  {dateValue}
                </Text>
              </group>
            )}
          </group>
        )
      })}
    </>
  )
}

export default Complications