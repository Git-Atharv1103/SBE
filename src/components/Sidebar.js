import React from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  ClipboardList, 
  Wrench, 
  Users, 
  Settings 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'builder', name: 'Estimate Builder', icon: FileSpreadsheet },
    { id: 'projects', name: 'Projects', icon: ClipboardList },
    { id: 'materials', name: 'Material Master', icon: Wrench },
    { id: 'customers', name: 'Customer Master', icon: Users },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen text-slate-300 shrink-0 sticky top-0">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800 gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-900/30">
          M
        </div>
        <div>
          <h1 className="font-bold text-white tracking-wide text-lg leading-tight">META-FAB</h1>
          <span className="text-xs text-slate-500 font-medium tracking-widest uppercase">Estimator Pro</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/5 text-emerald-400 border-l-4 border-emerald-500 pl-3'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 pl-4'
              }`}
            >
              <Icon 
                className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${
                  isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                }`} 
              />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 font-semibold text-sm">
          A
        </div>
        <div className="flex-1 overflow-hidden">
          <p className="text-xs font-semibold text-slate-200 truncate">Administrator</p>
          <p className="text-[10px] text-slate-500 truncate">admin@metafab.com</p>
        </div>
      </div>
    </aside>
  );
}
