import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { getMaterial } from '../config/materials'

function MinuteMarkers({ minuteMarkers }) {
  if (!minuteMarkers || minuteMarkers.length === 0) {
    return null
  }

  return (
    <>
      {minuteMarkers.map((markerConfig, markerIndex) => {
        const markerElements = []
        const visibleMinutes = markerConfig.visibleMinutes || Array.from({ length: 60 }, (_, i) => i)
        
        for (let i = 0; i < 60; i++) {
          // For numeral type, only render at hour marks (every 5 minutes)
          if (markerConfig.type === 'numeral' && i % 5 !== 0) {
            continue
          }
          
          // Skip this minute if it's not in the visible minutes array
          if (!visibleMinutes.includes(i)) {
            continue
          }
          
          // Skip hour marks if hideHourMarks is enabled (not applicable to numeral type)
          // Hour marks are at positions 0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55
          if (markerConfig.type !== 'numeral' && markerConfig.hideHourMarks && i % 5 === 0) {
            continue
          }
          
          // Calculate angle for each minute position
          // Start at 12 (top) which should be at positive Y
          // i=0 -> 12 o'clock (top, +Y), i=15 -> 3 o'clock (right, +X), etc.
          const angle = (i * Math.PI) / 30 // 60 minutes = 2π radians, so each minute is π/30
          const spread = markerConfig.spread || 17
          const x = Math.sin(angle) * spread
          const y = Math.cos(angle) * spread
          
          markerElements.push(
            <group
              key={`${markerIndex}-${i}`}
              position={[x, y, 0]}
              rotation={[0, 0, markerConfig.rotate ? -angle : 0]}
            >
              {markerConfig.type === 'line' && (() => {
                const width = markerConfig.width || 0.02
                const height = markerConfig.height || 0.1
                const depth = markerConfig.depth || 0.02
                const material = getMaterial(markerConfig.material || 'polishedSilver')
                
                return (
                  <mesh castShadow receiveShadow>
                    <boxGeometry args={[width, height, depth]} />
                    <meshPhysicalMaterial
                      color={material.color}
                      roughness={material.roughness}
                      metalness={material.metalness}
                      clearcoat={material.clearcoat}
                      clearcoatRoughness={material.clearcoatRoughness}
                      reflectivity={material.reflectivity}
                      ior={material.ior}
                      emissive={material.emissive || '#000000'}
                      emissiveIntensity={material.emissiveIntensity || 0}
                      toneMapped={false}
                    />
                  </mesh>
                )
              })()}
              {markerConfig.type === 'dot' && (() => {
                const radius = markerConfig.radius || 0.03
                const material = getMaterial(markerConfig.material || 'polishedSilver')
                
                return (
                  <mesh castShadow receiveShadow>
                    <sphereGeometry args={[radius, 16, 16]} />
                    <meshPhysicalMaterial
                      color={material.color}
                      roughness={material.roughness}
                      metalness={material.metalness}
                      clearcoat={material.clearcoat}
                      clearcoatRoughness={material.clearcoatRoughness}
                      reflectivity={material.reflectivity}
                      ior={material.ior}
                      emissive={material.emissive || '#000000'}
                      emissiveIntensity={material.emissiveIntensity || 0}
                      toneMapped={false}
                    />
                  </mesh>
                )
              })()}
              {markerConfig.type === 'numeral' && (() => {
                // Calculate the minute value to display (5, 10, 15, etc.)
                const minuteValue = i === 0 ? 60 : i
                
                // Rotate bottom half numbers (20, 25, 30, 35, 40) by 180 degrees
                // These correspond to i values of 20, 25, 30, 35, 40
                // Only apply flip if rotation is enabled
                const needsFlip = markerConfig.rotate && i >= 20 && i <= 40
                const additionalRotation = needsFlip ? Math.PI : 0
                
                return (
                  <Text
                    position={[0, 0, 0.1]}
                    rotation={[0, 0, additionalRotation]}
                    fontSize={markerConfig.fontSize || 0.15}
                    color={markerConfig.color || '#000000'}
                    anchorX="center"
                    anchorY="middle"
                  >
                    {minuteValue}
                  </Text>
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

export default MinuteMarkers