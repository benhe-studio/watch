import * as THREE from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Static extrude settings shared by parametric flat and circle hand types
export const HAND_DEPTH = 0.2
export const HAND_BEVEL_SETTINGS = {
  enabled: true,
  thickness: 0.05,
  size: 0.05,
  segments: 4
}
export const HAND_EXTRUDE_SETTINGS = {
  depth: HAND_DEPTH,
  bevelEnabled: HAND_BEVEL_SETTINGS.enabled,
  bevelThickness: HAND_BEVEL_SETTINGS.thickness,
  bevelSize: HAND_BEVEL_SETTINGS.size,
  bevelSegments: HAND_BEVEL_SETTINGS.segments
}

// Helper function to ensure points start and end at x=0
const ensurePointsAtCenterLine = (pointsList) => {
  if (!pointsList || pointsList.length === 0) return pointsList
  
  const processed = [...pointsList]
  
  // Check first point - if x is not 0, add a point at x=0 with same y
  if (processed[0][0] !== 0) {
    processed.unshift([0, processed[0][1]])
  }
  
  // Check last point - if x is not 0, add a point at x=0 with same y
  const lastIdx = processed.length - 1
  if (processed[lastIdx][0] !== 0) {
    processed.push([0, processed[lastIdx][1]])
  }
  
  return processed
}

// Geometry generator functions - return THREE.BufferGeometry
export const geometryGenerators = {
  parametricFlat: ({ points, cutout, cutoutPoints, lumeCutout }) => {
    // Default points if none provided - creates a simple tapered hand
    // Y=0 represents the pivot point, negative Y extends towards the tail
    const defaultPoints = [
      [0, -4],   // Tail end (below pivot)
      [1.2, 0],    // Widen
      [0, 14],   // End at tip
    ]
    
    const shapePoints = points || defaultPoints
    
    // Process shape points to ensure they start and end at x=0
    const processedShapePoints = ensurePointsAtCenterLine(shapePoints)
    
    // Check if we have cutout points to process (need at least 2 points for a valid cutout)
    const hasCutout = cutoutPoints && cutoutPoints.length >= 2
    
    // Process cutout points only if we have a valid cutout
    const processedCutoutPoints = hasCutout ? ensurePointsAtCenterLine(cutoutPoints) : null
    
    // Create the shape by mirroring points across the center line
    // Create shape pointing up in positive Y (will be rotated to Z)
    const shape = new THREE.Shape()
    
    if (hasCutout) {
      // Trace the shape: start at first shape point, go through all shape points,
      // then back through cutout points in reverse
      shape.moveTo(processedShapePoints[0][0], processedShapePoints[0][1])
      
      // Draw through all shape points
      for (let i = 1; i < processedShapePoints.length; i++) {
        shape.lineTo(processedShapePoints[i][0], processedShapePoints[i][1])
      }
      
      // Mirror back down the left side (negative x)
      for (let i = processedShapePoints.length - 1; i >= 0; i--) {
        shape.lineTo(-processedShapePoints[i][0], processedShapePoints[i][1])
      }
      
      // Close the outer shape
      shape.closePath()
      
      // Now create the cutout hole
      const hole = new THREE.Path()
      
      // Start at first cutout point
      hole.moveTo(processedCutoutPoints[0][0], processedCutoutPoints[0][1])
      
      // Draw through all cutout points
      for (let i = 1; i < processedCutoutPoints.length; i++) {
        hole.lineTo(processedCutoutPoints[i][0], processedCutoutPoints[i][1])
      }
      
      // Mirror back down the left side (negative x)
      for (let i = processedCutoutPoints.length - 1; i >= 0; i--) {
        hole.lineTo(-processedCutoutPoints[i][0], processedCutoutPoints[i][1])
      }
      
      // Close the hole path
      hole.closePath()
      
      shape.holes.push(hole)
    } else {
      // No cutout - use simple mirrored shape
      // Start at the first point
      shape.moveTo(processedShapePoints[0][0], processedShapePoints[0][1])
      
      // Draw the right side (positive x, positive y)
      for (let i = 1; i < processedShapePoints.length; i++) {
        shape.lineTo(processedShapePoints[i][0], processedShapePoints[i][1])
      }
      
      // Mirror back down the left side (negative x), including the last point
      for (let i = processedShapePoints.length - 1; i >= 0; i--) {
        shape.lineTo(-processedShapePoints[i][0], processedShapePoints[i][1])
      }
    }
    
    const geometry = new THREE.ExtrudeGeometry(shape, HAND_EXTRUDE_SETTINGS)
    
    // Center the geometry on the z-axis (depth axis)
    geometry.translate(0, 0, -HAND_DEPTH / 2)
    
    // Return both the main geometry and lume geometry if needed
    return { geometry, lumeCutout, cutoutPoints: hasCutout ? processedCutoutPoints : null }
  },
  
  parametricFaceted: ({ points, cutout, cutoutPoints, lumeCutout }) => {
    // Default points if none provided
    const defaultPoints = [
      [0.3, -2],   // Tail end (below pivot)
      [0.5, 0],    // Widen at pivot point
      [0.3, 14],   // Taper towards tip
      [0, 18]      // End at tip
    ]
    
    const shapePoints = points || defaultPoints
    
    // Process shape points to ensure they start and end at x=0
    const processedShapePoints = ensurePointsAtCenterLine(shapePoints)
    
    // Extrusion depth - fixed at 0.1 for parametric faceted hands
    const extrudeDepth = 0.1
    
    // Rotation angle for tilting the outer edges down (in radians)
    const tiltAngle = Math.PI / 12 // 15 degrees
    
    // Check if we have cutout points to process
    const hasCutout = cutoutPoints && cutoutPoints.length >= 2
    
    // Process cutout points if they exist
    const processedCutoutPoints = hasCutout ? ensurePointsAtCenterLine(cutoutPoints) : null
    
    // Create the right half shape
    const rightShape = new THREE.Shape()
    
    if (hasCutout) {
      // Trace the shape: start at first shape point, go through all shape points,
      // then back through cutout points in reverse
      rightShape.moveTo(processedShapePoints[0][0], processedShapePoints[0][1])
      
      // Draw through all shape points
      for (let i = 1; i < processedShapePoints.length; i++) {
        rightShape.lineTo(processedShapePoints[i][0], processedShapePoints[i][1])
      }
      
      // Now trace back through cutout points in reverse
      for (let i = processedCutoutPoints.length - 1; i >= 0; i--) {
        rightShape.lineTo(processedCutoutPoints[i][0], processedCutoutPoints[i][1])
      }
      
      // Close the shape
      rightShape.closePath()
    } else {
      // No cutout - trace through shape points
      rightShape.moveTo(processedShapePoints[0][0], processedShapePoints[0][1])
      
      // Draw through all shape points
      for (let i = 1; i < processedShapePoints.length; i++) {
        rightShape.lineTo(processedShapePoints[i][0], processedShapePoints[i][1])
      }
      
      // Close the shape
      rightShape.closePath()
    }
    
    // Create the left half shape (mirrored)
    const leftShape = new THREE.Shape()
    
    if (hasCutout) {
      // Trace the shape: start at first shape point (mirrored), go through all shape points,
      // then back through cutout points in reverse
      leftShape.moveTo(-processedShapePoints[0][0], processedShapePoints[0][1])
      
      // Draw through all mirrored shape points
      for (let i = 1; i < processedShapePoints.length; i++) {
        leftShape.lineTo(-processedShapePoints[i][0], processedShapePoints[i][1])
      }
      
      // Now trace back through mirrored cutout points in reverse
      for (let i = processedCutoutPoints.length - 1; i >= 0; i--) {
        leftShape.lineTo(-processedCutoutPoints[i][0], processedCutoutPoints[i][1])
      }
      
      // Close the shape
      leftShape.closePath()
    } else {
      // No cutout - trace through mirrored shape points
      leftShape.moveTo(-processedShapePoints[0][0], processedShapePoints[0][1])
      
      // Draw through all mirrored shape points
      for (let i = 1; i < processedShapePoints.length; i++) {
        leftShape.lineTo(-processedShapePoints[i][0], processedShapePoints[i][1])
      }
      
      // Close the shape
      leftShape.closePath()
    }
    
    // Extrude settings
    const extrudeSettings = {
      depth: extrudeDepth,
      bevelEnabled: false
    }
    
    // Create extruded geometries for both halves
    const rightGeometry = new THREE.ExtrudeGeometry(rightShape, extrudeSettings)
    const leftGeometry = new THREE.ExtrudeGeometry(leftShape, extrudeSettings)
    
    // Center both on the z-axis initially
    rightGeometry.translate(0, 0, -extrudeDepth / 2)
    leftGeometry.translate(0, 0, -extrudeDepth / 2)
    
    // Now rotate each half about the top edge (at z = extrudeDepth/2)
    // We need to: translate to move rotation axis to origin, rotate, translate back
    
    // For right half: rotate counter-clockwise (positive) around Y-axis
    // Move top edge to origin (the top surface is at -extrudeDepth/2 after centering)
    rightGeometry.translate(0, 0, -extrudeDepth / 2)
    // Rotate around Y-axis (tilts outer edge down)
    const rightMatrix = new THREE.Matrix4()
    rightMatrix.makeRotationY(tiltAngle)
    rightGeometry.applyMatrix4(rightMatrix)
    // Move back
    rightGeometry.translate(0, 0, extrudeDepth / 2)
    
    // For left half: rotate clockwise (negative) around Y-axis
    // Move top edge to origin (the top surface is at -extrudeDepth/2 after centering)
    leftGeometry.translate(0, 0, -extrudeDepth / 2)
    // Rotate around Y-axis (tilts outer edge down)
    const leftMatrix = new THREE.Matrix4()
    leftMatrix.makeRotationY(-tiltAngle)
    leftGeometry.applyMatrix4(leftMatrix)
    // Move back
    leftGeometry.translate(0, 0, extrudeDepth / 2)
    
    // Merge both geometries using THREE.js utility
    const mergedGeometry = mergeGeometries([rightGeometry, leftGeometry])
    
    // Return both the main geometry and lume geometry if needed
    return { geometry: mergedGeometry, lumeCutout, cutoutPoints: hasCutout ? processedCutoutPoints : null, shapePoints: processedShapePoints }
  }
}