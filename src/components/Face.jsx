function Face({ config }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[2, 64]} />
      <meshStandardMaterial
        color={config.color}
        roughness={1 - config.smoothness}
        metalness={config.metallic}
      />
    </mesh>
  )
}

export default Face