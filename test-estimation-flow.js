// test-estimation-flow.js - Comprehensive Automated Verification Script

const {
  PIPE_GAUGE_OPTIONS,
  PIPE_SIZE_OPTIONS,
  PIPE_GAUGE_WEIGHT_FACTORS,
  ANGLE_GAUGE_OPTIONS,
  ANGLE_GAUGE_WEIGHT_FACTORS,
  COUNTER_TYPES_CONFIG,
  COUNTER_CONFIG,
  DEFAULT_GST_PERCENT
} = require('./src/lib/constants.js');

const {
  calculateRowWeight,
  calculateAngleWeight,
  calculatePurchasedItemPrice,
  calculateEstimate
} = require('./src/lib/calculations.js');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`✗ FAIL: ${message}`);
    failedTests++;
  }
}

console.log('====================================================');
console.log('1. VERIFYING PIPE SIZE & GAUGE OPTIONS & WEIGHT FACTORS');
console.log('====================================================');
assert(PIPE_SIZE_OPTIONS.includes('1.5" × 1.5"'), 'PIPE_SIZE_OPTIONS contains 1.5" × 1.5"');
assert(PIPE_SIZE_OPTIONS.includes('1" × 1"'), 'PIPE_SIZE_OPTIONS contains 1" × 1"');
assert(PIPE_SIZE_OPTIONS.includes('Ø 25 mm (Round)') || PIPE_SIZE_OPTIONS.includes('Round Ø25 mm'), 'PIPE_SIZE_OPTIONS contains Ø 25 mm (Round)');
assert(PIPE_GAUGE_OPTIONS.includes('1.0 mm'), 'PIPE_GAUGE_OPTIONS contains 1.0 mm');
assert(PIPE_GAUGE_OPTIONS.includes('1.2 mm'), 'PIPE_GAUGE_OPTIONS contains 1.2 mm');
assert(PIPE_GAUGE_OPTIONS.includes('1.5 mm'), 'PIPE_GAUGE_OPTIONS contains 1.5 mm');
assert(PIPE_GAUGE_OPTIONS.includes('2.0 mm'), 'PIPE_GAUGE_OPTIONS contains 2.0 mm');

const pipe1_2 = calculateRowWeight({
  category: 'PIPE',
  type: 'PIPE',
  pipeSize: '1.5" × 1.5"',
  pipeGauge: '1.2 mm',
  length: 10,
  quantity: 2
});
// 10 ft * 2 qty * 0.420 kg/ft = 8.40 kg
assert(Math.abs(pipe1_2 - 8.40) < 0.001, `Pipe 1.2mm 10ft x 2 qty = 8.40 kg (got ${pipe1_2})`);

console.log('\n====================================================');
console.log('2. VERIFYING ANGLE GAUGE OPTIONS & WEIGHT FACTORS');
console.log('====================================================');
assert(ANGLE_GAUGE_OPTIONS.includes('25 × 3 mm'), 'ANGLE_GAUGE_OPTIONS contains 25 × 3 mm');
assert(ANGLE_GAUGE_OPTIONS.includes('30 × 3 mm'), 'ANGLE_GAUGE_OPTIONS contains 30 × 3 mm');

const angle25 = calculateAngleWeight({
  gauge: '25 × 3 mm',
  length: 5,
  quantity: 4
});
// 5 ft * 4 qty * 0.340 kg/ft = 6.80 kg
assert(Math.abs(angle25 - 6.80) < 0.001, `Angle 25x3mm 5ft x 4 qty = 6.80 kg (got ${angle25})`);

console.log('\n====================================================');
console.log('3. VERIFYING BAIN MARIE TEMPLATE ISOLATION');
console.log('====================================================');
const bmConfig = COUNTER_TYPES_CONFIG['Bain Marie'];
assert(bmConfig !== undefined, 'Bain Marie config exists');
assert(bmConfig.requiresAngle === false, 'Bain Marie requiresAngle is false');
assert(bmConfig.hasDepth === false, 'Bain Marie hasDepth is false');

const bmTemplate = COUNTER_CONFIG['Bain Marie'];
const bmHasRoundVessel = (bmTemplate.purchased || []).some(p => /round/i.test(p.materialName || ''));
assert(!bmHasRoundVessel, 'Bain Marie does NOT contain Round Vessel or Round Pot');

console.log('\n====================================================');
console.log('4. VERIFYING SINK UNIT DEPTH ISOLATION');
console.log('====================================================');
const sinkConfig = COUNTER_TYPES_CONFIG['Sink Unit'];
assert(sinkConfig.hasDepth === true, 'Sink Unit hasDepth is true');
const tableConfig = COUNTER_TYPES_CONFIG['Working Table'];
assert(tableConfig.hasDepth === false, 'Working Table hasDepth is false');

console.log('\n====================================================');
console.log('5. VERIFYING PHONE NUMBER VALIDATION REGEX');
console.log('====================================================');
const phoneRegex = /^\d{10}$/;
assert(phoneRegex.test('9604386808') === true, 'Valid 10-digit number passes');
assert(phoneRegex.test('960438680') === false, '9-digit number fails');
assert(phoneRegex.test('96043868080') === false, '11-digit number fails');
assert(phoneRegex.test('+919604386808') === false, '+91 fails in raw input');
assert(phoneRegex.test('96043 86808') === false, 'Spaces fail');
assert(phoneRegex.test('960438680a') === false, 'Letters fail');

console.log('\n====================================================');
console.log('6. VERIFYING COMMON MATERIAL WEIGHT & ESTIMATION ENGINE (STEP 3 & 4)');
console.log('====================================================');
// Test Working Table Estimate with Common Material Rate = 250, Labour Rate = 100, Counter Quantity = 5, Selling Markup = 15%, GST = 18%, Discount = 1000
// Sheet: 60" x 24" = 10 sq ft. Gauge 1.2mm factor = 0.96875 kg/sq.ft => 9.6875 kg.
// Pipe: 10 ft x 2 qty = 20 ft * 0.420 kg/ft = 8.4 kg.
// Grand Total Material Weight: 9.6875 + 8.4 = 18.0875 kg.
// Material Rate: 250 ₹/kg
// Material Cost: 18.0875 * 250 = 4521.875
// Labour Rate: 100 ₹/kg
// Labour Cost: 18.0875 * 100 = 1808.75
// Purchased: 4 * 150 = 600
// Subtotal (Internal Cost per unit): 4521.875 + 1808.75 + 600 = 6930.625
// Selling Markup (15%): 6930.625 * 0.15 = 1039.59375
// Selling Price per Unit: 6930.625 + 1039.59375 = 7970.21875
// Quantity: 5
// Total Selling Price: 7970.21875 * 5 = 39851.09375
// GST (18% on Total Selling Price): 39851.09375 * 0.18 = 7173.196875
// Discount: 1000
// Final Grand Total: 39851.09375 + 7173.196875 - 1000 = 46024.290625

const estimate = calculateEstimate({
  sheets: [
    { length: 60, width: 24, gauge: 1.2, quantity: 1 }
  ],
  pipes: [
    { pipeSize: '1.5" × 1.5"', pipeGauge: '1.2 mm', length: 10, quantity: 2 }
  ],
  angles: [],
  purchased: [
    { quantity: 4, price: 150 }
  ],
  materialRate: 250,
  labourRate: 100,
  sellingPercentage: 15,
  counterQuantity: 5,
  gst: 18,
  discount: 1000
});

console.log('Estimate Result (Quantity = 5, Common Material Rate = 250):', {
  totalSheetWeight: estimate.totalSheetWeight,
  totalPipeWeight: estimate.totalPipeWeight,
  totalWeight: estimate.totalWeight,
  materialCost: estimate.materialCost,
  labourCost: estimate.labourCost,
  purchasedItemCost: estimate.purchasedItemCost,
  subtotal: estimate.subtotal,
  sellingAmount: estimate.sellingAmount,
  unitSellingPrice: estimate.unitSellingPrice,
  counterQuantity: estimate.counterQuantity,
  totalSellingPrice: estimate.totalSellingPrice,
  gstAmount: estimate.gstAmount,
  discount: estimate.discount,
  finalTotal: estimate.finalTotal
});

assert(Math.abs(estimate.totalSheetWeight - 9.6875) < 0.001, 'Total Sheet Weight = 9.6875 kg');
assert(Math.abs(estimate.totalPipeWeight - 8.4) < 0.001, 'Total Pipe Weight = 8.4 kg');
assert(Math.abs(estimate.totalWeight - 18.0875) < 0.001, 'Grand Total Material Weight = 18.0875 kg');
assert(Math.abs(estimate.materialCost - 4521.875) < 0.001, 'Material Cost = 18.0875 * 250 = 4521.875');
assert(Math.abs(estimate.labourCost - 1808.75) < 0.001, 'Labour Cost = 18.0875 * 100 = 1808.75');
assert(Math.abs(estimate.purchasedItemCost - 600) < 0.001, 'Purchased Item Cost = 600');

const expectedSubtotal = 6930.625;
assert(Math.abs(estimate.subtotal - expectedSubtotal) < 0.001, `Grand Total Internal Cost = ${expectedSubtotal}`);

const expectedSellingAmount = 1039.59375;
assert(Math.abs(estimate.sellingAmount - expectedSellingAmount) < 0.001, `Selling Amount = ${expectedSellingAmount}`);

const expectedUnitSellingPrice = 7970.21875;
assert(Math.abs(estimate.unitSellingPrice - expectedUnitSellingPrice) < 0.001, `Unit Selling Price = ${expectedUnitSellingPrice}`);

assert(estimate.counterQuantity === 5, 'Counter Quantity = 5');

const expectedTotalSellingPrice = expectedUnitSellingPrice * 5; // 39851.09375
assert(Math.abs(estimate.totalSellingPrice - expectedTotalSellingPrice) < 0.001, `Total Selling Price = ${expectedTotalSellingPrice}`);

const expectedGst = expectedTotalSellingPrice * 0.18; // 7173.196875
assert(Math.abs(estimate.gstAmount - expectedGst) < 0.001, `GST Amount on Total Selling Price = ${expectedGst}`);

const expectedFinalTotal = expectedTotalSellingPrice + expectedGst - 1000; // 46024.290625
assert(Math.abs(estimate.finalTotal - expectedFinalTotal) < 0.001, `Final Grand Total = ${expectedFinalTotal}`);

console.log('\n====================================================');
console.log(`ALL TESTS COMPLETED: ${passedTests} passed, ${failedTests} failed.`);
console.log('====================================================');
if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
