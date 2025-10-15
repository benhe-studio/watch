import { getMaterialOptions } from './materials'

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
        { value: 'numeral', label: 'Numeral' }
      ]
    },
    rotate: {
      type: 'checkbox',
      label: 'Rotate',
      default: true
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
      options: getMaterialOptions()
    },
    distance: {
      type: 'range',
      label: 'Distance',
      default: 1.7,
      min: 1.0,
      max: 2.5,
      step: 0.1
    },
    width: {
      type: 'range',
      label: 'Width',
      default: 0.02,
      min: 0.01,
      max: 0.1,
      step: 0.01,
      condition: (item) => item.type === 'line'
    },
    height: {
      type: 'range',
      label: 'Height',
      default: 0.1,
      min: 0.05,
      max: 0.3,
      step: 0.05,
      condition: (item) => item.type === 'line'
    },
    depth: {
      type: 'range',
      label: 'Depth',
      default: 0.02,
      min: 0.01,
      max: 0.1,
      step: 0.01,
      condition: (item) => item.type === 'line'
    },
    radius: {
      type: 'range',
      label: 'Radius',
      default: 0.03,
      min: 0.01,
      max: 0.1,
      step: 0.01,
      condition: (item) => item.type === 'dot'
    },
    fontSize: {
      type: 'range',
      label: 'Font Size',
      default: 0.15,
      min: 0.05,
      max: 0.4,
      step: 0.05,
      condition: (item) => item.type === 'numeral'
    },
    color: {
      type: 'color',
      label: 'Color',
      default: '#000000',
      condition: (item) => item.type === 'numeral'
    },
    visibleMinutes: {
      type: 'minuteSelector',
      label: 'Visible Minutes',
      default: Array.from({ length: 60 }, (_, i) => i)
    }
  }
}