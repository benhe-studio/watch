import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'
import WatchFace from './components/WatchFace'
import ControlPanel from './components/ControlPanel'
import { watchConfig, generateInitialState } from './config/watchConfig'
import './App.css'

function App() {
  const [config, setConfig] = useState(generateInitialState(watchConfig))
  const [isLoading, setIsLoading] = useState(true)

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

  if (isLoading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100vw', height: '100vh' }}>Loading...</div>
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <div style={{ flex: 1, background: '#e8e8e8' }}>
        <Canvas shadows camera={{ position: [0, -30, 60], fov: 50 }}>
          <color attach="background" args={['#e8e8e8']} />
          
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[10, 50, -10]}
            intensity={1.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-camera-left={-30}
            shadow-camera-right={30}
            shadow-camera-top={30}
            shadow-camera-bottom={-30}
            shadow-camera-near={0.1}
            shadow-camera-far={100}
          />
          
          {/* Environment for realistic metallic reflections */}
          <Environment preset="studio" />
          
          {/* Axis helper to show X (red), Y (green), Z (blue) */}
          <primitive object={new THREE.AxesHelper(30)} />
          
          <WatchFace config={config} />
          <OrbitControls enablePan={false} />
        </Canvas>
      </div>
      <ControlPanel
        config={config}
        updateConfig={updateConfig}
        schema={watchConfig}
        onSave={saveConfig}
        onLoad={loadConfig}
      />
    </div>
  )
}

export default App
