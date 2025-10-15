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
        { value: 'blocks', label: 'Blocks' }
      ]
    },
    rotate: {
      type: 'checkbox',
      label: 'Rotate',
      default: false,
      condition: (item) => item.type === 'arabic'
    },
    fontSize: {
      type: 'range',
      label: 'Font Size',
      default: 0.25,
      min: 0.1,
      max: 0.5,
      step: 0.05,
      condition: (item) => item.type === 'arabic'
    },
    color: {
      type: 'color',
      label: 'Color',
      default: '#000000'
    },
    radius: {
      type: 'range',
      label: 'Radius',
      default: 1.7,
      min: 1.0,
      max: 2.5,
      step: 0.1
    },
    width: {
      type: 'range',
      label: 'Width',
      default: 0.1,
      min: 0.05,
      max: 0.3,
      step: 0.05,
      condition: (item) => item.type === 'blocks'
    },
    height: {
      type: 'range',
      label: 'Height',
      default: 0.3,
      min: 0.1,
      max: 0.6,
      step: 0.05,
      condition: (item) => item.type === 'blocks'
    },
    depth: {
      type: 'range',
      label: 'Depth',
      default: 0.05,
      min: 0.02,
      max: 0.1,
      step: 0.01,
      condition: (item) => item.type === 'blocks'
    },
    romanWidth: {
      type: 'range',
      label: 'Width',
      default: 0.08,
      min: 0.04,
      max: 0.2,
      step: 0.02,
      condition: (item) => item.type === 'roman'
    },
    romanHeight: {
      type: 'range',
      label: 'Height',
      default: 0.25,
      min: 0.1,
      max: 0.5,
      step: 0.05,
      condition: (item) => item.type === 'roman'
    },
    romanDepth: {
      type: 'range',
      label: 'Depth',
      default: 0.02,
      min: 0.01,
      max: 0.05,
      step: 0.01,
      condition: (item) => item.type === 'roman'
    },
    visibleHours: {
      type: 'hourSelector',
      label: 'Visible Hours',
      default: [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    }
  }
}