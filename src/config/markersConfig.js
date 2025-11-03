import { getMaterialOptions } from './helpers/materials'
import { createBevelControl } from './helpers/bevelConfig'

export const markersConfig = {
  label: 'Markers',
  expanded: true,
  isArray: true,
  itemLabel: 'Marker',
  controls: {
    type: {
      type: 'buttons',
      label: 'Type',
      default: 'numeral',
      options: [
        { value: 'numeral', label: 'Numeral' },
        { value: 'blocks', label: 'Blocks' },
        { value: 'circle', label: 'Circle' }
      ]
    },
    visibleHours: {
      type: 'hourSelector',
      label: 'Visible Hours',
      default: [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    },
    material: {
      type: 'select',
      label: 'Material',
      default: 'polishedSilver',
      options: getMaterialOptions()
    },
    radialAlignment: {
      type: 'checkbox',
      label: 'Radial Alignment',
      default: false,
      getDefault: (item) => item.type === 'blocks' ? true : false,
      description: 'Rotate markers to align radially toward center',
      condition: (item) => item.type !== 'circle'
    },
    spread: {
      type: 'range',
      label: 'Spread',
      default: 17,
      min: 8,
      max: 25,
      step: 0.1
    },
    circleRadius: {
      type: 'range',
      label: 'Radius',
      default: 1.5,
      min: 0.1,
      max: 3,
      step: 0.01,
      condition: (item) => item.type === 'circle'
    },
    fontSize: {
      type: 'range',
      label: 'Font Size',
      default: 2.5,
      min: 1,
      max: 5,
      step: 0.1,
      condition: (item) => item.type === 'numeral'
    },
    topWidth: {
      type: 'range',
      label: 'Top Width',
      default: 1,
      min: 0.01,
      max: 5,
      step: 0.01,
      condition: (item) => item.type === 'blocks'
    },
    bottomWidth: {
      type: 'range',
      label: 'Bottom Width',
      default: 1,
      min: 0,
      max: 5,
      step: 0.01,
      condition: (item) => item.type === 'blocks'
    },
    length: {
      type: 'range',
      label: 'Length',
      default: 3,
      min: 1,
      max: 6,
      step: 0.1,
      condition: (item) => item.type === 'blocks'
    },
    depth: {
      type: 'range',
      label: 'Depth',
      default: 0.5,
      min: 0.1,
      max: 1,
      step: 0.1
    },
    cutout: {
      type: 'range',
      label: 'Cutout',
      default: 0,
      min: 0,
      max: 0.98,
      step: 0.01,
      condition: (item) => item.type === 'blocks' || item.type === 'circle'
    },
    lumeCutout: {
      type: 'checkbox',
      label: 'Lume',
      default: false,
      condition: (item) => (item.type === 'blocks' || item.type === 'circle') && item.cutout > 0,
      description: 'Fill cutout region with lume material'
    },
    doubleBlock: {
      type: 'checkbox',
      label: 'Double Block',
      default: false,
      condition: (item) => item.type === 'blocks'
    },
    separation: {
      type: 'range',
      label: 'Separation',
      default: 1.5,
      min: 0.5,
      max: 4,
      step: 0.1,
      condition: (item) => item.type === 'blocks' && item.doubleBlock
    },
    bevel: createBevelControl({
      defaultEnabled: true,
      defaultThickness: 0.1,
      defaultSize: 0.1,
      defaultSegments: 3,
      minThickness: 0.05,
      maxThickness: 0.3,
      minSize: 0.05,
      maxSize: 0.3
    })
  }
}