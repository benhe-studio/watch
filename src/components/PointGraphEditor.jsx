import { useRef, useEffect, useState } from 'react'
import './PointGraphEditor.css'

function PointGraphEditor({ 
  points = [], 
  onChange, 
  xMin = 0, 
  xMax = 10, 
  yMin = 0, 
  yMax = 10,
  xLabel = 'X',
  yLabel = 'Y',
  minPoints = 2,
  description = ''
}) {
  const canvasRef = useRef(null)
  const [draggingIndex, setDraggingIndex] = useState(null)
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 300 })
  
  const padding = 40
  const pointRadius = 6
  const hoverRadius = 10

  // Convert point coordinates to canvas coordinates
  const pointToCanvas = (point) => {
    const [x, y] = point
    const canvasX = padding + ((x - xMin) / (xMax - xMin)) * (canvasSize.width - 2 * padding)
    const canvasY = canvasSize.height - padding - ((y - yMin) / (yMax - yMin)) * (canvasSize.height - 2 * padding)
    return { x: canvasX, y: canvasY }
  }

  // Convert canvas coordinates to point coordinates
  const canvasToPoint = (canvasX, canvasY) => {
    const x = xMin + ((canvasX - padding) / (canvasSize.width - 2 * padding)) * (xMax - xMin)
    const y = yMin + ((canvasSize.height - padding - canvasY) / (canvasSize.height - 2 * padding)) * (yMax - yMin)
    return [
      Math.max(xMin, Math.min(xMax, x)),
      Math.max(yMin, Math.min(yMax, y))
    ]
  }

  // Find point at canvas coordinates
  const findPointAtPosition = (canvasX, canvasY) => {
    for (let i = 0; i < points.length; i++) {
      const canvasPoint = pointToCanvas(points[i])
      const distance = Math.sqrt(
        Math.pow(canvasPoint.x - canvasX, 2) + 
        Math.pow(canvasPoint.y - canvasY, 2)
      )
      if (distance <= hoverRadius) {
        return i
      }
    }
    return null
  }

  // Draw the canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    
    // Set canvas size with device pixel ratio
    canvas.width = canvasSize.width * dpr
    canvas.height = canvasSize.height * dpr
    canvas.style.width = `${canvasSize.width}px`
    canvas.style.height = `${canvasSize.height}px`
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height)

    // Draw background
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height)

    // Draw grid
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1

    // Vertical grid lines
    const xSteps = 10
    for (let i = 0; i <= xSteps; i++) {
      const x = padding + (i / xSteps) * (canvasSize.width - 2 * padding)
      ctx.beginPath()
      ctx.moveTo(x, padding)
      ctx.lineTo(x, canvasSize.height - padding)
      ctx.stroke()
    }

    // Horizontal grid lines
    const ySteps = 10
    for (let i = 0; i <= ySteps; i++) {
      const y = padding + (i / ySteps) * (canvasSize.height - 2 * padding)
      ctx.beginPath()
      ctx.moveTo(padding, y)
      ctx.lineTo(canvasSize.width - padding, y)
      ctx.stroke()
    }

    // Draw axes
    ctx.strokeStyle = '#666'
    ctx.lineWidth = 2

    // Y-axis (x=0 line)
    const zeroX = pointToCanvas([0, 0]).x
    ctx.beginPath()
    ctx.moveTo(zeroX, padding)
    ctx.lineTo(zeroX, canvasSize.height - padding)
    ctx.stroke()

    // X-axis (y=0 line)
    const zeroY = pointToCanvas([0, 0]).y
    ctx.beginPath()
    ctx.moveTo(padding, zeroY)
    ctx.lineTo(canvasSize.width - padding, zeroY)
    ctx.stroke()

    // Draw axis labels
    ctx.fillStyle = '#999'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    
    // X-axis labels
    ctx.fillText(xMin.toFixed(1), padding, canvasSize.height - padding + 20)
    ctx.fillText(xMax.toFixed(1), canvasSize.width - padding, canvasSize.height - padding + 20)
    ctx.fillText(xLabel, canvasSize.width / 2, canvasSize.height - 10)
    
    // Y-axis labels
    ctx.textAlign = 'right'
    ctx.fillText(yMin.toFixed(1), padding - 10, canvasSize.height - padding + 5)
    ctx.fillText(yMax.toFixed(1), padding - 10, padding + 5)
    ctx.save()
    ctx.translate(15, canvasSize.height / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.fillText(yLabel, 0, 0)
    ctx.restore()

    // Draw shape outline
    if (points.length > 0) {
      ctx.strokeStyle = '#4a9eff'
      ctx.lineWidth = 2
      ctx.beginPath()
      
      const firstPoint = pointToCanvas(points[0])
      ctx.moveTo(firstPoint.x, firstPoint.y)
      
      for (let i = 1; i < points.length; i++) {
        const canvasPoint = pointToCanvas(points[i])
        ctx.lineTo(canvasPoint.x, canvasPoint.y)
      }
      
      ctx.stroke()
    }

    // Draw points
    points.forEach((point, index) => {
      const canvasPoint = pointToCanvas(point)
      
      // Draw point
      ctx.fillStyle = index === hoveredIndex ? '#ffaa00' : index === draggingIndex ? '#ff6600' : '#4a9eff'
      ctx.beginPath()
      ctx.arc(canvasPoint.x, canvasPoint.y, pointRadius, 0, Math.PI * 2)
      ctx.fill()
      
      // Draw point border
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 2
      ctx.stroke()
      
      // Draw point label
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${index + 1}`, canvasPoint.x, canvasPoint.y - 12)
      
      // Draw coordinates
      ctx.font = '10px sans-serif'
      ctx.fillStyle = '#aaa'
      ctx.fillText(`(${point[0].toFixed(1)}, ${point[1].toFixed(1)})`, canvasPoint.x, canvasPoint.y + 20)
    })
  }, [points, canvasSize, hoveredIndex, draggingIndex, xMin, xMax, yMin, yMax, xLabel, yLabel])

  // Mouse event handlers
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const pointIndex = findPointAtPosition(x, y)
    if (pointIndex !== null) {
      setDraggingIndex(pointIndex)
    }
  }

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (draggingIndex !== null) {
      // Update point position
      const newPoint = canvasToPoint(x, y)
      const newPoints = [...points]
      newPoints[draggingIndex] = newPoint
      onChange(newPoints)
    } else {
      // Update hover state
      const pointIndex = findPointAtPosition(x, y)
      setHoveredIndex(pointIndex)
    }
  }

  const handleMouseUp = () => {
    setDraggingIndex(null)
  }

  const handleMouseLeave = () => {
    setDraggingIndex(null)
    setHoveredIndex(null)
  }

  const handleDoubleClick = (e) => {
    if (draggingIndex !== null) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const pointIndex = findPointAtPosition(x, y)
    
    if (pointIndex !== null) {
      // Remove point if double-clicked and we have more than minimum
      if (points.length > minPoints) {
        const newPoints = points.filter((_, i) => i !== pointIndex)
        onChange(newPoints)
      }
    } else {
      // Add point if double-clicked on empty space
      const newPoint = canvasToPoint(x, y)
      const newPoints = [...points, newPoint]
      onChange(newPoints)
    }
  }

  const addPoint = () => {
    // Add point at center
    const centerX = (xMin + xMax) / 2
    const centerY = (yMin + yMax) / 2
    onChange([...points, [centerX, centerY]])
  }

  const removeLastPoint = () => {
    if (points.length > minPoints) {
      onChange(points.slice(0, -1))
    }
  }

  const clearPoints = () => {
    if (minPoints === 0) {
      onChange([])
    }
  }

  return (
    <div className="point-graph-editor">
      {description && <p className="graph-description">{description}</p>}
      
      <canvas
        ref={canvasRef}
        className="point-graph-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onDoubleClick={handleDoubleClick}
      />
      
      <div className="graph-controls">
        <button onClick={addPoint} className="graph-button">
          + Add Point
        </button>
        <button 
          onClick={removeLastPoint} 
          className="graph-button"
          disabled={points.length <= minPoints}
        >
          Remove Last
        </button>
        {minPoints === 0 && (
          <button 
            onClick={clearPoints} 
            className="graph-button"
            disabled={points.length === 0}
          >
            Clear All
          </button>
        )}
        <span className="point-count">{points.length} point{points.length !== 1 ? 's' : ''}</span>
      </div>
      
      <div className="graph-instructions">
        <strong>Instructions:</strong>
        <ul>
          <li>Drag points to move them</li>
          <li>Double-click empty space to add a point</li>
          <li>Double-click a point to remove it</li>
        </ul>
      </div>
    </div>
  )
}

export default PointGraphEditor