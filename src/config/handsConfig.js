import { getMaterialOptions } from './materials'

export const handsConfig = {
  label: 'Hands',
  expanded: true,
  isArray: true,
  itemLabel: 'Hand',
  controls: {
    type: {
      type: 'buttons',
      label: 'Type',
      default: 'parametricFlat',
      options: [
        { value: 'parametricFlat', label: 'Parametric Flat' },
        { value: 'parametricFaceted', label: 'Parametric Faceted' },
        { value: 'circle', label: 'Circle' }
      ]
    },
    movement: {
      type: 'buttons',
      label: 'Movement',
      default: 'seconds',
      options: [
        { value: 'hours', label: 'Hours' },
        { value: 'minutes', label: 'Minutes' },
        { value: 'seconds', label: 'Seconds' },
        { value: 'fixed', label: 'Fixed' }
      ]
    },
    material: {
      type: 'select',
      label: 'Material',
      default: 'matteBlackPlastic',
      options: getMaterialOptions()
    },
    points: {
      type: 'pointArray',
      label: 'Shape Points',
      default: [[0, -4], [1.2, 0], [0, 14]],
      condition: (item) => item.type === 'parametricFlat' || item.type === 'parametricFaceted',
      xLabel: 'X (Width)',
      yLabel: 'Y (Length)',
      xMin: 0,
      xMax: 4,
      xStep: 0.1,
      yMin: -6,
      yMax: 20,
      yStep: 0.5,
      minPoints: 2,
      description: 'Define half of the hand shape. Y=0 is the pivot point, negative Y extends towards tail, positive Y towards tip'
    },
    bevelEnabled: {
      type: 'checkbox',
      label: 'Enable Bevel',
      default: true,
      condition: (item) => item.type === 'parametricFlat'
    },
    bevelThickness: {
      type: 'range',
      label: 'Bevel Thickness',
      default: 0.05,
      min: 0.01,
      max: 0.2,
      step: 0.01,
      condition: (item) => item.type === 'parametricFlat' && item.bevelEnabled
    },
    bevelSize: {
      type: 'range',
      label: 'Bevel Size',
      default: 0.05,
      min: 0.01,
      max: 0.2,
      step: 0.01,
      condition: (item) => item.type === 'parametricFlat' && item.bevelEnabled
    },
    bevelSegments: {
      type: 'range',
      label: 'Bevel Segments',
      default: 3,
      min: 1,
      max: 8,
      step: 1,
      condition: (item) => item.type === 'parametricFlat' && item.bevelEnabled
    },
    cutout: {
      type: 'range',
      label: 'Cutout',
      default: 0,
      min: 0,
      max: 0.95,
      step: 0.05,
      condition: (item) => item.type === 'circle' && item.circleShape === 'flat'
    },
    cutoutPoints: {
      type: 'pointArray',
      label: 'Cutout Points',
      default: [],
      condition: () => false, // Hidden - now integrated into the points editor
      xLabel: 'X (Width)',
      yLabel: 'Y (Length)',
      xMin: 0,
      xMax: 5,
      xStep: 0.1,
      yMin: -6,
      yMax: 20,
      yStep: 0.5,
      minPoints: 0,
      description: 'Define half of the cutout shape. Points create a hole that is subtracted from the hand shape'
    },
    radius: {
      type: 'range',
      label: 'Radius',
      default: 1,
      min: 0.1,
      max: 5,
      step: 0.1,
      condition: (item) => item.type === 'circle'
    },
    spread: {
      type: 'range',
      label: 'Spread',
      default: 0,
      min: -10,
      max: 20,
      step: 0.5,
      condition: (item) => item.type === 'circle',
      description: 'Distance from center (0,0) where the circle is positioned'
    },
    circleShape: {
      type: 'buttons',
      label: 'Shape',
      default: 'flat',
      options: [
        { value: 'flat', label: 'Flat' },
        { value: 'dome', label: 'Dome' }
      ],
      condition: (item) => item.type === 'circle'
    },
    zOffset: {
      type: 'range',
      label: 'Z Offset',
      default: 0,
      min: -2,
      max: 2,
      step: 0.1,
      condition: (item) => item.type === 'parametricFlat' || item.type === 'parametricFaceted' || item.type === 'circle',
      description: 'Additional Z-axis offset for fine-tuning hand height'
    }
  }
}