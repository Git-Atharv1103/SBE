"use client";

import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import EstimateBuilder from '@/components/EstimateBuilder';
import ProjectsList from '@/components/ProjectsList';
import MaterialMaster from '@/components/MaterialMaster';
import CustomerMaster from '@/components/CustomerMaster';
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

  const tabLabels = {
    dashboard: 'Dashboard',
    builder: 'Estimate Builder',
    projects: 'Projects',
    materials: 'Material Master',
    customers: 'Customer Master'
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
      case 'customers':
        return <CustomerMaster />;
      default:
        return (
          <Dashboard 
            setActiveTab={setActiveTab} 
            onNewProject={handleNewProject} 
          />
        );
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 font-sans antialiased text-slate-800">
      {/* Top Application Header Bar with Hamburger Button */}
      <header className="h-14 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-xs z-30">
        <div className="flex items-center gap-3.5">
          {/* Hamburger Menu Button (☰) */}
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="p-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 transition-all shadow-2xs flex items-center justify-center cursor-pointer"
            aria-label="Open navigation"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-slate-800" />
          </button>

          {/* Company Title & Subtitle */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-xs shadow-xs shrink-0">
              S
            </div>
            <div>
              <span className="font-black text-slate-900 text-xs sm:text-sm tracking-tight leading-none block">
                SHREE BALAJI ESTIMATE
              </span>
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block mt-0.5">
                Commercial Kitchen Estimation
              </span>
            </div>
          </div>
        </div>

        {/* Current Active View Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500 hidden sm:inline-block">View:</span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            {tabLabels[activeTab] || 'Dashboard'}
          </span>
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
      <main className="flex-1 min-w-0 w-full overflow-y-auto bg-slate-50">
        {renderContent()}
      </main>
    </div>
  );
}
