/**
 * Creates a standardized bevel control configuration
 * This returns a special control type that will be rendered as a grouped UI component
 * 
 * @param {Object} options - Configuration options
 * @param {boolean} options.defaultEnabled - Default enabled state (default: true)
 * @param {number} options.defaultThickness - Default thickness value (default: 0.1)
 * @param {number} options.defaultSize - Default size value (default: 0.1)
 * @param {number} options.defaultSegments - Default segments value (default: 3)
 * @param {number} options.minThickness - Minimum thickness (default: 0.01)
 * @param {number} options.maxThickness - Maximum thickness (default: 0.3)
 * @param {number} options.minSize - Minimum size (default: 0.01)
 * @param {number} options.maxSize - Maximum size (default: 0.3)
 * @param {number} options.minSegments - Minimum segments (default: 1)
 * @param {number} options.maxSegments - Maximum segments (default: 8)
 * @param {Function} options.condition - Optional condition function to show/hide the control
 * @returns {Object} Bevel control configuration
 */
export function createBevelControl(options = {}) {
  const {
    defaultEnabled = true,
    defaultThickness = 0.1,
    defaultSize = 0.1,
    defaultSegments = 3,
    minThickness = 0.01,
    maxThickness = 0.3,
    minSize = 0.01,
    maxSize = 0.3,
    minSegments = 1,
    maxSegments = 8,
    condition = null
  } = options

  return {
    type: 'bevel',
    label: 'Bevel',
    default: {
      enabled: defaultEnabled,
      thickness: defaultThickness,
      size: defaultSize,
      segments: defaultSegments
    },
    config: {
      thickness: {
        min: minThickness,
        max: maxThickness,
        step: 0.01
      },
      size: {
        min: minSize,
        max: maxSize,
        step: 0.01
      },
      segments: {
        min: minSegments,
        max: maxSegments,
        step: 1
      }
    },
    condition
  }
}