/**
 * Shree Balaji Enterprises — 3D Sheet Component Generator
 * Procedural sheet components created strictly when active in Material Specification.
 * Attaches userData metadata to meshes for interactive click inspection.
 */

import * as THREE from 'three';
import { getVisualSheetThickness } from '@/lib/3dStructureConfig';

/**
 * Creates a mesh with crisp outline edges and userData tag
 */
export function createPanelWithEdges(geometry, material, edgeMaterial, meta = {}) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  mesh.userData = { ...meta };

  if (edgeMaterial) {
    const edges = new THREE.EdgesGeometry(geometry, 25);
    const line = new THREE.LineSegments(edges, edgeMaterial);
    mesh.add(line);
  }
  return mesh;
}

/**
 * Procedural Top Surface Component
 */
export function createTopSheetComponent({
  length = 48,
  width = 30,
  height = 34,
  hasLegs = true,
  gauge = 1.2,
  hasBackSplash = false,
  backSplashHeight = 4.0,
  meta = {},
  materials
}) {
  const group = new THREE.Group();
  group.name = 'component_top_surface';

  const thickness = 1.5;
  const posY = hasLegs ? height - thickness / 2 : thickness / 2;

  const topGeo = new THREE.BoxGeometry(length, thickness, width);
  const topMesh = createPanelWithEdges(topGeo, materials.ssBrushedMaterial, materials.edgeLineMaterial, {
    ...meta,
    name: meta.material || 'Top Sheet',
    type: 'Sheet Material'
  });
  topMesh.position.set(0, posY, 0);
  group.add(topMesh);

  // Rear Back Splash
  if (hasBackSplash) {
    const splashThickness = 0.5;
    const splashGeo = new THREE.BoxGeometry(length, backSplashHeight, splashThickness);
    const splashMesh = createPanelWithEdges(splashGeo, materials.ssBrushedMaterial, materials.edgeLineMaterial, {
      ...meta,
      name: 'Back Splash',
      type: 'Sheet Material'
    });
    const splashY = hasLegs ? height + backSplashHeight / 2 - thickness / 2 : thickness + backSplashHeight / 2;
    splashMesh.position.set(0, splashY, -width / 2 + splashThickness / 2);
    group.add(splashMesh);
  }

  return group;
}

/**
 * Procedural Shelf Component (Under Shelf / Intermediate Shelf)
 */
export function createShelfComponent({
  length = 44,
  width = 28,
  elevationY = 8,
  gauge = 1.0,
  meta = {},
  materials
}) {
  const thickness = getVisualSheetThickness(gauge);
  const geo = new THREE.BoxGeometry(length, thickness + 0.5, width);
  const mesh = createPanelWithEdges(geo, materials.ssMaterial, materials.edgeLineMaterial, {
    ...meta,
    name: meta.material || 'Shelf',
    type: 'Sheet Material'
  });
  mesh.position.set(0, elevationY, 0);
  mesh.name = 'component_shelf';
  return mesh;
}

/**
 * Procedural Side Covering Panels (Left and/or Right)
 */
export function createSidePanelsComponent({
  length = 48,
  width = 30,
  height = 34,
  elevationBottom = 8,
  gauge = 1.0,
  isLeftOnly = false,
  isRightOnly = false,
  meta = {},
  materials
}) {
  const group = new THREE.Group();
  group.name = 'component_side_panels';

  const sheetThickness = getVisualSheetThickness(gauge);
  const panelHeight = Math.max(1, height - elevationBottom - 1.5);
  const panelWidth = Math.max(1, width - 1.0);
  const posY = elevationBottom + panelHeight / 2;

  if (!isRightOnly) {
    const leftGeo = new THREE.BoxGeometry(sheetThickness, panelHeight, panelWidth);
    const leftMesh = createPanelWithEdges(leftGeo, materials.ssMaterial, materials.edgeLineMaterial, {
      ...meta,
      name: meta.material || 'Side Covering - Left',
      type: 'Sheet Material'
    });
    leftMesh.position.set(-length / 2 + sheetThickness / 2 + 0.5, posY, 0);
    group.add(leftMesh);
  }

  if (!isLeftOnly) {
    const rightGeo = new THREE.BoxGeometry(sheetThickness, panelHeight, panelWidth);
    const rightMesh = createPanelWithEdges(rightGeo, materials.ssMaterial, materials.edgeLineMaterial, {
      ...meta,
      name: meta.material || 'Side Covering - Right',
      type: 'Sheet Material'
    });
    rightMesh.position.set(length / 2 - sheetThickness / 2 - 0.5, posY, 0);
    group.add(rightMesh);
  }

  return group;
}

/**
 * Procedural Front Covering Panel (Apron or Enclosure)
 */
export function createFrontPanelComponent({
  length = 48,
  width = 30,
  height = 34,
  elevationBottom = 8,
  gauge = 1.0,
  meta = {},
  materials
}) {
  const sheetThickness = getVisualSheetThickness(gauge);
  const panelHeight = Math.max(1, height - elevationBottom - 1.5);
  const panelLength = Math.max(1, length - 1.0);

  const geo = new THREE.BoxGeometry(panelLength, panelHeight, sheetThickness);
  const mesh = createPanelWithEdges(geo, materials.ssMaterial, materials.edgeLineMaterial, {
    ...meta,
    name: meta.material || 'Front Covering',
    type: 'Sheet Material'
  });
  mesh.position.set(0, elevationBottom + panelHeight / 2, width / 2 - sheetThickness / 2 - 0.5);
  mesh.name = 'component_front_panel';
  return mesh;
}

/**
 * Procedural Back Covering Panel
 */
export function createBackPanelComponent({
  length = 48,
  width = 30,
  height = 34,
  elevationBottom = 8,
  gauge = 1.0,
  meta = {},
  materials
}) {
  const sheetThickness = getVisualSheetThickness(gauge);
  const panelHeight = Math.max(1, height - elevationBottom - 1.5);
  const panelLength = Math.max(1, length - 1.0);

  const geo = new THREE.BoxGeometry(panelLength, panelHeight, sheetThickness);
  const mesh = createPanelWithEdges(geo, materials.ssMaterial, materials.edgeLineMaterial, {
    ...meta,
    name: meta.material || 'Back Support / Covering',
    type: 'Sheet Material'
  });
  mesh.position.set(0, elevationBottom + panelHeight / 2, -width / 2 + sheetThickness / 2 + 0.5);
  mesh.name = 'component_back_panel';
  return mesh;
}

/**
 * Procedural Internal Partition Divider
 */
export function createPartitionComponent({
  length = 48,
  width = 30,
  height = 34,
  elevationBottom = 8,
  gauge = 1.0,
  meta = {},
  materials
}) {
  const sheetThickness = getVisualSheetThickness(gauge);
  const partHeight = Math.max(1, height - elevationBottom - 1.5);
  const partWidth = Math.max(1, width - 2.0);

  const geo = new THREE.BoxGeometry(sheetThickness, partHeight, partWidth);
  const mesh = createPanelWithEdges(geo, materials.ssMaterial, materials.edgeLineMaterial, {
    ...meta,
    name: meta.material || 'Partition',
    type: 'Sheet Material'
  });
  mesh.position.set(0, elevationBottom + partHeight / 2, 0);
  mesh.name = 'component_partition';
  return mesh;
}

/**
 * Procedural Canopy Roof Component
 */
export function createRoofComponent({
  length = 48,
  width = 30,
  counterHeight = 34,
  elevationRoof = 28,
  gauge = 1.0,
  meta = {},
  materials
}) {
  const sheetThickness = getVisualSheetThickness(gauge);
  const roofY = counterHeight + elevationRoof;

  const geo = new THREE.BoxGeometry(length, sheetThickness + 0.8, width);
  const mesh = createPanelWithEdges(geo, materials.ssBrushedMaterial, materials.edgeLineMaterial, {
    ...meta,
    name: meta.material || 'Roof Canopy',
    type: 'Sheet Material'
  });
  mesh.position.set(0, roofY, 0);
  mesh.name = 'component_roof';
  return mesh;
}

/**
 * Procedural Doors (Renders exact quantity entered)
 */
export function createDoorsComponent({
  length = 48,
  width = 30,
  height = 34,
  elevationBottom = 8,
  doorCount = 2,
  gauge = 1.0,
  meta = {},
  materials
}) {
  const group = new THREE.Group();
  group.name = 'component_doors';

  const totalHeight = Math.max(1, height - elevationBottom - 1.8);
  const gap = 0.4;
  const totalLength = Math.max(1, length - 2.0);
  const count = Math.max(1, parseInt(doorCount) || 2);
  const singleDoorWidth = (totalLength - gap * (count - 1)) / count;
  const doorThickness = 0.6;
  const posY = elevationBottom + totalHeight / 2;
  const posZ = width / 2 - doorThickness / 2;

  const startX = -totalLength / 2 + singleDoorWidth / 2;

  for (let i = 0; i < count; i++) {
    const doorX = startX + i * (singleDoorWidth + gap);

    const doorGeo = new THREE.BoxGeometry(singleDoorWidth, totalHeight, doorThickness);
    const doorMesh = createPanelWithEdges(doorGeo, materials.ssMaterial, materials.edgeLineMaterial, {
      ...meta,
      name: `${meta.material || 'Door'} #${i + 1}`,
      type: 'Sheet Material'
    });
    doorMesh.position.set(doorX, posY, posZ);
    group.add(doorMesh);

    const handleGeo = new THREE.CylinderGeometry(0.2, 0.2, 4.0, 16);
    const handleMesh = new THREE.Mesh(handleGeo, materials.pipeMaterial);
    const handleOffsetX = (i % 2 === 0 ? 1 : -1) * (singleDoorWidth / 2 - 1.5);
    handleMesh.position.set(doorX + handleOffsetX, posY, posZ + doorThickness / 2 + 0.3);
    group.add(handleMesh);
  }

  return group;
}

/**
 * Procedural Drawers (Renders exact quantity entered)
 */
export function createDrawersComponent({
  length = 48,
  width = 30,
  height = 34,
  drawerCount = 2,
  gauge = 1.0,
  meta = {},
  materials
}) {
  const group = new THREE.Group();
  group.name = 'component_drawers';

  const drawerHeight = 6.0;
  const drawerThickness = 0.6;
  const gap = 0.4;
  const totalLength = Math.max(1, length - 2.0);
  const count = Math.max(1, parseInt(drawerCount) || 2);
  const singleDrawerWidth = (totalLength - gap * (count - 1)) / count;
  const posY = height - 1.5 - drawerHeight / 2;
  const posZ = width / 2 - drawerThickness / 2;

  const startX = -totalLength / 2 + singleDrawerWidth / 2;

  for (let i = 0; i < count; i++) {
    const drawerX = startX + i * (singleDrawerWidth + gap);

    const drawerGeo = new THREE.BoxGeometry(singleDrawerWidth, drawerHeight, drawerThickness);
    const drawerMesh = createPanelWithEdges(drawerGeo, materials.ssMaterial, materials.edgeLineMaterial, {
      ...meta,
      name: `${meta.material || 'Drawer'} #${i + 1}`,
      type: 'Sheet Material'
    });
    drawerMesh.position.set(drawerX, posY, posZ);
    group.add(drawerMesh);

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
export function createSinkBowlComponent({
  length = 48,
  width = 30,
  height = 34,
  bowlWidth = 18,
  bowlDepth = 18,
  bowlHeight = 10,
  meta = {},
  materials
}) {
  const group = new THREE.Group();
  group.name = 'component_sink_bowl';

  const posX = length > 36 ? -length / 4 : 0;
  const posZ = 0;
  const posY = height - bowlHeight / 2 - 0.2;

  const basinGeo = new THREE.BoxGeometry(bowlWidth, bowlHeight, bowlDepth);
  const basinMesh = createPanelWithEdges(basinGeo, materials.ssMaterial, materials.edgeLineMaterial, {
    ...meta,
    name: meta.material || 'Sink Bowl Cavity',
    type: 'Sheet Material'
  });
  basinMesh.position.set(posX, posY, posZ);
  group.add(basinMesh);

  const innerGeo = new THREE.BoxGeometry(bowlWidth - 1.0, bowlHeight - 0.5, bowlDepth - 1.0);
  const innerMesh = new THREE.Mesh(innerGeo, materials.darkMetalMaterial);
  innerMesh.position.set(posX, posY + 0.3, posZ);
  group.add(innerMesh);

  const faucetGroup = new THREE.Group();
  const faucetBase = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.6, 1.5, 16), materials.ssBrushedMaterial);
  faucetBase.position.set(posX, height + 0.75, -bowlDepth / 2 - 1.5);
  faucetGroup.add(faucetBase);

  const spoutGeo = new THREE.CylinderGeometry(0.3, 0.3, 5.0, 16);
  const spoutMesh = new THREE.Mesh(spoutGeo, materials.ssBrushedMaterial);
  spoutMesh.position.set(posX, height + 3.0, -bowlDepth / 2 - 1.5);
  spoutMesh.rotation.x = 0.2;
  faucetGroup.add(spoutMesh);

  group.add(faucetGroup);
  return group;
}
