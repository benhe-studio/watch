import { getMaterialOptions } from './helpers/materials'

export const faceConfig = {
  label: 'Face',
  expanded: true,
  controls: {
    material: {
      type: 'select',
      label: 'Material',
      default: 'brushedSteel',
      options: getMaterialOptions()
    },
    textureImage: {
      type: 'image',
      label: 'Custom Texture',
      default: null,
      description: 'Upload an image to use as face texture. Note: Custom texture will only work when no complication windows are added.',
      serialize: false // Don't save to JSON since image data is not persisted
    },
    pinionRadius: {
      type: 'range',
      label: 'Pinion Radius',
      default: 0.5,
      min: 0.1,
      max: 2,
      step: 0.1
    },
    pinionHeight: {
      type: 'range',
      label: 'Pinion Height',
      default: 2,
      min: 0.1,
      max: 4,
      step: 0.1
    },
    pinionMaterial: {
      type: 'select',
      label: 'Pinion Material',
      default: 'polishedSilver',
      options: getMaterialOptions()
    }
  }
}