import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  FileSpreadsheet, 
  ClipboardList, 
  Wrench, 
  Users,
  X,
  Globe,
  Building2,
  CheckCircle2,
  MoreVertical,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { COMPANY_DETAILS, DEFAULT_GST_PERCENT } from '@/lib/constants';

export default function Sidebar({ 
  isOpen, 
  onClose, 
  activeTab, 
  setActiveTab 
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const menuRef = useRef(null);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'builder', name: 'Estimate Builder', icon: FileSpreadsheet },
    { id: 'projects', name: 'Projects', icon: ClipboardList },
    { id: 'materials', name: 'Material Master', icon: Wrench },
    { id: 'customers', name: 'Customer Master', icon: Users },
  ];

  // Close profile dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (isMenuOpen) {
          setIsMenuOpen(false);
        } else if (isOpen) {
          onClose();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen, isOpen, onClose]);

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    onClose();
  };

  const businessItems = [
    'Commercial/Hotel Kitchen Equipment',
    'Canteen Kitchen Equipment',
    'Refrigeration Equipments',
    'Fastfood/Display Counter',
    'Exhaust Ventilation System',
    'Food Processing Machine',
    'Commercial Dishwasher'
  ];

  return (
    <>
      {/* Semi-transparent Overlay Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 transition-opacity duration-300 animate-in fade-in"
          aria-hidden="true"
        />
      )}

      {/* Slide-out Navigation Drawer from Left */}
      <aside 
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 sm:w-80 bg-white border-r border-slate-200 flex flex-col text-slate-700 shadow-2xl transition-transform duration-300 ease-in-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigation drawer"
      >
        {/* Brand Header & Close Button */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-emerald-500/20 shrink-0">
              S
            </div>
            <div className="overflow-hidden">
              <h1 className="font-black text-slate-900 tracking-tight text-xs uppercase leading-tight truncate">
                SHREE BALAJI
              </h1>
              <span className="text-[10px] text-emerald-700 font-bold tracking-widest uppercase block mt-0.5">
                ESTIMATE
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900 transition-colors shrink-0"
            aria-label="Close navigation"
            title="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon 
                  className={`w-4 h-4 transition-transform duration-200 ${
                    isActive ? 'text-emerald-600' : 'text-slate-400'
                  }`} 
                />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Compact User / Profile Area (Bottom of Drawer) */}
        <div className="relative p-3.5 border-t border-slate-200 bg-slate-50/70" ref={menuRef}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-black text-xs shrink-0">
                S
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {COMPANY_DETAILS.name}
                </p>
                <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                  Commercial Kitchen Estimate
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMenuOpen(prev => !prev)}
              className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all shrink-0 shadow-2xs"
              title="Profile Options"
              aria-label="Profile options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>

          {/* Three-Dot Popover Menu */}
          {isMenuOpen && (
            <div className="absolute bottom-full left-3 right-3 mb-2 bg-white border border-slate-200 rounded-xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Profile</span>
                <span className="text-xs font-black text-slate-900 block truncate">{COMPANY_DETAILS.name}</span>
              </div>
              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsProfileModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsSettingsModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    alert('Shree Balaji Enterprises — System is active and synchronized.');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Company Profile Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-base shadow-sm shrink-0">
                  S
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 leading-tight">{COMPANY_DETAILS.name}</h2>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider">Company Profile</span>
                </div>
              </div>
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5 text-xs text-slate-700 max-h-[460px] overflow-y-auto">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Specialized Equipment & Services
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {businessItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] font-medium text-slate-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Website */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Official Website
                  </span>
                  <a
                    href={COMPANY_DETAILS.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1.5"
                  >
                    <Globe className="w-3.5 h-3.5 text-emerald-600" />
                    {COMPANY_DETAILS.website}
                  </a>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">System Settings</h3>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Default Currency</span>
                  <span className="font-bold text-slate-900">INR (₹)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Standard GST</span>
                  <span className="font-bold text-slate-900">{DEFAULT_GST_PERCENT}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Sheet Dimension Unit</span>
                  <span className="font-bold text-slate-900">inch</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Pipe Length Unit</span>
                  <span className="font-bold text-slate-900">ft</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end p-3.5 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
