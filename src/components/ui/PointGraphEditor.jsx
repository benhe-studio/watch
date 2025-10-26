import { useRef, useEffect, useState } from 'react'
import './PointGraphEditor.css'

function PointGraphEditor({
  points = [],
  onChange,
  cutoutPoints = [],
  onCutoutChange,
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
  const containerRef = useRef(null)
  const [draggingIndex, setDraggingIndex] = useState(null)
  const [draggingType, setDraggingType] = useState(null) // 'points' or 'cutout'
  const [hoveredIndex, setHoveredIndex] = useState(null)
  const [hoveredType, setHoveredType] = useState(null) // 'points' or 'cutout'
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [selectedType, setSelectedType] = useState(null) // 'points' or 'cutout'
  const [canvasSize, setCanvasSize] = useState({ width: 300, height: 600 })
  
  const padding = 40
  const pointRadius = 6
  const hoverRadius = 10

  // Update canvas size based on container width
  useEffect(() => {
    const updateCanvasSize = () => {
      if (containerRef.current) {
        // Account for container padding (12px * 2 = 24px)
        const width = containerRef.current.clientWidth - 24
        setCanvasSize({ width, height: 600 })
      }
    }

    updateCanvasSize()

    const resizeObserver = new ResizeObserver(updateCanvasSize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

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
    // Check cutout points first (they should be on top)
    if (cutoutPoints && cutoutPoints.length > 0) {
      for (let i = 0; i < cutoutPoints.length; i++) {
        const canvasPoint = pointToCanvas(cutoutPoints[i])
        const distance = Math.sqrt(
          Math.pow(canvasPoint.x - canvasX, 2) +
          Math.pow(canvasPoint.y - canvasY, 2)
        )
        if (distance <= hoverRadius) {
          return { index: i, type: 'cutout' }
        }
      }
    }
    
    // Then check regular points
    for (let i = 0; i < points.length; i++) {
      const canvasPoint = pointToCanvas(points[i])
      const distance = Math.sqrt(
        Math.pow(canvasPoint.x - canvasX, 2) +
        Math.pow(canvasPoint.y - canvasY, 2)
      )
      if (distance <= hoverRadius) {
        return { index: i, type: 'points' }
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

    // Draw shape outline for regular points
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

    // Draw shape outline for cutout points
    if (cutoutPoints && cutoutPoints.length > 0) {
      ctx.strokeStyle = '#b366ff'
      ctx.lineWidth = 2
      ctx.beginPath()
      
      const firstPoint = pointToCanvas(cutoutPoints[0])
      ctx.moveTo(firstPoint.x, firstPoint.y)
      
      for (let i = 1; i < cutoutPoints.length; i++) {
        const canvasPoint = pointToCanvas(cutoutPoints[i])
        ctx.lineTo(canvasPoint.x, canvasPoint.y)
      }
      
      ctx.stroke()
    }

    // Draw regular points (blue)
    points.forEach((point, index) => {
      const canvasPoint = pointToCanvas(point)
      const isHovered = hoveredType === 'points' && index === hoveredIndex
      const isDragging = draggingType === 'points' && index === draggingIndex
      const isSelected = selectedType === 'points' && index === selectedIndex
      
      // Draw point
      ctx.fillStyle = isSelected ? '#ffdd00' : isHovered ? '#ffaa00' : isDragging ? '#ff6600' : '#4a9eff'
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

    // Draw cutout points (purple)
    if (cutoutPoints && cutoutPoints.length > 0) {
      cutoutPoints.forEach((point, index) => {
        const canvasPoint = pointToCanvas(point)
        const isHovered = hoveredType === 'cutout' && index === hoveredIndex
        const isDragging = draggingType === 'cutout' && index === draggingIndex
        const isSelected = selectedType === 'cutout' && index === selectedIndex
        
        // Draw point
        ctx.fillStyle = isSelected ? '#ffdd00' : isHovered ? '#d499ff' : isDragging ? '#9933ff' : '#b366ff'
        ctx.beginPath()
        ctx.arc(canvasPoint.x, canvasPoint.y, pointRadius, 0, Math.PI * 2)
        ctx.fill()
        
        // Draw point border
        ctx.strokeStyle = '#fff'
        ctx.lineWidth = 2
        ctx.stroke()
        
        // Draw point label with 'C' prefix for cutout
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 11px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`C${index + 1}`, canvasPoint.x, canvasPoint.y - 12)
        
        // Draw coordinates
        ctx.font = '10px sans-serif'
        ctx.fillStyle = '#aaa'
        ctx.fillText(`(${point[0].toFixed(1)}, ${point[1].toFixed(1)})`, canvasPoint.x, canvasPoint.y + 20)
      })
    }
  }, [points, cutoutPoints, canvasSize, hoveredIndex, hoveredType, draggingIndex, draggingType, selectedIndex, selectedType, xMin, xMax, yMin, yMax, xLabel, yLabel])

  // Mouse event handlers
  const handleMouseDown = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const result = findPointAtPosition(x, y)
    if (result !== null) {
      setDraggingIndex(result.index)
      setDraggingType(result.type)
      setSelectedIndex(result.index)
      setSelectedType(result.type)
    } else {
      setSelectedIndex(null)
      setSelectedType(null)
    }
  }

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (draggingIndex !== null && draggingType !== null) {
      // Update point position
      const newPoint = canvasToPoint(x, y)
      
      if (draggingType === 'points') {
        const newPoints = [...points]
        newPoints[draggingIndex] = newPoint
        onChange(newPoints)
      } else if (draggingType === 'cutout' && onCutoutChange) {
        const newCutoutPoints = [...cutoutPoints]
        newCutoutPoints[draggingIndex] = newPoint
        onCutoutChange(newCutoutPoints)
      }
    } else {
      // Update hover state
      const result = findPointAtPosition(x, y)
      if (result !== null) {
        setHoveredIndex(result.index)
        setHoveredType(result.type)
      } else {
        setHoveredIndex(null)
        setHoveredType(null)
      }
    }
  }

  const handleMouseUp = () => {
    setDraggingIndex(null)
    setDraggingType(null)
  }

  const handleMouseLeave = () => {
    setDraggingIndex(null)
    setDraggingType(null)
    setHoveredIndex(null)
    setHoveredType(null)
  }

  const addPoint = () => {
    let newX, newY
    
    if (points.length > 0) {
      // Use previous point's X and add 4 to Y (clamped to max)
      const lastPoint = points[points.length - 1]
      newX = lastPoint[0]
      newY = Math.min(lastPoint[1] + 4, yMax)
    } else {
      // First point: use center
      newX = (xMin + xMax) / 2
      newY = (yMin + yMax) / 2
    }
    
    onChange([...points, [newX, newY]])
  }

  const addCutoutPoint = () => {
    if (onCutoutChange) {
      let newX, newY
      
      if (cutoutPoints.length > 0) {
        // Use previous cutout point's X and add 4 to Y (clamped to max)
        const lastPoint = cutoutPoints[cutoutPoints.length - 1]
        newX = lastPoint[0]
        newY = Math.min(lastPoint[1] + 4, yMax)
      } else {
        // First cutout point: use center
        newX = (xMin + xMax) / 2
        newY = (yMin + yMax) / 2
      }
      
      onCutoutChange([...cutoutPoints, [newX, newY]])
    }
  }

  const removeSelectedPoint = () => {
    if (selectedIndex === null || selectedType === null) return
    
    if (selectedType === 'points' && points.length > minPoints) {
      const newPoints = points.filter((_, i) => i !== selectedIndex)
      onChange(newPoints)
      setSelectedIndex(null)
      setSelectedType(null)
    } else if (selectedType === 'cutout' && onCutoutChange) {
      const newCutoutPoints = cutoutPoints.filter((_, i) => i !== selectedIndex)
      onCutoutChange(newCutoutPoints)
      setSelectedIndex(null)
      setSelectedType(null)
    }
  }

  const updateSelectedPoint = (newX, newY) => {
    if (selectedIndex === null || selectedType === null) return
    
    const clampedX = Math.max(xMin, Math.min(xMax, newX))
    const clampedY = Math.max(yMin, Math.min(yMax, newY))
    
    if (selectedType === 'points') {
      const newPoints = [...points]
      newPoints[selectedIndex] = [clampedX, clampedY]
      onChange(newPoints)
    } else if (selectedType === 'cutout' && onCutoutChange) {
      const newCutoutPoints = [...cutoutPoints]
      newCutoutPoints[selectedIndex] = [clampedX, clampedY]
      onCutoutChange(newCutoutPoints)
    }
  }

  const selectedPoint = selectedIndex !== null && selectedType !== null
    ? (selectedType === 'points' ? points[selectedIndex] : cutoutPoints[selectedIndex])
    : null

  return (
    <div className="point-graph-editor" ref={containerRef}>
      {description && <p className="graph-description">{description}</p>}
      
      <div className="graph-controls">
        <button onClick={addPoint} className="graph-button">
          + Add Point
        </button>
        {onCutoutChange && (
          <button onClick={addCutoutPoint} className="graph-button graph-button-cutout">
            + Add Cutout Point
          </button>
        )}
      </div>
      
      <canvas
        ref={canvasRef}
        className="point-graph-canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      
      {selectedPoint && (
        <div className="point-editor">
          <div className="point-editor-header">
            <h4>
              {selectedType === 'points' ? 'Point' : 'Cutout Point'} {selectedIndex + 1}
            </h4>
            <button
              onClick={removeSelectedPoint}
              className="graph-button graph-button-delete"
              disabled={selectedType === 'points' && points.length <= minPoints}
            >
              Delete Point
            </button>
          </div>
          <div className="point-editor-controls">
            <div className="control-group">
              <div className="range-label-row">
                <label>{xLabel}:</label>
                <span className="range-value">{selectedPoint[0].toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={xMin}
                max={xMax}
                step={0.01}
                value={selectedPoint[0]}
                onChange={(e) => updateSelectedPoint(parseFloat(e.target.value), selectedPoint[1])}
              />
            </div>
            <div className="control-group">
              <div className="range-label-row">
                <label>{yLabel}:</label>
                <span className="range-value">{selectedPoint[1].toFixed(2)}</span>
              </div>
              <input
                type="range"
                min={yMin}
                max={yMax}
                step={0.01}
                value={selectedPoint[1]}
                onChange={(e) => updateSelectedPoint(selectedPoint[0], parseFloat(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}
      
    </div>
  )
}

export default PointGraphEditor