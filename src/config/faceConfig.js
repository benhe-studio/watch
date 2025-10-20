import { getMaterialOptions } from './materials'

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
    bezelBevelEnabled: {
      type: 'checkbox',
      label: 'Enable Bevel',
      default: false
    },
    bezelBevelThickness: {
      type: 'range',
      label: 'Bevel Thickness',
      default: 0.1,
      min: 0.01,
      max: 2,
      step: 0.01
    },
    bezelBevelSize: {
      type: 'range',
      label: 'Bevel Size',
      default: 0.1,
      min: 0.01,
      max: 2,
      step: 0.01
    },
    bezelBevelSegments: {
      type: 'range',
      label: 'Bevel Segments',
      default: 3,
      min: 1,
      max: 10,
      step: 1
    },
    bezelMaterial: {
      type: 'select',
      label: 'Bezel Material',
      default: 'brushedSteel',
      options: getMaterialOptions()
    }
  }
}