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
      default: 'parametricFlat',
      options: [
        { value: 'taperedCylinder', label: 'Tapered' },
        { value: 'parametricFlat', label: 'Parametric Flat' },
        { value: 'parametricFaceted', label: 'Parametric Faceted' }
      ]
    },
    width: {
      type: 'range',
      label: 'Width',
      default: 0.5,
      min: 0.1,
      max: 2,
      step: 0.1,
      condition: (item) => item.profile === 'taperedCylinder'
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
      condition: (item) => item.profile === 'taperedCylinder'
    },
    offset: {
      type: 'range',
      label: 'Offset',
      default: 0,
      min: 0,
      max: 1,
      step: 0.05,
      condition: (item) => item.profile === 'taperedCylinder'
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
      condition: (item) => item.profile === 'parametricFlat' || item.profile === 'parametricFaceted',
      xLabel: 'X (Width)',
      yLabel: 'Y (Length)',
      xMin: 0,
      xMax: 2,
      xStep: 0.1,
      yMin: -5,
      yMax: 20,
      yStep: 0.5,
      minPoints: 2,
      description: 'Define half of the hand shape. Y=0 is the pivot point, negative Y extends towards tail, positive Y towards tip'
    },
    bevelEnabled: {
      type: 'checkbox',
      label: 'Enable Bevel',
      default: true,
      condition: (item) => item.profile === 'parametricFlat'
    },
    bevelThickness: {
      type: 'range',
      label: 'Bevel Thickness',
      default: 0.05,
      min: 0.01,
      max: 0.2,
      step: 0.01,
      condition: (item) => item.profile === 'parametricFlat' && item.bevelEnabled
    },
    bevelSize: {
      type: 'range',
      label: 'Bevel Size',
      default: 0.05,
      min: 0.01,
      max: 0.2,
      step: 0.01,
      condition: (item) => item.profile === 'parametricFlat' && item.bevelEnabled
    },
    bevelSegments: {
      type: 'range',
      label: 'Bevel Segments',
      default: 3,
      min: 1,
      max: 8,
      step: 1,
      condition: (item) => item.profile === 'parametricFlat' && item.bevelEnabled
    },
    cutout: {
      type: 'range',
      label: 'Cutout',
      default: 0,
      min: 0,
      max: 0.95,
      step: 0.05,
      condition: (item) => item.profile === 'parametricFlat'
    },
    cutoutPoints: {
      type: 'pointArray',
      label: 'Cutout Points',
      default: [],
      condition: (item) => item.profile === 'parametricFaceted',
      xLabel: 'X (Width)',
      yLabel: 'Y (Length)',
      xMin: 0,
      xMax: 2,
      xStep: 0.1,
      yMin: -5,
      yMax: 20,
      yStep: 0.5,
      minPoints: 0,
      description: 'Define half of the cutout shape. Points create a hole that is subtracted from the hand shape'
    }
  }
}