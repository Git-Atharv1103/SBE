/**
 * Shree Balaji Enterprises — Universal Calculation Engine
 * Single source of truth for all weight and commercial pricing calculations.
 * ONLY Stainless Steel is supported.
 */

import { 
  getGaugeWeightPerSqFt, 
  getPipeWeightPerFoot, 
  getAngleWeightPerFoot, 
  DEFAULT_GST_PERCENT 
} from './constants.js';

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
 * Weight = Length (ft) × WeightPerFoot(Pipe Gauge) × Quantity
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
        (!arg1.pipeSize && !arg1.gauge) ||
        arg1.quantity === '' || arg1.quantity === null || arg1.quantity === undefined) {
      return 0;
    }
    l = parseFloat(arg1.length);
    pipeSize = arg1.pipeSize || arg1.gauge || arg1.size || '';
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
 * Universal Angle Weight Calculation (Workshop kg-per-foot method)
 * 
 * Formula:
 * Weight = Length (ft) × WeightPerFoot(Angle Gauge) × Quantity
 * 
 * @param {Object|number|string} arg1 - Options object or length in ft
 * @param {string} [arg2] - Angle gauge / size (e.g. '25 × 3 mm', '30 × 3 mm')
 * @param {number|string} [arg3] - Quantity
 * @returns {number} Calculated weight in kg (floating point)
 */
export function calculateAngleWeight(arg1, arg2, arg3) {
  let l, gauge, q;

  if (typeof arg1 === 'object' && arg1 !== null) {
    if (arg1.length === '' || arg1.length === null || arg1.length === undefined ||
        (!arg1.gauge && !arg1.size) ||
        arg1.quantity === '' || arg1.quantity === null || arg1.quantity === undefined) {
      return 0;
    }
    l = parseFloat(arg1.length);
    gauge = arg1.gauge || arg1.size || '';
    q = parseFloat(arg1.quantity);
  } else {
    if (arg1 === '' || arg1 === null || arg1 === undefined ||
        !arg2 ||
        arg3 === '' || arg3 === null || arg3 === undefined) {
      return 0;
    }
    l = parseFloat(arg1);
    gauge = arg2 || '';
    q = parseFloat(arg3);
  }

  if (isNaN(l) || isNaN(q) || l <= 0 || q <= 0 || !gauge) {
    return 0;
  }

  const weightPerFt = getAngleWeightPerFoot(gauge);
  return l * weightPerFt * q;
}

/**
 * Universal Purchased Item Price Calculation
 * 
 * Formula: Total Price = Quantity × Price
 * Returns null if either Quantity or Price is empty/invalid/<=0.
 * 
 * @param {Object|number|string} arg1 - Options object or quantity
 * @param {number|string} [arg2] - Price in ₹
 * @returns {number|null} Calculated total price in ₹ (rounded to 2 decimals) or null
 */
export function calculatePurchasedItemPrice(arg1, arg2) {
  let q, p;

  if (typeof arg1 === 'object' && arg1 !== null) {
    if (arg1.quantity === '' || arg1.quantity === null || arg1.quantity === undefined ||
        arg1.price === '' || arg1.price === null || arg1.price === undefined) {
      return null;
    }
    q = parseFloat(arg1.quantity);
    p = parseFloat(arg1.price);
  } else {
    if (arg1 === '' || arg1 === null || arg1 === undefined ||
        arg2 === '' || arg2 === null || arg2 === undefined) {
      return null;
    }
    q = parseFloat(arg1);
    p = parseFloat(arg2);
  }

  if (isNaN(q) || isNaN(p) || q <= 0 || p < 0) {
    return null;
  }

  const totalPrice = q * p;
  return Math.round(totalPrice * 100) / 100;
}

/**
 * Universal Purchased Item Weight Calculation (Legacy backward compatibility)
 */
export function calculatePurchasedItemWeight() {
  return 0;
}

/**
 * Universal Row Weight Calculation
 * Determines the calculation type automatically and applies the appropriate formula.
 * Sheet, Pipe, and Angle materials have weight; Purchased items use price instead of weight (return 0).
 * 
 * @param {Object} row - Material specification row
 * @returns {number} Calculated weight in kg (number >= 0)
 */
export function calculateRowWeight(row) {
  if (!row) return 0;

  const type = String(row.calculationType || row.category || '').toLowerCase().trim();

  if (type === 'sheet' || (row.width !== undefined && row.width !== null && row.width !== '' && row.length !== undefined && !row.pipeSize && type !== 'angle')) {
    return calculateSheetWeight(row);
  }

  if (type === 'pipe' || (row.pipeSize !== undefined && row.pipeSize !== '')) {
    return calculatePipeWeight(row);
  }

  if (type === 'angle' || (!row.width && row.length && !row.pipeSize && row.gauge)) {
    return calculateAngleWeight(row);
  }

  if (type === 'purchased') {
    return 0;
  }

  return 0;
}

/**
 * Calculate Grand Total Material Weight across sheet, pipe, and angle material rows.
 * 
 * @param {Array|Object} materials - Array of rows OR { sheets: [], pipes: [], angles: [], purchased: [] }
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
    const angles = Array.isArray(materials.angles) ? materials.angles : [];
    allRows = [...sheets, ...pipes, ...angles];
  }

  return allRows.reduce((sum, row) => sum + calculateRowWeight(row), 0);
}

// Alias for backward compatibility
export const calculateTotalMaterialWeight = calculateGrandTotalWeight;

// -------------------------------------------------------------
// COMMERCIAL PRICING CALCULATIONS
// -------------------------------------------------------------

/**
 * Calculate Total Cost of Purchased Items
 * @param {Array} purchasedItems 
 * @returns {number} Total purchased items cost in ₹
 */
export function calculatePurchasedTotal(purchasedItems) {
  if (!Array.isArray(purchasedItems)) return 0;
  return purchasedItems.reduce((sum, item) => {
    const itemPrice = calculatePurchasedItemPrice(item);
    return sum + (itemPrice !== null ? itemPrice : 0);
  }, 0);
}

/**
 * Material Cost = (Grand Total Material Weight × Material Rate)
 */
export function calculateMaterialCost(totalWeight, materialRate) {
  const w = parseFloat(totalWeight) || 0;
  const r = parseFloat(materialRate) || 0;
  return w * r;
}

/**
 * Calculate Discounted Material Cost (Discount applies ONLY to Material Cost)
 * @param {number|string} materialCost 
 * @param {number|string} discount 
 * @returns {number} Discounted material cost (>= 0)
 */
export function calculateDiscountedMaterialCost(materialCost, discount) {
  const m = parseFloat(materialCost) || 0;
  const d = parseFloat(discount) || 0;
  return Math.max(0, m - d);
}

/**
 * Subtotal (Legacy backward compatibility: Material Cost + Purchased Cost + Labour)
 */
export function calculateSubtotal(materialCost, labourCost, purchasedCost = 0) {
  const m = parseFloat(materialCost) || 0;
  const l = parseFloat(labourCost) || 0;
  const p = parseFloat(purchasedCost) || 0;
  return m + l + p;
}

/**
 * Taxable Amount (Discounted Material Cost + Purchased Item Cost + Labour Cost)
 */
export function calculateTaxableAmount(discountedMaterialCost, purchasedItemCost, labourCost) {
  const dm = parseFloat(discountedMaterialCost) || 0;
  const p = parseFloat(purchasedItemCost) || 0;
  const l = parseFloat(labourCost) || 0;
  return Math.max(0, dm + p + l);
}

/**
 * GST Amount = Combined Taxable Base Amount × GST% / 100
 */
export function calculateGSTAmount(taxableAmount, gstPercent) {
  const t = parseFloat(taxableAmount) || 0;
  const g = parseFloat(gstPercent) || 0;
  return (t * g) / 100;
}

// Alias for backward compatibility
export const calculateGST = calculateGSTAmount;

/**
 * Grand Total Estimate = Discounted Material Cost + Purchased Item Cost + Labour Cost + GST Amount
 */
export function calculateGrandTotalEstimate(discountedMaterialCost, purchasedItemCost, labourCost, gstAmount) {
  const dm = parseFloat(discountedMaterialCost) || 0;
  const p = parseFloat(purchasedItemCost) || 0;
  const l = parseFloat(labourCost) || 0;
  const g = parseFloat(gstAmount) || 0;
  return Math.max(0, dm + p + l + g);
}

// Alias for backward compatibility
export const calculateGrandTotal = calculateGrandTotalEstimate;

/**
 * Master Estimate Calculation Engine
 * 
 * Formula Flow:
 * 1. Grand Total Material Weight = Sum of (Sheet + Pipe + Angle) weights
 * 2. Material Cost = Grand Total Material Weight × Material Rate
 * 3. Purchased Item Cost = Sum of (Purchased Item Quantity × Price)
 * 4. Discounted Material Cost = max(Material Cost - Discount, 0) [Discount applies ONLY to Material Cost]
 * 5. Combined Taxable Base = Discounted Material Cost + Purchased Item Cost + Labour Cost
 * 6. GST Amount = Combined Taxable Base × GST% / 100
 * 7. Grand Total Estimate = Discounted Material Cost + Purchased Item Cost + Labour Cost + GST Amount
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
  let purchasedRows = [];
  if (materials) {
    if (Array.isArray(materials)) {
      purchasedRows = materials.filter(m => {
        const cat = (m.calculationType || m.category || '').toLowerCase();
        return cat === 'purchased' || cat === 'compressor' || cat === 'special';
      });
    } else if (typeof materials === 'object') {
      const pur = Array.isArray(materials.purchased) ? materials.purchased : [];
      const comp = Array.isArray(materials.compressor) ? materials.compressor : [];
      purchasedRows = [...pur, ...comp];
    }
  }

  const totalWeight = totalMaterialWeight !== undefined && !isNaN(parseFloat(totalMaterialWeight))
    ? parseFloat(totalMaterialWeight)
    : calculateGrandTotalWeight(materials);

  const rate = parseFloat(materialRate) || 0;
  const labour = parseFloat(labourCost) || 0;
  const disc = parseFloat(discount) || 0;
  const gstPct = gst !== undefined && !isNaN(parseFloat(gst)) ? parseFloat(gst) : DEFAULT_GST_PERCENT;

  // 1. Material Cost from fabricated weight
  const materialCost = calculateMaterialCost(totalWeight, rate);

  // 2. Purchased Item Cost calculated separately
  const purchasedItemCost = calculatePurchasedTotal(purchasedRows);

  // 3. Discount applied ONLY to Material Cost
  const discountedMaterialCost = calculateDiscountedMaterialCost(materialCost, disc);

  // 4. Combined Taxable Base for GST
  const taxableAmount = calculateTaxableAmount(discountedMaterialCost, purchasedItemCost, labour);

  // 5. GST Amount
  const gstAmount = calculateGSTAmount(taxableAmount, gstPct);

  // 6. Grand Total Estimate
  const grandTotal = calculateGrandTotalEstimate(discountedMaterialCost, purchasedItemCost, labour, gstAmount);

  return {
    totalWeight,
    materialRate: rate,
    materialCost,
    purchasedItemCost,
    purchasedItemsCost: purchasedItemCost,
    discountedMaterialCost,
    labourCost: labour,
    discount: disc,
    taxableAmount,
    gstPercent: gstPct,
    gstAmount,
    grandTotal,
    totalAmount: grandTotal
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
 * Format purchased item total price for table display
 * @param {number|string} price 
 * @returns {string} e.g. "₹ 200.00" or "—"
 */
export function formatPurchasedPrice(price) {
  if (price === null || price === undefined || price === '') return '—';
  const val = parseFloat(price);
  if (isNaN(val) || val < 0) return '—';
  return `₹ ${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format purchased item total weight (legacy compatibility)
 */
export function formatPurchasedWeight() {
  return '—';
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

/**
 * Convert numeric amount into Indian Currency Words (Lakhs, Crores, Thousands, Paise)
 * @param {number|string} amount 
 * @returns {string} e.g. "Indian Rupees Fourteen Thousand Nine Hundred Twenty Five Only"
 */
export function numberToWords(amount) {
  if (amount === null || amount === undefined || amount === '') return 'Zero Rupees Only';
  const val = parseFloat(amount);
  if (isNaN(val)) return 'Zero Rupees Only';
  if (val === 0) return 'Zero Rupees Only';
  if (val < 0) return `Minus ${numberToWords(Math.abs(val))}`;

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const twoDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tensMultiple = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertChunk(n) {
    let str = '';
    if (n >= 100) {
      str += singleDigits[Math.floor(n / 100)] + ' Hundred ';
      n %= 100;
    }
    if (n >= 10 && n <= 19) {
      str += twoDigits[n - 10] + ' ';
    } else if (n >= 20) {
      str += tensMultiple[Math.floor(n / 10)] + ' ';
      if (n % 10 > 0) {
        str += singleDigits[n % 10] + ' ';
      }
    } else if (n > 0) {
      str += singleDigits[n] + ' ';
    }
    return str.trim();
  }

  const rounded = Math.round(val * 100) / 100;
  const integerPart = Math.floor(rounded);
  const decimalPart = Math.round((rounded - integerPart) * 100);

  let crores = Math.floor(integerPart / 10000000);
  let remainder = integerPart % 10000000;
  let lakhs = Math.floor(remainder / 100000);
  remainder = remainder % 100000;
  let thousands = Math.floor(remainder / 1000);
  remainder = remainder % 1000;
  let hundreds = remainder;

  let words = '';
  if (crores > 0) {
    words += convertChunk(crores) + ' Crore ';
  }
  if (lakhs > 0) {
    words += convertChunk(lakhs) + ' Lakh ';
  }
  if (thousands > 0) {
    words += convertChunk(thousands) + ' Thousand ';
  }
  if (hundreds > 0) {
    words += convertChunk(hundreds) + ' ';
  }

  words = words.trim();
  if (!words) {
    words = 'Zero';
  }

  let result = `Indian Rupees ${words}`;

  if (decimalPart > 0) {
    result += ` and ${convertChunk(decimalPart)} Paise`;
  }

  result += ' Only';
  return result;
}

