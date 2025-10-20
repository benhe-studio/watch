import './PositionControl.css'

/**
 * PositionControl - A grouped UI component for controlling position settings
 * Renders controls for vector (clock hour) and offset (distance from center)
 */
function PositionControl({ value, onChange, config }) {
  const positionValue = value || {
    vector: config.default.vector,
    offset: config.default.offset
  }

  const handleChange = (field, newValue) => {
    onChange({
      ...positionValue,
      [field]: newValue
    })
  }

  return (
    <div className="position-control">
      <div className="position-control-header">
        <label className="position-control-label">{config.label}</label>
        <div className="position-control-description">
          Configure the element's position using clock hour direction and distance from center
        </div>
      </div>
      
      <div className="position-control-body">
        <div className="position-control-item">
          <label>
            Position Vector (Clock Hour): {positionValue.vector.toFixed(1)}
          </label>
          <input
            type="range"
            min={config.config.vector.min}
            max={config.config.vector.max}
            step={config.config.vector.step}
            value={positionValue.vector}
            onChange={(e) => handleChange('vector', parseFloat(e.target.value))}
          />
        </div>
        
        <div className="position-control-item">
          <label>
            Offset from Center: {positionValue.offset.toFixed(1)}
          </label>
          <input
            type="range"
            min={config.config.offset.min}
            max={config.config.offset.max}
            step={config.config.offset.step}
            value={positionValue.offset}
            onChange={(e) => handleChange('offset', parseFloat(e.target.value))}
          />
        </div>
      </div>
    </div>
  )
}

export default PositionControl