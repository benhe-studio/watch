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
        // Calculate position based on position choice (12, 3, 6, 9) and distance
        const { position, distance, type, dateValue, windowShape, windowRadius, windowWidth, windowHeight } = complicationConfig
        
        const angle = {
          12: 0,
          3: Math.PI / 2,
          6: Math.PI,
          9: (3 * Math.PI) / 2
        }[position] || 0

        // Calculate x, z coordinates (y is height above face)
        const x = Math.sin(angle) * distance
        const z = -Math.cos(angle) * distance
        // Position complication at the bottom of the face thickness
        const datePosition = [x, -FACE_THICKNESS / 2, z]

        return (
          <group key={index}>
            {/* Date complication */}
            {type === 'date' && (
              <group position={datePosition} rotation={[-Math.PI / 2, 0, 0]}>
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