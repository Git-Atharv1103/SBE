/**
 * Shree Balaji Enterprises — 3D Counter Designer Configuration & Data Mapping
 * Parametric CAD-style visualization adapter for Material Specification state.
 */

import * as THREE from 'three';

// Professional ERP Material Shaders
export const MATERIAL_THEMES = {
  stainlessSteel: {
    color: 0xdce3eb,
    metalness: 0.88,
    roughness: 0.22,
  },
  pipeSteel: {
    color: 0x8898aa,
    metalness: 0.82,
    roughness: 0.32,
  },
  msDarkMetal: {
    color: 0x334155,
    metalness: 0.5,
    roughness: 0.75,
  },
  glass: {
    color: 0xc8f0ff,
    transparent: true,
    opacity: 0.45,
    roughness: 0.08,
    metalness: 0.1,
  },
  wood: {
    color: 0xb57c48,
    metalness: 0.05,
    roughness: 0.85,
  },
  bushNylon: {
    color: 0x1e293b,
    metalness: 0.15,
    roughness: 0.9,
  },
  dimLine: {
    color: 0x0284c7,
  },
  selectedHighlight: {
    color: 0x06b6d4,
    emissive: 0x0891b2,
    emissiveIntensity: 0.45,
    metalness: 0.85,
    roughness: 0.2,
  }
};

/**
 * Creates reusable Three.js materials cache
 */
export function createMaterialLibrary() {
  return {
    ssMaterial: new THREE.MeshStandardMaterial({
      color: MATERIAL_THEMES.stainlessSteel.color,
      metalness: MATERIAL_THEMES.stainlessSteel.metalness,
      roughness: MATERIAL_THEMES.stainlessSteel.roughness,
    }),
    ssBrushedMaterial: new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.92,
      roughness: 0.18,
    }),
    pipeMaterial: new THREE.MeshStandardMaterial({
      color: MATERIAL_THEMES.pipeSteel.color,
      metalness: MATERIAL_THEMES.pipeSteel.metalness,
      roughness: MATERIAL_THEMES.pipeSteel.roughness,
    }),
    darkMetalMaterial: new THREE.MeshStandardMaterial({
      color: MATERIAL_THEMES.msDarkMetal.color,
      metalness: MATERIAL_THEMES.msDarkMetal.metalness,
      roughness: MATERIAL_THEMES.msDarkMetal.roughness,
    }),
    glassMaterial: new THREE.MeshStandardMaterial({
      color: MATERIAL_THEMES.glass.color,
      transparent: true,
      opacity: MATERIAL_THEMES.glass.opacity,
      roughness: MATERIAL_THEMES.glass.roughness,
      metalness: MATERIAL_THEMES.glass.metalness,
    }),
    woodMaterial: new THREE.MeshStandardMaterial({
      color: MATERIAL_THEMES.wood.color,
      metalness: MATERIAL_THEMES.wood.metalness,
      roughness: MATERIAL_THEMES.wood.roughness,
    }),
    bushMaterial: new THREE.MeshStandardMaterial({
      color: MATERIAL_THEMES.bushNylon.color,
      metalness: MATERIAL_THEMES.bushNylon.metalness,
      roughness: MATERIAL_THEMES.bushNylon.roughness,
    }),
    edgeLineMaterial: new THREE.LineBasicMaterial({
      color: 0x94a3b8,
      transparent: true,
      opacity: 0.45,
    }),
    dimLineMaterial: new THREE.LineBasicMaterial({
      color: MATERIAL_THEMES.dimLine.color,
      linewidth: 2,
    }),
    selectedHighlightMaterial: new THREE.MeshStandardMaterial({
      color: MATERIAL_THEMES.selectedHighlight.color,
      emissive: MATERIAL_THEMES.selectedHighlight.emissive,
      emissiveIntensity: MATERIAL_THEMES.selectedHighlight.emissiveIntensity,
      metalness: MATERIAL_THEMES.selectedHighlight.metalness,
      roughness: MATERIAL_THEMES.selectedHighlight.roughness,
    })
  };
}

/**
 * Normalize dimensions from any unit (in, ft, mm) to 3D internal inches (1 unit = 1 inch)
 */
export function normalizeToInches(value, unit = 'in') {
  const num = parseFloat(value);
  if (isNaN(num) || num <= 0) return 0;

  switch (String(unit).toLowerCase()) {
    case 'ft':
    case 'feet':
      return num * 12;
    case 'mm':
    case 'millimeter':
      return num / 25.4;
    case 'in':
    case 'inch':
    case 'inches':
    default:
      return num;
  }
}

/**
 * Format internal inches into target display unit string
 */
export function formatFromInches(inchesVal, unit = 'in') {
  const num = parseFloat(inchesVal);
  if (isNaN(num) || num <= 0) return '0';

  switch (String(unit).toLowerCase()) {
    case 'ft':
      return (num / 12).toFixed(2);
    case 'mm':
      return (num * 25.4).toFixed(1);
    case 'in':
    default:
      return Number.isInteger(num) ? num.toString() : num.toFixed(1);
  }
}

/**
 * Convert sheet gauge (mm) to scaled visual thickness (inches)
 */
export function getVisualSheetThickness(gauge) {
  const g = parseFloat(gauge);
  if (isNaN(g) || g <= 0) return 0.25;
  return Math.max(0.18, Math.min(0.45, 0.15 + g * 0.07));
}

/**
 * Parse Pipe Gauge into dimensions (inches) and profile (square vs round)
 */
export function parsePipeGauge(pipeGaugeStr = '') {
  const str = String(pipeGaugeStr || '').toLowerCase().trim();
  let size = 1.5;
  let isRound = false;

  if (str.includes('round') || str.includes('ø') || str.includes('circ')) {
    isRound = true;
  }

  if (str.includes('1"') || str.includes('25') || str.includes('sq-1in') || str.includes('circ-25')) {
    size = 1.0;
  } else if (str.includes('1.25') || str.includes('32') || str.includes('sq-1-25in') || str.includes('circ-32')) {
    size = 1.25;
  } else if (str.includes('1.5') || str.includes('38') || str.includes('40') || str.includes('sq-1-5in') || str.includes('circ-38')) {
    size = 1.5;
  } else if (str.includes('2"') || str.includes('50') || str.includes('sq-2in') || str.includes('circ-50')) {
    size = 2.0;
  }

  return { size, isRound };
}

/**
 * Filter ONLY rows that have actual user-entered values in Material Specification
 */
export function getActiveSpecificationRows({ sheets = [], pipes = [], angles = [], purchased = [], compressor = [] }) {
  const activeSheets = (sheets || []).filter(s => {
    const l = parseFloat(s.length);
    return !isNaN(l) && l > 0;
  });

  const activePipes = (pipes || []).filter(p => {
    const l = parseFloat(p.length);
    return !isNaN(l) && l > 0;
  });

  const activeAngles = (angles || []).filter(a => {
    const l = parseFloat(a.length);
    return !isNaN(l) && l > 0;
  });

  const activePurchased = (purchased || []).filter(p => {
    const q = parseFloat(p.quantity);
    return !isNaN(q) && q > 0;
  });

  const activeCompressor = (compressor || []).filter(c => {
    const q = parseFloat(c.quantity);
    return !isNaN(q) && q > 0;
  });

  const totalActiveCount = activeSheets.length + activePipes.length + activeAngles.length + activePurchased.length + activeCompressor.length;

  return {
    activeSheets,
    activePipes,
    activeAngles,
    activePurchased,
    activeCompressor,
    totalActiveCount,
    hasAnyActiveComponent: totalActiveCount > 0,
  };
}

/**
 * Classify active specification rows into structural 3D components
 */
export function classifyActiveComponents({ activeSheets = [], activePipes = [], activePurchased = [] }) {
  const getSheets = (term) => activeSheets.filter(s => (s.material || '').toLowerCase().includes(term.toLowerCase()));
  const getPipes = (term) => activePipes.filter(p => (p.material || '').toLowerCase().includes(term.toLowerCase()));
  const getPurchased = (term) => activePurchased.filter(p => (p.material || '').toLowerCase().includes(term.toLowerCase()));

  // Top Sheet
  const topRows = getSheets('top').concat(getSheets('table top')).concat(activeSheets.filter(s => (s.material || '').toLowerCase() === 'sheet'));
  const topRow = topRows[0] || null;

  // Shelves
  const underShelfRows = getSheets('under shelf').concat(getSheets('bottom')).concat(getSheets('base'));
  const overheadShelfRows = getSheets('overhead shelf');
  const genericShelfRows = getSheets('shelf').filter(s => !underShelfRows.includes(s) && !overheadShelfRows.includes(s));

  // Panels
  const sidePanelRows = getSheets('side covering').concat(getSheets('right')).concat(getSheets('left')).concat(getSheets('panel')).filter(s => !topRows.includes(s) && !underShelfRows.includes(s));
  const frontPanelRows = getSheets('front covering').concat(getSheets('apron'));
  const backPanelRows = getSheets('back support').concat(getSheets('back side covering')).concat(getSheets('back covering'));
  const partitionRows = getSheets('partition').concat(getSheets('internal partition'));
  const roofRows = getSheets('roof');

  // Doors & Drawers
  const doorRows = getSheets('door').concat(getSheets('top door')).concat(getSheets('panel front door'));
  const drawerRows = getSheets('drawer');

  // Pipes (Strictly using Pipe Gauge, NEVER Pipe Length as height!)
  const legPipeRows = getPipes('leg');
  const topSupportPipeRows = getPipes('top support');
  const shelfSupportPipeRows = getPipes('shelf support');
  const underSupportPipeRows = getPipes('under support');
  const framePipeRows = getPipes('frame');
  const centerPipeRows = getPipes('center');
  const stoolSupportPipeRows = getPipes('stool');
  const handlePipeRows = getPipes('handel').concat(getPipes('handle'));

  // Purchased & Equipment
  const sinkBowlRows = getSheets('sink bowl');
  const burnerRows = getPurchased('burner');
  const dosaPlateRows = getPurchased('ms plate').concat(getPurchased('dosa burner'));
  const wheelRows = getPurchased('wheel');
  const glassRows = getPurchased('glass');
  const woodRows = getPurchased('wood').concat(getPurchased('ply'));
  const tandoorPotRows = getPurchased('kumbhar').concat(getPurchased('tandoor'));

  return {
    topRow,
    hasTop: Boolean(topRow),
    underShelfRows,
    overheadShelfRows,
    genericShelfRows,
    hasShelves: underShelfRows.length > 0 || genericShelfRows.length > 0,
    hasOverheadShelf: overheadShelfRows.length > 0,
    sidePanelRows,
    frontPanelRows,
    backPanelRows,
    partitionRows,
    roofRows,
    doorRows,
    drawerRows,
    legPipeRows,
    hasLegs: legPipeRows.length > 0,
    topSupportPipeRows,
    shelfSupportPipeRows,
    underSupportPipeRows,
    framePipeRows,
    centerPipeRows,
    stoolSupportPipeRows,
    handlePipeRows,
    sinkBowlRows,
    burnerRows,
    dosaPlateRows,
    wheelRows,
    glassRows,
    woodRows,
    tandoorPotRows,
  };
}
