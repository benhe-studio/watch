import { FACE_THICKNESS } from '../config/constants'
import * as THREE from 'three'

function ComplicationWindows({ windows }) {
  if (!windows || windows.length === 0) {
    return null
  }

  return (
    <>
      {windows.map((windowConfig, index) => {
        // Calculate position based on vector (0-12 like clock hours) and offset
        const { vector, offset, type, radius, width, height } = windowConfig
        
        // Convert vector (0-12) to angle
        // vector=0 or 12 -> 0 rad (top), vector=3 -> π/2 rad (right), etc.
        // Each hour is π/6 radians (30 degrees)
        const hourValue = vector !== undefined ? vector : 3
        const angle = ((hourValue === 12 || hourValue === 0) ? 0 : hourValue) * Math.PI / 6

        // Calculate x, y coordinates (z is height above face)
        const distance = offset || 15
        const x = Math.sin(angle) * distance
        const y = Math.cos(angle) * distance
        // Position window background underneath the face (visible through cutout)
        const windowPosition = [x, y, -FACE_THICKNESS / 2]

        return (
          <group key={index}>
            {/* Window background - visible through face cutout */}
            <mesh position={windowPosition}>
              {type === 'circle' ? (
                <circleGeometry args={[radius || 2.2, 32]} />
              ) : (
                <planeGeometry args={[width || 4, height || 3]} />
              )}
              <meshStandardMaterial
                color="#ffffff"
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )
      })}
    </>
  )
}

export default ComplicationWindows