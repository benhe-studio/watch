import { useState, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Stats } from '@react-three/drei'
import * as THREE from 'three'
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js'
import WatchFace from './components/WatchFace'
import ControlPanel from './components/ControlPanel'
import { watchConfig, generateInitialState } from './config/watchConfig'
import { updateMaterialProperties } from './config/helpers/materials'
import {
  SunIcon,
  MoonIcon,
  BugAntIcon,
  ArrowDownTrayIcon,
  FolderOpenIcon,
  TrashIcon,
  CubeIcon,
  PlayIcon,
  PauseIcon,
  RectangleStackIcon
} from '@heroicons/react/24/outline'
import './App.css'

// Component to capture the scene reference
function SceneCapture({ sceneRef }) {
  const { scene } = useThree()
  useEffect(() => {
    sceneRef.current = scene
  }, [scene, sceneRef])
  return null
}

function App() {
  const [config, setConfig] = useState(generateInitialState(watchConfig))
  const [isLoading, setIsLoading] = useState(true)
  const [environmentLight, setEnvironmentLight] = useState(true)
  const [debugView, setDebugView] = useState(false)
  const [showPresetMenu, setShowPresetMenu] = useState(false)
  const sceneRef = useRef(null)
  
  // Time control state
  const [isTimeStopped, setIsTimeStopped] = useState(false)

  // Available presets
  const presets = ['diver', 'dress', 'chrono']

  // Close preset menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showPresetMenu && !event.target.closest('.preset-menu-container')) {
        setShowPresetMenu(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPresetMenu])

  // Load default config on mount
  useEffect(() => {
    const loadDefaultConfig = async () => {
      try {
        const response = await fetch('/diver.json')
        if (response.ok) {
          const defaultConfig = await response.json()
          setConfig(defaultConfig)
        }
      } catch (error) {
        console.log('No default config found, using generated initial state')
      } finally {
        setIsLoading(false)
      }
    }
    
    loadDefaultConfig()
  }, [])

  // Update lume material emissive color and theme based on environmentLight
  useEffect(() => {
    // Set theme attribute on document root
    document.documentElement.setAttribute('data-theme', environmentLight ? 'light' : 'dark')
    
    if (environmentLight) {
      // Revert to original teal color when light is on
      updateMaterialProperties('lume', {
        emissive: '#7ddfb9',
        emissiveIntensity: 20.0
      })
    } else {
      // Change to brighter teal when light is off
      updateMaterialProperties('lume', {
        emissive: '#00ffff',
        emissiveIntensity: 30.0
      })
    }
  }, [environmentLight])

  const updateConfig = (section, key, value) => {
    setConfig(prev => {
      // If key is null, we're updating the entire section (for arrays)
      if (key === null) {
        return {
          ...prev,
          [section]: value
        }
      }
      
      // Otherwise, update a specific key in the section object
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      }
    })
  }

  const saveConfig = () => {
    const dataStr = JSON.stringify(config, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'watch-config.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const loadConfig = async (presetName) => {
    if (!confirm('Loading a preset will clear the current configuration and any changes will be lost. Continue?')) {
      setShowPresetMenu(false)
      return
    }
    
    try {
      const response = await fetch(`/${presetName}.json`)
      if (response.ok) {
        const loadedConfig = await response.json()
        setConfig(loadedConfig)
        setShowPresetMenu(false)
      } else {
        alert(`Error loading preset: ${presetName}`)
      }
    } catch (error) {
      alert('Error loading preset: ' + error.message)
    }
  }

  const togglePresetMenu = () => {
    setShowPresetMenu(!showPresetMenu)
  }

  const clearConfig = () => {
    if (confirm('Are you sure you want to clear all elements? This will remove all markers, hands, primitives, and other items.')) {
      const clearedConfig = {}
      Object.keys(watchConfig).forEach(sectionKey => {
        const section = watchConfig[sectionKey]
        if (section.isArray) {
          clearedConfig[sectionKey] = []
        } else {
          clearedConfig[sectionKey] = { ...config[sectionKey] }
        }
      })
      
      // Reset face material to polished silver
      if (clearedConfig.face) {
        clearedConfig.face.material = 'matteWhite'
      }
      
      // Disable bezel
      if (clearedConfig.bezel) {
        clearedConfig.bezel.bezel = false
      }
      
      setConfig(clearedConfig)
    }
  }

  const exportGLB = () => {
    if (!sceneRef.current) {
      alert('Scene not ready for export')
      return
    }

    const exporter = new GLTFExporter()
    
    // Find the watch face group in the scene
    const watchGroup = sceneRef.current.children.find(child => child.name === 'watch-face-group')
    
    if (!watchGroup) {
      alert('Watch face not found in scene')
      return
    }

    exporter.parse(
      watchGroup,
      (gltf) => {
        const blob = new Blob([gltf], { type: 'application/octet-stream' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'watch-face.glb'
        link.click()
        URL.revokeObjectURL(url)
      },
      (error) => {
        console.error('Error exporting GLB:', error)
        alert('Error exporting GLB: ' + error.message)
      },
      { binary: true }
    )
  }

  if (isLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh' }}>Loading...</div>
  }

  return (
    <>
      <div className="app-container" style={{ display: 'flex', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div className="canvas-container" style={{ flex: 1, minWidth: 0, background: environmentLight ? '#e8e8e8' : '#000000', position: 'relative' }}>
        <Canvas shadows camera={{ position: [0, -20, 60], fov: 50 }}>
          <SceneCapture sceneRef={sceneRef} />
          <color attach="background" args={[environmentLight ? '#e8e8e8' : '#000000']} />
          
          {environmentLight && (
            <directionalLight
              position={[40, 40, 40]}
              intensity={2}
              castShadow
              shadow-mapSize={[2048, 2048]}
              shadow-camera-left={-50}
              shadow-camera-right={50}
              shadow-camera-top={50}
              shadow-camera-bottom={-50}
              shadow-camera-near={0.1}
              shadow-camera-far={100}
            />
          )}
          
          {/* Environment for realistic metallic reflections */}
          {environmentLight && <Environment preset="apartment" environmentIntensity={0.2}/>}
          
          {/* Axis helper to show X (red), Y (green), Z (blue) - only visible in debug mode */}
          {debugView && <primitive object={new THREE.AxesHelper(30)} />}
          
          <WatchFace
            config={config}
            environmentLight={environmentLight}
            isTimeStopped={isTimeStopped}
          />
          <OrbitControls enablePan={false} />
          {debugView && <Stats />}
        </Canvas>
        
        {/* Overlay buttons in top right corner */}
        <div className="canvas-overlay-buttons">
          {/* Time Control Button */}
          <button
            onClick={() => setIsTimeStopped(!isTimeStopped)}
            className={`overlay-button time-control-button ${isTimeStopped ? 'stopped' : 'running'}`}
            title={isTimeStopped ? "Start time" : "Stop time at 10:09:00"}
          >
            {isTimeStopped ? <PlayIcon className="icon" /> : <PauseIcon className="icon" />}
            <span className="button-label">{isTimeStopped ? 'Start' : 'Stop'}</span>
          </button>
          <button
            onClick={() => setEnvironmentLight(!environmentLight)}
            className={`overlay-button ${environmentLight ? 'light-on' : 'light-off'}`}
            title={environmentLight ? "Turn off environment light" : "Turn on environment light"}
          >
            {environmentLight ? <SunIcon className="icon" /> : <MoonIcon className="icon" />}
            <span className="button-label">Toggle Light</span>
          </button>
          <div className="config-actions-divider"></div>
          {/*
          <button
            onClick={() => setDebugView(!debugView)}
            className="overlay-button"
            title={debugView ? "Hide debug view (axes & stats)" : "Show debug view (axes & stats)"}
          >
            <BugAntIcon className="icon" />
          </button>
          <button
            onClick={saveConfig}
            className="overlay-button config-action-button"
            title="Save Config"
          >
            <ArrowDownTrayIcon className="icon" />
            <span className="button-label">Save Config</span>
          </button>
          
          <button
            onClick={exportGLB}
            className="overlay-button config-action-button export-button"
            title="Export GLB"
          >
            <CubeIcon className="icon" />
            <span className="button-label">Export GLB</span>
          </button>
          */}
          <div className="preset-menu-container" style={{ position: 'relative' }}>
            <button
              onClick={togglePresetMenu}
              className="overlay-button config-action-button preset-load-button"
              title="Load Preset"
            >
              <RectangleStackIcon className="icon" />
              <span className="button-label">Load Preset</span>
            </button>
            {showPresetMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '4px',
                backgroundColor: 'rgba(30, 30, 30, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                minWidth: '180px',
                zIndex: 1000,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)'
              }}>
                {presets.map(preset => (
                  <button
                    key={preset}
                    onClick={() => loadConfig(preset)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px 16px',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '14px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    {preset.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={clearConfig}
            className="overlay-button config-action-button clear-button"
            title="Clear All"
          >
            <TrashIcon className="icon" />
            <span className="button-label">Clear All</span>
          </button>
        </div>
      </div>
      <ControlPanel
        config={config}
        updateConfig={updateConfig}
        schema={watchConfig}
      />
    </div>
    </>
  )
}

export default App

