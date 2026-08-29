import { 
  SHEET_GAUGES, 
  SHEET_GAUGE_OPTIONS, 
  getStandardSheetWeight,
  PIPE_GAUGE_OPTIONS,
  PIPE_SIZE_OPTIONS,
  PIPE_MASTER,
  getPipeWeight20ft,
  getPipeWeightPerFoot,
  isPipeCombinationUnavailable,
  ANGLE_GAUGE_OPTIONS,
  COUNTER_CONFIG
} from './src/lib/constants.js';

import {
  calculateSheetWeight,
  calculatePipeWeight,
  calculateAngleWeight,
  calculateRowWeight,
  calculateEstimate
} from './src/lib/calculations.js';

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
console.log('1. VERIFYING SHEET GAUGES (0.6, 0.8, 1.0, 1.2, 1.5 mm ONLY)');
console.log('====================================================');
assert(Array.isArray(SHEET_GAUGES), 'SHEET_GAUGES is an array');
assert(SHEET_GAUGES.length === 5, `SHEET_GAUGES has exactly 5 items (got ${SHEET_GAUGES.length})`);
assert(SHEET_GAUGES.includes(0.6), 'SHEET_GAUGES includes 0.6');
assert(SHEET_GAUGES.includes(0.8), 'SHEET_GAUGES includes 0.8');
assert(SHEET_GAUGES.includes(1.0) || SHEET_GAUGES.includes(1), 'SHEET_GAUGES includes 1.0');
assert(SHEET_GAUGES.includes(1.2), 'SHEET_GAUGES includes 1.2');
assert(SHEET_GAUGES.includes(1.5), 'SHEET_GAUGES includes 1.5');
assert(!SHEET_GAUGES.includes(1.3), 'SHEET_GAUGES does NOT include 1.3');

assert(SHEET_GAUGE_OPTIONS.length === 5, `SHEET_GAUGE_OPTIONS has exactly 5 items (got ${SHEET_GAUGE_OPTIONS.length})`);
const optValues = SHEET_GAUGE_OPTIONS.map(o => o.value);
assert(JSON.stringify(optValues) === JSON.stringify([0.6, 0.8, 1.0, 1.2, 1.5]), 'SHEET_GAUGE_OPTIONS values are [0.6, 0.8, 1.0, 1.2, 1.5]');
const optLabels = SHEET_GAUGE_OPTIONS.map(o => o.label);
assert(JSON.stringify(optLabels) === JSON.stringify(['0.6 mm', '0.8 mm', '1 mm', '1.2 mm', '1.5 mm']), 'SHEET_GAUGE_OPTIONS labels are strictly [0.6 mm, 0.8 mm, 1 mm, 1.2 mm, 1.5 mm]');
assert(SHEET_GAUGE_OPTIONS.every(o => !o.label.includes('kg') && !o.label.includes('sq.ft')), 'SHEET_GAUGE_OPTIONS labels do not contain extra kg or sq.ft text');

// Standard Sheet Weights per 32 sq.ft
assert(getStandardSheetWeight(0.6) === 15.5, '0.6 mm sheet weight = 15.5 kg / 32 sq.ft');
assert(getStandardSheetWeight(0.8) === 20.0, '0.8 mm sheet weight = 20.0 kg / 32 sq.ft');
assert(getStandardSheetWeight(1.0) === 25.5, '1.0 mm sheet weight = 25.5 kg / 32 sq.ft');
assert(getStandardSheetWeight(1.2) === 31.0, '1.2 mm sheet weight = 31.0 kg / 32 sq.ft');
assert(getStandardSheetWeight(1.5) === 39.0, '1.5 mm sheet weight = 39.0 kg / 32 sq.ft');

// Calculate Sheet Weights for 60" x 24" (10 sq.ft)
const wt0_6 = calculateSheetWeight({ length: 60, width: 24, gauge: 0.6, quantity: 1 });
assert(Math.abs(wt0_6 - 4.84375) < 0.0001, `0.6mm sheet weight 60"x24" = 4.84375 kg (got ${wt0_6})`);

const wt1_5 = calculateSheetWeight({ length: 60, width: 24, gauge: 1.5, quantity: 1 });
assert(Math.abs(wt1_5 - 12.1875) < 0.0001, `1.5mm sheet weight 60"x24" = 12.1875 kg (got ${wt1_5})`);

console.log('\n====================================================');
console.log('2. VERIFYING PIPE SIZES & GAUGE SEPARATION (18G, 16G, 14G ONLY)');
console.log('====================================================');
assert(JSON.stringify(PIPE_GAUGE_OPTIONS) === JSON.stringify(['18G', '16G', '14G']), 'PIPE_GAUGE_OPTIONS strictly contains ["18G", "16G", "14G"]');
assert(!PIPE_GAUGE_OPTIONS.includes('1.0 mm') && !PIPE_GAUGE_OPTIONS.includes('1.2 mm'), 'PIPE_GAUGE_OPTIONS does not contain mm gauges');

const expectedSizes = [
  '12 × 12 mm', '16 × 16 mm', '20 × 20 mm', '25 × 25 mm', '30 × 30 mm', '40 × 40 mm', '50 × 50 mm',
  '50 × 25 mm', '40 × 20 mm',
  '1/2" Round', '5/8" Round', '3/4" Round', '1" Round', '1 1/4" Round', '1 1/2" Round', '2" Round', '2 1/2" Round', '3" Round'
];
assert(PIPE_SIZE_OPTIONS.length === 18, `PIPE_SIZE_OPTIONS has 18 sizes (got ${PIPE_SIZE_OPTIONS.length})`);
assert(JSON.stringify(PIPE_SIZE_OPTIONS) === JSON.stringify(expectedSizes), 'PIPE_SIZE_OPTIONS has square/rectangular on top and round under');
assert(PIPE_SIZE_OPTIONS.every(s => !s.includes('18G') && !s.includes('16G') && !s.includes('14G') && !s.includes('gauge')), 'No gauge in Pipe Size options');
assert(!PIPE_SIZE_OPTIONS.includes('1.5" (38 × 38 mm)'), 'Old size "1.5\\" (38 × 38 mm)" is removed');

console.log('\n====================================================');
console.log('3. VERIFYING 20 FT AUTHORITATIVE PIPE WEIGHT MASTER');
console.log('====================================================');
// Round Pipes
assert(getPipeWeight20ft('1/2" Round', '18G') === 2.10, '1/2" Round 18G = 2.10 kg (20 FT)');
assert(getPipeWeight20ft('1/2" Round', '16G') === 2.50, '1/2" Round 16G = 2.50 kg (20 FT)');
assert(getPipeWeight20ft('1/2" Round', '14G') === null, '1/2" Round 14G is null (unavailable)');
assert(isPipeCombinationUnavailable('1/2" Round', '14G') === true, 'isPipeCombinationUnavailable returns true for 1/2" Round 14G');

assert(getPipeWeight20ft('5/8" Round', '18G') === 2.60, '5/8" Round 18G = 2.60 kg (20 FT)');
assert(getPipeWeight20ft('5/8" Round', '16G') === 3.30, '5/8" Round 16G = 3.30 kg (20 FT)');
assert(getPipeWeight20ft('5/8" Round', '14G') === 4.30, '5/8" Round 14G = 4.30 kg (20 FT)');

assert(getPipeWeight20ft('3/4" Round', '18G') === 3.20, '3/4" Round 18G = 3.20 kg (20 FT)');
assert(getPipeWeight20ft('3/4" Round', '16G') === 4.00, '3/4" Round 16G = 4.00 kg (20 FT)');
assert(getPipeWeight20ft('3/4" Round', '14G') === 5.20, '3/4" Round 14G = 5.20 kg (20 FT)');

assert(getPipeWeight20ft('1" Round', '18G') === 4.40, '1" Round 18G = 4.40 kg (20 FT)');
assert(getPipeWeight20ft('1" Round', '16G') === 5.50, '1" Round 16G = 5.50 kg (20 FT)');
assert(getPipeWeight20ft('1" Round', '14G') === 7.00, '1" Round 14G = 7.00 kg (20 FT)');

assert(getPipeWeight20ft('1 1/4" Round', '18G') === 5.60, '1 1/4" Round 18G = 5.60 kg (20 FT)');
assert(getPipeWeight20ft('1 1/4" Round', '16G') === 7.20, '1 1/4" Round 16G = 7.20 kg (20 FT)');
assert(getPipeWeight20ft('1 1/4" Round', '14G') === 9.10, '1 1/4" Round 14G = 9.10 kg (20 FT)');

assert(getPipeWeight20ft('1 1/2" Round', '18G') === 6.70, '1 1/2" Round 18G = 6.70 kg (20 FT)');
assert(getPipeWeight20ft('1 1/2" Round', '16G') === 8.40, '1 1/2" Round 16G = 8.40 kg (20 FT)');
assert(getPipeWeight20ft('1 1/2" Round', '14G') === 11.00, '1 1/2" Round 14G = 11.00 kg (20 FT)');

assert(getPipeWeight20ft('2" Round', '18G') === 9.00, '2" Round 18G = 9.00 kg (20 FT)');
assert(getPipeWeight20ft('2" Round', '16G') === 11.30, '2" Round 16G = 11.30 kg (20 FT)');
assert(getPipeWeight20ft('2" Round', '14G') === 15.00, '2" Round 14G = 15.00 kg (20 FT)');

assert(getPipeWeight20ft('2 1/2" Round', '18G') === 11.40, '2 1/2" Round 18G = 11.40 kg (20 FT)');
assert(getPipeWeight20ft('2 1/2" Round', '16G') === 14.20, '2 1/2" Round 16G = 14.20 kg (20 FT)');
assert(getPipeWeight20ft('2 1/2" Round', '14G') === 18.75, '2 1/2" Round 14G = 18.75 kg (20 FT)');

assert(getPipeWeight20ft('3" Round', '18G') === 13.75, '3" Round 18G = 13.75 kg (20 FT)');
assert(getPipeWeight20ft('3" Round', '16G') === 17.00, '3" Round 16G = 17.00 kg (20 FT)');
assert(getPipeWeight20ft('3" Round', '14G') === 22.60, '3" Round 14G = 22.60 kg (20 FT)');

// Square Pipes
assert(getPipeWeight20ft('12 × 12 mm', '18G') === 2.80, '12 × 12 mm 18G = 2.80 kg (20 FT)');
assert(getPipeWeight20ft('12 × 12 mm', '16G') === 3.50, '12 × 12 mm 16G = 3.50 kg (20 FT)');
assert(getPipeWeight20ft('12 × 12 mm', '14G') === 4.70, '12 × 12 mm 14G = 4.70 kg (20 FT)');

assert(getPipeWeight20ft('16 × 16 mm', '18G') === 3.70, '16 × 16 mm 18G = 3.70 kg (20 FT)');
assert(getPipeWeight20ft('16 × 16 mm', '16G') === 4.70, '16 × 16 mm 16G = 4.70 kg (20 FT)');
assert(getPipeWeight20ft('16 × 16 mm', '14G') === 6.25, '16 × 16 mm 14G = 6.25 kg (20 FT)');

assert(getPipeWeight20ft('20 × 20 mm', '18G') === 4.70, '20 × 20 mm 18G = 4.70 kg (20 FT)');
assert(getPipeWeight20ft('20 × 20 mm', '16G') === 5.85, '20 × 20 mm 16G = 5.85 kg (20 FT)');
assert(getPipeWeight20ft('20 × 20 mm', '14G') === 7.80, '20 × 20 mm 14G = 7.80 kg (20 FT)');

assert(getPipeWeight20ft('25 × 25 mm', '18G') === 5.80, '25 × 25 mm 18G = 5.80 kg (20 FT)');
assert(getPipeWeight20ft('25 × 25 mm', '16G') === 7.30, '25 × 25 mm 16G = 7.30 kg (20 FT)');
assert(getPipeWeight20ft('25 × 25 mm', '14G') === 9.80, '25 × 25 mm 14G = 9.80 kg (20 FT)');

assert(getPipeWeight20ft('30 × 30 mm', '18G') === 7.00, '30 × 30 mm 18G = 7.00 kg (20 FT)');
assert(getPipeWeight20ft('30 × 30 mm', '16G') === 8.80, '30 × 30 mm 16G = 8.80 kg (20 FT)');
assert(getPipeWeight20ft('30 × 30 mm', '14G') === 11.80, '30 × 30 mm 14G = 11.80 kg (20 FT)');

assert(getPipeWeight20ft('40 × 40 mm', '18G') === 9.40, '40 × 40 mm 18G = 9.40 kg (20 FT)');
assert(getPipeWeight20ft('40 × 40 mm', '16G') === 11.80, '40 × 40 mm 16G = 11.80 kg (20 FT)');
assert(getPipeWeight20ft('40 × 40 mm', '14G') === 15.60, '40 × 40 mm 14G = 15.60 kg (20 FT)');

assert(getPipeWeight20ft('50 × 50 mm', '18G') === 11.70, '50 × 50 mm 18G = 11.70 kg (20 FT)');
assert(getPipeWeight20ft('50 × 50 mm', '16G') === 14.60, '50 × 50 mm 16G = 14.60 kg (20 FT)');
assert(getPipeWeight20ft('50 × 50 mm', '14G') === 19.50, '50 × 50 mm 14G = 19.50 kg (20 FT)');

// Rectangular Pipes
assert(getPipeWeight20ft('50 × 25 mm', '18G') === 8.80, '50 × 25 mm 18G = 8.80 kg (20 FT)');
assert(getPipeWeight20ft('50 × 25 mm', '16G') === 11.00, '50 × 25 mm 16G = 11.00 kg (20 FT)');
assert(getPipeWeight20ft('50 × 25 mm', '14G') === 14.70, '50 × 25 mm 14G = 14.70 kg (20 FT)');

assert(getPipeWeight20ft('40 × 20 mm', '18G') === 7.00, '40 × 20 mm 18G = 7.00 kg (20 FT)');
assert(getPipeWeight20ft('40 × 20 mm', '16G') === 8.80, '40 × 20 mm 16G = 8.80 kg (20 FT)');
assert(getPipeWeight20ft('40 × 20 mm', '14G') === 11.80, '40 × 20 mm 14G = 11.80 kg (20 FT)');

console.log('\n====================================================');
console.log('4. VERIFYING SPECIFIC CALCULATION EXAMPLES FROM PROMPT');
console.log('====================================================');
// Example 1: 1" Round, 18G, 20 ft, Quantity 4 -> Reference = 4.40 kg, Total = 17.60 kg
const ex1 = calculatePipeWeight({
  pipeSize: '1" Round',
  pipeGauge: '18G',
  length: 20,
  unit: 'ft',
  quantity: 4
});
assert(Math.abs(ex1 - 17.60) < 0.001, `Example 1: 1" Round 18G 20ft x 4 = 17.60 kg (got ${ex1})`);

// Example 2: 1" Round, 18G, 5 ft, Quantity 4 -> 4.40 * 5 / 20 = 1.10 kg/pipe, Total = 4.40 kg
const ex2 = calculatePipeWeight({
  pipeSize: '1" Round',
  pipeGauge: '18G',
  length: 5,
  unit: 'ft',
  quantity: 4
});
assert(Math.abs(ex2 - 4.40) < 0.001, `Example 2: 1" Round 18G 5ft x 4 = 4.40 kg (got ${ex2})`);

// Example 3: 40 × 40 mm, 18G, 20 ft, Quantity 1 -> Reference = 9.40 kg, Total = 9.40 kg
const ex3 = calculatePipeWeight({
  pipeSize: '40 × 40 mm',
  pipeGauge: '18G',
  length: 20,
  unit: 'ft',
  quantity: 1
});
assert(Math.abs(ex3 - 9.40) < 0.001, `Example 3: 40 × 40 mm 18G 20ft x 1 = 9.40 kg (got ${ex3})`);

// Example 4: 40 × 40 mm, 18G, 10 ft, Quantity 2 -> 9.40 * 10 / 20 = 4.70 kg/pipe, Total = 9.40 kg
const ex4 = calculatePipeWeight({
  pipeSize: '40 × 40 mm',
  pipeGauge: '18G',
  length: 10,
  unit: 'ft',
  quantity: 2
});
assert(Math.abs(ex4 - 9.40) < 0.001, `Example 4: 40 × 40 mm 18G 10ft x 2 = 9.40 kg (got ${ex4})`);

// Inches Test: 40 × 40 mm, 18G, 120 inches (= 10 ft), Quantity 2 -> Total = 9.40 kg
const exInches = calculatePipeWeight({
  pipeSize: '40 × 40 mm',
  pipeGauge: '18G',
  length: 120,
  unit: 'inch',
  quantity: 2
});
assert(Math.abs(exInches - 9.40) < 0.001, `Inches conversion: 40 × 40 mm 18G 120in x 2 = 9.40 kg (got ${exInches})`);

// Unavailable Test: 1/2" Round, 14G, 10 ft, Quantity 2 -> 0 kg
const exUnavail = calculatePipeWeight({
  pipeSize: '1/2" Round',
  pipeGauge: '14G',
  length: 10,
  unit: 'ft',
  quantity: 2
});
assert(exUnavail === 0, `Unavailable combination returns 0 kg (got ${exUnavail})`);

console.log('\n====================================================');
console.log('5. VERIFYING ANGLE GAUGE OPTIONS & WEIGHT FACTORS');
console.log('====================================================');
assert(ANGLE_GAUGE_OPTIONS.includes('25 × 3 mm'), 'ANGLE_GAUGE_OPTIONS contains 25 × 3 mm');
assert(ANGLE_GAUGE_OPTIONS.includes('30 × 3 mm'), 'ANGLE_GAUGE_OPTIONS contains 30 × 3 mm');

const angle25 = calculateAngleWeight({
  gauge: '25 × 3 mm',
  length: 5,
  quantity: 4
});
assert(Math.abs(angle25 - 6.80) < 0.001, `Angle 25x3mm 5ft x 4 qty = 6.80 kg (got ${angle25})`);

console.log('\n====================================================');
console.log('6. VERIFYING COUNTER CONFIG PIPE CONFIGURATIONS');
console.log('====================================================');
let allPipeSizesValid = true;
let allPipeGaugesValid = true;
for (const [counterName, config] of Object.entries(COUNTER_CONFIG)) {
  for (const pipe of (config.pipes || [])) {
    if (pipe.pipeSize && !PIPE_SIZE_OPTIONS.includes(pipe.pipeSize)) {
      console.error(`Invalid pipe size in ${counterName}:`, pipe.pipeSize);
      allPipeSizesValid = false;
    }
    if (pipe.pipeGauge && !PIPE_GAUGE_OPTIONS.includes(pipe.pipeGauge)) {
      console.error(`Invalid pipe gauge in ${counterName}:`, pipe.pipeGauge);
      allPipeGaugesValid = false;
    }
  }
}
assert(allPipeSizesValid, 'All pipe components across all 20 counter types use valid pipe sizes');
assert(allPipeGaugesValid, 'All pipe components across all 20 counter types use valid pipe gauges (18G, 16G, 14G)');

console.log('\n====================================================');
console.log('7. VERIFYING FULL ESTIMATE CALCULATION WITH UPDATED PIPES');
console.log('====================================================');
const estimateFull = calculateEstimate({
  sheets: [
    { length: 60, width: 24, gauge: 1.5, quantity: 1 } // 12.1875 kg
  ],
  pipes: [
    { pipeSize: '40 × 40 mm', pipeGauge: '16G', length: 20, quantity: 1 } // 11.80 kg
  ],
  angles: [],
  purchased: [
    { quantity: 4, price: 150 } // 600
  ],
  materialRate: 250,
  labourRate: 100,
  sellingPercentage: 15,
  counterQuantity: 2,
  gst: 18,
  discount: 500
});

// Sheet Weight: 12.1875 kg
// Pipe Weight: 11.80 kg
// Total Weight: 23.9875 kg
// Material Cost: 23.9875 * 250 = 5996.875
// Labour Cost: 23.9875 * 100 = 2398.75
// Purchased: 600
// Subtotal: 5996.875 + 2398.75 + 600 = 8995.625
// Selling Amount (15%): 8995.625 * 0.15 = 1349.34375
// Unit Selling Price: 8995.625 + 1349.34375 = 10344.96875
// Total Selling Price (Qty 2): 10344.96875 * 2 = 20689.9375
// GST (18%): 20689.9375 * 0.18 = 3724.18875
// Discount: 500
// Final Total: 20689.9375 + 3724.18875 - 500 = 23914.12625

assert(Math.abs(estimateFull.totalSheetWeight - 12.1875) < 0.001, 'Estimate Total Sheet Weight = 12.1875 kg');
assert(Math.abs(estimateFull.totalPipeWeight - 11.80) < 0.001, 'Estimate Total Pipe Weight = 11.80 kg');
assert(Math.abs(estimateFull.totalWeight - 23.9875) < 0.001, 'Estimate Total Weight = 23.9875 kg');
assert(Math.abs(estimateFull.subtotal - 8995.625) < 0.001, 'Estimate Subtotal = 8995.625');
assert(Math.abs(estimateFull.finalTotal - 23914.12625) < 0.001, 'Estimate Final Total = 23914.12625');

console.log('\n====================================================');
console.log('8. VERIFYING DRAWER SPECIFICATION & DEPTH FIELD');
console.log('====================================================');
const drawerCounter = COUNTER_CONFIG['Counter'];
const drawerSheet = (drawerCounter.sheets || []).find(s => s.materialName === 'Drawer');
assert(Boolean(drawerSheet && drawerSheet.hasDepth), 'Counter has Drawer sheet with hasDepth = true');

const teaCounter = COUNTER_CONFIG['Tea Counter'];
const teaDrawerSheet = (teaCounter.sheets || []).find(s => s.materialName === 'Drawer');
assert(Boolean(teaDrawerSheet && teaDrawerSheet.hasDepth), 'Tea Counter has Drawer sheet with hasDepth = true');

// Drawer weight with Length=20, Width=15, Depth=6, Gauge=1.0, Qty=2
// Area = (20*15 + 2*(20+15)*6) / 144 = (300 + 420) / 144 = 720 / 144 = 5.0 sq.ft
// WeightPerSqFt for 1.0mm = 25.5 / 32 = 0.796875
// Total Weight for 2 drawers = 5.0 * 0.796875 * 2 = 7.96875 kg
const drawerWt = calculateSheetWeight({ length: 20, width: 15, depth: 6, gauge: 1.0, quantity: 2 });
assert(Math.abs(drawerWt - 7.96875) < 0.0001, `Drawer 20x15x6" 1.0mm Qty 2 = 7.96875 kg (got ${drawerWt})`);

console.log('\n====================================================');
console.log('9. VERIFYING TROLLY TOP DEPTH & MS ANGLE');
console.log('====================================================');
const trolleyConfig = COUNTER_CONFIG['Trolley'];
const trolleyTop = (trolleyConfig.sheets || []).find(s => s.materialName === 'Top');
assert(Boolean(trolleyTop && trolleyTop.hasDepth), 'Trolley Top sheet has hasDepth = true');
assert(trolleyConfig.requiresAngle === true, 'Trolley requiresAngle = true');

const trolleyMsAngle = (trolleyConfig.angles || []).find(a => a.materialName === 'MS Angle');
assert(Boolean(trolleyMsAngle), 'Trolley contains MS Angle component');
assert(trolleyMsAngle.grade === 'MS', 'Trolley MS Angle has grade = MS');

// Trolly Top with Length=36, Width=24, Depth=4, Gauge=1.2, Qty=1
// Area = (36*24 + 2*(36+24)*4) / 144 = (864 + 480) / 144 = 1344 / 144 = 9.3333 sq.ft
// WeightPerSqFt for 1.2mm = 31.0 / 32 = 0.96875
// Total Weight = 9.33333 * 0.96875 = 9.04166 kg
const trollyTopWt = calculateSheetWeight({ length: 36, width: 24, depth: 4, gauge: 1.2, quantity: 1 });
assert(Math.abs(trollyTopWt - 9.041666) < 0.001, `Trolly Top 36x24x4" 1.2mm = 9.042 kg (got ${trollyTopWt})`);

console.log('\n====================================================');
console.log('10. VERIFYING LAFA COMPONENT IN WORKING TABLE & DINING TABLE ONLY');
console.log('====================================================');
const workingTable = COUNTER_CONFIG['Working Table'];
assert(Boolean(workingTable), 'COUNTER_CONFIG has Working Table specifications');
const workingTableLafa = (workingTable.sheets || []).find(s => s.materialName === 'LAFA');
assert(Boolean(workingTableLafa), 'Working Table has LAFA sheet component');
assert(workingTableLafa.gauge === 1.2, 'Working Table LAFA sheet has gauge = 1.2');

const diningTable = COUNTER_CONFIG['Dining Table'];
assert(Boolean(diningTable), 'COUNTER_CONFIG has Dining Table specifications');
const diningTableLafa = (diningTable.sheets || []).find(s => s.materialName === 'LAFA');
assert(Boolean(diningTableLafa), 'Dining Table has LAFA sheet component');
assert(diningTableLafa.gauge === 1.2, 'Dining Table LAFA sheet has gauge = 1.2');

// Verify LAFA is not added to other counters
const sinkConfig = COUNTER_CONFIG['Sink Unit'];
const noLafaInSink = !(sinkConfig.sheets || []).some(s => s.materialName === 'LAFA');
assert(noLafaInSink, 'LAFA is NOT present in Sink Unit');

const gasConfig = COUNTER_CONFIG['Gas Range'];
const noLafaInGas = !(gasConfig.sheets || []).some(s => s.materialName === 'LAFA');
assert(noLafaInGas, 'LAFA is NOT present in Gas Range');

const tandoorConfig = COUNTER_CONFIG['SS Tandoor'];
const noLafaInTandoor = !(tandoorConfig.sheets || []).some(s => s.materialName === 'LAFA');
assert(noLafaInTandoor, 'LAFA is NOT present in SS Tandoor');

const fridgeConfig = COUNTER_CONFIG['Fridge'];
const noLafaInFridge = !(fridgeConfig.sheets || []).some(s => s.materialName === 'LAFA');
assert(noLafaInFridge, 'LAFA is NOT present in Fridge');

console.log('\n====================================================');
console.log('11. VERIFYING WORKING TABLE & DINING TABLE INDEPENDENT SPECIFICATIONS');
console.log('====================================================');
import { COUNTER_TYPES } from './src/lib/constants.js';
assert(COUNTER_TYPES.includes('Working Table'), 'COUNTER_TYPES contains Working Table');
assert(COUNTER_TYPES.includes('Dining Table'), 'COUNTER_TYPES contains Dining Table');
assert(COUNTER_TYPES.indexOf('Working Table') !== -1, 'Working Table is present and selectable');
assert(COUNTER_TYPES.indexOf('Dining Table') !== -1, 'Dining Table is present and selectable');

// Check Working Table specifications (Top, Overhead Shelf, Underhead Shelf, LAFA)
const wtSheetNames = workingTable.sheets.map(s => s.materialName);
assert(wtSheetNames.includes('Top'), 'Working Table has Top sheet');
assert(wtSheetNames.includes('Overhead Shelf'), 'Working Table has Overhead Shelf');
assert(wtSheetNames.includes('Underhead Shelf'), 'Working Table has Underhead Shelf');
assert(wtSheetNames.includes('LAFA'), 'Working Table has LAFA');
assert(!wtSheetNames.includes('Table Top'), 'Working Table does NOT have Table Top (not mixed with Dining Table)');

// Check Dining Table specifications (Table Top, LAFA)
const dtSheetNames = diningTable.sheets.map(s => s.materialName);
assert(dtSheetNames.includes('Table Top'), 'Dining Table has Table Top sheet');
assert(dtSheetNames.includes('LAFA'), 'Dining Table has LAFA sheet');
assert(!dtSheetNames.includes('Overhead Shelf'), 'Dining Table does NOT have Overhead Shelf (not mixed with Working Table)');

console.log('\n====================================================');
console.log('12. VERIFYING CONDITIONAL ANGLE SECTION RULES (MS ANGLE)');
console.log('====================================================');
// 1. Gas Range
const gasRangeConfig = COUNTER_CONFIG['Gas Range'];
assert(gasRangeConfig.requiresAngle === true, 'Gas Range requiresAngle = true');
const gasRangeAngle = (gasRangeConfig.angles || []).find(a => a.materialName === 'MS Angle');
assert(Boolean(gasRangeAngle), 'Gas Range uses MS Angle');
assert(gasRangeAngle.grade === 'MS', 'Gas Range MS Angle has grade = MS');

// 2. Dosa Bhatti
const dosaBhattiConfig = COUNTER_CONFIG['Dosa Bhatti'];
assert(dosaBhattiConfig.requiresAngle === true, 'Dosa Bhatti requiresAngle = true');
const dosaAngle = (dosaBhattiConfig.angles || []).find(a => a.materialName === 'MS Angle');
assert(Boolean(dosaAngle), 'Dosa Bhatti uses MS Angle');
assert(dosaAngle.grade === 'MS', 'Dosa Bhatti MS Angle has grade = MS');

// 3. Chapati Puffer Plate
const chapatiPufferConfig = COUNTER_CONFIG['Chapati Puffer Plate'];
assert(chapatiPufferConfig.requiresAngle === true, 'Chapati Puffer Plate requiresAngle = true');
const chapatiAngle = (chapatiPufferConfig.angles || []).find(a => a.materialName === 'MS Angle');
assert(Boolean(chapatiAngle), 'Chapati Puffer Plate uses MS Angle');
assert(chapatiAngle.grade === 'MS', 'Chapati Puffer Plate MS Angle has grade = MS');

// 4. Trolley
const trollyCfg = COUNTER_CONFIG['Trolley'];
assert(trollyCfg.requiresAngle === true, 'Trolley requiresAngle = true');
const trollyAngle = (trollyCfg.angles || []).find(a => a.materialName === 'MS Angle');
assert(Boolean(trollyAngle), 'Trolley uses MS Angle');

// 5. Counters with NO angle
assert(COUNTER_CONFIG['Working Table'].requiresAngle === false, 'Working Table requiresAngle = false');
assert(COUNTER_CONFIG['Working Table'].angles.length === 0, 'Working Table angles is empty');
assert(COUNTER_CONFIG['Dining Table'].requiresAngle === false, 'Dining Table requiresAngle = false');
assert(COUNTER_CONFIG['Dining Table'].angles.length === 0, 'Dining Table angles is empty');
assert(COUNTER_CONFIG['Counter'].requiresAngle === false, 'Counter requiresAngle = false');
assert(COUNTER_CONFIG['Counter'].angles.length === 0, 'Counter angles is empty');
assert(COUNTER_CONFIG['Sink Unit'].requiresAngle === false, 'Sink Unit requiresAngle = false');
assert(COUNTER_CONFIG['Sink Unit'].angles.length === 0, 'Sink Unit angles is empty');
assert(COUNTER_CONFIG['SS Tandoor'].requiresAngle === false, 'SS Tandoor requiresAngle = false');
assert(COUNTER_CONFIG['SS Tandoor'].angles.length === 0, 'SS Tandoor angles is empty');
assert(COUNTER_CONFIG['Fridge'].requiresAngle === false, 'Fridge requiresAngle = false');
assert(COUNTER_CONFIG['Fridge'].angles.length === 0, 'Fridge angles is empty');
assert(COUNTER_CONFIG['Storage Bin'].requiresAngle === false, 'Storage Bin requiresAngle = false');
assert(COUNTER_CONFIG['Storage Bin'].angles.length === 0, 'Storage Bin angles is empty');
assert(COUNTER_CONFIG['Bain Merry Marie'].requiresAngle === false, 'Bain Merry Marie requiresAngle = false');
assert(COUNTER_CONFIG['Bain Merry Marie'].angles.length === 0, 'Bain Merry Marie angles is empty');
assert(COUNTER_CONFIG['Tea Counter'].requiresAngle === false, 'Tea Counter requiresAngle = false');
assert(COUNTER_CONFIG['Tea Counter'].angles.length === 0, 'Tea Counter angles is empty');
assert(COUNTER_CONFIG['GN PAN / ROUND POT'].requiresAngle === false, 'GN PAN / ROUND POT requiresAngle = false');
assert(COUNTER_CONFIG['GN PAN / ROUND POT'].angles.length === 0, 'GN PAN / ROUND POT angles is empty');

// Full estimate with MS Angle in Dosa Bhatti
const dosaEstimate = calculateEstimate({
  sheets: [
    { length: 48, width: 24, gauge: 1.2, quantity: 1 } // 7.75 kg
  ],
  pipes: [
    { pipeSize: '40 × 40 mm', pipeGauge: '16G', length: 10, quantity: 2 } // 11.80 kg
  ],
  angles: [
    { material: 'MS Angle', gauge: '25 × 3 mm', length: 10, quantity: 4 } // 10 * 0.340 * 4 = 13.60 kg
  ],
  purchased: [
    { quantity: 1, price: 1500 }
  ],
  materialRate: 250,
  angleRate: 150,
  pipeRate: 270,
  labourRate: 50,
  sellingPercentage: 10,
  counterQuantity: 1
});
assert(Math.abs(dosaEstimate.totalAngleWeight - 13.60) < 0.001, `Dosa Bhatti Angle Weight = 13.60 kg (got ${dosaEstimate.totalAngleWeight})`);
assert(Math.abs(dosaEstimate.totalWeight - (7.75 + 11.80 + 13.60)) < 0.001, `Dosa Bhatti Total Weight = 33.15 kg (got ${dosaEstimate.totalWeight})`);
assert(dosaEstimate.angleCost > 0, 'Dosa Bhatti Angle Cost is calculated');

console.log('\n====================================================');
console.log(`ALL TESTS COMPLETED: ${passedTests} passed, ${failedTests} failed.`);
console.log('====================================================');
if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
