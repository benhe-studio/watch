import { getMaterialOptions } from './helpers/materials'
import { createBevelControl } from './helpers/bevelConfig'
import { createPositionControl } from './helpers/positionConfig'

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
    position: createPositionControl({
      defaultVector: 6,
      defaultOffset: 10,
      minOffset: 5,
      maxOffset: 18
    }),
    radius: {
      type: 'range',
      label: 'Window Radius',
      default: 4,
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
    frameBevel: createBevelControl({
      defaultEnabled: true,
      defaultThickness: 0.05,
      defaultSize: 0.05,
      defaultSegments: 3,
      minThickness: 0.01,
      maxThickness: 1.0,
      minSize: 0.01,
      maxSize: 1.0,
      condition: (item) => item.frameEnabled
    })
  }
}