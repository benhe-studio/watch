import { useRef, useEffect } from 'react'
import './TabContent.css'
import PointGraphEditor from '../PointGraphEditor'

function TabContent({ 
  sectionKey, 
  section, 
  config, 
  updateConfig,
  expandedItems,
  toggleItem,
  typeSelectionDropdown,
  setTypeSelectionDropdown,
  createItemWithType,
  removeItem,
  updateArrayItem,
  toggleItemVisibility
}) {
  const dropdownRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setTypeSelectionDropdown(null)
      }
    }

    if (typeSelectionDropdown === sectionKey) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [typeSelectionDropdown, sectionKey, setTypeSelectionDropdown])

  const toggleTypeSelection = () => {
    if (typeSelectionDropdown === sectionKey) {
      setTypeSelectionDropdown(null)
    } else {
      const typeControl = section.controls.type
      
      if (typeControl && typeControl.type === 'buttons' && typeControl.options) {
        setTypeSelectionDropdown(sectionKey)
      } else {
        // No type selection needed, create item directly
        createItemWithType(sectionKey, null)
      }
    }
  }

  const renderControl = (controlKey, controlConfig, itemData = null, itemIndex = null) => {
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

    const value = itemData ? itemData[controlKey] : config[sectionKey][controlKey]
    const onChange = itemData
      ? (newValue) => updateArrayItem(sectionKey, itemIndex, controlKey, newValue)
      : (newValue) => updateConfig(sectionKey, controlKey, newValue)

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

    default:
      return null
  }
}

  if (section.isArray) {
    const items = config[sectionKey] || []
    const typeControl = section.controls.type
    const hasTypeSelection = typeControl && typeControl.type === 'buttons' && typeControl.options
    const isDropdownOpen = typeSelectionDropdown === sectionKey
    
    return (
      <div className="tab-content">
        <div className={`add-item-container ${isDropdownOpen ? 'dropdown-active' : ''}`} ref={isDropdownOpen ? dropdownRef : null}>
          <button
            className="add-item-button"
            onClick={toggleTypeSelection}
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
                <span>{section.itemLabel || 'Item'} {index + 1} ({item.type}){item.hidden ? ' (Hidden)' : ''}</span>
                <div className="array-item-actions">
                  <button
                    className="hide-item-button"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleItemVisibility(sectionKey, index)
                    }}
                    title={item.hidden ? "Show item" : "Hide item"}
                  >
                    {item.hidden ? '👁️' : '🙈'}
                  </button>
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
                    renderControl(controlKey, section.controls[controlKey], item, index)
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  } else {
    return (
      <div className="tab-content">
        {Object.keys(section.controls).map(controlKey => 
          renderControl(controlKey, section.controls[controlKey])
        )}
      </div>
    )
  }
}

export default TabContent