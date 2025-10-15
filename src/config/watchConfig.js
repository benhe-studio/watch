// Configuration schema for the watch face designer
// This defines both the state structure and UI controls in one place

export const watchConfig = {
  face: {
    label: 'Face',
    expanded: true,
    controls: {
      color: {
        type: 'color',
        label: 'Color',
        default: '#ffffff'
      },
      smoothness: {
        type: 'range',
        label: 'Smoothness',
        default: 0.5,
        min: 0,
        max: 1,
        step: 0.01
      },
      metallic: {
        type: 'range',
        label: 'Metallic',
        default: 0.1,
        min: 0,
        max: 1,
        step: 0.01
      }
    }
  },
  markers: {
    label: 'Markers',
    expanded: true,
    controls: {
      type: {
        type: 'buttons',
        label: 'Type',
        default: 'arabic',
        options: [
          { value: 'arabic', label: 'Arabic' },
          { value: 'roman', label: 'Roman' },
          { value: 'blocks', label: 'Blocks' }
        ]
      },
      rotate: {
        type: 'checkbox',
        label: 'Rotate',
        default: false,
        condition: (config) => config.markers.type === 'arabic'
      }
    }
  },
  hands: {
    label: 'Hands',
    expanded: true,
    controls: {
      profile: {
        type: 'buttons',
        label: 'Profile',
        default: 'classic',
        options: [
          { value: 'classic', label: 'Classic' },
          { value: 'modern', label: 'Modern' },
          { value: 'minimal', label: 'Minimal' }
        ]
      }
    }
  }
}

// Generate initial state from config
export function generateInitialState(config) {
  const state = {}
  
  Object.keys(config).forEach(section => {
    state[section] = {}
    Object.keys(config[section].controls).forEach(control => {
      state[section][control] = config[section].controls[control].default
    })
  })
  
  return state
}