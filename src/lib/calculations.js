/**
 * Shree Balaji Enterprises — Universal Calculation Engine
 * Single source of truth for all weight and commercial pricing calculations.
 * ONLY Stainless Steel is supported.
 */

import { getGaugeWeightPerSqFt, getPipeWeightPerFoot, DEFAULT_GST_PERCENT } from './constants.js';

/**
 * Universal Sheet Weight Calculation (Workshop kg-per-square-foot method)
 * 
 * Formula:
 * 1. Area in square feet: Area = (Length in inches × Width in inches) / 144
 * 2. Weight = Area × WeightPerSqFt(gauge) × Quantity
 * 
 * @param {Object|number|string} arg1 - Options object or length in inches
 * @param {number|string} [arg2] - Width in inches
 * @param {number|string} [arg3] - Gauge in mm
 * @param {number|string} [arg4] - Quantity
 * @returns {number} Calculated weight in kg (floating point)
 */
export function calculateSheetWeight(arg1, arg2, arg3, arg4) {
  let l, w, g, q;

  if (typeof arg1 === 'object' && arg1 !== null) {
    if (arg1.length === '' || arg1.length === null || arg1.length === undefined ||
        arg1.width === '' || arg1.width === null || arg1.width === undefined ||
        arg1.gauge === '' || arg1.gauge === null || arg1.gauge === undefined ||
        arg1.quantity === '' || arg1.quantity === null || arg1.quantity === undefined) {
      return 0;
    }
    l = parseFloat(arg1.length);
    w = parseFloat(arg1.width);
    g = parseFloat(arg1.gauge);
    q = parseFloat(arg1.quantity);
  } else {
    if (arg1 === '' || arg1 === null || arg1 === undefined ||
        arg2 === '' || arg2 === null || arg2 === undefined ||
        arg3 === '' || arg3 === null || arg3 === undefined ||
        arg4 === '' || arg4 === null || arg4 === undefined) {
      return 0;
    }
    l = parseFloat(arg1);
    w = parseFloat(arg2);
    g = parseFloat(arg3);
    q = parseFloat(arg4);
  }

  if (isNaN(l) || isNaN(w) || isNaN(g) || isNaN(q) || l <= 0 || w <= 0 || g <= 0 || q <= 0) {
    return 0;
  }

  const areaSqFt = (l * w) / 144;
  const weightPerSqFt = getGaugeWeightPerSqFt(g);

  return areaSqFt * weightPerSqFt * q;
}

/**
 * Universal Pipe Weight Calculation (Workshop kg-per-foot method)
 * 
 * Formula:
 * Weight = Length (ft) × WeightPerFoot(Pipe Size) × Quantity
 * 
 * @param {Object|number|string} arg1 - Options object or length in ft
 * @param {string} [arg2] - Pipe size description / ID
 * @param {number|string} [arg3] - Quantity
 * @returns {number} Calculated weight in kg (floating point)
 */
export function calculatePipeWeight(arg1, arg2, arg3) {
  let l, pipeSize, q;

  if (typeof arg1 === 'object' && arg1 !== null) {
    if (arg1.length === '' || arg1.length === null || arg1.length === undefined ||
        !arg1.pipeSize ||
        arg1.quantity === '' || arg1.quantity === null || arg1.quantity === undefined) {
      return 0;
    }
    l = parseFloat(arg1.length);
    pipeSize = arg1.pipeSize || arg1.size || '';
    q = parseFloat(arg1.quantity);
  } else {
    if (arg1 === '' || arg1 === null || arg1 === undefined ||
        !arg2 ||
        arg3 === '' || arg3 === null || arg3 === undefined) {
      return 0;
    }
    l = parseFloat(arg1);
    pipeSize = arg2 || '';
    q = parseFloat(arg3);
  }

  if (isNaN(l) || isNaN(q) || l <= 0 || q <= 0 || !pipeSize) {
    return 0;
  }

  const weightPerFt = getPipeWeightPerFoot(pipeSize);
  return l * weightPerFt * q;
}

/**
 * Universal Purchased Item Weight Calculation
 * 
 * Formula: Total Weight = Quantity × Unit Weight (kg)
 * Returns null if either Quantity or Unit Weight is empty/invalid/<=0.
 * 
 * @param {Object|number|string} arg1 - Options object or quantity
 * @param {number|string} [arg2] - Unit weight in kg
 * @returns {number|null} Calculated weight in kg (rounded to 2 decimals) or null
 */
export function calculatePurchasedItemWeight(arg1, arg2) {
  let q, uw;

  if (typeof arg1 === 'object' && arg1 !== null) {
    if (arg1.quantity === '' || arg1.quantity === null || arg1.quantity === undefined ||
        arg1.unitWeight === '' || arg1.unitWeight === null || arg1.unitWeight === undefined) {
      return null;
    }
    q = parseFloat(arg1.quantity);
    uw = parseFloat(arg1.unitWeight);
  } else {
    if (arg1 === '' || arg1 === null || arg1 === undefined ||
        arg2 === '' || arg2 === null || arg2 === undefined) {
      return null;
    }
    q = parseFloat(arg1);
    uw = parseFloat(arg2);
  }

  if (isNaN(q) || isNaN(uw) || q <= 0 || uw <= 0) {
    return null;
  }

  const weight = q * uw;
  return Math.round(weight * 100) / 100;
}

/**
 * Universal Row Weight Calculation
 * Determines the calculation type automatically and applies the appropriate formula.
 * Returns numeric 0 for incomplete/null calculations to ensure clean arithmetic sums.
 * 
 * @param {Object} row - Material specification row
 * @returns {number} Calculated weight in kg (number >= 0)
 */
export function calculateRowWeight(row) {
  if (!row) return 0;

  const type = String(row.calculationType || row.category || '').toLowerCase().trim();

  if (type === 'sheet' || row.gauge !== undefined || (row.length && row.width && !row.pipeSize)) {
    return calculateSheetWeight(row);
  }

  if (type === 'pipe' || row.pipeSize !== undefined) {
    return calculatePipeWeight(row);
  }

  if (type === 'purchased' || row.unitWeight !== undefined) {
    const purchasedWeight = calculatePurchasedItemWeight(row);
    return purchasedWeight !== null ? purchasedWeight : 0;
  }

  return 0;
}

/**
 * Calculate Grand Total Material Weight across all sheet, pipe, and purchased material rows.
 * 
 * @param {Array|Object} materials - Array of rows OR { sheets: [], pipes: [], purchased: [] }
 * @returns {number} Grand Total Material Weight in kg
 */
export function calculateGrandTotalWeight(materials) {
  if (!materials) return 0;

  let allRows = [];
  if (Array.isArray(materials)) {
    allRows = materials;
  } else if (typeof materials === 'object') {
    const sheets = Array.isArray(materials.sheets) ? materials.sheets : [];
    const pipes = Array.isArray(materials.pipes) ? materials.pipes : [];
    const purchased = Array.isArray(materials.purchased) ? materials.purchased : [];
    allRows = [...sheets, ...pipes, ...purchased];
  }

  return allRows.reduce((sum, row) => sum + calculateRowWeight(row), 0);
}

// Alias for backward compatibility
export const calculateTotalMaterialWeight = calculateGrandTotalWeight;

// -------------------------------------------------------------
// COMMERCIAL PRICING CALCULATIONS
// -------------------------------------------------------------

/**
 * Material Cost = Grand Total Material Weight × Material Rate
 */
export function calculateMaterialCost(totalWeight, materialRate) {
  const w = parseFloat(totalWeight) || 0;
  const r = parseFloat(materialRate) || 0;
  return w * r;
}

/**
 * Subtotal = Material Cost + Labour Cost
 */
export function calculateSubtotal(materialCost, labourCost) {
  const m = parseFloat(materialCost) || 0;
  const l = parseFloat(labourCost) || 0;
  return m + l;
}

/**
 * Taxable Amount = Subtotal - Discount (non-negative)
 */
export function calculateTaxableAmount(subtotal, discount) {
  const s = parseFloat(subtotal) || 0;
  const d = parseFloat(discount) || 0;
  return Math.max(0, s - d);
}

/**
 * GST Amount = Taxable Amount × GST% / 100
 */
export function calculateGSTAmount(taxableAmount, gstPercent) {
  const t = parseFloat(taxableAmount) || 0;
  const g = parseFloat(gstPercent) || 0;
  return (t * g) / 100;
}

// Alias for backward compatibility
export const calculateGST = calculateGSTAmount;

/**
 * Grand Total Estimate = Taxable Amount + GST Amount
 */
export function calculateGrandTotalEstimate(taxableAmount, gstAmount) {
  const t = parseFloat(taxableAmount) || 0;
  const g = parseFloat(gstAmount) || 0;
  return t + g;
}

// Alias for backward compatibility
export const calculateGrandTotal = calculateGrandTotalEstimate;

/**
 * Master Estimate Calculation Engine
 * 
 * @param {Object} params
 * @param {number|Object|Array} [params.materials] - Material rows or templates
 * @param {number|string} [params.totalMaterialWeight] - Precomputed weight
 * @param {number|string} [params.materialRate=0] - Rate in ₹/kg
 * @param {number|string} [params.labourCost=0] - Labour in ₹
 * @param {number|string} [params.discount=0] - Discount in ₹
 * @param {number|string} [params.gst=18] - GST percentage
 * @returns {Object} Complete calculation breakdown
 */
export function calculateEstimate({
  materials,
  totalMaterialWeight,
  materialRate = 0,
  labourCost = 0,
  discount = 0,
  gst = DEFAULT_GST_PERCENT
}) {
  const totalWeight = totalMaterialWeight !== undefined && !isNaN(parseFloat(totalMaterialWeight))
    ? parseFloat(totalMaterialWeight)
    : calculateGrandTotalWeight(materials);

  const rate = parseFloat(materialRate) || 0;
  const labour = parseFloat(labourCost) || 0;
  const disc = parseFloat(discount) || 0;
  const gstPct = gst !== undefined && !isNaN(parseFloat(gst)) ? parseFloat(gst) : DEFAULT_GST_PERCENT;

  const materialCost = calculateMaterialCost(totalWeight, rate);
  const subtotal = calculateSubtotal(materialCost, labour);
  const taxableAmount = calculateTaxableAmount(subtotal, disc);
  const gstAmount = calculateGSTAmount(taxableAmount, gstPct);
  const grandTotal = calculateGrandTotalEstimate(taxableAmount, gstAmount);

  return {
    totalWeight,
    materialRate: rate,
    materialCost,
    labourCost: labour,
    subtotal,
    discount: disc,
    taxableAmount,
    gstPercent: gstPct,
    gstAmount,
    grandTotal
  };
}

// -------------------------------------------------------------
// DISPLAY & FORMATTING HELPERS
// -------------------------------------------------------------

/**
 * Format weight for display
 * @param {number|string} weight 
 * @returns {string} e.g. "9.74 kg" or "—"
 */
export function formatWeight(weight) {
  if (weight === null || weight === undefined || weight === '') return '—';
  const val = parseFloat(weight);
  if (isNaN(val) || val <= 0) return '—';
  return `${val.toFixed(2)} kg`;
}

/**
 * Format purchased item total weight for table display without unit suffix (header contains kg)
 * @param {number|string} weight 
 * @returns {string} e.g. "1.00", "0.80", or "—"
 */
export function formatPurchasedWeight(weight) {
  if (weight === null || weight === undefined || weight === '') return '—';
  const val = parseFloat(weight);
  if (isNaN(val) || val <= 0) return '—';
  return val.toFixed(2);
}

/**
 * Format currency with Indian grouping (₹XX,XXX.XX)
 * @param {number|string} amount 
 * @returns {string} e.g. "₹ 14,924.80"
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || amount === '') return '₹ 0.00';
  const val = parseFloat(amount);
  if (isNaN(val)) return '₹ 0.00';
  return `₹ ${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
