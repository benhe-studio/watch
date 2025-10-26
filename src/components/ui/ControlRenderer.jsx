import './PrimitiveControls.css'
import PointGraphEditor from './PointGraphEditor'
import BevelControl from './BevelControl'
import PositionControl from './PositionControl'

export function renderControl(
  controlKey,
  controlConfig,
  value,
  onChange,
  itemData = null,
  sectionKey = null,
  itemIndex = null,
  updateArrayItem = null
) {
  // For array items, check condition against the item data
  // For regular sections, check condition against the full config
  const conditionData = itemData || { [controlKey]: value }
  
  if (controlConfig.condition && !controlConfig.condition(conditionData)) {
    return null
  }

  // Hide type field for array items since it's locked after creation
  if (itemData && controlKey === 'type' && controlConfig.type === 'buttons') {
    return null
  }

  switch (controlConfig.type) {
    case 'color':
      return (
        <div key={controlKey} className="control-group">
          <div className="color-label-row">
            <label>{controlConfig.label}</label>
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        </div>
      )

    case 'range':
      const displayValue = value ?? controlConfig.default ?? 0
      return (
        <div key={controlKey} className="control-group">
          <div className="range-label-row">
            <label>{controlConfig.label}</label>
            <span className="range-value">{displayValue.toFixed(2)}</span>
          </div>
          <input
            type="range"
            min={controlConfig.min}
            max={controlConfig.max}
            step={controlConfig.step}
            value={displayValue}
            onChange={(e) => onChange(parseFloat(e.target.value))}
          />
        </div>
      )

    case 'buttons':
      return (
        <div key={controlKey} className="control-group">
          <label>{controlConfig.label}</label>
          <div className="button-group">
            {controlConfig.options.map(option => (
              <button
                key={option.value}
                className={value === option.value ? 'active' : ''}
                onClick={() => onChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )

    case 'checkbox':
      return (
        <div key={controlKey} className="control-group">
          <label className="checkbox-label">
            <span>{controlConfig.label}</span>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => onChange(e.target.checked)}
            />
          </label>
          {controlConfig.description && (
            <div className="control-description">{controlConfig.description}</div>
          )}
        </div>
      )

    case 'select':
      return (
        <div key={controlKey} className="control-group">
          <div className="select-label-row">
            <label>{controlConfig.label}</label>
            <select
              value={value}
              onChange={(e) => onChange(e.target.value)}
            >
              {controlConfig.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )

    case 'hourSelector':
      const hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      return (
        <div key={controlKey} className="control-group">
          <label>{controlConfig.label}</label>
          <div className="hour-selector">
            {hours.map(hour => (
              <button
                key={hour}
                className={value.includes(hour) ? 'active' : ''}
                onClick={() => {
                  const newValue = value.includes(hour)
                    ? value.filter(h => h !== hour)
                    : [...value, hour].sort((a, b) => {
                        // Sort with 12 first, then 1-11
                        if (a === 12) return -1
                        if (b === 12) return 1
                        return a - b
                      })
                  onChange(newValue)
                }}
              >
                {hour}
              </button>
            ))}
          </div>
        </div>
      )

    case 'text':
      return (
        <div key={controlKey} className="control-group">
          <label>{controlConfig.label}</label>
          {controlConfig.description && (
            <div className="control-description">{controlConfig.description}</div>
          )}
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={controlConfig.placeholder || ''}
          />
        </div>
      )

    case 'pointArray':
      const points = value || controlConfig.default || []
      
      // Check if this is the 'points' control and if there's a corresponding 'cutoutPoints' control
      let cutoutPoints = []
      let onCutoutChange = null
      
      if (controlKey === 'points' && itemData && itemData.cutoutPoints !== undefined) {
        cutoutPoints = itemData.cutoutPoints || []
        onCutoutChange = (newCutoutPoints) => {
          updateArrayItem(sectionKey, itemIndex, 'cutoutPoints', newCutoutPoints)
        }
      }
      
      return (
        <div key={controlKey} className="control-group point-array-control">
          <label>{controlConfig.label}</label>
          <PointGraphEditor
            points={points}
            onChange={onChange}
            cutoutPoints={cutoutPoints}
            onCutoutChange={onCutoutChange}
            xMin={controlConfig.xMin ?? 0}
            xMax={controlConfig.xMax ?? 10}
            yMin={controlConfig.yMin ?? 0}
            yMax={controlConfig.yMax ?? 10}
            xLabel={controlConfig.xLabel || 'X'}
            yLabel={controlConfig.yLabel || 'Y'}
            minPoints={controlConfig.minPoints ?? 2}
            description={controlConfig.description}
          />
        </div>
      )

    case 'bevel':
      return (
        <div key={controlKey} className="control-group">
          <BevelControl
            value={value}
            onChange={onChange}
            config={controlConfig}
          />
        </div>
      )

    case 'position':
      return (
        <div key={controlKey} className="control-group">
          <PositionControl
            value={value}
            onChange={onChange}
            config={controlConfig}
          />
        </div>
      )

    case 'image':
      return (
        <div key={controlKey} className="control-group">
          <label>{controlConfig.label}</label>
          {controlConfig.description && (
            <div className="control-description">{controlConfig.description}</div>
          )}
          <div className="image-upload-container">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onload = (event) => {
                    onChange(event.target.result)
                  }
                  reader.readAsDataURL(file)
                }
              }}
              style={{ display: 'block', marginBottom: '8px' }}
            />
            {value && (
              <div className="image-preview">
                <img
                  src={value}
                  alt="Texture preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '150px',
                    objectFit: 'contain',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
                <button
                  onClick={() => onChange(null)}
                  className="clear-image-button"
                  style={{
                    marginTop: '8px',
                    padding: '4px 8px',
                    fontSize: '12px'
                  }}
                >
                  Clear Image
                </button>
              </div>
            )}
          </div>
        </div>
      )

    default:
      return null
  }
}