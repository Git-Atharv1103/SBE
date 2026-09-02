"use client";

import React, { useState, useEffect } from 'react';
import { Menu, RotateCcw, AlertTriangle, ShieldCheck, CheckCircle2, Loader2, X } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import EstimateBuilder from '@/components/EstimateBuilder';
import ProjectsList from '@/components/ProjectsList';
import MaterialMaster from '@/components/MaterialMaster';
import { AlertProvider, useAlert } from '@/context/AlertContext';
import { COMPANY_DETAILS } from '@/lib/constants';

function MainApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projectToEdit, setProjectToEdit] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [testerId, setTesterId] = useState('');
  const { showAlert } = useAlert();

  // Load or generate unique tester ID for isolated testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let storedId = localStorage.getItem('sbe_tester_id');
      if (!storedId) {
        storedId = 'tester_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('sbe_tester_id', storedId);
      }
      setTesterId(storedId);
    }
  }, []);

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

  const handleResetTestData = async () => {
    try {
      setIsResetting(true);
      const res = await fetch('/api/test-db/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testerId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsResetModalOpen(false);
        await showAlert({
          title: 'Test Data Cleared',
          message: 'All your test estimates and clients have been cleanly deleted. The material catalog and master configuration are intact.',
          type: 'success'
        });
        setActiveTab('dashboard');
        // Force refresh state
        window.location.reload();
      } else {
        await showAlert({
          title: 'Reset Failed',
          message: data.error || 'Failed to reset test data.',
          type: 'error'
        });
      }
    } catch (e) {
      await showAlert({
        title: 'Error',
        message: 'Network error while resetting test data.',
        type: 'error'
      });
    } finally {
      setIsResetting(false);
    }
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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50/50 font-sans antialiased text-slate-800 select-none">
      {/* Top 3D Application Header Bar */}
      <header className="h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-3 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-30">
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* 3D Hamburger Menu Button (☰) */}
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="p-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-linear-to-b from-white to-slate-50 hover:to-slate-100 text-slate-700 hover:text-slate-900 transition-all shadow-xs active:translate-y-0.5 cursor-pointer flex items-center justify-center"
            aria-label="Open navigation"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-slate-800" />
          </button>

          {/* 3D Brand Logo & Company Title */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl bg-linear-to-tr from-emerald-600 via-emerald-500 to-teal-400 flex items-center justify-center text-white font-black text-sm shadow-md shadow-emerald-500/25 border border-emerald-400/40 shrink-0">
              S
            </div>
            <div className="leading-none">
              <span className="font-black text-slate-900 text-xs sm:text-sm tracking-tight block">
                SHREE BALAJI ENTERPRISES
              </span>
              <span className="text-[9px] sm:text-[10px] text-emerald-700 font-bold uppercase tracking-wider block mt-0.5">
                Commercial Kitchen Estimation
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Badges and Reset Button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Testing Environment Staging Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-300 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-mono">Testing DB Active</span>
          </div>

          {/* Reset Test Data Button */}
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-rose-200 hover:border-rose-300 bg-rose-50 hover:bg-rose-100/80 text-rose-800 text-[11px] sm:text-xs font-bold transition-all shadow-2xs active:translate-y-0.5 cursor-pointer"
            title="Clear all test estimates and clients"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden sm:inline">Reset Test Data</span>
            <span className="sm:hidden">Reset</span>
          </button>

          {/* Current Active View 3D Pill Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-xs ${currentTab.color}">
            <span className={`w-2 h-2 rounded-full ${currentTab.dot} animate-pulse`} />
            {currentTab.label}
          </div>
        </div>
      </header>

      {/* Slide-out Navigation Drawer */}
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

      {/* RESET TEST DATA CONFIRMATION MODAL */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 relative">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5 text-rose-600">
                <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Reset Test Environment Data</h3>
                  <span className="text-[10px] text-slate-500 font-semibold">Testing Session Partition: {testerId}</span>
                </div>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 mb-6 text-xs text-slate-600 leading-relaxed">
              <p className="font-semibold text-slate-800">
                Are you sure you want to clear your test estimates and customer records?
              </p>
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-950 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  Production &amp; Catalogs are Safe
                </div>
                <p className="text-[11px] text-emerald-800">
                  This will ONLY delete test estimates and clients created in this testing session. Material master prices and live database records will NOT be affected.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsResetModalOpen(false)}
                disabled={isResetting}
                className="btn-3d btn-3d-slate px-4 py-2 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetTestData}
                disabled={isResetting}
                className="btn-3d px-5 py-2 text-xs bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 border border-rose-500 cursor-pointer flex items-center gap-2 font-bold"
              >
                {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Home() {
  return (
    <AlertProvider>
      <MainApp />
    </AlertProvider>
  );
}

