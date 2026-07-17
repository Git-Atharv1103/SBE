"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import EstimateBuilder from '@/components/EstimateBuilder';
import ProjectsList from '@/components/ProjectsList';
import MaterialMaster from '@/components/MaterialMaster';
import CustomerMaster from '@/components/CustomerMaster';

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projectToEdit, setProjectToEdit] = useState(null);

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
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans antialiased text-slate-200">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {/* Main Panel Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}
