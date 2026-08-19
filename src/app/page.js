"use client";

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import EstimateBuilder from '@/components/EstimateBuilder';
import ProjectsList from '@/components/ProjectsList';
import MaterialMaster from '@/components/MaterialMaster';
import { AlertProvider } from '@/context/AlertContext';
import { COMPANY_DETAILS } from '@/lib/constants';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Auto-run DB seeding on launch
  useEffect(() => {
    const runSetup = async () => {
      try {
        await fetch('/api/setup');
      } catch (error) {
        console.error('Failed to seed default categories & mock data:', error);
      }
    };
    runSetup();
  }, []);

  const handleEditProject = (project) => {
    setProjectToEdit(project);
    setActiveTab('builder');
  };

  const handleNewProject = () => {
    setProjectToEdit(null);
  };

  const tabConfig = {
    dashboard: { label: 'Executive Dashboard', color: 'bg-emerald-50 text-emerald-800 border-emerald-200', dot: 'bg-emerald-500' },
    builder: { label: 'Project Estimate Builder', color: 'bg-blue-50 text-blue-800 border-blue-200', dot: 'bg-blue-500' },
    projects: { label: 'Project Estimations', color: 'bg-indigo-50 text-indigo-800 border-indigo-200', dot: 'bg-indigo-500' },
    materials: { label: 'Material & Counter Master', color: 'bg-sky-50 text-sky-800 border-sky-200', dot: 'bg-sky-500' }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            setActiveTab={setActiveTab}
            onNewProject={handleNewProject}
          />
        );
      case 'builder':
        return (
          <EstimateBuilder
            projectToEdit={projectToEdit}
            onSaveSuccess={() => {
              setProjectToEdit(null);
              setActiveTab('projects');
            }}
          />
        );
      case 'projects':
        return (
          <ProjectsList
            onEditProject={handleEditProject}
            setActiveTab={setActiveTab}
          />
        );
      case 'materials':
        return <MaterialMaster />;
      default:
        return (
          <Dashboard
            setActiveTab={setActiveTab}
            onNewProject={handleNewProject}
          />
        );
    }
  };

  const currentTab = tabConfig[activeTab] || tabConfig.dashboard;

  return (
    <AlertProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50/50 font-sans antialiased text-slate-800 select-none">
        {/* Top 3D Application Header Bar */}
        <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-30">
          <div className="flex items-center gap-3.5">
            {/* 3D Hamburger Menu Button (☰) */}
            <button
              onClick={() => setIsSidebarOpen(prev => !prev)}
              className="p-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-linear-to-b from-white to-slate-50 hover:to-slate-100 text-slate-700 hover:text-slate-900 transition-all shadow-xs active:translate-y-0.5 cursor-pointer flex items-center justify-center"
              aria-label="Open navigation"
              title="Open navigation menu"
            >
              <Menu className="w-5 h-5 text-slate-800" />
            </button>

            {/* 3D Brand Logo & Company Title */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
              <div className="w-8.5 h-8.5 rounded-xl bg-linear-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/25 border border-emerald-400/40 shrink-0">
                S
              </div>
              <div className="leading-none">
                <span className="font-black text-slate-900 text-xs sm:text-sm tracking-tight block">
                  SHREE BALAJI ENTERPRISES
                </span>
                <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block mt-0.5">
                  Commercial Kitchen Equipment Estimation
                </span>
              </div>
            </div>
          </div>

          {/* Current Active View 3D Pill Badge */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline-block">Section</span>
            <div className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-xs ${currentTab.color}`}>
              <span className={`w-2 h-2 rounded-full ${currentTab.dot} animate-pulse`} />
              {currentTab.label}
            </div>
          </div>
        </header>

        {/* Slide-out Navigation Drawer (Hidden by default) */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {/* Main Full-Width Content Area */}
        <main className="flex-1 min-w-0 w-full overflow-y-auto bg-slate-50/60">
          {renderContent()}
        </main>
      </div>
    </AlertProvider>
  );
}
