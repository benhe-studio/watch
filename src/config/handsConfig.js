export const handsConfig = {
  label: 'Hands',
  expanded: true,
  controls: {
    profile: {
      type: 'buttons',
      label: 'Profile',
      default: 'classic',
      options: [
        { value: 'classic', label: 'Classic' },
        { value: 'modern', label: 'Modern' },
        { value: 'minimal', label: 'Minimal' },
        { value: 'dauphine', label: 'Dauphine' }
      ]
    }
  }
}