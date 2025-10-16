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