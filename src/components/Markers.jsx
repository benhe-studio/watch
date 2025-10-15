import { Text } from '@react-three/drei'

function Markers({ type, rotate }) {
  const markers = []
  
  for (let i = 0; i < 12; i++) {
    // Calculate angle for each hour position
    // Start at 12 (top) which should be at negative Z
    // i=0 -> 12 o'clock (top, -Z), i=3 -> 3 o'clock (right, +X), etc.
    const angle = (i * Math.PI) / 6
    const radius = 1.7
    // For 12 at top: when i=0, we want x=0, z=-radius
    // sin(0) = 0, cos(0) = 1, so we need to negate z and swap
    const x = Math.sin(angle) * radius
    const z = -Math.cos(angle) * radius
    const number = i === 0 ? 12 : i
    
    markers.push(
      <group key={i} position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, rotate ? -angle : 0]}>
        {type === 'blocks' && (
          <mesh>
            <boxGeometry args={[0.1, 0.3, 0.05]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        )}
        {type === 'arabic' && (
          <Text
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            fontSize={0.25}
            color="#000000"
            anchorX="center"
            anchorY="middle"
          >
            {number}
          </Text>
        )}
        {type === 'roman' && (
          <mesh>
            <boxGeometry args={[0.08, 0.25, 0.02]} />
            <meshStandardMaterial color="#000000" />
          </mesh>
        )}
      </group>
    )
  }
  
  return <>{markers}</>
}

export default Markers