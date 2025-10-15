// Configuration schema for the watch face designer
// This defines both the state structure and UI controls in one place

import { faceConfig } from './faceConfig'
import { markersConfig } from './markersConfig'
import { handsConfig } from './handsConfig'

export const watchConfig = {
  face: faceConfig,
  markers: markersConfig,
  hands: handsConfig
}

// Generate initial state from config
export function generateInitialState(config) {
  const state = {}
  
  Object.keys(config).forEach(section => {
    const sectionConfig = config[section]
    
    if (sectionConfig.isArray) {
      // For array sections, start with an empty array
      state[section] = []
    } else {
      // For regular sections, create an object with default values
      state[section] = {}
      Object.keys(sectionConfig.controls).forEach(control => {
        state[section][control] = sectionConfig.controls[control].default
      })
    }
  })
  
  return state
}