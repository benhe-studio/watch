function Face({ config }) {
  return (
    <group>
      {/* Watch face base */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2, 128]} />
        <meshStandardMaterial
          color={config.color}
          roughness={1 - config.smoothness}
          metalness={config.metallic}
        />
      </mesh>
      
      {/* North indicator - small sphere at 12 o'clock position */}
      <mesh position={[0, 0.1, -2.3]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
    </group>
  )
}

export default Face