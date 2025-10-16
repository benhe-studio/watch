export const complicationsConfig = {
  label: 'Complications',
  expanded: true,
  isArray: true,
  itemLabel: 'Complication',
  controls: {
    type: {
      type: 'buttons',
      label: 'Type',
      default: 'date',
      options: [
        { value: 'date', label: 'Date' }
      ]
    },
    position: {
      type: 'buttons',
      label: 'Position',
      default: 3,
      options: [
        { value: 12, label: '12' },
        { value: 3, label: '3' },
        { value: 6, label: '6' },
        { value: 9, label: '9' }
      ]
    },
    distance: {
      type: 'range',
      label: 'Distance from Center',
      default: 15,
      min: 10,
      max: 18,
      step: 0.5
    },
    windowShape: {
      type: 'buttons',
      label: 'Window Shape',
      default: 'circle',
      options: [
        { value: 'circle', label: 'Circle' },
        { value: 'rectangle', label: 'Rectangle' }
      ]
    },
    windowRadius: {
      type: 'range',
      label: 'Window Radius',
      default: 2.2,
      min: 1.5,
      max: 4,
      step: 0.1,
      condition: (item) => item.windowShape === 'circle'
    },
    windowWidth: {
      type: 'range',
      label: 'Window Width',
      default: 4,
      min: 2,
      max: 6,
      step: 0.1,
      condition: (item) => item.windowShape === 'rectangle'
    },
    windowHeight: {
      type: 'range',
      label: 'Window Height',
      default: 3,
      min: 2,
      max: 5,
      step: 0.1,
      condition: (item) => item.windowShape === 'rectangle'
    },
    dateValue: {
      type: 'range',
      label: 'Date Value',
      default: 28,
      min: 1,
      max: 31,
      step: 1,
      condition: (item) => item.type === 'date'
    }
  }
}