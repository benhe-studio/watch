import { getMaterialOptions } from './helpers/materials'

export const minuteMarkersConfig = {
  label: 'Minute Markers',
  expanded: true,
  isArray: true,
  itemLabel: 'Minute Marker',
  controls: {
    type: {
      type: 'buttons',
      label: 'Type',
      default: 'line',
      options: [
        { value: 'line', label: 'Line' },
        { value: 'dot', label: 'Dot' },
        { value: 'numeral', label: 'Numeral' },
        { value: 'subminute', label: 'Sub Minute' }
      ]
    },
    radialAlignment: {
      type: 'checkbox',
      label: 'Radial Alignment',
      default: true,
      description: 'Rotate markers to align radially toward center'
    },
    hideHourMarks: {
      type: 'checkbox',
      label: 'Hide Hour Marks',
      default: false
    },
    material: {
      type: 'select',
      label: 'Material',
      default: 'polishedSilver',
      options: getMaterialOptions(),
      condition: (item) => item.type !== 'numeral' && item.type !== 'subminute'
    },
    spread: {
      type: 'range',
      label: 'Spread',
      default: 17,
      min: 10,
      max: 25,
      step: 0.1
    },
    width: {
      type: 'range',
      label: 'Width',
      default: 0.2,
      min: 0.01,
      max: 1,
      step: 0.01,
      condition: (item) => item.type === 'line' || item.type === 'subminute'
    },
    length: {
      type: 'range',
      label: 'Length',
      default: 1,
      min: 0.5,
      max: 3,
      step: 0.1,
      condition: (item) => item.type === 'line' || item.type === 'subminute'
    },
    depth: {
      type: 'range',
      label: 'Depth',
      default: 0.2,
      min: 0.01,
      max: 1,
      step: 0.01,
      condition: (item) => item.type === 'line' || item.type === 'subminute'
    },
    ticks: {
      type: 'range',
      label: 'Ticks',
      default: 2,
      min: 1,
      max: 4,
      step: 1,
      condition: (item) => item.type === 'subminute'
    },
    radius: {
      type: 'range',
      label: 'Radius',
      default: 0.3,
      min: 0.1,
      max: 1,
      step: 0.05,
      condition: (item) => item.type === 'dot'
    },
    fontSize: {
      type: 'range',
      label: 'Font Size',
      default: 1.5,
      min: 0.5,
      max: 4,
      step: 0.1,
      condition: (item) => item.type === 'numeral'
    },
    color: {
      type: 'color',
      label: 'Color',
      default: '#000000',
      condition: (item) => item.type === 'numeral' || item.type === 'subminute'
    },
  }
}