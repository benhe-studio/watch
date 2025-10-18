import { useState, useEffect, useRef } from 'react'
import './ControlPanel.css'

function ControlPanel({ config, updateConfig, schema, onSave, onLoad }) {
  const dropdownRef = useRef(null)
  const [expandedSections, setExpandedSections] = useState(
    Object.keys(schema).reduce((acc, key) => {
      acc[key] = schema[key].expanded || false
      return acc
    }, {})
  )

  const [expandedItems, setExpandedItems] = useState({})
  const [typeSelectionDropdown, setTypeSelectionDropdown] = useState(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setTypeSelectionDropdown(null)
      }
    }

    if (typeSelectionDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [typeSelectionDropdown])

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const toggleItem = (section, index) => {
    const key = `${section}-${index}`
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const toggleTypeSelection = (section) => {
    if (typeSelectionDropdown === section) {
      setTypeSelectionDropdown(null)
    } else {
      const sectionConfig = schema[section]
      const typeControl = sectionConfig.controls.type
      
      if (typeControl && typeControl.type === 'buttons' && typeControl.options) {
        setTypeSelectionDropdown(section)
      } else {
        // No type selection needed, create item directly
        createItemWithType(section, null)
      }
    }
  }

  const createItemWithType = (section, selectedType) => {
    const sectionConfig = schema[section]
    const defaultItem = {}
    
    // If a type was selected, set it first so getDefault can use it
    if (selectedType !== null) {
      defaultItem.type = selectedType
    }
    
    Object.keys(sectionConfig.controls).forEach(control => {
      const controlConfig = sectionConfig.controls[control]
      
      // Skip type if already set
      if (control === 'type' && selectedType !== null) {
        return
      }
      
      // Use getDefault function if available, otherwise use default value
      if (controlConfig.getDefault) {
        defaultItem[control] = controlConfig.getDefault(defaultItem)
      } else {
        defaultItem[control] = controlConfig.default
      }
    })
    
    const newArray = [...config[section], defaultItem]
    updateConfig(section, null, newArray)
    
    // Close dropdown
    setTypeSelectionDropdown(null)
  }

  const removeItem = (section, index) => {
    const newArray = config[section].filter((_, i) => i !== index)
    updateConfig(section, null, newArray)
  }

  const updateArrayItem = (section, index, controlKey, value) => {
    const newArray = [...config[section]]
    newArray[index] = {
      ...newArray[index],
      [controlKey]: value
    }
    updateConfig(section, null, newArray)
  }

  const renderControl = (section, controlKey, controlConfig, itemData = null, itemIndex = null) => {
    // For array items, check condition against the item data
    // For regular sections, check condition against the full config
    const conditionData = itemData || config
    
    if (controlConfig.condition && !controlConfig.condition(conditionData)) {
      return null
    }

    // Hide type field for array items since it's locked after creation
    if (itemData && controlKey === 'type' && controlConfig.type === 'buttons') {
      return null
    }

    const value = itemData ? itemData[controlKey] : config[section][controlKey]
    const onChange = itemData
      ? (newValue) => updateArrayItem(section, itemIndex, controlKey, newValue)
      : (newValue) => updateConfig(section, controlKey, newValue)

    switch (controlConfig.type) {
      case 'color':
        return (
          <div key={controlKey} className="control-group">
            <label>{controlConfig.label}</label>
            <input
              type="color"
              value={value}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
        )

      case 'range':
        const displayValue = value ?? controlConfig.default ?? 0
        return (
          <div key={controlKey} className="control-group">
            <label>{controlConfig.label}: {displayValue.toFixed(2)}</label>
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
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
              />
              <span>{controlConfig.label}</span>
            </label>
          </div>
        )

      case 'select':
        return (
          <div key={controlKey} className="control-group">
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

    case 'pointArray':
      const points = value || controlConfig.default || []
      
      const addPoint = () => {
        const newPoints = [...points, [0, 0]]
        onChange(newPoints)
      }
      
      const removePoint = (pointIndex) => {
        const newPoints = points.filter((_, i) => i !== pointIndex)
        onChange(newPoints)
      }
      
      const updatePoint = (pointIndex, coordIndex, newValue) => {
        const newPoints = [...points]
        newPoints[pointIndex] = [...newPoints[pointIndex]]
        newPoints[pointIndex][coordIndex] = newValue
        onChange(newPoints)
      }
      
      return (
        <div key={controlKey} className="control-group point-array-control">
          <label>{controlConfig.label}</label>
          {controlConfig.description && (
            <p className="control-description">{controlConfig.description}</p>
          )}
          <div className="points-list">
            {points.map((point, pointIndex) => (
              <div key={pointIndex} className="point-item">
                <div className="point-header">
                  <span>Point {pointIndex + 1}</span>
                  <button
                    className="remove-point-button"
                    onClick={() => removePoint(pointIndex)}
                    disabled={points.length <= 2}
                    title={points.length <= 2 ? "Need at least 2 points" : "Remove point"}
                  >
                    ✕
                  </button>
                </div>
                <div className="point-controls">
                  <div className="point-control">
                    <label>{controlConfig.xLabel || 'X'}: {point[0].toFixed(2)}</label>
                    <input
                      type="range"
                      min={controlConfig.xMin ?? 0}
                      max={controlConfig.xMax ?? 10}
                      step={controlConfig.xStep ?? 0.1}
                      value={point[0]}
                      onChange={(e) => updatePoint(pointIndex, 0, parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="point-control">
                    <label>{controlConfig.yLabel || 'Y'}: {point[1].toFixed(2)}</label>
                    <input
                      type="range"
                      min={controlConfig.yMin ?? 0}
                      max={controlConfig.yMax ?? 10}
                      step={controlConfig.yStep ?? 0.1}
                      value={point[1]}
                      onChange={(e) => updatePoint(pointIndex, 1, parseFloat(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="add-point-button" onClick={addPoint}>
            + Add Point
          </button>
        </div>
      )

    default:
      return null
  }
}

  const renderArraySection = (sectionKey, section) => {
    const items = config[sectionKey] || []
    const typeControl = section.controls.type
    const hasTypeSelection = typeControl && typeControl.type === 'buttons' && typeControl.options
    const isDropdownOpen = typeSelectionDropdown === sectionKey
    
    return (
      <div key={sectionKey} className="section">
        <div className="section-header" onClick={() => toggleSection(sectionKey)}>
          <h3>{section.label}</h3>
          <span className="toggle-icon">{expandedSections[sectionKey] ? '▼' : '▶'}</span>
        </div>
        {expandedSections[sectionKey] && (
          <div className="section-content">
            <div className={`add-item-container ${isDropdownOpen ? 'dropdown-active' : ''}`} ref={isDropdownOpen ? dropdownRef : null}>
              <button
                className="add-item-button"
                onClick={() => toggleTypeSelection(sectionKey)}
              >
                + Add {section.itemLabel || 'Item'}
              </button>
              
              {hasTypeSelection && isDropdownOpen && (
                <div className="type-dropdown">
                  {typeControl.options.map(option => (
                    <button
                      key={option.value}
                      className="type-dropdown-item"
                      onClick={() => createItemWithType(sectionKey, option.value)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {items.map((item, index) => {
              const itemKey = `${sectionKey}-${index}`
              const isExpanded = expandedItems[itemKey]
              
              return (
                <div key={index} className="array-item">
                  <div className="array-item-header" onClick={() => toggleItem(sectionKey, index)}>
                    <span>{section.itemLabel || 'Item'} {index + 1} ({item.type})</span>
                    <div className="array-item-actions">
                      <button
                        className="remove-item-button"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeItem(sectionKey, index)
                        }}
                      >
                        ✕
                      </button>
                      <span className="toggle-icon">{isExpanded ? '▼' : '▶'}</span>
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="array-item-content">
                      {Object.keys(section.controls).map(controlKey => 
                        renderControl(sectionKey, controlKey, section.controls[controlKey], item, index)
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const renderRegularSection = (sectionKey, section) => {
    return (
      <div key={sectionKey} className="section">
        <div className="section-header" onClick={() => toggleSection(sectionKey)}>
          <h3>{section.label}</h3>
          <span className="toggle-icon">{expandedSections[sectionKey] ? '▼' : '▶'}</span>
        </div>
        {expandedSections[sectionKey] && (
          <div className="section-content">
            {Object.keys(section.controls).map(controlKey => 
              renderControl(sectionKey, controlKey, section.controls[controlKey])
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="control-panel">
      <div className="control-panel-header">
        <h2>Watch Face Designer</h2>
        <div className="config-actions">
          <button onClick={onSave} className="config-button">
            💾 Save Config
          </button>
          <button onClick={onLoad} className="config-button">
            📂 Load Config
          </button>
        </div>
      </div>

      {Object.keys(schema).map(sectionKey => {
        const section = schema[sectionKey]
        
        if (section.isArray) {
          return renderArraySection(sectionKey, section)
        } else {
          return renderRegularSection(sectionKey, section)
        }
      })}
    </div>
  )
}

export default ControlPanel