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
        { value: 'taperedCylinder', label: 'Tapered' },
        { value: 'parametric', label: 'Parametric' }
      ]
    },
    width: {
      type: 'range',
      label: 'Width',
      default: 0.5,
      min: 0.1,
      max: 2,
      step: 0.1,
      condition: (item) => item.profile !== 'parametric'
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
      step: 0.5,
      condition: (item) => item.profile !== 'parametric'
    },
    offset: {
      type: 'range',
      label: 'Offset',
      default: 0,
      min: 0,
      max: 1,
      step: 0.05,
      condition: (item) => item.profile !== 'parametric'
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
      default: [[0.3, -2], [0.5, 0], [0.3, 14], [0, 18]],
      condition: (item) => item.profile === 'parametric',
      xLabel: 'X (Width)',
      yLabel: 'Y (Length)',
      xMin: 0,
      xMax: 2,
      xStep: 0.1,
      yMin: -5,
      yMax: 20,
      yStep: 0.5,
      description: 'Define half of the hand shape. Y=0 is the pivot point, negative Y extends towards tail, positive Y towards tip'
    },
    bevelEnabled: {
      type: 'checkbox',
      label: 'Enable Bevel',
      default: true,
      condition: (item) => item.profile === 'parametric'
    },
    bevelThickness: {
      type: 'range',
      label: 'Bevel Thickness',
      default: 0.05,
      min: 0.01,
      max: 0.2,
      step: 0.01,
      condition: (item) => item.profile === 'parametric' && item.bevelEnabled
    },
    bevelSize: {
      type: 'range',
      label: 'Bevel Size',
      default: 0.05,
      min: 0.01,
      max: 0.2,
      step: 0.01,
      condition: (item) => item.profile === 'parametric' && item.bevelEnabled
    },
    bevelSegments: {
      type: 'range',
      label: 'Bevel Segments',
      default: 3,
      min: 1,
      max: 8,
      step: 1,
      condition: (item) => item.profile === 'parametric' && item.bevelEnabled
    },
    cutout: {
      type: 'range',
      label: 'Cutout',
      default: 0,
      min: 0,
      max: 0.95,
      step: 0.05,
      condition: (item) => item.profile === 'parametric'
    }
  }
}