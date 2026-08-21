/**
 * Shree Balaji Enterprises — 3D Sheet Panel Generator
 * Procedural sheet fabrication objects (Top, Shelf, Side, Front, Back, Door, Drawer, Basin, Partition, Canopy)
 */

import * as THREE from 'three';

/**
 * Creates a mesh with crisp outline edges
 */
export function createPanelWithEdges(geometry, material, edgeMaterial) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  if (edgeMaterial) {
    const edges = new THREE.EdgesGeometry(geometry, 25);
    const line = new THREE.LineSegments(edges, edgeMaterial);
    mesh.add(line);
  }
  return mesh;
}

/**
 * Procedural Top Work Surface Panel with front/side downturn lip and optional back splash
 */
export function createTopSurfacePanel({
  length,
  width,
  height,
  thickness = 1.5,
  lipSize = 1.5,
  hasBackSplash = false,
  backSplashHeight = 4.0,
  materials
}) {
  const group = new THREE.Group();
  group.name = 'top_work_surface';

  const { ssBrushedMaterial, edgeLineMaterial } = materials;

  // 1. Main Top Slab
  const topGeo = new THREE.BoxGeometry(length, thickness, width);
  const topMesh = createPanelWithEdges(topGeo, ssBrushedMaterial, edgeLineMaterial);
  // Center is at (0, height - thickness/2, 0)
  topMesh.position.set(0, height - thickness / 2, 0);
  group.add(topMesh);

  // 2. Rear Back Splash (Wall guard)
  if (hasBackSplash) {
    const splashThickness = 0.5;
    const splashGeo = new THREE.BoxGeometry(length, backSplashHeight, splashThickness);
    const splashMesh = createPanelWithEdges(splashGeo, ssBrushedMaterial, edgeLineMaterial);
    splashMesh.position.set(
      0,
      height + backSplashHeight / 2 - thickness / 2,
      -width / 2 + splashThickness / 2
    );
    group.add(splashMesh);
  }

  return group;
}

/**
 * Procedural Shelf Panel (Under shelf / intermediate shelf)
 */
export function createShelfPanel({
  length,
  width,
  elevationY,
  thickness = 0.8,
  margin = 1.6,
  materials
}) {
  const shelfLength = Math.max(1, length - margin * 2);
  const shelfWidth = Math.max(1, width - margin * 2);

  const geo = new THREE.BoxGeometry(shelfLength, thickness, shelfWidth);
  const mesh = createPanelWithEdges(geo, materials.ssMaterial, materials.edgeLineMaterial);
  mesh.position.set(0, elevationY, 0);
  mesh.name = 'shelf_panel';
  return mesh;
}

/**
 * Procedural Side Covering Panels (Left & Right)
 */
export function createSideCoveringPanels({
  length,
  width,
  height,
  elevationBottom,
  sheetThickness = 0.25,
  margin = 0.5,
  materials
}) {
  const group = new THREE.Group();
  group.name = 'side_coverings';

  const panelHeight = Math.max(1, height - elevationBottom - 1.5);
  const panelWidth = Math.max(1, width - margin * 2);
  const posY = elevationBottom + panelHeight / 2;

  // Left Side Panel
  const leftGeo = new THREE.BoxGeometry(sheetThickness, panelHeight, panelWidth);
  const leftMesh = createPanelWithEdges(leftGeo, materials.ssMaterial, materials.edgeLineMaterial);
  leftMesh.position.set(-length / 2 + sheetThickness / 2 + margin, posY, 0);
  group.add(leftMesh);

  // Right Side Panel
  const rightGeo = new THREE.BoxGeometry(sheetThickness, panelHeight, panelWidth);
  const rightMesh = createPanelWithEdges(rightGeo, materials.ssMaterial, materials.edgeLineMaterial);
  rightMesh.position.set(length / 2 - sheetThickness / 2 - margin, posY, 0);
  group.add(rightMesh);

  return group;
}

/**
 * Procedural Front Covering Apron or Enclosure
 */
export function createFrontCoveringPanel({
  length,
  width,
  height,
  elevationBottom,
  sheetThickness = 0.25,
  margin = 0.5,
  materials
}) {
  const panelHeight = Math.max(1, height - elevationBottom - 1.5);
  const panelLength = Math.max(1, length - margin * 2);

  const geo = new THREE.BoxGeometry(panelLength, panelHeight, sheetThickness);
  const mesh = createPanelWithEdges(geo, materials.ssMaterial, materials.edgeLineMaterial);
  mesh.position.set(0, elevationBottom + panelHeight / 2, width / 2 - sheetThickness / 2 - margin);
  mesh.name = 'front_covering_panel';
  return mesh;
}

/**
 * Procedural Back Cladding Panel
 */
export function createBackCoveringPanel({
  length,
  width,
  height,
  elevationBottom,
  sheetThickness = 0.25,
  margin = 0.5,
  materials
}) {
  const panelHeight = Math.max(1, height - elevationBottom - 1.5);
  const panelLength = Math.max(1, length - margin * 2);

  const geo = new THREE.BoxGeometry(panelLength, panelHeight, sheetThickness);
  const mesh = createPanelWithEdges(geo, materials.ssMaterial, materials.edgeLineMaterial);
  mesh.position.set(0, elevationBottom + panelHeight / 2, -width / 2 + sheetThickness / 2 + margin);
  mesh.name = 'back_covering_panel';
  return mesh;
}

/**
 * Procedural Doors (Hinged / Sliding Front Doors with SS pull handles)
 */
export function createCabinetDoors({
  length,
  width,
  height,
  elevationBottom,
  doorCount = 2,
  materials
}) {
  const group = new THREE.Group();
  group.name = 'cabinet_doors';

  const totalHeight = Math.max(1, height - elevationBottom - 1.8);
  const gap = 0.4;
  const totalLength = Math.max(1, length - 2.0);
  const singleDoorWidth = (totalLength - gap * (doorCount - 1)) / doorCount;
  const doorThickness = 0.6;
  const posY = elevationBottom + totalHeight / 2;
  const posZ = width / 2 - doorThickness / 2;

  const startX = -totalLength / 2 + singleDoorWidth / 2;

  for (let i = 0; i < doorCount; i++) {
    const doorX = startX + i * (singleDoorWidth + gap);

    // Door Panel
    const doorGeo = new THREE.BoxGeometry(singleDoorWidth, totalHeight, doorThickness);
    const doorMesh = createPanelWithEdges(doorGeo, materials.ssMaterial, materials.edgeLineMaterial);
    doorMesh.position.set(doorX, posY, posZ);
    group.add(doorMesh);

    // SS Pull Handle (Vertical cylinder or bar)
    const handleGeo = new THREE.CylinderGeometry(0.2, 0.2, 4.0, 16);
    const handleMesh = new THREE.Mesh(handleGeo, materials.pipeMaterial);
    const handleOffsetX = (i % 2 === 0 ? 1 : -1) * (singleDoorWidth / 2 - 1.5);
    handleMesh.position.set(doorX + handleOffsetX, posY, posZ + doorThickness / 2 + 0.3);
    group.add(handleMesh);
  }

  return group;
}

/**
 * Procedural Drawers (Top row utility sliding drawers)
 */
export function createDrawerUnits({
  length,
  width,
  height,
  drawerCount = 2,
  materials
}) {
  const group = new THREE.Group();
  group.name = 'cabinet_drawers';

  const drawerHeight = 6.0;
  const drawerThickness = 0.6;
  const gap = 0.4;
  const totalLength = Math.max(1, length - 2.0);
  const singleDrawerWidth = (totalLength - gap * (drawerCount - 1)) / drawerCount;
  const posY = height - 1.5 - drawerHeight / 2;
  const posZ = width / 2 - drawerThickness / 2;

  const startX = -totalLength / 2 + singleDrawerWidth / 2;

  for (let i = 0; i < drawerCount; i++) {
    const drawerX = startX + i * (singleDrawerWidth + gap);

    // Drawer Front Panel
    const drawerGeo = new THREE.BoxGeometry(singleDrawerWidth, drawerHeight, drawerThickness);
    const drawerMesh = createPanelWithEdges(drawerGeo, materials.ssMaterial, materials.edgeLineMaterial);
    drawerMesh.position.set(drawerX, posY, posZ);
    group.add(drawerMesh);

    // Horizontal Pull Handle
    const handleGeo = new THREE.CylinderGeometry(0.2, 0.2, Math.min(6, singleDrawerWidth * 0.4), 16);
    const handleMesh = new THREE.Mesh(handleGeo, materials.pipeMaterial);
    handleMesh.rotation.z = Math.PI / 2;
    handleMesh.position.set(drawerX, posY, posZ + drawerThickness / 2 + 0.3);
    group.add(handleMesh);
  }

  return group;
}

/**
 * Procedural Recessed Sink Basin Unit with Faucet
 */
export function createSinkBowlUnit({
  length,
  width,
  height,
  bowlWidth = 18,
  bowlDepth = 18,
  bowlHeight = 10,
  materials
}) {
  const group = new THREE.Group();
  group.name = 'sink_bowl_unit';

  const posX = length > 36 ? -length / 4 : 0;
  const posZ = 0;
  const posY = height - bowlHeight / 2 - 0.2;

  // Basin Outer Cavity
  const basinGeo = new THREE.BoxGeometry(bowlWidth, bowlHeight, bowlDepth);
  const basinMesh = createPanelWithEdges(basinGeo, materials.ssMaterial, materials.edgeLineMaterial);
  basinMesh.position.set(posX, posY, posZ);
  group.add(basinMesh);

  // Inner Dark Well for Depth Effect
  const innerGeo = new THREE.BoxGeometry(bowlWidth - 1.0, bowlHeight - 0.5, bowlDepth - 1.0);
  const innerMesh = new THREE.Mesh(innerGeo, materials.darkMetalMaterial);
  innerMesh.position.set(posX, posY + 0.3, posZ);
  group.add(innerMesh);

  // Swan Neck Faucet / Water Tap
  const faucetGroup = new THREE.Group();
  const faucetBase = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.5, 16), materials.ssBrushedMaterial);
  faucetBase.position.set(posX, height + 0.75, -bowlDepth / 2 - 1.5);
  faucetGroup.add(faucetBase);

  // Faucet Spout Curve
  const spoutGeo = new THREE.CylinderGeometry(0.3, 0.3, 5.0, 16);
  const spoutMesh = new THREE.Mesh(spoutGeo, materials.ssBrushedMaterial);
  spoutMesh.position.set(posX, height + 3.0, -bowlDepth / 2 - 1.5);
  spoutMesh.rotation.x = 0.2;
  faucetGroup.add(spoutMesh);

  group.add(faucetGroup);

  return group;
}
