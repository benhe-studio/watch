import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment, Stats } from '@react-three/drei'
import * as THREE from 'three'
import WatchFace from './components/WatchFace'
import ControlPanel from './components/ControlPanel'
import { watchConfig, generateInitialState } from './config/watchConfig'
import { updateMaterialProperties } from './config/materials'
import './App.css'

function App() {
  const [config, setConfig] = useState(generateInitialState(watchConfig))
  const [isLoading, setIsLoading] = useState(true)
  const [environmentLight, setEnvironmentLight] = useState(true)
  const [debugView, setDebugView] = useState(false)

  // Load default config on mount
  useEffect(() => {
    const loadDefaultConfig = async () => {
      try {
        const response = await fetch('/default-config.json')
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

  // Update lume material emissive color based on environmentLight
  useEffect(() => {
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

  const loadConfig = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          try {
            const loadedConfig = JSON.parse(event.target.result)
            setConfig(loadedConfig)
          } catch (error) {
            alert('Error loading config: ' + error.message)
          }
        }
        reader.readAsText(file)
      }
    }
    input.click()
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
      setConfig(clearedConfig)
    }
  }

  if (isLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh' }}>Loading...</div>
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <div style={{ flex: 1, background: environmentLight ? '#e8e8e8' : '#000000' }}>
        <Canvas shadows camera={{ position: [0, -30, 60], fov: 50 }}>
          <color attach="background" args={[environmentLight ? '#e8e8e8' : '#000000']} />
          
          {environmentLight && (
            <directionalLight
              position={[50, 50, 50]}
              intensity={2}
              castShadow
              shadow-mapSize={[2048, 2048]}
              shadow-camera-left={-30}
              shadow-camera-right={30}
              shadow-camera-top={30}
              shadow-camera-bottom={-30}
              shadow-camera-near={0.1}
              shadow-camera-far={100}
            />
          )}
          
          {/* Environment for realistic metallic reflections */}
          {environmentLight && <Environment preset="studio" environmentIntensity={0.2}/>}
          
          {/* Axis helper to show X (red), Y (green), Z (blue) - only visible in debug mode */}
          {debugView && <primitive object={new THREE.AxesHelper(30)} />}
          
          <WatchFace config={config} environmentLight={environmentLight} />
          <OrbitControls enablePan={false} />
          {debugView && <Stats />}
        </Canvas>
      </div>
      <ControlPanel
        config={config}
        updateConfig={updateConfig}
        schema={watchConfig}
        onSave={saveConfig}
        onLoad={loadConfig}
        onClear={clearConfig}
        environmentLight={environmentLight}
        onToggleEnvironmentLight={() => setEnvironmentLight(!environmentLight)}
        debugView={debugView}
        onToggleDebugView={() => setDebugView(!debugView)}
      />
    </div>
  )
}

export default App

