import { useMemo } from 'react'
import { FACE_THICKNESS } from '../config/constants'
import { getMaterialInstance } from '../config/helpers/materials'
import * as THREE from 'three'

// Extract window rendering logic into a separate component to avoid hooks in map
function ComplicationWindow({ windowConfig, index }) {
  // Calculate position based on vector (0-12 like clock hours) and offset
  const {
    position,
    type,
    radius,
    width,
    height,
    backgroundMaterial,
    frameEnabled,
    frameWidth,
    frameThickness,
    frameDepth,
    frameMaterial,
    frameBevel
  } = windowConfig
  
  // Extract position values
  const vector = position?.vector !== undefined ? position.vector : 6
  const offset = position?.offset !== undefined ? position.offset : 10
  
  // Extract bevel settings with defaults
  const bevel = frameBevel || { enabled: true, thickness: 0.05, size: 0.05, segments: 3 }
  
  // Skip frame rendering for moonphase type
  const shouldRenderFrame = frameEnabled && type !== 'moonphase'
  
  // Convert vector (0-12) to angle
  // vector=0 or 12 -> 0 rad (top), vector=3 -> π/2 rad (right), etc.
  // Each hour is π/6 radians (30 degrees)
  const hourValue = vector
  const angle = ((hourValue === 12 || hourValue === 0) ? 0 : hourValue) * Math.PI / 6

  // Calculate x, y coordinates (z is height above face)
  const distance = offset
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
        bevelEnabled: bevel.enabled,
        bevelThickness: bevel.enabled ? bevel.thickness : 0,
        bevelSize: bevel.enabled ? bevel.size : 0,
        bevelSegments: bevel.enabled ? Math.round(bevel.segments) : 1,
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
        bevelEnabled: bevel.enabled,
        bevelThickness: bevel.enabled ? bevel.thickness : 0,
        bevelSize: bevel.enabled ? bevel.size : 0,
        bevelSegments: bevel.enabled ? Math.round(bevel.segments) : 1,
        curveSegments: 256
      }

      return new THREE.ExtrudeGeometry(outerShape, extrudeSettings)
    }
  }, [type, radius, width, height, shouldRenderFrame, frameWidth, frameThickness, bevel])

  const frameMaterialInstance = useMemo(() =>
    shouldRenderFrame ? getMaterialInstance(frameMaterial || 'polishedSilver') : null,
    [shouldRenderFrame, frameMaterial]
  )

  // Get background material instance (not for moonphase)
  const backgroundMaterialInstance = useMemo(() => {
    if (type === 'moonphase') return null
    return getMaterialInstance(backgroundMaterial || 'white')
  }, [type, backgroundMaterial])

  // Position frame on top of face (frameDepth is Z offset, frameThickness is extrusion depth)
  const frameDepthValue = frameDepth !== undefined ? frameDepth : 0.25
  const frameThicknessValue = frameThickness || 0.5
  const framePosition = [x, y, frameDepthValue + frameThicknessValue / 2]

  return (
    <group key={index}>
      {/* Window background - visible through face cutout */}
      <mesh position={windowPosition} receiveShadow>
        {type === 'circle' || type === 'moonphase' ? (
          <circleGeometry args={[radius || 2.2, 32]} />
        ) : (
          <planeGeometry args={[width || 4, height || 3]} />
        )}
        {type === 'moonphase' ? (
          <meshStandardMaterial
            color="#1a2a4a"
            side={THREE.DoubleSide}
          />
        ) : (
          backgroundMaterialInstance ? (
            <primitive object={backgroundMaterialInstance} attach="material" />
          ) : (
            <meshStandardMaterial
              color="#ffffff"
              side={THREE.DoubleSide}
            />
          )
        )}
      </mesh>

      {/* Moonphase gold circle at 2 o'clock position */}
      {type === 'moonphase' && (
        <mesh position={[
          windowPosition[0] + (radius || 2.2) * 0.62 * Math.sin(Math.PI / 6),
          windowPosition[1] + (radius || 2.2) * 0.62 * Math.cos(Math.PI / 6),
          windowPosition[2] + 0.01
        ]} receiveShadow>
          <circleGeometry args={[(radius || 2.2) * 0.32, 32]} />
          <meshStandardMaterial
            color="#d4af37"
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

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