/**
 * Shree Balaji Enterprises — Central Constants & Master Configuration
 * Single source of truth for Stainless Steel Fabrication Master data.
 */

export const COMPANY_DETAILS = {
  name: 'Shree Balaji Enterprises',
  description: 'Commercial/Hotel Kitchen Equipment, Canteen Kitchen Equipment, Refrigeration Equipments, Fastfood/Display Counter, Exhaust Ventilation System, Food Processing Machine, Commercial Dishwasher',
  website: 'http://www.shreebalajikitchenequipment.com/',
};

export const STAINLESS_STEEL_GRADES = ['SS304', 'SS316'];

// Default GST rate in percent (%)
export const DEFAULT_GST_PERCENT = 18;

// Standard Sheet Gauges & Workshop Weight Map (kg per square foot)
// Formula: Area (sq.ft) = (Length_in × Width_in) / 144
// Weight (kg) = Area × WeightPerSqFt × Quantity
export const STANDARD_GAUGE_WEIGHTS = {
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
  { label: '0.8 mm', value: 0.8, weightPerSqFt: 0.650 },
  { label: '1.0 mm', value: 1.0, weightPerSqFt: 0.812 },
  { label: '1.2 mm', value: 1.2, weightPerSqFt: 1.000 },
  { label: '1.5 mm', value: 1.5, weightPerSqFt: 1.200 },
  { label: '2.0 mm', value: 2.0, weightPerSqFt: 1.620 },
  { label: '2.5 mm', value: 2.5, weightPerSqFt: 2.025 },
  { label: '3.0 mm', value: 3.0, weightPerSqFt: 2.430 },
  { label: '4.0 mm', value: 4.0, weightPerSqFt: 3.240 }
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
  // Linear approximation based on standard 1.0mm = 0.812 kg/sq.ft
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
 * Get weight per foot for a given pipe size
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

// Master Purchased Hardware Items with default unit weights in kg
export const PURCHASED_ITEMS_MASTER = [
  { id: 'bush', name: 'Bush', defaultUnitWeight: '' },
  { id: 'bullet-feet', name: 'Bush/Bullet Feet', defaultUnitWeight: '' },
  { id: 'drain-outlet', name: 'Drain Outlet / Waste Coupling', defaultUnitWeight: '' },
  { id: 'round-garbage-shute', name: 'Round Garbage Shute', defaultUnitWeight: '' },
  { id: 'ms-frame', name: 'MS Frame', defaultUnitWeight: '' },
  { id: 'burner', name: 'Burner', defaultUnitWeight: '' },
  { id: 'pan-support', name: 'PAN Support Casting', defaultUnitWeight: '' },
  { id: 'gas-manifold', name: 'Gas Manifold', defaultUnitWeight: '' },
  { id: 'ncv', name: 'NCV', defaultUnitWeight: '' },
  { id: 'handle', name: 'Handle', defaultUnitWeight: '' },
  { id: 'hinges', name: 'Hinges', defaultUnitWeight: '' },
  { id: 'lock', name: 'Lock', defaultUnitWeight: '' },
  { id: 'wheel', name: 'Wheel / Castor', defaultUnitWeight: '' },
  { id: 'glasswool-insulation', name: 'Glasswool Insulation', defaultUnitWeight: '' },
  { id: 'glass-front', name: 'Glass Front', defaultUnitWeight: '' },
  { id: 'glass-side-lh', name: 'Glass Side LH', defaultUnitWeight: '' },
  { id: 'glass-side-rh', name: 'Glass Side RH', defaultUnitWeight: '' },
  { id: 'bain-marie', name: 'Bain Marie', defaultUnitWeight: '' },
  { id: 'heating-coil', name: 'Heating Coil', defaultUnitWeight: '' },
  { id: 'thermostat', name: 'Thermostat', defaultUnitWeight: '' },
  { id: 'switch-box', name: 'Switch Box', defaultUnitWeight: '' }
];

// The 11 standard commercial fabrication counter types
export const COUNTER_TYPES = [
  'Stainless Steel Kitchen',
  'Sink Unit',
  'Sink Unit With Table',
  'Soiled Dish Table',
  'Gas Range',
  'Dosa Bhatti',
  'Chapati Puffer Plate',
  'Pick Up Counter',
  'SS Tandoor',
  'Counters',
  'Dish Rack'
];

export const counterTypeOptions = COUNTER_TYPES;

// Master structural definitions without hardcoded project dimensions or quantities
export const COUNTER_TYPE_TEMPLATES = {
  'Stainless Steel Kitchen': {
    sheets: [
      { id: 'ssk-s1', material: 'Top', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'ssk-s2', material: 'U/S Shelf 1', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'ssk-s3', material: 'U/S Shelf 2', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' }
    ],
    pipes: [
      { id: 'ssk-p1', material: 'Leg Pipe', calculationType: 'pipe', grade: 'SS304', pipeSize: '', length: '', quantity: '' }
    ],
    purchased: [
      { id: 'ssk-pur1', material: 'Bush', calculationType: 'purchased', quantity: '', unitWeight: '' }
    ]
  },

  'Sink Unit': {
    sheets: [
      { id: 'su-s1', material: 'Top', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'su-s2', material: 'Sink Bowl', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'su-s3', material: 'U/S Shelf', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'su-s4', material: 'Side Covering', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' }
    ],
    pipes: [
      { id: 'su-p1', material: 'Leg Pipe', calculationType: 'pipe', grade: 'SS304', pipeSize: '', length: '', quantity: '' }
    ],
    purchased: [
      { id: 'su-pur1', material: 'Bush', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'su-pur2', material: 'Drain Outlet / Waste Coupling', calculationType: 'purchased', quantity: '', unitWeight: '' }
    ]
  },

  'Sink Unit With Table': {
    sheets: [
      { id: 'sut-s1', material: 'Top', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'sut-s2', material: 'Sink Bowl', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'sut-s3', material: 'Table Top', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'sut-s4', material: 'U/S Shelf', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'sut-s5', material: 'Side Covering', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' }
    ],
    pipes: [
      { id: 'sut-p1', material: 'Leg Pipe', calculationType: 'pipe', grade: 'SS304', pipeSize: '', length: '', quantity: '' }
    ],
    purchased: [
      { id: 'sut-pur1', material: 'Bush', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'sut-pur2', material: 'Drain Outlet / Waste Coupling', calculationType: 'purchased', quantity: '', unitWeight: '' }
    ]
  },

  'Soiled Dish Table': {
    sheets: [
      { id: 'sdt-s1', material: 'Top', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'sdt-s2', material: 'Side Covering', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' }
    ],
    pipes: [
      { id: 'sdt-p1', material: 'Leg Pipe', calculationType: 'pipe', grade: 'SS304', pipeSize: '', length: '', quantity: '' }
    ],
    purchased: [
      { id: 'sdt-pur1', material: 'Bush', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'sdt-pur2', material: 'Round Garbage Shute', calculationType: 'purchased', quantity: '', unitWeight: '' }
    ]
  },

  'Gas Range': {
    sheets: [
      { id: 'gr-s1', material: 'Top', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'gr-s2', material: 'Drip Tray', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'gr-s3', material: 'U/S Shelf', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'gr-s4', material: 'Side Covering', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' }
    ],
    pipes: [
      { id: 'gr-p1', material: 'Leg Pipe', calculationType: 'pipe', grade: 'SS304', pipeSize: '', length: '', quantity: '' },
      { id: 'gr-p2', material: 'Copper Pipe', calculationType: 'pipe', grade: 'SS304', pipeSize: '', length: '', quantity: '' }
    ],
    purchased: [
      { id: 'gr-pur1', material: 'MS Frame', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'gr-pur2', material: 'Burner', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'gr-pur3', material: 'PAN Support Casting', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'gr-pur4', material: 'Bush', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'gr-pur5', material: 'Gas Manifold', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'gr-pur6', material: 'NCV', calculationType: 'purchased', quantity: '', unitWeight: '' }
    ]
  },

  'Dosa Bhatti': {
    sheets: [
      { id: 'db-s1', material: 'MS Plate', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'db-s2', material: 'SS Top', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'db-s3', material: 'U/S Shelf', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'db-s4', material: 'Side Covering', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' }
    ],
    pipes: [
      { id: 'db-p1', material: 'Leg Pipe', calculationType: 'pipe', grade: 'SS304', pipeSize: '', length: '', quantity: '' },
      { id: 'db-p2', material: 'Copper Pipe', calculationType: 'pipe', grade: 'SS304', pipeSize: '', length: '', quantity: '' }
    ],
    purchased: [
      { id: 'db-pur1', material: 'MS Frame', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'db-pur2', material: 'Burner', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'db-pur3', material: 'Bush', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'db-pur4', material: 'Gas Manifold', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'db-pur5', material: 'NCV', calculationType: 'purchased', quantity: '', unitWeight: '' }
    ]
  },

  'Chapati Puffer Plate': {
    sheets: [
      { id: 'cpp-s1', material: 'Puffer Plate', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'cpp-s2', material: 'MS Plate', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'cpp-s3', material: 'SS Top', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'cpp-s4', material: 'U/S Shelf', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'cpp-s5', material: 'Side Covering', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' }
    ],
    pipes: [
      { id: 'cpp-p1', material: 'Leg Pipe', calculationType: 'pipe', grade: 'SS304', pipeSize: '', length: '', quantity: '' },
      { id: 'cpp-p2', material: 'Copper Pipe', calculationType: 'pipe', grade: 'SS304', pipeSize: '', length: '', quantity: '' }
    ],
    purchased: [
      { id: 'cpp-pur1', material: 'MS Frame', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'cpp-pur2', material: 'Burner', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'cpp-pur3', material: 'Bush', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'cpp-pur4', material: 'Gas Manifold', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'cpp-pur5', material: 'NCV', calculationType: 'purchased', quantity: '', unitWeight: '' }
    ]
  },

  'Pick Up Counter': {
    sheets: [
      { id: 'puc-s1', material: 'Top', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'puc-s2', material: 'O/H Shelf', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'puc-s3', material: 'U/S Shelf', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'puc-s4', material: 'Door', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'puc-s5', material: '3 Side Covering', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' }
    ],
    pipes: [
      { id: 'puc-p1', material: 'Leg Pipe', calculationType: 'pipe', grade: 'SS304', pipeSize: '', length: '', quantity: '' }
    ],
    purchased: [
      { id: 'puc-pur1', material: 'Bush', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'puc-pur2', material: 'Handle', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'puc-pur3', material: 'Hinges', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'puc-pur4', material: 'Lock', calculationType: 'purchased', quantity: '', unitWeight: '' }
    ]
  },

  'SS Tandoor': {
    sheets: [
      { id: 'sst-s1', material: 'SS Covering', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'sst-s2', material: 'Inner MS Covering', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' }
    ],
    pipes: [],
    purchased: [
      { id: 'sst-pur1', material: 'SS Frame', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'sst-pur2', material: 'Glasswool Insulation', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'sst-pur3', material: 'Handle', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'sst-pur4', material: 'Wheel', calculationType: 'purchased', quantity: '', unitWeight: '' }
    ]
  },

  'Counters': {
    sheets: [
      { id: 'cnt-s1', material: 'Top', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'cnt-s2', material: 'SS Box', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'cnt-s3', material: 'Display Shelf', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'cnt-s4', material: 'O/H Shelf', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'cnt-s5', material: 'U/S Shelf', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'cnt-s6', material: 'Door', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'cnt-s7', material: 'Drawer', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'cnt-s8', material: 'Roof', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'cnt-s9', material: 'Partition', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'cnt-s10', material: 'Side Covering', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' }
    ],
    pipes: [
      { id: 'cnt-p1', material: 'Leg Pipe', calculationType: 'pipe', grade: 'SS304', pipeSize: '', length: '', quantity: '' }
    ],
    purchased: [
      { id: 'cnt-pur1', material: 'Glass Front', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'cnt-pur2', material: 'Glass Side LH', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'cnt-pur3', material: 'Glass Side RH', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'cnt-pur4', material: 'Bain Marie', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'cnt-pur5', material: 'Heating Coil', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'cnt-pur6', material: 'Thermostat', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'cnt-pur7', material: 'Switch Box', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'cnt-pur8', material: 'Wheel/Castor', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'cnt-pur9', material: 'Bush', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'cnt-pur10', material: 'Handle', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'cnt-pur11', material: 'Hinges', calculationType: 'purchased', quantity: '', unitWeight: '' },
      { id: 'cnt-pur12', material: 'Lock', calculationType: 'purchased', quantity: '', unitWeight: '' }
    ]
  },

  'Dish Rack': {
    sheets: [
      { id: 'dr-s1', material: 'Top Shelf', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' },
      { id: 'dr-s2', material: 'Shelf 1', calculationType: 'sheet', grade: 'SS304', length: '', width: '', gauge: '', quantity: '', unit: 'inch' }
    ],
    pipes: [
      { id: 'dr-p1', material: 'Leg Pipe', calculationType: 'pipe', grade: 'SS304', pipeSize: '', length: '', quantity: '' }
    ],
    purchased: [
      { id: 'dr-pur1', material: 'Bush/Bullet Feet', calculationType: 'purchased', quantity: '', unitWeight: '' }
    ]
  }
};
