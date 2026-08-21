'use client';

import React from 'react';
import {
  RotateCcw,
  Ruler,
  Layers,
  Sparkles,
  Play,
  Pause,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Compass,
  Box
} from 'lucide-react';

export default function ViewControls({
  activeView = '3D Isometric',
  onSelectView,
  onResetView,
  showDimensions,
  onToggleDimensions,
  isWireframe,
  onToggleWireframe,
  isExploded,
  onToggleExploded,
  isAutoRotate,
  onToggleAutoRotate,
  isDarkMode,
  onToggleDarkMode,
  isFullscreen,
  onToggleFullscreen,
}) {
  const viewPresets = [
    { id: '3D Isometric', label: '3D' },
    { id: 'Front', label: 'Front' },
    { id: 'Back', label: 'Back' },
    { id: 'Left', label: 'Left' },
    { id: 'Right', label: 'Right' },
    { id: 'Top', label: 'Top' },
  ];

  return (
    <div className="flex flex-col gap-2">
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP VIEW BUTTONS & CONTROLS BAR */}
      {/* ------------------------------------------------------------- */}
      <div className={`px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 border-b rounded-t-xl transition-colors ${
        isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
      }`}>
        {/* Left: View Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-blue-500" />
            Views:
          </span>
          {viewPresets.map((view) => {
            const isActive = activeView === view.id;
            return (
              <button
                key={view.id}
                type="button"
                onClick={() => onSelectView(view.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs scale-105'
                    : isDarkMode
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300/80 shadow-2xs'
                }`}
                title={`Switch to ${view.id} View`}
              >
                [ {view.label} ]
              </button>
            );
          })}

          <button
            type="button"
            onClick={onResetView}
            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              isDarkMode
                ? 'bg-slate-800/80 text-blue-400 hover:bg-slate-700 hover:text-blue-300'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-2xs'
            }`}
            title="Reset Camera to Default 3D View"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            [ Reset View ]
          </button>
        </div>

        {/* Right: Inspection & Visual Mode Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Dimensions Toggle */}
          <button
            type="button"
            onClick={onToggleDimensions}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              showDimensions
                ? 'bg-blue-600 text-white shadow-xs'
                : isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            title="Toggle Engineering Dimension Labels"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Dimensions</span>
          </button>

          {/* Wireframe Toggle */}
          <button
            type="button"
            onClick={onToggleWireframe}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isWireframe
                ? 'bg-indigo-600 text-white shadow-xs'
                : isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            title="Toggle Wireframe CAD Mode"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Wireframe</span>
          </button>

          {/* Exploded View Toggle */}
          <button
            type="button"
            onClick={onToggleExploded}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isExploded
                ? 'bg-amber-600 text-white shadow-xs'
                : isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            title="Inspect Internal Components (Exploded Assembly)"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Explode</span>
          </button>

          {/* Auto Rotate Toggle */}
          <button
            type="button"
            onClick={onToggleAutoRotate}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isAutoRotate
                ? 'bg-emerald-600 text-white shadow-xs'
                : isDarkMode ? 'bg-slate-800 text-slate-400 hover:text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            title="Auto Rotate Showcase"
          >
            {isAutoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">Rotate</span>
          </button>

          {/* Studio Backdrop / Dark Mode */}
          <button
            type="button"
            onClick={onToggleDarkMode}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isDarkMode ? 'bg-slate-800 text-amber-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            title="Toggle Studio Lighting / Dark Mode"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Fullscreen Expansion */}
          <button
            type="button"
            onClick={onToggleFullscreen}
            className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen Viewport'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
