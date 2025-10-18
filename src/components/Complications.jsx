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
        const { vector, offset, type, radius, width, height, color } = complicationConfig
        
        // Convert vector (0-12) to angle
        // vector=0 or 12 -> 0 rad (top), vector=3 -> π/2 rad (right), etc.
        // Each hour is π/6 radians (30 degrees)
        const hourValue = vector !== undefined ? vector : 3
        const angle = ((hourValue === 12 || hourValue === 0) ? 0 : hourValue) * Math.PI / 6

        // Calculate x, y coordinates (z is height above face)
        const distance = offset || 15
        const x = Math.sin(angle) * distance
        const y = Math.cos(angle) * distance
        // Position complication slightly above the window background
        const complicationPosition = [x, y, -FACE_THICKNESS / 2 + 0.01]

        return (
          <group key={index}>
            {/* Circle complication */}
            {type === 'circle' && (
              <mesh position={complicationPosition}>
                <circleGeometry args={[radius || 2, 32]} />
                <meshStandardMaterial
                  color={color || '#000000'}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}

            {/* Rectangle complication */}
            {type === 'rectangle' && (
              <mesh position={complicationPosition}>
                <planeGeometry args={[width || 3.5, height || 2.5]} />
                <meshStandardMaterial
                  color={color || '#000000'}
                  side={THREE.DoubleSide}
                />
              </mesh>
            )}
          </group>
        )
      })}
    </>
  )
}

export default Complications