import { getMaterialOptions } from './materials'

export const markersConfig = {
  label: 'Markers',
  expanded: true,
  isArray: true,
  itemLabel: 'Marker',
  controls: {
    type: {
      type: 'buttons',
      label: 'Type',
      default: 'arabic',
      options: [
        { value: 'arabic', label: 'Arabic' },
        { value: 'roman', label: 'Roman' },
        { value: 'blocks', label: 'Blocks' },
        { value: 'circle', label: 'Circle' }
      ]
    },
    rotate: {
      type: 'checkbox',
      label: 'Rotate',
      default: false,
      getDefault: (item) => item.type === 'blocks' ? true : false
    },
    fontSize: {
      type: 'range',
      label: 'Font Size',
      default: 2.5,
      min: 1,
      max: 5,
      step: 0.1,
      condition: (item) => item.type === 'arabic'
    },
    color: {
      type: 'color',
      label: 'Color',
      default: '#000000',
      condition: (item) => item.type !== 'blocks' && item.type !== 'circle'
    },
    material: {
      type: 'select',
      label: 'Material',
      default: 'polishedSilver',
      options: getMaterialOptions(),
      condition: (item) => item.type === 'blocks' || item.type === 'circle'
    },
    spread: {
      type: 'range',
      label: 'Spread',
      default: 17,
      min: 10,
      max: 25,
      step: 0.1
    },
    topWidth: {
      type: 'range',
      label: 'Top Width',
      default: 1,
      min: 0.5,
      max: 3,
      step: 0.1,
      condition: (item) => item.type === 'blocks'
    },
    bottomWidth: {
      type: 'range',
      label: 'Bottom Width',
      default: 1,
      min: 0,
      max: 3,
      step: 0.1,
      condition: (item) => item.type === 'blocks'
    },
    height: {
      type: 'range',
      label: 'Height',
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
      min: 0.2,
      max: 1,
      step: 0.1,
      condition: (item) => item.type === 'blocks'
    },
    blocksCutout: {
      type: 'range',
      label: 'Cutout',
      default: 0,
      min: 0,
      max: 0.95,
      step: 0.05,
      condition: (item) => item.type === 'blocks'
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
    bevelEnabled: {
      type: 'checkbox',
      label: 'Enable Bevel',
      default: true,
      condition: (item) => item.type === 'blocks' || item.type === 'circle'
    },
    bevelThickness: {
      type: 'range',
      label: 'Bevel Thickness',
      default: 0.1,
      min: 0.05,
      max: 0.3,
      step: 0.05,
      condition: (item) => (item.type === 'blocks' || item.type === 'circle') && item.bevelEnabled
    },
    bevelSize: {
      type: 'range',
      label: 'Bevel Size',
      default: 0.1,
      min: 0.05,
      max: 0.3,
      step: 0.05,
      condition: (item) => (item.type === 'blocks' || item.type === 'circle') && item.bevelEnabled
    },
    bevelSegments: {
      type: 'range',
      label: 'Bevel Segments',
      default: 3,
      min: 1,
      max: 8,
      step: 1,
      condition: (item) => (item.type === 'blocks' || item.type === 'circle') && item.bevelEnabled
    },
    romanWidth: {
      type: 'range',
      label: 'Width',
      default: 0.8,
      min: 0.4,
      max: 2,
      step: 0.1,
      condition: (item) => item.type === 'roman'
    },
    romanHeight: {
      type: 'range',
      label: 'Height',
      default: 2.5,
      min: 1,
      max: 5,
      step: 0.1,
      condition: (item) => item.type === 'roman'
    },
    romanDepth: {
      type: 'range',
      label: 'Depth',
      default: 0.2,
      min: 0.1,
      max: 0.5,
      step: 0.1,
      condition: (item) => item.type === 'roman'
    },
    circleRadius: {
      type: 'range',
      label: 'Radius',
      default: 1.5,
      min: 0.5,
      max: 3,
      step: 0.1,
      condition: (item) => item.type === 'circle'
    },
    circleDepth: {
      type: 'range',
      label: 'Depth',
      default: 0.5,
      min: 0.2,
      max: 1,
      step: 0.1,
      condition: (item) => item.type === 'circle'
    },
    circleCutout: {
      type: 'range',
      label: 'Cutout',
      default: 0,
      min: 0,
      max: 0.95,
      step: 0.05,
      condition: (item) => item.type === 'circle'
    },
    visibleHours: {
      type: 'hourSelector',
      label: 'Visible Hours',
      default: [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    }
  }
}