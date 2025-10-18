import { getMaterialOptions } from './materials'

export const primitivesConfig = {
  label: 'Primitives',
  expanded: true,
  isArray: true,
  itemLabel: 'Primitive',
  controls: {
    type: {
      type: 'buttons',
      label: 'Type',
      default: 'number',
      options: [
        { value: 'number', label: 'Number' },
        { value: 'hand', label: 'Hand' }
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
      min: 0,
      max: 25,
      step: 0.5
    },
    zOffset: {
      type: 'range',
      label: 'Z Offset',
      default: 0,
      min: -5,
      max: 5,
      step: 0.1
    },
    rotation: {
      type: 'range',
      label: 'Rotation (degrees)',
      default: 0,
      min: -180,
      max: 180,
      step: 1
    },
    number: {
      type: 'range',
      label: 'Number',
      default: 0,
      min: 0,
      max: 360,
      step: 1,
      condition: (item) => item.type === 'number'
    },
    fontSize: {
      type: 'range',
      label: 'Font Size',
      default: 2,
      min: 0.5,
      max: 10,
      step: 0.1,
      condition: (item) => item.type === 'number'
    },
    color: {
      type: 'color',
      label: 'Color',
      default: '#000000',
      condition: (item) => item.type === 'number'
    },
    material: {
      type: 'select',
      label: 'Material',
      default: 'polishedSilver',
      options: getMaterialOptions(),
      condition: (item) => item.type === 'hand'
    },
    points: {
      type: 'pointArray',
      label: 'Hand Shape Points',
      default: [[0.3, -2], [0.5, 0], [0.3, 14], [0, 18]],
      xLabel: 'Width',
      yLabel: 'Length',
      xMin: 0,
      xMax: 3,
      yMin: -5,
      yMax: 25,
      description: 'Define the hand shape. Y=0 is the pivot point.',
      condition: (item) => item.type === 'hand'
    }
  }
}