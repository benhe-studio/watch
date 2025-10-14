import { useState } from 'react'
import './ControlPanel.css'

function ControlPanel({ config, updateConfig }) {
  const [expandedSections, setExpandedSections] = useState({
    face: true,
    markers: true,
    hands: true
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className="control-panel">
      <h2>Watch Face Designer</h2>

      {/* Face Section */}
      <div className="section">
        <div className="section-header" onClick={() => toggleSection('face')}>
          <h3>Face</h3>
          <span className="toggle-icon">{expandedSections.face ? '▼' : '▶'}</span>
        </div>
        {expandedSections.face && (
          <div className="section-content">
            <div className="control-group">
              <label>Color</label>
              <input
                type="color"
                value={config.face.color}
                onChange={(e) => updateConfig('face', 'color', e.target.value)}
              />
            </div>
            <div className="control-group">
              <label>Smoothness: {config.face.smoothness.toFixed(2)}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={config.face.smoothness}
                onChange={(e) => updateConfig('face', 'smoothness', parseFloat(e.target.value))}
              />
            </div>
            <div className="control-group">
              <label>Metallic: {config.face.metallic.toFixed(2)}</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={config.face.metallic}
                onChange={(e) => updateConfig('face', 'metallic', parseFloat(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>

      {/* Markers Section */}
      <div className="section">
        <div className="section-header" onClick={() => toggleSection('markers')}>
          <h3>Markers</h3>
          <span className="toggle-icon">{expandedSections.markers ? '▼' : '▶'}</span>
        </div>
        {expandedSections.markers && (
          <div className="section-content">
            <div className="control-group">
              <label>Type</label>
              <div className="button-group">
                <button
                  className={config.markers.type === 'arabic' ? 'active' : ''}
                  onClick={() => updateConfig('markers', 'type', 'arabic')}
                >
                  Arabic
                </button>
                <button
                  className={config.markers.type === 'roman' ? 'active' : ''}
                  onClick={() => updateConfig('markers', 'type', 'roman')}
                >
                  Roman
                </button>
                <button
                  className={config.markers.type === 'blocks' ? 'active' : ''}
                  onClick={() => updateConfig('markers', 'type', 'blocks')}
                >
                  Blocks
                </button>
              </div>
            </div>
            {config.markers.type === 'arabic' && (
              <div className="control-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={config.markers.rotate}
                    onChange={(e) => updateConfig('markers', 'rotate', e.target.checked)}
                  />
                  <span>Rotate</span>
                </label>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hands Section */}
      <div className="section">
        <div className="section-header" onClick={() => toggleSection('hands')}>
          <h3>Hands</h3>
          <span className="toggle-icon">{expandedSections.hands ? '▼' : '▶'}</span>
        </div>
        {expandedSections.hands && (
          <div className="section-content">
            <div className="control-group">
              <label>Profile</label>
              <div className="button-group">
                <button
                  className={config.hands.profile === 'classic' ? 'active' : ''}
                  onClick={() => updateConfig('hands', 'profile', 'classic')}
                >
                  Classic
                </button>
                <button
                  className={config.hands.profile === 'modern' ? 'active' : ''}
                  onClick={() => updateConfig('hands', 'profile', 'modern')}
                >
                  Modern
                </button>
                <button
                  className={config.hands.profile === 'minimal' ? 'active' : ''}
                  onClick={() => updateConfig('hands', 'profile', 'minimal')}
                >
                  Minimal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ControlPanel