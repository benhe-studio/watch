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
    }
  }
}