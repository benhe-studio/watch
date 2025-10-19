import { getMaterialOptions } from './materials'

export const complicationWindowsConfig = {
  label: 'Complication Windows',
  expanded: true,
  isArray: true,
  itemLabel: 'Window',
  controls: {
    type: {
      type: 'buttons',
      label: 'Shape',
      default: 'circle',
      options: [
        { value: 'circle', label: 'Circle' },
        { value: 'rectangle', label: 'Rectangle' },
        { value: 'moonphase', label: 'Moon Phase' }
      ]
    },
    vector: {
      type: 'range',
      label: 'Position Vector (Clock Hour)',
      default: 6,
      min: 0,
      max: 12,
      step: 0.1
    },
    offset: {
      type: 'range',
      label: 'Offset from Center',
      default: 10,
      min: 5,
      max: 18,
      step: 0.1
    },
    radius: {
      type: 'range',
      label: 'Window Radius',
      default: 2.2,
      min: 1.5,
      max: 8,
      step: 0.1,
      condition: (item) => item.type === 'circle' || item.type === 'moonphase'
    },
    width: {
      type: 'range',
      label: 'Window Width',
      default: 4,
      min: 2,
      max: 6,
      step: 0.1,
      condition: (item) => item.type === 'rectangle'
    },
    height: {
      type: 'range',
      label: 'Window Height',
      default: 3,
      min: 2,
      max: 5,
      step: 0.1,
      condition: (item) => item.type === 'rectangle'
    },
    frameEnabled: {
      type: 'checkbox',
      label: 'Enable Frame',
      default: false,
      condition: (item) => item.type !== 'moonphase'
    },
    frameWidth: {
      type: 'range',
      label: 'Frame Width',
      default: 0.3,
      min: 0.1,
      max: 1,
      step: 0.05,
      condition: (item) => item.frameEnabled
    },
    frameThickness: {
      type: 'range',
      label: 'Frame Thickness',
      default: 0.5,
      min: 0.1,
      max: 1.5,
      step: 0.1,
      condition: (item) => item.frameEnabled
    },
    frameDepth: {
      type: 'range',
      label: 'Frame Depth (Z Offset)',
      default: 0.25,
      min: -2,
      max: 2,
      step: 0.05,
      condition: (item) => item.frameEnabled
    },
    frameMaterial: {
      type: 'select',
      label: 'Frame Material',
      default: 'polishedSilver',
      options: getMaterialOptions(),
      condition: (item) => item.frameEnabled
    },
    frameBevelEnabled: {
      type: 'checkbox',
      label: 'Enable Frame Bevel',
      default: true,
      condition: (item) => item.frameEnabled
    },
    frameBevelThickness: {
      type: 'range',
      label: 'Frame Bevel Thickness',
      default: 0.05,
      min: 0.01,
      max: 1.0,
      step: 0.01,
      condition: (item) => item.frameEnabled && item.frameBevelEnabled
    },
    frameBevelSize: {
      type: 'range',
      label: 'Frame Bevel Size',
      default: 0.05,
      min: 0.01,
      max: 1.0,
      step: 0.01,
      condition: (item) => item.frameEnabled && item.frameBevelEnabled
    },
    frameBevelSegments: {
      type: 'range',
      label: 'Frame Bevel Segments',
      default: 3,
      min: 1,
      max: 8,
      step: 1,
      condition: (item) => item.frameEnabled && item.frameBevelEnabled
    }
  }
}