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
  { label: 'Payment', value: '50% Advance along with P.O./W.O. and balance payment within delivery.' },
  { label: 'Transportation', value: 'Transportation charges will be extra at actual.' },
  { label: 'Delivery', value: 'As agreed.' },
  { label: 'Unloading', value: 'Unloading to be arranged by customer.' },
  { label: 'Validity', value: '10 Days.' }
];

// Sheet Grades (ONLY 202, 304, 316)
export const SHEET_GRADES = ['202', '304', '316'];
export const STAINLESS_STEEL_GRADES = ['202', '304', '316'];

// Default GST rate in percent (%)
export const DEFAULT_GST_PERCENT = 18;

// =========================================================================
// 1. SHEET WEIGHT REFERENCE SYSTEM (32 sq.ft Benchmark)
// Formula: Area (sq.ft) = (Length_in × Width_in) / 144
// Weight per sq.ft = Reference Weight / 32
// Total Sheet Weight = Area × Weight per sq.ft × Quantity
// =========================================================================
export const SHEET_REFERENCE_AREA = 32; // sq.ft

export const SHEET_WEIGHT_REFERENCE = {
  '0.6': 15.58,
  '0.8': 20.0,
  '1.0': 25.5,
  '1.2': 31.0,
  '1.3': 39.0,
  '1.5': 38.4,
  '2.0': 51.84,
  '2.5': 64.8,
  '3.0': 77.76,
  '4.0': 103.68
};

export const STANDARD_GAUGE_WEIGHTS = {
  0.6: 15.58 / 32, // 0.486875 kg/sq.ft
  0.8: 20.0 / 32,  // 0.625 kg/sq.ft (Exact reference: 20 kg / 32 sq.ft)
  1.0: 25.5 / 32,  // 0.796875 kg/sq.ft (Exact reference: 25.5 kg / 32 sq.ft)
  1.2: 31.0 / 32,  // 0.96875 kg/sq.ft (Exact reference: 31 kg / 32 sq.ft)
  1.3: 39.0 / 32,  // 1.21875 kg/sq.ft (Exact reference: 39 kg / 32 sq.ft)
  1.5: 38.4 / 32,  // 1.200 kg/sq.ft (Configurable in master reference)
  2.0: 51.84 / 32, // 1.620 kg/sq.ft
  2.5: 64.8 / 32,  // 2.025 kg/sq.ft
  3.0: 77.76 / 32, // 2.430 kg/sq.ft
  4.0: 103.68 / 32 // 3.240 kg/sq.ft
};

export const STANDARD_GAUGES = [
  { label: '0.8 mm', value: 0.8, weightPerSqFt: 20.0 / 32 },
  { label: '1.0 mm', value: 1.0, weightPerSqFt: 25.5 / 32 },
  { label: '1.2 mm', value: 1.2, weightPerSqFt: 31.0 / 32 },
  { label: '1.3 mm', value: 1.3, weightPerSqFt: 39.0 / 32 },
  { label: '1.5 mm', value: 1.5, weightPerSqFt: 38.4 / 32 },
  { label: '0.6 mm', value: 0.6, weightPerSqFt: 15.58 / 32 },
  { label: '2.0 mm', value: 2.0, weightPerSqFt: 51.84 / 32 },
  { label: '2.5 mm', value: 2.5, weightPerSqFt: 64.8 / 32 },
  { label: '3.0 mm', value: 3.0, weightPerSqFt: 77.76 / 32 },
  { label: '4.0 mm', value: 4.0, weightPerSqFt: 103.68 / 32 }
];

export const FRIDGE_GAUGES = [
  { label: '0.6 mm', value: 0.6, weightPerSqFt: 15.58 / 32 },
  { label: '0.8 mm', value: 0.8, weightPerSqFt: 20.0 / 32 }
];

/**
 * Get weight per square foot for a given gauge in mm using benchmark reference
 * @param {number|string} gauge - Gauge in mm
 * @returns {number} Weight in kg/sq.ft
 */
export function getGaugeWeightPerSqFt(gauge) {
  const g = parseFloat(gauge);
  if (isNaN(g) || g <= 0) return 0;
  
  const key = String(gauge).trim();
  if (SHEET_WEIGHT_REFERENCE[key] !== undefined) {
    return SHEET_WEIGHT_REFERENCE[key] / SHEET_REFERENCE_AREA;
  }
  if (STANDARD_GAUGE_WEIGHTS[g] !== undefined) {
    return STANDARD_GAUGE_WEIGHTS[g];
  }
  // Standard proportional fallback
  return (g * 25.5) / 32;
}

// =========================================================================
// 2. PIPE MASTER & PIPE GAUGE CONFIGURATION
// Dedicated Pipe Gauges: 1.0 mm, 1.2 mm, 1.5 mm, 2.0 mm
// Formula: Weight = Length (ft) × WeightPerFoot(Pipe Gauge) × Quantity
// =========================================================================
export const PIPE_GAUGE_OPTIONS = ['1.0 mm', '1.2 mm', '1.5 mm', '2.0 mm'];

export const PIPE_SIZE_OPTIONS = [
  '1" (25 × 25 mm)',
  '1.25" (32 × 32 mm)',
  '1.5" (38 × 38 mm)',
  '2" (50 × 50 mm)',
  '40 × 40 mm',
  '40 × 20 mm',
  '50 × 25 mm',
  '60 × 40 mm',
  'Ø 25 mm (Round)',
  'Ø 32 mm (Round)',
  'Ø 38 mm (Round)',
  'Ø 50 mm (Round)',
  '1" × 1"',
  '1.25" × 1.25"',
  '1.5" × 1.5"',
  '2" × 2"',
  '25 × 25 mm',
  '32 × 32 mm',
  '38 × 38 mm'
];

export const PIPE_GAUGE_WEIGHT_FACTORS = {
  '1.0 mm': 0.350,
  '1.2 mm': 0.420,
  '1.5 mm': 0.525,
  '2.0 mm': 0.700,
  '1.0': 0.350,
  '1.2': 0.420,
  '1.5': 0.525,
  '2.0': 0.700
};

export const PIPE_MASTER = [
  { id: 'sq-1in', label: '1" (25 × 25 mm)', pipeSize: '1" (25 × 25 mm)', shape: 'square', outerWidth: 25, outerHeight: 25, wallThickness: 1.2, weightPerFoot: 0.350 },
  { id: 'sq-1-25in', label: '1.25" (32 × 32 mm)', pipeSize: '1.25" (32 × 32 mm)', shape: 'square', outerWidth: 32, outerHeight: 32, wallThickness: 1.2, weightPerFoot: 0.420 },
  { id: 'sq-1-5in', label: '1.5" (38 × 38 mm)', pipeSize: '1.5" (38 × 38 mm)', shape: 'square', outerWidth: 38, outerHeight: 38, wallThickness: 1.2, weightPerFoot: 0.525 },
  { id: 'sq-40mm', label: '40 × 40 mm', pipeSize: '40 × 40 mm', shape: 'square', outerWidth: 40, outerHeight: 40, wallThickness: 1.2, weightPerFoot: 0.560 },
  { id: 'sq-2in', label: '2" (50 × 50 mm)', pipeSize: '2" (50 × 50 mm)', shape: 'square', outerWidth: 50, outerHeight: 50, wallThickness: 1.5, weightPerFoot: 0.700 },
  { id: 'rect-40-20', label: '40 × 20 mm', pipeSize: '40 × 20 mm', shape: 'rectangular', outerWidth: 40, outerHeight: 20, wallThickness: 1.2, weightPerFoot: 0.420 },
  { id: 'rect-50-25', label: '50 × 25 mm', pipeSize: '50 × 25 mm', shape: 'rectangular', outerWidth: 50, outerHeight: 25, wallThickness: 1.2, weightPerFoot: 0.530 },
  { id: 'rect-60-40', label: '60 × 40 mm', pipeSize: '60 × 40 mm', shape: 'rectangular', outerWidth: 60, outerHeight: 40, wallThickness: 1.5, weightPerFoot: 0.700 },
  { id: 'circ-25', label: 'Ø 25 mm (Round)', pipeSize: 'Ø 25 mm (Round)', shape: 'circular', outerDiameter: 25, wallThickness: 1.2, weightPerFoot: 0.300 },
  { id: 'circ-32', label: 'Ø 32 mm (Round)', pipeSize: 'Ø 32 mm (Round)', shape: 'circular', outerDiameter: 32, wallThickness: 1.2, weightPerFoot: 0.360 },
  { id: 'circ-38', label: 'Ø 38 mm (Round)', pipeSize: 'Ø 38 mm (Round)', shape: 'circular', outerDiameter: 38, wallThickness: 1.2, weightPerFoot: 0.450 },
  { id: 'circ-50', label: 'Ø 50 mm (Round)', pipeSize: 'Ø 50 mm (Round)', shape: 'circular', outerDiameter: 50, wallThickness: 1.5, weightPerFoot: 0.600 }
];

/**
 * Get weight per foot for a given pipe size / gauge
 * @param {string} pipeSize - Pipe Size or Pipe Gauge description
 * @param {string} [pipeGauge] - Optional explicit Pipe Gauge ('1.0 mm', '1.2 mm', '1.5 mm', '2.0 mm')
 * @returns {number} Weight in kg/ft
 */
export function getPipeWeightPerFoot(pipeSize, pipeGauge) {
  if (pipeGauge) {
    const gKey = String(pipeGauge).trim();
    if (PIPE_GAUGE_WEIGHT_FACTORS[gKey] !== undefined) {
      return PIPE_GAUGE_WEIGHT_FACTORS[gKey];
    }
  }

  if (!pipeSize) return 0.420; // Default 1.2 mm standard
  const str = String(pipeSize).trim().toLowerCase();

  if (PIPE_GAUGE_WEIGHT_FACTORS[str] !== undefined) {
    return PIPE_GAUGE_WEIGHT_FACTORS[str];
  }

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

  if (str.includes('2.0') || str.includes('2 mm') || str.includes('2"')) return 0.700;
  if (str.includes('1.5') || str.includes('1-1/2') || str.includes('1½') || str.includes('38')) return 0.525;
  if (str.includes('1.2') || str.includes('1.25') || str.includes('1¼') || str.includes('32')) return 0.420;
  if (str.includes('1.0') || str.includes('1 mm') || str.includes('25') || str.includes('1"')) return 0.350;

  return 0.420;
}

// =========================================================================
// 3. ANGLE MASTER CONFIGURATION
// Formula: Weight = Length (ft) × WeightPerFoot × Quantity
// =========================================================================
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
export const ROUND_POT_QUANTITIES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
export const PATTI_OPTIONS = ['25×3', '30×3'];
export const BAR_OPTIONS = ['8 mm', '10 mm', '12 mm'];
export const PIZZA_MAKELINE_SIZES = ['4 ft', '5 ft', '6 ft'];
export const WORK_TOP_SIZES = ['4 ft', '5 ft', '6 ft', '7 ft', '8 ft'];

// Helper to determine size options for dynamic items
export function getItemSizeOptions(materialName) {
  if (!materialName) return null;
  const name = String(materialName).trim().toLowerCase();
  if (name.includes('round pot')) return ROUND_POT_QUANTITIES;
  if (name.includes('gn pan')) return GN_PAN_OPTIONS;
  if (name.includes('round vessel')) return ROUND_VESSEL_OPTIONS;
  if (name.includes('patti') && !name.includes('shelf') && !name.includes('clamp') && !name.includes('wal')) return PATTI_OPTIONS;
  if (name === 'bar' || name.includes('bar rod') || name.includes('skewer')) return BAR_OPTIONS;
  if (name.includes('dosa burner')) return DOSA_BURNER_SIZES;
  if (name.includes('burner') && !name.includes('pilot') && !name.includes('puffer') && !name.includes('chinese')) return BURNER_SIZES;
  if (name.includes('copper pipe')) return COPPER_PIPE_SIZES;
  if (name.includes('mixing tube')) return MIXING_TUBE_SIZES;
  return null;
}

// =========================================================================
// 4. MASTER COUNTER TYPES LIST & HIERARCHY
// Renamed 'Table' -> 'Working Table', added 'Bain Marie', 'Tea Counter', etc.
// =========================================================================
export const COUNTER_TYPES = [
  'Working Table',
  'Sink Unit',
  'Sink Unit with Table',
  'Soiled Dish Table',
  'Gas Range',
  'Dosa Bhatti',
  'SS Tandoor',
  'Shawarma Cabin',
  'Chapati Puffer Plate',
  'Storage Bin',
  'SS Dish Rack',
  'Pot Rack',
  'Dining Table',
  'Bench',
  'Trolley',
  'Fridge',
  'Bain Marie',
  'GN PAN / ROUND POT',
  'Tea Counter'
];

export const counterTypeOptions = COUNTER_TYPES;

export const COUNTER_TYPES_CONFIG = {
  'Working Table': {
    hasSubtypes: false,
    subtypes: [],
    aliases: ['Table', 'Work Table', 'Stainless Steel Kitchen', 'Counter', 'Counters'],
    hasDepth: false,
    requiresAngle: false
  },
  'Sink Unit': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: true,
    requiresAngle: false
  },
  'Sink Unit with Table': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: true,
    requiresAngle: false
  },
  'Storage': {
    hasSubtypes: false,
    subtypes: [],
    aliases: ['Storage Bin', 'Onion/Potato', 'Grain Storage'],
    hasDepth: false,
    requiresAngle: false
  },
  'Storage Bin': {
    hasSubtypes: false,
    subtypes: [],
    aliases: ['Storage', 'Onion/Potato', 'Grain Storage'],
    hasDepth: false,
    requiresAngle: false
  },
  'SS Dish Rack': {
    hasSubtypes: false,
    subtypes: [],
    aliases: ['Dish Rack'],
    hasDepth: false,
    requiresAngle: false
  },
  'Dish Rack': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: false,
    requiresAngle: false
  },
  'Pot Rack': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: false,
    requiresAngle: false
  },
  'Dining Table': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: false,
    requiresAngle: false
  },
  'Bench': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: false,
    requiresAngle: false
  },
  'Trolley': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: false,
    requiresAngle: false
  },
  'Fridge': {
    hasSubtypes: true,
    subtypeLabel: 'Fridge Type',
    subtypes: [
      'Vertical',
      'Horizontal'
    ],
    hasDepth: false,
    requiresAngle: false
  },
  'Soiled Dish Table': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: false,
    requiresAngle: false
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
    ],
    hasDepth: false,
    requiresAngle: true
  },
  'Single Gas Range': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: false,
    requiresAngle: true
  },
  'Double Gas Range': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: false,
    requiresAngle: true
  },
  'Triple Gas Range': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: false,
    requiresAngle: true
  },
  'Four Gas Range': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: false,
    requiresAngle: true
  },
  'Chinese Gas Range': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: false,
    requiresAngle: true
  },
  'Dosa Bhatti': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: false,
    requiresAngle: false
  },
  'SS Tandoor': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: false,
    requiresAngle: false
  },
  'Bain Marie': {
    hasSubtypes: false,
    subtypes: [],
    aliases: ['Bain Merry Marie', 'Bain-Marie', 'Bain Merry'],
    hasDepth: false,
    requiresAngle: false
  },
  'GN PAN / ROUND POT': {
    hasSubtypes: false,
    subtypes: [],
    aliases: ['GN Pan / Round Pot', 'GN Pan / Round Pot / Vessel', 'GN Pan', 'Round Pot', 'GN PAN / ROUND. Pot/vessel', 'GN PAN / ROUND. POT/VESSEL'],
    hasDepth: false,
    requiresAngle: false
  },
  'GN Pan / Round Pot / Vessel': {
    hasSubtypes: false,
    subtypes: [],
    aliases: ['GN PAN / ROUND POT', 'GN Pan / Round Pot', 'GN Pan', 'Round Pot'],
    hasDepth: false,
    requiresAngle: false
  },
  'Tea Counter': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: false,
    requiresAngle: false
  },
  'Chapati Puffer Plate': {
    hasSubtypes: false,
    subtypes: [],
    aliases: ['Chapati Plate', 'Puffer Plate'],
    hasDepth: false,
    requiresAngle: false
  },
  'Chapati Plate': {
    hasSubtypes: false,
    subtypes: [],
    aliases: ['Chapati Puffer Plate'],
    hasDepth: false,
    requiresAngle: false
  },
  'Shawarma Cabin': {
    hasSubtypes: true,
    subtypeLabel: 'Shawarma Cabin Type',
    subtypes: [
      'Table Top Shawarma Cabin',
      'Half Shawarma Cabin',
      'Full Shawarma Cabin'
    ],
    hasDepth: false,
    requiresAngle: false
  }
};

// =========================================================================
// 5. CENTRAL COUNTER SPECIFICATION CONFIGURATION (COUNTER_CONFIG)
// Single Source of Truth for Sheet, Pipe, Angle, and Purchase Components.
// User Input = Source of Truth.
// =========================================================================
export const COUNTER_CONFIG = {
  'Working Table': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Overhead Shelf', 'Under Shelf'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Overhead Shelf', grade: '304', gauge: 1.2, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Overhead Shelf Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: true }
    ],
    angles: [],
    purchased: [
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Sink Unit': {
    hasDepth: true,
    requiresAngle: false,
    repeatableComponents: ['Overhead Shelf', 'Under Shelf', 'Door'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Sink Bowl', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Overhead Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Door', grade: '304', gauge: 1.0, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Leg Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Overhead Shelf Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: true }
    ],
    angles: [],
    purchased: [
      { materialName: 'Water Tap', price: '', isRepeatable: false },
      { materialName: 'Drain Outlet / Waste Coupling', price: '', isRepeatable: false },
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Sink Unit with Table': {
    hasDepth: true,
    requiresAngle: false,
    repeatableComponents: ['Overhead Shelf', 'Under Shelf', 'Door'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Sink Bowl', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Overhead Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Door', grade: '304', gauge: 1.0, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Leg Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Overhead Shelf Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: true }
    ],
    angles: [],
    purchased: [
      { materialName: 'Water Tap', price: '', isRepeatable: false },
      { materialName: 'Drain Outlet / Waste Coupling', price: '', isRepeatable: false },
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Storage': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Internal Partition', 'Tray'],
    sheets: [
      { materialName: 'Onion/Potato', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Tray', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Top Door', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Bottom', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Left Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Right Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Base', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Internal Partition', grade: '304', gauge: 1.0, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Handle', price: '', isRepeatable: false },
      { materialName: 'Hinges', price: '', isRepeatable: false },
      { materialName: 'Wheel', price: '', isRepeatable: false },
      { materialName: 'Square Bar Grill', price: '', isRepeatable: false },
      { materialName: 'Bar', price: '', dropdownOptions: ['8 mm', '10 mm', '12 mm'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Onion Cloth', price: '', isRepeatable: false }
    ]
  },

  'Storage Bin': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Internal Partition', 'Tray'],
    sheets: [
      { materialName: 'Onion/Potato', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Tray', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Top Door', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Bottom', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Left Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Right Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Base', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Internal Partition', grade: '304', gauge: 1.0, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Handle', price: '', isRepeatable: false },
      { materialName: 'Hinges', price: '', isRepeatable: false },
      { materialName: 'Wheel', price: '', isRepeatable: false },
      { materialName: 'Square Bar Grill', price: '', isRepeatable: false },
      { materialName: 'Bar', price: '', dropdownOptions: ['8 mm', '10 mm', '12 mm'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Onion Cloth', price: '', isRepeatable: false }
    ]
  },

  'SS Dish Rack': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Leg Pipe', 'Shelf Support Pipe'],
    sheets: [],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: true },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: true },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Dish Rack': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Leg Pipe', 'Shelf Support Pipe'],
    sheets: [],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: true },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: true },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Pot Rack': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Mid Pipe'],
    sheets: [],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Frame Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Mid Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: true }
    ],
    angles: [],
    purchased: [
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Dining Table': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Stool Support Pipe'],
    sheets: [
      { materialName: 'Table Top', grade: '304', gauge: 1.2, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Center Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Leg Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Stool Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: true }
    ],
    angles: [],
    purchased: [
      { materialName: 'Bush', price: '', isRepeatable: false },
      { materialName: 'Thali', price: '', isRepeatable: false },
      { materialName: 'Patti', price: '', dropdownOptions: ['25×3', '30×3'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Bar', price: '', dropdownOptions: ['8 mm', '10 mm', '12 mm'], allowMultiple: true, isRepeatable: true }
    ]
  },

  'Bench': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: [],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Back Support', grade: '304', gauge: 1.2, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Leg Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Back Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Trolley': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Under Shelf'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Tank', grade: '304', gauge: 1.2, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Handel', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Wheels', price: '', isRepeatable: false }
    ]
  },

  'Single Gas Range': {
    hasDepth: false,
    requiresAngle: true,
    repeatableComponents: ['Under Shelf', 'Angle', 'Burner', 'Copper Pipe', 'Mixing Tube'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false }
    ],
    angles: [
      { materialName: 'Angle', grade: '304', gauge: '25 × 3 mm', isRepeatable: true }
    ],
    purchased: [
      { materialName: 'NCV', price: '', isRepeatable: false },
      { materialName: 'Burner', price: '', dropdownOptions: ['G8', 'G9', 'G10', 'T22', 'T30', 'T33', 'T35'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: ['1 ft', '1.5 ft', '2 ft', '2.5 ft', '3 ft'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: ['G8', 'G9', 'G10', 'T22', 'T30', 'T33', 'T35'], allowMultiple: true, isRepeatable: true },
      { materialName: 'PAN Support Casting / Drum Support', price: '', isRepeatable: false },
      { materialName: 'Pipe Regulator', price: '', isRepeatable: false },
      { materialName: 'Pilot Burner', price: '', isRepeatable: false },
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Double Gas Range': {
    hasDepth: false,
    requiresAngle: true,
    repeatableComponents: ['Under Shelf', 'Angle', 'Burner', 'Copper Pipe', 'Mixing Tube'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false }
    ],
    angles: [
      { materialName: 'Angle', grade: '304', gauge: '25 × 3 mm', isRepeatable: true }
    ],
    purchased: [
      { materialName: 'NCV', price: '', isRepeatable: false },
      { materialName: 'Burner', price: '', dropdownOptions: ['G8', 'G9', 'G10', 'T22', 'T30', 'T33', 'T35'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: ['1 ft', '1.5 ft', '2 ft', '2.5 ft', '3 ft'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: ['G8', 'G9', 'G10', 'T22', 'T30', 'T33', 'T35'], allowMultiple: true, isRepeatable: true },
      { materialName: 'PAN Support Casting / Drum Support', price: '', isRepeatable: false },
      { materialName: 'Pipe Regulator', price: '', isRepeatable: false },
      { materialName: 'Pilot Burner', price: '', isRepeatable: false },
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Triple Gas Range': {
    hasDepth: false,
    requiresAngle: true,
    repeatableComponents: ['Under Shelf', 'Angle', 'Burner', 'Copper Pipe', 'Mixing Tube'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false }
    ],
    angles: [
      { materialName: 'Angle', grade: '304', gauge: '25 × 3 mm', isRepeatable: true }
    ],
    purchased: [
      { materialName: 'NCV', price: '', isRepeatable: false },
      { materialName: 'Burner', price: '', dropdownOptions: ['G8', 'G9', 'G10', 'T22', 'T30', 'T33', 'T35'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: ['1 ft', '1.5 ft', '2 ft', '2.5 ft', '3 ft'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: ['G8', 'G9', 'G10', 'T22', 'T30', 'T33', 'T35'], allowMultiple: true, isRepeatable: true },
      { materialName: 'PAN Support Casting / Drum Support', price: '', isRepeatable: false },
      { materialName: 'Pipe Regulator', price: '', isRepeatable: false },
      { materialName: 'Pilot Burner', price: '', isRepeatable: false },
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Four Gas Range': {
    hasDepth: false,
    requiresAngle: true,
    repeatableComponents: ['Under Shelf', 'Angle', 'Burner', 'Copper Pipe', 'Mixing Tube'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false }
    ],
    angles: [
      { materialName: 'Angle', grade: '304', gauge: '25 × 3 mm', isRepeatable: true }
    ],
    purchased: [
      { materialName: 'NCV', price: '', isRepeatable: false },
      { materialName: 'Burner', price: '', dropdownOptions: ['G8', 'G9', 'G10', 'T22', 'T30', 'T33', 'T35'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: ['1 ft', '1.5 ft', '2 ft', '2.5 ft', '3 ft'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: ['G8', 'G9', 'G10', 'T22', 'T30', 'T33', 'T35'], allowMultiple: true, isRepeatable: true },
      { materialName: 'PAN Support Casting / Drum Support', price: '', isRepeatable: false },
      { materialName: 'Pipe Regulator', price: '', isRepeatable: false },
      { materialName: 'Pilot Burner', price: '', isRepeatable: false },
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Chinese Gas Range': {
    hasDepth: false,
    requiresAngle: true,
    repeatableComponents: ['Under Shelf', 'Angle', 'Chinese Gas Burner', 'Dom'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Left Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Right Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false }
    ],
    angles: [
      { materialName: 'Angle', grade: '304', gauge: '25 × 3 mm', isRepeatable: true }
    ],
    purchased: [
      { materialName: 'NCV', price: '', isRepeatable: false },
      { materialName: 'Chinese Gas Burner', price: '', isRepeatable: true },
      { materialName: 'Dom', price: '', isRepeatable: true },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: ['G8', 'G9', 'G10', 'T22', 'T30', 'T33', 'T35'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Pipe Regulator', price: '', isRepeatable: false },
      { materialName: 'Pilot Burner', price: '', isRepeatable: false },
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Gas Range': {
    hasDepth: false,
    requiresAngle: true,
    repeatableComponents: ['Under Shelf', 'Angle', 'Burner', 'Copper Pipe', 'Mixing Tube'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false }
    ],
    angles: [
      { materialName: 'Angle', grade: '304', gauge: '25 × 3 mm', isRepeatable: true }
    ],
    purchased: [
      { materialName: 'NCV', price: '', isRepeatable: false },
      { materialName: 'Chinese Gas Burner', price: '', isRepeatable: true },
      { materialName: 'Dom', price: '', isRepeatable: true },
      { materialName: 'Burner', price: '', dropdownOptions: ['G8', 'G9', 'G10', 'T22', 'T30', 'T33', 'T35'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: ['1 ft', '1.5 ft', '2 ft', '2.5 ft', '3 ft'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: ['G8', 'G9', 'G10', 'T22', 'T30', 'T33', 'T35'], allowMultiple: true, isRepeatable: true },
      { materialName: 'PAN Support Casting / Drum Support', price: '', isRepeatable: false },
      { materialName: 'Pipe Regulator', price: '', isRepeatable: false },
      { materialName: 'Pilot Burner', price: '', isRepeatable: false },
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Dosa Bhatti': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Under Shelf'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Left Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Right Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Panel Front Door', grade: '304', gauge: 1.0, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Handle', price: '', isRepeatable: false },
      { materialName: 'Wheels', price: '', isRepeatable: false },
      { materialName: 'MS Plate', price: '', isRepeatable: false },
      { materialName: 'Dosa Burner', price: '', dropdownOptions: ['1', '1.5', '2', '2.5', '3', '3.5', '4'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: ['1 ft', '1.5 ft', '2 ft', '2.5 ft', '3 ft'], allowMultiple: true, isRepeatable: true },
      { materialName: 'NCV', price: '', isRepeatable: false },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: ['G8', 'G9', 'G10', 'T22', 'T30', 'T33', 'T35'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Pilot Burner', price: '', isRepeatable: false },
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'SS Tandoor': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: [],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Left Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Right Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Wooden Ply with Nut & Bolt', price: '', isRepeatable: false },
      { materialName: 'Kumbhar Work', price: '', isRepeatable: false },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false }
    ]
  },

  'Bain Marie': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Overhead Shelf', 'Under Shelf', 'Drawer', 'Door', 'Handle', 'GN Pan'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Overhead Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Left Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Right Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Side Railing', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Drawer', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Door', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Handle', grade: '304', gauge: 1.0, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Overhead Shelf Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: true },
      { materialName: '4x Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Front Side Railing Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Glass', price: '', isRepeatable: false },
      { materialName: 'GN Pan', price: '', dropdownOptions: ['1', '1.2', '1.3', '1.4', '1.5', '1.6'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Coil', price: '', isRepeatable: false },
      { materialName: 'Thermostat', price: '', isRepeatable: false },
      { materialName: 'Rotary Switch', price: '', isRepeatable: false },
      { materialName: 'Bush', price: '', isRepeatable: false },
      { materialName: 'Handle', price: '', isRepeatable: true },
      { materialName: '3 Pin Top', price: '', isRepeatable: false },
      { materialName: 'Wire', price: '', isRepeatable: false },
      { materialName: 'Patti Wall', price: '', isRepeatable: false },
      { materialName: 'Hinges', price: '', isRepeatable: true }
    ]
  },

  'GN PAN / ROUND POT': {
    hasDepth: false,
    requiresAngle: false,
    aliases: ['GN Pan / Round Pot', 'GN Pan / Round Pot / Vessel', 'GN Pan', 'Round Pot', 'GN PAN / ROUND. Pot/vessel'],
    repeatableComponents: ['Overhead Shelf', 'Under Shelf', 'Round Pot', 'GN Pan', 'Round Vessel'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Overhead Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Round Pot', grade: '304', gauge: 1.2, dropdownOptions: ROUND_POT_QUANTITIES, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Overhead Shelf Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: true }
    ],
    angles: [],
    purchased: [
      { materialName: 'GN Pan', price: '', dropdownOptions: ['1', '1.2', '1.3', '1.4', '1.5', '1.6'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Round Vessel', price: '', dropdownOptions: ['2 L', '5 L', '7 L', '10 L'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'GN Pan / Round Pot / Vessel': {
    hasDepth: false,
    requiresAngle: false,
    aliases: ['GN PAN / ROUND POT', 'GN Pan / Round Pot', 'GN Pan', 'Round Pot'],
    repeatableComponents: ['Overhead Shelf', 'Under Shelf', 'Round Pot', 'GN Pan', 'Round Vessel'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Overhead Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Round Pot', grade: '304', gauge: 1.2, dropdownOptions: ROUND_POT_QUANTITIES, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Overhead Shelf Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: true }
    ],
    angles: [],
    purchased: [
      { materialName: 'GN Pan', price: '', dropdownOptions: ['1', '1.2', '1.3', '1.4', '1.5', '1.6'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Round Vessel', price: '', dropdownOptions: ['2 L', '5 L', '7 L', '10 L'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Tea Counter': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Under Shelf', 'Drawers', 'Doors'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Top Left Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Top Right Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Top Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Under Left Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Under Right Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Under Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Drawers', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Doors', grade: '304', gauge: 1.0, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Top Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Upper Design Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Bush', price: '', isRepeatable: false },
      { materialName: 'Handle', price: '', isRepeatable: true },
      { materialName: 'Lock', price: '', isRepeatable: true }
    ]
  },

  'Chapati Puffer Plate': {
    hasDepth: false,
    requiresAngle: false,
    aliases: ['Chapati Plate', 'Puffer Plate'],
    repeatableComponents: ['Under Shelf'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Left Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Right Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Puffer Plate', price: '', isRepeatable: false },
      { materialName: 'MS Plate', price: '', isRepeatable: false },
      { materialName: 'Dosa Burner', price: '', dropdownOptions: ['1', '1.5', '2', '2.5', '3', '3.5', '4'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Puffer Burner', price: '', isRepeatable: false },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: ['1 ft', '1.5 ft', '2 ft', '2.5 ft', '3 ft'], allowMultiple: true, isRepeatable: true },
      { materialName: 'NCV', price: '', isRepeatable: false },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: ['G8', 'G9', 'G10', 'T22', 'T30', 'T33', 'T35'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Chapati Plate': {
    hasDepth: false,
    requiresAngle: false,
    aliases: ['Chapati Puffer Plate'],
    repeatableComponents: ['Under Shelf'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Left Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Right Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Puffer Plate', price: '', isRepeatable: false },
      { materialName: 'MS Plate', price: '', isRepeatable: false },
      { materialName: 'Dosa Burner', price: '', dropdownOptions: ['1', '1.5', '2', '2.5', '3', '3.5', '4'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Puffer Burner', price: '', isRepeatable: false },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: ['1 ft', '1.5 ft', '2 ft', '2.5 ft', '3 ft'], allowMultiple: true, isRepeatable: true },
      { materialName: 'NCV', price: '', isRepeatable: false },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: ['G8', 'G9', 'G10', 'T22', 'T30', 'T33', 'T35'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Fridge': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Bar Shelf', 'Shelf Patti'],
    sheets: [
      { materialName: 'Sheet', grade: '304', gauge: 0.8, gaugeOptions: [0.6, 0.8], isRepeatable: false },
      { materialName: 'Magnet Sheet', grade: '304', gauge: 0.8, gaugeOptions: [0.6, 0.8], isRepeatable: false },
      { materialName: '2B Sheet', grade: '304', gauge: 0.8, gaugeOptions: [0.6, 0.8], isRepeatable: false },
      { materialName: 'PVC Mat', grade: '304', gauge: 0.8, gaugeOptions: [0.6, 0.8], isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Puff Insulation', price: '', isRepeatable: false },
      { materialName: 'Copper Coil', price: '', isRepeatable: false },
      { materialName: 'Solder', price: '', isRepeatable: false },
      { materialName: 'Shelf Patti', price: '', isRepeatable: true },
      { materialName: 'Bar Shelf', price: '', isRepeatable: true },
      { materialName: 'Patti Clamp', price: '', isRepeatable: true },
      { materialName: 'Nut & Bolt', price: '', isRepeatable: false },
      { materialName: 'Side Grill', price: '', isRepeatable: false },
      { materialName: 'Handle', price: '', isRepeatable: true },
      { materialName: 'Hinges', price: '', isRepeatable: true },
      { materialName: 'Wheel', price: '', isRepeatable: false },
      { materialName: 'Lock', price: '', isRepeatable: true }
    ],
    compressor: [
      { materialName: 'Compressor', price: '', isRepeatable: false },
      { materialName: 'Condenser', price: '', isRepeatable: false },
      { materialName: 'Motor', price: '', isRepeatable: false },
      { materialName: 'Fan Blade', price: '', isRepeatable: false },
      { materialName: 'Temperature Controller', price: '', isRepeatable: false },
      { materialName: 'Flexible Cable', price: '', isRepeatable: false },
      { materialName: 'Wire', price: '', isRepeatable: false },
      { materialName: 'Wire Pin', price: '', isRepeatable: false },
      { materialName: 'Brazing Rod', price: '', isRepeatable: false },
      { materialName: 'Gas Can', price: '', isRepeatable: false },
      { materialName: 'NRV', price: '', isRepeatable: false },
      { materialName: 'Gas Kit', price: '', isRepeatable: false },
      { materialName: 'Magnet', price: '', isRepeatable: false },
      { materialName: 'Capillary', price: '', isRepeatable: false }
    ]
  },

  'Soiled Dish Table': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Overhead Shelf'],
    sheets: [
      { materialName: 'Table Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Round Garbage Shute', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Left Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Right Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Overhead Shelf', grade: '304', gauge: 1.2, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Leg Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Overhead Shelf Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: true }
    ],
    angles: [],
    purchased: [
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Shawarma Cabin': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Under Shelf', 'Door', 'Drawer'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Left Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Right Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Door', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Drawer', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Roof', grade: '304', gauge: 1.0, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '1.5 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Table Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false },
      { materialName: 'Cabin Support Pipe', grade: '304', pipeGauge: '1.2 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Sharma Burner', price: '', isRepeatable: true },
      { materialName: 'Thali', price: '', isRepeatable: false },
      { materialName: 'Bar', price: '', dropdownOptions: ['8 mm', '10 mm', '12 mm'], allowMultiple: true, isRepeatable: true },
      { materialName: 'Pipe Regulator', price: '', isRepeatable: false },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: ['1 ft', '1.5 ft', '2 ft', '2.5 ft', '3 ft'], allowMultiple: true, isRepeatable: true },
      { materialName: 'NCV', price: '', isRepeatable: false },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: ['G8', 'G9', 'G10', 'T22', 'T30', 'T33', 'T35'], allowMultiple: true, isRepeatable: true }
    ]
  }
};

/**
 * Get configuration template for any counter type
 */
export function getFallbackCounterTemplate(counterTypeOrSubtype, explicitSubtype = '') {
  if (!counterTypeOrSubtype) return { sheets: [], pipes: [], angles: [], purchased: [], compressor: [] };

  const target = (explicitSubtype || counterTypeOrSubtype).trim();
  let configKey = target;

  if (!COUNTER_CONFIG[configKey]) {
    for (const [key, cfg] of Object.entries(COUNTER_CONFIG)) {
      if (key === target || (cfg.aliases && cfg.aliases.includes(target))) {
        configKey = key;
        break;
      }
    }
  }

  // Handle hierarchical / subtype names
  if (!COUNTER_CONFIG[configKey]) {
    if (target.includes('Single Gas Range')) {
      configKey = 'Single Gas Range';
    } else if (target.includes('Double Gas Range') || target.includes('2x Gas Range')) {
      configKey = 'Double Gas Range';
    } else if (target.includes('Triple Gas Range')) {
      configKey = 'Triple Gas Range';
    } else if (target.includes('Four Gas Range')) {
      configKey = 'Four Gas Range';
    } else if (target.includes('Chinese Gas Range')) {
      configKey = 'Chinese Gas Range';
    } else if (target.includes('Makeline') || target.includes('Work Top') || target.includes('Vertical') || target.includes('Horizontal')) {
      configKey = 'Fridge';
    } else if (target.includes('Gas Range')) {
      configKey = 'Gas Range';
    } else if (target.includes('Shawarma')) {
      configKey = 'Shawarma Cabin';
    } else if (target.includes('Chapati')) {
      configKey = 'Chapati Puffer Plate';
    } else if (target.includes('Storage') || target.includes('Onion') || target.includes('Potato')) {
      configKey = 'Storage Bin';
    } else if (target.includes('Table')) {
      configKey = 'Working Table';
    } else if (target.includes('Dish Rack')) {
      configKey = 'SS Dish Rack';
    } else if (target.includes('Bain Marie')) {
      configKey = 'Bain Marie';
    } else if (target.includes('Tea Counter')) {
      configKey = 'Tea Counter';
    } else if (target.includes('Round Pot') || target.includes('GN Pan') || target.includes('GN PAN')) {
      configKey = 'GN PAN / ROUND POT';
    }
  }

  const rawCfg = COUNTER_CONFIG[configKey] || COUNTER_CONFIG['Working Table'];

  const sheets = (rawCfg.sheets || []).map((s, idx) => {
    const isCovering = (s.materialName || '').toLowerCase().includes('covering');
    return {
      id: `sheet-${idx + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      material: s.materialName,
      calculationType: 'sheet',
      grade: s.grade || '304',
      length: '',
      width: isCovering ? '' : '',
      height: isCovering ? '' : undefined,
      depth: (rawCfg.hasDepth && (s.materialName || '').toLowerCase().includes('sink')) ? '' : undefined,
      gauge: s.gauge !== undefined ? s.gauge : (isCovering ? 1.0 : 1.2),
      gaugeOptions: s.gaugeOptions || null,
      quantity: '',
      unit: 'inch',
      isRepeatable: Boolean(s.isRepeatable)
    };
  });

  const pipes = (rawCfg.pipes || []).map((p, idx) => ({
    id: `pipe-${idx + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    material: p.materialName,
    calculationType: 'pipe',
    grade: p.grade || '304',
    pipeGauge: p.pipeGauge || '1.2 mm',
    pipeSize: p.pipeSize || '1.5" (38 × 38 mm)',
    length: '',
    unit: 'ft',
    quantity: '',
    isRepeatable: Boolean(p.isRepeatable)
  }));

  const angles = (rawCfg.angles || []).map((a, idx) => ({
    id: `angle-${idx + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    material: a.materialName,
    calculationType: 'angle',
    grade: a.grade || '304',
    gauge: a.gauge || '25 × 3 mm',
    length: '',
    quantity: '',
    isRepeatable: Boolean(a.isRepeatable)
  }));

  const purchased = (rawCfg.purchased || []).map((p, idx) => {
    const opts = p.dropdownOptions || getItemSizeOptions(p.materialName);
    return {
      id: `pur-${idx + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      material: p.materialName,
      calculationType: 'purchased',
      dropdownOptions: opts || null,
      allowMultiple: Boolean(p.allowMultiple || p.isRepeatable || (opts && opts.length > 0)),
      size: opts ? opts[0] : '',
      quantity: '',
      price: '',
      isRepeatable: Boolean(p.isRepeatable)
    };
  });

  const compressor = (rawCfg.compressor || []).map((c, idx) => ({
    id: `comp-${idx + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    material: c.materialName,
    calculationType: 'compressor',
    category: 'Compressor',
    size: '',
    quantity: '',
    price: '',
    isRepeatable: Boolean(c.isRepeatable)
  }));

  return { sheets, pipes, angles, purchased, compressor, hasDepth: rawCfg.hasDepth, requiresAngle: rawCfg.requiresAngle };
}

// Backward compatibility catalog seed list
export const DEFAULT_MASTER_PRODUCTS = Object.entries(COUNTER_CONFIG).flatMap(([counterKey, cfg]) => {
  const list = [];
  (cfg.sheets || []).forEach((s, idx) => {
    list.push({
      materialName: s.materialName,
      category: 'Sheet',
      calculationType: 'Sheet',
      materialType: 'Sheet Metal',
      grade: s.grade || '304',
      gauge: s.gauge || 1.2,
      counterTypes: [counterKey],
      order: idx + 1,
      status: 'Active',
      unit: 'kg',
      price: 250,
      description: `SS Fabricated ${s.materialName}`
    });
  });
  (cfg.pipes || []).forEach((p, idx) => {
    list.push({
      materialName: p.materialName,
      category: 'Pipe',
      calculationType: 'Pipe',
      materialType: 'Framework',
      grade: p.grade || '304',
      gauge: p.pipeGauge || '1.2 mm',
      counterTypes: [counterKey],
      order: idx + 1,
      status: 'Active',
      unit: 'kg',
      price: 270,
      description: `SS Structural ${p.materialName}`
    });
  });
  (cfg.angles || []).forEach((a, idx) => {
    list.push({
      materialName: a.materialName,
      category: 'Angle',
      calculationType: 'Angle',
      materialType: 'Structural Angle',
      grade: a.grade || '304',
      gauge: a.gauge || '25 × 3 mm',
      counterTypes: [counterKey],
      order: idx + 1,
      status: 'Active',
      unit: 'kg',
      price: 220,
      description: `SS Structural ${a.materialName}`
    });
  });
  (cfg.purchased || []).forEach((pur, idx) => {
    list.push({
      materialName: pur.materialName,
      category: 'Purchased',
      calculationType: 'Purchased',
      materialType: 'Hardware',
      grade: '304',
      dropdownOptions: pur.dropdownOptions || null,
      counterTypes: [counterKey],
      order: idx + 1,
      status: 'Active',
      unit: 'Piece',
      price: pur.price || 100,
      description: `Commercial ${pur.materialName}`
    });
  });
  (cfg.compressor || []).forEach((comp, idx) => {
    list.push({
      materialName: comp.materialName,
      category: 'Compressor',
      calculationType: 'Purchased',
      materialType: 'Refrigeration',
      grade: '304',
      counterTypes: [counterKey],
      order: idx + 1,
      status: 'Active',
      unit: 'Piece',
      price: comp.price || 500,
      description: `Refrigeration Component ${comp.materialName}`
    });
  });
  return list;
});
