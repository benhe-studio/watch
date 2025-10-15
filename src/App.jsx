import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import WatchFace from './components/WatchFace'
import ControlPanel from './components/ControlPanel'
import { watchConfig, generateInitialState } from './config/watchConfig'
import './App.css'

function App() {
  const [config, setConfig] = useState(generateInitialState(watchConfig))

  const updateConfig = (section, key, value) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <div style={{ flex: 1, background: '#e8e8e8' }}>
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <color attach="background" args={['#e8e8e8']} />
          
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <directionalLight position={[-5, 3, -5]} intensity={0.5} />
          
          {/* Environment for realistic metallic reflections */}
          <Environment preset="studio" />
          
          <WatchFace config={config} />
          <OrbitControls enablePan={false} />
        </Canvas>
      </div>
      <ControlPanel 
        config={config} 
        updateConfig={updateConfig}
        schema={watchConfig}
      />
    </div>
  )
}

export default App
