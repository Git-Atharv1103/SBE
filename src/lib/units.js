/**
 * Central Unit Conversion Utility for Shree Balaji Enterprises
 * All conversions retain full floating-point precision.
 */

// Length conversions
export function inchToMm(inch) {
  const val = parseFloat(inch) || 0;
  return val * 25.4;
}

export function mmToInch(mm) {
  const val = parseFloat(mm) || 0;
  return val / 25.4;
}

export function inchToFeet(inch) {
  const val = parseFloat(inch) || 0;
  return val / 12;
}

export function feetToInch(feet) {
  const val = parseFloat(feet) || 0;
  return val * 12;
}

export function mmToFeet(mm) {
  const val = parseFloat(mm) || 0;
  return val / 304.8;
}

export function feetToMm(feet) {
  const val = parseFloat(feet) || 0;
  return val * 304.8;
}

export function inchToMeters(inch) {
  const val = parseFloat(inch) || 0;
  return val * 0.0254;
}

export function feetToMeters(feet) {
  const val = parseFloat(feet) || 0;
  return val * 0.3048;
}

export function mmToMeters(mm) {
  const val = parseFloat(mm) || 0;
  return val / 1000;
}

/**
 * Standardize any length dimension to meters
 * @param {number|string} length 
 * @param {'inch'|'ft'|'mm'|'m'} unit 
 * @returns {number} length in meters
 */
export function toMeters(length, unit = 'inch') {
  const val = parseFloat(length) || 0;
  if (val <= 0) return 0;
  
  switch ((unit || '').toLowerCase()) {
    case 'ft':
    case 'feet':
      return feetToMeters(val);
    case 'mm':
      return mmToMeters(val);
    case 'm':
    case 'meter':
    case 'meters':
      return val;
    case 'inch':
    case 'in':
    default:
      return inchToMeters(val);
  }
}
