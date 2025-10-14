import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

function Hands({ profile }) {
  const hourRef = useRef()
  const minuteRef = useRef()
  const secondRef = useRef()

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime()
    
    // Animate hands (rotate around Y axis since watch face is horizontal)
    if (secondRef.current) {
      secondRef.current.rotation.y = -time
    }
    if (minuteRef.current) {
      minuteRef.current.rotation.y = -time / 60
    }
    if (hourRef.current) {
      hourRef.current.rotation.y = -time / 3600
    }
  })

  const profiles = {
    classic: {
      hour: { length: 1.0, width: 0.08, color: '#000000' },
      minute: { length: 1.4, width: 0.06, color: '#000000' },
      second: { length: 1.6, width: 0.02, color: '#ff0000' }
    },
    modern: {
      hour: { length: 0.9, width: 0.1, color: '#333333' },
      minute: { length: 1.3, width: 0.08, color: '#333333' },
      second: { length: 1.5, width: 0.03, color: '#0066ff' }
    },
    minimal: {
      hour: { length: 0.8, width: 0.05, color: '#000000' },
      minute: { length: 1.2, width: 0.04, color: '#000000' },
      second: { length: 1.4, width: 0.015, color: '#666666' }
    }
  }

  const currentProfile = profiles[profile] || profiles.classic

  return (
    <group>
      {/* Hour hand */}
      <group ref={hourRef} rotation={[0, 0, 0]}>
        <mesh position={[0, 0.02, currentProfile.hour.length / 2]}>
          <boxGeometry args={[currentProfile.hour.width, 0.05, currentProfile.hour.length]} />
          <meshStandardMaterial color={currentProfile.hour.color} />
        </mesh>
      </group>

      {/* Minute hand */}
      <group ref={minuteRef} rotation={[0, 0, 0]}>
        <mesh position={[0, 0.03, currentProfile.minute.length / 2]}>
          <boxGeometry args={[currentProfile.minute.width, 0.05, currentProfile.minute.length]} />
          <meshStandardMaterial color={currentProfile.minute.color} />
        </mesh>
      </group>

      {/* Second hand */}
      <group ref={secondRef} rotation={[0, 0, 0]}>
        <mesh position={[0, 0.04, currentProfile.second.length / 2]}>
          <boxGeometry args={[currentProfile.second.width, 0.05, currentProfile.second.length]} />
          <meshStandardMaterial color={currentProfile.second.color} />
        </mesh>
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