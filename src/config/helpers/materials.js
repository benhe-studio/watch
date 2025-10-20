import * as THREE from 'three'

// Material presets for watch face components
// Each material defines PBR properties for MeshPhysicalMaterial
export const materialConfigs = {
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
  },
  polishedRoseGold: {
    name: 'Polished Rose Gold',
    color: '#ffd2ad',
    roughness: 0.15,
    metalness: 1.0,
    clearcoat: 0.4,
    clearcoatRoughness: 0.1,
    reflectivity: 1.0,
    ior: 1.5
  },
  polishedNavyBlue: {
    name: 'Polished Navy Blue',
    color: '#001f3f',
    roughness: 0.1,
    metalness: 1.0,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1,
    reflectivity: 1.0,
    ior: 1.5
  },
  polishedForestGreen: {
    name: 'Polished Forest Green',
    color: '#228b22',
    roughness: 0.1,
    metalness: 1.0,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1,
    reflectivity: 1.0,
    ior: 1.5
  },
  matteOffWhite: {
    name: 'Matte Off White',
    color: '#fffaf8',
    roughness: 0.85,
    metalness: 0.0,
    clearcoat: 0.0,
    clearcoatRoughness: 0.0,
    reflectivity: 0.25,
    ior: 1.5
  }
}

// Material instance cache
const materialInstances = new Map()

/**
 * Creates a THREE.MeshPhysicalMaterial instance from a material configuration
 * @param {Object} config - Material configuration object
 * @returns {THREE.MeshPhysicalMaterial} Material instance
 */
function createMaterialInstance(config) {
  const material = new THREE.MeshPhysicalMaterial({
    color: config.color,
    roughness: config.roughness,
    metalness: config.metalness,
    clearcoat: config.clearcoat || 0,
    clearcoatRoughness: config.clearcoatRoughness || 0,
    reflectivity: config.reflectivity || 0.5,
    ior: config.ior || 1.5,
    emissive: config.emissive || '#000000',
    emissiveIntensity: config.emissiveIntensity || 0,
    toneMapped: false
  })
  
  return material
}

/**
 * Get or create a material instance by key
 * Uses caching to ensure the same material instance is reused
 * @param {string} materialKey - Key of the material in materialConfigs
 * @returns {THREE.MeshPhysicalMaterial} Material instance
 */
export function getMaterialInstance(materialKey) {
  // Default to polishedSilver if key not found
  const key = materialConfigs[materialKey] ? materialKey : 'polishedSilver'
  
  // Return cached instance if it exists
  if (materialInstances.has(key)) {
    return materialInstances.get(key)
  }
  
  // Create new instance and cache it
  const config = materialConfigs[key]
  const instance = createMaterialInstance(config)
  materialInstances.set(key, instance)
  
  return instance
}

/**
 * Clear all cached material instances
 * Useful for cleanup or when materials need to be recreated
 */
export function clearMaterialCache() {
  materialInstances.forEach(material => material.dispose())
  materialInstances.clear()
}

/**
 * Get material configuration (for backwards compatibility)
 * @param {string} materialKey - Key of the material
 * @returns {Object} Material configuration object
 */
export function getMaterial(materialKey) {
  return materialConfigs[materialKey] || materialConfigs.polishedSilver
}

/**
 * Update a material instance's properties
 * @param {string} materialKey - Key of the material to update
 * @param {Object} properties - Properties to update on the material
 */
export function updateMaterialProperties(materialKey, properties) {
  const material = materialInstances.get(materialKey)
  if (material) {
    Object.keys(properties).forEach(key => {
      if (key === 'color' || key === 'emissive') {
        material[key].set(properties[key])
      } else {
        material[key] = properties[key]
      }
    })
  }
}

/**
 * Get list of material options for UI
 * @returns {Array} Array of {value, label} objects
 */
export function getMaterialOptions() {
  return Object.keys(materialConfigs).map(key => ({
    value: key,
    label: materialConfigs[key].name
  }))
}

// Export materialConfigs as materials for backwards compatibility
export const materials = materialConfigs