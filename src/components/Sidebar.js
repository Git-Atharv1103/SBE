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
  LogOut,
  Database,
  RefreshCw,
  Server,
  Activity,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { COMPANY_DETAILS, DEFAULT_GST_PERCENT } from '@/lib/constants';
import { useAlert } from '@/context/AlertContext';

export default function Sidebar({ 
  isOpen, 
  onClose, 
  activeTab, 
  setActiveTab 
}) {
  const { showAlert } = useAlert();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState(null);
  const [isCheckingDb, setIsCheckingDb] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const menuRef = useRef(null);

  const fetchDbStatus = async () => {
    try {
      setIsCheckingDb(true);
      const res = await fetch('/api/db-status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(data);
      }
    } catch (e) {
      console.error('Failed to fetch DB status:', e);
    } finally {
      setIsCheckingDb(false);
    }
  };

  useEffect(() => {
    fetchDbStatus();
  }, []);

  const handleMigrateToMongo = async () => {
    try {
      setIsMigrating(true);
      const res = await fetch('/api/db-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'migrate_to_mongo' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDbStatus(data.diagnostics || data);
        await showAlert({
          title: 'Migration Successful',
          message: `Successfully migrated records to MongoDB: ${data.migrated?.materials || 0} materials, ${data.migrated?.counterTypes || 0} counter types, ${data.migrated?.projects || 0} projects.`,
          type: 'success'
        });
      } else {
        await showAlert({
          title: 'Migration Failed',
          message: data.error || 'Could not migrate to MongoDB. Ensure MongoDB is active.',
          type: 'error'
        });
      }
    } catch (e) {
      await showAlert({
        title: 'Error',
        message: 'Network error during migration.',
        type: 'error'
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      name: 'Dashboard', 
      icon: LayoutDashboard,
      activeColor: 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs',
      iconColor: 'text-emerald-600',
      tag: 'Overview'
    },
    { 
      id: 'builder', 
      name: 'Project Estimate', 
      icon: FileSpreadsheet,
      activeColor: 'bg-blue-50 text-blue-800 border-blue-200 shadow-xs',
      iconColor: 'text-blue-600',
      tag: 'Calculator'
    },
    { 
      id: 'projects', 
      name: 'Projects', 
      icon: ClipboardList,
      activeColor: 'bg-indigo-50 text-indigo-800 border-indigo-200 shadow-xs',
      iconColor: 'text-indigo-600',
      tag: 'Quotations'
    },
    { 
      id: 'materials', 
      name: 'Material Master', 
      icon: Wrench,
      activeColor: 'bg-sky-50 text-sky-800 border-sky-200 shadow-xs',
      iconColor: 'text-sky-600',
      tag: 'Catalog'
    },
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
        className={`fixed top-0 bottom-0 left-0 w-72 max-w-[85vw] bg-white border-r border-slate-200 shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar Navigation"
      >
        {/* Drawer Header */}
        <div className="h-16 px-4 border-b border-slate-200 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-xs shadow-sm">
              S
            </div>
            <div>
              <span className="font-black text-slate-900 text-xs tracking-tight block">
                SHREE BALAJI
              </span>
              <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                Estimation Suite
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            title="Close navigation"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Database Status Indicator Pill */}
        <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className={`w-2 h-2 rounded-full shrink-0 ${
              dbStatus?.mode === 'mongodb' && dbStatus?.connected
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-amber-500'
            }`} />
            <span className="font-semibold text-slate-700 truncate">
              {dbStatus?.mode === 'mongodb' && dbStatus?.connected
                ? `MongoDB Online (${dbStatus.latencyMs || 1}ms)`
                : 'Local JSON Storage'}
            </span>
          </div>
          <button
            onClick={() => fetchDbStatus()}
            disabled={isCheckingDb}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
            title="Refresh database status"
          >
            <RefreshCw className={`w-3 h-3 ${isCheckingDb ? 'animate-spin text-emerald-600' : ''}`} />
          </button>
        </div>

        {/* Main Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                  isActive 
                    ? item.activeColor 
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${
                    isActive ? 'bg-white shadow-2xs' : 'bg-slate-100'
                  }`}>
                    <Icon className={`w-4 h-4 ${isActive ? item.iconColor : 'text-slate-500'}`} />
                  </div>
                  <span>{item.name}</span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                  isActive ? 'bg-white/80 text-slate-700 shadow-2xs' : 'text-slate-400'
                }`}>
                  {item.tag}
                </span>
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
              className="p-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-all shrink-0 shadow-2xs cursor-pointer"
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
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors cursor-pointer"
                >
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsSettingsModalOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-500" />
                  Settings & Database
                </button>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    showAlert({
                      title: 'System Status',
                      message: `Shree Balaji Enterprises — System active. Current Database: ${dbStatus?.mode === 'mongodb' ? 'MongoDB' : 'Local JSON Storage'} (${dbStatus?.counts?.materials || 0} materials, ${dbStatus?.counts?.projects || 0} projects).`,
                      type: 'info'
                    });
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5 text-slate-400" />
                  System Health
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
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg cursor-pointer"
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

              {/* Contact Info */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Official Email
                  </span>
                  <span className="text-xs font-bold text-emerald-700">{COMPANY_DETAILS.email}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Phone Numbers
                  </span>
                  <span className="text-xs font-semibold text-slate-800">{COMPANY_DETAILS.phone}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                    Office / Works Address
                  </span>
                  <span className="text-xs text-slate-600">{COMPANY_DETAILS.address}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end p-4 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setIsProfileModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings & Database Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">System & Database Settings</h3>
              </div>
              <button onClick={() => setIsSettingsModalOpen(false)} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs text-slate-700 max-h-[500px] overflow-y-auto">
              {/* Database Status Panel */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-slate-600" />
                    Database Connection
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    dbStatus?.mode === 'mongodb' && dbStatus?.connected
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-800 border border-amber-200'
                  }`}>
                    {dbStatus?.mode === 'mongodb' && dbStatus?.connected ? 'MongoDB Active' : 'Local JSON Active'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-3 rounded-lg border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Database Name</span>
                    <span className="font-semibold text-slate-800 truncate block">{dbStatus?.databaseName || 'shree_balaji_db'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Latency</span>
                    <span className="font-semibold text-slate-800">{dbStatus?.latencyMs ? `${dbStatus.latencyMs} ms` : 'Local (Instant)'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Master Materials</span>
                    <span className="font-bold text-emerald-700">{dbStatus?.counts?.materials || 0}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Saved Estimates</span>
                    <span className="font-bold text-blue-700">{dbStatus?.counts?.projects || 0}</span>
                  </div>
                </div>

                {dbStatus?.mode !== 'mongodb' && (
                  <div className="bg-amber-50/80 p-3 rounded-lg border border-amber-200/80 text-[11px] text-amber-900 space-y-1">
                    <p className="font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      MongoDB Connection Guide
                    </p>
                    <p className="text-slate-600 text-[10px] leading-relaxed">
                      To connect MongoDB Atlas or local MongoDB, add your connection string to <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-slate-800">.env.local</code>:
                    </p>
                    <code className="block bg-slate-900 text-emerald-400 p-2 rounded text-[10px] font-mono break-all select-all">
                      MONGODB_URI=mongodb+srv://&lt;user&gt;:&lt;password&gt;@cluster0.mongodb.net/shree_balaji_db
                    </code>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => fetchDbStatus()}
                    disabled={isCheckingDb}
                    className="flex-1 py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg font-bold text-slate-700 text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isCheckingDb ? 'animate-spin' : ''}`} />
                    Test Connection
                  </button>

                  {dbStatus?.mode === 'mongodb' && dbStatus?.connected && (
                    <button
                      onClick={handleMigrateToMongo}
                      disabled={isMigrating}
                      className="flex-1 py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                    >
                      <Database className="w-3 h-3" />
                      {isMigrating ? 'Syncing...' : 'Sync Local to Mongo'}
                    </button>
                  )}
                </div>
              </div>

              {/* General App Constants */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider text-slate-400 mb-1">
                  System Defaults
                </span>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Default Currency</span>
                  <span className="font-bold text-slate-900">INR (₹)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Standard GST</span>
                  <span className="font-bold text-slate-900">{DEFAULT_GST_PERCENT}%</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Sheet Dimension Unit</span>
                  <span className="font-bold text-slate-900">inch</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Pipe Length Unit</span>
                  <span className="font-bold text-slate-900">ft</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end p-3.5 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
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
