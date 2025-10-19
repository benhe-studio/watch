import { useState } from 'react'
import './ControlPanel.css'
import TabContent from './ui/TabContent'

function ControlPanel({ config, updateConfig, schema, onSave, onLoad, environmentLight, onToggleEnvironmentLight, debugView, onToggleDebugView }) {
  const [activeTab, setActiveTab] = useState(Object.keys(schema)[0] || '')
  const [expandedItems, setExpandedItems] = useState({})
  const [typeSelectionDropdown, setTypeSelectionDropdown] = useState(null)

  const toggleItem = (section, index) => {
    const key = `${section}-${index}`
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
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

  const toggleItemVisibility = (section, index) => {
    const newArray = [...config[section]]
    newArray[index] = {
      ...newArray[index],
      hidden: !newArray[index].hidden
    }
    updateConfig(section, null, newArray)
  }

  return (
    <div className="control-panel">
      <div className="control-panel-header">
        <h2>Watch Face Designer</h2>
        <div className="config-actions">
          <button
            onClick={onToggleEnvironmentLight}
            className="config-button"
            title={environmentLight ? "Turn off environment light" : "Turn on environment light"}
          >
            {environmentLight ? '☀️' : '🌙'}
          </button>
          <button
            onClick={onToggleDebugView}
            className="config-button"
            title={debugView ? "Hide debug view (axes & stats)" : "Show debug view (axes & stats)"}
          >
            {debugView ? '🐛' : '🔍'}
          </button>
          <button onClick={onSave} className="config-button">
            💾 Save Config
          </button>
          <button onClick={onLoad} className="config-button">
            📂 Load Config
          </button>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs-header">
          {Object.keys(schema).map(sectionKey => {
            const section = schema[sectionKey]
            return (
              <button
                key={sectionKey}
                className={`tab-button ${activeTab === sectionKey ? 'active' : ''}`}
                onClick={() => setActiveTab(sectionKey)}
              >
                {section.label}
              </button>
            )
          })}
        </div>

        {Object.keys(schema).map(sectionKey => {
          if (activeTab !== sectionKey) return null
          
          const section = schema[sectionKey]
          
          return (
            <TabContent
              key={sectionKey}
              sectionKey={sectionKey}
              section={section}
              config={config}
              updateConfig={updateConfig}
              expandedItems={expandedItems}
              toggleItem={toggleItem}
              typeSelectionDropdown={typeSelectionDropdown}
              setTypeSelectionDropdown={setTypeSelectionDropdown}
              createItemWithType={createItemWithType}
              removeItem={removeItem}
              updateArrayItem={updateArrayItem}
              toggleItemVisibility={toggleItemVisibility}
            />
          )
        })}
      </div>
    </div>
  )
}

export default ControlPanel