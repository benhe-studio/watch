import './BevelControl.css'
import './PrimitiveControls.css'

/**
 * BevelControl - A grouped UI component for controlling bevel settings
 * Renders enable checkbox and sub-controls for thickness, size, and segments
 */
function BevelControl({ value, onChange, config }) {
  const bevelValue = value || {
    enabled: config.default.enabled,
    thickness: config.default.thickness,
    size: config.default.size,
    segments: config.default.segments
  }

  const handleChange = (field, newValue) => {
    onChange({
      ...bevelValue,
      [field]: newValue
    })
  }

  return (
    <div className="bevel-control">
      <div className="bevel-control-header">
        <label className="checkbox-label">
          <span>{config.label}</span>
          <input
            type="checkbox"
            checked={bevelValue.enabled}
            onChange={(e) => handleChange('enabled', e.target.checked)}
          />
        </label>
        <div className="control-description">
          Enable this to add a chamfer or a roundover to the edges of the element
        </div>
      </div>
      
      {bevelValue.enabled && (
        <div className="bevel-control-body">
          <div className="bevel-control-item">
            <div className="range-label-row">
              <label>Thickness</label>
              <span className="range-value">{bevelValue.thickness.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={config.config.thickness.min}
              max={config.config.thickness.max}
              step={config.config.thickness.step}
              value={bevelValue.thickness}
              onChange={(e) => handleChange('thickness', parseFloat(e.target.value))}
            />
          </div>
          
          <div className="bevel-control-item">
            <div className="range-label-row">
              <label>Size</label>
              <span className="range-value">{bevelValue.size.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={config.config.size.min}
              max={config.config.size.max}
              step={config.config.size.step}
              value={bevelValue.size}
              onChange={(e) => handleChange('size', parseFloat(e.target.value))}
            />
          </div>
          
          <div className="bevel-control-item">
            <div className="range-label-row">
              <label>Segments</label>
              <span className="range-value">{bevelValue.segments}</span>
            </div>
            <input
              type="range"
              min={config.config.segments.min}
              max={config.config.segments.max}
              step={config.config.segments.step}
              value={bevelValue.segments}
              onChange={(e) => handleChange('segments', parseInt(e.target.value))}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default BevelControl