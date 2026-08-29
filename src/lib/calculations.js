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
 * Universal Sheet Weight Calculation (Workshop kg-per-square-foot method benchmarked to 32 sq.ft)
 * 
 * Formula:
 * 1. Area in square feet: Area = (Length in inches × Width in inches) / 144
 * 2. Weight per sq.ft = Reference Weight / 32
 *    - 1.5 mm: 39 kg / 32 = 1.21875 kg/sq.ft
 *    - 1.2 mm: 31 kg / 32 = 0.96875 kg/sq.ft
 *    - 1.0 mm: 25.5 kg / 32 = 0.796875 kg/sq.ft
 *    - 0.8 mm: 20 kg / 32 = 0.625 kg/sq.ft
 *    - 0.6 mm: 15.5 kg / 32 = 0.484375 kg/sq.ft
 * 3. Total Weight = Area in sq.ft × Weight per sq.ft × Quantity
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
    const rawLength = arg1.length;
    const rawWidthOrHeight = (arg1.width !== undefined && arg1.width !== null && arg1.width !== '') 
      ? arg1.width 
      : arg1.height;
    const rawGauge = arg1.gauge;
    const rawQty = arg1.quantity;

    if (rawLength === '' || rawLength === null || rawLength === undefined ||
        rawWidthOrHeight === '' || rawWidthOrHeight === null || rawWidthOrHeight === undefined ||
        rawGauge === '' || rawGauge === null || rawGauge === undefined ||
        rawQty === '' || rawQty === null || rawQty === undefined) {
      return 0;
    }
    l = parseFloat(rawLength);
    w = parseFloat(rawWidthOrHeight);
    g = parseFloat(rawGauge);
    q = parseFloat(rawQty);
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

  let areaSqFt;
  if (typeof arg1 === 'object' && arg1 !== null && arg1.depth && !isNaN(parseFloat(arg1.depth)) && parseFloat(arg1.depth) > 0) {
    const d = parseFloat(arg1.depth);
    areaSqFt = (l * w + 2 * (l + w) * d) / 144;
  } else {
    areaSqFt = (l * w) / 144;
  }

  const weightPerSqFt = getGaugeWeightPerSqFt(g);

  return areaSqFt * weightPerSqFt * q;
}

/**
 * Universal Pipe Weight Calculation (20 FT Master Chart Method)
 * 
 * Formula:
 * weightForLength = referenceWeight20ft × enteredLengthInFeet / 20
 * totalWeight = weightForLength × quantity
 * If unit is inch, enteredLengthInFeet = enteredInches / 12
 * 
 * @param {Object|number|string} arg1 - Options object or length in ft/inch
 * @param {string} [arg2] - Pipe size description
 * @param {number|string} [arg3] - Quantity
 * @returns {number} Calculated weight in kg (floating point)
 */
export function calculatePipeWeight(arg1, arg2, arg3) {
  let l, pipeSize, pipeGauge, q, unit;

  if (typeof arg1 === 'object' && arg1 !== null) {
    if (arg1.length === '' || arg1.length === null || arg1.length === undefined ||
        (!arg1.pipeSize && !arg1.pipeGauge && !arg1.gauge && !arg1.size) ||
        arg1.quantity === '' || arg1.quantity === null || arg1.quantity === undefined) {
      return 0;
    }
    l = parseFloat(arg1.length);
    unit = (arg1.unit || 'ft').toLowerCase().trim();
    pipeSize = arg1.pipeSize || arg1.size || '40 × 40 mm';
    pipeGauge = arg1.pipeGauge || arg1.gauge || '16G';
    q = parseFloat(arg1.quantity);
  } else {
    if (arg1 === '' || arg1 === null || arg1 === undefined ||
        !arg2 ||
        arg3 === '' || arg3 === null || arg3 === undefined) {
      return 0;
    }
    l = parseFloat(arg1);
    unit = 'ft';
    pipeSize = arg2 || '40 × 40 mm';
    pipeGauge = '16G';
    q = parseFloat(arg3);
  }

  if (isNaN(l) || isNaN(q) || l <= 0 || q <= 0) {
    return 0;
  }

  // Convert inch to feet if unit is inch (1 ft = 12 inches)
  const lengthInFeet = (unit === 'inch' || unit === 'in') ? (l / 12) : l;

  const weightPerFt = getPipeWeightPerFoot(pipeSize, pipeGauge);
  return lengthInFeet * weightPerFt * q;
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
    gauge = arg1.gauge || arg1.size || '25 × 3 mm';
    q = parseFloat(arg1.quantity);
  } else {
    if (arg1 === '' || arg1 === null || arg1 === undefined ||
        !arg2 ||
        arg3 === '' || arg3 === null || arg3 === undefined) {
      return 0;
    }
    l = parseFloat(arg1);
    gauge = arg2 || '25 × 3 mm';
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
 * Universal Row Weight Calculation
 */
export function calculateRowWeight(row) {
  if (!row) return 0;

  const type = String(row.calculationType || row.category || '').toLowerCase().trim();

  if (type === 'sheet' || (row.width !== undefined && row.width !== null && row.width !== '' && row.length !== undefined && !row.pipeSize && type !== 'angle')) {
    return calculateSheetWeight(row);
  }

  if (type === 'pipe' || (row.pipeSize !== undefined && row.pipeSize !== '') || (row.pipeGauge !== undefined && row.pipeGauge !== '')) {
    return calculatePipeWeight(row);
  }

  if (type === 'angle' || (!row.width && row.length && !row.pipeSize && row.gauge && String(row.gauge).includes('×'))) {
    return calculateAngleWeight(row);
  }

  if (type === 'purchased' || type === 'compressor') {
    return 0;
  }

  return 0;
}

/**
 * Calculate Total Weight of Sheet Materials
 * @param {Array} sheets 
 * @returns {number} Total sheet weight in kg
 */
export function calculateSheetTotalWeight(sheets) {
  if (!Array.isArray(sheets)) return 0;
  return sheets.reduce((sum, row) => sum + calculateSheetWeight(row), 0);
}

/**
 * Calculate Total Weight of Pipe Materials
 * @param {Array} pipes 
 * @returns {number} Total pipe weight in kg
 */
export function calculatePipeTotalWeight(pipes) {
  if (!Array.isArray(pipes)) return 0;
  return pipes.reduce((sum, row) => sum + calculatePipeWeight(row), 0);
}

/**
 * Calculate Total Weight of Angle Materials
 * @param {Array} angles 
 * @returns {number} Total angle weight in kg
 */
export function calculateAngleTotalWeight(angles) {
  if (!Array.isArray(angles)) return 0;
  return angles.reduce((sum, row) => sum + calculateAngleWeight(row), 0);
}

/**
 * Calculate Grand Total Material Weight across sheet, pipe, and angle material rows.
 * @param {Array|Object} materials - Array of rows OR { sheets: [], pipes: [], angles: [] }
 * @returns {number} Grand Total Material Weight in kg
 */
export function calculateGrandTotalWeight(materials) {
  if (!materials) return 0;

  if (Array.isArray(materials)) {
    return materials.reduce((sum, row) => sum + calculateRowWeight(row), 0);
  }

  if (typeof materials === 'object') {
    const sheets = Array.isArray(materials.sheets) ? materials.sheets : [];
    const pipes = Array.isArray(materials.pipes) ? materials.pipes : [];
    const angles = Array.isArray(materials.angles) ? materials.angles : [];
    
    return calculateSheetTotalWeight(sheets) + calculatePipeTotalWeight(pipes) + calculateAngleTotalWeight(angles);
  }

  return 0;
}

// Alias for backward compatibility
export const calculateTotalMaterialWeight = calculateGrandTotalWeight;

// -------------------------------------------------------------
// COMMERCIAL PRICING & BILL CALCULATIONS
// -------------------------------------------------------------

/**
 * Calculate Total Cost of Purchased & Compressor Items
 */
export function calculatePurchasedTotal(purchasedItems) {
  if (!Array.isArray(purchasedItems)) return 0;
  return purchasedItems.reduce((sum, item) => {
    const itemPrice = calculatePurchasedItemPrice(item);
    return sum + (itemPrice !== null ? itemPrice : 0);
  }, 0);
}

/**
 * Material Cost = (Total Material Weight × Material Rate)
 */
export function calculateMaterialCost(totalWeight, materialRate) {
  const w = parseFloat(totalWeight) || 0;
  const r = parseFloat(materialRate) || 0;
  return w * r;
}

/**
 * Labour Cost = Total Material Weight × Labour Rate (₹/kg)
 * Section 26 Formula: LABOUR COST = TOTAL MATERIAL WEIGHT × LABOUR RATE PER KG
 */
export function calculateLabourCost(totalWeight, labourRatePerKg) {
  const w = parseFloat(totalWeight) || 0;
  const r = parseFloat(labourRatePerKg) || 0;
  return w * r;
}

/**
 * Subtotal = Material Cost + Labour Cost + Purchased Item Cost
 */
export function calculateSubtotal(materialCost, labourCost, purchasedCost = 0) {
  const m = parseFloat(materialCost) || 0;
  const l = parseFloat(labourCost) || 0;
  const p = parseFloat(purchasedCost) || 0;
  return m + l + p;
}

/**
 * Selling Amount = Subtotal × Selling Percentage / 100
 */
export function calculateSellingAmount(subtotal, sellingPercentage) {
  const sub = parseFloat(subtotal) || 0;
  const pct = parseFloat(sellingPercentage) || 0;
  return (sub * pct) / 100;
}

/**
 * Selling Price = Subtotal + (Subtotal × Selling Percentage / 100)
 * Section 31 Formula: Selling Price = Subtotal + Selling Amount
 */
export function calculateSellingPrice(subtotal, sellingPercentage) {
  const sub = parseFloat(subtotal) || 0;
  const amt = calculateSellingAmount(sub, sellingPercentage);
  return sub + amt;
}

/**
 * GST Amount = Selling Price × GST% / 100
 * Section 32 Formula: GST Amount = Selling Price × GST% / 100
 */
export function calculateGSTAmount(sellingPrice, gstPercent) {
  const sp = parseFloat(sellingPrice) || 0;
  const g = parseFloat(gstPercent) || 0;
  return (sp * g) / 100;
}

// Alias for backward compatibility
export const calculateGST = calculateGSTAmount;

/**
 * Final Total = Selling Price + GST Amount - Discount
 * Section 34 Formula: Final Total = Selling Price + GST Amount - Discount
 */
export function calculateFinalTotal(sellingPrice, gstAmount, discount = 0) {
  const sp = parseFloat(sellingPrice) || 0;
  const g = parseFloat(gstAmount) || 0;
  const d = parseFloat(discount) || 0;
  return Math.max(0, sp + g - d);
}

// Alias for backward compatibility
export const calculateGrandTotalEstimate = calculateFinalTotal;
export const calculateGrandTotal = calculateFinalTotal;

/**
 * Master Estimate Calculation Engine
 * 
 * Complete Data Flow:
 * 1. Total Sheet Weight, Total Pipe Weight, Total Angle Weight
 * 2. Total Material Weight = Sheet + Pipe + Angle weights
 * 3. Sheet Cost = Total Sheet Weight × Sheet Rate
 * 4. Pipe Cost = Total Pipe Weight × Pipe Rate
 * 5. Angle Cost = Total Angle Weight × Angle Rate
 * 6. Material Cost = Sheet Cost + Pipe Cost (or Total Material Weight × Material Rate)
 * 7. Labour Cost = Total Material Weight × Labour Rate (₹/kg)
 * 8. Purchased Items Cost = Sum of (Qty × Price)
 * 9. Grand Total Internal Cost (Subtotal) = Sheet Cost + Pipe Cost + Angle Cost + Labour Cost + Purchased Items Cost
 * 10. Selling Amount = Grand Total Internal Cost × Selling Percentage / 100
 * 11. Selling Price = Grand Total Internal Cost + Selling Amount
 * 12. GST Amount = Selling Price × GST % / 100
 * 13. Final Total = Selling Price + GST Amount - Discount
 * 
 * @param {Object} params
 * @returns {Object} Complete calculation breakdown
 */
export function calculateEstimate({
  materials,
  sheets = [],
  pipes = [],
  angles = [],
  purchased = [],
  compressor = [],
  totalMaterialWeight,
  materialRate = '',
  sheetRate,
  pipeRate,
  angleRate,
  labourRate = '',
  labourCost = 0,
  sellingPercentage = 0,
  counterQuantity = 1,
  discount = 0,
  gst = ''
}) {
  let sheetRows = Array.isArray(sheets) ? sheets : [];
  let pipeRows = Array.isArray(pipes) ? pipes : [];
  let angleRows = Array.isArray(angles) ? angles : [];
  let purchasedRows = [];
  
  if (Array.isArray(purchased)) {
    purchasedRows.push(...purchased);
  }
  if (Array.isArray(compressor)) {
    purchasedRows.push(...compressor);
  }
  if (materials) {
    if (Array.isArray(materials)) {
      sheetRows = materials.filter(m => (m.calculationType || m.category || '').toLowerCase() === 'sheet');
      pipeRows = materials.filter(m => (m.calculationType || m.category || '').toLowerCase() === 'pipe');
      angleRows = materials.filter(m => (m.calculationType || m.category || '').toLowerCase() === 'angle');
      purchasedRows.push(...materials.filter(m => {
        const cat = (m.calculationType || m.category || '').toLowerCase();
        return cat === 'purchased' || cat === 'compressor' || cat === 'special';
      }));
    } else if (typeof materials === 'object') {
      if (Array.isArray(materials.sheets)) sheetRows = materials.sheets;
      if (Array.isArray(materials.pipes)) pipeRows = materials.pipes;
      if (Array.isArray(materials.angles)) angleRows = materials.angles;
      const pur = Array.isArray(materials.purchased) ? materials.purchased : [];
      const comp = Array.isArray(materials.compressor) ? materials.compressor : [];
      purchasedRows.push(...pur, ...comp);
    }
  }

  // Deduplicate purchasedRows by id
  const seenIds = new Set();
  const uniquePurchasedRows = [];
  for (const item of purchasedRows) {
    if (item && item.id) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        uniquePurchasedRows.push(item);
      }
    } else if (item) {
      uniquePurchasedRows.push(item);
    }
  }

  // 1. Weight Breakdown (STRICTLY ISOLATED)
  // Sheet Weight: Sheet materials ONLY
  const totalSheetWeight = calculateSheetTotalWeight(sheetRows);
  // Pipe Weight: Pipe materials ONLY
  const totalPipeWeight = calculatePipeTotalWeight(pipeRows);
  // Angle Weight: Angle materials ONLY
  const totalAngleWeight = calculateAngleTotalWeight(angleRows);
  
  // Grand Total Material Weight = Sheet + Pipe + Angle
  const totalWeight = totalMaterialWeight !== undefined && !isNaN(parseFloat(totalMaterialWeight))
    ? parseFloat(totalMaterialWeight)
    : (totalSheetWeight + totalPipeWeight + totalAngleWeight);

  // Derive Rates (User manual input only — NO hardcoded fallback rate)
  const defaultMatRate = materialRate !== undefined && materialRate !== '' && !isNaN(parseFloat(materialRate))
    ? parseFloat(materialRate)
    : 0;
  const sRate = sheetRate !== undefined && sheetRate !== '' && !isNaN(parseFloat(sheetRate)) ? parseFloat(sheetRate) : defaultMatRate;
  const pRate = pipeRate !== undefined && pipeRate !== '' && !isNaN(parseFloat(pipeRate)) ? parseFloat(pipeRate) : defaultMatRate;
  const aRate = angleRate !== undefined && angleRate !== '' && !isNaN(parseFloat(angleRate)) ? parseFloat(angleRate) : defaultMatRate;
  const lRate = labourRate !== undefined && labourRate !== '' && !isNaN(parseFloat(labourRate)) ? parseFloat(labourRate) : 0;
  
  // 2. Material Cost (Calculated from Grand Total Material Weight × Material Rate)
  const isSeparateRates = (sheetRate !== undefined && pipeRate !== undefined && sheetRate !== pipeRate && sheetRate !== '' && pipeRate !== '');
  const sheetCost = totalSheetWeight * sRate;
  const pipeCost = totalPipeWeight * pRate;
  const angleCost = totalAngleWeight * aRate;
  const computedMaterialCost = isSeparateRates 
    ? (sheetCost + pipeCost + angleCost)
    : (totalWeight * defaultMatRate);

  // 3. Labour Cost (Grand Total Material Weight × Labour Rate per kg)
  let computedLabourCost = 0;
  if (lRate > 0) {
    computedLabourCost = calculateLabourCost(totalWeight, lRate);
  } else if (labourCost !== undefined && !isNaN(parseFloat(labourCost)) && parseFloat(labourCost) > 0) {
    computedLabourCost = parseFloat(labourCost);
  }

  // 4. Purchased & Compressor Items Cost
  const purchasedItemCost = calculatePurchasedTotal(uniquePurchasedRows);

  // 5. Grand Total Internal Cost (Subtotal = Material Cost + Labour Cost + Purchased Item Cost)
  const subtotal = computedMaterialCost + computedLabourCost + purchasedItemCost;

  // 6. Selling Amount & Selling Price PER UNIT
  const sellPct = parseFloat(sellingPercentage) || 0;
  const sellingAmount = calculateSellingAmount(subtotal, sellPct);
  const unitSellingPrice = subtotal + sellingAmount;
  const sellingPrice = unitSellingPrice; // Legacy alias

  // 7. Counter Quantity & Total Selling Price
  const counterQty = Math.max(1, parseInt(counterQuantity, 10) || 1);
  const totalSellingPrice = unitSellingPrice * counterQty;

  // 8. GST Amount (Calculated on Total Selling Price)
  // If GST is empty or 0, GST Amount is 0 (Per Requirement 9 & 10)
  const gstPct = (gst !== undefined && gst !== null && gst !== '' && !isNaN(parseFloat(gst)))
    ? parseFloat(gst)
    : 0;
  const gstAmount = calculateGSTAmount(totalSellingPrice, gstPct);

  // 9. Discount & Final Grand Total
  const disc = parseFloat(discount) || 0;
  const finalTotal = calculateFinalTotal(totalSellingPrice, gstAmount, disc);

  return {
    totalSheetWeight,
    totalPipeWeight,
    totalAngleWeight,
    totalWeight,
    totalMaterialWeight: totalWeight,
    materialRate: sRate,
    sheetRate: sRate,
    pipeRate: pRate,
    angleRate: aRate,
    sheetCost,
    pipeCost,
    angleCost,
    materialCost: computedMaterialCost,
    labourRate: lRate,
    labourCost: computedLabourCost,
    purchasedItemCost,
    purchasedItemsCost: purchasedItemCost,
    subtotal,
    sellingPercentage: sellPct,
    sellingAmount,
    unitSellingPrice,
    sellingPrice: unitSellingPrice,
    counterQuantity: counterQty,
    totalSellingPrice,
    gstPercent: gstPct,
    gstAmount,
    discount: disc,
    finalTotal,
    grandTotal: finalTotal,
    totalAmount: finalTotal,
    taxableAmount: totalSellingPrice,
    discountedMaterialCost: computedMaterialCost
  };
}

// -------------------------------------------------------------
// DISPLAY & FORMATTING HELPERS
// -------------------------------------------------------------

/**
 * Format weight for display
 * @param {number|string} weight 
 * @returns {string} e.g. "9.74 kg" or "0.00 kg"
 */
export function formatWeight(weight) {
  if (weight === null || weight === undefined || weight === '') return '0.00 kg';
  const val = parseFloat(weight);
  if (isNaN(val) || val < 0) return '0.00 kg';
  return `${val.toFixed(2)} kg`;
}

/**
 * Format purchased item total price for table display
 */
export function formatPurchasedPrice(price) {
  if (price === null || price === undefined || price === '') return '—';
  const val = parseFloat(price);
  if (isNaN(val) || val < 0) return '—';
  return `₹ ${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Format currency with Indian grouping (₹XX,XXX.XX)
 */
export function formatCurrency(amount) {
  if (amount === null || amount === undefined || amount === '') return '₹ 0.00';
  const val = parseFloat(amount);
  if (isNaN(val)) return '₹ 0.00';
  return `₹ ${val.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Convert numeric amount into Indian Currency Words (Lakhs, Crores, Thousands, Paise)
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
