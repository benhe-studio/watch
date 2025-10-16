import { getMaterialOptions } from './materials'

export const faceConfig = {
  label: 'Face',
  expanded: true,
  controls: {
    material: {
      type: 'select',
      label: 'Material',
      default: 'brushedSteel',
      options: getMaterialOptions()
    }
  }
}