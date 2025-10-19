import { useMemo } from 'react'
import { FACE_THICKNESS } from '../config/constants'
import { getMaterialInstance } from '../config/materials'
import * as THREE from 'three'

// Extract window rendering logic into a separate component to avoid hooks in map
function ComplicationWindow({ windowConfig, index }) {
  // Calculate position based on vector (0-12 like clock hours) and offset
  const {
    vector,
    offset,
    type,
    radius,
    width,
    height,
    frameEnabled,
    frameWidth,
    frameThickness,
    frameDepth,
    frameMaterial,
    frameBevelEnabled,
    frameBevelThickness,
    frameBevelSize,
    frameBevelSegments
  } = windowConfig
  
  // Skip frame rendering for moonphase type
  const shouldRenderFrame = frameEnabled && type !== 'moonphase'
  
  // Convert vector (0-12) to angle
  // vector=0 or 12 -> 0 rad (top), vector=3 -> π/2 rad (right), etc.
  // Each hour is π/6 radians (30 degrees)
  const hourValue = vector !== undefined ? vector : 3
  const angle = ((hourValue === 12 || hourValue === 0) ? 0 : hourValue) * Math.PI / 6

  // Calculate x, y coordinates (z is height above face)
  const distance = offset || 15
  const x = Math.sin(angle) * distance
  const y = Math.cos(angle) * distance
  // Position window background underneath the face (visible through cutout)
  const windowPosition = [x, y, -FACE_THICKNESS / 2]

  // Create frame geometry if enabled (not for moonphase)
  const frameGeometry = useMemo(() => {
    if (!shouldRenderFrame) return null

    const frameWidthValue = frameWidth || 0.3
    const frameThicknessValue = frameThickness || 0.5

    if (type === 'circle') {
      // Create circular frame with hole in middle
      const outerRadius = (radius || 2.2) + frameWidthValue
      const innerRadius = radius || 2.2
      
      const outerShape = new THREE.Shape()
      outerShape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false)
      
      const innerHole = new THREE.Path()
      innerHole.absarc(0, 0, innerRadius, 0, Math.PI * 2, true)
      outerShape.holes.push(innerHole)

      const extrudeSettings = {
        depth: frameThicknessValue,
        bevelEnabled: frameBevelEnabled !== false,
        bevelThickness: frameBevelThickness || 0.05,
        bevelSize: frameBevelSize || 0.05,
        bevelSegments: frameBevelSegments || 3,
        curveSegments: 256
      }

      return new THREE.ExtrudeGeometry(outerShape, extrudeSettings)
    } else {
      // Create rectangular frame with hole in middle
      const outerWidth = (width || 4) + (frameWidthValue * 2)
      const outerHeight = (height || 3) + (frameWidthValue * 2)
      const innerWidth = width || 4
      const innerHeight = height || 3

      const outerShape = new THREE.Shape()
      outerShape.moveTo(-outerWidth / 2, -outerHeight / 2)
      outerShape.lineTo(outerWidth / 2, -outerHeight / 2)
      outerShape.lineTo(outerWidth / 2, outerHeight / 2)
      outerShape.lineTo(-outerWidth / 2, outerHeight / 2)
      outerShape.lineTo(-outerWidth / 2, -outerHeight / 2)

      const innerHole = new THREE.Path()
      innerHole.moveTo(-innerWidth / 2, -innerHeight / 2)
      innerHole.lineTo(innerWidth / 2, -innerHeight / 2)
      innerHole.lineTo(innerWidth / 2, innerHeight / 2)
      innerHole.lineTo(-innerWidth / 2, innerHeight / 2)
      innerHole.lineTo(-innerWidth / 2, -innerHeight / 2)
      outerShape.holes.push(innerHole)

      const extrudeSettings = {
        depth: frameThicknessValue,
        bevelEnabled: frameBevelEnabled !== false,
        bevelThickness: frameBevelThickness || 0.05,
        bevelSize: frameBevelSize || 0.05,
        bevelSegments: frameBevelSegments || 3,
        curveSegments: 256
      }

      return new THREE.ExtrudeGeometry(outerShape, extrudeSettings)
    }
  }, [type, radius, width, height, shouldRenderFrame, frameWidth, frameThickness, frameBevelEnabled, frameBevelThickness, frameBevelSize, frameBevelSegments])

  const frameMaterialInstance = useMemo(() =>
    shouldRenderFrame ? getMaterialInstance(frameMaterial || 'polishedSilver') : null,
    [shouldRenderFrame, frameMaterial]
  )

  // Position frame on top of face (frameDepth is Z offset, frameThickness is extrusion depth)
  const frameDepthValue = frameDepth !== undefined ? frameDepth : 0.25
  const frameThicknessValue = frameThickness || 0.5
  const framePosition = [x, y, frameDepthValue + frameThicknessValue / 2]

  return (
    <group key={index}>
      {/* Window background - visible through face cutout */}
      <mesh position={windowPosition}>
        {type === 'circle' || type === 'moonphase' ? (
          <circleGeometry args={[radius || 2.2, 32]} />
        ) : (
          <planeGeometry args={[width || 4, height || 3]} />
        )}
        <meshStandardMaterial
          color="#ffffff"
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Optional frame around window (not for moonphase) */}
      {shouldRenderFrame && frameGeometry && (
        <mesh position={framePosition} material={frameMaterialInstance} castShadow>
          <primitive object={frameGeometry} attach="geometry" />
        </mesh>
      )}
    </group>
  )
}

function ComplicationWindows({ windows }) {
  if (!windows || windows.length === 0) {
    return null
  }

  return (
    <>
      {windows.map((windowConfig, index) => {
        // Skip rendering if window is hidden
        if (windowConfig.hidden) {
          return null
        }
        
        return <ComplicationWindow key={index} windowConfig={windowConfig} index={index} />
      })}
    </>
  )
}

export default ComplicationWindows