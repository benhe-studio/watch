import { useState } from 'react'
import './ControlPanel.css'

function ControlPanel({ config, updateConfig, schema }) {
  const [expandedSections, setExpandedSections] = useState(
    Object.keys(schema).reduce((acc, key) => {
      acc[key] = schema[key].expanded || false
      return acc
    }, {})
  )

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const renderControl = (section, controlKey, controlConfig) => {
    // Check if control should be shown based on condition
    if (controlConfig.condition && !controlConfig.condition(config)) {
      return null
    }

    const value = config[section][controlKey]

    switch (controlConfig.type) {
      case 'color':
        return (
          <div key={controlKey} className="control-group">
            <label>{controlConfig.label}</label>
            <input
              type="color"
              value={value}
              onChange={(e) => updateConfig(section, controlKey, e.target.value)}
            />
          </div>
        )

      case 'range':
        return (
          <div key={controlKey} className="control-group">
            <label>{controlConfig.label}: {value.toFixed(2)}</label>
            <input
              type="range"
              min={controlConfig.min}
              max={controlConfig.max}
              step={controlConfig.step}
              value={value}
              onChange={(e) => updateConfig(section, controlKey, parseFloat(e.target.value))}
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
                  onClick={() => updateConfig(section, controlKey, option.value)}
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
                onChange={(e) => updateConfig(section, controlKey, e.target.checked)}
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
              onChange={(e) => updateConfig(section, controlKey, e.target.value)}
            >
              {controlConfig.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="control-panel">
      <h2>Watch Face Designer</h2>

      {Object.keys(schema).map(sectionKey => {
        const section = schema[sectionKey]
        
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
      })}
    </div>
  )
}

export default ControlPanel