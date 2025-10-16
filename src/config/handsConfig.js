export const handsConfig = {
  label: 'Hands',
  expanded: true,
  isArray: true,
  itemLabel: 'Hand',
  controls: {
    type: {
      type: 'buttons',
      label: 'Type',
      default: 'seconds',
      options: [
        { value: 'hours', label: 'Hours' },
        { value: 'minutes', label: 'Minutes' },
        { value: 'seconds', label: 'Seconds' }
      ]
    },
    profile: {
      type: 'buttons',
      label: 'Profile',
      default: 'classic',
      options: [
        { value: 'classic', label: 'Classic' },
        { value: 'dauphine', label: 'Dauphine' },
        { value: 'taperedCylinder', label: 'Tapered' }
      ]
    },
    width: {
      type: 'range',
      label: 'Width',
      default: 0.5,
      min: 0.1,
      max: 2,
      step: 0.1
    },
    length: {
      type: 'range',
      label: 'Length',
      default: 14,
      getDefault: (item) => {
        if (item.type === 'hours') return 10
        if (item.type === 'minutes') return 14
        if (item.type === 'seconds') return 16
        return 14
      },
      min: 5,
      max: 20,
      step: 0.5
    },
    color: {
      type: 'color',
      label: 'Color',
      default: '#000000'
    }
  }
}