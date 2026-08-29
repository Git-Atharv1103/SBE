// =========================================================================
// SHREE BALAJI ENTERPRISES - COMMERCIAL KITCHEN EQUIPMENT ESTIMATION MASTER
// Single Source of Truth for Reference Weights, Rates, Standards & Specifications
// =========================================================================

// SS Reference Weight Baseline (32 sq.ft Sheet)
export const BASELINE_SHEET_SQFT = 32;

// Gauge Reference Weights (Standard Weight per 32 sq.ft sheet in kg)
// Only Sheet Gauges: 0.6 mm, 0.8 mm, 1.0 mm, 1.2 mm, 1.5 mm
export const GAUGE_WEIGHTS_32SQFT = {
  '1.5': 39.0,
  '1.2': 31.0,
  '1.0': 25.5,
  '1': 25.5,
  '0.8': 20.0,
  '0.6': 15.5,
  '1.3': 39.0 // Legacy fallback
};

// Numeric helper for gauge weight
export const GAUGE_WEIGHTS = {
  1.5: 39.0,
  1.2: 31.0,
  1.0: 25.5,
  1: 25.5,
  0.8: 20.0,
  0.6: 15.5,
  1.3: 39.0 // Legacy fallback
};

/**
 * Get weight of a standard 32 sq.ft sheet for a given gauge in mm
 * Supported Sheet Gauges: 0.6, 0.8, 1.0, 1.2, 1.5 mm
 * @param {number|string} gauge - Gauge in mm (e.g. 0.6, 0.8, 1, 1.2, 1.5)
 * @returns {number} Standard weight in kg for 32 sq.ft
 */
export function getStandardSheetWeight(gauge) {
  const gStr = String(gauge).trim();
  if (GAUGE_WEIGHTS_32SQFT[gStr]) {
    return GAUGE_WEIGHTS_32SQFT[gStr];
  }
  const gNum = parseFloat(gauge);
  if (gNum >= 1.35) return 39.0;
  if (gNum >= 1.1) return 31.0;
  if (gNum >= 0.9) return 25.5;
  if (gNum >= 0.7) return 20.0;
  return 15.5;
}

export function getGaugeWeightPerSqFt(gauge) {
  const stdWeight = getStandardSheetWeight(gauge);
  return stdWeight / BASELINE_SHEET_SQFT;
}

export const DEFAULT_GST_PERCENT = 18;

// Available Sheet Gauge Options (Strictly 0.6, 0.8, 1, 1.2, 1.5 mm ONLY)
export const SHEET_GAUGE_OPTIONS = [
  { value: 0.6, label: '0.6 mm', weightPerSqFt: 0.484375 },
  { value: 0.8, label: '0.8 mm', weightPerSqFt: 0.625 },
  { value: 1.0, label: '1 mm', weightPerSqFt: 0.796875 },
  { value: 1.2, label: '1.2 mm', weightPerSqFt: 0.96875 },
  { value: 1.5, label: '1.5 mm', weightPerSqFt: 1.21875 }
];

export const SHEET_GAUGES = [0.6, 0.8, 1.0, 1.2, 1.5];

// Strict Sheet Grades
export const SHEET_GRADES = ['202', '304', '316'];

// =========================================================================
// 2. PIPE MASTER CONFIGURATION & WEIGHT TABLES (20 FT Master Chart)
// Formula:
// weightForLength = referenceWeight20ft × enteredLengthInFeet / 20
// totalWeight = weightForLength × quantity
// If entered length in inches: enteredLengthInFeet = enteredInches / 12
// Pipe Gauge Options: '18G', '16G', '14G'
// =========================================================================
export const PIPE_GAUGE_OPTIONS = ['18G', '16G', '14G'];

export const PIPE_MASTER = [
  // SQUARE PIPES (Top)
  {
    id: 'sq-12',
    type: 'Square Pipe',
    size: '12 × 12 mm',
    aliases: ['12 × 12 mm', '12x12 mm', '12 × 12', '12x12'],
    weights20ft: {
      '18G': 2.80,
      '16G': 3.50,
      '14G': 4.70
    }
  },
  {
    id: 'sq-16',
    type: 'Square Pipe',
    size: '16 × 16 mm',
    aliases: ['16 × 16 mm', '16x16 mm', '16 × 16', '16x16'],
    weights20ft: {
      '18G': 3.70,
      '16G': 4.70,
      '14G': 6.25
    }
  },
  {
    id: 'sq-20',
    type: 'Square Pipe',
    size: '20 × 20 mm',
    aliases: ['20 × 20 mm', '20x20 mm', '20 × 20', '20x20'],
    weights20ft: {
      '18G': 4.70,
      '16G': 5.85,
      '14G': 7.80
    }
  },
  {
    id: 'sq-25',
    type: 'Square Pipe',
    size: '25 × 25 mm',
    aliases: ['25 × 25 mm', '25x25 mm', '25 × 25', '25x25', '1" (25 × 25 mm)', '1"'],
    weights20ft: {
      '18G': 5.80,
      '16G': 7.30,
      '14G': 9.80
    }
  },
  {
    id: 'sq-30',
    type: 'Square Pipe',
    size: '30 × 30 mm',
    aliases: ['30 × 30 mm', '30x30 mm', '30 × 30', '30x30', '1.25" (32 × 32 mm)', '32 × 32 mm'],
    weights20ft: {
      '18G': 7.00,
      '16G': 8.80,
      '14G': 11.80
    }
  },
  {
    id: 'sq-40',
    type: 'Square Pipe',
    size: '40 × 40 mm',
    aliases: ['40 × 40 mm', '40x40 mm', '40 × 40', '40x40', '1.5" (38 × 38 mm)', '38 × 38 mm', '1.5"'],
    weights20ft: {
      '18G': 9.40,
      '16G': 11.80,
      '14G': 15.60
    }
  },
  {
    id: 'sq-50',
    type: 'Square Pipe',
    size: '50 × 50 mm',
    aliases: ['50 × 50 mm', '50x50 mm', '50 × 50', '50x50', '2" (50 × 50 mm)', '2"'],
    weights20ft: {
      '18G': 11.70,
      '16G': 14.60,
      '14G': 19.50
    }
  },

  // RECTANGULAR PIPES
  {
    id: 'rec-50x25',
    type: 'Rectangle Pipe',
    size: '50 × 25 mm',
    aliases: ['50 × 25 mm', '50x25 mm', '50 × 25', '50x25', '2" × 1" (50 × 25 mm)'],
    weights20ft: {
      '18G': 8.80,
      '16G': 11.00,
      '14G': 14.70
    }
  },
  {
    id: 'rec-40x20',
    type: 'Rectangle Pipe',
    size: '40 × 20 mm',
    aliases: ['40 × 20 mm', '40x20 mm', '40 × 20', '40x20', '1.5" × 1" (38 × 25 mm)', '1" × 0.5" (25 × 12 mm)'],
    weights20ft: {
      '18G': 7.00,
      '16G': 8.80,
      '14G': 11.80
    }
  },

  // ROUND PIPES (Under Square/Rectangular)
  {
    id: 'rnd-0.5',
    type: 'Round Pipe',
    size: '1/2" Round',
    aliases: ['1/2"', '1/2" Round', '0.5" Round', '1/2" Dia', '0.5"', '1/2" Dia (12 mm)'],
    weights20ft: {
      '18G': 2.10,
      '16G': 2.50,
      '14G': null
    }
  },
  {
    id: 'rnd-0.625',
    type: 'Round Pipe',
    size: '5/8" Round',
    aliases: ['5/8"', '5/8" Round', '0.625" Round', '5/8" Dia'],
    weights20ft: {
      '18G': 2.60,
      '16G': 3.30,
      '14G': 4.30
    }
  },
  {
    id: 'rnd-0.75',
    type: 'Round Pipe',
    size: '3/4" Round',
    aliases: ['3/4"', '3/4" Round', '0.75" Round', '3/4" Dia'],
    weights20ft: {
      '18G': 3.20,
      '16G': 4.00,
      '14G': 5.20
    }
  },
  {
    id: 'rnd-1.0',
    type: 'Round Pipe',
    size: '1" Round',
    aliases: ['1"', '1" Round', '1.0" Round', '1" Dia', '1" Dia (25 mm)'],
    weights20ft: {
      '18G': 4.40,
      '16G': 5.50,
      '14G': 7.00
    }
  },
  {
    id: 'rnd-1.25',
    type: 'Round Pipe',
    size: '1 1/4" Round',
    aliases: ['1 1/4"', '1 1/4" Round', '1.25" Round', '1.25" Dia', '1.25" Dia (32 mm)', '1 1/4" Dia', '1 1/4" Dia (32 mm)'],
    weights20ft: {
      '18G': 5.60,
      '16G': 7.20,
      '14G': 9.10
    }
  },
  {
    id: 'rnd-1.5',
    type: 'Round Pipe',
    size: '1 1/2" Round',
    aliases: ['1 1/2"', '1 1/2" Round', '1.5" Round', '1.5" Dia', '1.5" Dia (38 mm)', '1 1/2" Dia', '1 1/2" Dia (38 mm)'],
    weights20ft: {
      '18G': 6.70,
      '16G': 8.40,
      '14G': 11.00
    }
  },
  {
    id: 'rnd-2.0',
    type: 'Round Pipe',
    size: '2" Round',
    aliases: ['2"', '2" Round', '2.0" Round', '2" Dia', '2" Dia (50 mm)'],
    weights20ft: {
      '18G': 9.00,
      '16G': 11.30,
      '14G': 15.00
    }
  },
  {
    id: 'rnd-2.5',
    type: 'Round Pipe',
    size: '2 1/2" Round',
    aliases: ['2 1/2"', '2 1/2" Round', '2.5" Round', '2.5" Dia', '2 1/2" Dia'],
    weights20ft: {
      '18G': 11.40,
      '16G': 14.20,
      '14G': 18.75
    }
  },
  {
    id: 'rnd-3.0',
    type: 'Round Pipe',
    size: '3" Round',
    aliases: ['3"', '3" Round', '3.0" Round', '3" Dia'],
    weights20ft: {
      '18G': 13.75,
      '16G': 17.00,
      '14G': 22.60
    }
  }
];

export const PIPE_SIZE_OPTIONS = PIPE_MASTER.map(p => p.size);
export const PIPE_SIZES = PIPE_SIZE_OPTIONS;

export function normalizePipeGauge(gauge) {
  if (!gauge) return '16G';
  const gStr = String(gauge).trim().toUpperCase();
  if (gStr.includes('18')) return '18G';
  if (gStr.includes('14')) return '14G';
  if (gStr.includes('16')) return '16G';
  return '16G';
}

export function findPipeMaster(size) {
  if (!size) return null;
  const sizeStr = String(size).trim();
  const normalized = sizeStr.replace(/x/gi, '×').replace(/\s+/g, ' ').trim();
  
  // 1. Direct exact match on size or id
  const exact = PIPE_MASTER.find(p => p.size === sizeStr || p.size === normalized || p.id === sizeStr);
  if (exact) return exact;

  // 2. Exact match on aliases
  const aliasExact = PIPE_MASTER.find(p => Array.isArray(p.aliases) && p.aliases.some(a => a.toLowerCase() === sizeStr.toLowerCase() || a.toLowerCase() === normalized.toLowerCase()));
  if (aliasExact) return aliasExact;

  // 3. Substring match (check longer pipe size names first to avoid '1/2"' matching '1 1/2"')
  const sortedPipes = [...PIPE_MASTER].sort((a, b) => b.size.length - a.size.length);
  return sortedPipes.find(p => {
    if (sizeStr.toLowerCase().includes(p.size.toLowerCase())) return true;
    if (Array.isArray(p.aliases)) {
      const sortedAliases = [...p.aliases].sort((a, b) => b.length - a.length);
      return sortedAliases.some(a => sizeStr.toLowerCase().includes(a.toLowerCase()));
    }
    return false;
  }) || null;
}

export function getPipeWeight20ft(size, gauge = '16G') {
  if (!size) return null;
  const pipe = findPipeMaster(size);
  if (!pipe) return null;
  const cleanGauge = normalizePipeGauge(gauge);
  const wt = pipe.weights20ft[cleanGauge];
  if (wt === undefined || wt === null) return null;
  return wt;
}

export function getPipeWeightPerFoot(size, gauge = '16G') {
  const wt20 = getPipeWeight20ft(size, gauge);
  if (wt20 === null || wt20 === undefined) return 0;
  return wt20 / 20;
}

export function isPipeCombinationUnavailable(size, gauge) {
  if (!size || !gauge) return false;
  const pipe = findPipeMaster(size);
  if (!pipe) return false;
  const cleanGauge = normalizePipeGauge(gauge);
  return pipe.weights20ft[cleanGauge] === null || pipe.weights20ft[cleanGauge] === undefined;
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
  if (!gauge) return 0.340;
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
export const ROUND_POT_SIZES = ['1 L', '2 L', '3 L', '4 L', '5 L', '6 L', '7 L', '8 L', '9 L', '10 L'];
export const ROUND_POT_QUANTITIES = ROUND_POT_SIZES;
export const PATTI_OPTIONS = ['25 × 3 mm', '30 × 3 mm'];
export const BAR_OPTIONS = ['8 mm', '10 mm', '12 mm'];
export const WORK_TOP_SIZES = ['4 ft', '5 ft', '6 ft', '7 ft', '8 ft'];

// Helper to determine size options for dynamic items
export function getItemSizeOptions(materialName) {
  if (!materialName) return null;
  const name = String(materialName).trim().toLowerCase();
  if (name.includes('round pot')) return ROUND_POT_SIZES;
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
// 4. MASTER COUNTER TYPES LIST (EXACT 20 FROM SPECIFICATION MASTER)
// =========================================================================
export const COUNTER_TYPES = [
  'Working Table',
  'Dining Table',
  'Counter',
  'Sink Unit',
  'Sink Unit with Table',
  'Soiled Dish Table',
  'Gas Range',
  'Dosa Bhatti',
  'SS Tandoor',
  'Shawarma Cabin',
  'Chapati Puffer Plate',
  'SS Dish Rack',
  'Pot Rack',
  'Bench',
  'Storage Bin',
  'Trolley',
  'Fridge',
  'Bain Merry Marie',
  'Tea Counter',
  'GN PAN / ROUND POT'
];

export const counterTypeOptions = COUNTER_TYPES;

export const COUNTER_TYPES_CONFIG = {
  'Working Table': {
    hasSubtypes: false,
    subtypes: [],
    aliases: ['Working Table', 'Table', 'Stainless Steel Kitchen', 'SS Kitchen', 'Work Table'],
    hasDepth: false,
    requiresAngle: false
  },
  'Dining Table': {
    hasSubtypes: false,
    subtypes: [],
    aliases: ['Dining Table'],
    hasDepth: false,
    requiresAngle: false
  },
  'Counter': {
    hasSubtypes: false,
    subtypes: [],
    aliases: ['Counter', 'Counters'],
    hasDepth: false,
    requiresAngle: false
  },
  'Table': {
    hasSubtypes: false,
    subtypes: [],
    aliases: ['Working Table', 'Table', 'Stainless Steel Kitchen', 'SS Kitchen', 'Work Table'],
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
    requiresAngle: true
  },
  'SS Tandoor': {
    hasSubtypes: false,
    subtypes: [],
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
  },
  'Table Top Shawarma Cabin': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: false,
    requiresAngle: false
  },
  'Half Shawarma Cabin': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: false,
    requiresAngle: false
  },
  'Full Shawarma Cabin': {
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
    requiresAngle: true
  },
  'Chapati Plate': {
    hasSubtypes: false,
    subtypes: [],
    aliases: ['Chapati Puffer Plate'],
    hasDepth: false,
    requiresAngle: true
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
  'Bench': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: false,
    requiresAngle: false
  },
  'Storage Bin': {
    hasSubtypes: true,
    subtypeLabel: 'Storage Type',
    subtypes: [
      'Vegetable Storage',
      'Grain Storage'
    ],
    aliases: ['Storage'],
    hasDepth: false,
    requiresAngle: false
  },
  'Vegetable Storage': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: false,
    requiresAngle: false
  },
  'Grain Storage': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: false,
    requiresAngle: false
  },
  'Trolley': {
    hasSubtypes: false,
    subtypes: [],
    aliases: ['Trolley', 'Trolly'],
    hasDepth: false,
    requiresAngle: true
  },
  'Trolly': {
    hasSubtypes: false,
    subtypes: [],
    aliases: ['Trolley', 'Trolly'],
    hasDepth: false,
    requiresAngle: true
  },
  'Fridge': {
    hasSubtypes: true,
    subtypeLabel: 'Fridge Type',
    subtypes: [
      'Vertical - 2 Door',
      'Vertical - 3 Door',
      'Vertical - 4 Door',
      'Vertical - 5 Door',
      'Vertical - 6 Door',
      'Work Top - 4 ft',
      'Work Top - 5 ft',
      'Work Top - 6 ft',
      'Work Top - 7 ft',
      'Work Top - 8 ft'
    ],
    hasDepth: false,
    requiresAngle: false
  },
  'Bain Merry Marie': {
    hasSubtypes: false,
    subtypes: [],
    aliases: ['Bain Marie', 'Bain Merry', 'Bain-Marie'],
    hasDepth: false,
    requiresAngle: false
  },
  'Bain Marie': {
    hasSubtypes: false,
    subtypes: [],
    aliases: ['Bain Merry Marie'],
    hasDepth: false,
    requiresAngle: false
  },
  'Tea Counter': {
    hasSubtypes: false,
    subtypes: [],
    hasDepth: false,
    requiresAngle: false
  },
  'GN PAN / ROUND POT': {
    hasSubtypes: false,
    subtypes: [],
    aliases: ['GN Pan / Round Pot', 'GN Pan', 'Round Pot', 'GN Pan / Round Pot / Vessel'],
    hasDepth: false,
    requiresAngle: false
  }
};

// =========================================================================
// 5. CENTRAL COUNTER SPECIFICATION MASTER (COUNTER_CONFIG)
// Exact Specifications from Section 19
// =========================================================================
export const COUNTER_CONFIG = {
  'Working Table': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Overhead Shelf', 'Underhead Shelf'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Overhead Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Underhead Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'LAFA', grade: '304', gauge: 1.2, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Over Shelf Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: true },
      { materialName: 'Top Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Roof Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },
  'Table': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Overhead Shelf', 'Underhead Shelf'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Overhead Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Underhead Shelf', grade: '304', gauge: 1.2, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Over Shelf Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: true },
      { materialName: 'Top Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Roof Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Counter': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: [
      'Top', 'Under Shelf', 'Side Covering – Right', 'Side Covering – Left', 'Front Covering',
      'Door', 'Drawer', 'Partition', 'Overhead Covering Left', 'Overhead Covering Right',
      'Overhead Top Covering Left', 'Overhead Top Covering Right', 'Overhead Top Covering Front',
      'Overhead Shelf', 'Overhead Shelf Covering', 'Overhead Shelf Door', 'Overhead Shelf Partition',
      'Roof', 'Tank', 'Leg Pipe', 'Top Support Pipe', 'Shelf Support Pipe', 'Under Support Pipe',
      'Overhead Shelf Pipe', 'Handle', 'Hinges', 'Glass', 'GN Pan', 'Round Pot', 'Coil', 'Switch',
      'Wire 3 Pin', 'Patti Wal', 'Wheel', 'Bush', 'Lock', 'Dosa Plate', 'Pan Support', 'Casting',
      'Burner', 'Copper Pipe', 'NCV', 'Gas Manifold', 'Mixing Tube', 'Onion Cloth', 'Dosa Burner'
    ],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Side Covering – Right', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Side Covering – Left', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Door', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Drawer', grade: '304', gauge: 1.0, hasDepth: true, isRepeatable: true },
      { materialName: 'Partition', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Overhead Covering Left', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Overhead Covering Right', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Overhead Top Covering Left', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Overhead Top Covering Right', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Overhead Top Covering Front', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Overhead Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Overhead Shelf Covering', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Overhead Shelf Door', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Overhead Shelf Partition', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Roof', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Tank', grade: '304', gauge: 1.2, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: true },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: true },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: true },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: true },
      { materialName: 'Overhead Shelf Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: true }
    ],
    angles: [],
    purchased: [
      { materialName: 'Handle', price: '', isRepeatable: true },
      { materialName: 'Hinges', price: '', isRepeatable: true },
      { materialName: 'Glass', price: '', isRepeatable: true },
      { materialName: 'GN Pan', price: '', dropdownOptions: GN_PAN_OPTIONS, allowMultiple: true, isRepeatable: true },
      { materialName: 'Round Pot', price: '', dropdownOptions: ROUND_POT_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Coil', price: '', isRepeatable: true },
      { materialName: 'Switch', price: '', isRepeatable: true },
      { materialName: 'Wire 3 Pin', price: '', isRepeatable: true },
      { materialName: 'Patti Wal', price: '', isRepeatable: true },
      { materialName: 'Wheel', price: '', isRepeatable: true },
      { materialName: 'Bush', price: '', isRepeatable: true },
      { materialName: 'Lock', price: '', isRepeatable: true },
      { materialName: 'Dosa Plate', price: '', isRepeatable: true },
      { materialName: 'Pan Support', price: '', isRepeatable: true },
      { materialName: 'Casting', price: '', isRepeatable: true },
      { materialName: 'Burner', price: '', dropdownOptions: BURNER_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: COPPER_PIPE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'NCV', price: '', isRepeatable: true },
      { materialName: 'Gas Manifold', price: '', isRepeatable: true },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: MIXING_TUBE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Onion Cloth', price: '', isRepeatable: true },
      { materialName: 'Dosa Burner', price: '', dropdownOptions: DOSA_BURNER_SIZES, allowMultiple: true, isRepeatable: true }
    ]
  },

  'Sink Unit': {
    hasDepth: true,
    requiresAngle: false,
    repeatableComponents: ['Under Shelf', 'Overhead Shelf', 'Sink Bowl'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Side Covering – Right', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Side Covering – Left', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Overhead Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Sink Bowl', grade: '304', gauge: 1.2, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Over Shelf Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: true },
      { materialName: 'Leg Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Bush', price: '', isRepeatable: false },
      { materialName: 'Water Tap', price: '', isRepeatable: false },
      { materialName: 'Drain Outlet / Waste Coupling', price: '', isRepeatable: false }
    ]
  },

  'Sink Unit with Table': {
    hasDepth: true,
    requiresAngle: false,
    repeatableComponents: ['Under Shelf', 'Overhead Shelf', 'Sink Bowl'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Side Covering – Right', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Side Covering – Left', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Overhead Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Sink Bowl', grade: '304', gauge: 1.2, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Over Shelf Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: true },
      { materialName: 'Leg Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Bush', price: '', isRepeatable: false },
      { materialName: 'Water Tap', price: '', isRepeatable: false },
      { materialName: 'Drain Outlet / Waste Coupling', price: '', isRepeatable: false }
    ]
  },

  'Soiled Dish Table': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Overhead Shelf'],
    sheets: [
      { materialName: 'Table Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Side Covering – Right', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Side Covering – Left', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Overhead Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Round Garbage Shute', grade: '304', gauge: 1.2, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Over Shelf Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: true },
      { materialName: 'Leg Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Gas Range': {
    hasDepth: false,
    requiresAngle: true,
    repeatableComponents: ['Under Shelf', 'Angle', 'Burner', 'Copper Pipe', 'Mixing Tube'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Side Covering – Right', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Side Covering – Left', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [
      { materialName: 'MS Angle', grade: 'MS', gauge: '25 × 3 mm', isRepeatable: true }
    ],
    purchased: [
      { materialName: 'Burner', price: '', dropdownOptions: BURNER_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: COPPER_PIPE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: MIXING_TUBE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Pan Support Casting / Drum Support', price: '', isRepeatable: false },
      { materialName: 'Pipe Regulator', price: '', isRepeatable: false },
      { materialName: 'Pilot Burner', price: '', isRepeatable: false },
      { materialName: 'Bush', price: '', isRepeatable: false },
      { materialName: 'NCV', price: '', isRepeatable: false },
      { materialName: 'Chinese Gas Burner', price: '', isRepeatable: true },
      { materialName: 'Dom', price: '', isRepeatable: true }
    ]
  },

  'Single Gas Range': {
    hasDepth: false,
    requiresAngle: true,
    repeatableComponents: ['Under Shelf', 'Angle', 'Burner', 'Copper Pipe', 'Mixing Tube'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Side Covering – Right', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Side Covering – Left', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [
      { materialName: 'MS Angle', grade: 'MS', gauge: '25 × 3 mm', isRepeatable: true }
    ],
    purchased: [
      { materialName: 'Burner', price: '', dropdownOptions: BURNER_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: COPPER_PIPE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: MIXING_TUBE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Pan Support Casting / Drum Support', price: '', isRepeatable: false },
      { materialName: 'Pipe Regulator', price: '', isRepeatable: false },
      { materialName: 'Pilot Burner', price: '', isRepeatable: false },
      { materialName: 'Bush', price: '', isRepeatable: false },
      { materialName: 'NCV', price: '', isRepeatable: false }
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
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [
      { materialName: 'MS Angle', grade: 'MS', gauge: '25 × 3 mm', isRepeatable: true }
    ],
    purchased: [
      { materialName: 'NCV', price: '', isRepeatable: false },
      { materialName: 'Chinese Gas Burner', price: '', isRepeatable: true },
      { materialName: 'Dom', price: '', isRepeatable: true },
      { materialName: 'Burner', price: '', dropdownOptions: BURNER_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: COPPER_PIPE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: MIXING_TUBE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Pan Support Casting / Drum Support', price: '', isRepeatable: false },
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
      { materialName: 'Side Covering – Right', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Side Covering – Left', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [
      { materialName: 'MS Angle', grade: 'MS', gauge: '25 × 3 mm', isRepeatable: true }
    ],
    purchased: [
      { materialName: 'Burner', price: '', dropdownOptions: BURNER_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: COPPER_PIPE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: MIXING_TUBE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Pan Support Casting / Drum Support', price: '', isRepeatable: false },
      { materialName: 'Pipe Regulator', price: '', isRepeatable: false },
      { materialName: 'Pilot Burner', price: '', isRepeatable: false },
      { materialName: 'Bush', price: '', isRepeatable: false },
      { materialName: 'NCV', price: '', isRepeatable: false }
    ]
  },

  'Four Gas Range': {
    hasDepth: false,
    requiresAngle: true,
    repeatableComponents: ['Under Shelf', 'Angle', 'Burner', 'Copper Pipe', 'Mixing Tube'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Side Covering – Right', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Side Covering – Left', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [
      { materialName: 'MS Angle', grade: 'MS', gauge: '25 × 3 mm', isRepeatable: true }
    ],
    purchased: [
      { materialName: 'Burner', price: '', dropdownOptions: BURNER_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: COPPER_PIPE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: MIXING_TUBE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Pan Support Casting / Drum Support', price: '', isRepeatable: false },
      { materialName: 'Pipe Regulator', price: '', isRepeatable: false },
      { materialName: 'Pilot Burner', price: '', isRepeatable: false },
      { materialName: 'Bush', price: '', isRepeatable: false },
      { materialName: 'NCV', price: '', isRepeatable: false }
    ]
  },

  'Chinese Gas Range': {
    hasDepth: false,
    requiresAngle: true,
    repeatableComponents: ['Under Shelf', 'Angle', 'Chinese Gas Burner', 'Dom'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Side Covering – Right', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Side Covering – Left', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [
      { materialName: 'MS Angle', grade: 'MS', gauge: '25 × 3 mm', isRepeatable: true }
    ],
    purchased: [
      { materialName: 'NCV', price: '', isRepeatable: false },
      { materialName: 'Chinese Gas Burner', price: '', isRepeatable: true },
      { materialName: 'Dom', price: '', isRepeatable: true },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: MIXING_TUBE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Pipe Regulator', price: '', isRepeatable: false },
      { materialName: 'Pilot Burner', price: '', isRepeatable: false },
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Dosa Bhatti': {
    hasDepth: false,
    requiresAngle: true,
    repeatableComponents: ['Under Shelf'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Side Covering – Right', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Side Covering – Left', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Panel Front Door', grade: '304', gauge: 1.0, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [
      { materialName: 'MS Angle', grade: 'MS', gauge: '25 × 3 mm', isRepeatable: true }
    ],
    purchased: [
      { materialName: 'MS Plate', price: '', isRepeatable: false },
      { materialName: 'Dosa Burner', price: '', dropdownOptions: DOSA_BURNER_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: MIXING_TUBE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: COPPER_PIPE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Pilot Burner', price: '', isRepeatable: false },
      { materialName: 'NCV', price: '', isRepeatable: false },
      { materialName: 'Bush', price: '', isRepeatable: false },
      { materialName: 'Handle', price: '', isRepeatable: false },
      { materialName: 'Wheels', price: '', isRepeatable: false }
    ]
  },

  'SS Tandoor': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: [],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Side Covering – Right', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Side Covering – Left', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Wooden Ply with Nut & Bolt', price: '', isRepeatable: false },
      { materialName: 'Kumbhar Work', price: '', isRepeatable: false },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false }
    ]
  },

  'Shawarma Cabin': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Under Shelf', 'Door', 'Drawers'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Right Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Left Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Door', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Drawers', grade: '304', gauge: 1.0, hasDepth: true, isRepeatable: true },
      { materialName: 'Roof', grade: '304', gauge: 1.0, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Table Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Cabin Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Shawarma Burner', price: '', isRepeatable: true },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: COPPER_PIPE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'NCV', price: '', isRepeatable: false },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: MIXING_TUBE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Pipe Regulator', price: '', isRepeatable: false },
      { materialName: 'Thali', price: '', isRepeatable: false },
      { materialName: 'Bar', price: '', dropdownOptions: BAR_OPTIONS, allowMultiple: true, isRepeatable: true }
    ]
  },

  'Table Top Shawarma Cabin': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: [],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Right Panel Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Left Panel Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Back Side Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Roof', grade: '304', gauge: 1.0, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Table Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Cabin Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Shawarma Burner', price: '', isRepeatable: true },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: COPPER_PIPE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'NCV', price: '', isRepeatable: false },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: MIXING_TUBE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Pipe Regulator', price: '', isRepeatable: false },
      { materialName: 'Thali', price: '', isRepeatable: false },
      { materialName: 'Bar', price: '', dropdownOptions: BAR_OPTIONS, allowMultiple: true, isRepeatable: true }
    ]
  },

  'Half Shawarma Cabin': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Under Shelf', 'Door', 'Drawers'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Right Panel', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Left Panel', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Upper Back Side Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Under Top Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Right Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Left Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Door', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Drawers', grade: '304', gauge: 1.0, hasDepth: true, isRepeatable: true },
      { materialName: 'Under Top Side Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Roof', grade: '304', gauge: 1.0, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Table Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Cabin Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Shawarma Burner', price: '', isRepeatable: true },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: COPPER_PIPE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'NCV', price: '', isRepeatable: false },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: MIXING_TUBE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Pipe Regulator', price: '', isRepeatable: false },
      { materialName: 'Thali', price: '', isRepeatable: false },
      { materialName: 'Bar', price: '', dropdownOptions: BAR_OPTIONS, allowMultiple: true, isRepeatable: true }
    ]
  },

  'Full Shawarma Cabin': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Under Shelf', 'Door', 'Drawers'],
    sheets: [
      { materialName: 'Top Shelf', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Right Panel', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Left Panel', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Upper Top Side Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Upper Back Side Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Under Top Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Right Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Left Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Door', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Drawers', grade: '304', gauge: 1.0, hasDepth: true, isRepeatable: true },
      { materialName: 'Under Top Side Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Roof', grade: '304', gauge: 1.0, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Table Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Cabin Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Shawarma Burner', price: '', isRepeatable: true },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: COPPER_PIPE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'NCV', price: '', isRepeatable: false },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: MIXING_TUBE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Pipe Regulator', price: '', isRepeatable: false },
      { materialName: 'Thali', price: '', isRepeatable: false },
      { materialName: 'Bar', price: '', dropdownOptions: BAR_OPTIONS, allowMultiple: true, isRepeatable: true }
    ]
  },

  'Chapati Puffer Plate': {
    hasDepth: false,
    requiresAngle: true,
    aliases: ['Chapati Plate', 'Puffer Plate'],
    repeatableComponents: ['Shelf', 'Under Shelf'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Side Covering – Right', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Side Covering – Left', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [
      { materialName: 'MS Angle', grade: 'MS', gauge: '25 × 3 mm', isRepeatable: true }
    ],
    purchased: [
      { materialName: 'Puffer Plate', price: '', isRepeatable: false },
      { materialName: 'MS Plate', price: '', isRepeatable: false },
      { materialName: 'Dosa Burner', price: '', dropdownOptions: DOSA_BURNER_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Puffer Burner', price: '', isRepeatable: false },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: MIXING_TUBE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: COPPER_PIPE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Bush', price: '', isRepeatable: false },
      { materialName: 'NCV', price: '', isRepeatable: false }
    ]
  },

  'Chapati Plate': {
    hasDepth: false,
    requiresAngle: true,
    aliases: ['Chapati Puffer Plate'],
    repeatableComponents: ['Shelf', 'Under Shelf'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Side Covering – Right', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Side Covering – Left', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [
      { materialName: 'MS Angle', grade: 'MS', gauge: '25 × 3 mm', isRepeatable: true }
    ],
    purchased: [
      { materialName: 'Puffer Plate', price: '', isRepeatable: false },
      { materialName: 'MS Plate', price: '', isRepeatable: false },
      { materialName: 'Dosa Burner', price: '', dropdownOptions: DOSA_BURNER_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Puffer Burner', price: '', isRepeatable: false },
      { materialName: 'Mixing Tube', price: '', dropdownOptions: MIXING_TUBE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Copper Pipe', price: '', dropdownOptions: COPPER_PIPE_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Gas Manifold', price: '', isRepeatable: false },
      { materialName: 'Bush', price: '', isRepeatable: false },
      { materialName: 'NCV', price: '', isRepeatable: false }
    ]
  },

  'SS Dish Rack': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Shelf', 'Leg Pipe', 'Shelf Support Pipe'],
    sheets: [
      { materialName: 'Shelf', grade: '304', gauge: 1.2, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: true },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Dish Rack': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Shelf', 'Leg Pipe', 'Shelf Support Pipe'],
    sheets: [
      { materialName: 'Shelf', grade: '304', gauge: 1.2, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: true },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
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
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Frame Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Mid Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: true }
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
      { materialName: 'Table Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'LAFA', grade: '304', gauge: 1.2, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Center Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Leg Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Stool Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: true }
    ],
    angles: [],
    purchased: [
      { materialName: 'Bush', price: '', isRepeatable: false },
      { materialName: 'Thali', price: '', isRepeatable: false },
      { materialName: 'Patti', price: '', dropdownOptions: PATTI_OPTIONS, allowMultiple: true, isRepeatable: true },
      { materialName: 'Bar', price: '', dropdownOptions: BAR_OPTIONS, allowMultiple: true, isRepeatable: true }
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
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Leg Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Back Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Bush', price: '', isRepeatable: false }
    ]
  },

  'Storage Bin': {
    hasDepth: false,
    requiresAngle: false,
    aliases: ['Storage'],
    repeatableComponents: ['Internal Partition', 'Tray'],
    sheets: [
      { materialName: 'Top Door', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Bottom', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Side Covering – Right', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Side Covering – Left', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Base', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Internal Partition', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Tray', grade: '304', gauge: 1.2, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Handle', price: '', isRepeatable: false },
      { materialName: 'Hinges', price: '', isRepeatable: false },
      { materialName: 'Wheel', price: '', isRepeatable: false },
      { materialName: 'Square Bar Grill', price: '', isRepeatable: false },
      { materialName: 'Bar', price: '', dropdownOptions: BAR_OPTIONS, allowMultiple: true, isRepeatable: true }
    ]
  },

  'Vegetable Storage': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Internal Partition', 'Tray'],
    sheets: [
      { materialName: 'Top Door', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Bottom', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Side Covering – Right', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Side Covering – Left', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Base', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Internal Partition', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Tray', grade: '304', gauge: 1.2, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Handle', price: '', isRepeatable: false },
      { materialName: 'Hinges', price: '', isRepeatable: false },
      { materialName: 'Wheel', price: '', isRepeatable: false },
      { materialName: 'Square Bar Grill', price: '', isRepeatable: false },
      { materialName: 'Bar', price: '', dropdownOptions: BAR_OPTIONS, allowMultiple: true, isRepeatable: true }
    ]
  },

  'Grain Storage': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Internal Partition', 'Tray'],
    sheets: [
      { materialName: 'Top Door', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Bottom', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Side Covering – Right', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Side Covering – Left', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Base', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Internal Partition', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Tray', grade: '304', gauge: 1.2, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Handle', price: '', isRepeatable: false },
      { materialName: 'Hinges', price: '', isRepeatable: false },
      { materialName: 'Wheel', price: '', isRepeatable: false },
      { materialName: 'Square Bar Grill', price: '', isRepeatable: false },
      { materialName: 'Bar', price: '', dropdownOptions: BAR_OPTIONS, allowMultiple: true, isRepeatable: true }
    ]
  },

  'Trolley': {
    hasDepth: true,
    requiresAngle: true,
    repeatableComponents: ['Under Shelf'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, hasDepth: true, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Tank', grade: '304', gauge: 1.2, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Handle', grade: '304', pipeGauge: '16G', pipeSize: '1" Round', isRepeatable: false }
    ],
    angles: [
      { materialName: 'MS Angle', grade: 'MS', gauge: '25 × 3 mm', isRepeatable: true }
    ],
    purchased: [
      { materialName: 'Wheels', price: '', isRepeatable: false }
    ]
  },
  'Trolly': {
    hasDepth: true,
    requiresAngle: true,
    repeatableComponents: ['Under Shelf'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, hasDepth: true, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Tank', grade: '304', gauge: 1.2, isRepeatable: false }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Handle', grade: '304', pipeGauge: '16G', pipeSize: '1" Round', isRepeatable: false }
    ],
    angles: [
      { materialName: 'MS Angle', grade: 'MS', gauge: '25 × 3 mm', isRepeatable: true }
    ],
    purchased: [
      { materialName: 'Wheels', price: '', isRepeatable: false }
    ]
  },

  'Fridge': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Overhead Shelf', 'Bar Shelf', 'Shelf Patti', 'Patti Clamp', 'Handle', 'Lock'],
    sheets: [
      { materialName: 'Sheet', grade: '304', gauge: 0.8, gaugeOptions: [0.6, 0.8, 1.0, 1.2, 1.5], isRepeatable: false },
      { materialName: 'Magnet Sheet', grade: '304', gauge: 0.8, gaugeOptions: [0.6, 0.8, 1.0, 1.2, 1.5], isRepeatable: false },
      { materialName: '2B Sheet', grade: '304', gauge: 0.8, gaugeOptions: [0.6, 0.8, 1.0, 1.2, 1.5], isRepeatable: false },
      { materialName: 'PVC Mat', grade: '304', gauge: 0.8, gaugeOptions: [0.6, 0.8, 1.0, 1.2, 1.5], isRepeatable: false },
      { materialName: 'Overhead Shelf', grade: '304', gauge: 0.8, gaugeOptions: [0.6, 0.8, 1.0, 1.2, 1.5], isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Shelf Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Under Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Overhead Shelf Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: true }
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
      { materialName: 'Handle', price: '', isRepeatable: true },
      { materialName: 'Lock', price: '', isRepeatable: true },
      { materialName: 'Side Grill', price: '', isRepeatable: false },
      { materialName: 'Wheel', price: '', isRepeatable: false },
      { materialName: 'Bush', price: '', isRepeatable: false }
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
      { materialName: 'Hinges', price: '', isRepeatable: true },
      { materialName: 'Gas Kit', price: '', isRepeatable: false },
      { materialName: 'Magnet', price: '', isRepeatable: false },
      { materialName: 'Capillary', price: '', isRepeatable: false }
    ]
  },

  'Bain Merry Marie': {
    hasDepth: false,
    requiresAngle: false,
    aliases: ['Bain Marie', 'Bain Merry', 'Bain-Marie'],
    repeatableComponents: ['Overhead Shelf', 'Under Shelf', 'Drawer', 'Door', 'Handle', 'GN Pan', 'Round Pot', 'Hinges'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Overhead Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Left Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Right Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Side Railing', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Drawer', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Door', grade: '304', gauge: 1.0, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Overhead Shelf Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: true },
      { materialName: '4 × Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Front Side Railing Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Glass', price: '', isRepeatable: false },
      { materialName: 'GN Pan', price: '', dropdownOptions: GN_PAN_OPTIONS, allowMultiple: true, isRepeatable: true },
      { materialName: 'Coil', price: '', isRepeatable: false },
      { materialName: 'Thermostat', price: '', isRepeatable: false },
      { materialName: 'Rotary Switch', price: '', isRepeatable: false },
      { materialName: 'Bush', price: '', isRepeatable: false },
      { materialName: 'Handle', price: '', isRepeatable: true },
      { materialName: '3 Pin Top', price: '', isRepeatable: false },
      { materialName: 'Wire', price: '', isRepeatable: false },
      { materialName: 'Patti Wal', price: '', isRepeatable: false },
      { materialName: 'Hinges', price: '', isRepeatable: true },
      { materialName: 'Round Pot', price: '', dropdownOptions: ROUND_POT_SIZES, allowMultiple: true, isRepeatable: true }
    ]
  },

  'Bain Marie': {
    hasDepth: false,
    requiresAngle: false,
    aliases: ['Bain Merry Marie', 'Bain Merry', 'Bain-Marie'],
    repeatableComponents: ['Overhead Shelf', 'Under Shelf', 'Drawer', 'Door', 'Handle', 'GN Pan', 'Round Pot', 'Hinges'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Overhead Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Left Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Right Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Side Railing', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Drawer', grade: '304', gauge: 1.0, isRepeatable: true },
      { materialName: 'Door', grade: '304', gauge: 1.0, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Overhead Shelf Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: true },
      { materialName: '4 × Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Front Side Railing Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Glass', price: '', isRepeatable: false },
      { materialName: 'GN Pan', price: '', dropdownOptions: GN_PAN_OPTIONS, allowMultiple: true, isRepeatable: true },
      { materialName: 'Coil', price: '', isRepeatable: false },
      { materialName: 'Thermostat', price: '', isRepeatable: false },
      { materialName: 'Rotary Switch', price: '', isRepeatable: false },
      { materialName: 'Bush', price: '', isRepeatable: false },
      { materialName: 'Handle', price: '', isRepeatable: true },
      { materialName: '3 Pin Top', price: '', isRepeatable: false },
      { materialName: 'Wire', price: '', isRepeatable: false },
      { materialName: 'Patti Wal', price: '', isRepeatable: false },
      { materialName: 'Hinges', price: '', isRepeatable: true },
      { materialName: 'Round Pot', price: '', dropdownOptions: ROUND_POT_SIZES, allowMultiple: true, isRepeatable: true }
    ]
  },

  'Tea Counter': {
    hasDepth: false,
    requiresAngle: false,
    repeatableComponents: ['Under Shelf', 'Drawer', 'Door', 'Handle', 'Lock'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Top Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Left Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Right Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Drawer', grade: '304', gauge: 1.0, hasDepth: true, isRepeatable: true },
      { materialName: 'Door', grade: '304', gauge: 1.0, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Top Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Upper Design Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Required Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false }
    ],
    angles: [],
    purchased: [
      { materialName: 'Bush', price: '', isRepeatable: false },
      { materialName: 'Handle', price: '', isRepeatable: true },
      { materialName: 'Lock', price: '', isRepeatable: true }
    ]
  },

  'GN PAN / ROUND POT': {
    hasDepth: false,
    requiresAngle: false,
    aliases: ['GN Pan / Round Pot', 'GN Pan / Round Pot / Vessel', 'GN Pan', 'Round Pot', 'GN PAN / ROUND. Pot/vessel'],
    repeatableComponents: ['Overhead Shelf', 'Under Shelf', 'Round Pot', 'GN Pan'],
    sheets: [
      { materialName: 'Top', grade: '304', gauge: 1.2, isRepeatable: false },
      { materialName: 'Overhead Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Under Shelf', grade: '304', gauge: 1.2, isRepeatable: true },
      { materialName: 'Left Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Right Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Front Covering', grade: '304', gauge: 1.0, isRepeatable: false },
      { materialName: 'Round Pot', grade: '304', gauge: 1.2, dropdownOptions: ROUND_POT_SIZES, isRepeatable: true }
    ],
    pipes: [
      { materialName: 'Leg Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Top Support Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: false },
      { materialName: 'Overhead Shelf Pipe', grade: '304', pipeGauge: '16G', pipeSize: '40 × 40 mm', isRepeatable: true }
    ],
    angles: [],
    purchased: [
      { materialName: 'GN Pan', price: '', dropdownOptions: GN_PAN_OPTIONS, allowMultiple: true, isRepeatable: true },
      { materialName: 'Round Pot', price: '', dropdownOptions: ROUND_POT_SIZES, allowMultiple: true, isRepeatable: true },
      { materialName: 'Bush', price: '', isRepeatable: false }
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
    } else if (target.includes('Table Top Shawarma')) {
      configKey = 'Table Top Shawarma Cabin';
    } else if (target.includes('Half Shawarma')) {
      configKey = 'Half Shawarma Cabin';
    } else if (target.includes('Full Shawarma')) {
      configKey = 'Full Shawarma Cabin';
    } else if (target.includes('Vegetable Storage')) {
      configKey = 'Vegetable Storage';
    } else if (target.includes('Grain Storage')) {
      configKey = 'Grain Storage';
    } else if (target.includes('Vertical') || target.includes('Work Top') || target.includes('Fridge')) {
      configKey = 'Fridge';
    } else if (target.includes('Gas Range')) {
      configKey = 'Gas Range';
    } else if (target.includes('Shawarma')) {
      configKey = 'Shawarma Cabin';
    } else if (target.includes('Chapati')) {
      configKey = 'Chapati Puffer Plate';
    } else if (target.includes('Storage')) {
      configKey = 'Storage Bin';
    } else if (target.includes('Dining Table') || target.includes('Dining')) {
      configKey = 'Dining Table';
    } else if (target.includes('Stainless Steel Kitchen') || target.includes('Working Table') || (target.includes('Table') && !target.includes('Soiled') && !target.includes('Sink'))) {
      configKey = 'Working Table';
    } else if (target.includes('Dish Rack')) {
      configKey = 'SS Dish Rack';
    } else if (target.includes('Bain Merry') || target.includes('Bain Marie')) {
      configKey = 'Bain Merry Marie';
    } else if (target.includes('Tea Counter')) {
      configKey = 'Tea Counter';
    } else if (target.toLowerCase() === 'counter' || target.toLowerCase() === 'counters' || target.toLowerCase().startsWith('counter ') || target === 'Counter') {
      configKey = 'Counter';
    } else if (target.includes('Round Pot') || target.includes('GN Pan') || target.includes('GN PAN')) {
      configKey = 'GN PAN / ROUND POT';
    }
  }

  const rawCfg = COUNTER_CONFIG[configKey] || COUNTER_CONFIG['Working Table'];

  const isTrolly = configKey.toLowerCase().includes('troll');
  const sheets = (rawCfg.sheets || []).map((s, idx) => {
    const isCovering = (s.materialName || '').toLowerCase().includes('covering');
    const isSinkBowl = (s.materialName || '').toLowerCase().includes('sink') || (s.materialName || '').toLowerCase().includes('bowl');
    const isDrawer = (s.materialName || '').toLowerCase().includes('drawer');
    const isTrollyTop = isTrolly && (s.materialName || '').toLowerCase().includes('top');
    const hasDepth = Boolean(s.hasDepth || isSinkBowl || isDrawer || isTrollyTop);
    return {
      id: `sheet-${idx + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      material: s.materialName,
      calculationType: 'sheet',
      grade: s.grade || '304',
      length: '',
      width: isCovering ? '' : '',
      height: isCovering ? '' : undefined,
      depth: hasDepth ? '' : undefined,
      hasDepth: hasDepth,
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
    pipeGauge: p.pipeGauge || '16G',
    pipeSize: p.pipeSize || '40 × 40 mm',
    length: '',
    unit: 'ft',
    quantity: '',
    isRepeatable: Boolean(p.isRepeatable)
  }));

  const angles = (rawCfg.angles || []).map((a, idx) => ({
    id: `angle-${idx + 1}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    material: a.materialName || 'MS Angle',
    calculationType: 'angle',
    grade: a.grade || 'MS',
    gauge: a.gauge || '25 × 3 mm',
    length: '',
    unit: 'ft',
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
      gaugeOptions: s.gaugeOptions || null,
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
      gauge: p.pipeGauge || '16G',
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

// Backward-compatible and helper exports
export const STANDARD_GAUGES = SHEET_GAUGE_OPTIONS;
export const STANDARD_GAUGE_WEIGHTS = GAUGE_WEIGHTS_32SQFT;
export const STAINLESS_STEEL_GRADES = SHEET_GRADES;

// Company details for headers, quotation bills, and sidebar (Section 35)
export const COMPANY_DETAILS = {
  name: 'SHREE BALAJI ENTERPRISES',
  tagline: 'Commercial/Hotel Kitchen Equipment Manufacturer',
  subtitle: 'Canteen Equipment • Display Counters • Refrigeration • Exhaust Ventilation',
  phones: ['+91 9604386808', '+91 9422541505', '+91 9011127134'],
  officePhone: '+91 9604597979',
  email: 'balajishree46@gmail.com',
  address: 'Sr. No - 2/1 Mangde Wadi - Katraj, Pune Satara Road, Near Indian Oil Petrol Pump, Katraj, Pune - 411046'
};

// Default Quotation Terms & Conditions
export const DEFAULT_TERMS_AND_CONDITIONS = [
  { label: 'Payment Terms', value: '50% advance along with purchase order and balance 50% before dispatch.' },
  { label: 'Delivery', value: 'Within 7 to 10 working days from the date of confirmed order with advance.' },
  { label: 'Taxes', value: 'GST will be charged extra as applicable at the time of invoicing.' },
  { label: 'Transportation', value: 'Transportation and freight charges will be paid by the customer/buyer.' },
  { label: 'Validity', value: 'This quotation is valid for 15 days from the date of issuance.' }
];
