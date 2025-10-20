import { getMaterialOptions } from './materials'
import { createBevelControl } from './bevelConfig'

export const faceConfig = {
  label: 'Face',
  expanded: true,
  controls: {
    material: {
      type: 'select',
      label: 'Material',
      default: 'brushedSteel',
      options: getMaterialOptions()
    },
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
      step: 0.1
    },
    bezelThickness: {
      type: 'range',
      label: 'Bezel Thickness',
      default: 1.5,
      min: 0.5,
      max: 4,
      step: 0.1
    },
    bezelSegments: {
      type: 'range',
      label: 'Bezel Curve Segments',
      default: 128,
      min: 32,
      max: 256,
      step: 8
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
      maxSegments: 10
    }),
    bezelMaterial: {
      type: 'select',
      label: 'Bezel Material',
      default: 'brushedSteel',
      options: getMaterialOptions()
    }
  }
}