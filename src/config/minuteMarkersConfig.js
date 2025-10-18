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
        { value: 'numeral', label: 'Numeral' },
        { value: 'border', label: 'Border' }
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
      default: 17,
      min: 10,
      max: 25,
      step: 0.1
    },
    width: {
      type: 'range',
      label: 'Width',
      default: 0.2,
      min: 0.1,
      max: 1,
      step: 0.1,
      condition: (item) => item.type === 'line'
    },
    height: {
      type: 'range',
      label: 'Height',
      default: 1,
      min: 0.5,
      max: 3,
      step: 0.1,
      condition: (item) => item.type === 'line'
    },
    depth: {
      type: 'range',
      label: 'Depth',
      default: 0.2,
      min: 0.1,
      max: 1,
      step: 0.1,
      condition: (item) => item.type === 'line'
    },
    radius: {
      type: 'range',
      label: 'Spread',
      default: 0.3,
      min: 0.1,
      max: 1,
      step: 0.1,
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
      condition: (item) => item.type === 'numeral'
    },
    thickness: {
      type: 'range',
      label: 'Thickness',
      default: 1,
      min: 0.1,
      max: 5,
      step: 0.1,
      condition: (item) => item.type === 'border'
    },
    borderDepth: {
      type: 'range',
      label: 'Depth',
      default: 0.5,
      min: 0.1,
      max: 2,
      step: 0.1,
      condition: (item) => item.type === 'border'
    },
    visibleMinutes: {
      type: 'minuteSelector',
      label: 'Visible Minutes',
      default: Array.from({ length: 60 }, (_, i) => i)
    }
  }
}