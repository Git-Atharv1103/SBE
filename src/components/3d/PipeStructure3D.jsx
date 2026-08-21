/**
 * Shree Balaji Enterprises — 3D Pipe Structural Framework Generator
 * Procedural pipe fabrication objects (Legs, Perimeter Frames, Tie Braces, Bushes, Wheels, Overhead Posts)
 */

import * as THREE from 'three';
import { createPanelWithEdges } from './SheetPanel3D';

/**
 * Creates a single pipe segment (square or circular)
 */
export function createPipeSegment({
  length,
  size = 1.5,
  isRound = false,
  orientation = 'Y', // 'X', 'Y', 'Z'
  materials
}) {
  let geo;
  if (isRound) {
    geo = new THREE.CylinderGeometry(size / 2, size / 2, length, 16);
  } else {
    geo = new THREE.BoxGeometry(size, length, size);
  }

  const mesh = createPanelWithEdges(geo, materials.pipeMaterial, materials.edgeLineMaterial);

  if (orientation === 'X') {
    mesh.rotation.z = Math.PI / 2;
  } else if (orientation === 'Z') {
    mesh.rotation.x = Math.PI / 2;
  }

  return mesh;
}

/**
 * Procedural Leg Pipes Structure with Nylon Bushes or Caster Wheels
 */
export function createLegPipesStructure({
  length,
  width,
  height,
  pipeSize = 1.5,
  isRound = false,
  hasWheels = false,
  materials
}) {
  const group = new THREE.Group();
  group.name = 'leg_pipes_structure';

  const halfL = length / 2;
  const halfW = width / 2;
  const inset = pipeSize / 2 + 0.5;

  const legHeight = Math.max(1, height - 1.5);
  const posY = legHeight / 2;

  // 4 Corner Leg Coordinates
  const legPositions = [
    { x: -halfL + inset, z: -halfW + inset },
    { x: halfL - inset, z: -halfW + inset },
    { x: -halfL + inset, z: halfW - inset },
    { x: halfL - inset, z: halfW - inset },
  ];

  // If length > 66", add 2 center support legs
  if (length > 66) {
    legPositions.push(
      { x: 0, z: -halfW + inset },
      { x: 0, z: halfW - inset }
    );
  }

  legPositions.forEach((pos, idx) => {
    // 1. Vertical Leg Pipe
    let legGeo;
    if (isRound) {
      legGeo = new THREE.CylinderGeometry(pipeSize / 2, pipeSize / 2, legHeight, 16);
    } else {
      legGeo = new THREE.BoxGeometry(pipeSize, legHeight, pipeSize);
    }
    const legMesh = createPanelWithEdges(legGeo, materials.pipeMaterial, materials.edgeLineMaterial);
    legMesh.position.set(pos.x, posY, pos.z);
    group.add(legMesh);

    // 2. Foot Bush (Bullet Bush or Nylon Base) OR Caster Wheel
    if (hasWheels) {
      // Swivel Caster Wheel
      const wheelGroup = new THREE.Group();
      wheelGroup.position.set(pos.x, 1.5, pos.z);

      // Bracket
      const bracketGeo = new THREE.BoxGeometry(pipeSize * 1.2, 1.0, pipeSize * 1.2);
      const bracketMesh = new THREE.Mesh(bracketGeo, materials.ssMaterial);
      wheelGroup.add(bracketMesh);

      // Wheel Rim & Rubber Tire
      const tireGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.8, 16);
      const tireMesh = new THREE.Mesh(tireGeo, materials.bushMaterial);
      tireMesh.rotation.z = Math.PI / 2;
      tireMesh.position.set(0, -1.0, 0);
      wheelGroup.add(tireMesh);

      group.add(wheelGroup);
    } else {
      // Adjustable Nylon / SS Bullet Bush
      const bushGeo = new THREE.CylinderGeometry(pipeSize * 0.55, pipeSize * 0.45, 1.2, 16);
      const bushMesh = new THREE.Mesh(bushGeo, materials.bushMaterial);
      bushMesh.position.set(pos.x, 0.6, pos.z);
      group.add(bushMesh);
    }
  });

  return group;
}

/**
 * Procedural Top Frame Perimeter & Shelf Frame Tie Pipes
 */
export function createHorizontalFrameTies({
  length,
  width,
  elevationY,
  pipeSize = 1.2,
  isRound = false,
  materials
}) {
  const group = new THREE.Group();
  group.name = `frame_ties_${Math.round(elevationY)}`;

  const halfL = length / 2;
  const halfW = width / 2;
  const inset = pipeSize / 2 + 0.5;

  const spanX = Math.max(1, length - inset * 2);
  const spanZ = Math.max(1, width - inset * 2);

  // Front & Back Longitudinal Rails (X-axis)
  const railZOffsets = [-halfW + inset, halfW - inset];
  railZOffsets.forEach((z) => {
    let railGeo;
    if (isRound) {
      railGeo = new THREE.CylinderGeometry(pipeSize / 2, pipeSize / 2, spanX, 16);
    } else {
      railGeo = new THREE.BoxGeometry(spanX, pipeSize, pipeSize);
    }
    const railMesh = createPanelWithEdges(railGeo, materials.pipeMaterial, materials.edgeLineMaterial);
    if (isRound) railMesh.rotation.z = Math.PI / 2;
    railMesh.position.set(0, elevationY, z);
    group.add(railMesh);
  });

  // Left & Right Cross Braces (Z-axis)
  const braceXOffsets = [-halfL + inset, halfL - inset];
  braceXOffsets.forEach((x) => {
    let braceGeo;
    if (isRound) {
      braceGeo = new THREE.CylinderGeometry(pipeSize / 2, pipeSize / 2, spanZ, 16);
    } else {
      braceGeo = new THREE.BoxGeometry(pipeSize, pipeSize, spanZ);
    }
    const braceMesh = createPanelWithEdges(braceGeo, materials.pipeMaterial, materials.edgeLineMaterial);
    if (isRound) braceMesh.rotation.x = Math.PI / 2;
    braceMesh.position.set(x, elevationY, 0);
    group.add(braceMesh);
  });

  return group;
}

/**
 * Procedural Overhead Upright Support Posts and Overhead Shelf Frame
 */
export function createOverheadStructure({
  length,
  width,
  counterHeight,
  overheadHeight = 18,
  pipeSize = 1.2,
  isRound = false,
  materials
}) {
  const group = new THREE.Group();
  group.name = 'overhead_shelf_structure';

  const halfL = length / 2;
  const halfW = width / 2;
  const inset = pipeSize / 2 + 0.5;

  const totalPostHeight = overheadHeight + 4.0;
  const postCenterY = counterHeight + totalPostHeight / 2;
  const postZ = -halfW + inset; // Rear mounted uprights

  // 2 Rear Upright Posts
  [-halfL + inset, halfL - inset].forEach((x) => {
    let postGeo;
    if (isRound) {
      postGeo = new THREE.CylinderGeometry(pipeSize / 2, pipeSize / 2, totalPostHeight, 16);
    } else {
      postGeo = new THREE.BoxGeometry(pipeSize, totalPostHeight, pipeSize);
    }
    const postMesh = createPanelWithEdges(postGeo, materials.pipeMaterial, materials.edgeLineMaterial);
    postMesh.position.set(x, postCenterY, postZ);
    group.add(postMesh);
  });

  // Overhead SS Shelf Panel
  const overheadShelfWidth = Math.max(8, width * 0.5);
  const shelfY = counterHeight + overheadHeight;
  const shelfGeo = new THREE.BoxGeometry(length, 0.8, overheadShelfWidth);
  const shelfMesh = createPanelWithEdges(shelfGeo, materials.ssBrushedMaterial, materials.edgeLineMaterial);
  shelfMesh.position.set(0, shelfY, -halfW + overheadShelfWidth / 2);
  group.add(shelfMesh);

  return group;
}

/**
 * Procedural Cast Iron Burner Rings / Pan Supports (For Gas Range & Dosa Bhatti)
 */
export function createBurnersAssembly({
  length,
  width,
  height,
  burnerCount = 2,
  isDosa = false,
  materials
}) {
  const group = new THREE.Group();
  group.name = 'burners_assembly';

  const halfL = length / 2;
  const posY = height + 0.6;

  if (isDosa) {
    // Solid Steel Hot Plate for Dosa Bhatti
    const plateLength = length - 6;
    const plateWidth = width - 6;
    const plateThickness = 0.8;
    const plateGeo = new THREE.BoxGeometry(plateLength, plateThickness, plateWidth);
    const plateMesh = createPanelWithEdges(plateGeo, materials.darkMetalMaterial, materials.edgeLineMaterial);
    plateMesh.position.set(0, height + plateThickness / 2, 0);
    group.add(plateMesh);
    return group;
  }

  // Multi-burner layout along length
  const gap = length / (burnerCount + 1);
  for (let i = 1; i <= burnerCount; i++) {
    const burnerX = -halfL + i * gap;

    // Heavy Cast Iron Pan Support Grate (Square Frame)
    const grateSize = Math.min(14, width * 0.65);
    const grateGeo = new THREE.BoxGeometry(grateSize, 0.8, grateSize);
    const grateMesh = new THREE.Mesh(grateGeo, materials.darkMetalMaterial);
    grateMesh.position.set(burnerX, posY, 0);
    group.add(grateMesh);

    // Inner Circular Burner Head
    const burnerHeadGeo = new THREE.CylinderGeometry(2.5, 2.8, 1.0, 16);
    const burnerHeadMesh = new THREE.Mesh(burnerHeadGeo, materials.darkMetalMaterial);
    burnerHeadMesh.position.set(burnerX, posY + 0.4, 0);
    group.add(burnerHeadMesh);
  }

  return group;
}
