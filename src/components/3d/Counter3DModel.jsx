/**
 * Shree Balaji Enterprises — Counter3DModel Master Coordinator
 * Generates Three.js 3D scene directly from deterministic parametric part descriptors.
 * Material Specification is the single source of truth. Zero phantom parts.
 */

import * as THREE from 'three';
import { createMaterialLibrary } from '@/lib/3dStructureConfig';
import { build3DStructure } from '@/lib/3dStructureEngine';
import { buildDimensionLabels } from './DimensionLabels';
import { createPanelWithEdges } from './Sheet3DComponent';

/**
 * Builds the complete 3D Counter Model Group for the scene
 */
export function buildCounter3DModel({
  counterType = '',
  sheets = [],
  pipes = [],
  angles = [],
  purchased = [],
  compressor = [],
  showDimensions = true,
  isWireframe = false,
  isExploded = false
}) {
  const masterGroup = new THREE.Group();
  masterGroup.name = 'master_counter_model';

  // 1. Generate Deterministic Part Descriptors from Engine
  const result = build3DStructure({
    counterType,
    sheets,
    pipes,
    angles,
    purchased,
    compressor
  });

  if (!result.isValid || result.parts.length === 0) {
    masterGroup.userData.configuredPartsCount = 0;
    masterGroup.userData.debugInfo = result.debugInfo;
    return masterGroup;
  }

  masterGroup.userData.configuredPartsCount = result.configuredPartsCount;
  masterGroup.userData.bounds = result.bounds;
  masterGroup.userData.debugInfo = result.debugInfo;

  // 2. Instantiate Materials
  const materials = createMaterialLibrary();

  if (isWireframe) {
    materials.ssMaterial.wireframe = true;
    materials.ssBrushedMaterial.wireframe = true;
    materials.pipeMaterial.wireframe = true;
    materials.darkMetalMaterial.wireframe = true;
  }

  const explodeOffset = isExploded ? 6.0 : 0.0;

  // 3. Assemble Physical 3D Meshes from Part Descriptors
  result.parts.forEach((part) => {
    let meshGroup = new THREE.Group();
    meshGroup.name = part.id;

    const [dx, dy, dz] = part.dimensions;
    const [px, py, pz] = part.position;

    // Apply exploded offsets according to structural role
    let posX = px;
    let posY = py;
    let posZ = pz;

    if (isExploded) {
      if (part.role === 'TOP') posY += explodeOffset;
      else if (part.role === 'UNDER_SHELF') posY -= explodeOffset * 0.4;
      else if (part.role === 'OVERHEAD_SHELF') posY += explodeOffset * 1.5;
      else if (part.role === 'SIDE_PANEL_LEFT') posX -= explodeOffset;
      else if (part.role === 'SIDE_PANEL_RIGHT') posX += explodeOffset;
      else if (part.role === 'FRONT_PANEL' || part.role === 'DOOR' || part.role === 'DRAWER') posZ += explodeOffset;
      else if (part.role === 'BACK_PANEL' || part.role === 'BACK_SPLASH') posZ -= explodeOffset;
    }

    const meshMetadata = {
      ...part.sourceRow,
      id: part.id,
      sourceRowId: part.sourceRowId,
      name: part.name,
      material: part.sourceRow?.material || part.name,
      type: part.category || 'Sheet Material',
      role: part.role,
      dimensions: part.dimensions,
      position: part.position
    };

    if (part.type === 'sheet') {
      const geo = new THREE.BoxGeometry(dx, dy, dz);
      const isTopLike = part.role === 'TOP' || part.role === 'BACK_SPLASH' || part.role === 'OVERHEAD_SHELF';
      const mat = isTopLike ? materials.ssBrushedMaterial : materials.ssMaterial;
      const mesh = createPanelWithEdges(geo, mat, materials.edgeLineMaterial, meshMetadata);
      mesh.position.set(posX, posY, posZ);
      meshGroup.add(mesh);
    } else if (part.type === 'pipe') {
      let geo;
      if (part.isRound) {
        geo = new THREE.CylinderGeometry(dx, dx, dy, 16);
      } else {
        geo = new THREE.BoxGeometry(dx, dy, dz);
      }
      const mesh = createPanelWithEdges(geo, materials.pipeMaterial, materials.edgeLineMaterial, meshMetadata);
      mesh.position.set(posX, posY, posZ);
      meshGroup.add(mesh);
    } else if (part.type === 'door') {
      const geo = new THREE.BoxGeometry(dx, dy, dz);
      const mesh = createPanelWithEdges(geo, materials.ssMaterial, materials.edgeLineMaterial, meshMetadata);
      mesh.position.set(posX, posY, posZ);
      meshGroup.add(mesh);

      // Handle
      const handleGeo = new THREE.CylinderGeometry(0.2, 0.2, Math.min(5, dy * 0.3), 16);
      const handleMesh = new THREE.Mesh(handleGeo, materials.pipeMaterial);
      handleMesh.position.set(posX + (dx / 2 - 1.2), posY, posZ + dz / 2 + 0.3);
      meshGroup.add(handleMesh);
    } else if (part.type === 'drawer') {
      const geo = new THREE.BoxGeometry(dx, dy, dz);
      const mesh = createPanelWithEdges(geo, materials.ssMaterial, materials.edgeLineMaterial, meshMetadata);
      mesh.position.set(posX, posY, posZ);
      meshGroup.add(mesh);

      // Handle
      const handleGeo = new THREE.CylinderGeometry(0.2, 0.2, Math.min(5, dx * 0.4), 16);
      const handleMesh = new THREE.Mesh(handleGeo, materials.pipeMaterial);
      handleMesh.rotation.z = Math.PI / 2;
      handleMesh.position.set(posX, posY, posZ + dz / 2 + 0.3);
      meshGroup.add(handleMesh);
    } else if (part.type === 'wheel') {
      const bracketGeo = new THREE.BoxGeometry(dx, 1.0, dz);
      const bracketMesh = new THREE.Mesh(bracketGeo, materials.ssMaterial);
      bracketMesh.position.set(posX, posY + 0.5, posZ);
      bracketMesh.userData = meshMetadata;
      meshGroup.add(bracketMesh);

      const tireGeo = new THREE.CylinderGeometry(1.4, 1.4, 0.8, 16);
      const tireMesh = new THREE.Mesh(tireGeo, materials.bushMaterial);
      tireMesh.rotation.z = Math.PI / 2;
      tireMesh.position.set(posX, posY - 0.4, posZ);
      tireMesh.userData = meshMetadata;
      meshGroup.add(tireMesh);
    } else if (part.type === 'bush') {
      const bushGeo = new THREE.CylinderGeometry(0.7, 0.5, dy, 16);
      const bushMesh = new THREE.Mesh(bushGeo, materials.bushMaterial);
      bushMesh.position.set(posX, posY, posZ);
      bushMesh.userData = meshMetadata;
      meshGroup.add(bushMesh);
    } else if (part.type === 'sink') {
      const basinGeo = new THREE.BoxGeometry(dx, dy, dz);
      const basinMesh = createPanelWithEdges(basinGeo, materials.ssMaterial, materials.edgeLineMaterial, meshMetadata);
      basinMesh.position.set(posX, posY, posZ);
      meshGroup.add(basinMesh);

      const innerGeo = new THREE.BoxGeometry(dx - 1.0, dy - 0.5, dz - 1.0);
      const innerMesh = new THREE.Mesh(innerGeo, materials.darkMetalMaterial);
      innerMesh.position.set(posX, posY + 0.3, posZ);
      meshGroup.add(innerMesh);
    } else if (part.type === 'burner') {
      const grateGeo = new THREE.BoxGeometry(dx, dy, dz);
      const grateMesh = new THREE.Mesh(grateGeo, materials.darkMetalMaterial);
      grateMesh.position.set(posX, posY, posZ);
      grateMesh.userData = meshMetadata;
      meshGroup.add(grateMesh);

      const headGeo = new THREE.CylinderGeometry(2.2, 2.5, 0.8, 16);
      const headMesh = new THREE.Mesh(headGeo, materials.darkMetalMaterial);
      headMesh.position.set(posX, posY + 0.3, posZ);
      headMesh.userData = meshMetadata;
      meshGroup.add(headMesh);
    } else if (part.type === 'dosa_plate') {
      const plateGeo = new THREE.BoxGeometry(dx, dy, dz);
      const plateMesh = createPanelWithEdges(plateGeo, materials.darkMetalMaterial, materials.edgeLineMaterial, meshMetadata);
      plateMesh.position.set(posX, posY, posZ);
      meshGroup.add(plateMesh);
    } else if (part.type === 'glass_guard') {
      const glassGeo = new THREE.BoxGeometry(dx, dy, dz);
      const glassMat = materials.glassMaterial || materials.ssBrushedMaterial;
      const glassMesh = new THREE.Mesh(glassGeo, glassMat);
      glassMesh.position.set(posX, posY, posZ);
      glassMesh.userData = meshMetadata;
      meshGroup.add(glassMesh);
    } else if (part.type === 'water_tap') {
      const faucetBase = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 1.5, 16), materials.ssBrushedMaterial);
      faucetBase.position.set(posX, posY, posZ);
      faucetBase.userData = meshMetadata;
      meshGroup.add(faucetBase);

      const spoutMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 4.5, 16), materials.ssBrushedMaterial);
      spoutMesh.position.set(posX, posY + 2.0, posZ);
      spoutMesh.rotation.x = 0.2;
      spoutMesh.userData = meshMetadata;
      meshGroup.add(spoutMesh);
    } else if (part.type === 'tandoor_pot') {
      const potGeo = new THREE.CylinderGeometry(dx / 2, (dx * 0.8) / 2, dy, 24);
      const potMesh = new THREE.Mesh(potGeo, materials.darkMetalMaterial);
      potMesh.position.set(posX, posY, posZ);
      potMesh.userData = meshMetadata;
      meshGroup.add(potMesh);

      const mouthGeo = new THREE.TorusGeometry(dx / 2, 0.8, 12, 24);
      const mouthMesh = new THREE.Mesh(mouthGeo, materials.ssBrushedMaterial);
      mouthMesh.rotation.x = Math.PI / 2;
      mouthMesh.position.set(posX, posY + dy / 2, posZ);
      mouthMesh.userData = meshMetadata;
      meshGroup.add(mouthMesh);
    } else if (part.type === 'compressor_unit') {
      const compGeo = new THREE.BoxGeometry(dx, dy, dz);
      const compMesh = new THREE.Mesh(compGeo, materials.darkMetalMaterial);
      compMesh.position.set(posX, posY, posZ);
      compMesh.userData = meshMetadata;
      meshGroup.add(compMesh);

      const domeGeo = new THREE.SphereGeometry(dy * 0.35, 16, 16);
      const domeMesh = new THREE.Mesh(domeGeo, materials.ssMaterial);
      domeMesh.position.set(posX, posY + 0.5, posZ);
      domeMesh.userData = meshMetadata;
      meshGroup.add(domeMesh);
    } else if (part.type === 'handle') {
      const handlePipeGeo = new THREE.CylinderGeometry(0.6, 0.6, dz, 16);
      const handlePipeMesh = new THREE.Mesh(handlePipeGeo, materials.pipeMaterial);
      handlePipeMesh.position.set(posX, posY, posZ);
      handlePipeMesh.rotation.x = Math.PI / 2;
      handlePipeMesh.userData = meshMetadata;
      meshGroup.add(handlePipeMesh);

      [-dz * 0.4, dz * 0.4].forEach((bracketZ) => {
        const armGeo = new THREE.BoxGeometry(3.0, 0.8, 0.8);
        const armMesh = new THREE.Mesh(armGeo, materials.pipeMaterial);
        armMesh.position.set(posX - 1.5, posY, bracketZ);
        armMesh.userData = meshMetadata;
        meshGroup.add(armMesh);
      });
    }

    masterGroup.add(meshGroup);
  });

  // 4. Dynamic Dimension Arrows & Labels
  if (showDimensions && result.parts.length > 0 && result.hasDimensions) {
    const dimGroup = buildDimensionLabels(
      result.bounds.length,
      result.bounds.width,
      result.bounds.height,
      materials.dimLineMaterial
    );
    masterGroup.add(dimGroup);
  }

  return masterGroup;
}
