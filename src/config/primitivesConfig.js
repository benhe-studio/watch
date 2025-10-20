import { getMaterialOptions } from './helpers/materials'
import { createPositionControl } from './helpers/positionConfig'

export const primitivesConfig = {
  label: 'Primitives',
  expanded: true,
  isArray: true,
  itemLabel: 'Primitive',
  controls: {
    type: {
      type: 'buttons',
      label: 'Type',
      default: 'label',
      options: [
        { value: 'label', label: 'Label' },
        { value: 'hand', label: 'Hand' },
        { value: 'circularLabel', label: 'Circular Label' },
        { value: 'circularMarkers', label: 'Circular Markers' }
      ]
    },
    position: createPositionControl({
      defaultVector: 6,
      defaultOffset: 10,
      minOffset: 0,
      maxOffset: 25
    }),
    zOffset: {
      type: 'range',
      label: 'Z Offset',
      default: 0,
      min: -5,
      max: 5,
      step: 0.1
    },
    rotation: {
      type: 'range',
      label: 'Rotation (degrees)',
      default: 0,
      min: -180,
      max: 180,
      step: 1
    },
    text: {
      type: 'text',
      label: 'Text',
      default: '12',
      description: 'Text to display',
      condition: (item) => item.type === 'label'
    },
    fontSize: {
      type: 'range',
      label: 'Font Size',
      default: 2,
      min: 0.5,
      max: 10,
      step: 0.1,
      condition: (item) => item.type === 'label' || item.type === 'circularLabel'
    },
    color: {
      type: 'color',
      label: 'Color',
      default: '#000000',
      condition: (item) => item.type === 'label' || item.type === 'circularLabel' || item.type === 'circularMarkers'
    },
    material: {
      type: 'select',
      label: 'Material',
      default: 'polishedSilver',
      options: getMaterialOptions(),
      condition: (item) => item.type === 'hand'
    },
    points: {
      type: 'pointArray',
      label: 'Hand Shape Points',
      default: [[0.1, 0], [0.1, 3.5], [0, 3.8]],
      xLabel: 'Width',
      yLabel: 'Length',
      xMin: 0,
      xMax: 2,
      yMin: -2,
      yMax: 6,
      description: 'Define the hand shape. Y=0 is the pivot point.',
      condition: (item) => item.type === 'hand'
    },
    labels: {
      type: 'text',
      label: 'Labels',
      default: '12,1,2,3,4,5,6,7,8,9,10,11',
      description: 'Comma-separated list of text labels',
      condition: (item) => item.type === 'circularLabel'
    },
    radialAlignment: {
      type: 'checkbox',
      label: 'Radial Alignment',
      default: false,
      description: 'Rotate labels to align radially toward center',
      condition: (item) => item.type === 'circularLabel'
    },
    spread: {
      type: 'range',
      label: 'Spread',
      default: 5,
      min: 2,
      max: 20,
      step: 0.1,
      description: 'Distance from center',
      condition: (item) => item.type === 'circularLabel' || item.type === 'circularMarkers'
    },
    markerCount: {
      type: 'range',
      label: 'Number of Markers',
      default: 12,
      min: 1,
      max: 60,
      step: 1,
      description: 'Total number of markers to render',
      condition: (item) => item.type === 'circularMarkers'
    },
    markerSkip: {
      type: 'range',
      label: 'Skip Pattern',
      default: 0,
      min: 0,
      max: 10,
      step: 1,
      description: 'Skip every Nth marker (0 = no skip, 1 = every other, 2 = every second)',
      condition: (item) => item.type === 'circularMarkers'
    },
    markerLength: {
      type: 'range',
      label: 'Marker Length',
      default: 1,
      min: 0.1,
      max: 5,
      step: 0.1,
      description: 'Length of each marker line',
      condition: (item) => item.type === 'circularMarkers'
    },
    markerWidth: {
      type: 'range',
      label: 'Marker Width',
      default: 0.1,
      min: 0.01,
      max: 0.5,
      step: 0.01,
      description: 'Width/thickness of each marker line',
      condition: (item) => item.type === 'circularMarkers'
    }
  }
}