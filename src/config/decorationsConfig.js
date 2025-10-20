import { getMaterialOptions } from './helpers/materials'
import { createPositionControl } from './helpers/positionConfig'

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
        { value: 'ring', label: 'Ring' },
        { value: 'line', label: 'Line' }
      ]
    },
    position: createPositionControl({
      defaultVector: 0,
      defaultOffset: 0,
      minOffset: 0,
      maxOffset: 18
    }),
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
      step: 0.1,
      condition: (item) => item.type === 'ring'
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
    },
    length: {
      type: 'range',
      label: 'Length',
      default: 5,
      min: 0.5,
      max: 20,
      step: 0.1,
      condition: (item) => item.type === 'line'
    },
    rotation: {
      type: 'range',
      label: 'Rotation (degrees)',
      default: 0,
      min: 0,
      max: 180,
      step: 1,
      condition: (item) => item.type === 'line'
    }
  }
}