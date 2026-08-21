/**
 * Shree Balaji Enterprises — 3D Pipe Structural Framework Generator
 * Procedural pipe components created strictly when active in Material Specification.
 * Attaches userData metadata to meshes for interactive click inspection.
 */

import * as THREE from 'three';
import { createPanelWithEdges } from './Sheet3DComponent';

/**
 * Procedural Leg Pipes Structure
 * Renders ONLY the exact number of leg pipes configured with physical height = legHeight.
 */
export function createLegPipesComponent({
  length = 48,
  width = 30,
  legHeight = 34,
  quantity = 4,
  pipeSize = 1.5,
  isRound = false,
  hasWheels = false,
  meta = {},
  materials
}) {
  const group = new THREE.Group();
  group.name = 'component_leg_pipes';

  const halfL = length / 2;
  const halfW = width / 2;
  const inset = pipeSize / 2 + 0.5;
  const actualLegHeight = Math.max(1, legHeight - 1.5);
  const posY = actualLegHeight / 2;

  let legPositions = [];

  const q = parseInt(quantity) || 4;

  if (q === 1) {
    legPositions = [{ x: 0, z: 0 }];
  } else if (q === 2) {
    legPositions = [
      { x: -halfL + inset, z: 0 },
      { x: halfL - inset, z: 0 },
    ];
  } else if (q === 3) {
    legPositions = [
      { x: -halfL + inset, z: -halfW + inset },
      { x: halfL - inset, z: -halfW + inset },
      { x: 0, z: halfW - inset },
    ];
  } else {
    // Standard 4 corner legs
    legPositions = [
      { x: -halfL + inset, z: -halfW + inset },
      { x: halfL - inset, z: -halfW + inset },
      { x: -halfL + inset, z: halfW - inset },
      { x: halfL - inset, z: halfW - inset },
    ];

    // If length > 66" and quantity >= 6, add 2 center legs
    if (length > 66 && q >= 6) {
      legPositions.push(
        { x: 0, z: -halfW + inset },
        { x: 0, z: halfW - inset }
      );
    }
  }

  legPositions.forEach((pos, idx) => {
    // 1. Vertical Leg Pipe
    let legGeo;
    if (isRound) {
      legGeo = new THREE.CylinderGeometry(pipeSize / 2, pipeSize / 2, actualLegHeight, 16);
    } else {
      legGeo = new THREE.BoxGeometry(pipeSize, actualLegHeight, pipeSize);
    }
    const legMesh = createPanelWithEdges(legGeo, materials.pipeMaterial, materials.edgeLineMaterial, {
      ...meta,
      name: `${meta.material || 'Leg Pipe'} #${idx + 1}`,
      type: 'Pipe Material'
    });
    legMesh.position.set(pos.x, posY, pos.z);
    group.add(legMesh);

    // 2. Foot Bush (Bullet Bush or Nylon Base) OR Caster Wheel
    if (hasWheels) {
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(pos.x, 1.5, pos.z);

      const bracketGeo = new THREE.BoxGeometry(pipeSize * 1.2, 1.0, pipeSize * 1.2);
      const bracketMesh = new THREE.Mesh(bracketGeo, materials.ssMaterial);
      bracketMesh.userData = { name: 'Wheel Bracket', type: 'Purchased Item' };
      wheelGroup.add(bracketMesh);

      const tireGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.8, 16);
      const tireMesh = new THREE.Mesh(tireGeo, materials.bushMaterial);
      tireMesh.rotation.z = Math.PI / 2;
      tireMesh.position.set(0, -1.0, 0);
      tireMesh.userData = { name: 'Caster Wheel', type: 'Purchased Item' };
      wheelGroup.add(tireMesh);

      group.add(wheelGroup);
    } else {
      const bushGeo = new THREE.CylinderGeometry(pipeSize * 0.55, pipeSize * 0.45, 1.2, 16);
      const bushMesh = new THREE.Mesh(bushGeo, materials.bushMaterial);
      bushMesh.position.set(pos.x, 0.6, pos.z);
      bushMesh.userData = { name: 'Nylon Bush', type: 'Purchased Item' };
      group.add(bushMesh);
    }
  });

  return group;
}

/**
 * Procedural Horizontal Perimeter Support Pipes (Top Support / Shelf Support / Under Support)
 */
export function createHorizontalFramePipes({
  length = 48,
  width = 30,
  elevationY = 32,
  pipeSize = 1.2,
  isRound = false,
  quantity = 4,
  meta = {},
  materials
}) {
  const group = new THREE.Group();
  group.name = `component_frame_pipes_${Math.round(elevationY)}`;

  const halfL = length / 2;
  const halfW = width / 2;
  const inset = pipeSize / 2 + 0.5;

  const spanX = Math.max(1, length - inset * 2);
  const spanZ = Math.max(1, width - inset * 2);

  const q = parseInt(quantity) || 4;

  // Front and Back Longitudinal Rails (X-axis)
  if (q >= 2) {
    [-halfW + inset, halfW - inset].forEach((z, idx) => {
      let railGeo;
      if (isRound) {
        railGeo = new THREE.CylinderGeometry(pipeSize / 2, pipeSize / 2, spanX, 16);
      } else {
        railGeo = new THREE.BoxGeometry(spanX, pipeSize, pipeSize);
      }
      const railMesh = createPanelWithEdges(railGeo, materials.pipeMaterial, materials.edgeLineMaterial, {
        ...meta,
        name: `${meta.material || 'Support Rail'} (Longitudinal #${idx + 1})`,
        type: 'Pipe Material'
      });
      if (isRound) railMesh.rotation.z = Math.PI / 2;
      railMesh.position.set(0, elevationY, z);
      group.add(railMesh);
    });
  } else if (q === 1) {
    let railGeo = isRound ? new THREE.CylinderGeometry(pipeSize / 2, pipeSize / 2, spanX, 16) : new THREE.BoxGeometry(spanX, pipeSize, pipeSize);
    const railMesh = createPanelWithEdges(railGeo, materials.pipeMaterial, materials.edgeLineMaterial, {
      ...meta,
      name: `${meta.material || 'Support Rail'} (Longitudinal)`,
      type: 'Pipe Material'
    });
    if (isRound) railMesh.rotation.z = Math.PI / 2;
    railMesh.position.set(0, elevationY, 0);
    group.add(railMesh);
  }

  // Cross Braces (Z-axis) if quantity >= 4
  if (q >= 4) {
    [-halfL + inset, halfL - inset].forEach((x, idx) => {
      let braceGeo;
      if (isRound) {
        braceGeo = new THREE.CylinderGeometry(pipeSize / 2, pipeSize / 2, spanZ, 16);
      } else {
        braceGeo = new THREE.BoxGeometry(pipeSize, pipeSize, spanZ);
      }
      const braceMesh = createPanelWithEdges(braceGeo, materials.pipeMaterial, materials.edgeLineMaterial, {
        ...meta,
        name: `${meta.material || 'Support Rail'} (Cross Brace #${idx + 1})`,
        type: 'Pipe Material'
      });
      if (isRound) braceMesh.rotation.x = Math.PI / 2;
      braceMesh.position.set(x, elevationY, 0);
      group.add(braceMesh);
    });
  }

  return group;
}

/**
 * Procedural Center Spine Pipe (For Dining Tables, Pot Racks, Benches)
 */
export function createCenterSpinePipe({
  length = 48,
  elevationY = 16,
  pipeSize = 1.5,
  isRound = false,
  meta = {},
  materials
}) {
  const spanX = Math.max(1, length - 4.0);
  let spineGeo;
  if (isRound) {
    spineGeo = new THREE.CylinderGeometry(pipeSize / 2, pipeSize / 2, spanX, 16);
  } else {
    spineGeo = new THREE.BoxGeometry(spanX, pipeSize, pipeSize);
  }
  const spineMesh = createPanelWithEdges(spineGeo, materials.pipeMaterial, materials.edgeLineMaterial, {
    ...meta,
    name: meta.material || 'Center Spine Pipe',
    type: 'Pipe Material'
  });
  if (isRound) spineMesh.rotation.z = Math.PI / 2;
  spineMesh.position.set(0, elevationY, 0);
  spineMesh.name = 'component_center_spine_pipe';
  return spineMesh;
}

/**
 * Procedural Overhead Upright Support Posts and Overhead Shelf Frame
 */
export function createOverheadPipeStructure({
  length = 48,
  width = 30,
  counterHeight = 34,
  overheadHeight = 18,
  pipeSize = 1.2,
  isRound = false,
  shelfRow = null,
  meta = {},
  materials
}) {
  const group = new THREE.Group();
  group.name = 'component_overhead_pipe_structure';

  const halfL = length / 2;
  const halfW = width / 2;
  const inset = pipeSize / 2 + 0.5;

  const totalPostHeight = overheadHeight + 4.0;
  const postCenterY = counterHeight + totalPostHeight / 2;
  const postZ = -halfW + inset;

  // 2 Rear Upright Posts
  [-halfL + inset, halfL - inset].forEach((x, idx) => {
    let postGeo;
    if (isRound) {
      postGeo = new THREE.CylinderGeometry(pipeSize / 2, pipeSize / 2, totalPostHeight, 16);
    } else {
      postGeo = new THREE.BoxGeometry(pipeSize, totalPostHeight, pipeSize);
    }
    const postMesh = createPanelWithEdges(postGeo, materials.pipeMaterial, materials.edgeLineMaterial, {
      ...meta,
      name: `Overhead Upright Post #${idx + 1}`,
      type: 'Pipe Material'
    });
    postMesh.position.set(x, postCenterY, postZ);
    group.add(postMesh);
  });

  // Overhead SS Shelf Panel (if shelf row is present)
  if (shelfRow) {
    const sLen = parseFloat(shelfRow.length) || length;
    const sWid = parseFloat(shelfRow.width) || Math.max(8, width * 0.5);
    const shelfY = counterHeight + overheadHeight;
    const shelfGeo = new THREE.BoxGeometry(sLen, 0.8, sWid);
    const shelfMesh = createPanelWithEdges(shelfGeo, materials.ssBrushedMaterial, materials.edgeLineMaterial, {
      ...shelfRow,
      name: shelfRow.material || 'Overhead Shelf',
      type: 'Sheet Material'
    });
    shelfMesh.position.set(0, shelfY, -halfW + sWid / 2);
    group.add(shelfMesh);
  }

  return group;
}

/**
 * Procedural Burners & Pan Supports (Gas Range & Dosa Bhatti)
 */
export function createBurnersEquipmentComponent({
  length = 48,
  width = 30,
  height = 34,
  burnerCount = 2,
  isDosa = false,
  meta = {},
  materials
}) {
  const group = new THREE.Group();
  group.name = 'component_burners_equipment';

  const halfL = length / 2;
  const posY = height + 0.6;

  if (isDosa) {
    const plateLength = length - 6;
    const plateWidth = width - 6;
    const plateThickness = 0.8;
    const plateGeo = new THREE.BoxGeometry(plateLength, plateThickness, plateWidth);
    const plateMesh = createPanelWithEdges(plateGeo, materials.darkMetalMaterial, materials.edgeLineMaterial, {
      ...meta,
      name: meta.material || 'Dosa MS Hot Plate',
      type: 'Purchased Item'
    });
    plateMesh.position.set(0, height + plateThickness / 2, 0);
    group.add(plateMesh);
    return group;
  }

  const count = Math.max(1, parseInt(burnerCount) || 2);
  const gap = length / (count + 1);
  for (let i = 1; i <= count; i++) {
    const burnerX = -halfL + i * gap;

    const grateSize = Math.min(14, width * 0.65);
    const grateGeo = new THREE.BoxGeometry(grateSize, 0.8, grateSize);
    const grateMesh = new THREE.Mesh(grateGeo, materials.darkMetalMaterial);
    grateMesh.userData = {
      ...meta,
      name: `Cast Iron Burner Grate #${i}`,
      type: 'Purchased Item'
    };
    grateMesh.position.set(burnerX, posY, 0);
    group.add(grateMesh);

    const burnerHeadGeo = new THREE.CylinderGeometry(2.5, 2.8, 1.0, 16);
    const burnerHeadMesh = new THREE.Mesh(burnerHeadGeo, materials.darkMetalMaterial);
    burnerHeadMesh.userData = {
      ...meta,
      name: `Burner Head #${i}`,
      type: 'Purchased Item'
    };
    burnerHeadMesh.position.set(burnerX, posY + 0.4, 0);
    group.add(burnerHeadMesh);
  }

  return group;
}
