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
        { value: 'rectangle', label: 'Rectangle' }
      ]
    },
    vector: {
      type: 'range',
      label: 'Position Vector (Clock Hour)',
      default: 3,
      min: 0,
      max: 12,
      step: 0.1
    },
    offset: {
      type: 'range',
      label: 'Offset from Center',
      default: 15,
      min: 5,
      max: 18,
      step: 0.5
    },
    radius: {
      type: 'range',
      label: 'Window Radius',
      default: 2.2,
      min: 1.5,
      max: 4,
      step: 0.1,
      condition: (item) => item.type === 'circle'
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
    }
  }
}