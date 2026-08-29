import { 
  SHEET_GAUGES, 
  SHEET_GAUGE_OPTIONS, 
  SHEET_UNIT_OPTIONS,
  BAR_SIZE_OPTIONS,
  getStandardSheetWeight,
  PIPE_GAUGE_OPTIONS,
  PIPE_SIZE_OPTIONS,
  PIPE_MASTER,
  getPipeWeight20ft,
  getPipeWeightPerFoot,
  isPipeCombinationUnavailable,
  ANGLE_GAUGE_OPTIONS,
  COUNTER_CONFIG,
  COUNTER_TYPES,
  COUNTER_TYPES_CONFIG
} from './src/lib/constants.js';

import {
  calculateSheetWeight,
  calculatePipeWeight,
  calculatePipeTotalWeight,
  roundPipeFinalWeight,
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
console.log('1. VERIFYING SHEET GAUGES & UNIT OPTIONS (INCH & FT)');
console.log('====================================================');
assert(Array.isArray(SHEET_GAUGES), 'SHEET_GAUGES is an array');
assert(SHEET_GAUGES.length === 5, `SHEET_GAUGES has exactly 5 items (got ${SHEET_GAUGES.length})`);
assert(JSON.stringify(SHEET_UNIT_OPTIONS) === JSON.stringify(['INCH', 'FT']), 'SHEET_UNIT_OPTIONS strictly has INCH first, FT second');

// Sheet Weight in INCH vs FT
// 60" x 24" (10 sq.ft) with 1.2mm (0.96875 kg/sq.ft) = 9.6875 kg
const sheetInch = calculateSheetWeight({ length: 60, width: 24, gauge: 1.2, quantity: 1, unit: 'INCH' });
assert(Math.abs(sheetInch - 9.6875) < 0.001, `Sheet Weight (60"x24" INCH) = 9.6875 kg (got ${sheetInch})`);

// 5 FT x 2 FT (10 sq.ft) with 1.2mm = 9.6875 kg
const sheetFt = calculateSheetWeight({ length: 5, width: 2, gauge: 1.2, quantity: 1, unit: 'FT' });
assert(Math.abs(sheetFt - 9.6875) < 0.001, `Sheet Weight (5ft x 2ft FT) = 9.6875 kg (got ${sheetFt})`);

console.log('\n====================================================');
console.log('2. VERIFYING PIPE WEIGHT ROUNDING & BAR SIZES');
console.log('====================================================');
assert(roundPipeFinalWeight(9.40) === 10, '9.40 kg rounds to 10 kg (commercial standard)');
assert(roundPipeFinalWeight(9.49) === 9, '9.49 kg rounds to 9 kg');
assert(roundPipeFinalWeight(9.50) === 10, '9.50 kg rounds to 10 kg');
assert(roundPipeFinalWeight(10.20) === 10, '10.20 kg rounds to 10 kg');
assert(roundPipeFinalWeight(10.80) === 11, '10.80 kg rounds to 11 kg');

// Verify calculatePipeTotalWeight applies rounding to final total
const mockPipes = [
  { pipeSize: '40 × 40 mm', pipeGauge: '18G', length: 20, quantity: 1 } // 9.40 kg
];
assert(calculatePipeTotalWeight(mockPipes) === 10, 'calculatePipeTotalWeight returns 10 kg for 9.40 kg pipe');

assert(JSON.stringify(BAR_SIZE_OPTIONS) === JSON.stringify(['5 mm', '6 mm', '8 mm', '10 mm', '12 mm']), 'BAR_SIZE_OPTIONS is [5 mm, 6 mm, 8 mm, 10 mm, 12 mm]');

console.log('\n====================================================');
console.log('3. VERIFYING COUNTER OVERHEAD FIELDS RENAMING');
console.log('====================================================');
const counterConfig = COUNTER_CONFIG['Counter'];
const counterSheetNames = counterConfig.sheets.map(s => s.materialName);
assert(counterSheetNames.includes('Overhead Shelf Covering Left'), 'Counter has Overhead Shelf Covering Left');
assert(counterSheetNames.includes('Overhead Shelf Covering Right'), 'Counter has Overhead Shelf Covering Right');
assert(counterSheetNames.includes('Overhead Front Covering'), 'Counter has Overhead Front Covering');
assert(!counterSheetNames.includes('Overhead Covering Left'), 'Old Overhead Covering Left removed');
assert(!counterSheetNames.includes('Overhead Covering Right'), 'Old Overhead Covering Right removed');
assert(!counterSheetNames.includes('Overhead Shelf Covering'), 'Old Overhead Shelf Covering removed');

console.log('\n====================================================');
console.log('4. VERIFYING GAS RANGE & SUBTYPES SPECIFICATIONS');
console.log('====================================================');
const gasRangeTypes = ['Gas Range', 'Single Gas Range', 'Double Gas Range', 'Triple Gas Range', 'Four Gas Range', 'Chinese Gas Range'];
gasRangeTypes.forEach(grType => {
  const gr = COUNTER_CONFIG[grType];
  assert(Boolean(gr), `${grType} exists in COUNTER_CONFIG`);
  const sheets = gr.sheets.map(s => s.materialName);
  assert(sheets.includes('NCV Panel Covering'), `${grType} has NCV Panel Covering`);
  assert(sheets.includes('LAFA'), `${grType} has LAFA`);
  assert(sheets.includes('Tray'), `${grType} has Tray`);
  assert(sheets.includes('Burner Holding Stand'), `${grType} has Burner Holding Stand`);
  assert(sheets.includes('Tray Handle'), `${grType} has Tray Handle`);

  const pipes = gr.pipes.map(p => p.materialName);
  assert(pipes.includes('Tray Support Pipe'), `${grType} has Tray Support Pipe`);
  assert(pipes.includes('Leg Support Pipe'), `${grType} has Leg Support Pipe`);
  assert(pipes.indexOf('Leg Pipe') < pipes.indexOf('Tray Support Pipe'), `${grType} Leg Pipe is before Tray Support Pipe`);
  assert(pipes.indexOf('Tray Support Pipe') < pipes.indexOf('Leg Support Pipe'), `${grType} Tray Support Pipe is before Leg Support Pipe`);
});

console.log('\n====================================================');
console.log('5. VERIFYING DOSA BHATTI SPECIFICATIONS');
console.log('====================================================');
const dosaBhatti = COUNTER_CONFIG['Dosa Bhatti'];
const dbSheets = dosaBhatti.sheets.map(s => s.materialName);
assert(dbSheets.includes('Front Panel'), 'Dosa Bhatti has Front Panel');
assert(!dbSheets.includes('Panel Front Door'), 'Dosa Bhatti does NOT have Panel Front Door');
assert(dbSheets.includes('Oil Removable Splash Back'), 'Dosa Bhatti has Oil Removable Splash Back');
assert(dbSheets.indexOf('Top') === 0 && dbSheets.indexOf('Oil Removable Splash Back') === 1, 'Oil Removable Splash Back is directly under Top');
assert(dbSheets.includes('Burner Holding Stand'), 'Dosa Bhatti has Burner Holding Stand');

const dbPipes = dosaBhatti.pipes.map(p => p.materialName);
assert(dbPipes.includes('Panel Support Pipe'), 'Dosa Bhatti has Panel Support Pipe');
assert(dbPipes.indexOf('Leg Pipe') === 0 && dbPipes.indexOf('Panel Support Pipe') === 1, 'Panel Support Pipe is directly under Leg Pipe');

const dbPurchased = dosaBhatti.purchased.map(p => p.materialName);
assert(!dbPurchased.includes('Handle'), 'Handle removed from Dosa Bhatti purchased items');

console.log('\n====================================================');
console.log('6. VERIFYING CHAPATI PUFFER PLATE SPECIFICATIONS');
console.log('====================================================');
const chapati = COUNTER_CONFIG['Chapati Puffer Plate'];
const chSheets = chapati.sheets.map(s => s.materialName);
assert(!chSheets.includes('Shelf'), 'Shelf removed from Chapati Puffer Plate sheets');
assert(chSheets.includes('NCV Panel'), 'Chapati Puffer Plate has NCV Panel');
assert(chSheets.includes('Burner Holding Stand'), 'Chapati Puffer Plate has Burner Holding Stand');

const chPipes = chapati.pipes.map(p => p.materialName);
assert(chPipes.includes('Panel Support Pipe'), 'Chapati Puffer Plate has Panel Support Pipe');

const chPurchased = chapati.purchased.map(p => p.materialName);
const expectedPurchasedOrder = ['MS Plate', 'Puffer Burner', 'Puffer Plate', 'Dosa Burner', 'Mixing Tube', 'Copper Pipe', 'Gas Manifold', 'NCV', 'Bush'];
assert(JSON.stringify(chPurchased) === JSON.stringify(expectedPurchasedOrder), 'Chapati Puffer Plate purchased sequence is exact with Bush last');
assert(chPurchased[chPurchased.length - 1] === 'Bush', 'Bush is strictly the last purchased item');

console.log('\n====================================================');
console.log('7. VERIFYING SHAWARMA CABIN & HALF CABIN SPECIFICATIONS');
console.log('====================================================');
const shawarma = COUNTER_CONFIG['Shawarma Cabin'];
const shSheets = shawarma.sheets.map(s => s.materialName);
assert(shSheets.includes('Under Top Covering Right'), 'Shawarma Cabin has Under Top Covering Right');
assert(shSheets.includes('Under Top Covering Left'), 'Shawarma Cabin has Under Top Covering Left');
assert(shSheets.includes('Under Top Covering Front'), 'Shawarma Cabin has Under Top Covering Front');
assert(shSheets.includes('Partition'), 'Shawarma Cabin has Partition');
assert(shSheets.includes('LAFA'), 'Shawarma Cabin has LAFA');
assert(!shSheets.includes('Under Top Covering'), 'Old Under Top Covering removed');
assert(!shSheets.includes('Right Covering'), 'Old Right Covering removed');
assert(!shSheets.includes('Left Covering'), 'Old Left Covering removed');
assert(!shSheets.includes('Round Covering'), 'Old Round Covering removed');
assert(!shSheets.includes('Under Top Side Covering'), 'Old Under Top Side Covering removed');

const halfShawarma = COUNTER_CONFIG['Half Shawarma Cabin'];
const hshSheets = halfShawarma.sheets.map(s => s.materialName);
assert(hshSheets.includes('Under Top Covering Right'), 'Half Shawarma Cabin has Under Top Covering Right');
assert(hshSheets.includes('Under Top Covering Left'), 'Half Shawarma Cabin has Under Top Covering Left');
assert(hshSheets.includes('Under Top Covering Front'), 'Half Shawarma Cabin has Under Top Covering Front');
assert(hshSheets.includes('Partition'), 'Half Shawarma Cabin has Partition');
assert(hshSheets.includes('LAFA'), 'Half Shawarma Cabin has LAFA');

console.log('\n====================================================');
console.log('8. VERIFYING SS DISH RACK SPECIFICATIONS');
console.log('====================================================');
const dishRack = COUNTER_CONFIG['SS Dish Rack'];
const drPurchased = dishRack.purchased.map(p => p.materialName);
assert(drPurchased.includes('Wheel'), 'SS Dish Rack has Wheel in purchased');
const drPipes = dishRack.pipes.map(p => p.materialName);
assert(drPipes.includes('Bar'), 'SS Dish Rack has Bar under pipe');

console.log('\n====================================================');
console.log('9. VERIFYING POT RACK SPECIFICATIONS');
console.log('====================================================');
const potRack = COUNTER_CONFIG['Pot Rack'];
const prPurchased = potRack.purchased.map(p => p.materialName);
assert(prPurchased.includes('Wheel'), 'Pot Rack has Wheel in purchased');

console.log('\n====================================================');
console.log('10. VERIFYING STORAGE BIN SPECIFICATIONS');
console.log('====================================================');
const storageBin = COUNTER_CONFIG['Storage Bin'];
const sbPipes = storageBin.pipes.map(p => p.materialName);
assert(sbPipes.includes('Bar'), 'Storage Bin has Bar under pipe');
const sbPurchased = storageBin.purchased.map(p => p.materialName);
assert(!sbPurchased.includes('Bar'), 'Storage Bin does NOT have Bar in purchased');

console.log('\n====================================================');
console.log('11. VERIFYING TROLLY SPECIFICATIONS');
console.log('====================================================');
const trolly = COUNTER_CONFIG['Trolley'];
const trTop = trolly.sheets.find(s => s.materialName === 'Top');
assert(trTop && trTop.hasDepth === true, 'Trolley Top has hasDepth = true');
const trTank = trolly.sheets.find(s => s.materialName === 'Tank');
assert(trTank && trTank.hasDepth === true, 'Trolley Tank has hasDepth = true');

// Calculate Tank Sheet Weight with Depth (e.g. 36" x 24" x 10" Depth with 1.2mm)
const tankWeight = calculateSheetWeight({ length: 36, width: 24, depth: 10, gauge: 1.2, quantity: 1 });
// Area = (36 * 24 + 2 * (36 + 24) * 10) / 144 = (864 + 1200) / 144 = 2064 / 144 = 14.3333 sq.ft
// 14.3333 * 0.96875 = 13.8854 kg
assert(Math.abs(tankWeight - 13.8854) < 0.01, `Tank Sheet Weight with Depth = 13.89 kg (got ${tankWeight.toFixed(2)})`);

console.log('\n====================================================');
console.log('12. VERIFYING BAIN MERIY SPECIFICATIONS');
console.log('====================================================');
assert(COUNTER_TYPES.includes('Bain Meriy'), 'COUNTER_TYPES includes Bain Meriy');
assert(!COUNTER_TYPES.includes('Bain Merry Marie'), 'COUNTER_TYPES does NOT include old name Bain Merry Marie');

const bainMeriy = COUNTER_CONFIG['Bain Meriy'];
assert(Boolean(bainMeriy), 'Bain Meriy exists in COUNTER_CONFIG');
const bmSheets = bainMeriy.sheets.map(s => s.materialName);
assert(!bmSheets.includes('Drawer') && !bmSheets.includes('Drawers'), 'Bain Meriy does NOT have Drawers');
assert(bmSheets.includes('Tank'), 'Bain Meriy has Tank');
const bmTank = bainMeriy.sheets.find(s => s.materialName === 'Tank');
assert(bmTank && bmTank.hasDepth === true, 'Bain Meriy Tank has hasDepth = true');
assert(bmSheets.includes('Tank Panel Covering'), 'Bain Meriy has Tank Panel Covering');

const bmPipes = bainMeriy.pipes.map(p => p.materialName);
assert(!bmPipes.includes('4 × Pipe') && !bmPipes.includes('Pipe'), 'Bain Meriy does NOT have generic 4x Pipe');
assert(bmPipes.includes('Leg Pipe'), 'Bain Meriy has Leg Pipe');
assert(bmPipes.includes('Top Support Pipe'), 'Bain Meriy has Top Support Pipe');
assert(bmPipes.includes('Under Support Pipe'), 'Bain Meriy has Under Support Pipe');
assert(bmPipes.includes('Shelf Support Pipe'), 'Bain Meriy has Shelf Support Pipe');

const bmPurchased = bainMeriy.purchased.map(p => p.materialName);
assert(bmPurchased.includes('Wheel'), 'Bain Meriy has Wheel in purchased');

console.log('\n====================================================');
console.log('13. VERIFYING TEA COUNTER SPECIFICATIONS');
console.log('====================================================');
const teaCounter = COUNTER_CONFIG['Tea Counter'];
const tcSheets = teaCounter.sheets.map(s => s.materialName);
assert(tcSheets.includes('Roof'), 'Tea Counter has Roof');
assert(tcSheets.includes('Overhead Shelf'), 'Tea Counter has Overhead Shelf');

const tcPipes = teaCounter.pipes.map(p => p.materialName);
const expectedTcPipes = ['Leg Pipe', 'Top Support Pipe', 'Leg Support Pipe', 'Shelf Support Pipe'];
assert(JSON.stringify(tcPipes) === JSON.stringify(expectedTcPipes), 'Tea Counter has exact 4 main pipes without duplicates');

const tcPurchased = teaCounter.purchased.map(p => p.materialName);
assert(tcPurchased.includes('Wheel'), 'Tea Counter has Wheel in purchased');

console.log('\n====================================================');
console.log('14. VERIFYING MULTI-COUNTER ISOLATION & COMPOSITE ESTIMATION');
console.log('====================================================');
// Counter 1: Working Table
const c1Estimate = calculateEstimate({
  materials: [
    { calculationType: 'sheet', length: 60, width: 24, gauge: 1.2, quantity: 1 }, // 9.6875 kg
    { calculationType: 'pipe', pipeSize: '40 × 40 mm', pipeGauge: '16G', length: 10, quantity: 2 } // 11.80 kg -> rounded pipe 12 kg
  ],
  materialRate: 250,
  labourRate: 50,
  sellingPercentage: 15,
  counterQuantity: 1
});

// Counter 2: Dosa Bhatti with MS Angle
const c2Estimate = calculateEstimate({
  materials: [
    { calculationType: 'sheet', length: 48, width: 24, gauge: 1.2, quantity: 1 }, // 7.75 kg
    { calculationType: 'pipe', pipeSize: '40 × 40 mm', pipeGauge: '16G', length: 10, quantity: 2 }, // 11.80 kg -> rounded pipe 12 kg
    { calculationType: 'angle', material: 'MS Angle', gauge: '25 × 3 mm', length: 10, quantity: 4 } // 13.60 kg
  ],
  materialRate: 250,
  labourRate: 50,
  sellingPercentage: 20,
  counterQuantity: 2
});

assert(c1Estimate.totalWeight > 0, 'Counter 1 calculated weight > 0');
assert(c2Estimate.totalWeight > 0, 'Counter 2 calculated weight > 0');
assert(c1Estimate.totalAngleWeight === 0, 'Counter 1 (Working Table) has NO Angle Weight');
assert(Math.abs(c2Estimate.totalAngleWeight - 13.60) < 0.001, 'Counter 2 (Dosa Bhatti) has 13.60 kg Angle Weight');
assert(c1Estimate.unitSellingPrice !== c2Estimate.unitSellingPrice, 'Counter 1 & 2 retain distinct selling prices');

console.log('\n====================================================');
console.log(`ALL TESTS COMPLETED: ${passedTests} passed, ${failedTests} failed.`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
