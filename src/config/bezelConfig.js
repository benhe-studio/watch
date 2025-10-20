import { getMaterialOptions } from './helpers/materials'
import { createBevelControl } from './helpers/bevelConfig'

export const bezelConfig = {
  label: 'Bezel',
  expanded: false,
  controls: {
    bezel: {
      type: 'checkbox',
      label: 'Enable Bezel',
      default: false
    },
    bezelHeight: {
      type: 'range',
      label: 'Bezel Height',
      default: 2,
      min: 0.5,
      max: 5,
      step: 0.1,
      condition: (config) => config.bezel
    },
    bezelThickness: {
      type: 'range',
      label: 'Bezel Thickness',
      default: 1.5,
      min: 0.5,
      max: 4,
      step: 0.1,
      condition: (config) => config.bezel
    },
    bezelBevel: createBevelControl({
      defaultEnabled: false,
      defaultThickness: 0.1,
      defaultSize: 0.1,
      defaultSegments: 3,
      minThickness: 0.01,
      maxThickness: 2,
      minSize: 0.01,
      maxSize: 2,
      minSegments: 1,
      maxSegments: 10,
      condition: (config) => config.bezel
    }),
    bezelMaterial: {
      type: 'select',
      label: 'Bezel Material',
      default: 'brushedSteel',
      options: getMaterialOptions(),
      condition: (config) => config.bezel
    }
  }
}