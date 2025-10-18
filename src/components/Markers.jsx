import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { getMaterial } from '../config/materials'

function Markers({ markers }) {
  if (!markers || markers.length === 0) {
    return null
  }

  return (
    <>
      {markers.map((markerConfig, markerIndex) => {
        const markerElements = []
        const visibleHours = markerConfig.visibleHours || [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        
        for (let i = 0; i < 12; i++) {
          const number = i === 0 ? 12 : i
          
          // Skip this hour if it's not in the visible hours array
          if (!visibleHours.includes(number)) {
            continue
          }
          
          // Calculate angle for each hour position
          // Start at 12 (top) which should be at positive Y
          // i=0 -> 12 o'clock (top, +Y), i=3 -> 3 o'clock (right, +X), etc.
          const angle = (i * Math.PI) / 6
          const spread = markerConfig.spread || 17
          // For 12 at top: when i=0, we want x=0, y=+spread
          // sin(0) = 0, cos(0) = 1
          const x = Math.sin(angle) * spread
          const y = Math.cos(angle) * spread
          
          markerElements.push(
            <group
              key={`${markerIndex}-${i}`}
              position={[x, y, 0]}
              rotation={[0, 0, markerConfig.rotate ? -angle : 0]}
            >
              {markerConfig.type === 'blocks' && (() => {
                const topWidth = markerConfig.topWidth !== undefined ? markerConfig.topWidth : 0.1
                const bottomWidth = markerConfig.bottomWidth !== undefined ? markerConfig.bottomWidth : 0.1
                const height = markerConfig.height || 0.3
                const depth = markerConfig.depth || 0.05
                const cutout = markerConfig.blocksCutout !== undefined ? markerConfig.blocksCutout : 0
                const material = getMaterial(markerConfig.material || 'polishedSilver')
                const bevelEnabled = markerConfig.bevelEnabled !== undefined ? markerConfig.bevelEnabled : true
                const bevelThickness = markerConfig.bevelThickness || 0.01
                const bevelSize = markerConfig.bevelSize || 0.01
                const bevelSegments = markerConfig.bevelSegments || 3
                const doubleBlock = markerConfig.doubleBlock || false
                const separation = markerConfig.separation || 1.5
                
                // Create shape (triangle if bottomWidth is 0, otherwise trapezoid)
                const shape = new THREE.Shape()
                const halfTopWidth = topWidth / 2
                const halfBottomWidth = bottomWidth / 2
                const halfHeight = height / 2
                
                if (bottomWidth === 0) {
                  // Create triangle shape (point at bottom)
                  shape.moveTo(0, -halfHeight)
                  shape.lineTo(halfTopWidth, halfHeight)
                  shape.lineTo(-halfTopWidth, halfHeight)
                  shape.lineTo(0, -halfHeight)
                } else {
                  // Create trapezoid shape (viewed from the side)
                  shape.moveTo(-halfBottomWidth, -halfHeight)
                  shape.lineTo(halfBottomWidth, -halfHeight)
                  shape.lineTo(halfTopWidth, halfHeight)
                  shape.lineTo(-halfTopWidth, halfHeight)
                  shape.lineTo(-halfBottomWidth, -halfHeight)
                }
                
                // Add cutout hole if cutout > 0
                if (cutout > 0) {
                  const hole = new THREE.Path()
                  const innerHalfTopWidth = halfTopWidth * cutout
                  const innerHalfBottomWidth = halfBottomWidth * cutout
                  const innerHalfHeight = halfHeight * cutout
                  
                  if (bottomWidth === 0) {
                    // Create smaller triangle hole
                    hole.moveTo(0, -innerHalfHeight)
                    hole.lineTo(innerHalfTopWidth, innerHalfHeight)
                    hole.lineTo(-innerHalfTopWidth, innerHalfHeight)
                    hole.lineTo(0, -innerHalfHeight)
                  } else {
                    // Create smaller trapezoid hole
                    hole.moveTo(-innerHalfBottomWidth, -innerHalfHeight)
                    hole.lineTo(innerHalfBottomWidth, -innerHalfHeight)
                    hole.lineTo(innerHalfTopWidth, innerHalfHeight)
                    hole.lineTo(-innerHalfTopWidth, innerHalfHeight)
                    hole.lineTo(-innerHalfBottomWidth, -innerHalfHeight)
                  }
                  shape.holes.push(hole)
                }
                
                const extrudeSettings = {
                  depth: depth,
                  bevelEnabled: bevelEnabled,
                  bevelThickness: bevelEnabled ? bevelThickness : 0,
                  bevelSize: bevelEnabled ? bevelSize : 0,
                  bevelSegments: bevelEnabled ? Math.round(bevelSegments) : 1
                }
                
                const blockMesh = (
                  <mesh castShadow receiveShadow>
                    <extrudeGeometry args={[shape, extrudeSettings]} />
                    <meshPhysicalMaterial
                      color={material.color}
                      roughness={material.roughness}
                      metalness={material.metalness}
                      clearcoat={material.clearcoat}
                      clearcoatRoughness={material.clearcoatRoughness}
                      reflectivity={material.reflectivity}
                      ior={material.ior}
                    />
                  </mesh>
                )
                
                if (doubleBlock) {
                  const offset = separation / 2
                  return (
                    <>
                      <group position={[offset, 0, 0]}>
                        {blockMesh}
                      </group>
                      <group position={[-offset, 0, 0]}>
                        {blockMesh}
                      </group>
                    </>
                  )
                }
                
                return blockMesh
              })()}
              {markerConfig.type === 'arabic' && (
                <Text
                  position={[0, 0, 0.1]}
                  rotation={[0, 0, 0]}
                  fontSize={markerConfig.fontSize || 0.25}
                  color={markerConfig.color || '#000000'}
                  anchorX="center"
                  anchorY="middle"
                >
                  {number}
                </Text>
              )}
              {markerConfig.type === 'roman' && (
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[
                    markerConfig.romanWidth || 0.08,
                    markerConfig.romanHeight || 0.25,
                    markerConfig.romanDepth || 0.02
                  ]} />
                  <meshStandardMaterial color={markerConfig.color || '#000000'} />
                </mesh>
              )}
              {markerConfig.type === 'circle' && (() => {
                const radius = markerConfig.circleRadius || 0.15
                const depth = markerConfig.circleDepth || 0.05
                const cutout = markerConfig.circleCutout !== undefined ? markerConfig.circleCutout : 0
                const material = getMaterial(markerConfig.material || 'polishedSilver')
                const bevelEnabled = markerConfig.bevelEnabled !== undefined ? markerConfig.bevelEnabled : true
                const bevelThickness = markerConfig.bevelThickness || 0.01
                const bevelSize = markerConfig.bevelSize || 0.01
                const bevelSegments = markerConfig.bevelSegments || 3
                
                // Create circular shape with high fidelity
                const shape = new THREE.Shape()
                const segments = 128 // High segment count for smooth circle
                
                // Outer circle
                for (let i = 0; i <= segments; i++) {
                  const angle = (i / segments) * Math.PI * 2
                  const x = Math.cos(angle) * radius
                  const y = Math.sin(angle) * radius
                  if (i === 0) {
                    shape.moveTo(x, y)
                  } else {
                    shape.lineTo(x, y)
                  }
                }
                
                // Inner circle (hole) if cutout > 0
                if (cutout > 0) {
                  const innerRadius = radius * cutout
                  const hole = new THREE.Path()
                  for (let i = 0; i <= segments; i++) {
                    const angle = (i / segments) * Math.PI * 2
                    const x = Math.cos(angle) * innerRadius
                    const y = Math.sin(angle) * innerRadius
                    if (i === 0) {
                      hole.moveTo(x, y)
                    } else {
                      hole.lineTo(x, y)
                    }
                  }
                  shape.holes.push(hole)
                }
                
                const extrudeSettings = {
                  depth: depth,
                  bevelEnabled: bevelEnabled,
                  bevelThickness: bevelEnabled ? bevelThickness : 0,
                  bevelSize: bevelEnabled ? bevelSize : 0,
                  bevelSegments: bevelEnabled ? Math.round(bevelSegments) : 1,
                  steps: 1,
                  curveSegments: 64 // Smooth extrusion curves
                }
                
                return (
                  <mesh castShadow receiveShadow>
                    <extrudeGeometry args={[shape, extrudeSettings]} />
                    <meshPhysicalMaterial
                      color={material.color}
                      roughness={material.roughness}
                      metalness={material.metalness}
                      clearcoat={material.clearcoat}
                      clearcoatRoughness={material.clearcoatRoughness}
                      reflectivity={material.reflectivity}
                      ior={material.ior}
                    />
                  </mesh>
                )
              })()}
            </group>
          )
        }
        
        return markerElements
      })}
    </>
  )
}

export default Markers