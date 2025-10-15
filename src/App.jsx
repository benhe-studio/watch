import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
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
          
          <ambientLight intensity={0.3} />
          <spotLight
            position={[5, 8, 5]}
            angle={0.3}
            penumbra={0.5}
            intensity={1.5}
            castShadow
          />
          <spotLight
            position={[-3, 5, 3]}
            angle={0.4}
            penumbra={0.7}
            intensity={0.8}
          />
          
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
