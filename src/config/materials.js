// Material presets for watch face components
// Each material defines PBR properties for MeshPhysicalMaterial

export const materials = {
  polishedSilver: {
    name: 'Polished Silver',
    color: '#c0c0c0',
    roughness: 0.1,
    metalness: 1.0,
    clearcoat: 0.3,
    clearcoatRoughness: 0.1,
    reflectivity: 1.0,
    ior: 1.5
  },
  matteWhitePlastic: {
    name: 'Matte White Plastic',
    color: '#f5f5f5',
    roughness: 0.8,
    metalness: 0.0,
    clearcoat: 0.0,
    clearcoatRoughness: 0.0,
    reflectivity: 0.3,
    ior: 1.5
  },
  polishedGold: {
    name: 'Polished Gold',
    color: '#ffd700',
    roughness: 0.15,
    metalness: 1.0,
    clearcoat: 0.4,
    clearcoatRoughness: 0.1,
    reflectivity: 1.0,
    ior: 1.5
  },
  brushedSteel: {
    name: 'Brushed Steel',
    color: '#b0b0b0',
    roughness: 0.4,
    metalness: 0.9,
    clearcoat: 0.1,
    clearcoatRoughness: 0.3,
    reflectivity: 0.8,
    ior: 1.5
  },
  matteBlackPlastic: {
    name: 'Matte Black Plastic',
    color: '#2a2a2a',
    roughness: 0.9,
    metalness: 0.0,
    clearcoat: 0.0,
    clearcoatRoughness: 0.0,
    reflectivity: 0.2,
    ior: 1.5
  },
  polishedCopper: {
    name: 'Polished Copper',
    color: '#b87333',
    roughness: 0.2,
    metalness: 1.0,
    clearcoat: 0.35,
    clearcoatRoughness: 0.15,
    reflectivity: 1.0,
    ior: 1.5
  },
  glossyWhitePlastic: {
    name: 'Glossy White Plastic',
    color: '#ffffff',
    roughness: 0.2,
    metalness: 0.0,
    clearcoat: 0.8,
    clearcoatRoughness: 0.1,
    reflectivity: 0.5,
    ior: 1.5
  },
  titanium: {
    name: 'Titanium',
    color: '#878681',
    roughness: 0.3,
    metalness: 0.95,
    clearcoat: 0.2,
    clearcoatRoughness: 0.2,
    reflectivity: 0.9,
    ior: 1.5
  },
  lume: {
    name: 'Lume',
    color: '#a3a52b',
    roughness: 0.7,
    metalness: 0.0,
    clearcoat: 0.0,
    clearcoatRoughness: 0.0,
    reflectivity: 0.3,
    ior: 1.5,
    emissive: '#7ddfb9',
    emissiveIntensity: 20.0
  }
}

// Helper function to get material properties
export function getMaterial(materialKey) {
  return materials[materialKey] || materials.polishedSilver
}

// Get list of material options for UI
export function getMaterialOptions() {
  return Object.keys(materials).map(key => ({
    value: key,
    label: materials[key].name
  }))
}