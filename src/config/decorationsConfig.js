import { getMaterialOptions } from './materials'

export const decorationsConfig = {
  label: 'Decorations',
  expanded: true,
  isArray: true,
  itemLabel: 'Decoration',
  controls: {
    type: {
      type: 'buttons',
      label: 'Type',
      default: 'ring',
      options: [
        { value: 'ring', label: 'Ring' }
      ]
    },
    vector: {
      type: 'range',
      label: 'Position Vector (Clock Hour)',
      default: 0,
      min: 0,
      max: 12,
      step: 0.1
    },
    offset: {
      type: 'range',
      label: 'Offset from Center',
      default: 0,
      min: 0,
      max: 18,
      step: 0.5
    },
    material: {
      type: 'select',
      label: 'Material',
      default: 'polishedSilver',
      options: getMaterialOptions()
    },
    spread: {
      type: 'range',
      label: 'Spread',
      default: 17,
      min: 10,
      max: 25,
      step: 0.1
    },
    thickness: {
      type: 'range',
      label: 'Thickness',
      default: 1,
      min: 0.1,
      max: 5,
      step: 0.1,
      condition: (item) => item.type === 'ring'
    },
    depth: {
      type: 'range',
      label: 'Depth',
      default: 0.5,
      min: 0.1,
      max: 2,
      step: 0.1,
      condition: (item) => item.type === 'ring'
    }
  }
}