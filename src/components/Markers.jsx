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
          // Start at 12 (top) which should be at negative Z
          // i=0 -> 12 o'clock (top, -Z), i=3 -> 3 o'clock (right, +X), etc.
          const angle = (i * Math.PI) / 6
          const radius = markerConfig.radius || 1.7
          // For 12 at top: when i=0, we want x=0, z=-radius
          // sin(0) = 0, cos(0) = 1, so we need to negate z and swap
          const x = Math.sin(angle) * radius
          const z = -Math.cos(angle) * radius
          
          markerElements.push(
            <group 
              key={`${markerIndex}-${i}`} 
              position={[x, 0.01, z]} 
              rotation={[-Math.PI / 2, 0, markerConfig.rotate ? -angle : 0]}
            >
              {markerConfig.type === 'blocks' && (() => {
                const topWidth = markerConfig.topWidth || 0.1
                const bottomWidth = markerConfig.bottomWidth || 0.1
                const height = markerConfig.height || 0.3
                const depth = markerConfig.depth || 0.05
                const material = getMaterial(markerConfig.material || 'polishedSilver')
                const bevelEnabled = markerConfig.bevelEnabled !== undefined ? markerConfig.bevelEnabled : true
                const bevelThickness = markerConfig.bevelThickness || 0.01
                const bevelSize = markerConfig.bevelSize || 0.01
                const bevelSegments = markerConfig.bevelSegments || 3
                
                // Create shape (trapezoid for tapered, rectangle for uniform)
                const shape = new THREE.Shape()
                const halfTopWidth = topWidth / 2
                const halfBottomWidth = bottomWidth / 2
                const halfHeight = height / 2
                
                // Create trapezoid shape (viewed from the side)
                shape.moveTo(-halfBottomWidth, -halfHeight)
                shape.lineTo(halfBottomWidth, -halfHeight)
                shape.lineTo(halfTopWidth, halfHeight)
                shape.lineTo(-halfTopWidth, halfHeight)
                shape.lineTo(-halfBottomWidth, -halfHeight)
                
                const extrudeSettings = {
                  depth: depth,
                  bevelEnabled: bevelEnabled,
                  bevelThickness: bevelEnabled ? bevelThickness : 0,
                  bevelSize: bevelEnabled ? bevelSize : 0,
                  bevelSegments: bevelEnabled ? Math.round(bevelSegments) : 1
                }
                
                return (
                  <mesh>
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
              {markerConfig.type === 'arabic' && (
                <Text
                  position={[0, 0, 0]}
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
                <mesh>
                  <boxGeometry args={[
                    markerConfig.romanWidth || 0.08,
                    markerConfig.romanHeight || 0.25,
                    markerConfig.romanDepth || 0.02
                  ]} />
                  <meshStandardMaterial color={markerConfig.color || '#000000'} />
                </mesh>
              )}
            </group>
          )
        }
        
        return markerElements
      })}
    </>
  )
}

export default Markers