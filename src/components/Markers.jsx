import { Text } from '@react-three/drei'

function Markers({ type, rotate }) {
  const markers = []
  
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6
    const radius = 1.7
    const x = Math.sin(angle) * radius
    const z = Math.cos(angle) * radius
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