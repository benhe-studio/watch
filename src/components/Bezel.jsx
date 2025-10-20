import { useMemo } from 'react'
import { getMaterialInstance } from '../config/helpers/materials'
import * as THREE from 'three'

function Bezel({ config }) {
  const bezelMaterial = useMemo(() => getMaterialInstance(config.bezelMaterial || 'brushedSteel'), [config.bezelMaterial])
  
  // Create bezel geometry if enabled
  const bezelGeometry = useMemo(() => {
    if (!config.bezel) return null
    
    const faceRadius = 20
    const bezelHeight = config.bezelHeight || 2
    const bezelThickness = config.bezelThickness || 1.5
    const bezelSegments = 256 // Always use 256 segments for smooth curves
    
    // Extract bevel settings with defaults
    const bevel = config.bezelBevel || { enabled: false, thickness: 0.1, size: 0.1, segments: 3 }
    
    // Compensate for bevel size to maintain effective inner radius at faceRadius
    // When bevel is enabled, it shrinks the geometry inward, so we expand both radii
    const bevelCompensation = bevel.enabled ? bevel.size : 0
    
    // Create a doughnut shape using a ring shape and extrude it
    const bezelShape = new THREE.Shape()
    const outerRadius = faceRadius + bezelThickness + bevelCompensation
    const innerRadius = faceRadius + bevelCompensation
    
    // Outer circle
    bezelShape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false)
    
    // Inner circle (hole)
    const hole = new THREE.Path()
    hole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true)
    bezelShape.holes.push(hole)
    
    // Extrude the shape to create the bezel height with configurable bevel
    const extrudeSettings = {
      depth: bezelHeight,
      bevelEnabled: bevel.enabled,
      bevelThickness: bevel.enabled ? bevel.thickness : 0,
      bevelSize: bevel.enabled ? bevel.size : 0,
      bevelSegments: bevel.enabled ? Math.round(bevel.segments) : 1,
      curveSegments: bezelSegments,
      steps: Math.max(1, Math.floor(bezelHeight * 10)) // More steps for smoother extrusion
    }
    
    const geometry = new THREE.ExtrudeGeometry(bezelShape, extrudeSettings)
    
    // Position the bezel so it sits on top of the face (at z=0 and extends upward)
    geometry.translate(0, 0, 0)
    
    return geometry
  }, [
    config.bezel,
    config.bezelHeight,
    config.bezelThickness,
    config.bezelBevel
  ])

  if (!config.bezel || !bezelGeometry) {
    return null
  }

  return (
    <mesh castShadow receiveShadow material={bezelMaterial}>
      <primitive object={bezelGeometry} attach="geometry" />
    </mesh>
  )
}

export default Bezel