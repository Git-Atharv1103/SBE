/**
 * Shree Balaji Enterprises — 3D Counter Structure Master Assembler
 * Coordinates dynamic parametric fabrication assembly based on estimate specification state.
 */

import * as THREE from 'three';
import {
  createMaterialLibrary,
  analyzeCounterStructure
} from '@/lib/3dStructureConfig';
import {
  createTopSurfacePanel,
  createShelfPanel,
  createSideCoveringPanels,
  createFrontCoveringPanel,
  createBackCoveringPanel,
  createCabinetDoors,
  createDrawerUnits,
  createSinkBowlUnit,
  createPanelWithEdges
} from './SheetPanel3D';
import {
  createLegPipesStructure,
  createHorizontalFrameTies,
  createOverheadStructure,
  createBurnersAssembly
} from './PipeStructure3D';
import { buildDimensionLinesGroup } from './DimensionLabels';

/**
 * Builds the complete 3D Counter Group for the Three.js scene
 */
export function buildCounterAssembly({
  counterType = 'Counter',
  counterSubtype = '',
  length = 48,
  width = 30,
  height = 34,
  sheets = [],
  pipes = [],
  purchased = [],
  showDimensions = true,
  isWireframe = false,
  isExploded = false
}) {
  const masterGroup = new THREE.Group();
  masterGroup.name = 'master_counter_assembly';

  // Instantiate Materials
  const materials = createMaterialLibrary();

  // Apply Wireframe if toggled
  if (isWireframe) {
    materials.ssMaterial.wireframe = true;
    materials.ssBrushedMaterial.wireframe = true;
    materials.pipeMaterial.wireframe = true;
    materials.darkMetalMaterial.wireframe = true;
  }

  // Analyze structure features
  const config = analyzeCounterStructure({
    counterType,
    counterSubtype,
    sheets,
    pipes,
    purchased
  });

  const explodeOffset = isExploded ? 6.0 : 0.0;
  const underShelfY = Math.max(6, height * 0.25);

  // =========================================================================
  // 1. LEG PIPES FRAMEWORK
  // =========================================================================
  if (!config.isTandoor) {
    const legsGroup = createLegPipesStructure({
      length,
      width,
      height,
      pipeSize: config.pipeSizeInch,
      isRound: config.isRoundPipe,
      hasWheels: config.hasWheels || config.isTrolley,
      materials
    });
    masterGroup.add(legsGroup);

    // Top Frame Ties (Under Top Sheet)
    const topTies = createHorizontalFrameTies({
      length,
      width,
      elevationY: height - 1.8,
      pipeSize: 1.2,
      isRound: config.isRoundPipe,
      materials
    });
    masterGroup.add(topTies);

    // Under Shelf Frame Ties
    if (config.hasUnderShelf || config.isDishRack) {
      const shelfTies = createHorizontalFrameTies({
        length,
        width,
        elevationY: underShelfY - 0.6,
        pipeSize: 1.0,
        isRound: config.isRoundPipe,
        materials
      });
      masterGroup.add(shelfTies);
    }
  }

  // =========================================================================
  // 2. TOP WORK SURFACE PANEL
  // =========================================================================
  if (config.hasTop && !config.isDishRack) {
    const topPanelGroup = createTopSurfacePanel({
      length,
      width,
      height,
      thickness: 1.5,
      hasBackSplash: config.hasBackSplash,
      backSplashHeight: 4.0,
      materials
    });

    if (isExploded) {
      topPanelGroup.position.y += explodeOffset;
    }
    masterGroup.add(topPanelGroup);
  }

  // =========================================================================
  // 3. UNDER SHELF / MULTI-TIER RACK SHELVES
  // =========================================================================
  if (config.isDishRack) {
    // Multi-tier storage rack shelves
    const tierStep = height / (config.tierCount + 1);
    for (let i = 1; i <= config.tierCount; i++) {
      const shelfMesh = createShelfPanel({
        length,
        width,
        elevationY: i * tierStep,
        thickness: 0.8,
        margin: 1.2,
        materials
      });
      masterGroup.add(shelfMesh);
    }
  } else if (config.hasUnderShelf) {
    const underShelfMesh = createShelfPanel({
      length,
      width,
      elevationY: underShelfY,
      thickness: 0.8,
      margin: config.pipeSizeInch + 0.2,
      materials
    });

    if (isExploded) {
      underShelfMesh.position.y -= explodeOffset * 0.5;
    }
    masterGroup.add(underShelfMesh);
  }

  // =========================================================================
  // 4. SIDE COVERINGS (LEFT & RIGHT)
  // =========================================================================
  if (config.hasSideCoverings || config.isFridge || config.isStorageBin) {
    const sidePanels = createSideCoveringPanels({
      length,
      width,
      height,
      elevationBottom: underShelfY,
      sheetThickness: 0.3,
      materials
    });

    if (isExploded) {
      // Explode left and right panels outwards along X
      if (sidePanels.children[0]) sidePanels.children[0].position.x -= explodeOffset;
      if (sidePanels.children[1]) sidePanels.children[1].position.x += explodeOffset;
    }
    masterGroup.add(sidePanels);
  }

  // =========================================================================
  // 5. FRONT & BACK COVERING PANELS
  // =========================================================================
  if (config.hasFrontCovering && !config.hasDoors) {
    const frontPanel = createFrontCoveringPanel({
      length,
      width,
      height,
      elevationBottom: underShelfY,
      sheetThickness: 0.3,
      materials
    });

    if (isExploded) {
      frontPanel.position.z += explodeOffset;
    }
    masterGroup.add(frontPanel);
  }

  if (config.hasBackCovering || config.isFridge) {
    const backPanel = createBackCoveringPanel({
      length,
      width,
      height,
      elevationBottom: underShelfY,
      sheetThickness: 0.3,
      materials
    });

    if (isExploded) {
      backPanel.position.z -= explodeOffset;
    }
    masterGroup.add(backPanel);
  }

  // =========================================================================
  // 6. CABINET DOORS & DRAWERS
  // =========================================================================
  if (config.hasDoors || config.isFridge) {
    const doorCount = length > 60 ? 4 : (length > 36 ? 2 : 1);
    const doorsGroup = createCabinetDoors({
      length,
      width,
      height: config.hasDrawers ? height - 7.0 : height,
      elevationBottom: underShelfY,
      doorCount,
      materials
    });

    if (isExploded) {
      doorsGroup.position.z += explodeOffset * 1.5;
    }
    masterGroup.add(doorsGroup);
  }

  if (config.hasDrawers) {
    const drawerCount = length > 48 ? 3 : 2;
    const drawersGroup = createDrawerUnits({
      length,
      width,
      height,
      drawerCount,
      materials
    });

    if (isExploded) {
      drawersGroup.position.z += explodeOffset * 1.2;
    }
    masterGroup.add(drawersGroup);
  }

  // =========================================================================
  // 7. OVERHEAD SHELF PASS-THRU STRUCTURE
  // =========================================================================
  if (config.hasOverheadShelf) {
    const overheadGroup = createOverheadStructure({
      length,
      width,
      counterHeight: height,
      overheadHeight: 18,
      pipeSize: 1.2,
      isRound: config.isRoundPipe,
      materials
    });

    if (isExploded) {
      overheadGroup.position.y += explodeOffset * 1.5;
    }
    masterGroup.add(overheadGroup);
  }

  // =========================================================================
  // 8. SINK UNIT & WATER BASIN
  // =========================================================================
  if (config.isSinkUnit) {
    const sinkUnit = createSinkBowlUnit({
      length,
      width,
      height,
      bowlWidth: Math.min(20, length * 0.45),
      bowlDepth: Math.min(18, width * 0.75),
      bowlHeight: 10,
      materials
    });
    masterGroup.add(sinkUnit);
  }

  // =========================================================================
  // 9. GAS RANGE & DOSA BHATTI HOT PLATES / BURNERS
  // =========================================================================
  if (config.isGasRange || config.isDosaBhatti) {
    const burnersGroup = createBurnersAssembly({
      length,
      width,
      height,
      burnerCount: config.burnerCount,
      isDosa: config.isDosaBhatti,
      materials
    });

    if (isExploded) {
      burnersGroup.position.y += explodeOffset * 1.2;
    }
    masterGroup.add(burnersGroup);
  }

  // =========================================================================
  // 10. GLASS SNEEZE GUARD / DISPLAY ENCLOSURE
  // =========================================================================
  if (config.hasGlass) {
    const glassHeight = 12.0;
    const glassThickness = 0.3;
    const glassGeo = new THREE.BoxGeometry(length, glassHeight, glassThickness);
    const glassMesh = new THREE.Mesh(glassGeo, materials.glassMaterial);
    glassMesh.position.set(0, height + glassHeight / 2, width / 2 - 1.0);
    masterGroup.add(glassMesh);

    // Glass side shields
    const glassSideGeo = new THREE.BoxGeometry(glassThickness, glassHeight, width * 0.5);
    const glassLeft = new THREE.Mesh(glassSideGeo, materials.glassMaterial);
    glassLeft.position.set(-length / 2 + 0.5, height + glassHeight / 2, width / 4);
    masterGroup.add(glassLeft);

    const glassRight = new THREE.Mesh(glassSideGeo, materials.glassMaterial);
    glassRight.position.set(length / 2 - 0.5, height + glassHeight / 2, width / 4);
    masterGroup.add(glassRight);
  }

  // =========================================================================
  // 11. SS TANDOOR SPECIALIZED HOUSING
  // =========================================================================
  if (config.isTandoor) {
    // Square or Cylindrical outer body
    const bodyGeo = new THREE.BoxGeometry(length, height, width);
    const bodyMesh = createPanelWithEdges(bodyGeo, materials.ssBrushedMaterial, materials.edgeLineMaterial);
    bodyMesh.position.set(0, height / 2, 0);
    masterGroup.add(bodyMesh);

    // Top Circular Mouth Opening
    const potRadius = Math.min(length, width) * 0.35;
    const rimGeo = new THREE.TorusGeometry(potRadius, 0.8, 16, 32);
    const rimMesh = new THREE.Mesh(rimGeo, materials.darkMetalMaterial);
    rimMesh.rotation.x = Math.PI / 2;
    rimMesh.position.set(0, height + 0.5, 0);
    masterGroup.add(rimMesh);

    // Wooden Ply bottom base insulation
    const woodGeo = new THREE.BoxGeometry(length - 2, 1.5, width - 2);
    const woodMesh = new THREE.Mesh(woodGeo, materials.woodMaterial);
    woodMesh.position.set(0, 0.75, 0);
    masterGroup.add(woodMesh);
  }

  // =========================================================================
  // 12. TROLLEY PUSH/PULL HANDLE PIPE
  // =========================================================================
  if (config.isTrolley) {
    const handleGroup = new THREE.Group();
    const handlePipeGeo = new THREE.CylinderGeometry(0.6, 0.6, width * 0.8, 16);
    const handlePipeMesh = new THREE.Mesh(handlePipeGeo, materials.pipeMaterial);
    handlePipeMesh.position.set(length / 2 + 3.0, height - 2.0, 0);
    handlePipeMesh.rotation.x = Math.PI / 2;
    handleGroup.add(handlePipeMesh);

    // Two horizontal extension arms
    [-width * 0.35, width * 0.35].forEach((z) => {
      const armGeo = new THREE.BoxGeometry(3.0, 0.8, 0.8);
      const armMesh = new THREE.Mesh(armGeo, materials.pipeMaterial);
      armMesh.position.set(length / 2 + 1.5, height - 2.0, z);
      handleGroup.add(armMesh);
    });

    masterGroup.add(handleGroup);
  }

  // =========================================================================
  // 13. 3D ENGINEERING DIMENSION LINES
  // =========================================================================
  if (showDimensions) {
    const dimGroup = buildDimensionLinesGroup(length, width, height, materials.dimLineMaterial);
    masterGroup.add(dimGroup);
  }

  return masterGroup;
}
