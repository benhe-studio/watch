import { Text3D } from '@react-three/drei'
import * as THREE from 'three'
import { getMaterialInstance } from '../config/helpers/materials'

function Markers({ markers }) {
  if (!markers || markers.length === 0) {
    return null
  }

  return (
    <>
      {markers.map((markerConfig, markerIndex) => {
        // Skip rendering if marker is hidden
        if (markerConfig.hidden) {
          return null
        }
        
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
          
          // Determine if this marker is on the bottom half (hours 4-8)
          // For numerals with radial alignment, rotate an additional 180 degrees
          const isBottomHalf = number >= 4 && number <= 8
          const needsAdditionalRotation = markerConfig.type === 'numeral' && markerConfig.radialAlignment && isBottomHalf
          
          markerElements.push(
            <group
              key={`${markerIndex}-${i}`}
              position={[x, y, 0]}
              rotation={[
                0,
                0,
                markerConfig.radialAlignment ? -angle + (needsAdditionalRotation ? Math.PI : 0) : 0
              ]}
            >
              {markerConfig.type === 'blocks' && (() => {
                const topWidth = markerConfig.topWidth !== undefined ? markerConfig.topWidth : 0.1
                const bottomWidth = markerConfig.bottomWidth !== undefined ? markerConfig.bottomWidth : 0.1
                const length = markerConfig.length || 0.3
                const depth = markerConfig.depth || 0.5
                const cutout = markerConfig.cutout !== undefined ? markerConfig.cutout : 0
                const lumeCutout = markerConfig.lumeCutout || false
                const material = getMaterialInstance(markerConfig.material || 'polishedSilver')
                const lumeMaterial = getMaterialInstance('lume')
                const bevel = markerConfig.bevel || { enabled: true, thickness: 0.1, size: 0.1, segments: 3 }
                const doubleBlock = markerConfig.doubleBlock || false
                const separation = markerConfig.separation || 1.5
                
                // Create shape (triangle if bottomWidth is 0, otherwise trapezoid)
                const shape = new THREE.Shape()
                const halfTopWidth = topWidth / 2
                const halfBottomWidth = bottomWidth / 2
                const halfLength = length / 2
                
                if (bottomWidth === 0) {
                  // Create triangle shape (point at bottom)
                  shape.moveTo(0, -halfLength)
                  shape.lineTo(halfTopWidth, halfLength)
                  shape.lineTo(-halfTopWidth, halfLength)
                  shape.lineTo(0, -halfLength)
                } else {
                  // Create trapezoid shape (viewed from the side)
                  shape.moveTo(-halfBottomWidth, -halfLength)
                  shape.lineTo(halfBottomWidth, -halfLength)
                  shape.lineTo(halfTopWidth, halfLength)
                  shape.lineTo(-halfTopWidth, halfLength)
                  shape.lineTo(-halfBottomWidth, -halfLength)
                }
                
                // Add cutout hole if cutout > 0
                if (cutout > 0) {
                  const hole = new THREE.Path()
                  const innerHalfTopWidth = halfTopWidth * cutout
                  const innerHalfBottomWidth = halfBottomWidth * cutout
                  const innerHalfLength = halfLength * cutout
                  
                  if (bottomWidth === 0) {
                    // Create smaller triangle hole
                    hole.moveTo(0, -innerHalfLength)
                    hole.lineTo(innerHalfTopWidth, innerHalfLength)
                    hole.lineTo(-innerHalfTopWidth, innerHalfLength)
                    hole.lineTo(0, -innerHalfLength)
                  } else {
                    // Create smaller trapezoid hole
                    hole.moveTo(-innerHalfBottomWidth, -innerHalfLength)
                    hole.lineTo(innerHalfBottomWidth, -innerHalfLength)
                    hole.lineTo(innerHalfTopWidth, innerHalfLength)
                    hole.lineTo(-innerHalfTopWidth, innerHalfLength)
                    hole.lineTo(-innerHalfBottomWidth, -innerHalfLength)
                  }
                  shape.holes.push(hole)
                }
                
                const extrudeSettings = {
                  depth: depth,
                  bevelEnabled: bevel.enabled,
                  bevelThickness: bevel.enabled ? bevel.thickness : 0,
                  bevelSize: bevel.enabled ? bevel.size : 0,
                  bevelSegments: bevel.enabled ? Math.round(bevel.segments) : 1
                }
                
                // Create lume fill geometry if enabled
                const lumeFillMesh = lumeCutout && cutout > 0 ? (() => {
                  const lumeShape = new THREE.Shape()
                  const innerHalfTopWidth = halfTopWidth * cutout
                  const innerHalfBottomWidth = halfBottomWidth * cutout
                  const innerHalfLength = halfLength * cutout
                  
                  if (bottomWidth === 0) {
                    // Create triangle shape for lume fill
                    lumeShape.moveTo(0, -innerHalfLength)
                    lumeShape.lineTo(innerHalfTopWidth, innerHalfLength)
                    lumeShape.lineTo(-innerHalfTopWidth, innerHalfLength)
                    lumeShape.lineTo(0, -innerHalfLength)
                  } else {
                    // Create trapezoid shape for lume fill
                    lumeShape.moveTo(-innerHalfBottomWidth, -innerHalfLength)
                    lumeShape.lineTo(innerHalfBottomWidth, -innerHalfLength)
                    lumeShape.lineTo(innerHalfTopWidth, innerHalfLength)
                    lumeShape.lineTo(-innerHalfTopWidth, innerHalfLength)
                    lumeShape.lineTo(-innerHalfBottomWidth, -innerHalfLength)
                  }
                  
                  const lumeExtrudeSettings = {
                    depth: depth * 0.95,
                    bevelEnabled: false
                  }
                  
                  return (
                    <mesh material={lumeMaterial} castShadow receiveShadow>
                      <extrudeGeometry args={[lumeShape, lumeExtrudeSettings]} />
                    </mesh>
                  )
                })() : null
                
                const blockMesh = (
                  <>
                    <mesh material={material} castShadow receiveShadow>
                      <extrudeGeometry args={[shape, extrudeSettings]} />
                    </mesh>
                    {lumeFillMesh}
                  </>
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
              {markerConfig.type === 'numeral' && (() => {
                const fontSize = markerConfig.fontSize || 2.5
                const depth = markerConfig.depth || 0.5
                const material = getMaterialInstance(markerConfig.material || 'polishedSilver')
                const bevel = markerConfig.bevel || { enabled: true, thickness: 0.1, size: 0.1, segments: 3 }
                
                // Adjust horizontal offset based on number of digits
                const isTwoDigit = number >= 10
                const xOffset = isTwoDigit ? -fontSize * 0.8 : -fontSize * 0.4
                const yOffset = -fontSize * 0.5
                
                return (
                  <Text3D
                    font="/Open Sans Light_Regular.json"
                    size={fontSize}
                    height={depth}
                    curveSegments={12}
                    bevelEnabled={bevel.enabled}
                    bevelThickness={bevel.enabled ? bevel.thickness : 0}
                    bevelSize={bevel.enabled ? bevel.size : 0}
                    bevelSegments={bevel.enabled ? Math.round(bevel.segments) : 1}
                    position={[xOffset, yOffset, 0]}
                    material={material}
                    castShadow
                    receiveShadow
                  >
                    {number.toString()}
                  </Text3D>
                )
              })()}
              {markerConfig.type === 'circle' && (() => {
                const radius = markerConfig.circleRadius || 0.15
                const depth = markerConfig.depth || 0.5
                const cutout = markerConfig.cutout !== undefined ? markerConfig.cutout : 0
                const lumeCutout = markerConfig.lumeCutout || false
                const material = getMaterialInstance(markerConfig.material || 'polishedSilver')
                const lumeMaterial = getMaterialInstance('lume')
                const bevel = markerConfig.bevel || { enabled: true, thickness: 0.1, size: 0.1, segments: 3 }
                
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
                  bevelEnabled: bevel.enabled,
                  bevelThickness: bevel.enabled ? bevel.thickness : 0,
                  bevelSize: bevel.enabled ? bevel.size : 0,
                  bevelSegments: bevel.enabled ? Math.round(bevel.segments) : 1,
                  steps: 1,
                  curveSegments: 64 // Smooth extrusion curves
                }
                
                // Create lume fill geometry if enabled
                const lumeFillMesh = lumeCutout && cutout > 0 ? (() => {
                  const innerRadius = radius * cutout
                  const lumeShape = new THREE.Shape()
                  
                  // Create filled circle for lume
                  for (let i = 0; i <= segments; i++) {
                    const angle = (i / segments) * Math.PI * 2
                    const x = Math.cos(angle) * innerRadius
                    const y = Math.sin(angle) * innerRadius
                    if (i === 0) {
                      lumeShape.moveTo(x, y)
                    } else {
                      lumeShape.lineTo(x, y)
                    }
                  }
                  
                  const lumeExtrudeSettings = {
                    depth: depth * 0.95,
                    bevelEnabled: false
                  }
                  
                  return (
                    <mesh material={lumeMaterial} castShadow receiveShadow>
                      <extrudeGeometry args={[lumeShape, lumeExtrudeSettings]} />
                    </mesh>
                  )
                })() : null
                
                return (
                  <>
                    <mesh material={material} castShadow receiveShadow>
                      <extrudeGeometry args={[shape, extrudeSettings]} />
                    </mesh>
                    {lumeFillMesh}
                  </>
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