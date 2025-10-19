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
        { value: 'hand', label: 'Hand' },
        { value: 'circularLabel', label: 'Circular Label' }
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
      condition: (item) => item.type === 'number' || item.type === 'circularLabel'
    },
    color: {
      type: 'color',
      label: 'Color',
      default: '#000000',
      condition: (item) => item.type === 'number' || item.type === 'circularLabel'
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
      default: [[0.1, 0], [0.1, 3.5], [0, 3.8]],
      xLabel: 'Width',
      yLabel: 'Length',
      xMin: 0,
      xMax: 2,
      yMin: -2,
      yMax: 6,
      description: 'Define the hand shape. Y=0 is the pivot point.',
      condition: (item) => item.type === 'hand'
    },
    labels: {
      type: 'text',
      label: 'Labels (comma separated)',
      default: '12,1,2,3,4,5,6,7,8,9,10,11',
      description: 'Comma-separated list of labels to display around the circle',
      condition: (item) => item.type === 'circularLabel'
    },
    labelRadius: {
      type: 'range',
      label: 'Label Radius',
      default: 5,
      min: 2,
      max: 20,
      step: 0.1,
      description: 'Distance of labels from center',
      condition: (item) => item.type === 'circularLabel'
    }
  }
}