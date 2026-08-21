'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Box, Info, Sparkles, Layers, Ruler, X, CheckCircle, Eye, Bug, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { createMaterialLibrary } from '@/lib/3dStructureConfig';
import { build3DStructure } from '@/lib/3dStructureEngine';
import { buildCounter3DModel } from './Counter3DModel';
import ViewControls from './ViewControls';
import { calculateRowWeight } from '@/lib/calculations';

export default function Counter3DViewer({
  counterType = '',
  counterSubtype = '',
  sheets = [],
  pipes = [],
  angles = [],
  purchased = [],
  compressor = [],
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelGroupRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const gridHelperRef = useRef(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  // Viewport Settings & UI State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDimensions, setShowDimensions] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);
  const [isExploded, setIsExploded] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [activeView, setActiveView] = useState('3D Isometric');
  const [selectedComponent, setSelectedComponent] = useState(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // 1. Generate Parametric Intermediate Representation directly from Material Spec
  const structureResult = useMemo(() => {
    return build3DStructure({
      counterType,
      sheets,
      pipes,
      angles,
      purchased,
      compressor
    });
  }, [counterType, sheets, pipes, angles, purchased, compressor]);

  const configuredPartsCount = structureResult.configuredPartsCount;
  const hasAnyActiveComponent = structureResult.parts.length > 0;
  const bounds = structureResult.bounds || { length: 48, width: 36, height: 34 };
  const debugInfo = structureResult.debugInfo || {};

  // -------------------------------------------------------------
  // THREE.JS INITIALIZATION & LIFECYCLE
  // -------------------------------------------------------------
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = new THREE.Color(isDarkMode ? 0x0f172a : 0xffffff);

    // 2. Camera
    const widthPx = container.clientWidth || 800;
    const heightPx = container.clientHeight || 480;
    const camera = new THREE.PerspectiveCamera(45, widthPx / heightPx, 0.1, 2000);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(widthPx, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 + 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 300;
    controlsRef.current = controls;

    // 5. Studio Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, isDarkMode ? 0.75 : 0.95);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(60, 90, 70);
    dirLight1.castShadow = true;
    dirLight1.shadow.mapSize.width = 1024;
    dirLight1.shadow.mapSize.height = 1024;
    dirLight1.shadow.camera.near = 10;
    dirLight1.shadow.camera.far = 300;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x93c5fd, 0.65);
    dirLight2.position.set(-60, 50, -50);
    scene.add(dirLight2);

    const floorBounce = new THREE.DirectionalLight(0xe2e8f0, 0.4);
    floorBounce.position.set(0, -30, 0);
    scene.add(floorBounce);

    // 6. Ground Grid & Soft Shadow Floor
    const gridHelper = new THREE.GridHelper(160, 32, isDarkMode ? 0x38bdf8 : 0x0284c7, isDarkMode ? 0x334155 : 0xe2e8f0);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    const shadowPlaneGeo = new THREE.PlaneGeometry(200, 200);
    const shadowPlaneMat = new THREE.ShadowMaterial({ opacity: isDarkMode ? 0.45 : 0.2 });
    const shadowPlane = new THREE.Mesh(shadowPlaneGeo, shadowPlaneMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -0.08;
    shadowPlane.receiveShadow = true;
    scene.add(shadowPlane);

    // Set Initial Isometric View
    setCameraPreset('3D Isometric', bounds.length || 48, bounds.width || 36, bounds.height || 34, camera, controls);

    // 7. Render Loop
    let isSubscribed = true;
    const animate = () => {
      if (!isSubscribed) return;
      animationFrameIdIdRef.current = requestAnimationFrame(animate);

      if (controlsRef.current) {
        controlsRef.current.update();
      }

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    let animationFrameIdRef = animationFrameIdIdRef;
    animate();

    // 8. Raycasting Click Listener for Component Selection
    const handleCanvasClick = (event) => {
      if (!mountRef.current || !cameraRef.current || !sceneRef.current) return;
      const rect = mountRef.current.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      if (modelGroupRef.current) {
        const intersects = raycasterRef.current.intersectObjects(modelGroupRef.current.children, true);
        const hit = intersects.find(i => i.object.isMesh && i.object.userData && (i.object.userData.material || i.object.userData.name));
        if (hit) {
          const rowData = hit.object.userData;
          const weight = calculateRowWeight(rowData);
          setSelectedComponent({
            ...rowData,
            calculatedWeight: weight
          });
        }
      }
    };

    container.addEventListener('click', handleCanvasClick);

    // 9. Responsive Resize Observer
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth || 800;
      const h = container.clientHeight || 480;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);

    return () => {
      isSubscribed = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      container.removeEventListener('click', handleCanvasClick);
      resizeObserver.disconnect();
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  const animationFrameIdIdRef = useRef(null);

  // Update Scene Background on Mode Toggle
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(isDarkMode ? 0x0f172a : 0xffffff);
    }
  }, [isDarkMode]);

  // Update Auto-Rotate
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotate;
      controlsRef.current.autoRotateSpeed = 2.0;
    }
  }, [isAutoRotate]);

  // -------------------------------------------------------------
  // REBUILD 3D MODEL FROM MATERIAL SPECIFICATION
  // -------------------------------------------------------------
  useEffect(() => {
    if (!sceneRef.current) return;

    if (modelGroupRef.current) {
      sceneRef.current.remove(modelGroupRef.current);
      modelGroupRef.current.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      modelGroupRef.current = null;
    }

    if (!hasAnyActiveComponent) return;

    const newModel = buildCounter3DModel({
      counterType,
      sheets,
      pipes,
      angles,
      purchased,
      compressor,
      showDimensions,
      isWireframe,
      isExploded
    });

    sceneRef.current.add(newModel);
    modelGroupRef.current = newModel;
  }, [
    counterType,
    hasAnyActiveComponent,
    sheets,
    pipes,
    angles,
    purchased,
    compressor,
    showDimensions,
    isWireframe,
    isExploded
  ]);

  // -------------------------------------------------------------
  // CAMERA VIEW PRESET CONTROLLER
  // -------------------------------------------------------------
  const setCameraPreset = useCallback((viewName, l = bounds.length || 48, w = bounds.width || 36, h = bounds.height || 34, cam = cameraRef.current, ctrl = controlsRef.current) => {
    if (!cam || !ctrl) return;

    setActiveView(viewName);
    const targetY = h / 2;
    ctrl.target.set(0, targetY, 0);

    const maxDim = Math.max(l, w, h, 36);
    const dist = maxDim * 1.8;

    switch (viewName) {
      case 'Front':
        cam.position.set(0, targetY, dist);
        break;
      case 'Back':
        cam.position.set(0, targetY, -dist);
        break;
      case 'Left':
        cam.position.set(-dist, targetY, 0);
        break;
      case 'Right':
        cam.position.set(dist, targetY, 0);
        break;
      case 'Top':
        cam.position.set(0, dist * 1.3, 0.1);
        break;
      case '3D Isometric':
      default:
        cam.position.set(l * 1.1 + dist * 0.5, h * 1.2 + dist * 0.4, w * 1.1 + dist * 0.6);
        break;
    }

    cam.lookAt(0, targetY, 0);
    ctrl.update();
  }, [bounds.length, bounds.width, bounds.height]);

  return (
    <div className={`card-3d overflow-hidden border-2 transition-all duration-300 ${
      isFullscreen
        ? 'fixed inset-0 z-50 rounded-none bg-white flex flex-col'
        : 'w-full border-blue-200/80 bg-white my-6 shadow-md'
    }`}>
      {/* ------------------------------------------------------------- */}
      {/* 1. HEADER TITLE & DERIVED STRUCTURE INFO BADGE */}
      {/* ------------------------------------------------------------- */}
      <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 bg-linear-to-r from-blue-50/50 via-indigo-50/20 to-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20">
            <Box className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                3D Structure Preview
              </h3>
              {hasAnyActiveComponent ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {configuredPartsCount} Physical Part(s)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                  Empty Model
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-500 font-semibold block">
              {counterType || 'No Counter Selected'} {counterSubtype ? `— ${counterSubtype}` : ''}
            </span>
          </div>
        </div>

        {/* Read-Only Derived Dimensions & Debug Trigger */}
        <div className="flex items-center gap-2 flex-wrap">
          {hasAnyActiveComponent && (
            <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs">
              <Ruler className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Structure:</span>
              <span className="font-mono text-xs font-black text-slate-800">
                {bounds.length}" × {bounds.width}" × {bounds.height}"
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
              showDebugPanel
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Inspect Parametric 3D Engine data"
          >
            <Bug className="w-3.5 h-3.5" />
            <span className="text-[11px]">Debug Engine</span>
            {showDebugPanel ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. VIEW CONTROLS TOOLBAR */}
      {/* ------------------------------------------------------------- */}
      <ViewControls
        activeView={activeView}
        onSelectView={(v) => setCameraPreset(v)}
        onResetView={() => setCameraPreset('3D Isometric')}
        showDimensions={showDimensions}
        onToggleDimensions={() => setShowDimensions(!showDimensions)}
        isWireframe={isWireframe}
        onToggleWireframe={() => setIsWireframe(!isWireframe)}
        isExploded={isExploded}
        onToggleExploded={() => setIsExploded(!isExploded)}
        isAutoRotate={isAutoRotate}
        onToggleAutoRotate={() => setIsAutoRotate(!isAutoRotate)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
      />

      {/* ------------------------------------------------------------- */}
      {/* 3. 3D VIEWPORT CANVAS & INTERACTIVE INSPECTOR */}
      {/* ------------------------------------------------------------- */}
      <div className="relative w-full flex-1 min-h-[380px] sm:min-h-[440px] lg:min-h-[500px] bg-white">
        {/* WebGL Canvas Element */}
        <div ref={mountRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

        {/* Empty State: No configured components */}
        {!hasAnyActiveComponent && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center z-10">
            <Box className="w-12 h-12 text-slate-300 mb-3 animate-pulse" />
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider mb-1">
              Empty Structure
            </h4>
            <p className="text-xs text-slate-500 max-w-md font-medium">
              Add components in Material Specification to view 3D structure.
            </p>
          </div>
        )}

        {/* Navigation Hint */}
        {hasAnyActiveComponent && (
          <div className="absolute bottom-3 left-3 bg-slate-900/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] text-slate-200 pointer-events-none flex items-center gap-3 shadow-lg z-10">
            <span className="flex items-center gap-1">
              <strong className="text-white">Rotate:</strong> Left Click + Drag
            </span>
            <span className="flex items-center gap-1">
              <strong className="text-white">Pan:</strong> Right Click + Drag
            </span>
            <span className="flex items-center gap-1">
              <strong className="text-white">Inspect:</strong> Click Component
            </span>
          </div>
        )}

        {/* Active Parts Badge */}
        {hasAnyActiveComponent && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-200 text-[11px] text-slate-700 flex flex-col gap-0.5 shadow-md z-10">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Structure:</span>
              <span className="font-mono font-black text-blue-700">
                {bounds.length}" × {bounds.width}" × {bounds.height}"
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Rendered:</span>
              <span className="font-mono font-bold text-emerald-700">{configuredPartsCount} parts</span>
            </div>
          </div>
        )}

        {/* Interactive Component Selection Inspector Card */}
        {selectedComponent && (
          <div className="absolute top-3 left-3 w-72 bg-white/95 backdrop-blur-md border-2 border-cyan-500/80 rounded-2xl p-4 shadow-xl z-20 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
                <span className="text-xs font-black text-slate-900 uppercase tracking-wide truncate">
                  {selectedComponent.material || selectedComponent.name || 'Component'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedComponent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Material Name:</span>
                <span className="font-bold text-slate-800">{selectedComponent.material || selectedComponent.name}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Category:</span>
                <span className="font-bold text-slate-800">{selectedComponent.type || 'Material'}</span>
              </div>

              {selectedComponent.grade && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Grade:</span>
                  <span className="font-mono font-bold text-slate-800">SS {selectedComponent.grade}</span>
                </div>
              )}

              {selectedComponent.gauge && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Gauge:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedComponent.gauge} mm</span>
                </div>
              )}

              {selectedComponent.pipeSize && (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Pipe Gauge:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedComponent.pipeSize}</span>
                </div>
              )}

              {selectedComponent.length && selectedComponent.width ? (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Dimensions:</span>
                  <span className="font-mono font-bold text-blue-700">{selectedComponent.length}" × {selectedComponent.width}"</span>
                </div>
              ) : selectedComponent.length ? (
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Length:</span>
                  <span className="font-mono font-bold text-blue-700">{selectedComponent.length} ft</span>
                </div>
              ) : null}

              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-400">Quantity:</span>
                <span className="font-mono font-bold text-slate-800">{selectedComponent.quantity || 1}</span>
              </div>

              {selectedComponent.calculatedWeight !== undefined && selectedComponent.calculatedWeight > 0 && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-emerald-600">Weight:</span>
                  <span className="font-mono font-black text-emerald-700">{selectedComponent.calculatedWeight.toFixed(2)} kg</span>
                </div>
              )}

              {selectedComponent.sourceRowId && (
                <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1">
                  <span>Source Row ID:</span>
                  <span className="font-mono">{selectedComponent.sourceRowId}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Collapsible Debug Inspector Panel */}
        {showDebugPanel && (
          <div className="absolute top-14 right-3 w-84 max-h-[420px] overflow-y-auto bg-slate-900/95 text-slate-200 backdrop-blur-md rounded-2xl p-4 shadow-2xl z-30 border border-slate-800 text-xs animate-in fade-in zoom-in-95 duration-150 font-mono">
            <div className="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Bug className="w-4 h-4 text-blue-400" />
                <span className="font-bold uppercase text-slate-100 text-[11px]">3D Engine Inspector</span>
              </div>
              <button
                type="button"
                onClick={() => setShowDebugPanel(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3 text-[11px]">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Spec Rows:</span>
                  <span className="text-white font-bold text-xs">{debugInfo.totalRows || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Rendered 3D Parts:</span>
                  <span className="text-emerald-400 font-bold text-xs">{debugInfo.renderedCount || 0}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Phantom Parts:</span>
                  <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                    <Check className="w-3 h-3" /> 0 (Strict)
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">Calculated Bounds:</span>
                  <span className="text-cyan-400 font-bold text-[10px]">{bounds.length}" × {bounds.width}" × {bounds.height}"</span>
                </div>
              </div>

              {/* Component Categories Breakdown */}
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 space-y-1 text-[10px]">
                <div className="flex justify-between text-slate-300">
                  <span>Sheets Rendered:</span>
                  <span className="font-bold text-white">{debugInfo.sheetCount || 0}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Pipes Rendered:</span>
                  <span className="font-bold text-white">{debugInfo.pipeCount || 0}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Angles Rendered:</span>
                  <span className="font-bold text-white">{debugInfo.angleCount || 0}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Purchased Rendered:</span>
                  <span className="font-bold text-white">{debugInfo.purchasedCount || 0}</span>
                </div>
              </div>

              {/* Rendered 3D Parts List */}
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                  Rendered 3D Objects ({structureResult.parts?.length || 0}):
                </span>
                <div className="space-y-1 bg-slate-950 p-2 rounded-lg max-h-32 overflow-y-auto text-[10px]">
                  {(structureResult.parts || []).map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-slate-300 border-b border-slate-800/50 pb-0.5">
                      <div className="truncate max-w-[150px]">
                        <span className="text-white font-bold">{p.name}</span>
                      </div>
                      <span className="text-cyan-400 font-bold text-[9px]">{p.role}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. FOOTER STATUS BAR */}
      {/* ------------------------------------------------------------- */}
      <div className="px-5 py-2.5 flex items-center justify-between flex-wrap gap-2 text-[11px] border-t border-slate-100 bg-slate-50/80 text-slate-600">
        <div className="flex items-center gap-2 font-medium">
          <Info className="w-3.5 h-3.5 text-blue-600" />
          <span>
            {hasAnyActiveComponent
              ? `Derived directly from Material Specification (${configuredPartsCount} physical part(s) generated).`
              : 'Add component rows in Material Specification above to build the 3D model.'}
          </span>
        </div>

        {hasAnyActiveComponent && (
          <div className="flex items-center gap-3 font-mono font-bold">
            <span className="text-blue-700">L: {bounds.length}"</span>
            <span className="text-indigo-700">W: {bounds.width}"</span>
            <span className="text-teal-700">H: {bounds.height}"</span>
          </div>
        )}
      </div>
    </div>
  );
}
