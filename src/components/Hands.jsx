import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

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
        <mesh position={[0, 0.02, -currentProfile.hour.length / 2]}>
          <boxGeometry args={[currentProfile.hour.width, 0.05, currentProfile.hour.length]} />
          <meshStandardMaterial color={currentProfile.hour.color} />
        </mesh>
      </group>

      {/* Minute hand */}
      <group ref={minuteRef} rotation={[0, 0, 0]}>
        <mesh position={[0, 0.03, -currentProfile.minute.length / 2]}>
          <boxGeometry args={[currentProfile.minute.width, 0.05, currentProfile.minute.length]} />
          <meshStandardMaterial color={currentProfile.minute.color} />
        </mesh>
      </group>

      {/* Second hand */}
      <group ref={secondRef} rotation={[0, 0, 0]}>
        <mesh position={[0, 0.04, -currentProfile.second.length / 2]}>
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