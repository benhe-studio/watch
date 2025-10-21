import './PositionControl.css'
import './PrimitiveControls.css'

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
        <label>{config.label}</label>
        <div className="position-control-description">
          Configure the element's position using clock hour direction and distance from center
        </div>
      </div>
      
      <div className="position-control-body">
        <div className="position-control-item">
          <div className="range-label-row">
            <label>Position Vector (Clock Hour)</label>
            <span className="range-value">{positionValue.vector.toFixed(1)}</span>
          </div>
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
          <div className="range-label-row">
            <label>Offset from Center</label>
            <span className="range-value">{positionValue.offset.toFixed(1)}</span>
          </div>
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