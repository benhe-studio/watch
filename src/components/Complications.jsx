import { Text } from '@react-three/drei'
import * as THREE from 'three'

function Complications({ complications }) {
  if (!complications || complications.length === 0) {
    return null
  }

  return (
    <>
      {complications.map((complicationConfig, index) => {
        // Calculate position based on position choice (12, 3, 6, 9) and distance
        const { position, distance, type, dateValue } = complicationConfig
        
        const angle = {
          12: 0,
          3: Math.PI / 2,
          6: Math.PI,
          9: (3 * Math.PI) / 2
        }[position] || 0

        // Calculate x, z coordinates (y is height above face)
        const x = Math.sin(angle) * distance
        const z = -Math.cos(angle) * distance
        const datePosition = [x, 0.2, z]
        
        // Calculate rotation to face outward from center
        const dateRotation = [-Math.PI / 2, 0, angle]

        return (
          <group key={index}>
            {/* Date complication */}
            {type === 'date' && (
              <group position={datePosition} rotation={dateRotation}>
                {/* Background plane for date */}
                <mesh>
                  <planeGeometry args={[4, 3]} />
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