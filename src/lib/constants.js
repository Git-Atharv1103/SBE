/**
 * Shree Balaji Enterprises — Central Constants & Master Configuration
 * Single source of truth for Stainless Steel Fabrication Master data.
 */

export const COMPANY_DETAILS = {
  name: 'SHREE BALAJI ENTERPRISES',
  subtitle: 'Commercial/Hotel Kitchen Equipment Manufacturer',
  description: 'Commercial/Hotel Kitchen Equipment, Canteen Kitchen Equipment, Refrigeration Equipments, Fastfood/Display Counter, Exhaust Ventilation System, Food Processing Machine, Commercial Dishwasher',
  address: 'Sr. No - 2/1 Mangde Wadi - Katraj, Pune Satara Road, Near Indian Oil Petrol Pump, Katraj, Pune - 411046',
  phone: '+91 9604386808 / +91 9422541505 / +91 9011127134',
  phones: ['+91 9604386808', '+91 9422541505', '+91 9011127134'],
  office: '+91 9604597979',
  email: 'balajishree46@gmail.com',
  website: 'balajishree46@gmail.com',
  gstin: '27AAAAA0000A1Z5'
};

export const DEFAULT_TERMS_AND_CONDITIONS = [
  { label: 'Payment', value: '50% Advance along with Purchase Order, balance 50% against proforma invoice before dispatch.' },
  { label: 'Transportation', value: 'Extra at actual / To be arranged by client.' },
  { label: 'Delivery', value: '2 to 3 weeks from the date of confirmed PO and technical clearance.' },
  { label: 'Unloading', value: 'Scope of buyer / customer at delivery site.' },
  { label: 'Validity', value: '30 Days from quotation date.' }
];

// Sheet Grades (ONLY 202, 304, 316)
export const SHEET_GRADES = ['202', '304', '316'];
export const STAINLESS_STEEL_GRADES = ['202', '304', '316'];

// Default GST rate in percent (%)
export const DEFAULT_GST_PERCENT = 18;

// Standard Sheet Gauges & Workshop Weight Map (kg per square foot)
// Formula: Area (sq.ft) = (Length_in × Width_in) / 144
// Weight (kg) = Area × WeightPerSqFt × Quantity
export const STANDARD_GAUGE_WEIGHTS = {
  0.6: 0.487,
  0.8: 0.650,
  1.0: 0.812,
  1.2: 1.000,
  1.5: 1.200,
  2.0: 1.620,
  2.5: 2.025,
  3.0: 2.430,
  4.0: 3.240
};

export const STANDARD_GAUGES = [
  { label: '0.6 mm', value: 0.6, weightPerSqFt: 0.487 },
  { label: '0.8 mm', value: 0.8, weightPerSqFt: 0.650 },
  { label: '1.0 mm', value: 1.0, weightPerSqFt: 0.812 },
  { label: '1.2 mm', value: 1.2, weightPerSqFt: 1.000 },
  { label: '1.5 mm', value: 1.5, weightPerSqFt: 1.200 },
  { label: '2.0 mm', value: 2.0, weightPerSqFt: 1.620 },
  { label: '2.5 mm', value: 2.5, weightPerSqFt: 2.025 },
  { label: '3.0 mm', value: 3.0, weightPerSqFt: 2.430 },
  { label: '4.0 mm', value: 4.0, weightPerSqFt: 3.240 }
];

export const FRIDGE_GAUGES = [
  { label: '0.6 mm', value: 0.6, weightPerSqFt: 0.487 },
  { label: '0.8 mm', value: 0.8, weightPerSqFt: 0.650 }
];

/**
 * Get weight per square foot for a given gauge in mm
 * @param {number|string} gauge - Gauge in mm
 * @returns {number} Weight in kg/sq.ft
 */
export function getGaugeWeightPerSqFt(gauge) {
  const g = parseFloat(gauge);
  if (isNaN(g) || g <= 0) return 0;
  if (STANDARD_GAUGE_WEIGHTS[g] !== undefined) {
    return STANDARD_GAUGE_WEIGHTS[g];
  }
  return g * 0.812;
}

// Central Pipe Master Configuration with Workshop Weight Per Foot (kg/ft)
// Formula: Weight = Length (ft) × WeightPerFoot × Quantity
export const PIPE_MASTER = [
  { id: 'sq-1in', label: '1" (25 × 25 mm)', pipeSize: '1"', shape: 'square', outerWidth: 25, outerHeight: 25, wallThickness: 1.2, weightPerFoot: 0.300 },
  { id: 'sq-1-25in', label: '1.25" (32 × 32 mm)', pipeSize: '1.25"', shape: 'square', outerWidth: 32, outerHeight: 32, wallThickness: 1.2, weightPerFoot: 0.410 },
  { id: 'sq-1-5in', label: '1.5" (38 × 38 mm)', pipeSize: '1.5"', shape: 'square', outerWidth: 38, outerHeight: 38, wallThickness: 1.2, weightPerFoot: 0.525 },
  { id: 'sq-40mm', label: '40 × 40 mm', pipeSize: '40 × 40 mm', shape: 'square', outerWidth: 40, outerHeight: 40, wallThickness: 1.2, weightPerFoot: 0.560 },
  { id: 'sq-2in', label: '2" (50 × 50 mm)', pipeSize: '2"', shape: 'square', outerWidth: 50, outerHeight: 50, wallThickness: 1.5, weightPerFoot: 0.700 },
  { id: 'rect-40-20', label: '40 × 20 mm', pipeSize: '40 × 20 mm', shape: 'rectangular', outerWidth: 40, outerHeight: 20, wallThickness: 1.2, weightPerFoot: 0.420 },
  { id: 'rect-50-25', label: '50 × 25 mm', pipeSize: '50 × 25 mm', shape: 'rectangular', outerWidth: 50, outerHeight: 25, wallThickness: 1.2, weightPerFoot: 0.530 },
  { id: 'rect-60-40', label: '60 × 40 mm', pipeSize: '60 × 40 mm', shape: 'rectangular', outerWidth: 60, outerHeight: 40, wallThickness: 1.5, weightPerFoot: 0.700 },
  { id: 'circ-25', label: 'Ø 25 mm (Round)', pipeSize: 'Ø 25 mm', shape: 'circular', outerDiameter: 25, wallThickness: 1.2, weightPerFoot: 0.235 },
  { id: 'circ-32', label: 'Ø 32 mm (Round)', pipeSize: 'Ø 32 mm', shape: 'circular', outerDiameter: 32, wallThickness: 1.2, weightPerFoot: 0.300 },
  { id: 'circ-38', label: 'Ø 38 mm (Round)', pipeSize: 'Ø 38 mm', shape: 'circular', outerDiameter: 38, wallThickness: 1.2, weightPerFoot: 0.360 },
  { id: 'circ-50', label: 'Ø 50 mm (Round)', pipeSize: 'Ø 50 mm', shape: 'circular', outerDiameter: 50, wallThickness: 1.5, weightPerFoot: 0.550 },
  { id: 'copper-pipe', label: 'Copper Pipe (1/2")', pipeSize: 'Copper Pipe', shape: 'circular', outerDiameter: 12.7, wallThickness: 1.0, weightPerFoot: 0.200 }
];

/**
 * Get weight per foot for a given pipe size / gauge
 * @param {string} pipeSize 
 * @returns {number} Weight in kg/ft
 */
export function getPipeWeightPerFoot(pipeSize) {
  if (!pipeSize) return 0;
  const str = String(pipeSize).trim().toLowerCase();

  const matched = PIPE_MASTER.find(
    p => p.id.toLowerCase() === str || 
         p.label.toLowerCase() === str || 
         p.pipeSize.toLowerCase() === str ||
         p.label.toLowerCase().includes(str) ||
         str.includes(p.pipeSize.toLowerCase())
  );
  if (matched && matched.weightPerFoot) {
    return matched.weightPerFoot;
  }

  if (str.includes('1.5') || str.includes('1-1/2') || str.includes('1½') || str.includes('38')) return 0.525;
  if (str.includes('1.25') || str.includes('1-1/4') || str.includes('1¼') || str.includes('32')) return 0.410;
  if (str.includes('2') || str.includes('50')) return 0.700;
  if (str.includes('40')) return 0.560;
  if (str.includes('copper')) return 0.200;
  if (str.includes('1"') || str.includes('1 ') || str.includes('25')) return 0.300;

  return 0.300;
}

// Angle Master Configuration with Workshop Weight Per Foot (kg/ft)
// Formula: Weight = Length (ft) × WeightPerFoot × Quantity
export const ANGLE_MASTER = [
  { id: 'angle-25-3', label: '25 × 3 mm', size: '25 × 3 mm', weightPerFoot: 0.340, weightPerMeter: 1.11 },
  { id: 'angle-30-3', label: '30 × 3 mm', size: '30 × 3 mm', weightPerFoot: 0.410, weightPerMeter: 1.34 }
];

export const ANGLE_GAUGE_OPTIONS = ['25 × 3 mm', '30 × 3 mm'];

/**
 * Get weight per foot for a given angle gauge
 * @param {string} gauge 
 * @returns {number} Weight in kg/ft
 */
export function getAngleWeightPerFoot(gauge) {
  if (!gauge) return 0;
  const str = String(gauge).trim().toLowerCase();
  const matched = ANGLE_MASTER.find(a => 
    a.id.toLowerCase() === str || 
    a.label.toLowerCase() === str || 
    a.size.toLowerCase() === str || 
    str.includes(a.size.toLowerCase())
  );
  if (matched && matched.weightPerFoot) return matched.weightPerFoot;
  if (str.includes('30')) return 0.410;
  if (str.includes('25')) return 0.340;
  return 0.340;
}

// Standard Dropdown Option Constants
export const BURNER_SIZES = ['G8', 'G9', 'G10', 'T22', 'T30', 'T33', 'T35'];
export const COPPER_PIPE_SIZES = ['1 ft', '1.5 ft', '2 ft', '2.5 ft', '3 ft'];
export const MIXING_TUBE_SIZES = ['G8', 'G9', 'G10', 'T22', 'T30', 'T33', 'T35'];
export const DOSA_BURNER_SIZES = ['1', '1.5', '2', '2.5', '3', '3.5', '4'];
export const GN_PAN_OPTIONS = ['1', '1.2', '1.3', '1.4', '1.5', '1.6'];
export const ROUND_VESSEL_OPTIONS = ['2 L', '5 L', '7 L', '10 L'];
export const PATTI_OPTIONS = ['25×3', '30×3'];
export const BAR_OPTIONS = ['8 mm', '10 mm', '12 mm'];

// Helper to determine size options for dynamic items
export function getItemSizeOptions(materialName) {
  if (!materialName) return null;
  const name = String(materialName).trim().toLowerCase();
  if (name.includes('gn pan')) return GN_PAN_OPTIONS;
  if (name.includes('round vessel')) return ROUND_VESSEL_OPTIONS;
  if (name.includes('patti') && !name.includes('shelf') && !name.includes('clamp') && !name.includes('wal')) return PATTI_OPTIONS;
  if (name === 'bar' || name.includes('bar rod') || name.includes('skewer')) return BAR_OPTIONS;
  if (name.includes('dosa burner')) return DOSA_BURNER_SIZES;
  if (name.includes('burner') && !name.includes('pilot') && !name.includes('puffer')) return BURNER_SIZES;
  if (name.includes('copper pipe')) return COPPER_PIPE_SIZES;
  if (name.includes('mixing tube')) return MIXING_TUBE_SIZES;
  return null;
}

// Counter Types Configuration with Subtype & Hierarchy Support
export const COUNTER_TYPES_CONFIG = {
  'SS Dish Rack': {
    hasSubtypes: false,
    subtypes: [],
    aliases: ['Dish Rack']
  },
  'Dish Rack': {
    hasSubtypes: false,
    subtypes: []
  },
  'Pot Rack': {
    hasSubtypes: false,
    subtypes: []
  },
  'Dining Table': {
    hasSubtypes: false,
    subtypes: []
  },
  'Bench': {
    hasSubtypes: false,
    subtypes: []
  },
  'Storage Bin': {
    hasSubtypes: true,
    subtypeLabel: 'Storage Bin Type',
    subtypes: [
      'Onion Storage',
      'Potato Storage',
      'Grain Storage'
    ]
  },
  'Counter': {
    hasSubtypes: false,
    subtypes: [],
    aliases: ['Counters']
  },
  'Counters': {
    hasSubtypes: false,
    subtypes: []
  },
  'Trolley': {
    hasSubtypes: false,
    subtypes: []
  },
  'Fridge': {
    hasSubtypes: true,
    isHierarchical: true,
    subtypeLabel: 'Fridge Orientation & Doors',
    orientationLabel: 'Fridge Orientation',
    orientations: ['Vertical', 'Horizontal'],
    verticalDoors: ['2 Doors', '3 Doors', '4 Doors', '5 Doors', '6 Doors'],
    horizontalDoors: ['2 Doors', '2.5 Doors', '3 Doors'],
    subtypes: [
      'Vertical - 2 Doors',
      'Vertical - 3 Doors',
      'Vertical - 4 Doors',
      'Vertical - 5 Doors',
      'Vertical - 6 Doors',
      'Horizontal - 2 Doors',
      'Horizontal - 2.5 Doors',
      'Horizontal - 3 Doors'
    ]
  },
  'Table': {
    hasSubtypes: false,
    subtypes: []
  },
  'Sink Unit': {
    hasSubtypes: false,
    subtypes: []
  },
  'Sink Unit with Table': {
    hasSubtypes: false,
    subtypes: []
  },
  'Soiled Dish Table': {
    hasSubtypes: false,
    subtypes: []
  },
  'Gas Range': {
    hasSubtypes: true,
    subtypeLabel: 'Gas Range Type',
    subtypes: [
      'Single Gas Range',
      'Double Gas Range',
      'Triple Gas Range',
      'Four Gas Range',
      'Chinese Gas Range'
    ]
  },
  'Dosa Bhatti': {
    hasSubtypes: false,
    subtypes: []
  },
  'SS Tandoor': {
    hasSubtypes: false,
    subtypes: []
  },
  'Shawarma Cabin': {
    hasSubtypes: true,
    subtypeLabel: 'Shawarma Cabin Type',
    subtypes: [
      'Table Top Shawarma Cabin',
      'Half Shawarma Cabin',
      'Full Shawarma Cabin'
    ]
  },
  'Chapati Puffer Plate': {
    hasSubtypes: false,
    subtypes: []
  }
};

// Available Main Counter Types
export const COUNTER_TYPES = [
  'SS Dish Rack',
  'Pot Rack',
  'Dining Table',
  'Bench',
  'Storage Bin',
  'Counter',
  'Trolley',
  'Fridge',
  'Table',
  'Sink Unit',
  'Sink Unit with Table',
  'Soiled Dish Table',
  'Gas Range',
  'Dosa Bhatti',
  'SS Tandoor',
  'Shawarma Cabin',
  'Chapati Puffer Plate'
];

export const counterTypeOptions = COUNTER_TYPES;

const GAS_RANGE_SUBTYPES = ['Gas Range', 'Single Gas Range', 'Double Gas Range', 'Triple Gas Range', 'Four Gas Range', 'Chinese Gas Range'];
const STORAGE_BIN_SUBTYPES = ['Storage Bin', 'Onion Storage', 'Potato Storage', 'Grain Storage'];
const FRIDGE_SUBTYPES = [
  'Fridge',
  'Vertical - 2 Doors', 'Vertical - 3 Doors', 'Vertical - 4 Doors', 'Vertical - 5 Doors', 'Vertical - 6 Doors',
  'Horizontal - 2 Doors', 'Horizontal - 2.5 Doors', 'Horizontal - 3 Doors'
];
const SHAWARMA_SUBTYPES = ['Shawarma Cabin', 'Table Top Shawarma Cabin', 'Half Shawarma Cabin', 'Full Shawarma Cabin'];
const DISH_RACK_KEYS = ['SS Dish Rack', 'Dish Rack'];
const COUNTER_KEYS = ['Counter', 'Counters'];

/**
 * Standard seed catalog for Material Master with complete Counter Type & Subtype assignments.
 */
export const DEFAULT_MASTER_PRODUCTS = [
  // ==========================================
  // 1. SS DISH RACK
  // ==========================================
  { materialName: 'Shelf', category: 'Sheet', calculationType: 'Sheet', materialType: 'Storage Shelf', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...DISH_RACK_KEYS, 'Chapati Puffer Plate'], order: 1, status: 'Active', unit: 'kg', price: 250, description: 'SS Dish Storage Tier Shelf' },
  { materialName: 'Leg Pipe', category: 'Pipe', calculationType: 'Pipe', materialType: 'Framework Leg', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...DISH_RACK_KEYS, 'Pot Rack', 'Dining Table', 'Bench', ...STORAGE_BIN_SUBTYPES, ...COUNTER_KEYS, 'Trolley', ...FRIDGE_SUBTYPES, 'Table', 'Sink Unit', 'Sink Unit with Table', 'Soiled Dish Table', ...GAS_RANGE_SUBTYPES, 'Dosa Bhatti', 'SS Tandoor', ...SHAWARMA_SUBTYPES, 'Chapati Puffer Plate'], order: 1, status: 'Active', unit: 'kg', price: 270, description: 'SS Main Structural Framework Leg Pipe' },
  { materialName: 'Top Support Pipe', category: 'Pipe', calculationType: 'Pipe', materialType: 'Top Reinforcement', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...DISH_RACK_KEYS, 'Dining Table', 'Bench', ...STORAGE_BIN_SUBTYPES, ...COUNTER_KEYS, 'Trolley', ...FRIDGE_SUBTYPES, 'Table', 'Sink Unit', 'Sink Unit with Table', 'Soiled Dish Table', ...GAS_RANGE_SUBTYPES, 'Dosa Bhatti', 'SS Tandoor', 'Chapati Puffer Plate'], order: 2, status: 'Active', unit: 'kg', price: 270, description: 'SS Top Frame Under Support Pipe' },
  { materialName: 'Shelf Support Pipe', category: 'Pipe', calculationType: 'Pipe', materialType: 'Shelf Reinforcement', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...DISH_RACK_KEYS, ...STORAGE_BIN_SUBTYPES, ...COUNTER_KEYS, 'Trolley', ...FRIDGE_SUBTYPES, 'Table', ...GAS_RANGE_SUBTYPES, 'Dosa Bhatti', 'SS Tandoor', ...SHAWARMA_SUBTYPES, 'Chapati Puffer Plate'], order: 3, status: 'Active', unit: 'kg', price: 270, description: 'SS Shelf Support Cross Framework Pipe' },
  { materialName: 'Under Support Pipe', category: 'Pipe', calculationType: 'Pipe', materialType: 'Base Reinforcement', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...DISH_RACK_KEYS, ...STORAGE_BIN_SUBTYPES, ...COUNTER_KEYS, 'Trolley', ...FRIDGE_SUBTYPES, 'Table', ...GAS_RANGE_SUBTYPES, 'Dosa Bhatti', 'SS Tandoor', 'Chapati Puffer Plate'], order: 4, status: 'Active', unit: 'kg', price: 270, description: 'SS Base Reinforcement Under Support Pipe' },
  { materialName: 'Bush', category: 'Purchased', calculationType: 'Purchased', materialType: 'Hardware', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...DISH_RACK_KEYS, 'Pot Rack', 'Dining Table', 'Bench', ...COUNTER_KEYS, ...FRIDGE_SUBTYPES, 'Table', 'Sink Unit', 'Sink Unit with Table', 'Soiled Dish Table', ...GAS_RANGE_SUBTYPES, 'Dosa Bhatti', 'Chapati Puffer Plate'], order: 1, status: 'Active', unit: 'Piece', price: 50, description: 'Heavy duty leg insert bush' },

  // ==========================================
  // 2. POT RACK
  // ==========================================
  { materialName: 'Frame Pipe', category: 'Pipe', calculationType: 'Pipe', materialType: 'Outer Framework', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Pot Rack'], order: 2, status: 'Active', unit: 'kg', price: 270, description: 'SS Pot Rack Perimeter Frame Pipe' },
  { materialName: 'Mid Pipe', category: 'Pipe', calculationType: 'Pipe', materialType: 'Tier Framework', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Pot Rack'], order: 3, status: 'Active', unit: 'kg', price: 270, description: 'SS Pot Rack Intermediate Tier Pipe' },

  // ==========================================
  // 3. DINING TABLE
  // ==========================================
  { materialName: 'Table Top', category: 'Sheet', calculationType: 'Sheet', materialType: 'Top Work Surface', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Dining Table', 'Soiled Dish Table'], order: 1, status: 'Active', unit: 'kg', price: 250, description: 'SS Heavy Duty Table Top Sheet' },
  { materialName: 'Center Pipe', category: 'Pipe', calculationType: 'Pipe', materialType: 'Center Spine', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Dining Table'], order: 2, status: 'Active', unit: 'kg', price: 270, description: 'SS Central Longitudinal Support Pipe' },
  { materialName: 'Leg Support Pipe', category: 'Pipe', calculationType: 'Pipe', materialType: 'Leg Bracing', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Dining Table', 'Bench', 'Sink Unit', 'Sink Unit with Table', 'Soiled Dish Table'], order: 4, status: 'Active', unit: 'kg', price: 270, description: 'SS Horizontal Leg Tie Bracing Pipe' },
  { materialName: 'Stool Support Pipe', category: 'Pipe', calculationType: 'Pipe', materialType: 'Stool Arm', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Dining Table'], order: 5, status: 'Active', unit: 'kg', price: 270, description: 'SS Integrated Stool Arm Framework Pipe' },
  { materialName: 'Thali', category: 'Purchased', calculationType: 'Purchased', materialType: 'Hardware', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Dining Table', ...SHAWARMA_SUBTYPES], order: 2, status: 'Active', unit: 'Piece', price: 420, description: 'SS Pressed Plate / Rotating Thali' },
  { materialName: 'Patti', category: 'Purchased', calculationType: 'Purchased', materialType: 'Flat Strip', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, dropdownOptions: ['25×3', '30×3'], allowMultiple: true, counterTypes: ['Dining Table'], order: 3, status: 'Active', unit: 'Piece', price: 180, description: 'SS Flat Patti Strip (25×3, 30×3)' },
  { materialName: 'Bar', category: 'Purchased', calculationType: 'Purchased', materialType: 'Solid Bar', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, dropdownOptions: ['8 mm', '10 mm', '12 mm'], allowMultiple: true, counterTypes: ['Dining Table', ...STORAGE_BIN_SUBTYPES, ...SHAWARMA_SUBTYPES], order: 4, status: 'Active', unit: 'Piece', price: 220, description: 'SS Round / Square Solid Bar' },

  // ==========================================
  // 4. BENCH
  // ==========================================
  { materialName: 'Top', category: 'Sheet', calculationType: 'Sheet', materialType: 'Top Surface', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Bench', ...COUNTER_KEYS, 'Trolley', 'Table', 'Sink Unit', 'Sink Unit with Table', ...GAS_RANGE_SUBTYPES, 'Dosa Bhatti', 'SS Tandoor', 'Table Top Shawarma Cabin', 'Half Shawarma Cabin', 'Chapati Puffer Plate'], order: 1, status: 'Active', unit: 'kg', price: 250, description: 'SS Seating / Working Top Surface Sheet' },
  { materialName: 'Back Support', category: 'Sheet', calculationType: 'Sheet', materialType: 'Back Rest', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Bench'], order: 2, status: 'Active', unit: 'kg', price: 250, description: 'SS Ergonomic Back Support Sheet' },
  { materialName: 'Back Support Pipe', category: 'Pipe', calculationType: 'Pipe', materialType: 'Back Rest Frame', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Bench'], order: 4, status: 'Active', unit: 'kg', price: 270, description: 'SS Back Rest Structural Frame Pipe' },

  // ==========================================
  // 5. STORAGE BIN (ONION, POTATO, GRAIN)
  // ==========================================
  { materialName: 'Top Door', category: 'Sheet', calculationType: 'Sheet', materialType: 'Cover Door', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...STORAGE_BIN_SUBTYPES], order: 1, status: 'Active', unit: 'kg', price: 250, description: 'SS Top Hopper Infeed Door' },
  { materialName: 'Bottom', category: 'Sheet', calculationType: 'Sheet', materialType: 'Bottom Basin', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...STORAGE_BIN_SUBTYPES], order: 2, status: 'Active', unit: 'kg', price: 250, description: 'SS Sloped / Flat Storage Bottom Sheet' },
  { materialName: 'Front Covering', category: 'Sheet', calculationType: 'Sheet', materialType: 'Front Cladding', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...STORAGE_BIN_SUBTYPES, ...COUNTER_KEYS, 'Sink Unit', 'Sink Unit with Table', 'Soiled Dish Table', ...GAS_RANGE_SUBTYPES, 'Dosa Bhatti', 'SS Tandoor', ...SHAWARMA_SUBTYPES, 'Chapati Puffer Plate'], order: 3, status: 'Active', unit: 'kg', price: 250, description: 'SS Front Apron / Enclosure Covering Panel' },
  { materialName: 'Side Covering – Right', category: 'Sheet', calculationType: 'Sheet', materialType: 'Side Panel', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...STORAGE_BIN_SUBTYPES, ...COUNTER_KEYS, 'Sink Unit', 'Sink Unit with Table', 'Soiled Dish Table', ...GAS_RANGE_SUBTYPES, 'Dosa Bhatti', 'SS Tandoor', 'Chapati Puffer Plate'], order: 4, status: 'Active', unit: 'kg', price: 250, description: 'SS Right Side Covering Panel' },
  { materialName: 'Side Covering – Left', category: 'Sheet', calculationType: 'Sheet', materialType: 'Side Panel', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...STORAGE_BIN_SUBTYPES, ...COUNTER_KEYS, 'Sink Unit', 'Sink Unit with Table', 'Soiled Dish Table', ...GAS_RANGE_SUBTYPES, 'Dosa Bhatti', 'SS Tandoor', 'Chapati Puffer Plate'], order: 5, status: 'Active', unit: 'kg', price: 250, description: 'SS Left Side Covering Panel' },
  { materialName: 'Base', category: 'Sheet', calculationType: 'Sheet', materialType: 'Base Pan', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...STORAGE_BIN_SUBTYPES], order: 6, status: 'Active', unit: 'kg', price: 250, description: 'SS Structural Base Sheet' },
  { materialName: 'Internal Partition', category: 'Sheet', calculationType: 'Sheet', materialType: 'Divider Sheet', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...STORAGE_BIN_SUBTYPES], order: 7, status: 'Active', unit: 'kg', price: 250, description: 'SS Internal Compartment Partition' },
  { materialName: 'Handle', category: 'Purchased', calculationType: 'Purchased', materialType: 'Hardware', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...STORAGE_BIN_SUBTYPES, ...COUNTER_KEYS, ...FRIDGE_SUBTYPES], order: 1, status: 'Active', unit: 'Piece', price: 150, description: 'Heavy SS Door & Drawer Pull Handle' },
  { materialName: 'Hinges', category: 'Purchased', calculationType: 'Purchased', materialType: 'Hardware', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...STORAGE_BIN_SUBTYPES, ...COUNTER_KEYS, ...FRIDGE_SUBTYPES], order: 2, status: 'Active', unit: 'Piece', price: 120, description: 'SS Heavy Duty Pivot / Butt Hinges' },
  { materialName: 'Wheel', category: 'Purchased', calculationType: 'Purchased', materialType: 'Hardware', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...STORAGE_BIN_SUBTYPES, ...COUNTER_KEYS, ...FRIDGE_SUBTYPES], order: 3, status: 'Active', unit: 'Piece', price: 350, description: 'Heavy Duty Caster Swivel Wheel' },
  { materialName: 'Square Bar Grill', category: 'Purchased', calculationType: 'Purchased', materialType: 'Ventilation Grill', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...STORAGE_BIN_SUBTYPES], order: 4, status: 'Active', unit: 'Piece', price: 850, description: 'SS Square Bar Aeration & Ventilation Grill' },

  // ==========================================
  // 6. COUNTER (COUNTERS)
  // ==========================================
  { materialName: 'Under Shelf', category: 'Sheet', calculationType: 'Sheet', materialType: 'Under Shelf', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS, 'Table', 'Trolley', 'Sink Unit', 'Sink Unit with Table', ...GAS_RANGE_SUBTYPES, 'Dosa Bhatti', 'Half Shawarma Cabin', 'Full Shawarma Cabin'], order: 2, status: 'Active', unit: 'kg', price: 250, description: 'SS Bottom Under Storage Shelf' },
  { materialName: 'Door', category: 'Sheet', calculationType: 'Sheet', materialType: 'Cabinet Door', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS, 'Half Shawarma Cabin', 'Full Shawarma Cabin'], order: 6, status: 'Active', unit: 'kg', price: 250, description: 'SS Front Cabinet Door' },
  { materialName: 'Drawer', category: 'Sheet', calculationType: 'Sheet', materialType: 'Sliding Drawer', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS, 'Half Shawarma Cabin', 'Full Shawarma Cabin'], order: 7, status: 'Active', unit: 'kg', price: 260, description: 'SS Utility Sliding Storage Drawer' },
  { materialName: 'Partition', category: 'Sheet', calculationType: 'Sheet', materialType: 'Cabinet Divider', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS], order: 8, status: 'Active', unit: 'kg', price: 250, description: 'SS Internal Cabinet Partition' },
  { materialName: 'Overhead Covering R/L', category: 'Sheet', calculationType: 'Sheet', materialType: 'Overhead Panel', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS], order: 9, status: 'Active', unit: 'kg', price: 250, description: 'SS Overhead Pass-thru Right/Left Side Panel' },
  { materialName: 'Overhead Top Covering Left', category: 'Sheet', calculationType: 'Sheet', materialType: 'Overhead Top', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS], order: 10, status: 'Active', unit: 'kg', price: 250, description: 'SS Overhead Left Upper Enclosure Panel' },
  { materialName: 'Overhead Top Covering Right', category: 'Sheet', calculationType: 'Sheet', materialType: 'Overhead Top', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS], order: 11, status: 'Active', unit: 'kg', price: 250, description: 'SS Overhead Right Upper Enclosure Panel' },
  { materialName: 'Overhead Top Covering Front', category: 'Sheet', calculationType: 'Sheet', materialType: 'Overhead Top', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS], order: 12, status: 'Active', unit: 'kg', price: 250, description: 'SS Overhead Front Upper Valance Panel' },
  { materialName: 'Overhead Shelf', category: 'Sheet', calculationType: 'Sheet', materialType: 'Overhead Shelf', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS, 'Table', 'Sink Unit', 'Sink Unit with Table', 'Soiled Dish Table'], order: 13, status: 'Active', unit: 'kg', price: 250, description: 'SS Overhead Tier Storage Shelf' },
  { materialName: 'Overhead Shelf Covering', category: 'Sheet', calculationType: 'Sheet', materialType: 'Shelf Cladding', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS], order: 14, status: 'Active', unit: 'kg', price: 250, description: 'SS Overhead Shelf Protective Cladding' },
  { materialName: 'Overhead Shelf Door', category: 'Sheet', calculationType: 'Sheet', materialType: 'Shelf Door', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS], order: 15, status: 'Active', unit: 'kg', price: 250, description: 'SS Overhead Sliding / Hinged Shelf Door' },
  { materialName: 'Overhead Shelf Partition', category: 'Sheet', calculationType: 'Sheet', materialType: 'Shelf Divider', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS], order: 16, status: 'Active', unit: 'kg', price: 250, description: 'SS Overhead Shelf Intermediate Divider' },
  { materialName: 'Roof', category: 'Sheet', calculationType: 'Sheet', materialType: 'Canopy Roof', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS, ...SHAWARMA_SUBTYPES], order: 17, status: 'Active', unit: 'kg', price: 250, description: 'SS Canopy Top Hood Roof' },
  { materialName: 'Tank', category: 'Sheet', calculationType: 'Sheet', materialType: 'Water/Bain Tank', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS, 'Trolley'], order: 18, status: 'Active', unit: 'kg', price: 260, description: 'SS Deep Welded Bain Marie / Sump Tank' },

  // Counter Purchased Items
  { materialName: 'Glass', category: 'Purchased', calculationType: 'Purchased', materialType: 'Toughened Glass', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS], order: 3, status: 'Active', unit: 'Piece', price: 600, description: 'Toughened Front Sneeze / Display Glass' },
  { materialName: 'GN Pan', category: 'Purchased', calculationType: 'Purchased', materialType: 'Gastronorm Pan', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, dropdownOptions: ['1', '1.2', '1.3', '1.4', '1.5', '1.6'], allowMultiple: true, counterTypes: [...COUNTER_KEYS], order: 4, status: 'Active', unit: 'Piece', price: 550, description: 'SS Gastronorm Food Pan (1 to 1.6 Size)' },
  { materialName: 'Round Vessel', category: 'Purchased', calculationType: 'Purchased', materialType: 'Soup Vessel', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, dropdownOptions: ['2 L', '5 L', '7 L', '10 L'], allowMultiple: true, counterTypes: [...COUNTER_KEYS], order: 5, status: 'Active', unit: 'Piece', price: 480, description: 'SS Round Bain Marie Soup Vessel (2L, 5L, 7L, 10L)' },
  { materialName: 'Coil', category: 'Purchased', calculationType: 'Purchased', materialType: 'Heating Element', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS], order: 6, status: 'Active', unit: 'Piece', price: 750, description: 'Electric Bain Marie Immersion Heating Coil' },
  { materialName: 'Switch', category: 'Purchased', calculationType: 'Purchased', materialType: 'Electrical', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS], order: 7, status: 'Active', unit: 'Piece', price: 120, description: 'Heavy Duty Rotary / Toggle Switch' },
  { materialName: 'Wire 3 Pin', category: 'Purchased', calculationType: 'Purchased', materialType: 'Electrical', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS], order: 8, status: 'Active', unit: 'Piece', price: 180, description: '16A 3-Pin Industrial Power Cord' },
  { materialName: 'Patti Wal', category: 'Purchased', calculationType: 'Purchased', materialType: 'Fitting', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS], order: 9, status: 'Active', unit: 'Piece', price: 250, description: 'SS Decorative / Structural Wall Patti' },
  { materialName: 'Lock', category: 'Purchased', calculationType: 'Purchased', materialType: 'Hardware', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS, ...FRIDGE_SUBTYPES], order: 10, status: 'Active', unit: 'Piece', price: 180, description: 'Cabinet Cam Lock with Keys' },
  { materialName: 'Dosa Plate', category: 'Purchased', calculationType: 'Purchased', materialType: 'Hot Plate', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS], order: 11, status: 'Active', unit: 'Piece', price: 1400, description: 'Solid Steel Griddle Hot Plate' },
  { materialName: 'Pan Support', category: 'Purchased', calculationType: 'Purchased', materialType: 'Vessel Support', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS], order: 12, status: 'Active', unit: 'Piece', price: 550, description: 'Heavy Vessel Pan Support Casting' },
  { materialName: 'Casting', category: 'Purchased', calculationType: 'Purchased', materialType: 'Burner Base', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS], order: 13, status: 'Active', unit: 'Piece', price: 550, description: 'Heavy Cast Iron Burner Casting' },
  { materialName: 'Burner', category: 'Purchased', calculationType: 'Purchased', materialType: 'Gas Burner', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, dropdownOptions: ['G8', 'G9', 'G10', 'T22', 'T30', 'T33', 'T35'], allowMultiple: true, counterTypes: [...COUNTER_KEYS, ...GAS_RANGE_SUBTYPES], order: 14, status: 'Active', unit: 'Piece', price: 650, description: 'High Pressure Commercial Burner (G8-T35)' },
  { materialName: 'Copper Pipe', category: 'Purchased', calculationType: 'Purchased', materialType: 'Gas Line', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, dropdownOptions: ['1 ft', '1.5 ft', '2 ft', '2.5 ft', '3 ft'], allowMultiple: true, counterTypes: [...COUNTER_KEYS, ...GAS_RANGE_SUBTYPES, 'Dosa Bhatti', ...SHAWARMA_SUBTYPES, 'Chapati Puffer Plate'], order: 15, status: 'Active', unit: 'Piece', price: 350, description: 'Pre-cut Copper Gas Connection Pipe' },
  { materialName: 'NCV', category: 'Purchased', calculationType: 'Purchased', materialType: 'Gas Valve', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS, 'Dosa Bhatti', ...SHAWARMA_SUBTYPES, 'Chapati Puffer Plate'], order: 16, status: 'Active', unit: 'Piece', price: 120, description: 'Needle Control Valve with Knob' },
  { materialName: 'Gas Manifold', category: 'Purchased', calculationType: 'Purchased', materialType: 'Gas Header', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...COUNTER_KEYS, ...GAS_RANGE_SUBTYPES, 'Dosa Bhatti', ...SHAWARMA_SUBTYPES, 'Chapati Puffer Plate'], order: 17, status: 'Active', unit: 'Piece', price: 450, description: 'Gas Header Distribution Pipe' },
  { materialName: 'Mixing Tube', category: 'Purchased', calculationType: 'Purchased', materialType: 'Venturi', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, dropdownOptions: ['G8', 'G9', 'G10', 'T22', 'T30', 'T33', 'T35'], allowMultiple: true, counterTypes: [...COUNTER_KEYS, ...GAS_RANGE_SUBTYPES, 'Dosa Bhatti', ...SHAWARMA_SUBTYPES, 'Chapati Puffer Plate'], order: 18, status: 'Active', unit: 'Piece', price: 320, description: 'Air-Gas Venturi Mixing Tube (G8-T35)' },

  // ==========================================
  // 7. TROLLEY
  // ==========================================
  { materialName: 'Handel', category: 'Pipe', calculationType: 'Pipe', materialType: 'Handle Pipe', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Trolley'], order: 5, status: 'Active', unit: 'kg', price: 270, description: 'SS Ergonomic Trolley Push/Pull Handle Pipe' },
  { materialName: 'Wheels', category: 'Purchased', calculationType: 'Purchased', materialType: 'Caster', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Trolley'], order: 1, status: 'Active', unit: 'Piece', price: 450, description: 'Heavy Commercial Heavy Load Caster Wheels' },

  // ==========================================
  // 8. FRIDGE (VERTICAL & HORIZONTAL SUBTYPES)
  // ==========================================
  { materialName: 'Sheet', category: 'Sheet', calculationType: 'Sheet', materialType: 'Fridge Body Sheet', grade: '304', gauge: 0.8, gaugeOptions: [0.6, 0.8], defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 1, status: 'Active', unit: 'kg', price: 250, description: 'SS Commercial Fridge Outer/Inner Cladding Sheet (0.6mm/0.8mm)' },
  { materialName: 'Magnet Sheet', category: 'Sheet', calculationType: 'Sheet', materialType: 'Gasket Catchment', grade: '304', gauge: 0.8, gaugeOptions: [0.6, 0.8], defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 2, status: 'Active', unit: 'kg', price: 250, description: 'SS Magnetic Door Gasket Frame Sheet' },
  { materialName: '2B Sheet', category: 'Sheet', calculationType: 'Sheet', materialType: 'Inner Lining', grade: '304', gauge: 0.8, gaugeOptions: [0.6, 0.8], defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 3, status: 'Active', unit: 'kg', price: 250, description: 'SS 2B Finish Internal Hygienic Liner Sheet' },
  { materialName: 'PVC Mat', category: 'Sheet', calculationType: 'Sheet', materialType: 'Protective Mat', grade: '304', gauge: 0.8, gaugeOptions: [0.6, 0.8], defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 4, status: 'Active', unit: 'kg', price: 250, description: 'Protective Anti-Corrosion Floor & Shelf Mat' },

  // Fridge Purchased Hardware
  { materialName: 'Puff Insulation', category: 'Purchased', calculationType: 'Purchased', materialType: 'Insulation', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 1, status: 'Active', unit: 'Piece', price: 1200, description: 'High Density Polyurethane Foam (PUF) Thermal Insulation' },
  { materialName: 'Copper Coil', category: 'Purchased', calculationType: 'Purchased', materialType: 'Cooling Line', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 2, status: 'Active', unit: 'Piece', price: 1650, description: 'Seamless Refrigeration Grade Copper Tube Cooling Coil' },
  { materialName: 'Solder', category: 'Purchased', calculationType: 'Purchased', materialType: 'Consumable', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 3, status: 'Active', unit: 'Piece', price: 250, description: 'High Silver Brazing / Soldering Flux Alloy' },
  { materialName: 'Shelf Patti', category: 'Purchased', calculationType: 'Purchased', materialType: 'Hardware', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 4, status: 'Active', unit: 'Piece', price: 320, description: 'SS Slotted Adjustable Shelf Support Patti' },
  { materialName: 'Bar Shelf', category: 'Purchased', calculationType: 'Purchased', materialType: 'Wire Shelf', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 5, status: 'Active', unit: 'Piece', price: 450, description: 'Heavy Plastic Coated / SS Wire Bar Shelf' },
  { materialName: 'Patti Clamp', category: 'Purchased', calculationType: 'Purchased', materialType: 'Hardware', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 6, status: 'Active', unit: 'Piece', price: 120, description: 'SS Shelf Mounting Retainer Clamp' },
  { materialName: 'Nut & Bolt', category: 'Purchased', calculationType: 'Purchased', materialType: 'Fasteners', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 7, status: 'Active', unit: 'Piece', price: 80, description: 'SS304 Fastener Set (Nuts, Bolts & Washers)' },
  { materialName: 'Side Grill', category: 'Purchased', calculationType: 'Purchased', materialType: 'Hardware', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 8, status: 'Active', unit: 'Piece', price: 650, description: 'SS Side Compressor Compartment Louver Grill' },

  // Fridge Compressor & Refrigeration Components
  { materialName: 'Compressor', category: 'Compressor', calculationType: 'Purchased', materialType: 'Cooling Unit', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 1, status: 'Active', unit: 'Piece', price: 8500, description: 'Embraco / Danfoss Commercial Refrigeration Hermetic Compressor' },
  { materialName: 'Condenser', category: 'Compressor', calculationType: 'Purchased', materialType: 'Heat Exchanger', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 2, status: 'Active', unit: 'Piece', price: 3200, description: 'Forced Air Finned Tube Condenser Unit' },
  { materialName: 'Motor', category: 'Compressor', calculationType: 'Purchased', materialType: 'Fan Motor', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 3, status: 'Active', unit: 'Piece', price: 1850, description: 'Heavy Duty Condenser Shaded Pole Fan Motor' },
  { materialName: 'Fan Blade', category: 'Compressor', calculationType: 'Purchased', materialType: 'Air Flow', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 4, status: 'Active', unit: 'Piece', price: 450, description: 'Aluminum Aerodynamic Air Circulation Fan Blade' },
  { materialName: 'Temperature Controller', category: 'Compressor', calculationType: 'Purchased', materialType: 'Thermostat', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 5, status: 'Active', unit: 'Piece', price: 1450, description: 'Digital Microprocessor Temperature Display & Controller' },
  { materialName: 'Flexible Cable', category: 'Compressor', calculationType: 'Purchased', materialType: 'Wiring', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 6, status: 'Active', unit: 'Piece', price: 380, description: 'Heavy Insulated Multi-core Copper Flexible Cable' },
  { materialName: 'Wire', category: 'Compressor', calculationType: 'Purchased', materialType: 'Wiring', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 7, status: 'Active', unit: 'Piece', price: 250, description: 'Fire Retardant Internal Control Circuit Wiring' },
  { materialName: 'Wire Pin', category: 'Compressor', calculationType: 'Purchased', materialType: 'Connectors', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 8, status: 'Active', unit: 'Piece', price: 90, description: 'Crimp Terminal Wire Lugs & Connector Pins' },
  { materialName: 'Brazing Rod', category: 'Compressor', calculationType: 'Purchased', materialType: 'Welding', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 9, status: 'Active', unit: 'Piece', price: 350, description: 'Copper-Phosphorus Gas Line Brazing Rod' },
  { materialName: 'Gas Can', category: 'Compressor', calculationType: 'Purchased', materialType: 'Refrigerant', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 10, status: 'Active', unit: 'Piece', price: 650, description: 'Eco-Friendly R134a / R404a Refrigerant Gas Can' },
  { materialName: 'NRV', category: 'Compressor', calculationType: 'Purchased', materialType: 'Valve', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 11, status: 'Active', unit: 'Piece', price: 180, description: 'Refrigeration Non-Return Check Valve' },
  { materialName: 'Gas Kit', category: 'Compressor', calculationType: 'Purchased', materialType: 'Charging Kit', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 12, status: 'Active', unit: 'Piece', price: 850, description: 'Pressure Gauge Charging Manifold & Access Fittings' },
  { materialName: 'Magnet', category: 'Compressor', calculationType: 'Purchased', materialType: 'Door Seal', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 13, status: 'Active', unit: 'Piece', price: 280, description: 'Permanent Door Seal Magnetic Strip' },
  { materialName: 'Capillary', category: 'Compressor', calculationType: 'Purchased', materialType: 'Expansion Tube', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...FRIDGE_SUBTYPES], order: 14, status: 'Active', unit: 'Piece', price: 160, description: 'Calibrated Precision Copper Capillary Expansion Tube' },

  // ==========================================
  // 9. SINK UNIT & SINK UNIT WITH TABLE
  // ==========================================
  { materialName: 'Sink Bowl', category: 'Sheet', calculationType: 'Sheet', materialType: 'Sink Bowl', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Sink Unit', 'Sink Unit with Table'], order: 7, status: 'Active', unit: 'kg', price: 260, description: 'SS Deep Fabricated / Pressed Sink Bowl' },
  { materialName: 'Water Tap', category: 'Purchased', calculationType: 'Purchased', materialType: 'Plumbing', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Sink Unit', 'Sink Unit with Table'], order: 2, status: 'Active', unit: 'Piece', price: 650, description: 'Heavy Commercial Sink Swan Neck Faucet / Tap' },
  { materialName: 'Drain Outlet / Waste Coupling', category: 'Purchased', calculationType: 'Purchased', materialType: 'Plumbing', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Sink Unit', 'Sink Unit with Table'], order: 3, status: 'Active', unit: 'Piece', price: 180, description: 'Commercial Sink Drain Waste Coupling with Strainer' },

  // ==========================================
  // 10. SOILED DISH TABLE
  // ==========================================
  { materialName: 'Round Garbage Shute', category: 'Sheet', calculationType: 'Sheet', materialType: 'Waste Shute', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Soiled Dish Table'], order: 6, status: 'Active', unit: 'kg', price: 250, description: 'SS Round Waste Scrap Drop Shute Collar' },

  // ==========================================
  // 11. GAS RANGE (AND SUBTYPES)
  // ==========================================
  { materialName: 'Angle', category: 'Angle', calculationType: 'Angle', materialType: 'Structural Angle', grade: '304', gauge: '25 × 3 mm', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Gas Range', ...GAS_RANGE_SUBTYPES], order: 1, status: 'Active', unit: 'kg', price: 220, description: 'Heavy Duty Structural Base & Burner Support Angle' },
  { materialName: 'PAN Support Casting / Drum Support', category: 'Purchased', calculationType: 'Purchased', materialType: 'Cast Iron Support', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Gas Range', ...GAS_RANGE_SUBTYPES], order: 5, status: 'Active', unit: 'Piece', price: 550, description: 'Heavy Cast Iron Vessel Pan Support / Drum Casting' },
  { materialName: 'Pipe Regulator', category: 'Purchased', calculationType: 'Purchased', materialType: 'Gas Regulator', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Gas Range', ...GAS_RANGE_SUBTYPES, ...SHAWARMA_SUBTYPES], order: 6, status: 'Active', unit: 'Piece', price: 380, description: 'High/Low Pressure Gas Pipe Regulator Valve' },
  { materialName: 'Pilot Burner', category: 'Purchased', calculationType: 'Purchased', materialType: 'Ignition', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Gas Range', ...GAS_RANGE_SUBTYPES, 'Dosa Bhatti'], order: 7, status: 'Active', unit: 'Piece', price: 150, description: 'Pilot Flame Ignition Torch Assembly' },

  // ==========================================
  // 12. DOSA BHATTI
  // ==========================================
  { materialName: 'Panel Front Door', category: 'Sheet', calculationType: 'Sheet', materialType: 'Access Door', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Dosa Bhatti'], order: 6, status: 'Active', unit: 'kg', price: 250, description: 'SS Lower Burner Inspection / Access Front Door' },
  { materialName: 'MS Plate', category: 'Purchased', calculationType: 'Purchased', materialType: 'Griddle Hot Plate', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Dosa Bhatti', 'Chapati Puffer Plate'], order: 1, status: 'Active', unit: 'Piece', price: 1400, description: 'Heavy Solid Steel Griddle Hot Plate' },
  { materialName: 'Dosa Burner', category: 'Purchased', calculationType: 'Purchased', materialType: 'Gas Burner', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, dropdownOptions: ['1', '1.5', '2', '2.5', '3', '3.5', '4'], allowMultiple: true, counterTypes: ['Dosa Bhatti', 'Chapati Puffer Plate'], order: 2, status: 'Active', unit: 'Piece', price: 750, description: 'Pipe Linear Dosa Burner (Size 1 to 4)' },

  // ==========================================
  // 13. SS TANDOOR
  // ==========================================
  { materialName: 'Wooden Ply with Nut & Bolt', category: 'Purchased', calculationType: 'Purchased', materialType: 'Insulation Base', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['SS Tandoor'], order: 1, status: 'Active', unit: 'Piece', price: 450, description: 'Insulating Wooden Bottom Board with Mounting Hardware' },
  { materialName: 'Kumbhar Work', category: 'Purchased', calculationType: 'Purchased', materialType: 'Clay Pot Fitting', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['SS Tandoor'], order: 2, status: 'Active', unit: 'Piece', price: 1800, description: 'Earthen Clay Tandoor Pot Setting, Salt & Glass Insulation Work' },

  // ==========================================
  // 14. SHAWARMA CABIN (SUBTYPES)
  // ==========================================
  { materialName: 'Right Left Panel Covering', category: 'Sheet', calculationType: 'Sheet', materialType: 'Side Panel', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Table Top Shawarma Cabin'], order: 2, status: 'Active', unit: 'kg', price: 250, description: 'SS Side Enclosure Shield' },
  { materialName: 'Back Side Covering', category: 'Sheet', calculationType: 'Sheet', materialType: 'Back Panel', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Table Top Shawarma Cabin'], order: 3, status: 'Active', unit: 'kg', price: 250, description: 'SS Rear Heat Shield Enclosure' },
  { materialName: 'Table Support Pipe', category: 'Pipe', calculationType: 'Pipe', materialType: 'Table Bracing', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...SHAWARMA_SUBTYPES], order: 2, status: 'Active', unit: 'kg', price: 270, description: 'SS Table Framework Pipe' },
  { materialName: 'Cabin Support Pipe', category: 'Pipe', calculationType: 'Pipe', materialType: 'Cabin Frame', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...SHAWARMA_SUBTYPES], order: 4, status: 'Active', unit: 'kg', price: 270, description: 'SS Cabin Vertical & Horizontal Framework Pipe' },
  { materialName: 'Sharma Burner', category: 'Purchased', calculationType: 'Purchased', materialType: 'Infrared Burner', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: [...SHAWARMA_SUBTYPES], order: 1, status: 'Active', unit: 'Piece', price: 1250, description: 'Ceramic Infrared Shawarma Radiant Burner' },
  { materialName: 'Right Panel', category: 'Sheet', calculationType: 'Sheet', materialType: 'Side Panel', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Half Shawarma Cabin', 'Full Shawarma Cabin'], order: 2, status: 'Active', unit: 'kg', price: 250, description: 'SS Right Side Cladding Panel' },
  { materialName: 'Left Panel', category: 'Sheet', calculationType: 'Sheet', materialType: 'Side Panel', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Half Shawarma Cabin', 'Full Shawarma Cabin'], order: 3, status: 'Active', unit: 'kg', price: 250, description: 'SS Left Side Cladding Panel' },
  { materialName: 'Upper Back Side Covering', category: 'Sheet', calculationType: 'Sheet', materialType: 'Back Panel', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Half Shawarma Cabin', 'Full Shawarma Cabin'], order: 4, status: 'Active', unit: 'kg', price: 250, description: 'SS Upper Rear Heat Deflector Panel' },
  { materialName: 'Under Top Covering', category: 'Sheet', calculationType: 'Sheet', materialType: 'Intermediate Panel', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Half Shawarma Cabin', 'Full Shawarma Cabin'], order: 6, status: 'Active', unit: 'kg', price: 250, description: 'SS Under-table Top Insulating Covering' },
  { materialName: 'Right Covering', category: 'Sheet', calculationType: 'Sheet', materialType: 'Side Enclosure', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Half Shawarma Cabin', 'Full Shawarma Cabin'], order: 7, status: 'Active', unit: 'kg', price: 250, description: 'SS Lower Right Cabinet Enclosure' },
  { materialName: 'Left Covering', category: 'Sheet', calculationType: 'Sheet', materialType: 'Side Enclosure', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Half Shawarma Cabin', 'Full Shawarma Cabin'], order: 8, status: 'Active', unit: 'kg', price: 250, description: 'SS Lower Left Cabinet Enclosure' },
  { materialName: 'Under Top Side Covering', category: 'Sheet', calculationType: 'Sheet', materialType: 'Side Panel', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Half Shawarma Cabin', 'Full Shawarma Cabin'], order: 12, status: 'Active', unit: 'kg', price: 250, description: 'SS Intermediate Side Protective Covering' },
  { materialName: 'Top Shelf', category: 'Sheet', calculationType: 'Sheet', materialType: 'Upper Shelf', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Full Shawarma Cabin', ...DISH_RACK_KEYS], order: 1, status: 'Active', unit: 'kg', price: 250, description: 'SS Full Height Top Canopy Storage Tier' },
  { materialName: 'Upper Top Side Covering', category: 'Sheet', calculationType: 'Sheet', materialType: 'Upper Panel', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Full Shawarma Cabin'], order: 4, status: 'Active', unit: 'kg', price: 250, description: 'SS Full Height Upper Side Heat Guard' },

  // ==========================================
  // 15. CHAPATI PUFFER PLATE
  // ==========================================
  { materialName: 'Puffer Plate', category: 'Purchased', calculationType: 'Purchased', materialType: 'Puffing Griddle', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Chapati Puffer Plate'], order: 1, status: 'Active', unit: 'Piece', price: 950, description: 'Heavy Round Cast Puffer Hot Plate' },
  { materialName: 'Puffer Burner', category: 'Purchased', calculationType: 'Purchased', materialType: 'Gas Burner', grade: '304', gauge: '', pipeSize: '', defaultUnitWeight: null, allowCustomUnitWeight: false, counterTypes: ['Chapati Puffer Plate'], order: 4, status: 'Active', unit: 'Piece', price: 480, description: 'Round Radial Chapati Puffer Burner' }
];

/**
 * Fallback template constructor from default products if Material Master API is loading.
 */
export function getFallbackCounterTemplate(counterTypeOrSubtype) {
  if (!counterTypeOrSubtype) return { sheets: [], pipes: [], angles: [], purchased: [], compressor: [] };

  const matched = DEFAULT_MASTER_PRODUCTS.filter(p => 
    Array.isArray(p.counterTypes) && p.counterTypes.includes(counterTypeOrSubtype)
  );

  const sheets = matched
    .filter(p => p.category === 'Sheet' || (p.calculationType || '').toLowerCase() === 'sheet')
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((p, idx) => ({
      id: `sheet-${idx + 1}`,
      material: p.materialName,
      calculationType: 'sheet',
      grade: p.grade || '304',
      length: '',
      width: '',
      gauge: p.gauge !== undefined && p.gauge !== null && p.gauge !== '' ? parseFloat(p.gauge) : '',
      gaugeOptions: p.gaugeOptions || null,
      quantity: '',
      unit: 'inch'
    }));

  const pipes = matched
    .filter(p => p.category === 'Pipe' || (p.calculationType || '').toLowerCase() === 'pipe')
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((p, idx) => ({
      id: `pipe-${idx + 1}`,
      material: p.materialName,
      calculationType: 'pipe',
      grade: p.grade || '304',
      pipeSize: p.pipeSize || '',
      length: '',
      quantity: ''
    }));

  const angles = matched
    .filter(p => p.category === 'Angle' || (p.calculationType || '').toLowerCase() === 'angle')
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((p, idx) => ({
      id: `angle-${idx + 1}`,
      material: p.materialName,
      calculationType: 'angle',
      grade: p.grade || '304',
      gauge: p.gauge || '25 × 3 mm',
      length: '',
      quantity: ''
    }));

  const purchased = matched
    .filter(p => p.category === 'Purchased' || (p.calculationType || '').toLowerCase() === 'purchased')
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((p, idx) => {
      const opts = p.dropdownOptions || getItemSizeOptions(p.materialName);
      return {
        id: `pur-${idx + 1}`,
        material: p.materialName,
        calculationType: 'purchased',
        dropdownOptions: opts || null,
        allowMultiple: Boolean(p.allowMultiple || (opts && opts.length > 0)),
        size: opts ? opts[0] : '',
        quantity: '',
        price: p.price !== null && p.price !== undefined ? String(p.price) : ''
      };
    });

  const compressor = matched
    .filter(p => p.category === 'Compressor' || (p.calculationType || '').toLowerCase() === 'compressor')
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((p, idx) => ({
      id: `comp-${idx + 1}`,
      material: p.materialName,
      calculationType: 'purchased',
      category: 'Compressor',
      size: '',
      quantity: '',
      price: p.price !== null && p.price !== undefined ? String(p.price) : ''
    }));

  return { sheets, pipes, angles, purchased, compressor };
}

// Backward compatibility map
export const COUNTER_TYPE_TEMPLATES = COUNTER_TYPES.reduce((acc, type) => {
  acc[type] = getFallbackCounterTemplate(type);
  return acc;
}, {});
