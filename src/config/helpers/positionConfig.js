/**
 * Creates a standardized position control configuration
 * This returns a special control type that will be rendered as a grouped UI component
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.defaultVector - Default vector value (clock hour, 0-12) (default: 6)
 * @param {number} options.defaultOffset - Default offset from center (default: 10)
 * @param {number} options.minVector - Minimum vector value (default: 0)
 * @param {number} options.maxVector - Maximum vector value (default: 12)
 * @param {number} options.minOffset - Minimum offset (default: 0)
 * @param {number} options.maxOffset - Maximum offset (default: 25)
 * @param {Function} options.condition - Optional condition function to show/hide the control
 * @returns {Object} Position control configuration
 */
export function createPositionControl(options = {}) {
  const {
    defaultVector = 6,
    defaultOffset = 10,
    minVector = 0,
    maxVector = 12,
    minOffset = 0,
    maxOffset = 25,
    condition = null
  } = options

  return {
    type: 'position',
    label: 'Position',
    default: {
      vector: defaultVector,
      offset: defaultOffset
    },
    config: {
      vector: {
        min: minVector,
        max: maxVector,
        step: 0.1
      },
      offset: {
        min: minOffset,
        max: maxOffset,
        step: 0.1
      }
    },
    condition
  }
}