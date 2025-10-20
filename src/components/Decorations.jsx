import * as THREE from 'three'
import { getMaterialInstance } from '../config/helpers/materials'

function Decorations({ decorations }) {
  if (!decorations || decorations.length === 0) {
    return null
  }

  return (
    <>
      {decorations.map((decorationConfig, decorationIndex) => {
        // Skip rendering if decoration is hidden
        if (decorationConfig.hidden) {
          return null
        }
        
        if (decorationConfig.type === 'ring') {
          const spread = decorationConfig.spread || 17
          const thickness = decorationConfig.thickness || 1
          const depth = decorationConfig.depth || 0.5
          const material = getMaterialInstance(decorationConfig.material || 'polishedSilver')
          
          // Extract position values
          const vector = decorationConfig.position?.vector !== undefined ? decorationConfig.position.vector : 0
          const offset = decorationConfig.position?.offset !== undefined ? decorationConfig.position.offset : 0
          
          // Convert vector (0-12) to angle
          // vector=0 or 12 -> 0 rad (top), vector=3 -> π/2 rad (right), etc.
          const hourValue = (vector === 12 || vector === 0) ? 0 : vector
          const angle = hourValue * Math.PI / 6
          
          // Calculate x, y coordinates for position offset
          const x = Math.sin(angle) * offset
          const y = Math.cos(angle) * offset
          
          // Create a ring shape (doughnut) for extrusion
          const outerRadius = spread + thickness / 2
          const innerRadius = spread - thickness / 2
          
          // Create the ring shape with more segments for smoothness
          const shape = new THREE.Shape()
          shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false, 512)
          
          // Create the hole
          const hole = new THREE.Path()
          hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true, 512)
          shape.holes.push(hole)
          
          const extrudeSettings = {
            depth: depth,
            bevelEnabled: false,
            curveSegments: 512
          }
          
          return (
            <mesh key={`ring-${decorationIndex}`} position={[x, y, 0]} rotation={[0, 0, 0]} material={material} castShadow receiveShadow>
              <extrudeGeometry args={[shape, extrudeSettings]} />
            </mesh>
          )
        }
        
        if (decorationConfig.type === 'line') {
          const length = decorationConfig.length || 5
          const rotation = decorationConfig.rotation || 0
          const material = getMaterialInstance(decorationConfig.material || 'polishedSilver')
          
          // Extract position values
          const vector = decorationConfig.position?.vector !== undefined ? decorationConfig.position.vector : 0
          const offset = decorationConfig.position?.offset !== undefined ? decorationConfig.position.offset : 0
          
          // Convert vector (0-12) to angle
          // vector=0 or 12 -> 0 rad (top), vector=3 -> π/2 rad (right), etc.
          const hourValue = (vector === 12 || vector === 0) ? 0 : vector
          const angle = hourValue * Math.PI / 6
          
          // Calculate x, y coordinates for position offset
          const x = Math.sin(angle) * offset
          const y = Math.cos(angle) * offset
          
          // Convert rotation from degrees to radians
          const rotationRad = (rotation * Math.PI) / 180
          
          // Create a thin box geometry for the line
          const lineWidth = 0.2 // Fixed width for the line
          const lineDepth = 0.3 // Fixed depth for the line
          
          return (
            <mesh
              key={`line-${decorationIndex}`}
              position={[x, y, 0]}
              rotation={[0, 0, rotationRad]}
              material={material}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[lineWidth, length, lineDepth]} />
            </mesh>
          )
        }
        
        return null
      })}
    </>
  )
}

export default Decorations